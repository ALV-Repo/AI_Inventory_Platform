"""AI endpoints (SRS §4). All results are tenant-scoped and human-approved."""
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.database import get_db, scoped
from app.core.security import require
from app.models.entities import (
    AIRecommendation, AuditLog, ForecastResult, Product, PurchaseOrder,
    PurchaseOrderLine, SalesOrder, SalesOrderLine, StockItem, Supplier, User,
)
from app.services.copilot import answer_question
from app.services.logic import (
    business_health_score, classify_stock, forecast_demand, recommend_price, suggest_reorder,
)

router = APIRouter(prefix="/ai", tags=["AI"])


def _as_utc(dt: datetime | None) -> datetime | None:
    """Normalise DB datetimes: treat naive values as UTC, convert aware ones."""
    if dt is None:
        return None
    return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)


# ------------------------------------------------------------------ helpers
def _daily_sales(db: Session, tenant_id: int, product_id: int, days: int = 180) -> list[float]:
    """Daily sold quantity for one product, zero-filled across the window."""
    since = datetime.now(timezone.utc) - timedelta(days=days)
    rows = (
        scoped(db, SalesOrderLine, tenant_id)
        .join(SalesOrder, SalesOrderLine.order_id == SalesOrder.id)
        .filter(SalesOrderLine.product_id == product_id, SalesOrder.order_date >= since)
        .with_entities(func.date(SalesOrder.order_date), func.sum(SalesOrderLine.quantity))
        .group_by(func.date(SalesOrder.order_date))
        .all()
    )
    by_day = {str(d): float(q or 0) for d, q in rows}
    start = (datetime.now(timezone.utc) - timedelta(days=days)).date()
    return [by_day.get(str(start + timedelta(days=i)), 0.0) for i in range(days)]


def _stock_totals(db: Session, tenant_id: int, product_id: int) -> tuple[float, float, float]:
    row = (
        scoped(db, StockItem, tenant_id)
        .filter(StockItem.product_id == product_id)
        .with_entities(
            func.sum(StockItem.quantity),
            func.sum(StockItem.reserved_qty),
            func.avg(StockItem.avg_cost),
        )
        .first()
    )
    return float(row[0] or 0), float(row[1] or 0), float(row[2] or 0)


# ------------------------------------------------------------------ forecasting
@router.get("/forecast/{product_id}")
def product_forecast(
    product_id: int,
    horizon_days: int = Query(30, ge=1, le=365),
    seasonality_index: float = Query(1.0, ge=0.1, le=5.0),
    user: User = Depends(require("ai:read")),
    db: Session = Depends(get_db),
):
    """Demand forecast for one SKU (FR-AI-FOR-01)."""
    product = scoped(db, Product, user.tenant_id).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That product does not exist.")

    history = _daily_sales(db, user.tenant_id, product_id)
    f = forecast_demand(history, horizon_days=horizon_days, seasonality_index=seasonality_index)

    db.add(ForecastResult(
        tenant_id=user.tenant_id, product_id=product_id, period_start=date.today(),
        period_days=horizon_days, predicted_demand=f.predicted_demand,
        confidence=f.confidence, method=f.method,
    ))
    db.commit()

    return {
        "product_id": product_id,
        "sku": product.sku,
        "name": product.name,
        "horizon_days": horizon_days,
        "predicted_demand": f.predicted_demand,
        "daily_rate": f.daily_rate,
        "confidence": f.confidence,
        "method": f.method,
        "is_heuristic": f.method.startswith("heuristic"),  # FR-AI-FOR-04
    }


# ------------------------------------------------------------------ reorder
@router.get("/reorder-suggestions")
def reorder_suggestions(
    limit: int = Query(25, ge=1, le=100),
    user: User = Depends(require("ai:read")),
    db: Session = Depends(get_db),
):
    """Draft reorder proposals with full reasoning (FR-AI-PUR-01, FR-AI-PUR-03).

    Each proposal is persisted as a pending AIRecommendation so the approval
    endpoint has a durable record to act on (NFR-16 requires the decision trail).
    """
    products = scoped(db, Product, user.tenant_id).filter(Product.is_active.is_(True)).all()
    default_lead = (
        scoped(db, Supplier, user.tenant_id)
        .with_entities(func.avg(Supplier.lead_time_days))
        .scalar()
    ) or 7

    pending = {
        rec.product_id: rec
        for rec in scoped(db, AIRecommendation, user.tenant_id).filter(
            AIRecommendation.rec_type == "reorder",
            AIRecommendation.status == "pending",
        )
    }

    results = []
    for p in products:
        on_hand, reserved, avg_cost = _stock_totals(db, user.tenant_id, p.id)
        f = forecast_demand(_daily_sales(db, user.tenant_id, p.id), horizon_days=30)
        s = suggest_reorder(
            on_hand=on_hand, reserved=reserved, daily_demand=f.daily_rate,
            lead_time_days=int(default_lead), safety_stock=p.safety_stock,
        )
        if not s.should_reorder:
            continue

        payload = {
            "product_id": p.id,
            "suggested_qty": s.suggested_qty,
            "estimated_cost": round(s.suggested_qty * (avg_cost or p.cost_price), 2),
            "days_of_cover": s.days_of_cover,
        }
        rec = pending.get(p.id)
        if rec is None:
            rec = AIRecommendation(
                tenant_id=user.tenant_id, rec_type="reorder", product_id=p.id,
                payload=payload, reasoning=s.reasoning, status="pending",
            )
            db.add(rec)
            db.flush()
        else:
            rec.payload = payload           # keep the pending proposal current
            rec.reasoning = s.reasoning

        results.append({
            "recommendation_id": rec.id,
            "product_id": p.id, "sku": p.sku, "name": p.name,
            "on_hand": on_hand, "available": on_hand - reserved,
            "days_of_cover": s.days_of_cover,
            "suggested_qty": s.suggested_qty,
            "estimated_cost": payload["estimated_cost"],
            "forecast_confidence": f.confidence,
            "forecast_method": f.method,
            "reasoning": s.reasoning,
            "requires_approval": True,   # NFR-16
        })

    db.commit()
    results.sort(key=lambda r: r["days_of_cover"] if r["days_of_cover"] >= 0 else 9999)
    return results[:limit]


