"""Purchase Returns — return goods to supplier."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    AuditLog, PurchaseOrder, StockItem, StockMovement, User,
)

router = APIRouter(prefix="/purchases/returns", tags=["Purchase Returns"])


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class PurchaseReturnLineIn(BaseModel):
    product_id: int
    quantity: float = Field(gt=0)
    unit_price: float = Field(ge=0, default=0.0)
    reason: str = ""


class PurchaseReturnIn(BaseModel):
    purchase_order_id: int
    supplier_id: int
    warehouse_id: int = 1
    reason: str = ""
    lines: list[PurchaseReturnLineIn] = []


# In-memory storage for demo (no separate model — uses StockMovement as source of truth)
_returns_store: dict[int, dict] = {}
_return_counter = {"n": 0}


def _next_return_number() -> str:
    _return_counter["n"] += 1
    return f"PR-{datetime.now(timezone.utc).strftime('%Y%m')}-{_return_counter['n']:05d}"


@router.get("")
def list_purchase_returns(
    limit: int = 50,
    user: User = Depends(require("purchase:read")),
    db: Session = Depends(get_db),
):
    """List purchase returns for this tenant."""
    # Return from in-memory store filtered by tenant
    tenant_returns = [
        r for r in _returns_store.values()
        if r.get("tenant_id") == user.tenant_id
    ]
    return sorted(tenant_returns, key=lambda x: x["created_at"], reverse=True)[:limit]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_purchase_return(
    body: PurchaseReturnIn,
    user: User = Depends(require("purchase:write")),
    db: Session = Depends(get_db),
):
    """Create a purchase return — deducts stock and logs movement."""
    # Validate PO exists
    po = db.query(PurchaseOrder).filter(
        PurchaseOrder.id == body.purchase_order_id,
        PurchaseOrder.tenant_id == user.tenant_id,
    ).first()
    if not po:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Purchase order not found.")

    return_number = _next_return_number()
    total_amount = sum(l.quantity * l.unit_price for l in body.lines)

    # Deduct stock for each returned item
    for line in body.lines:
        stock = db.query(StockItem).filter(
            StockItem.product_id == line.product_id,
            StockItem.warehouse_id == body.warehouse_id,
            StockItem.tenant_id == user.tenant_id,
        ).first()
        if not stock:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                f"Stock not found for product {line.product_id} in warehouse {body.warehouse_id}.",
            )
        if stock.quantity < line.quantity:
            raise HTTPException(
                status.HTTP_422_UNPROCESSABLE_ENTITY,
                f"Insufficient stock for product {line.product_id}. Available: {stock.quantity}, requested: {line.quantity}.",
            )
        stock.quantity -= line.quantity

        # Log stock movement
        db.add(StockMovement(
            tenant_id=user.tenant_id,
            product_id=line.product_id,
            warehouse_id=body.warehouse_id,
            movement_type="purchase_return",
            quantity=-line.quantity,
            unit_cost=line.unit_price,
            reason_code="purchase_return",
            reference_type="PurchaseReturn",
            user_id=user.id,
        ))

    # Audit log
    db.add(AuditLog(
        tenant_id=user.tenant_id,
        user_id=user.id,
        action="purchase_return.created",
        entity_type="PurchaseReturn",
        entity_id=None,
        details={
            "return_number": return_number,
            "purchase_order_id": body.purchase_order_id,
            "total_amount": total_amount,
            "lines": len(body.lines),
        },
    ))
    db.commit()

    # Store in memory
    return_id = len(_returns_store) + 1
    _returns_store[return_id] = {
        "id": return_id,
        "tenant_id": user.tenant_id,
        "return_number": return_number,
        "purchase_order_id": body.purchase_order_id,
        "supplier_id": body.supplier_id,
        "warehouse_id": body.warehouse_id,
        "reason": body.reason,
        "total_amount": total_amount,
        "status": "approved",
        "lines": [
            {
                "product_id": l.product_id,
                "quantity": l.quantity,
                "unit_price": l.unit_price,
                "reason": l.reason,
            }
            for l in body.lines
        ],
        "created_at": utcnow().isoformat(),
    }

    return {
        "id": return_id,
        "return_number": return_number,
        "total_amount": total_amount,
        "status": "approved",
    }
