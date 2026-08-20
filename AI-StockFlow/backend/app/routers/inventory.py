"""Inventory endpoints (SRS §3.1)."""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    AuditLog,
    CycleCountEntry,
    CycleCountSession,
    Product,
    StockItem,
    StockMovement,
    StockTransfer,
    User,
    Warehouse,
    utcnow,
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


class CycleCountSessionIn(BaseModel):
    """FR-INV-07 — open a physical cycle-count session."""
    warehouse_id: int


class CycleCountEntryIn(BaseModel):
    """FR-INV-07 — submit a physical count."""
    product_id: int
    counted_quantity: float = Field(ge=0)


class ReservationIn(BaseModel):
    """FR-INV-09 — reserve available stock."""
    product_id: int
    warehouse_id: int
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
# ------------------------------------------------------------------ product variants

@router.get(
    "/products/{product_id}/variants",
    response_model=list[ProductOut],
)
def list_product_variants(
    product_id: int,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    """FR-INV-02 — list active variants belonging to a parent product."""

    parent = (
        scoped(db, Product, user.tenant_id)
        .filter(
            Product.id == product_id,
            Product.is_active.is_(True),
        )
        .first()
    )

    if not parent:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Parent product does not exist.",
        )

    variants = (
        scoped(db, Product, user.tenant_id)
        .filter(
            Product.parent_id == product_id,
            Product.is_active.is_(True),
        )
        .order_by(Product.sku)
        .all()
    )

    return [ProductOut.model_validate(variant) for variant in variants]


@router.post(
    "/products/{product_id}/variants",
    response_model=ProductOut,
    status_code=status.HTTP_201_CREATED,
)
def create_product_variant(
    product_id: int,
    body: ProductIn,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """FR-INV-02 — create a size/colour variant under a parent SKU."""

    parent = (
        scoped(db, Product, user.tenant_id)
        .filter(
            Product.id == product_id,
            Product.is_active.is_(True),
        )
        .first()
    )

    if not parent:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Parent product does not exist.",
        )

    if body.parent_id is not None and body.parent_id != product_id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Variant parent does not match the URL parent.",
        )

    exists = (
        scoped(db, Product, user.tenant_id)
        .filter(Product.sku == body.sku)
        .first()
    )

    if exists:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"SKU {body.sku} is already in use.",
        )

    data = body.model_dump()
    data["parent_id"] = product_id

    variant = Product(
        tenant_id=user.tenant_id,
        **data,
    )

    db.add(variant)
    db.flush()

    db.add(
        AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="inventory.product.variant.create",
            entity_type="product",
            entity_id=variant.id,
            details={
                "sku": variant.sku,
                "parent_id": product_id,
                "attributes": variant.attributes,
            },
        )
    )

    db.commit()
    db.refresh(variant)

    return ProductOut.model_validate(variant)
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
@router.post("/reservations", status_code=status.HTTP_201_CREATED)
def create_reservation(
    body: ReservationIn,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """Reserve available stock for an order (FR-INV-09)."""

    product = (
        scoped(db, Product, user.tenant_id)
        .filter(Product.id == body.product_id)
        .first()
    )

    if not product:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "That product does not exist.",
        )

    row = _stock_row(
        db,
        user.tenant_id,
        body.product_id,
        body.warehouse_id,
    )

    if row.available < body.quantity:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Only {row.available} units are available to reserve.",
        )

    row.reserved_qty = (row.reserved_qty or 0) + body.quantity

    db.add(
        AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="inventory.stock.reserve",
            entity_type="product",
            entity_id=body.product_id,
            details={
                "warehouse_id": body.warehouse_id,
                "quantity": body.quantity,
            },
        )
    )

    db.commit()

    return {
        "product_id": body.product_id,
        "warehouse_id": body.warehouse_id,
        "reserved": row.reserved_qty,
        "available": row.available,
    }

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
    """Create a warehouse transfer request (FR-INV-06)."""

    if body.from_warehouse_id == body.to_warehouse_id:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            "Pick two different warehouses.",
        )

    source = (
        scoped(db, StockItem, user.tenant_id)
        .filter(
            StockItem.product_id == body.product_id,
            StockItem.warehouse_id == body.from_warehouse_id,
        )
        .first()
    )

    if not source or source.available < body.quantity:
        available = source.available if source else 0
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Only {available} available at the source warehouse.",
        )

    transfer = StockTransfer(
        tenant_id=user.tenant_id,
        product_id=body.product_id,
        from_warehouse_id=body.from_warehouse_id,
        to_warehouse_id=body.to_warehouse_id,
        quantity=body.quantity,
        status="pending",
        created_by=user.id,
    )

    db.add(transfer)
    db.flush()

    db.add(
        AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="inventory.transfer.created",
            entity_type="stock_transfer",
            entity_id=transfer.id,
            details={
                "product_id": body.product_id,
                "from_warehouse_id": body.from_warehouse_id,
                "to_warehouse_id": body.to_warehouse_id,
                "quantity": body.quantity,
                "status": "pending",
            },
        )
    )

    db.commit()

    return {
        "id": transfer.id,
        "status": transfer.status,
        "quantity": transfer.quantity,
    }


