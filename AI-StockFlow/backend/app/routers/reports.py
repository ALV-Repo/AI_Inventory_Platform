"""Standard business reports and multi-format exports (SRS FR-RPT-03)."""

from __future__ import annotations

import csv
from copy import copy
from datetime import date, datetime, time
from io import BytesIO, StringIO

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from reportlab.lib import colors
from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    Customer,
    Product,
    PurchaseOrder,
    PurchaseOrderLine,
    SalesOrder,
    SalesOrderLine,
    StockItem,
    StockMovement,
    Supplier,
    User,
    Warehouse,
)


router = APIRouter(prefix="/reports", tags=["Reports"])


# ============================================================
# Common helpers
# ============================================================

EXPORT_FORMATS = {"json", "csv", "xlsx", "pdf"}


def validate_dates(date_from: date | None, date_to: date | None) -> None:
    if date_from and date_to and date_to < date_from:
        raise HTTPException(
            status_code=400,
            detail="date_to must be greater than or equal to date_from",
        )


def date_start(value: date) -> datetime:
    return datetime.combine(value, time.min)


def date_end(value: date) -> datetime:
    return datetime.combine(value, time.max)


def apply_datetime_range(
    query,
    column,
    date_from: date | None,
    date_to: date | None,
):
    if date_from:
        query = query.filter(column >= date_start(date_from))
    if date_to:
        query = query.filter(column <= date_end(date_to))
    return query


def apply_date_range(
    query,
    column,
    date_from: date | None,
    date_to: date | None,
):
    if date_from:
        query = query.filter(column >= date_from)
    if date_to:
        query = query.filter(column <= date_to)
    return query


def serialize(value):
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if value is None:
        return ""
    return value


def export_response(
    report_name: str,
    headers: list[str],
    rows: list[list],
    export_format: str,
):
    export_format = export_format.lower()

    if export_format == "json":
        return {
            "report": report_name,
            "columns": headers,
            "rows": [
                {headers[i]: serialize(row[i]) for i in range(len(headers))}
                for row in rows
            ],
        }

    if export_format == "csv":
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(headers)

        for row in rows:
            writer.writerow([serialize(value) for value in row])

        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": (
                    f"attachment; filename={report_name}.csv"
                )
            },
        )

    if export_format == "xlsx":
        workbook = Workbook()
        worksheet = workbook.active
        worksheet.title = report_name[:31]

        worksheet.append(headers)

        for row in rows:
            worksheet.append([serialize(value) for value in row])

        worksheet.freeze_panes = "A2"
        worksheet.auto_filter.ref = worksheet.dimensions
        for cell in worksheet[1]:
            font = copy(cell.font)
            font.bold = True
            cell.font = font


        for column_cells in worksheet.columns:
            max_length = 0
            column_letter = column_cells[0].column_letter

            for cell in column_cells:
                value = "" if cell.value is None else str(cell.value)
                max_length = max(max_length, len(value))

            worksheet.column_dimensions[column_letter].width = min(
                max(max_length + 2, 10),
                40,
            )

        output = BytesIO()
        workbook.save(output)
        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type=(
                "application/vnd.openxmlformats-officedocument."
                "spreadsheetml.sheet"
            ),
            headers={
                "Content-Disposition": (
                    f"attachment; filename={report_name}.xlsx"
                )
            },
        )

    if export_format == "pdf":
        output = BytesIO()

        document = SimpleDocTemplate(
            output,
            pagesize=landscape(letter),
            rightMargin=24,
            leftMargin=24,
            topMargin=24,
            bottomMargin=24,
        )

        styles = getSampleStyleSheet()
        elements = [
            Paragraph(
                report_name.replace("_", " ").title(),
                styles["Title"],
            )
        ]

        table_data = [headers]

        for row in rows:
            table_data.append(
                [str(serialize(value)) for value in row]
            )

        table = Table(table_data, repeatRows=1)

        table.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.black),
                    ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                    ("FONTSIZE", (0, 0), (-1, -1), 7),
                    ("GRID", (0, 0), (-1, -1), 0.25, colors.grey),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [
                        colors.white,
                        colors.whitesmoke,
                    ]),
                ]
            )
        )

        elements.append(table)
        document.build(elements)

        output.seek(0)

        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": (
                    f"attachment; filename={report_name}.pdf"
                )
            },
        )

    raise HTTPException(
        status_code=400,
        detail=(
            f"Unsupported format '{export_format}'. "
            "Use json, csv, xlsx, or pdf."
        ),
    )


