"""Audit log endpoints (NFR-08)."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import AuditLog, User

router = APIRouter(prefix="/audit-logs", tags=["Audit"])


@router.get("")
def list_audit_logs(
    limit: int = Query(default=200, le=500),
    entity_type: str | None = None,
    user_id: int | None = None,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    """List audit logs for this tenant. NFR-08."""
    query = (
        scoped(db, AuditLog, user.tenant_id)
        .order_by(AuditLog.created_at.desc())
    )
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    if user_id:
        query = query.filter(AuditLog.user_id == user_id)

    logs = query.limit(limit).all()

    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details": log.details,
            "ip_address": log.ip_address,
            "created_at": log.created_at,
        }
        for log in logs
    ]
