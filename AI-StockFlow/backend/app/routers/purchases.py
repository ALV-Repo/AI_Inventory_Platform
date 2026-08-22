"""Purchase order and goods-receipt endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    AuditLog,
    Product,
    PurchaseOrder,
    PurchaseOrderLine,
    StockItem,
    StockMovement,
    Supplier,
    User,
    Warehouse,
    utcnow,
)

router = APIRouter(prefix="/purchases", tags=["Purchases"])


class PurchaseLineIn(BaseModel):
    product_id: int
    quantity: float = Field(gt=0)
    unit_price: float = Field(ge=0)
    gst_rate: float = Field(default=18.0, ge=0, le=100)


class PurchaseOrderIn(BaseModel):
    po_number: str = Field(min_length=1, max_length=40)
    supplier_id: int
    warehouse_id: int
    expected_date: str | None = None
    lines: list[PurchaseLineIn] = Field(min_length=1)


class ReceiveLineIn(BaseModel):
    product_id: int
    quantity: float = Field(gt=0)
    batch_no: str | None = None
    serial_numbers: list[str] = Field(default_factory=list)
from app.models.entities import (
    Product,
    PurchaseOrder,
    PurchaseOrderLine,
    StockItem,
    StockMovement,
    StockSerial,
    Supplier,
    User,
    Warehouse,
    utcnow,
)

class ReceiveIn(BaseModel):
    lines: list[ReceiveLineIn] = Field(min_length=1)


@router.post(
    "/orders",
    status_code=status.HTTP_201_CREATED,
)
def create_purchase_order(
    body: PurchaseOrderIn,
    user: User = Depends(require("purchase:write")),
    db: Session = Depends(get_db),
):
    supplier = (
        scoped(db, Supplier, user.tenant_id)
        .filter(
            Supplier.id == body.supplier_id,
            Supplier.is_active.is_(True),
        )
        .first()
    )

    if not supplier:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Supplier not found.",
        )

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

    existing = (
        scoped(db, PurchaseOrder, user.tenant_id)
        .filter(PurchaseOrder.po_number == body.po_number)
        .first()
    )

    if existing:
        raise HTTPException(
            status.HTTP_409_CONFLICT,
            f"PO {body.po_number} is already in use.",
        )

    for line in body.lines:
        product = (
            scoped(db, Product, user.tenant_id)
            .filter(
                Product.id == line.product_id,
                Product.is_active.is_(True),
            )
            .first()
        )

        if not product:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                f"Product {line.product_id} not found.",
            )

    subtotal = sum(
        line.quantity * line.unit_price
        for line in body.lines
    )

    tax_amount = sum(
        line.quantity
        * line.unit_price
        * line.gst_rate
        / 100
        for line in body.lines
    )

    order = PurchaseOrder(
        tenant_id=user.tenant_id,
        po_number=body.po_number,
        supplier_id=body.supplier_id,
        warehouse_id=body.warehouse_id,
        status="draft",
        subtotal=subtotal,
        tax_amount=tax_amount,
        total=subtotal + tax_amount,
    )

    db.add(order)
    db.flush()

    for line in body.lines:
        db.add(
            PurchaseOrderLine(
                tenant_id=user.tenant_id,
                po_id=order.id,
                product_id=line.product_id,
                quantity=line.quantity,
                unit_price=line.unit_price,
                gst_rate=line.gst_rate,
                received_qty=0,
            )
        )

    db.add(
        AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="purchase.order.created",
            entity_type="purchase_order",
            entity_id=order.id,
            details={
                "po_number": order.po_number,
                "supplier_id": order.supplier_id,
                "warehouse_id": order.warehouse_id,
                "total": order.total,
            },
        )
    )

    db.commit()
    db.refresh(order)

    return {
        "id": order.id,
        "po_number": order.po_number,
        "supplier_id": order.supplier_id,
        "warehouse_id": order.warehouse_id,
        "status": order.status,
        "subtotal": order.subtotal,
        "tax_amount": order.tax_amount,
        "total": order.total,
        "lines": [
            {
                "product_id": line.product_id,
                "quantity": line.quantity,
                "unit_price": line.unit_price,
                "gst_rate": line.gst_rate,
                "received_qty": line.received_qty,
            }
            for line in order.lines
        ],
    }


@router.post("/orders/{order_id}/approve")
def approve_purchase_order(
    order_id: int,
    user: User = Depends(require("purchase:write")),
    db: Session = Depends(get_db),
):
    order = (
        scoped(db, PurchaseOrder, user.tenant_id)
        .filter(PurchaseOrder.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Purchase order not found.",
        )

    if order.status != "draft":
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Purchase order cannot be approved from status '{order.status}'.",
        )

    order.status = "approved"

    db.add(
        AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="purchase.order.approved",
            entity_type="purchase_order",
            entity_id=order.id,
            details={"status": "approved"},
        )
    )

    db.commit()

    return {
        "id": order.id,
        "status": order.status,
    }
@router.post("/orders/{order_id}/receive")
def receive_purchase_order(
    order_id: int,
    body: ReceiveIn,
    user: User = Depends(require("purchase:write")),
    db: Session = Depends(get_db),
):
    order = (
        scoped(db, PurchaseOrder, user.tenant_id)
        .filter(PurchaseOrder.id == order_id)
        .first()
    )

    if not order:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            "Purchase order not found.",
        )

    if order.status not in {"approved", "partial"}:
        raise HTTPException(
            status.HTTP_400_BAD_REQUEST,
            f"Purchase order cannot be received from status '{order.status}'.",
        )

    line_map = {
        line.product_id: line
        for line in order.lines
    }

    for received in body.lines:
        line = line_map.get(received.product_id)

        if not line:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Product {received.product_id} is not part of this purchase order.",
            )

        remaining = line.quantity - (line.received_qty or 0)

        if received.quantity > remaining:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Cannot receive {received.quantity} units of product "
                f"{received.product_id}; only {remaining} remain.",
            )

        product = (
            scoped(db, Product, user.tenant_id)
            .filter(
                Product.id == received.product_id,
                Product.is_active.is_(True),
            )
            .first()
        )

        if not product:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND,
                f"Product {received.product_id} not found.",
            )

        # ---------------------------------------------------------
        # Serial-number enforcement
        # ---------------------------------------------------------
        if product.track_serial:
            if len(received.serial_numbers) != int(received.quantity):
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    f"Product {product.sku} requires exactly "
                    f"{int(received.quantity)} serial numbers.",
                )

            if len(set(received.serial_numbers)) != len(
                received.serial_numbers
            ):
                raise HTTPException(
                    status.HTTP_400_BAD_REQUEST,
                    "Serial numbers must be unique within this receipt.",
                )

            existing_serial = (
                scoped(db, StockSerial, user.tenant_id)
                .filter(
                    StockSerial.serial_number.in_(
                        received.serial_numbers
                    )
                )
                .first()
            )

            if existing_serial:
                raise HTTPException(
                    status.HTTP_409_CONFLICT,
                    f"Serial number "
                    f"{existing_serial.serial_number} already exists.",
                )

        elif received.serial_numbers:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Product {product.sku} is not configured "
                "for serial-number tracking.",
            )

        # ---------------------------------------------------------
        # Batch tracking enforcement
        # ---------------------------------------------------------
        if product.track_batch and not received.batch_no:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Product {product.sku} requires a batch number.",
            )

        if not product.track_batch and received.batch_no:
            raise HTTPException(
                status.HTTP_400_BAD_REQUEST,
                f"Product {product.sku} is not configured "
                "for batch tracking.",
            )

        # ---------------------------------------------------------
        # Find/create stock row
        # ---------------------------------------------------------
        stock = (
            scoped(db, StockItem, user.tenant_id)
            .filter(
                StockItem.product_id == received.product_id,
                StockItem.warehouse_id == order.warehouse_id,
                StockItem.batch_no == received.batch_no,
            )
            .first()
        )

        if not stock:
            stock = StockItem(
                tenant_id=user.tenant_id,
                product_id=received.product_id,
                warehouse_id=order.warehouse_id,
                batch_no=received.batch_no,
                quantity=0,
                reserved_qty=0,
                avg_cost=0,
            )
            db.add(stock)
            db.flush()

        old_qty = stock.quantity or 0
        old_cost = stock.avg_cost or 0
        new_qty = old_qty + received.quantity

        stock.avg_cost = (
            (
                old_qty * old_cost
                + received.quantity * line.unit_price
            )
            / new_qty
            if new_qty
            else line.unit_price
        )

        stock.quantity = new_qty

        # ---------------------------------------------------------
        # Create serial records
        # ---------------------------------------------------------
        if product.track_serial:
            for serial_number in received.serial_numbers:
                db.add(
                    StockSerial(
                        tenant_id=user.tenant_id,
                        product_id=received.product_id,
                        warehouse_id=order.warehouse_id,
                        serial_number=serial_number,
                        batch_no=received.batch_no,
                        status="available",
                        created_at=utcnow(),
                    )
                )

        line.received_qty = (
            line.received_qty or 0
        ) + received.quantity

        db.add(
            StockMovement(
                tenant_id=user.tenant_id,
                product_id=received.product_id,
                warehouse_id=order.warehouse_id,
                movement_type="receipt",
                quantity=received.quantity,
                unit_cost=line.unit_price,
                reason_code="purchase_receipt",
                reference_type="purchase_order",
                reference_id=order.id,
                user_id=user.id,
                created_at=utcnow(),
            )
        )

    fully_received = all(
        (line.received_qty or 0) >= line.quantity
        for line in order.lines
    )

    order.status = (
        "received"
        if fully_received
        else "partial"
    )

    db.add(
        AuditLog(
            tenant_id=user.tenant_id,
            user_id=user.id,
            action="purchase.order.received",
            entity_type="purchase_order",
            entity_id=order.id,
            details={
                "status": order.status,
                "received_lines": len(body.lines),
            },
        )
    )

    db.commit()

    return {
        "id": order.id,
        "status": order.status,
        "received_lines": len(body.lines),
    }

@router.get("/orders")
def list_purchase_orders(
    user: User = Depends(require("purchase:read")),
    db: Session = Depends(get_db),
):
    orders = (
        scoped(db, PurchaseOrder, user.tenant_id)
        .order_by(PurchaseOrder.id.desc())
        .all()
    )

    return [
        {
            "id": order.id,
            "po_number": order.po_number,
            "supplier_id": order.supplier_id,
            "warehouse_id": order.warehouse_id,
            "status": order.status,
            "subtotal": order.subtotal,
            "tax_amount": order.tax_amount,
            "total": order.total,
        }
        for order in orders
    ]