def warehouse_filter(query, warehouse_column, warehouse_id):
    if warehouse_id is not None:
        query = query.filter(warehouse_column == warehouse_id)
    return query


# ============================================================
# FR-RPT-03 — Stock Summary
# ============================================================


@router.get("/stock-summary")
def stock_summary(
    warehouse_id: int | None = None,
    export_format: str = Query(
        "json",
        alias="format",
        pattern="^(json|csv|xlsx|pdf)$",
    ),
    user: User = Depends(require("report:read")),
    db: Session = Depends(get_db),
):
    query = scoped(db, StockItem, user.tenant_id)
    query = warehouse_filter(
        query,
        StockItem.warehouse_id,
        warehouse_id,
    )

    items = query.all()

    product_ids = {item.product_id for item in items}
    warehouse_ids = {item.warehouse_id for item in items}

    products = {
        product.id: product
        for product in scoped(db, Product, user.tenant_id)
        .filter(Product.id.in_(product_ids))
        .all()
    } if product_ids else {}

    warehouses = {
        warehouse.id: warehouse
        for warehouse in scoped(db, Warehouse, user.tenant_id)
        .filter(Warehouse.id.in_(warehouse_ids))
        .all()
    } if warehouse_ids else {}

    headers = [
        "Product ID",
        "SKU",
        "Product",
        "Warehouse ID",
        "Warehouse",
        "Batch",
        "Quantity",
        "Reserved",
        "Available",
        "Average Cost",
        "Stock Value",
        "Reorder Level",
        "Stock Status",
    ]

    rows = []

    for item in items:
        product = products.get(item.product_id)
        warehouse = warehouses.get(item.warehouse_id)

        quantity = float(item.quantity or 0)
        reserved = float(item.reserved_qty or 0)
        available = quantity - reserved
        avg_cost = float(item.avg_cost or 0)
        stock_value = round(quantity * avg_cost, 2)

        reorder_level = (
            float(product.reorder_level or 0)
            if product
            else 0
        )

        if available <= 0:
            stock_status = "out_of_stock"
        elif available <= reorder_level:
            stock_status = "low_stock"
        else:
            stock_status = "healthy"

        rows.append(
            [
                item.product_id,
                product.sku if product else "",
                product.name if product else "",
                item.warehouse_id,
                warehouse.name if warehouse else "",
                item.batch_no,
                quantity,
                reserved,
                available,
                round(avg_cost, 2),
                stock_value,
                reorder_level,
                stock_status,
            ]
        )

    return export_response(
        "stock_summary",
        headers,
        rows,
        export_format,
    )


# ============================================================
# FR-RPT-03 — Stock Ledger
# ============================================================


@router.get("/stock-ledger")
def stock_ledger(
    date_from: date | None = None,
    date_to: date | None = None,
    warehouse_id: int | None = None,
    product_id: int | None = None,
    export_format: str = Query(
        "json",
        alias="format",
        pattern="^(json|csv|xlsx|pdf)$",
    ),
    user: User = Depends(require("report:read")),
    db: Session = Depends(get_db),
):
    validate_dates(date_from, date_to)

    query = scoped(db, StockMovement, user.tenant_id)
    query = apply_datetime_range(
        query,
        StockMovement.created_at,
        date_from,
        date_to,
    )

    query = warehouse_filter(
        query,
        StockMovement.warehouse_id,
        warehouse_id,
    )

    if product_id is not None:
        query = query.filter(
            StockMovement.product_id == product_id
        )

    movements = query.order_by(
        StockMovement.created_at.desc()
    ).all()

    product_ids = {m.product_id for m in movements}
    warehouse_ids = {m.warehouse_id for m in movements}

    products = {
        p.id: p
        for p in scoped(db, Product, user.tenant_id)
        .filter(Product.id.in_(product_ids))
        .all()
    } if product_ids else {}

    warehouses = {
        w.id: w
        for w in scoped(db, Warehouse, user.tenant_id)
        .filter(Warehouse.id.in_(warehouse_ids))
        .all()
    } if warehouse_ids else {}

    headers = [
        "Date",
        "Product ID",
        "SKU",
        "Product",
        "Warehouse ID",
        "Warehouse",
        "Movement Type",
        "Quantity",
        "Unit Cost",
        "Reason",
        "Reference Type",
        "Reference ID",
        "User ID",
    ]

    rows = []

    for movement in movements:
        product = products.get(movement.product_id)
        warehouse = warehouses.get(movement.warehouse_id)

        rows.append(
            [
                movement.created_at,
                movement.product_id,
                product.sku if product else "",
                product.name if product else "",
                movement.warehouse_id,
                warehouse.name if warehouse else "",
                movement.movement_type,
                movement.quantity,
                movement.unit_cost,
                movement.reason_code,
                movement.reference_type,
                movement.reference_id,
                movement.user_id,
            ]
        )

    return export_response(
        "stock_ledger",
        headers,
        rows,
        export_format,
    )


