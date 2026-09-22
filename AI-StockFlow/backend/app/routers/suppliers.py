"""Supplier management endpoints (FR-PUR-03, FR-PUR-06, FR-PUR-07)."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    AuditLog, PurchaseOrder, PurchaseOrderLine,
    Supplier, User, utcnow,
)

router = APIRouter(prefix="/suppliers", tags=["Suppliers"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class SupplierIn(BaseModel):
    name: str = Field(min_length=1, max_length=180)
    gstin: str | None = None
    phone: str | None = None
    email: str | None = None
    payment_terms_days: int = Field(default=30, ge=0)
    lead_time_days: int = Field(default=7, ge=0)


class SupplierUpdate(BaseModel):
    name: str | None = Field(default=None, max_length=180)
    gstin: str | None = None
    phone: str | None = None
    email: str | None = None
    payment_terms_days: int | None = None
    lead_time_days: int | None = None
    is_active: bool | None = None


def _supplier_dict(s: Supplier) -> dict:
    return {
        "id": s.id,
        "name": s.name,
        "gstin": s.gstin,
        "phone": s.phone,
        "email": s.email,
        "payment_terms_days": s.payment_terms_days,
        "lead_time_days": s.lead_time_days,
        "on_time_rate": round(s.on_time_rate or 1.0, 3),
        "is_active": s.is_active,
    }


# ── FR-PUR-03: Supplier CRUD ──────────────────────────────────────────────────

@router.get("")
def list_suppliers(
    user: User = Depends(require("purchase:read")),
    db: Session = Depends(get_db),
):
    """List all active suppliers for this tenant."""
    suppliers = (
        scoped(db, Supplier, user.tenant_id)
        .filter(Supplier.is_active.is_(True))
        .order_by(Supplier.name)
        .all()
    )
    return [_supplier_dict(s) for s in suppliers]


@router.get("/{supplier_id}")
def get_supplier(
    supplier_id: int,
    user: User = Depends(require("purchase:read")),
    db: Session = Depends(get_db),
):
    """Get a single supplier by ID."""
    supplier = (
        scoped(db, Supplier, user.tenant_id)
        .filter(Supplier.id == supplier_id)
        .first()
    )
    if not supplier:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Supplier not found.")
    return _supplier_dict(supplier)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_supplier(
    body: SupplierIn,
    user: User = Depends(require("purchase:write")),
    db: Session = Depends(get_db),
):
    """Create a new supplier."""
    supplier = Supplier(
        tenant_id=user.tenant_id,
        name=body.name,
        gstin=body.gstin,
        phone=body.phone,
        email=body.email,
        payment_terms_days=body.payment_terms_days,
        lead_time_days=body.lead_time_days,
        on_time_rate=1.0,
        is_active=True,
    )
    db.add(supplier)
    db.add(AuditLog(
        tenant_id=user.tenant_id, user_id=user.id,
        action="supplier.created", entity_type="supplier",
        details={"name": supplier.name},
    ))
    db.commit()
    db.refresh(supplier)
    return _supplier_dict(supplier)


@router.patch("/{supplier_id}")
def update_supplier(
    supplier_id: int,
    body: SupplierUpdate,
    user: User = Depends(require("purchase:write")),
    db: Session = Depends(get_db),
):
    """Update supplier details."""
    supplier = (
        scoped(db, Supplier, user.tenant_id)
        .filter(Supplier.id == supplier_id)
        .first()
    )
    if not supplier:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Supplier not found.")

    for field, value in body.model_dump(exclude_none=True).items():
        setattr(supplier, field, value)

    db.add(AuditLog(
        tenant_id=user.tenant_id, user_id=user.id,
        action="supplier.updated", entity_type="supplier", entity_id=supplier.id,
        details=body.model_dump(exclude_none=True),
    ))
    db.commit()
    db.refresh(supplier)
    return _supplier_dict(supplier)


@router.delete("/{supplier_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate_supplier(
    supplier_id: int,
    user: User = Depends(require("purchase:write")),
    db: Session = Depends(get_db),
):
    """Soft-delete (deactivate) a supplier."""
    supplier = (
        scoped(db, Supplier, user.tenant_id)
        .filter(Supplier.id == supplier_id)
        .first()
    )
    if not supplier:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Supplier not found.")
    supplier.is_active = False
    db.commit()


# ── FR-PUR-06: Vendor Scorecard ───────────────────────────────────────────────

@router.get("/{supplier_id}/scorecard")
def vendor_scorecard(
    supplier_id: int,
    user: User = Depends(require("purchase:read")),
    db: Session = Depends(get_db),
):
    """
    Vendor scorecard: on-time rate, fill rate, quality rejection
    computed from GRN history (PurchaseOrderLine received_qty vs quantity).
    FR-PUR-06
    """
    supplier = (
        scoped(db, Supplier, user.tenant_id)
        .filter(Supplier.id == supplier_id)
        .first()
    )
    if not supplier:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Supplier not found.")

    # All POs for this supplier
    orders = (
        scoped(db, PurchaseOrder, user.tenant_id)
        .filter(PurchaseOrder.supplier_id == supplier_id)
        .all()
    )

    total_orders = len(orders)
    received_orders = [o for o in orders if o.status in {"received", "partial"}]

    # Fill rate: total received qty / total ordered qty across all lines
    total_ordered = 0.0
    total_received = 0.0
    for order in received_orders:
        for line in order.lines:
            total_ordered += line.quantity or 0
            total_received += line.received_qty or 0

    fill_rate = round(total_received / total_ordered, 3) if total_ordered else 1.0

    # On-time rate stored on supplier (updated on GRN in purchases router)
    on_time_rate = round(supplier.on_time_rate or 1.0, 3)

    # Quality rejection rate (placeholder — will use GRN rejection qty when added)
    quality_rejection_rate = 0.0

    # Scorecard score 0-100
    score = round(
        (on_time_rate * 0.4 + fill_rate * 0.4 + (1 - quality_rejection_rate) * 0.2) * 100,
        1,
    )

    return {
        "supplier_id": supplier.id,
        "supplier_name": supplier.name,
        "total_orders": total_orders,
        "received_orders": len(received_orders),
        "on_time_rate": on_time_rate,
        "fill_rate": fill_rate,
        "quality_rejection_rate": quality_rejection_rate,
        "scorecard_score": score,
        "grade": "A" if score >= 85 else "B" if score >= 70 else "C" if score >= 55 else "D",
    }


# ── FR-PUR-07: Supplier Ledger ────────────────────────────────────────────────

@router.get("/{supplier_id}/ledger")
def supplier_ledger(
    supplier_id: int,
    user: User = Depends(require("purchase:read")),
    db: Session = Depends(get_db),
):
    """
    Supplier ledger: all purchase orders, their totals, and outstanding balance.
    FR-PUR-07
    """
    supplier = (
        scoped(db, Supplier, user.tenant_id)
        .filter(Supplier.id == supplier_id)
        .first()
    )
    if not supplier:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Supplier not found.")

    orders = (
        scoped(db, PurchaseOrder, user.tenant_id)
        .filter(PurchaseOrder.supplier_id == supplier_id)
        .order_by(PurchaseOrder.order_date.desc())
        .all()
    )

    total_purchases = sum(o.total or 0 for o in orders)
    # Outstanding = total value of approved/partial POs not yet fully paid
    outstanding = sum(
        o.total or 0
        for o in orders
        if o.status in {"approved", "partial"}
    )

    return {
        "supplier_id": supplier.id,
        "supplier_name": supplier.name,
        "total_purchases": round(total_purchases, 2),
        "outstanding_balance": round(outstanding, 2),
        "payment_terms_days": supplier.payment_terms_days,
        "orders": [
            {
                "id": o.id,
                "po_number": o.po_number,
                "order_date": o.order_date,
                "status": o.status,
                "total": o.total,
            }
            for o in orders
        ],
    }