@router.post("/transfers/{transfer_id}/approve")
def approve_transfer(
    transfer_id: int,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """Approve a pending warehouse transfer."""

    transfer = (
        scoped(db, StockTransfer, user.tenant_id)
        .filter(StockTransfer.id == transfer_id)
        .first()
    )

    if not transfer:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Transfer not found.",
        )

    if transfer.status != "pending":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Transfer cannot be approved from status '{transfer.status}'.",
        )

    transfer.status = "approved"
    transfer.approved_by = user.id
    transfer.approved_at = utcnow()

    db.add(
        AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="inventory.transfer.approved",
            entity_type="stock_transfer",
            entity_id=transfer.id,
            details={"status": "approved"},
        )
    )

    db.commit()

    return {
        "id": transfer.id,
        "status": transfer.status,
    }


@router.post("/transfers/{transfer_id}/dispatch")
def dispatch_transfer(
    transfer_id: int,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """Dispatch an approved transfer and deduct source stock."""

    transfer = (
        scoped(db, StockTransfer, user.tenant_id)
        .filter(StockTransfer.id == transfer_id)
        .first()
    )

    if not transfer:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Transfer not found.",
        )

    if transfer.status != "approved":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Transfer cannot be dispatched from status '{transfer.status}'.",
        )

    source = (
        scoped(db, StockItem, user.tenant_id)
        .filter(
            StockItem.product_id == transfer.product_id,
            StockItem.warehouse_id == transfer.from_warehouse_id,
        )
        .first()
    )

    available = source.available if source else 0

    if not source or available < transfer.quantity:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Only {available} available at the source warehouse.",
        )

    source.quantity -= transfer.quantity

    db.add(
        StockMovement(
            tenant_id=user.tenant_id,
            product_id=transfer.product_id,
            warehouse_id=transfer.from_warehouse_id,
            movement_type="transfer",
            quantity=-transfer.quantity,
            reason_code="warehouse_transfer_dispatch",
            user_id=user.id,
        )
    )

    transfer.status = "in_transit"
    transfer.dispatched_by = user.id
    transfer.dispatched_at = utcnow()

    db.add(
        AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="inventory.transfer.dispatched",
            entity_type="stock_transfer",
            entity_id=transfer.id,
            details={
                "status": "in_transit",
                "quantity": transfer.quantity,
            },
        )
    )

    db.commit()

    return {
        "id": transfer.id,
        "status": transfer.status,
        "quantity": transfer.quantity,
    }


@router.post("/transfers/{transfer_id}/receive")
def receive_transfer(
    transfer_id: int,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """Receive an in-transit transfer and add destination stock."""

    transfer = (
        scoped(db, StockTransfer, user.tenant_id)
        .filter(StockTransfer.id == transfer_id)
        .first()
    )

    if not transfer:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Transfer not found.",
        )

    if transfer.status != "in_transit":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Transfer cannot be received from status '{transfer.status}'.",
        )

    destination = _stock_row(
        db,
        user.tenant_id,
        transfer.product_id,
        transfer.to_warehouse_id,
    )

    source = (
        scoped(db, StockItem, user.tenant_id)
        .filter(
            StockItem.product_id == transfer.product_id,
            StockItem.warehouse_id == transfer.from_warehouse_id,
        )
        .first()
    )

    incoming_cost = source.avg_cost if source and source.avg_cost is not None else 0

    destination.avg_cost = weighted_average_cost(
        current_qty=destination.quantity or 0,
        current_cost=destination.avg_cost or 0,
        incoming_qty=transfer.quantity,
        incoming_cost=incoming_cost,
    )

    destination.quantity = (
        destination.quantity or 0
    ) + transfer.quantity

    db.add(
        StockMovement(
            tenant_id=user.tenant_id,
            product_id=transfer.product_id,
            warehouse_id=transfer.to_warehouse_id,
            movement_type="transfer",
            quantity=transfer.quantity,
            reason_code="warehouse_transfer_receive",
            user_id=user.id,
        )
    )

    transfer.status = "received"
    transfer.received_by = user.id
    transfer.received_at = utcnow()

    db.add(
        AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="inventory.transfer.received",
            entity_type="stock_transfer",
            entity_id=transfer.id,
            details={
                "status": "received",
                "quantity": transfer.quantity,
            },
        )
    )

    db.commit()

    return {
        "id": transfer.id,
        "status": transfer.status,
        "quantity": transfer.quantity,
    }