# ============================================================
# FR-RPT-03 — Sales Register
# ============================================================


@router.get("/sales-register")
def sales_register(
    date_from: date | None = None,
    date_to: date | None = None,
    warehouse_id: int | None = None,
    export_format: str = Query(
        "json",
        alias="format",
        pattern="^(json|csv|xlsx|pdf)$",
    ),
    user: User = Depends(require("report:read")),
    db: Session = Depends(get_db),
):
    validate_dates(date_from, date_to)

    query = scoped(db, SalesOrder, user.tenant_id)
    query = apply_datetime_range(
        query,
        SalesOrder.created_at,
        date_from,
        date_to,
    )

    query = warehouse_filter(
        query,
        SalesOrder.warehouse_id,
        warehouse_id,
    )

    orders = query.order_by(
        SalesOrder.created_at.desc()
    ).all()

    customer_ids = {
        order.customer_id
        for order in orders
        if order.customer_id is not None
    }

    warehouse_ids = {order.warehouse_id for order in orders}

    customers = {
        c.id: c
        for c in scoped(db, Customer, user.tenant_id)
        .filter(Customer.id.in_(customer_ids))
        .all()
    } if customer_ids else {}

    warehouses = {
        w.id: w
        for w in scoped(db, Warehouse, user.tenant_id)
        .filter(Warehouse.id.in_(warehouse_ids))
        .all()
    } if warehouse_ids else {}

    headers = [
        "Invoice ID",
        "Invoice Number",
        "Date",
        "Customer ID",
        "Customer",
        "Warehouse ID",
        "Warehouse",
        "Channel",
        "Status",
        "Subtotal",
        "Discount",
        "Tax",
        "Total",
        "Payment Mode",
        "Due Date",
        "Outstanding",
        "IRN",
        "IRN Status",
    ]

    rows = []

    for order in orders:
        customer = customers.get(order.customer_id)
        warehouse = warehouses.get(order.warehouse_id)

        rows.append(
            [
                order.id,
                order.order_number,
                order.created_at,
                order.customer_id,
                customer.name if customer else "",
                order.warehouse_id,
                warehouse.name if warehouse else "",
                order.channel,
                order.status,
                order.subtotal,
                order.discount,
                order.tax_amount,
                order.total,
                order.payment_mode,
                order.due_date,
                order.outstanding,
                order.irn,
                order.irn_status,
            ]
        )

    return export_response(
        "sales_register",
        headers,
        rows,
        export_format,
    )


# ============================================================
# FR-RPT-03 — Purchase Register
# ============================================================


