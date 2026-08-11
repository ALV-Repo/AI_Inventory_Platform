"""Unit tests for core business logic (SRS §13 — every FR traceable to a test)."""
from datetime import date

import pytest

from app.services.logic import (
    aging_bucket,
    business_health_score,
    classify_stock,
    compute_gst,
    forecast_demand,
    recommend_price,
    suggest_reorder,
    weighted_average_cost,
)


# ------------------------------------------------------------------ FR-FIN-01
class TestGST:
    def test_intrastate_splits_into_cgst_and_sgst(self):
        t = compute_gst(unit_price=100, quantity=10, gst_rate=18)
        assert t.taxable_value == 1000.0
        assert t.cgst == 90.0 and t.sgst == 90.0
        assert t.igst == 0.0
        assert t.total_tax == 180.0
        assert t.grand_total == 1180.0

    def test_interstate_uses_igst_only(self):
        t = compute_gst(unit_price=100, quantity=10, gst_rate=18, interstate=True)
        assert t.igst == 180.0
        assert t.cgst == 0.0 and t.sgst == 0.0
        assert t.grand_total == 1180.0

    def test_discount_reduces_taxable_value(self):
        t = compute_gst(unit_price=100, quantity=10, gst_rate=18, discount=200)
        assert t.taxable_value == 800.0
        assert t.total_tax == 144.0

    def test_tax_inclusive_price_is_backed_out(self):
        t = compute_gst(unit_price=118, quantity=1, gst_rate=18, price_includes_tax=True)
        assert t.taxable_value == 100.0
        assert t.grand_total == 118.0

    def test_zero_rated_item(self):
        t = compute_gst(unit_price=50, quantity=4, gst_rate=0)
        assert t.total_tax == 0.0 and t.grand_total == 200.0

    def test_rejects_discount_above_line_value(self):
        with pytest.raises(ValueError):
            compute_gst(unit_price=10, quantity=1, gst_rate=18, discount=50)

    def test_rejects_invalid_rate(self):
        with pytest.raises(ValueError):
            compute_gst(unit_price=10, quantity=1, gst_rate=150)


# ------------------------------------------------------------------ FR-FIN-03
class TestWeightedAverageCost:
    def test_blends_old_and_new_cost(self):
        assert weighted_average_cost(
            current_qty=100, current_cost=10, incoming_qty=100, incoming_cost=20
        ) == 15.0

    def test_first_receipt_takes_incoming_cost(self):
        assert weighted_average_cost(
            current_qty=0, current_cost=0, incoming_qty=50, incoming_cost=12.5
        ) == 12.5

    def test_handles_zero_total_quantity(self):
        assert weighted_average_cost(
            current_qty=0, current_cost=0, incoming_qty=0, incoming_cost=9
        ) == 9.0


# ------------------------------------------------------------------ FR-AI-FOR
class TestForecast:
    def test_no_history_returns_zero_and_no_confidence(self):
        f = forecast_demand([])
        assert f.predicted_demand == 0.0
        assert f.confidence == 0.0
        assert f.method.startswith("heuristic")

    def test_sparse_history_is_labelled_heuristic(self):
        """FR-AI-FOR-04: fallbacks must be clearly labelled."""
        f = forecast_demand([2, 3, 2, 4, 3], horizon_days=30)
        assert f.method == "heuristic:sparse-history"
        assert f.confidence <= 0.25
        assert f.predicted_demand == pytest.approx(2.8 * 30, rel=0.01)

    def test_steady_demand_gives_high_confidence(self):
        f = forecast_demand([10] * 180, horizon_days=30)
        assert f.method == "weighted-trend-v1"
        assert f.confidence >= 0.85
        assert f.predicted_demand == pytest.approx(300, rel=0.05)

    def test_volatile_demand_lowers_confidence(self):
        steady = forecast_demand([10] * 60)
        spiky = forecast_demand([1, 30, 2, 25, 0, 40] * 10)
        assert spiky.confidence < steady.confidence

    def test_rising_trend_forecasts_above_flat_average(self):
        rising = list(range(1, 61))  # 1..60
        f = forecast_demand(rising, horizon_days=30)
        flat_avg = sum(rising[-14:]) / 14
        assert f.daily_rate > flat_avg * 0.9

    def test_seasonality_scales_the_forecast(self):
        base = forecast_demand([5] * 90, horizon_days=30)
        festival = forecast_demand([5] * 90, horizon_days=30, seasonality_index=2.0)
        assert festival.predicted_demand == pytest.approx(base.predicted_demand * 2, rel=0.01)

    def test_negative_sales_are_floored_at_zero(self):
        f = forecast_demand([-5, 10, 10], horizon_days=10)
        assert f.predicted_demand >= 0

    def test_rejects_bad_horizon(self):
        with pytest.raises(ValueError):
            forecast_demand([1, 2, 3], horizon_days=0)


