"""Pure business logic — no ORM, no I/O, fully unit-testable.

Everything here is deterministic and side-effect free so it can be verified
without a database (NFR-14: >=70% coverage on core business logic).
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import date, timedelta
from statistics import mean, pstdev

# ---------------------------------------------------------------- GST (FR-FIN-01)


@dataclass(frozen=True)
class TaxBreakup:
    taxable_value: float
    cgst: float
    sgst: float
    igst: float
    total_tax: float
    grand_total: float


def compute_gst(
    *,
    unit_price: float,
    quantity: float,
    gst_rate: float,
    discount: float = 0.0,
    interstate: bool = False,
    price_includes_tax: bool = False,
) -> TaxBreakup:
    """Compute CGST/SGST (intra-state) or IGST (inter-state) for one line.

    Place of supply decides the split: same state -> CGST+SGST at half rate each;
    different state -> IGST at the full rate.
    """
    if quantity < 0:
        raise ValueError("Quantity cannot be negative.")
    if not 0 <= gst_rate <= 100:
        raise ValueError("GST rate must be between 0 and 100.")

    gross = unit_price * quantity - discount
    if gross < 0:
        raise ValueError("Discount cannot exceed the line value.")

    if price_includes_tax:
        taxable = gross / (1 + gst_rate / 100)
    else:
        taxable = gross

    total_tax = round(taxable * gst_rate / 100, 2)
    taxable = round(taxable, 2)

    if interstate:
        cgst = sgst = 0.0
        igst = total_tax
    else:
        cgst = sgst = round(total_tax / 2, 2)
        igst = 0.0
        total_tax = round(cgst + sgst, 2)

    return TaxBreakup(
        taxable_value=taxable,
        cgst=cgst,
        sgst=sgst,
        igst=igst,
        total_tax=total_tax,
        grand_total=round(taxable + total_tax, 2),
    )


# ------------------------------------------------- Weighted average cost (FR-FIN-03)


def weighted_average_cost(
    *, current_qty: float, current_cost: float, incoming_qty: float, incoming_cost: float
) -> float:
    """New moving-average unit cost after a receipt."""
    total_qty = current_qty + incoming_qty
    if total_qty <= 0:
        return round(incoming_cost, 4)
    value = current_qty * current_cost + incoming_qty * incoming_cost
    return round(value / total_qty, 4)


# ------------------------------------------------------ Demand forecast (FR-AI-FOR)


@dataclass(frozen=True)
class Forecast:
    predicted_demand: float
    confidence: float
    method: str
    daily_rate: float


def forecast_demand(
    daily_sales: list[float], *, horizon_days: int = 30, seasonality_index: float = 1.0
) -> Forecast:
    """Forecast demand from a daily sales history.

    Uses a weighted moving average with linear trend when history is sufficient,
    and falls back to a clearly labelled heuristic when it is not (FR-AI-FOR-04).
    Confidence falls as the history shortens or grows more volatile (FR-AI-FOR-02).
    """
    if horizon_days <= 0:
        raise ValueError("Horizon must be at least one day.")

    history = [max(0.0, v) for v in daily_sales]

    if not history:
        return Forecast(0.0, 0.0, "heuristic:no-history", 0.0)

    if len(history) < 14:
        rate = mean(history)
        demand = rate * horizon_days * seasonality_index
        return Forecast(round(demand, 2), 0.25, "heuristic:sparse-history", round(rate, 3))

    # Recency-weighted average: the most recent window carries more weight.
    recent = history[-14:]
    older = history[-56:-14] or history[:-14] or recent
    rate = 0.65 * mean(recent) + 0.35 * mean(older)

    # Linear trend between the two windows, damped to avoid runaway projections.
    trend = (mean(recent) - mean(older)) / 14 if older else 0.0
    projected = rate + trend * (horizon_days / 2) * 0.5
    rate = max(0.0, projected)

    demand = rate * horizon_days * seasonality_index

    # Confidence: more history and steadier demand -> higher confidence.
    volatility = pstdev(recent) / mean(recent) if mean(recent) > 0 else 1.0
    history_factor = min(1.0, len(history) / 180)
    confidence = max(0.1, min(0.95, (1 - min(volatility, 1.0)) * 0.7 + history_factor * 0.3))

    return Forecast(round(demand, 2), round(confidence, 2), "weighted-trend-v1", round(rate, 3))


# ------------------------------------------------------- Reorder / auto PO (FR-AI-PUR)


@dataclass(frozen=True)
class ReorderSuggestion:
    should_reorder: bool
    suggested_qty: float
    days_of_cover: float
    reasoning: dict


def suggest_reorder(
    *,
    on_hand: float,
    reserved: float,
    daily_demand: float,
    lead_time_days: int,
    safety_stock: float,
    reorder_multiple: int = 1,
    review_period_days: int = 30,
) -> ReorderSuggestion:
    """Classic reorder-point model, exposed with its reasoning (FR-AI-PUR-03).

    reorder_point = demand over lead time + safety stock
    order_qty     = demand over (lead time + review period) + safety stock - available
    """
    available = on_hand - reserved
    demand_in_lead_time = daily_demand * lead_time_days
    reorder_point = demand_in_lead_time + safety_stock
    days_of_cover = available / daily_demand if daily_demand > 0 else float("inf")

    target = daily_demand * (lead_time_days + review_period_days) + safety_stock
    raw_qty = max(0.0, target - available)

    if reorder_multiple > 1 and raw_qty > 0:
        raw_qty = -(-raw_qty // reorder_multiple) * reorder_multiple  # round up

    should = available <= reorder_point and raw_qty > 0

    return ReorderSuggestion(
        should_reorder=should,
        suggested_qty=round(raw_qty, 2) if should else 0.0,
        days_of_cover=round(days_of_cover, 1) if days_of_cover != float("inf") else -1,
        reasoning={
            "available_stock": round(available, 2),
            "daily_demand": round(daily_demand, 3),
            "lead_time_days": lead_time_days,
            "safety_stock": safety_stock,
            "reorder_point": round(reorder_point, 2),
            "target_stock": round(target, 2),
            "rule": "order when available <= demand over lead time + safety stock",
        },
    )


# ---------------------------------------------------- Dead stock detection (FR-AI-DSD)

VELOCITY_CLASSES = ("fast_moving", "slow_moving", "non_moving", "overstocked")


@dataclass(frozen=True)
class StockClassification:
    velocity_class: str
    days_since_last_sale: int
    capital_locked: float
    recommended_action: str
    suggested_discount_pct: int


def classify_stock(
    *,
    on_hand: float,
    unit_cost: float,
    units_sold_90d: float,
    days_since_last_sale: int,
    daily_demand: float,
    slow_threshold_days: int = 45,
    dead_threshold_days: int = 90,
    overstock_cover_days: int = 180,
) -> StockClassification:
    """Classify a SKU by movement and quantify the capital tied up in it."""
    capital = round(on_hand * unit_cost, 2)
    cover_days = on_hand / daily_demand if daily_demand > 0 else float("inf")

    if days_since_last_sale >= dead_threshold_days or units_sold_90d == 0:
        return StockClassification(
            "non_moving", days_since_last_sale, capital,
            "Clear through discount or bundle; stop reordering.", 30,
        )
    if cover_days > overstock_cover_days:
        return StockClassification(
            "overstocked", days_since_last_sale, capital,
            "Pause purchasing and consider transferring to a higher-demand store.", 15,
        )
    if days_since_last_sale >= slow_threshold_days:
        return StockClassification(
            "slow_moving", days_since_last_sale, capital,
            "Promote or reprice; review before the next purchase cycle.", 10,
        )
    return StockClassification(
        "fast_moving", days_since_last_sale, capital, "Keep stocked; monitor reorder point.", 0,
    )


# -------------------------------------------------- Price recommendation (FR-AI-PRC)


def recommend_price(
    *,
    cost_price: float,
    current_price: float,
    target_margin_pct: float,
    velocity_class: str,
    days_of_cover: float,
) -> dict:
    """Suggest a selling price. Never auto-applied — the caller must confirm."""
    if cost_price <= 0:
        raise ValueError("Cost price must be greater than zero.")

    base = cost_price / (1 - target_margin_pct / 100) if target_margin_pct < 100 else cost_price * 2

    adjustment = 0.0
    if velocity_class == "non_moving":
        adjustment = -0.20
    elif velocity_class == "overstocked":
        adjustment = -0.10
    elif velocity_class == "fast_moving" and days_of_cover < 14:
        adjustment = 0.05

    suggested = round(base * (1 + adjustment), 2)
    floor = round(cost_price * 1.02, 2)
    suggested = max(suggested, floor)

    margin = round((suggested - cost_price) / suggested * 100, 1) if suggested else 0.0
    return {
        "current_price": round(current_price, 2),
        "suggested_price": suggested,
        "change_pct": round((suggested - current_price) / current_price * 100, 1)
        if current_price
        else 0.0,
        "resulting_margin_pct": margin,
        "floor_price": floor,
        "reasoning": {
            "cost_price": cost_price,
            "target_margin_pct": target_margin_pct,
            "velocity_class": velocity_class,
            "velocity_adjustment_pct": round(adjustment * 100, 1),
        },
        "requires_approval": True,
    }


# ------------------------------------------------- Business health score (FR-AI-BHS)


def business_health_score(
    *,
    stockout_rate: float,        # 0..1, share of SKUs out of stock
    dead_stock_ratio: float,     # 0..1, dead stock value / total stock value
    revenue_growth_pct: float,   # period over period
    receivables_overdue_ratio: float,  # 0..1
    supplier_on_time_rate: float,      # 0..1
    customer_repeat_rate: float,       # 0..1
) -> dict:
    """Composite 0-100 score with a per-component breakdown (FR-AI-BHS-01)."""
    inventory = max(0.0, 100 - stockout_rate * 100 - dead_stock_ratio * 60)
    sales = max(0.0, min(100.0, 60 + revenue_growth_pct * 2))
    cash_flow = max(0.0, 100 - receivables_overdue_ratio * 120)
    supplier = supplier_on_time_rate * 100
    customer = min(100.0, customer_repeat_rate * 140)

    components = {
        "inventory_health": round(inventory, 1),
        "sales_health": round(sales, 1),
        "cash_flow": round(cash_flow, 1),
        "supplier_score": round(supplier, 1),
        "customer_growth": round(customer, 1),
    }
    weights = {
        "inventory_health": 0.30,
        "sales_health": 0.25,
        "cash_flow": 0.20,
        "supplier_score": 0.15,
        "customer_growth": 0.10,
    }
    overall = round(sum(components[k] * w for k, w in weights.items()), 1)

    weakest = min(components, key=components.get)
    advice = {
        "inventory_health": "Clear dead stock and fix reorder points for items that keep running out.",
        "sales_health": "Revenue is trending down. Check top categories and lapsed customers.",
        "cash_flow": "Chase overdue invoices; too much cash is sitting in receivables.",
        "supplier_score": "Suppliers are missing delivery dates. Review lead times or find alternates.",
        "customer_growth": "Few customers are coming back. Consider a follow-up campaign.",
    }[weakest]

    grade = "A" if overall >= 80 else "B" if overall >= 65 else "C" if overall >= 50 else "D"

    return {
        "overall_score": overall,
        "grade": grade,
        "components": components,
        "weakest_area": weakest,
        "recommendation": advice,
    }


# --------------------------------------------------------------- Aging (FR-FIN-05)


def aging_bucket(due_date: date, as_of: date | None = None) -> str:
    as_of = as_of or date.today()
    days = (as_of - due_date).days
    if days <= 0:
        return "current"
    if days <= 30:
        return "0-30"
    if days <= 60:
        return "31-60"
    if days <= 90:
        return "61-90"
    return "90+"


def next_period_start(today: date | None = None) -> date:
    today = today or date.today()
    return today + timedelta(days=1)