@router.get("/purchase-register")
def purchase_register(
    date_from: date | None = None,
    date_to: date | None = None,
    warehouse_id: int | None = None,
    export_format: str = Query(
        "json",
        alias="format",
        pattern="^(json|csv|xlsx|pdf)$",
    ),
    user: User = Depends(require("report:read")),
    db: Session = Depends(get_db),
):
    validate_dates(date_from, date_to)

    query = scoped(db, PurchaseOrder, user.tenant_id)
    query = apply_datetime_range(
        query,
        PurchaseOrder.created_at,
        date_from,
        date_to,
    )

    query = warehouse_filter(
        query,
        PurchaseOrder.warehouse_id,
        warehouse_id,
    )

    orders = query.order_by(
        PurchaseOrder.created_at.desc()
    ).all()

    supplier_ids = {order.supplier_id for order in orders}
    warehouse_ids = {order.warehouse_id for order in orders}

    suppliers = {
        s.id: s
        for s in scoped(db, Supplier, user.tenant_id)
        .filter(Supplier.id.in_(supplier_ids))
        .all()
    } if supplier_ids else {}

    warehouses = {
        w.id: w
        for w in scoped(db, Warehouse, user.tenant_id)
        .filter(Warehouse.id.in_(warehouse_ids))
        .all()
    } if warehouse_ids else {}

    headers = [
        "Purchase Order ID",
        "Date",
        "Supplier ID",
        "Supplier",
        "Warehouse ID",
        "Warehouse",
        "Status",
        "Subtotal",
        "Tax",
        "Total",
        "Due Date",
        "Outstanding",
        "Ordered Units",
        "Received Units",
        "Fill Rate %",
    ]

    rows = []

    for order in orders:
        supplier = suppliers.get(order.supplier_id)
        warehouse = warehouses.get(order.warehouse_id)

        ordered_units = sum(
            float(line.quantity or 0)
            for line in order.lines
        )

        received_units = sum(
            float(line.received_qty or 0)
            for line in order.lines
        )

        fill_rate = (
            round(received_units / ordered_units * 100, 2)
            if ordered_units
            else 0
        )

        rows.append(
            [
                order.id,
                order.created_at,
                order.supplier_id,
                supplier.name if supplier else "",
                order.warehouse_id,
                warehouse.name if warehouse else "",
                order.status,
                order.subtotal,
                order.tax_amount,
                order.total,
                order.due_date,
                order.outstanding,
                ordered_units,
                received_units,
                fill_rate,
            ]
        )

    return export_response(
        "purchase_register",
        headers,
        rows,
        export_format,
    )


# ============================================================
# FR-RPT-03 — GST Summary
# ============================================================


