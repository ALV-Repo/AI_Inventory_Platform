"""Authentication, JWT issuance and RBAC enforcement (SRS §9)."""
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.entities import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1}/auth/login")

# RBAC matrix (SRS §2.3). Permission format: "<module>:<action>".
ROLE_PERMISSIONS: dict[str, set[str]] = {
    "super_admin": {"*"},
    "owner": {"*"},
    "store_manager": {
        "inventory:read", "inventory:write", "purchase:read", "purchase:write",
        "sales:read", "sales:write", "report:read", "ai:read",
    },
    "cashier": {"sales:read", "sales:write", "inventory:read"},
    "warehouse_staff": {"inventory:read", "inventory:write"},
    "procurement": {"purchase:read", "purchase:write", "inventory:read", "ai:read"},
    "accountant": {"finance:read", "finance:write", "sales:read", "report:read"},
}


def hash_password(raw: str) -> str:
    return pwd_context.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    return pwd_context.verify(raw, hashed)


def create_token(*, user_id: int, tenant_id: int, role: str, refresh: bool = False) -> str:
    """Tenant id is embedded as a claim — it is the source of truth for scoping (SRS §7.3)."""
    delta = (
        timedelta(days=settings.REFRESH_TOKEN_DAYS)
        if refresh
        else timedelta(minutes=settings.ACCESS_TOKEN_MINUTES)
    )
    payload = {
        "sub": str(user_id),
        "tid": tenant_id,
        "role": role,
        "type": "refresh" if refresh else "access",
        "exp": datetime.now(timezone.utc) + delta,
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sign in again to continue.")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> User:
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sign in again to continue.")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "This account is no longer active.")

    # Defence in depth: the token claim must still match the stored record.
    if user.tenant_id != payload["tid"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Access denied.")
    return user


def has_permission(role: str, permission: str) -> bool:
    granted = ROLE_PERMISSIONS.get(role, set())
    return "*" in granted or permission in granted


def require(permission: str):
    """Route guard: `Depends(require("inventory:write"))` (NFR-07)."""

    def _guard(user: User = Depends(get_current_user)) -> User:
        if not has_permission(user.role, permission):
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                f"Your role does not allow this action ({permission}).",
            )
        return user

    return _guard
