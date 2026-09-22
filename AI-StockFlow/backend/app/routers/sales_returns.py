"""Sales Returns & Credit/Debit Notes — FR-SAL-06."""
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    AuditLog, SalesOrder, SalesReturn, SalesReturnLine,
    StockItem, User,
)

router = APIRouter(prefix="/sales/returns", tags=["Sales Returns"])


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _next_return_number(db: Session, tenant_id: int) -> str:
    seq = db.query(SalesReturn).filter(
        SalesReturn.tenant_id == tenant_id
    ).count() + 1
    return f"SR-{datetime.now(timezone.utc).strftime('%Y%m')}-{seq:05d}"


class ReturnLineIn(BaseModel):
    product_id: int
    quantity: float = Field(gt=0)
    unit_price: float = Field(ge=0, default=0.0)
    gst_rate: float = Field(ge=0, le=100, default=18.0)
    reason: str = ""


class SalesReturnIn(BaseModel):
    sales_order_id: int
    reason: str = ""
    lines: list[ReturnLineIn] = []


@router.get("")
def list_returns(
    limit: int = 50,
    user: User = Depends(require("sales:read")),
    db: Session = Depends(get_db),
):
    """List all sales returns for this tenant."""
    returns = (
        scoped(db, SalesReturn, user.tenant_id)
        .order_by(SalesReturn.created_at.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": r.id,
            "return_number": r.return_number,
            "sales_order_id": r.sales_order_id,
            "customer_id": r.customer_id,
            "return_date": r.return_date,
            "reason": r.reason,
            "refund_amount": r.refund_amount,
            "tax_amount": r.tax_amount,
            "total_amount": r.total_amount,
            "status": r.status,
            "created_at": r.created_at,
        }
        for r in returns
    ]


@router.post("", status_code=status.HTTP_201_CREATED)
def create_return(
    body: SalesReturnIn,
    user: User = Depends(require("sales:write")),
    db: Session = Depends(get_db),
):
    """Create a sales return / credit note — FR-SAL-06."""
    # Validate original order exists
    order = db.query(SalesOrder).filter(
        SalesOrder.id == body.sales_order_id,
        SalesOrder.tenant_id == user.tenant_id,
    ).first()
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sales order not found.")

    # Calculate totals
    subtotal = sum(
        line.quantity * line.unit_price for line in body.lines
    )
    tax_amount = sum(
        line.quantity * line.unit_price * (line.gst_rate / 100)
        for line in body.lines
    )
    total_amount = subtotal + tax_amount

    sales_return = SalesReturn(
        tenant_id=user.tenant_id,
        return_number=_next_return_number(db, user.tenant_id),
        sales_order_id=body.sales_order_id,
        customer_id=order.customer_id,
        warehouse_id=order.warehouse_id,
        reason=body.reason,
        refund_amount=subtotal,
        tax_amount=round(tax_amount, 2),
        total_amount=round(total_amount, 2),
        status="pending",
    )
    db.add(sales_return)
    db.flush()

    # Add lines and restore stock
    for line_data in body.lines:
        line = SalesReturnLine(
            tenant_id=user.tenant_id,
            return_id=sales_return.id,
            product_id=line_data.product_id,
            quantity=line_data.quantity,
            unit_price=line_data.unit_price,
            gst_rate=line_data.gst_rate,
            line_total=round(
                line_data.quantity * line_data.unit_price * (1 + line_data.gst_rate / 100), 2
            ),
        )
        db.add(line)

        # Restore stock if warehouse is set
        if order.warehouse_id:
            stock = db.query(StockItem).filter(
                StockItem.product_id == line_data.product_id,
                StockItem.warehouse_id == order.warehouse_id,
                StockItem.tenant_id == user.tenant_id,
            ).first()
            if stock:
                stock.quantity += line_data.quantity

    # Audit log
    db.add(AuditLog(
        tenant_id=user.tenant_id,
        user_id=user.id,
        action="sales_return.created",
        entity_type="SalesReturn",
        entity_id=sales_return.id,
        details={
            "return_number": sales_return.return_number,
            "total_amount": sales_return.total_amount,
            "lines": len(body.lines),
        },
    ))
    db.commit()
    db.refresh(sales_return)

    return {
        "id": sales_return.id,
        "return_number": sales_return.return_number,
        "total_amount": sales_return.total_amount,
        "status": sales_return.status,
    }


@router.post("/{return_id}/approve")
def approve_return(
    return_id: int,
    user: User = Depends(require("sales:write")),
    db: Session = Depends(get_db),
):
    """Approve a sales return."""
    sales_return = db.query(SalesReturn).filter(
        SalesReturn.id == return_id,
        SalesReturn.tenant_id == user.tenant_id,
    ).first()
    if not sales_return:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sales return not found.")
    if sales_return.status != "pending":
        raise HTTPException(status.HTTP_409_CONFLICT, f"Return is already {sales_return.status}.")

    sales_return.status = "approved"
    db.add(AuditLog(
        tenant_id=user.tenant_id,
        user_id=user.id,
        action="sales_return.approved",
        entity_type="SalesReturn",
        entity_id=return_id,
        details={"return_number": sales_return.return_number},
    ))
    db.commit()
    return {"status": "approved", "return_number": sales_return.return_number}