@router.get("/gst-summary")
def report_gst_summary(
    date_from: date | None = None,
    date_to: date | None = None,
    warehouse_id: int | None = None,
    export_format: str = Query(
        "json",
        alias="format",
        pattern="^(json|csv|xlsx|pdf)$",
    ),
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    validate_dates(date_from, date_to)

    query = scoped(db, SalesOrderLine, user.tenant_id).join(
        SalesOrder,
        SalesOrder.id == SalesOrderLine.order_id,
    )

    query = apply_datetime_range(
        query,
        SalesOrder.created_at,
        date_from,
        date_to,
    )

    if warehouse_id is not None:
        query = query.filter(
            SalesOrder.warehouse_id == warehouse_id
        )

    lines = query.all()

    grouped = {}

    for line in lines:
        rate = float(line.gst_rate or 0)
        key = round(rate, 2)

        if key not in grouped:
            grouped[key] = {
                "taxable": 0.0,
                "tax": 0.0,
                "invoice_count": set(),
            }

        grouped[key]["taxable"] += (
            float(line.line_total or 0)
            - float(line.tax_amount or 0)
        )
        grouped[key]["tax"] += float(line.tax_amount or 0)
        grouped[key]["invoice_count"].add(line.order_id)

    headers = [
        "GST Rate %",
        "Taxable Value",
        "GST Amount",
        "Invoice Count",
    ]

    rows = []

    for rate in sorted(grouped):
        item = grouped[rate]

        rows.append(
            [
                rate,
                round(item["taxable"], 2),
                round(item["tax"], 2),
                len(item["invoice_count"]),
            ]
        )

    return export_response(
        "gst_summary",
        headers,
        rows,
        export_format,
    )


# ============================================================
# FR-RPT-03 — Aging
# ============================================================


def aging_bucket(days: int) -> str:
    if days <= 30:
        return "0-30"
    if days <= 60:
        return "31-60"
    if days <= 90:
        return "61-90"
    return "90+"


@router.get("/aging")
def report_aging(
    as_of: date | None = None,
    export_format: str = Query(
        "json",
        alias="format",
        pattern="^(json|csv|xlsx|pdf)$",
    ),
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    as_of = as_of or date.today()

    headers = [
        "Type",
        "Document ID",
        "Party ID",
        "Due Date",
        "Days Overdue",
        "Bucket",
        "Outstanding",
    ]

    rows = []

    sales_orders = scoped(
        db,
        SalesOrder,
        user.tenant_id,
    ).all()

    for order in sales_orders:
        outstanding = float(order.outstanding or 0)

        if outstanding <= 0:
            continue

        due_date = order.due_date or order.order_date.date()

        days_overdue = max(
            (as_of - due_date).days,
            0,
        )

        rows.append(
            [
                "accounts_receivable",
                order.id,
                order.customer_id,
                due_date,
                days_overdue,
                aging_bucket(days_overdue),
                round(outstanding, 2),
            ]
        )

    purchase_orders = scoped(
        db,
        PurchaseOrder,
        user.tenant_id,
    ).all()

    for order in purchase_orders:
        outstanding = float(order.outstanding or 0)

        if outstanding <= 0:
            continue

        due_date = order.due_date or order.order_date

        days_overdue = max(
            (as_of - due_date).days,
            0,
        )

        rows.append(
            [
                "accounts_payable",
                order.id,
                order.supplier_id,
                due_date,
                days_overdue,
                aging_bucket(days_overdue),
                round(outstanding, 2),
            ]
        )

    return export_response(
        "aging",
        headers,
        rows,
        export_format,
    )


# ============================================================
# FR-RPT-03 — Vendor Scorecard
# ============================================================


@router.get("/vendor-scorecard")
def vendor_scorecard(
    date_from: date | None = None,
    date_to: date | None = None,
    export_format: str = Query(
        "json",
        alias="format",
        pattern="^(json|csv|xlsx|pdf)$",
    ),
    user: User = Depends(require("report:read")),
    db: Session = Depends(get_db),
):
    validate_dates(date_from, date_to)

    suppliers = scoped(
        db,
        Supplier,
        user.tenant_id,
    ).all()

    headers = [
        "Supplier ID",
        "Supplier",
        "PO Count",
        "Ordered Units",
        "Received Units",
        "Fill Rate %",
        "Fully Received POs",
        "On-Time Fully Received POs",
        "On-Time Rate %",
        "Quality Rejection Rate",
        "Price Stability",
        "Notes",
    ]

    rows = []

    for supplier in suppliers:
        query = scoped(
            db,
            PurchaseOrder,
            user.tenant_id,
        ).filter(
            PurchaseOrder.supplier_id == supplier.id
        )

        query = apply_datetime_range(
            query,
            PurchaseOrder.created_at,
            date_from,
            date_to,
        )

        orders = query.all()

        ordered_units = 0.0
        received_units = 0.0
        fully_received = 0
        on_time = 0

        for order in orders:
            order_quantity = sum(
                float(line.quantity or 0)
                for line in order.lines
            )

            received_quantity = sum(
                float(line.received_qty or 0)
                for line in order.lines
            )

            ordered_units += order_quantity
            received_units += received_quantity

            is_fully_received = (
                order_quantity > 0
                and received_quantity >= order_quantity
            )

            if is_fully_received:
                fully_received += 1

                # A fully received PO is on-time if its final
                # receipt movement happened on or before expected_date.
                if order.expected_date:
                    final_receipt = (
                        scoped(
                            db,
                            StockMovement,
                            user.tenant_id,
                        )
                        .filter(
                            StockMovement.reference_type
                            == "purchase_order",
                            StockMovement.reference_id
                            == order.id,
                            StockMovement.movement_type
                            == "receipt",
                        )
                        .order_by(
                            StockMovement.created_at.desc()
                        )
                        .first()
                    )

                    if final_receipt:
                        receipt_date = (
                            final_receipt.created_at.date()
                        )

                        if receipt_date <= order.expected_date:
                            on_time += 1

        fill_rate = (
            round(
                received_units / ordered_units * 100,
                2,
            )
            if ordered_units
            else 0
        )

        on_time_rate = (
            round(
                on_time / fully_received * 100,
                2,
            )
            if fully_received
            else None
        )

        rows.append(
            [
                supplier.id,
                supplier.name,
                len(orders),
                ordered_units,
                received_units,
                fill_rate,
                fully_received,
                on_time,
                on_time_rate,
                None,
                None,
                (
                    "Quality rejection and price stability are "
                    "not stored in the current data model."
                ),
            ]
        )

    return export_response(
        "vendor_scorecard",
        headers,
        rows,
        export_format,
    )