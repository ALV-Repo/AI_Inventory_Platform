"""Sales and POS endpoints (SRS §3.3)."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    AuditLog, Customer, Product, SalesOrder, SalesOrderLine, StockItem, StockMovement, StockSerial, User,
)
from app.services.logic import compute_gst

router = APIRouter(prefix="/sales", tags=["Sales & POS"])


class SaleLineIn(BaseModel):
    product_id: int
    quantity: float = Field(gt=0)
    unit_price: float | None = None   # defaults to the product's selling price
    discount: float = Field(default=0, ge=0)
    serial_numbers: list[str] = Field(default_factory=list)
    batch_no: str | None = None

class SaleIn(BaseModel):
    warehouse_id: int
    customer_id: int | None = None
    lines: list[SaleLineIn] = Field(min_length=1)
    payment_mode: str = "cash"
    channel: str = "pos"
    interstate: bool = False
    idempotency_key: str | None = Field(
        default=None,
        description="Send a stable key from the POS so replayed offline bills post once (NFR-05).",
    )


def _next_number(db: Session, tenant_id: int, attempt: int = 0) -> str:
    """Next invoice number for this tenant.

    Derived from the highest existing id rather than a row count, so deletions
    can never cause a reuse. A concurrent insert can still race to the same
    number — the unique index on (tenant_id, order_number) catches that, and
    create_sale retries with a bumped sequence (NFR-05: atomic, no lost bills).
    """
    last_id = (
        scoped(db, SalesOrder, tenant_id)
        .with_entities(func.max(SalesOrder.id))
        .scalar()
    ) or 0
    seq = last_id + 1 + attempt
    return f"INV-{datetime.now(timezone.utc).strftime('%Y%m')}-{seq:05d}"


@router.post("", status_code=status.HTTP_201_CREATED)
def create_sale(
    body: SaleIn,
    user: User = Depends(require("sales:write")),
    db: Session = Depends(get_db),
):
    """Record a POS sale or sales order: prices it, taxes it, and posts stock atomically."""
    for attempt in range(3):
        try:
            return _create_sale_once(body, user, db, attempt)
        except IntegrityError as exc:
            db.rollback()
            constraint = str(exc.orig).lower()
            if "idem" in constraint and body.idempotency_key:
                # A concurrent replay of the same offline bill won the race —
                # return the bill it created rather than erroring (NFR-05).
                existing = (
                    scoped(db, SalesOrder, user.tenant_id)
                    .filter(SalesOrder.idempotency_key == body.idempotency_key)
                    .first()
                )
                if existing:
                    return {
                        "id": existing.id, "order_number": existing.order_number,
                        "total": existing.total, "duplicate": True,
                    }
            # Otherwise it was an order-number collision; retry with a bumped sequence.
    raise HTTPException(
        status.HTTP_503_SERVICE_UNAVAILABLE,
        "The store is very busy right now. The bill was not saved — try again.",
    )


def _create_sale_once(body: SaleIn, user: User, db: Session, attempt: int):
    # NFR-05: a replayed offline bill must not create a second invoice.
    if body.idempotency_key:
        existing = (
            scoped(db, SalesOrder, user.tenant_id)
            .filter(SalesOrder.idempotency_key == body.idempotency_key)
            .first()
        )
        if existing:
            return {
                "id": existing.id, "order_number": existing.order_number,
                "total": existing.total, "duplicate": True,
            }

    order = SalesOrder(
        tenant_id=user.tenant_id,
        order_number=_next_number(db, user.tenant_id, attempt),
        customer_id=body.customer_id,
        warehouse_id=body.warehouse_id,
        channel=body.channel,
        payment_mode=body.payment_mode,
        idempotency_key=body.idempotency_key,
    )
    db.add(order)
    db.flush()

    subtotal = tax_total = discount_total = cogs = 0.0

    for line in body.lines:
        product = scoped(db, Product, user.tenant_id).filter(Product.id == line.product_id).first()
        if not product:
            raise HTTPException(status.HTTP_404_NOT_FOUND, f"Product {line.product_id} not found.")

        stock = (
            scoped(db, StockItem, user.tenant_id)
            .filter(
                StockItem.product_id == line.product_id,
                StockItem.warehouse_id == body.warehouse_id,
            )
            .first()
        )
        available = stock.available if stock else 0
        if available < line.quantity:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"{product.name}: {available} available, {line.quantity} requested.",
            )

        if product.track_serial:
            if len(line.serial_numbers) != int(line.quantity):
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    f"{product.name}: provide exactly {int(line.quantity)} serial number(s).",
                )

            serials = (
                scoped(db, StockSerial, user.tenant_id)
                .filter(
                    StockSerial.product_id == product.id,
                    StockSerial.warehouse_id == body.warehouse_id,
                    StockSerial.serial_number.in_(line.serial_numbers),
                    StockSerial.status == "available",
                )
                .all()
            )

            if len(serials) != len(line.serial_numbers):
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    f"{product.name}: one or more serial numbers are unavailable.",
                )

            for serial in serials:
                serial.status = "sold"

        price = line.unit_price if line.unit_price is not None else product.selling_price
        tax = compute_gst(
            unit_price=price, quantity=line.quantity, gst_rate=product.gst_rate,
            discount=line.discount, interstate=body.interstate,
        )

        db.add(SalesOrderLine(
            tenant_id=user.tenant_id, order_id=order.id, product_id=product.id,
            quantity=line.quantity, unit_price=price, discount=line.discount,
            gst_rate=product.gst_rate, tax_amount=tax.total_tax,
            line_total=tax.grand_total, unit_cost=stock.avg_cost or product.cost_price,
        ))

        stock.quantity -= line.quantity
        db.add(StockMovement(
            tenant_id=user.tenant_id, product_id=product.id, warehouse_id=body.warehouse_id,
            movement_type="sale", quantity=-line.quantity,
            unit_cost=stock.avg_cost or product.cost_price, reason_code="sale",
            reference_type="sales_order", reference_id=order.id, user_id=user.id,
        ))

        subtotal += tax.taxable_value
        tax_total += tax.total_tax
        discount_total += line.discount
        cogs += (stock.avg_cost or product.cost_price) * line.quantity

    order.subtotal = round(subtotal, 2)
    order.tax_amount = round(tax_total, 2)
    order.discount = round(discount_total, 2)
    order.total = round(subtotal + tax_total, 2)
    order.cogs = round(cogs, 2)

    db.add(AuditLog(
        tenant_id=user.tenant_id, user_id=user.id, action="sales.create",
        entity_type="sales_order", entity_id=order.id,
        details={"total": order.total, "lines": len(body.lines)},
    ))
    db.commit()

    return {
        "id": order.id,
        "order_number": order.order_number,
        "subtotal": order.subtotal,
        "tax_amount": order.tax_amount,
        "total": order.total,
        "gross_profit": round(order.subtotal - order.cogs, 2),
        "duplicate": False,
    }


@router.get("")
def list_sales(
    limit: int = 50,
    user: User = Depends(require("sales:read")),
    db: Session = Depends(get_db),
):
    rows = (
        scoped(db, SalesOrder, user.tenant_id)
        .order_by(SalesOrder.order_date.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "id": o.id, "order_number": o.order_number, "date": o.order_date,
            "channel": o.channel, "payment_mode": o.payment_mode,
            "subtotal": o.subtotal, "tax_amount": o.tax_amount, "total": o.total,
            "gross_profit": round((o.subtotal or 0) - (o.cogs or 0), 2),
        }
        for o in rows
    ]


@router.get("/customers")
def list_customers(
    user: User = Depends(require("sales:read")), db: Session = Depends(get_db)
):
    return [
        {
            "id": c.id, "name": c.name, "phone": c.phone, "gstin": c.gstin,
            "credit_limit": c.credit_limit, "outstanding": c.outstanding,
        }
        for c in scoped(db, Customer, user.tenant_id).order_by(Customer.name).all()
    ]
