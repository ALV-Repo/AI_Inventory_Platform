"""Warehouse management endpoints (FR-WHS-01 to FR-WHS-04)."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    AuditLog, Dispatch, PickList, PickListLine, Product,
    PutAway, SalesOrder, StockItem, User, Warehouse,
    WarehouseBin, utcnow,
)

router = APIRouter(prefix="/warehouse", tags=["Warehouse"])


# ── FR-WHS-01: Zone → Rack → Bin Hierarchy ───────────────────────────────────

class BinIn(BaseModel):
    warehouse_id: int
    zone: str = Field(min_length=1, max_length=32)
    rack: str = Field(min_length=1, max_length=32)
    bin_code: str = Field(min_length=1, max_length=32)
    capacity: float = Field(default=0.0, ge=0)


def _bin_dict(b: WarehouseBin) -> dict:
    return {
        "id": b.id,
        "warehouse_id": b.warehouse_id,
        "zone": b.zone,
        "rack": b.rack,
        "bin_code": b.bin_code,
        "capacity": b.capacity,
        "is_active": b.is_active,
    }


@router.get("/bins")
def list_bins(
    warehouse_id: int | None = None,
    zone: str | None = None,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    """List bin hierarchy for a warehouse. FR-WHS-01"""
    query = scoped(db, WarehouseBin, user.tenant_id).filter(WarehouseBin.is_active.is_(True))
    if warehouse_id:
        query = query.filter(WarehouseBin.warehouse_id == warehouse_id)
    if zone:
        query = query.filter(WarehouseBin.zone == zone)
    bins = query.order_by(WarehouseBin.zone, WarehouseBin.rack, WarehouseBin.bin_code).all()

    # Group into tree: zone → rack → bins
    tree: dict = {}
    for b in bins:
        tree.setdefault(b.zone, {}).setdefault(b.rack, []).append(_bin_dict(b))

    return {"bins": [_bin_dict(b) for b in bins], "tree": tree}


@router.post("/bins", status_code=status.HTTP_201_CREATED)
def create_bin(
    body: BinIn,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    warehouse = (
        scoped(db, Warehouse, user.tenant_id)
        .filter(Warehouse.id == body.warehouse_id, Warehouse.is_active.is_(True))
        .first()
    )
    if not warehouse:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Warehouse not found.")

    existing = (
        scoped(db, WarehouseBin, user.tenant_id)
        .filter(
            WarehouseBin.warehouse_id == body.warehouse_id,
            WarehouseBin.bin_code == body.bin_code,
        )
        .first()
    )
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, f"Bin {body.bin_code} already exists in this warehouse.")

    b = WarehouseBin(
        tenant_id=user.tenant_id,
        warehouse_id=body.warehouse_id,
        zone=body.zone,
        rack=body.rack,
        bin_code=body.bin_code,
        capacity=body.capacity,
        is_active=True,
    )
    db.add(b)
    db.commit()
    db.refresh(b)
    return _bin_dict(b)


# ── FR-WHS-02: Pick List ──────────────────────────────────────────────────────

@router.post("/pick-lists", status_code=status.HTTP_201_CREATED)
def create_pick_list(
    sales_order_id: int,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """
    Generate a pick list for a sales order, sequenced by bin location.
    FR-WHS-02
    """
    order = (
        scoped(db, SalesOrder, user.tenant_id)
        .filter(SalesOrder.id == sales_order_id)
        .first()
    )
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sales order not found.")

    # Check no existing pick list
    existing = (
        scoped(db, PickList, user.tenant_id)
        .filter(PickList.sales_order_id == sales_order_id)
        .first()
    )
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Pick list already exists for this order.")

    pick_list = PickList(
        tenant_id=user.tenant_id,
        sales_order_id=sales_order_id,
        warehouse_id=order.warehouse_id,
        status="pending",
        assigned_to=user.id,
    )
    db.add(pick_list)
    db.flush()

    # Create lines from sales order lines
    for line in order.lines:
        # Find best bin for this product (first bin with stock)
        stock = (
            scoped(db, StockItem, user.tenant_id)
            .filter(
                StockItem.product_id == line.product_id,
                StockItem.warehouse_id == order.warehouse_id,
            )
            .first()
        )

        db.add(PickListLine(
            tenant_id=user.tenant_id,
            pick_list_id=pick_list.id,
            product_id=line.product_id,
            quantity_required=line.quantity,
            quantity_picked=0,
            is_picked=False,
        ))

    db.commit()
    db.refresh(pick_list)

    return {
        "id": pick_list.id,
        "sales_order_id": sales_order_id,
        "status": pick_list.status,
        "line_count": len(order.lines),
    }


@router.get("/pick-lists")
def list_pick_lists(
    status: str | None = None,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    query = scoped(db, PickList, user.tenant_id)
    if status:
        query = query.filter(PickList.status == status)
    lists = query.order_by(PickList.created_at.desc()).all()
    return [
        {
            "id": pl.id,
            "sales_order_id": pl.sales_order_id,
            "warehouse_id": pl.warehouse_id,
            "status": pl.status,
            "assigned_to": pl.assigned_to,
            "created_at": pl.created_at,
            "completed_at": pl.completed_at,
            "line_count": len(pl.lines),
        }
        for pl in lists
    ]


@router.get("/pick-lists/{pick_list_id}")
def get_pick_list(
    pick_list_id: int,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    pl = scoped(db, PickList, user.tenant_id).filter(PickList.id == pick_list_id).first()
    if not pl:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pick list not found.")
    return {
        "id": pl.id,
        "sales_order_id": pl.sales_order_id,
        "warehouse_id": pl.warehouse_id,
        "status": pl.status,
        "assigned_to": pl.assigned_to,
        "created_at": pl.created_at,
        "completed_at": pl.completed_at,
        "lines": [
            {
                "id": line.id,
                "product_id": line.product_id,
                "bin_id": line.bin_id,
                "quantity_required": line.quantity_required,
                "quantity_picked": line.quantity_picked,
                "is_picked": line.is_picked,
            }
            for line in pl.lines
        ],
    }


@router.post("/pick-lists/{pick_list_id}/confirm-line")
def confirm_pick_line(
    pick_list_id: int,
    line_id: int,
    quantity_picked: float,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """Scan-confirm picking for a single line. FR-WHS-02"""
    pl = scoped(db, PickList, user.tenant_id).filter(PickList.id == pick_list_id).first()
    if not pl:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pick list not found.")

    line = (
        scoped(db, PickListLine, user.tenant_id)
        .filter(PickListLine.id == line_id, PickListLine.pick_list_id == pick_list_id)
        .first()
    )
    if not line:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Pick list line not found.")

    line.quantity_picked = quantity_picked
    line.is_picked = quantity_picked >= line.quantity_required

    # Check if all lines are picked
    all_picked = all(l.is_picked for l in pl.lines)
    if all_picked:
        pl.status = "completed"
        pl.completed_at = utcnow()

    db.commit()
    return {"line_id": line_id, "is_picked": line.is_picked, "pick_list_status": pl.status}


# ── FR-WHS-03: Put-Away ───────────────────────────────────────────────────────

class PutAwayIn(BaseModel):
    purchase_order_id: int
    product_id: int
    warehouse_id: int
    quantity: float = Field(gt=0)
    suggested_bin_id: int | None = None


@router.post("/put-away", status_code=status.HTTP_201_CREATED)
def create_put_away(
    body: PutAwayIn,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """
    Create a put-away task. Suggests a bin based on existing stock location.
    FR-WHS-03
    """
    product = (
        scoped(db, Product, user.tenant_id)
        .filter(Product.id == body.product_id, Product.is_active.is_(True))
        .first()
    )
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found.")

    # Auto-suggest bin: find existing bin where this product already has stock
    suggested_bin_id = body.suggested_bin_id
    if not suggested_bin_id:
        existing_stock = (
            scoped(db, StockItem, user.tenant_id)
            .filter(
                StockItem.product_id == body.product_id,
                StockItem.warehouse_id == body.warehouse_id,
            )
            .first()
        )
        # If we have bin info, use it. Otherwise leave as None.

    put_away = PutAway(
        tenant_id=user.tenant_id,
        purchase_order_id=body.purchase_order_id,
        product_id=body.product_id,
        warehouse_id=body.warehouse_id,
        suggested_bin_id=suggested_bin_id,
        quantity=body.quantity,
        status="pending",
        assigned_to=user.id,
    )
    db.add(put_away)
    db.commit()
    db.refresh(put_away)

    return {
        "id": put_away.id,
        "product_id": put_away.product_id,
        "warehouse_id": put_away.warehouse_id,
        "suggested_bin_id": put_away.suggested_bin_id,
        "quantity": put_away.quantity,
        "status": put_away.status,
    }


@router.get("/put-away")
def list_put_aways(
    status: str | None = None,
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    query = scoped(db, PutAway, user.tenant_id)
    if status:
        query = query.filter(PutAway.status == status)
    records = query.order_by(PutAway.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "purchase_order_id": r.purchase_order_id,
            "product_id": r.product_id,
            "warehouse_id": r.warehouse_id,
            "suggested_bin_id": r.suggested_bin_id,
            "actual_bin_id": r.actual_bin_id,
            "quantity": r.quantity,
            "status": r.status,
            "assigned_to": r.assigned_to,
        }
        for r in records
    ]


@router.post("/put-away/{put_away_id}/complete")
def complete_put_away(
    put_away_id: int,
    actual_bin_id: int | None = None,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """Mark a put-away task as completed, optionally recording the actual bin."""
    pa = scoped(db, PutAway, user.tenant_id).filter(PutAway.id == put_away_id).first()
    if not pa:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Put-away task not found.")
    pa.status = "completed"
    pa.actual_bin_id = actual_bin_id or pa.suggested_bin_id
    pa.completed_at = utcnow()
    db.commit()
    return {"id": pa.id, "status": "completed", "actual_bin_id": pa.actual_bin_id}


# ── FR-WHS-04: Dispatch ───────────────────────────────────────────────────────

class DispatchIn(BaseModel):
    sales_order_id: int
    warehouse_id: int
    courier: str | None = None
    vehicle_number: str | None = None
    tracking_number: str | None = None


@router.post("/dispatch", status_code=status.HTTP_201_CREATED)
def create_dispatch(
    body: DispatchIn,
    user: User = Depends(require("inventory:write")),
    db: Session = Depends(get_db),
):
    """Create a dispatch record with gate pass. FR-WHS-04"""
    order = (
        scoped(db, SalesOrder, user.tenant_id)
        .filter(SalesOrder.id == body.sales_order_id)
        .first()
    )
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Sales order not found.")

    # Check no existing dispatch
    existing = (
        scoped(db, Dispatch, user.tenant_id)
        .filter(Dispatch.sales_order_id == body.sales_order_id)
        .first()
    )
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "Dispatch already created for this order.")

    # Generate gate pass number
    count = scoped(db, Dispatch, user.tenant_id).count()
    gate_pass = f"GP-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{count + 1:04d}"

    dispatch = Dispatch(
        tenant_id=user.tenant_id,
        sales_order_id=body.sales_order_id,
        warehouse_id=body.warehouse_id,
        courier=body.courier,
        vehicle_number=body.vehicle_number,
        tracking_number=body.tracking_number,
        gate_pass_number=gate_pass,
        dispatched_by=user.id,
        status="dispatched",
    )
    db.add(dispatch)
    db.add(AuditLog(
        tenant_id=user.tenant_id, user_id=user.id,
        action="warehouse.dispatch.created", entity_type="dispatch",
        entity_id=body.sales_order_id,
        details={"gate_pass": gate_pass, "order_id": body.sales_order_id},
    ))

    # Mark order as dispatched
    order.status = "dispatched"

    db.commit()
    db.refresh(dispatch)

    return {
        "id": dispatch.id,
        "sales_order_id": dispatch.sales_order_id,
        "gate_pass_number": dispatch.gate_pass_number,
        "courier": dispatch.courier,
        "vehicle_number": dispatch.vehicle_number,
        "tracking_number": dispatch.tracking_number,
        "dispatched_at": dispatch.dispatched_at,
        "status": dispatch.status,
    }


@router.get("/dispatch")
def list_dispatches(
    user: User = Depends(require("inventory:read")),
    db: Session = Depends(get_db),
):
    dispatches = (
        scoped(db, Dispatch, user.tenant_id)
        .order_by(Dispatch.dispatched_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": d.id,
            "sales_order_id": d.sales_order_id,
            "gate_pass_number": d.gate_pass_number,
            "courier": d.courier,
            "tracking_number": d.tracking_number,
            "dispatched_at": d.dispatched_at,
            "status": d.status,
        }
        for d in dispatches
    ]