# ------------------------------------------------------------------ FR-AI-PUR
class TestReorder:
    def test_orders_when_below_reorder_point(self):
        s = suggest_reorder(
            on_hand=20, reserved=5, daily_demand=3, lead_time_days=7, safety_stock=10
        )
        assert s.should_reorder is True
        # target = 3*(7+30)+10 = 121; available = 15 -> 106
        assert s.suggested_qty == 106.0
        assert s.reasoning["reorder_point"] == 31.0

    def test_does_not_order_when_well_stocked(self):
        s = suggest_reorder(
            on_hand=500, reserved=0, daily_demand=3, lead_time_days=7, safety_stock=10
        )
        assert s.should_reorder is False
        assert s.suggested_qty == 0.0

    def test_reserved_stock_is_excluded_from_available(self):
        """FR-INV-09: reserved units cannot be promised twice."""
        s = suggest_reorder(
            on_hand=40, reserved=35, daily_demand=2, lead_time_days=5, safety_stock=5
        )
        assert s.reasoning["available_stock"] == 5
        assert s.should_reorder is True

    def test_rounds_up_to_supplier_pack_size(self):
        s = suggest_reorder(
            on_hand=0, reserved=0, daily_demand=1, lead_time_days=5, safety_stock=2,
            reorder_multiple=12,
        )
        assert s.suggested_qty % 12 == 0

    def test_zero_demand_gives_infinite_cover(self):
        s = suggest_reorder(
            on_hand=10, reserved=0, daily_demand=0, lead_time_days=5, safety_stock=0
        )
        assert s.days_of_cover == -1
        assert s.should_reorder is False

    def test_reasoning_is_always_present(self):
        """FR-AI-PUR-03: every AI purchase suggestion shows its working."""
        s = suggest_reorder(
            on_hand=1, reserved=0, daily_demand=5, lead_time_days=3, safety_stock=10
        )
        for key in ("available_stock", "daily_demand", "lead_time_days", "reorder_point", "rule"):
            assert key in s.reasoning


# ------------------------------------------------------------------ FR-AI-DSD
class TestDeadStock:
    def test_no_sales_in_90_days_is_non_moving(self):
        c = classify_stock(
            on_hand=100, unit_cost=50, units_sold_90d=0,
            days_since_last_sale=120, daily_demand=0,
        )
        assert c.velocity_class == "non_moving"
        assert c.capital_locked == 5000.0
        assert c.suggested_discount_pct == 30

    def test_excess_cover_is_overstocked(self):
        c = classify_stock(
            on_hand=1000, unit_cost=10, units_sold_90d=90,
            days_since_last_sale=2, daily_demand=1,
        )
        assert c.velocity_class == "overstocked"

    def test_stale_but_selling_is_slow_moving(self):
        c = classify_stock(
            on_hand=30, unit_cost=20, units_sold_90d=5,
            days_since_last_sale=50, daily_demand=0.5,
        )
        assert c.velocity_class == "slow_moving"

    def test_healthy_item_is_fast_moving(self):
        c = classify_stock(
            on_hand=60, unit_cost=20, units_sold_90d=180,
            days_since_last_sale=1, daily_demand=2,
        )
        assert c.velocity_class == "fast_moving"
        assert c.suggested_discount_pct == 0


# ------------------------------------------------------------------ FR-AI-PRC
class TestPriceRecommendation:
    def test_hits_target_margin(self):
        r = recommend_price(
            cost_price=100, current_price=130, target_margin_pct=30,
            velocity_class="fast_moving", days_of_cover=60,
        )
        assert r["resulting_margin_pct"] == pytest.approx(30, abs=0.5)

    def test_dead_stock_is_discounted(self):
        r = recommend_price(
            cost_price=100, current_price=200, target_margin_pct=40,
            velocity_class="non_moving", days_of_cover=999,
        )
        assert r["suggested_price"] < 200

    def test_never_prices_below_cost(self):
        r = recommend_price(
            cost_price=100, current_price=101, target_margin_pct=1,
            velocity_class="non_moving", days_of_cover=999,
        )
        assert r["suggested_price"] >= 102.0

    def test_always_requires_approval(self):
        """FR-AI-PRC-02: price suggestions are never auto-applied."""
        r = recommend_price(
            cost_price=10, current_price=20, target_margin_pct=25,
            velocity_class="fast_moving", days_of_cover=10,
        )
        assert r["requires_approval"] is True

    def test_rejects_zero_cost(self):
        with pytest.raises(ValueError):
            recommend_price(
                cost_price=0, current_price=10, target_margin_pct=20,
                velocity_class="fast_moving", days_of_cover=10,
            )


# ------------------------------------------------------------------ FR-AI-BHS
class TestHealthScore:
    def test_healthy_business_scores_high(self):
        h = business_health_score(
            stockout_rate=0.01, dead_stock_ratio=0.03, revenue_growth_pct=12,
            receivables_overdue_ratio=0.05, supplier_on_time_rate=0.96,
            customer_repeat_rate=0.6,
        )
        assert h["overall_score"] >= 75
        assert h["grade"] in ("A", "B")

    def test_struggling_business_scores_low_and_names_weakest_area(self):
        h = business_health_score(
            stockout_rate=0.3, dead_stock_ratio=0.5, revenue_growth_pct=-20,
            receivables_overdue_ratio=0.6, supplier_on_time_rate=0.5,
            customer_repeat_rate=0.1,
        )
        assert h["overall_score"] < 50
        assert h["grade"] == "D"
        assert h["weakest_area"] in h["components"]
        assert h["recommendation"]

    def test_components_stay_within_bounds(self):
        h = business_health_score(
            stockout_rate=1.0, dead_stock_ratio=1.0, revenue_growth_pct=500,
            receivables_overdue_ratio=1.0, supplier_on_time_rate=1.0,
            customer_repeat_rate=1.0,
        )
        for value in h["components"].values():
            assert 0 <= value <= 100


# ------------------------------------------------------------------ FR-FIN-05
class TestAging:
    def test_buckets(self):
        as_of = date(2026, 8, 10)
        assert aging_bucket(date(2026, 9, 1), as_of) == "current"
        assert aging_bucket(date(2026, 8, 1), as_of) == "0-30"
        assert aging_bucket(date(2026, 6, 25), as_of) == "31-60"
        assert aging_bucket(date(2026, 5, 25), as_of) == "61-90"
        assert aging_bucket(date(2026, 1, 1), as_of) == "90+"
