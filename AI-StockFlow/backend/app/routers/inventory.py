"""Inventory endpoints (SRS §3.1)."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    AuditLog, Product, StockItem, StockMovement, User, Warehouse,
)
from app.services.logic import weighted_average_cost

router = APIRouter(prefix="/inventory", tags=["Inventory"])
class ProductIn(BaseModel):
    sku: str = Field(min_length=1, max_length=64)
    name: str = Field(min_length=1, max_length=220)
    category: str | None = None
    brand: str | None = None
    uom: str = "pcs"
    hsn_code: str | None = None
    gst_rate: float = Field(default=18.0, ge=0, le=100)
    cost_price: float = Field(default=0, ge=0)
    selling_price: float = Field(default=0, ge=0)
    reorder_level: int = Field(default=10, ge=0)
    safety_stock: int = Field(default=5, ge=0)
    barcode: str | None = None
    attributes: dict = Field(default_factory=dict)
    track_batch: bool = False
    track_serial: bool = False
    parent_id: int | None = None
class ProductOut(BaseModel):
    id: int
    sku: str
    name: str
    category: str | None
    brand: str | None
    uom: str
    hsn_code: str | None
    gst_rate: float
    cost_price: float
    selling_price: float
    reorder_level: int
    safety_stock: int
    barcode: str | None
    attributes: dict
    track_batch: bool
    track_serial: bool
    on_hand: float = 0
    reserved: float = 0
    available: float = 0

    model_config = ConfigDict(from_attributes=True)

class AdjustmentIn(BaseModel):
    """FR-INV-08 — a reason code is mandatory."""
    product_id: int
    warehouse_id: int
    quantity: float = Field(description="Signed: positive adds stock, negative removes it.")
    reason_code: str = Field(min_length=2, max_length=64)
    note: str | None = None


class TransferIn(BaseModel):
    """FR-INV-06."""
    product_id: int
    from_warehouse_id: int
    to_warehouse_id: int
    quantity: float = Field(gt=0)


# ------------------------------------------------------------------ helpers
def _stock_row(db: Session, tenant_id: int, product_id: int, warehouse_id: int) -> StockItem:
    row = (
        scoped(db, StockItem, tenant_id)
        .filter(StockItem.product_id == product_id, StockItem.warehouse_id == warehouse_id)
        .first()
    )
    if not row:
        row = StockItem(
            tenant_id=tenant_id, product_id=product_id,
            warehouse_id=warehouse_id, quantity=0, reserved_qty=0,
        )
        db.add(row)
        db.flush()
    return row


# ------------------------------------------------------------------ products
@router.get("/products", response_model=list[ProductOut])
def list_products(
    search: str | None = None,
    category: str | None = None,
    low_stock_only: bool = False,
    limit: int = Query(50, le=200),
    offset: int = 0,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    q = scoped(db, Product, user.tenant_id).filter(Product.is_active.is_(True))
    if search:
        term = f"%{search}%"
        q = q.filter(Product.name.ilike(term) | Product.sku.ilike(term) | Product.barcode.ilike(term))
    if category:
        q = q.filter(Product.category == category)

    products = q.order_by(Product.name).offset(offset).limit(limit).all()

    totals = dict(
        scoped(db, StockItem, user.tenant_id)
        .with_entities(StockItem.product_id, func.sum(StockItem.quantity))
        .group_by(StockItem.product_id)
        .all()
    )
    reserved = dict(
        scoped(db, StockItem, user.tenant_id)
        .with_entities(StockItem.product_id, func.sum(StockItem.reserved_qty))
        .group_by(StockItem.product_id)
        .all()
    )

    out = []
    for p in products:
        on_hand = float(totals.get(p.id) or 0)
        res = float(reserved.get(p.id) or 0)
        if low_stock_only and on_hand > p.reorder_level:
            continue
        item = ProductOut.model_validate(p)
        item.on_hand, item.reserved, item.available = on_hand, res, on_hand - res
        out.append(item)
    return out

@router.post("/products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    body: ProductIn,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    exists = scoped(db, Product, user.tenant_id).filter(Product.sku == body.sku).first()
    if exists:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"SKU {body.sku} is already in use."
        )

    if body.parent_id is not None:
        parent = (
            scoped(db, Product, user.tenant_id)
            .filter(
                Product.id == body.parent_id,
                Product.is_active.is_(True),
            )
            .first()
        )
        if not parent:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                "Parent product does not exist.",
            )

    product = Product(
        tenant_id=user.tenant_id,
        **body.model_dump()
    )

    db.add(product)
    db.flush()

    db.add(AuditLog(
        tenant_id=user.tenant_id,
        user_id=user.id,
        action="inventory.product.create",
        entity_type="product",
        entity_id=product.id,
        details={"sku": product.sku},
    ))

    db.commit()
    db.refresh(product)
    return ProductOut.model_validate(product)
# ------------------------------------------------------------------ stock
@router.get("/stock")
def stock_positions(
    warehouse_id: int | None = None,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    q = scoped(db, StockItem, user.tenant_id)
    if warehouse_id:
        q = q.filter(StockItem.warehouse_id == warehouse_id)
    return [
        {
            "product_id": s.product_id,
            "sku": s.product.sku if s.product else None,
            "name": s.product.name if s.product else None,
            "warehouse_id": s.warehouse_id,
            "batch_no": s.batch_no,
            "quantity": s.quantity,
            "reserved": s.reserved_qty,
            "available": s.available,
            "avg_cost": s.avg_cost,
            "stock_value": round((s.quantity or 0) * (s.avg_cost or 0), 2),
        }
        for s in q.all()
    ]


@router.post("/adjustments", status_code=status.HTTP_201_CREATED)
def create_adjustment(
    body: AdjustmentIn,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """Adjust stock with a mandatory reason and a full audit trail (FR-INV-08)."""
    product = scoped(db, Product, user.tenant_id).filter(Product.id == body.product_id).first()
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That product does not exist.")

    row = _stock_row(db, user.tenant_id, body.product_id, body.warehouse_id)
    new_qty = (row.quantity or 0) + body.quantity
    if new_qty < 0:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Only {row.quantity} in stock; cannot remove {abs(body.quantity)}.",
        )
    row.quantity = new_qty

    movement = StockMovement(
        tenant_id=user.tenant_id, product_id=body.product_id, warehouse_id=body.warehouse_id,
        movement_type="adjustment", quantity=body.quantity, unit_cost=row.avg_cost or 0,
        reason_code=body.reason_code, user_id=user.id,
    )
    db.add(movement)
    db.add(AuditLog(
        tenant_id=user.tenant_id, user_id=user.id, action="inventory.adjustment",
        entity_type="product", entity_id=body.product_id,
        details={"quantity": body.quantity, "reason": body.reason_code, "note": body.note},
    ))
    db.commit()
    return {"product_id": body.product_id, "new_quantity": new_qty, "movement_id": movement.id}


@router.post("/transfers", status_code=status.HTTP_201_CREATED)
def create_transfer(
    body: TransferIn,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """Move stock between warehouses (FR-INV-06)."""
    if body.from_warehouse_id == body.to_warehouse_id:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Pick two different warehouses.")

    source = _stock_row(db, user.tenant_id, body.product_id, body.from_warehouse_id)
    if source.available < body.quantity:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Only {source.available} available at the source warehouse.",
        )

    destination = _stock_row(db, user.tenant_id, body.product_id, body.to_warehouse_id)
    destination.avg_cost = weighted_average_cost(
        current_qty=destination.quantity or 0,
        current_cost=destination.avg_cost or 0,
        incoming_qty=body.quantity,
        incoming_cost=source.avg_cost or 0,
    )
    source.quantity -= body.quantity
    destination.quantity = (destination.quantity or 0) + body.quantity

    for wh, qty in ((body.from_warehouse_id, -body.quantity), (body.to_warehouse_id, body.quantity)):
        db.add(StockMovement(
            tenant_id=user.tenant_id, product_id=body.product_id, warehouse_id=wh,
            movement_type="transfer", quantity=qty, reason_code="warehouse_transfer",
            user_id=user.id,
        ))
    db.commit()
    return {"status": "completed", "quantity": body.quantity}


@router.get("/movements")
def stock_ledger(
    product_id: int | None = None,
    limit: int = Query(100, le=500),
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    """Immutable stock ledger (FR-INV-12)."""
    q = scoped(db, StockMovement, user.tenant_id)
    if product_id:
        q = q.filter(StockMovement.product_id == product_id)
    rows = q.order_by(StockMovement.created_at.desc()).limit(limit).all()
    return [
        {
            "id": m.id, "product_id": m.product_id, "warehouse_id": m.warehouse_id,
            "type": m.movement_type, "quantity": m.quantity, "reason": m.reason_code,
            "reference": f"{m.reference_type}:{m.reference_id}" if m.reference_type else None,
            "at": m.created_at,
        }
        for m in rows
    ]


@router.get("/warehouses")
def list_warehouses(
    user: User = Depends(require("inventory:read")), db: Session = Depends(get_db)
):
    return [
        {"id": w.id, "code": w.code, "name": w.name}
        for w in scoped(db, Warehouse, user.tenant_id).filter(Warehouse.is_active.is_(True)).all()
    ]