# ------------------------------------------------------------------ dead stock
@router.get("/dead-stock")
def dead_stock(
    user: User = Depends(require("ai:read")),
    db: Session = Depends(get_db),
):
    """Classify stock by movement and quantify locked capital (FR-AI-DSD-01)."""
    products = scoped(db, Product, user.tenant_id).filter(Product.is_active.is_(True)).all()
    since_90 = datetime.now(timezone.utc) - timedelta(days=90)

    summary = {"fast_moving": 0.0, "slow_moving": 0.0, "non_moving": 0.0, "overstocked": 0.0}
    items = []

    for p in products:
        on_hand, _, avg_cost = _stock_totals(db, user.tenant_id, p.id)
        if on_hand <= 0:
            continue

        sold_90 = (
            scoped(db, SalesOrderLine, user.tenant_id)
            .join(SalesOrder, SalesOrderLine.order_id == SalesOrder.id)
            .filter(SalesOrderLine.product_id == p.id, SalesOrder.order_date >= since_90)
            .with_entities(func.sum(SalesOrderLine.quantity))
            .scalar()
        ) or 0

        last_sale = _as_utc(
            scoped(db, SalesOrderLine, user.tenant_id)
            .join(SalesOrder, SalesOrderLine.order_id == SalesOrder.id)
            .filter(SalesOrderLine.product_id == p.id)
            .with_entities(func.max(SalesOrder.order_date))
            .scalar()
        )
        days_since = (
            (datetime.now(timezone.utc) - last_sale).days if last_sale else 999
        )

        c = classify_stock(
            on_hand=on_hand, unit_cost=avg_cost or p.cost_price,
            units_sold_90d=float(sold_90), days_since_last_sale=days_since,
            daily_demand=float(sold_90) / 90,
        )
        summary[c.velocity_class] += c.capital_locked

        if c.velocity_class != "fast_moving":
            items.append({
                "product_id": p.id, "sku": p.sku, "name": p.name,
                "on_hand": on_hand, "capital_locked": c.capital_locked,
                "velocity_class": c.velocity_class,
                "days_since_last_sale": days_since if last_sale else None,
                "recommended_action": c.recommended_action,
                "suggested_discount_pct": c.suggested_discount_pct,
            })

    items.sort(key=lambda i: i["capital_locked"], reverse=True)
    return {
        "summary": {k: round(v, 2) for k, v in summary.items()},
        "total_locked_in_slow_or_dead": round(
            summary["slow_moving"] + summary["non_moving"] + summary["overstocked"], 2
        ),
        "items": items,
    }


# ------------------------------------------------------------------ pricing
class PriceRequest(BaseModel):
    product_id: int
    target_margin_pct: float = Field(default=30, ge=0, lt=100)