# ------------------------------------------------------------------ cycle counts
@router.post("/cycle-counts", status_code=status.HTTP_201_CREATED)
def create_cycle_count(
    body: CycleCountSessionIn,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """Open a physical cycle-count session (FR-INV-07)."""

    warehouse = (
        scoped(db, Warehouse, user.tenant_id)
        .filter(
            Warehouse.id == body.warehouse_id,
            Warehouse.is_active.is_(True),
        )
        .first()
    )

    if not warehouse:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Warehouse not found.",
        )

    session = CycleCountSession(
        tenant_id=user.tenant_id,
        warehouse_id=body.warehouse_id,
        status="open",
        created_by=user.id,
        created_at=utcnow(),
    )
    db.add(session)
    db.flush()

    # Snapshot current stock for this warehouse so later physical counts
    # are compared against a stable system quantity.
    stock_rows = (
        scoped(db, StockItem, user.tenant_id)
        .filter(StockItem.warehouse_id == body.warehouse_id)
        .all()
    )

    for row in stock_rows:
        db.add(
            CycleCountEntry(
                tenant_id=user.tenant_id,
                session_id=session.id,
                product_id=row.product_id,
                system_quantity=row.quantity or 0,
            )
        )

    db.add(
        AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="inventory.cycle_count.created",
            entity_type="cycle_count_session",
            entity_id=session.id,
            details={
                "warehouse_id": body.warehouse_id,
                "status": "open",
                "entry_count": len(stock_rows),
            },
        )
    )

    db.commit()

    return {
        "id": session.id,
        "warehouse_id": session.warehouse_id,
        "status": session.status,
        "entry_count": len(stock_rows),
    }


@router.post("/cycle-counts/{session_id}/entries")
def submit_cycle_count_entry(
    session_id: int,
    body: CycleCountEntryIn,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """Record a physical count and calculate its variance (FR-INV-07)."""

    session = (
        scoped(db, CycleCountSession, user.tenant_id)
        .filter(CycleCountSession.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Cycle-count session not found.",
        )

    if session.status != "open":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Cycle-count session cannot be updated from status '{session.status}'.",
        )

    entry = (
        scoped(db, CycleCountEntry, user.tenant_id)
        .filter(
            CycleCountEntry.session_id == session_id,
            CycleCountEntry.product_id == body.product_id,
        )
        .first()
    )

    if not entry:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Product is not part of this cycle-count session.",
        )

    entry.counted_quantity = body.counted_quantity
    entry.variance = body.counted_quantity - entry.system_quantity
    entry.counted_by = user.id
    entry.counted_at = utcnow()

    db.add(
        AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="inventory.cycle_count.counted",
            entity_type="cycle_count_entry",
            entity_id=entry.id,
            details={
                "session_id": session_id,
                "product_id": body.product_id,
                "system_quantity": entry.system_quantity,
                "counted_quantity": body.counted_quantity,
                "variance": entry.variance,
            },
        )
    )

    db.commit()

    return {
        "id": entry.id,
        "session_id": entry.session_id,
        "product_id": entry.product_id,
        "system_quantity": entry.system_quantity,
        "counted_quantity": entry.counted_quantity,
        "variance": entry.variance,
    }


@router.post("/cycle-counts/{session_id}/close")
def close_cycle_count(
    session_id: int,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """Close a cycle-count session after all entries are counted (FR-INV-07)."""

    session = (
        scoped(db, CycleCountSession, user.tenant_id)
        .filter(CycleCountSession.id == session_id)
        .first()
    )

    if not session:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Cycle-count session not found.",
        )

    if session.status != "open":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Cycle-count session cannot be closed from status '{session.status}'.",
        )

    entries = (
        scoped(db, CycleCountEntry, user.tenant_id)
        .filter(CycleCountEntry.session_id == session_id)
        .all()
    )

    uncounted = [entry for entry in entries if entry.counted_quantity is None]
    if uncounted:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"{len(uncounted)} cycle-count entries are still uncounted.",
        )

    # Apply physical counts as inventory adjustments and preserve the
    # immutable movement/audit trail.
    adjusted = 0
    for entry in entries:
        if entry.variance:
            row = _stock_row(
                db,
                user.tenant_id,
                entry.product_id,
                session.warehouse_id,
            )
            row.quantity = entry.counted_quantity

            db.add(
                StockMovement(
                    tenant_id=user.tenant_id,
                    product_id=entry.product_id,
                    warehouse_id=session.warehouse_id,
                    movement_type="adjustment",
                    quantity=entry.variance,
                    unit_cost=row.avg_cost or 0,
                    reason_code="cycle_count_variance",
                    user_id=user.id,
                    reference_type="cycle_count_session",
                    reference_id=session.id,
                )
            )
            adjusted += 1

    session.status = "closed"
    session.closed_at = utcnow()

    db.add(
        AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="inventory.cycle_count.closed",
            entity_type="cycle_count_session",
            entity_id=session.id,
            details={
                "warehouse_id": session.warehouse_id,
                "entry_count": len(entries),
                "adjusted_count": adjusted,
            },
        )
    )

    db.commit()

    return {
        "id": session.id,
        "status": session.status,
        "warehouse_id": session.warehouse_id,
        "entry_count": len(entries),
        "adjusted_count": adjusted,
    }


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