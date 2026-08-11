"""Dashboard and reporting endpoints (SRS §3.8)."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    Product, SalesOrder, SalesOrderLine, StockItem, User,
)

router = APIRouter(prefix="/dashboard", tags=["Dashboard & Reports"])


@router.get("/summary")
def summary(
    days: int = 30,
    user: User = Depends(require("report:read")),
    db: Session = Depends(get_db),
):
    """Headline metrics for the dashboard (FR-RPT-01)."""
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    period_start = now - timedelta(days=days)
    prev_start = now - timedelta(days=days * 2)

    def revenue_between(start, end):
        return float(
            scoped(db, SalesOrder, user.tenant_id)
            .filter(SalesOrder.order_date >= start, SalesOrder.order_date < end)
            .with_entities(func.sum(SalesOrder.total)).scalar() or 0
        )

    today_orders = scoped(db, SalesOrder, user.tenant_id).filter(
        SalesOrder.order_date >= today_start
    )
    period_orders = scoped(db, SalesOrder, user.tenant_id).filter(
        SalesOrder.order_date >= period_start
    )

    revenue_now = revenue_between(period_start, now)
    revenue_prev = revenue_between(prev_start, period_start)

    gross_profit = float(
        period_orders.with_entities(
            func.sum(SalesOrder.subtotal - SalesOrder.cogs)
        ).scalar() or 0
    )

    inventory_value = float(
        scoped(db, StockItem, user.tenant_id)
        .with_entities(func.sum(StockItem.quantity * StockItem.avg_cost)).scalar() or 0
    )

    products = scoped(db, Product, user.tenant_id).filter(Product.is_active.is_(True)).all()
    qty_by_product = dict(
        scoped(db, StockItem, user.tenant_id)
        .with_entities(StockItem.product_id, func.sum(StockItem.quantity))
        .group_by(StockItem.product_id).all()
    )
    low_stock = sum(
        1 for p in products if float(qty_by_product.get(p.id) or 0) <= p.reorder_level
    )
    out_of_stock = sum(1 for p in products if float(qty_by_product.get(p.id) or 0) <= 0)

    return {
        "today": {
            "revenue": round(float(
                today_orders.with_entities(func.sum(SalesOrder.total)).scalar() or 0
            ), 2),
            "orders": today_orders.count(),
        },
        "period": {
            "days": days,
            "revenue": round(revenue_now, 2),
            "orders": period_orders.count(),
            "gross_profit": round(gross_profit, 2),
            "margin_pct": round(gross_profit / revenue_now * 100, 1) if revenue_now else 0,
            "revenue_change_pct": round(
                (revenue_now - revenue_prev) / revenue_prev * 100, 1
            ) if revenue_prev else 0,
        },
        "inventory": {
            "value": round(inventory_value, 2),
            "sku_count": len(products),
            "low_stock_count": low_stock,
            "out_of_stock_count": out_of_stock,
        },
    }


@router.get("/sales-trend")
def sales_trend(
    days: int = 30,
    user: User = Depends(require("report:read")),
    db: Session = Depends(get_db),
):
    """Daily revenue series, zero-filled (FR-RPT-01)."""
    start = (datetime.now(timezone.utc) - timedelta(days=days)).date()
    rows = (
        scoped(db, SalesOrder, user.tenant_id)
        .filter(SalesOrder.order_date >= start)
        .with_entities(
            func.date(SalesOrder.order_date),
            func.sum(SalesOrder.total),
            func.count(SalesOrder.id),
        )
        .group_by(func.date(SalesOrder.order_date))
        .all()
    )
    by_day = {str(d): (float(t or 0), int(c or 0)) for d, t, c in rows}
    return [
        {
            "date": str(start + timedelta(days=i)),
            "revenue": round(by_day.get(str(start + timedelta(days=i)), (0, 0))[0], 2),
            "orders": by_day.get(str(start + timedelta(days=i)), (0, 0))[1],
        }
        for i in range(days)
    ]


@router.get("/top-products")
def top_products(
    days: int = 30,
    limit: int = 10,
    user: User = Depends(require("report:read")),
    db: Session = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        scoped(db, SalesOrderLine, user.tenant_id)
        .join(SalesOrder, SalesOrderLine.order_id == SalesOrder.id)
        .join(Product, SalesOrderLine.product_id == Product.id)
        .filter(SalesOrder.order_date >= since)
        .with_entities(
            Product.id, Product.sku, Product.name,
            func.sum(SalesOrderLine.quantity),
            func.sum(SalesOrderLine.line_total),
            func.sum(
                (SalesOrderLine.unit_price - SalesOrderLine.unit_cost) * SalesOrderLine.quantity
            ),
        )
        .group_by(Product.id, Product.sku, Product.name)
        .order_by(func.sum(SalesOrderLine.line_total).desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "product_id": pid, "sku": sku, "name": name,
            "units_sold": float(units or 0),
            "revenue": round(float(rev or 0), 2),
            "gross_profit": round(float(gp or 0), 2),
        }
        for pid, sku, name, units, rev, gp in rows
    ]


@router.get("/gst-summary")
def gst_summary(
    days: int = 30,
    user: User = Depends(require("finance:read")),
    db: Session = Depends(get_db),
):
    """Output tax grouped by rate, for GSTR-1 preparation (FR-FIN-01)."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        scoped(db, SalesOrderLine, user.tenant_id)
        .join(SalesOrder, SalesOrderLine.order_id == SalesOrder.id)
        .filter(SalesOrder.order_date >= since)
        .with_entities(
            SalesOrderLine.gst_rate,
            func.sum(SalesOrderLine.line_total - SalesOrderLine.tax_amount),
            func.sum(SalesOrderLine.tax_amount),
        )
        .group_by(SalesOrderLine.gst_rate)
        .all()
    )
    slabs = [
        {
            "gst_rate": float(rate or 0),
            "taxable_value": round(float(taxable or 0), 2),
            "tax_amount": round(float(tax or 0), 2),
        }
        for rate, taxable, tax in rows
    ]
    return {
        "period_days": days,
        "slabs": slabs,
        "total_taxable": round(sum(s["taxable_value"] for s in slabs), 2),
        "total_tax": round(sum(s["tax_amount"] for s in slabs), 2),
    }