@router.post("/price-recommendation")
def price_recommendation(
    body: PriceRequest,
    user: User = Depends(require("ai:read")),
    db: Session = Depends(get_db),
):
    """Suggest a price. Never applied automatically (FR-AI-PRC-02)."""
    p = scoped(db, Product, user.tenant_id).filter(Product.id == body.product_id).first()
    if not p:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That product does not exist.")

    on_hand, _, avg_cost = _stock_totals(db, user.tenant_id, p.id)
    f = forecast_demand(_daily_sales(db, user.tenant_id, p.id))
    cover = on_hand / f.daily_rate if f.daily_rate > 0 else 999

    result = recommend_price(
        cost_price=avg_cost or p.cost_price or 1,
        current_price=p.selling_price,
        target_margin_pct=body.target_margin_pct,
        velocity_class="fast_moving" if cover < 60 else "overstocked",
        days_of_cover=cover,
    )

    rec = AIRecommendation(
        tenant_id=user.tenant_id, rec_type="price", product_id=p.id,
        payload=result, reasoning=result["reasoning"], status="pending",
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    result["recommendation_id"] = rec.id
    return result


# ------------------------------------------------------------------ approvals
class DecisionIn(BaseModel):
    decision: str = Field(pattern="^(accepted|rejected)$")


@router.post("/recommendations/{rec_id}/decision")
def decide_recommendation(
    rec_id: int,
    body: DecisionIn,
    user: User = Depends(require("ai:read")),
    db: Session = Depends(get_db),
):
    """Record the human decision on an AI recommendation (NFR-16).

    Accepting a reorder recommendation drafts a real purchase order in `draft`
    status (FR-AI-PUR-01/02) — it still needs the normal PO approval to be sent.
    """
    rec = (
        scoped(db, AIRecommendation, user.tenant_id)
        .filter(AIRecommendation.id == rec_id)
        .first()
    )
    if not rec:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "That recommendation no longer exists.")
    if rec.status != "pending":
        raise HTTPException(status.HTTP_409_CONFLICT, f"Already {rec.status}.")

    rec.status = body.decision
    rec.acted_by = user.id
    rec.acted_at = datetime.now(timezone.utc)

    draft_po_id = None
    if body.decision == "accepted" and rec.rec_type == "reorder":
        payload = rec.payload or {}
        product = (
            scoped(db, Product, user.tenant_id)
            .filter(Product.id == rec.product_id)
            .first()
        )
        supplier = (
            scoped(db, Supplier, user.tenant_id)
            .filter(Supplier.is_active.is_(True))
            .order_by(Supplier.lead_time_days)
            .first()
        )
        if product and supplier and payload.get("suggested_qty"):
            po_count = scoped(db, PurchaseOrder, user.tenant_id).count()
            po = PurchaseOrder(
                tenant_id=user.tenant_id,
                po_number=f"PO-{datetime.now(timezone.utc).strftime('%Y%m')}-{po_count + 1:05d}",
                supplier_id=supplier.id,
                status="draft",
                created_by_ai=True,
                ai_reasoning=rec.reasoning,
                subtotal=payload.get("estimated_cost", 0),
                total=payload.get("estimated_cost", 0),
            )
            db.add(po)
            db.flush()
            db.add(PurchaseOrderLine(
                tenant_id=user.tenant_id, po_id=po.id, product_id=product.id,
                quantity=payload["suggested_qty"],
                unit_price=product.cost_price, gst_rate=product.gst_rate,
            ))
            draft_po_id = po.id

    db.add(AuditLog(
        tenant_id=user.tenant_id, user_id=user.id, action=f"ai.recommendation.{body.decision}",
        entity_type="ai_recommendation", entity_id=rec.id,
        details={"type": rec.rec_type, "draft_po_id": draft_po_id},
    ))
    db.commit()
    return {"id": rec.id, "status": rec.status, "draft_po_id": draft_po_id}


# ------------------------------------------------------------------ copilot
class CopilotQuestion(BaseModel):
    question: str = Field(min_length=3, max_length=500)


@router.post("/copilot")
def copilot(
    body: CopilotQuestion,
    user: User = Depends(require("ai:read")),
    db: Session = Depends(get_db),
):
    """Answer a business question from this tenant's data only (FR-AI-COP-01..03)."""
    return answer_question(db=db, tenant_id=user.tenant_id, role=user.role, question=body.question)


# ------------------------------------------------------------------ health score
@router.get("/health-score")
def health_score(
    user: User = Depends(require("ai:read")),
    db: Session = Depends(get_db),
):
    """Composite business health score (FR-AI-BHS-01)."""
    products = scoped(db, Product, user.tenant_id).filter(Product.is_active.is_(True)).all()
    total_products = len(products) or 1

    out_of_stock = sum(1 for p in products if _stock_totals(db, user.tenant_id, p.id)[0] <= 0)
    dead = dead_stock(user=user, db=db)
    total_value = sum(dead["summary"].values()) or 1

    now = datetime.now(timezone.utc)
    this_month = (
        scoped(db, SalesOrder, user.tenant_id)
        .filter(SalesOrder.order_date >= now - timedelta(days=30))
        .with_entities(func.sum(SalesOrder.total)).scalar()
    ) or 0
    prev_month = (
        scoped(db, SalesOrder, user.tenant_id)
        .filter(
            SalesOrder.order_date >= now - timedelta(days=60),
            SalesOrder.order_date < now - timedelta(days=30),
        )
        .with_entities(func.sum(SalesOrder.total)).scalar()
    ) or 0
    growth = ((this_month - prev_month) / prev_month * 100) if prev_month else 0.0

    on_time = (
        scoped(db, Supplier, user.tenant_id)
        .with_entities(func.avg(Supplier.on_time_rate)).scalar()
    ) or 0.9

    return business_health_score(
        stockout_rate=out_of_stock / total_products,
        dead_stock_ratio=(dead["summary"]["non_moving"] + dead["summary"]["slow_moving"]) / total_value,
        revenue_growth_pct=growth,
        receivables_overdue_ratio=0.1,
        supplier_on_time_rate=float(on_time),
        customer_repeat_rate=0.45,
    )
