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
    """Compute CGST/SGST or IGST for one sales line."""

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

    total_tax = round(
        taxable * gst_rate / 100,
        2,
    )

    taxable = round(
        taxable,
        2,
    )

    if interstate:
        cgst = 0.0
        sgst = 0.0
        igst = total_tax
    else:
        cgst = round(
            total_tax / 2,
            2,
        )
        sgst = round(
            total_tax / 2,
            2,
        )
        igst = 0.0

        total_tax = round(
            cgst + sgst,
            2,
        )

    return TaxBreakup(
        taxable_value=taxable,
        cgst=cgst,
        sgst=sgst,
        igst=igst,
        total_tax=total_tax,
        grand_total=round(
            taxable + total_tax,
            2,
        ),
    )


# ------------------------------------------------- Weighted average cost (FR-FIN-03)


def weighted_average_cost(
    *,
    current_qty: float,
    current_cost: float,
    incoming_qty: float,
    incoming_cost: float,
) -> float:
    """New moving-average unit cost after a receipt."""

    total_qty = current_qty + incoming_qty

    if total_qty <= 0:
        return round(
            incoming_cost,
            4,
        )

    value = (
        current_qty * current_cost
        + incoming_qty * incoming_cost
    )

    return round(
        value / total_qty,
        4,
    )


# ------------------------------------------------------ Demand forecast (FR-AI-FOR)


@dataclass(frozen=True)
class Forecast:
    predicted_demand: float
    confidence: float
    method: str
    daily_rate: float


