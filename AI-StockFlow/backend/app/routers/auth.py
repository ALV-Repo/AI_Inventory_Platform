"""Authentication endpoints (SRS §9)."""
import time

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    ROLE_PERMISSIONS, create_token, decode_token, get_current_user, verify_password,
)
from app.models.entities import AuditLog, Tenant, User

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Per-process failed-login throttle (SRS §9). 5 failures locks the account/IP
# pair for 15 minutes. Complements — not replaces — the gateway rate limits;
# in a multi-replica deployment move this state to Redis.
_failures: dict[str, tuple[int, float]] = {}
_MAX_FAILURES = 5
_LOCKOUT_SECONDS = 15 * 60


def _throttle_key(email: str, request: Request) -> str:
    ip = request.client.host if request.client else "unknown"
    return f"{email.lower()}|{ip}"


def _check_lockout(key: str) -> None:
    count, until = _failures.get(key, (0, 0.0))
    if count >= _MAX_FAILURES and time.monotonic() < until:
        raise HTTPException(
            status.HTTP_429_TOO_MANY_REQUESTS,
            "Too many failed sign-in attempts. Try again in 15 minutes.",
            headers={"Retry-After": str(_LOCKOUT_SECONDS)},
        )


def _record_failure(key: str) -> None:
    count, _ = _failures.get(key, (0, 0.0))
    _failures[key] = (count + 1, time.monotonic() + _LOCKOUT_SECONDS)


def _clear_failures(key: str) -> None:
    _failures.pop(key, None)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    role: str
    tenant_id: int
    full_name: str | None = None


class RefreshRequest(BaseModel):
    refresh_token: str
class MFAToggleRequest(BaseModel):
    enabled: bool


@router.post("/login", response_model=TokenResponse)
def login(
    request: Request,
    form: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Sign in with email and password. Username field carries the email."""
    key = _throttle_key(form.username, request)
    _check_lockout(key)

    user = db.query(User).filter(User.email == form.username.lower()).first()

    if not user or not verify_password(form.password, user.password_hash):
        _record_failure(key)
        # Same message either way — do not reveal whether the account exists.
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Email or password is incorrect.")
    if not user.is_active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This account has been deactivated.")

    _clear_failures(key)

    db.add(AuditLog(
        tenant_id=user.tenant_id, user_id=user.id, action="auth.login",
        entity_type="user", entity_id=user.id,
        ip_address=request.client.host if request.client else None,
    ))
    db.commit()

    return TokenResponse(
        access_token=create_token(user_id=user.id, tenant_id=user.tenant_id, role=user.role),
        refresh_token=create_token(
            user_id=user.id, tenant_id=user.tenant_id, role=user.role, refresh=True
        ),
        role=user.role,
        tenant_id=user.tenant_id,
        full_name=user.full_name,
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sign in again to continue.")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sign in again to continue.")

    return TokenResponse(
        access_token=create_token(user_id=user.id, tenant_id=user.tenant_id, role=user.role),
        refresh_token=create_token(
            user_id=user.id, tenant_id=user.tenant_id, role=user.role, refresh=True
        ),
        role=user.role,
        tenant_id=user.tenant_id,
        full_name=user.full_name,
    )
@router.patch("/mfa")
def toggle_mfa(
    body: MFAToggleRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user.mfa_enabled = body.enabled

    db.add(AuditLog(
        tenant_id=user.tenant_id,
        user_id=user.id,
        action="auth.mfa.toggle",
        entity_type="user",
        entity_id=user.id,
        details={"enabled": body.enabled},
    ))

    db.commit()

    return {"mfa_enabled": user.mfa_enabled}


@router.get("/me")
def me(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    tenant = db.query(Tenant).filter(Tenant.id == user.tenant_id).first()
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "permissions": sorted(ROLE_PERMISSIONS.get(user.role, set())),
        "tenant": {
            "id": tenant.id,
            "name": tenant.name,
            "plan": tenant.plan,
            "feature_flags": tenant.feature_flags or {},
        },
    }