def forecast_demand(
    daily_sales: list[float],
    *,
    horizon_days: int = 30,
    seasonality_index: float = 1.0,
) -> Forecast:
    """
    Robust demand forecast using:

    1. Cleaned historical daily sales
    2. IQR-based outlier limiting
    3. Recent / medium / long-term demand windows
    4. Weighted baseline
    5. Recent trend adjustment
    6. Seasonality adjustment
    7. History + stability based confidence

    Keeps the existing Forecast return type and API contract.
    """

    # ---------------------------------------------------------
    # 1. Validate parameters
    # ---------------------------------------------------------

    if horizon_days <= 0:
        raise ValueError(
            "Horizon must be at least one day."
        )

    if not 0.1 <= seasonality_index <= 5:
        raise ValueError(
            "Seasonality index must be between 0.1 and 5."
        )

    # ---------------------------------------------------------
    # 2. Clean sales history
    # ---------------------------------------------------------

    history = [
        max(0.0, float(value))
        for value in daily_sales
        if value is not None
    ]

    # ---------------------------------------------------------
    # 3. No history
    # ---------------------------------------------------------

    if not history:
        return Forecast(
            0.0,
            0.0,
            "heuristic:no-history",
            0.0,
        )

    # ---------------------------------------------------------
    # 4. Sparse history
    # ---------------------------------------------------------

    if len(history) < 14:
        rate = mean(history)

        demand = (
            rate
            * horizon_days
            * seasonality_index
        )

        return Forecast(
            round(demand, 2),
            0.25,
            "heuristic:sparse-history",
            round(rate, 3),
        )

    # ---------------------------------------------------------
    # 5. IQR-based outlier handling
    # ---------------------------------------------------------

    sorted_history = sorted(history)

    q1_index = int(
        len(sorted_history) * 0.25
    )

    q3_index = int(
        len(sorted_history) * 0.75
    )

    q1 = sorted_history[
        min(
            q1_index,
            len(sorted_history) - 1,
        )
    ]

    q3 = sorted_history[
        min(
            q3_index,
            len(sorted_history) - 1,
        )
    ]

    iqr = q3 - q1

    lower_bound = max(
        0.0,
        q1 - 1.5 * iqr,
    )

    upper_bound = q3 + 1.5 * iqr

    cleaned_history = [
        min(
            max(value, lower_bound),
            upper_bound,
        )
        for value in history
    ]

    # ---------------------------------------------------------
    # 6. Multiple demand windows
    # ---------------------------------------------------------

    recent = cleaned_history[
        -min(14, len(cleaned_history)):
    ]

    medium = cleaned_history[
        -min(30, len(cleaned_history)):
    ]

    long_term = cleaned_history[
        -min(60, len(cleaned_history)):
    ]

    recent_avg = mean(recent)
    medium_avg = mean(medium)
    long_avg = mean(long_term)

    # ---------------------------------------------------------
    # 7. Weighted baseline
    #
    # Recent demand gets the highest weight.
    # ---------------------------------------------------------

    baseline = (
        0.50 * recent_avg
        + 0.30 * medium_avg
        + 0.20 * long_avg
    )

    # ---------------------------------------------------------
    # 8. Recent trend
    # ---------------------------------------------------------

    trend = 0.0

    if len(recent) >= 6:
        midpoint = len(recent) // 2

        first_half = recent[:midpoint]
        second_half = recent[midpoint:]

        first_avg = mean(first_half)
        second_avg = mean(second_half)

        if first_avg > 0:
            trend = (
                (second_avg - first_avg)
                / first_avg
            )

    # ---------------------------------------------------------
    # 9. Limit and damp trend
    # ---------------------------------------------------------

    trend = max(
        -0.30,
        min(0.30, trend),
    )

    trend_adjustment = (
        1.0 + trend * 0.35
    )

    daily_rate = (
        baseline
        * trend_adjustment
    )

    # ---------------------------------------------------------
    # 10. Apply seasonality
    # ---------------------------------------------------------

    daily_rate *= seasonality_index

    daily_rate = max(
        0.0,
        daily_rate,
    )

    predicted_demand = (
        daily_rate
        * horizon_days
    )

    # ---------------------------------------------------------
    # 11. Confidence
    # ---------------------------------------------------------

    history_confidence = min(
        1.0,
        len(history) / 90,
    )

    if recent_avg > 0:
        deviations = [
            abs(value - recent_avg)
            / recent_avg
            for value in recent
        ]

        volatility = (
            sum(deviations)
            / len(deviations)
        )

        stability = max(
            0.0,
            min(
                1.0,
                1.0 - volatility,
            ),
        )
    else:
        stability = 0.0

    confidence = (
        0.60 * history_confidence
        + 0.40 * stability
    )

    # ---------------------------------------------------------
    # 12. Return forecast
    #
    # Keep weighted-trend-v1 because existing tests
    # expect this method name.
    # ---------------------------------------------------------

    return Forecast(
        round(predicted_demand, 2),
        round(confidence, 2),
        "weighted-trend-v1",
        round(daily_rate, 3),
    )


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
    """Classic reorder-point model with reasoning."""

    available = on_hand - reserved

    demand_in_lead_time = (
        daily_demand * lead_time_days
    )

    reorder_point = (
        demand_in_lead_time
        + safety_stock
    )

    days_of_cover = (
        available / daily_demand
        if daily_demand > 0
        else float("inf")
    )

    target = (
        daily_demand
        * (
            lead_time_days
            + review_period_days
        )
        + safety_stock
    )

    raw_qty = max(
        0.0,
        target - available,
    )

    if reorder_multiple > 1 and raw_qty > 0:
        raw_qty = (
            -(-raw_qty // reorder_multiple)
            * reorder_multiple
        )

    should = (
        available <= reorder_point
        and raw_qty > 0
    )

    return ReorderSuggestion(
        should_reorder=should,
        suggested_qty=(
            round(raw_qty, 2)
            if should
            else 0.0
        ),
        days_of_cover=(
            round(days_of_cover, 1)
            if days_of_cover != float("inf")
            else -1
        ),
        reasoning={
            "available_stock": round(
                available,
                2,
            ),
            "daily_demand": round(
                daily_demand,
                3,
            ),
            "lead_time_days": lead_time_days,
            "safety_stock": safety_stock,
            "reorder_point": round(
                reorder_point,
                2,
            ),
            "target_stock": round(
                target,
                2,
            ),
            "rule": (
                "order when available <= "
                "demand over lead time + safety stock"
            ),
        },
    )


# ---------------------------------------------------- Dead stock detection (FR-AI-DSD)


VELOCITY_CLASSES = (
    "fast_moving",
    "slow_moving",
    "non_moving",
    "overstocked",
)


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
    """Classify a SKU by movement and quantify capital tied up."""

    capital = round(
        on_hand * unit_cost,
        2,
    )

    cover_days = (
        on_hand / daily_demand
        if daily_demand > 0
        else float("inf")
    )

    if (
        days_since_last_sale >= dead_threshold_days
        or units_sold_90d == 0
    ):
        return StockClassification(
            "non_moving",
            days_since_last_sale,
            capital,
            "Clear through discount or bundle; stop reordering.",
            30,
        )

    if cover_days > overstock_cover_days:
        return StockClassification(
            "overstocked",
            days_since_last_sale,
            capital,
            "Pause purchasing and consider transferring to a higher-demand store.",
            15,
        )

    if days_since_last_sale >= slow_threshold_days:
        return StockClassification(
            "slow_moving",
            days_since_last_sale,
            capital,
            "Promote or reprice; review before the next purchase cycle.",
            10,
        )

    return StockClassification(
        "fast_moving",
        days_since_last_sale,
        capital,
        "Keep stocked; monitor reorder point.",
        0,
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
    """Suggest a selling price. Never auto-applied."""

    if cost_price <= 0:
        raise ValueError(
            "Cost price must be greater than zero."
        )

    if target_margin_pct < 100:
        base = (
            cost_price
            / (1 - target_margin_pct / 100)
        )
    else:
        base = cost_price * 2

    adjustment = 0.0

    if velocity_class == "non_moving":
        adjustment = -0.20

    elif velocity_class == "overstocked":
        adjustment = -0.10

    elif (
        velocity_class == "fast_moving"
        and days_of_cover < 14
    ):
        adjustment = 0.05

    suggested = round(
        base * (1 + adjustment),
        2,
    )

    floor = round(
        cost_price * 1.02,
        2,
    )

    suggested = max(
        suggested,
        floor,
    )

    margin = (
        round(
            (suggested - cost_price)
            / suggested
            * 100,
            1,
        )
        if suggested
        else 0.0
    )

    return {
        "current_price": round(
            current_price,
            2,
        ),
        "suggested_price": suggested,
        "change_pct": (
            round(
                (suggested - current_price)
                / current_price
                * 100,
                1,
            )
            if current_price
            else 0.0
        ),
        "resulting_margin_pct": margin,
        "floor_price": floor,
        "reasoning": {
            "cost_price": cost_price,
            "target_margin_pct": target_margin_pct,
            "velocity_class": velocity_class,
            "velocity_adjustment_pct": round(
                adjustment * 100,
                1,
            ),
        },
        "requires_approval": True,
    }


# ------------------------------------------------- Business health score (FR-AI-BHS)


def business_health_score(
    *,
    stockout_rate: float,
    dead_stock_ratio: float,
    revenue_growth_pct: float,
    receivables_overdue_ratio: float,
    supplier_on_time_rate: float,
    customer_repeat_rate: float,
) -> dict:
    """Composite 0-100 business health score."""

    inventory = max(
        0.0,
        100
        - stockout_rate * 100
        - dead_stock_ratio * 60,
    )

    sales = max(
        0.0,
        min(
            100.0,
            60 + revenue_growth_pct * 2,
        ),
    )

    cash_flow = max(
        0.0,
        100
        - receivables_overdue_ratio * 120,
    )

    supplier = (
        supplier_on_time_rate * 100
    )

    customer = min(
        100.0,
        customer_repeat_rate * 140,
    )

    components = {
        "inventory_health": round(
            inventory,
            1,
        ),
        "sales_health": round(
            sales,
            1,
        ),
        "cash_flow": round(
            cash_flow,
            1,
        ),
        "supplier_score": round(
            supplier,
            1,
        ),
        "customer_growth": round(
            customer,
            1,
        ),
    }

    weights = {
        "inventory_health": 0.30,
        "sales_health": 0.25,
        "cash_flow": 0.20,
        "supplier_score": 0.15,
        "customer_growth": 0.10,
    }

    overall = round(
        sum(
            components[key] * weight
            for key, weight in weights.items()
        ),
        1,
    )

    weakest = min(
        components,
        key=components.get,
    )

    advice = {
        "inventory_health": (
            "Clear dead stock and fix reorder points "
            "for items that keep running out."
        ),
        "sales_health": (
            "Revenue is trending down. "
            "Check top categories and lapsed customers."
        ),
        "cash_flow": (
            "Chase overdue invoices; too much cash "
            "is sitting in receivables."
        ),
        "supplier_score": (
            "Suppliers are missing delivery dates. "
            "Review lead times or find alternates."
        ),
        "customer_growth": (
            "Few customers are coming back. "
            "Consider a follow-up campaign."
        ),
    }[weakest]

    grade = (
        "A"
        if overall >= 80
        else "B"
        if overall >= 65
        else "C"
        if overall >= 50
        else "D"
    )

    return {
        "overall_score": overall,
        "grade": grade,
        "components": components,
        "weakest_area": weakest,
        "recommendation": advice,
    }


# --------------------------------------------------------------- Aging (FR-FIN-05)


def aging_bucket(
    due_date: date,
    as_of: date | None = None,
) -> str:
    """Return the receivables aging bucket."""

    as_of = as_of or date.today()

    days = (
        as_of - due_date
    ).days

    if days <= 0:
        return "current"

    if days <= 30:
        return "0-30"

    if days <= 60:
        return "31-60"

    if days <= 90:
        return "61-90"

    return "90+"


def next_period_start(
    today: date | None = None,
) -> date:
    """Return tomorrow's date."""

    today = today or date.today()

    return today + timedelta(days=1)