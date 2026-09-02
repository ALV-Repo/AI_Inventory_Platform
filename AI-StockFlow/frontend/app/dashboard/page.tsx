"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import PageLayout from "../../components/layout/PageLayout";
import ReorderQueue from "../../components/dashboard/ReorderQueue";
import { HealthRing } from "../../components/HealthRing";

import useDashboard from "../../hooks/useDashboard";

type PeriodOption = {
  label: string;
  value: number;
};

const PERIODS: PeriodOption[] = [
  {
    label: "7 days",
    value: 7,
  },
  {
    label: "30 days",
    value: 30,
  },
  {
    label: "90 days",
    value: 90,
  },
];

function getNumber(
  value: unknown,
  fallback = 0
): number {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
}

function getString(
  value: unknown,
  fallback = ""
): string {
  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value;
  }

  return fallback;
}

function formatCurrency(
  value: number
): string {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;
}

function formatNumber(
  value: number
): string {
  return Number(
    value || 0
  ).toLocaleString("en-IN");
}

function formatPercent(
  value: number
): string {
  return `${getNumber(
    value
  ).toFixed(1)}%`;
}

function getProductName(
  item: Record<string, unknown>
): string {
  return getString(
    item.product_name ??
      item.name ??
      item.product,
    "Unknown Product"
  );
}

function getSku(
  item: Record<string, unknown>
): string {
  return getString(
    item.sku ??
      item.code,
    "—"
  );
}

function getDeadStockValue(
  item: Record<string, unknown>
): number {
  return getNumber(
    item.inventory_value ??
      item.capital ??
      item.value
  );
}

export default function DashboardPage() {
  const {
    summary,
    reorderSuggestions,
    deadStock,
    loading,
    error,
    period,
    setPeriod,
    refresh,
  } = useDashboard();

  const [
    showAllDeadStock,
    setShowAllDeadStock,
  ] = useState(false);

  const revenueToday =
    getNumber(
      summary?.revenue_today
    );

  const revenuePeriod =
    getNumber(
      summary?.revenue_30_days ??
        summary?.revenue_period
    );

  const grossMargin =
    getNumber(
      summary?.gross_margin
    );

  const grossProfit =
    getNumber(
      summary?.gross_profit
    );

  const stockValue =
    getNumber(
      summary?.stock_value
    );

  const totalSkus =
    getNumber(
      summary?.total_skus
    );

  const needsReorder =
    getNumber(
      summary?.needs_reorder
    );

  const outOfStock =
    getNumber(
      summary?.out_of_stock
    );

  const periodOrders =
    getNumber(
      summary?.orders_30_days ??
        summary?.period_orders ??
        summary?.orders
    );

  const visibleDeadStock =
    useMemo(() => {
      if (showAllDeadStock) {
        return deadStock;
      }

      return deadStock.slice(0, 5);
    }, [
      deadStock,
      showAllDeadStock,
    ]);

  /*
   * The dashboard API currently provides
   * summary values but not a revenue time-series.
   *
   * Do not display fake revenue values.
   */
  const hasRevenueData =
    revenuePeriod > 0 ||
    revenueToday > 0;

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f8fafc] px-6 py-7 text-slate-900">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-blue-500">
                AI StockFlow
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#12213a]">
                Dashboard
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                Your business performance,
                inventory health and AI
                insights in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={() => refresh()}
                disabled={loading}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading
                  ? "Refreshing..."
                  : "Refresh"}
              </button>

              <Link
                href="/inventory"
                className="rounded-lg bg-[#12213a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d3055]"
              >
                View Inventory
              </Link>

            </div>
          </div>

          {/* PERIOD SELECTOR */}

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

            <div>
              <p className="text-xs font-semibold text-[#12213a]">
                Business Overview
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Showing data for the
                selected period.
              </p>
            </div>

            <div className="flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">

              {PERIODS.map(
                (item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setPeriod(
                        item.value
                      )
                    }
                    disabled={loading}
                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold transition ${
                      period === item.value
                        ? "bg-[#12213a] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </button>
                )
              )}

            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">

              <div>
                <p className="text-xs font-semibold text-red-800">
                  Unable to load dashboard
                </p>

                <p className="mt-1 text-[10px] text-red-600">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() => refresh()}
                className="rounded-md bg-red-600 px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-red-700"
              >
                Retry
              </button>

            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-700">
              Loading dashboard data...
            </div>
          )}

          {/* KPI CARDS */}

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Revenue
              </p>

              <p className="mt-2 text-2xl font-bold text-[#12213a]">
                {formatCurrency(
                  revenuePeriod
                )}
              </p>

              <p className="mt-2 text-[10px] text-gray-500">
                Today:{" "}
                <span className="font-semibold text-gray-700">
                  {formatCurrency(
                    revenueToday
                  )}
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Gross Margin
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {grossMargin.toFixed(1)}%
              </p>

              <p className="mt-2 text-[10px] text-gray-500">
                Profit:{" "}
                <span className="font-semibold text-gray-700">
                  {formatCurrency(
                    grossProfit
                  )}
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Stock Value
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {formatCurrency(
                  stockValue
                )}
              </p>

              <p className="mt-2 text-[10px] text-gray-500">
                {formatNumber(
                  totalSkus
                )}{" "}
                SKUs
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Needs Attention
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-500">
                {formatNumber(
                  needsReorder
                )}
              </p>

              <p className="mt-2 text-[10px] text-gray-500">
                {formatNumber(
                  outOfStock
                )}{" "}
                out of stock
              </p>
            </div>

          </div>

                    {/* REVENUE OVERVIEW */}

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-sm font-bold text-[#12213a]">
                    Revenue Overview
                  </h2>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Selected period performance.
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-wide text-gray-400">
                    Revenue
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#12213a]">
                    {formatCurrency(
                      revenuePeriod
                    )}
                  </p>
                </div>

              </div>

              <div className="mt-6">

                {hasRevenueData ? (
                  <div className="rounded-lg border border-gray-100 bg-slate-50 p-6">

                    <div className="flex items-end justify-between gap-4">

                      <div>
                        <p className="text-[9px] uppercase tracking-wide text-gray-400">
                          Period Revenue
                        </p>

                        <p className="mt-2 text-3xl font-bold text-[#12213a]">
                          {formatCurrency(
                            revenuePeriod
                          )}
                        </p>

                        <p className="mt-2 text-[10px] text-gray-400">
                          Based on dashboard API data.
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wide text-gray-400">
                          Today
                        </p>

                        <p className="mt-2 text-lg font-bold text-blue-600">
                          {formatCurrency(
                            revenueToday
                          )}
                        </p>
                      </div>

                    </div>

                    <div className="mt-6 h-2 overflow-hidden rounded-full bg-gray-200">

                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{
                          width:
                            revenuePeriod > 0
                              ? `${Math.min(
                                  100,
                                  Math.max(
                                    0,
                                    (revenueToday /
                                      revenuePeriod) *
                                      100
                                  )
                                )}%`
                              : "0%",
                        }}
                      />

                    </div>

                    <div className="mt-2 flex justify-between text-[9px] text-gray-400">

                      <span>
                        Today / Period
                      </span>

                      <span>
                        {revenuePeriod > 0
                          ? `${Math.min(
                              100,
                              Math.max(
                                0,
                                (revenueToday /
                                  revenuePeriod) *
                                  100
                              )
                            ).toFixed(1)}%`
                          : "0.0%"}
                      </span>

                    </div>

                  </div>
                ) : (
                  <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50">

                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-500">
                        No revenue data available
                      </p>

                      <p className="mt-1 text-[9px] text-gray-400">
                        Revenue time-series data is not available from the dashboard API.
                      </p>
                    </div>

                  </div>
                )}

              </div>

              <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-[9px] text-slate-500">
                Revenue summary is loaded from
                the dashboard API.
              </div>

            </section>

            {/* ORDERS */}

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-sm font-bold text-[#12213a]">
                    Orders
                  </h2>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Orders recorded during
                    the selected period.
                  </p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 2l1.5 4h9L18 2" />
                    <path d="M4 6h16l-1 14H5L4 6Z" />
                    <path d="M9 10v6" />
                    <path d="M15 10v6" />
                  </svg>

                </div>

              </div>

              <div className="mt-8">

                <p className="text-4xl font-bold text-[#12213a]">
                  {formatNumber(
                    periodOrders
                  )}
                </p>

                <p className="mt-2 text-[10px] text-gray-400">
                  Total orders
                </p>

              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">

                <div className="rounded-lg bg-slate-50 p-3">

                  <p className="text-[9px] uppercase tracking-wide text-gray-400">
                    Revenue / Order
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#12213a]">
                    {formatCurrency(
                      periodOrders > 0
                        ? revenuePeriod /
                          periodOrders
                        : 0
                    )}
                  </p>

                </div>

                <div className="rounded-lg bg-slate-50 p-3">

                  <p className="text-[9px] uppercase tracking-wide text-gray-400">
                    Period
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#12213a]">
                    {period} days
                  </p>

                </div>

              </div>

            </section>

          </div>

          {/* INVENTORY HEALTH */}

          <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">

            {/* HEALTH */}

            <HealthRing
              score={summary?.health_score ?? null}
            />

            {/* STOCK VALUE */}

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-sm font-bold text-[#12213a]">
                    Stock Value
                  </h2>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Current inventory valuation.
                  </p>
                </div>

                <span className="rounded-lg bg-blue-50 px-2 py-1 text-[9px] font-semibold text-blue-600">
                  Inventory
                </span>

              </div>

              <div className="mt-7">

                <p className="text-3xl font-bold text-[#12213a]">
                  {formatCurrency(
                    stockValue
                  )}
                </p>

                <p className="mt-2 text-[10px] text-gray-400">
                  Across{" "}
                  <span className="font-semibold text-gray-600">
                    {formatNumber(
                      totalSkus
                    )}
                  </span>{" "}
                  SKUs
                </p>

              </div>

              <div className="mt-7 border-t border-gray-100 pt-4">

                <div className="flex items-center justify-between">

                  <span className="text-[10px] text-gray-500">
                    Out of stock
                  </span>

                  <span className="text-xs font-bold text-red-600">
                    {formatNumber(
                      outOfStock
                    )}
                  </span>

                </div>

                <div className="mt-3 flex items-center justify-between">

                  <span className="text-[10px] text-gray-500">
                    Needs reorder
                  </span>

                  <span className="text-xs font-bold text-orange-600">
                    {formatNumber(
                      needsReorder
                    )}
                  </span>

                </div>

              </div>

            </section>

            {/* PROFITABILITY */}

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <h2 className="text-sm font-bold text-[#12213a]">
                    Profitability
                  </h2>

                  <p className="mt-1 text-[10px] text-gray-400">
                    Selected-period performance.
                  </p>
                </div>

                <span className="rounded-lg bg-green-50 px-2 py-1 text-[9px] font-semibold text-green-700">
                  {period}d
                </span>

              </div>

              <div className="mt-7">

                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(
                    grossProfit
                  )}
                </p>

                <p className="mt-2 text-[10px] text-gray-400">
                  Gross profit
                </p>

              </div>

              <div className="mt-7 border-t border-gray-100 pt-4">

                <div className="flex items-center justify-between">

                  <span className="text-[10px] text-gray-500">
                    Gross margin
                  </span>

                  <span className="text-xs font-bold text-green-600">
                    {formatPercent(
                      grossMargin
                    )}
                  </span>

                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">

                  <div
                    className="h-full rounded-full bg-green-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          grossMargin
                        )
                      )}%`,
                    }}
                  />

                </div>

              </div>

            </section>

          </div>

                    {/* REORDER QUEUE */}

          <div className="mb-6">

            <ReorderQueue
              items={
                reorderSuggestions
              }
              onDecision={async (
                _item,
                decision
              ) => {
                if (
                  decision ===
                    "approve" ||
                  decision ===
                    "skip"
                ) {
                  await refresh();
                }
              }}
            />

          </div>

          {/* DEAD STOCK */}

          <section className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">

              <div>
                <h2 className="text-sm font-bold text-[#12213a]">
                  Dead Stock
                </h2>

                <p className="mt-1 text-[10px] text-gray-400">
                  Inventory with limited movement.
                </p>
              </div>

              <Link
                href="/inventory/dead-stock"
                className="text-[10px] font-semibold text-blue-600 hover:underline"
              >
                View Report
              </Link>

            </div>

            <div className="p-4">

              {visibleDeadStock.length === 0 ? (

                <div className="rounded-lg bg-green-50 px-4 py-6 text-center">

                  <p className="text-xs font-semibold text-green-700">
                    No dead stock detected
                  </p>

                  <p className="mt-1 text-[9px] text-green-600">
                    Inventory movement looks healthy.
                  </p>

                </div>

              ) : (

                <div className="space-y-2">

                  {visibleDeadStock.map(
                    (
                      rawItem,
                      index
                    ) => {

                      const item =
                        rawItem as Record<
                          string,
                          unknown
                        >;

                      const name =
                        getProductName(
                          item
                        );

                      const sku =
                        getSku(item);

                      const value =
                        getDeadStockValue(
                          item
                        );

                      return (
                        <div
                          key={`${sku}-${index}`}
                          className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-3"
                        >

                          <div className="min-w-0">

                            <p className="truncate text-xs font-semibold text-[#12213a]">
                              {name}
                            </p>

                            <p className="mt-1 text-[9px] text-gray-400">
                              SKU: {sku}
                            </p>

                          </div>

                          <div className="ml-4 text-right">

                            <p className="text-[8px] uppercase tracking-wide text-gray-400">
                              Inventory Value
                            </p>

                            <p className="mt-1 text-xs font-bold text-red-600">
                              {formatCurrency(
                                value
                              )}
                            </p>

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

              )}

              {deadStock.length > 5 && (
                <button
                  type="button"
                  onClick={() =>
                    setShowAllDeadStock(
                      (current) =>
                        !current
                    )
                  }
                  className="mt-3 w-full rounded-lg border border-gray-200 py-2 text-[10px] font-semibold text-gray-600 hover:bg-gray-50"
                >
                  {showAllDeadStock
                    ? "Show Less"
                    : `Show All (${deadStock.length})`}
                </button>
              )}

            </div>

          </section>

          {/* QUICK ACTIONS */}

          <section className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex items-start justify-between">

              <div>
                <h2 className="text-sm font-bold text-[#12213a]">
                  Quick Actions
                </h2>

                <p className="mt-1 text-[10px] text-gray-400">
                  Common inventory and business operations.
                </p>
              </div>

              <span className="rounded-lg bg-slate-50 px-2 py-1 text-[9px] font-semibold text-gray-500">
                Shortcuts
              </span>

            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

              {/* NEW SALE */}

              <Link
                href="/sales"
                className="group rounded-lg border border-gray-200 p-3 transition hover:border-blue-200 hover:bg-blue-50"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 3h18v18H3z" />
                    <path d="M7 7h10" />
                    <path d="M7 11h10" />
                    <path d="M7 15h6" />
                  </svg>

                </div>

                <p className="mt-3 text-[11px] font-semibold text-[#12213a]">
                  New Sale
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  Open POS
                </p>

              </Link>

              {/* INVENTORY */}

              <Link
                href="/inventory"
                className="group rounded-lg border border-gray-200 p-3 transition hover:border-green-200 hover:bg-green-50"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-green-600">

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 7l9-4 9 4-9 4-9-4Z" />
                    <path d="M3 7v10l9 4 9-4V7" />
                    <path d="M12 11v10" />
                  </svg>

                </div>

                <p className="mt-3 text-[11px] font-semibold text-[#12213a]">
                  Inventory
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  Manage stock
                </p>

              </Link>

              {/* PURCHASE ORDERS */}

              <Link
                href="/purchase-orders"
                className="group rounded-lg border border-gray-200 p-3 transition hover:border-purple-200 hover:bg-purple-50"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 2h12v20H6z" />
                    <path d="M9 6h6" />
                    <path d="M9 10h6" />
                    <path d="M9 14h4" />
                  </svg>

                </div>

                <p className="mt-3 text-[11px] font-semibold text-[#12213a]">
                  Purchase Orders
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  Manage suppliers
                </p>

              </Link>

              {/* REPORTS */}

              <Link
                href="/reports"
                className="group rounded-lg border border-gray-200 p-3 transition hover:border-orange-200 hover:bg-orange-50"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600">

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 19V5" />
                    <path d="M4 19h17" />
                    <path d="M8 16v-5" />
                    <path d="M12 16V8" />
                    <path d="M16 16v-9" />
                  </svg>

                </div>

                <p className="mt-3 text-[11px] font-semibold text-[#12213a]">
                  Reports
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  Business reports
                </p>

              </Link>

              {/* CUSTOMERS */}

              <Link
                href="/customers"
                className="group rounded-lg border border-gray-200 p-3 transition hover:border-pink-200 hover:bg-pink-50"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-50 text-pink-600">

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle
                      cx="9"
                      cy="8"
                      r="3"
                    />

                    <path d="M3 21a6 6 0 0 1 12 0" />

                    <path d="M16 11a3 3 0 1 0 0-6" />

                    <path d="M16 14a5 5 0 0 1 5 5" />
                  </svg>

                </div>

                <p className="mt-3 text-[11px] font-semibold text-[#12213a]">
                  Customers
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  Customer management
                </p>

              </Link>

              {/* FINANCE */}

              <Link
                href="/finance"
                className="group rounded-lg border border-gray-200 p-3 transition hover:border-emerald-200 hover:bg-emerald-50"
              >

                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">

                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 6h18v15H3z" />
                    <path d="M7 3h10v3H7z" />
                    <path d="M7 11h10" />
                    <path d="M7 15h6" />
                  </svg>

                </div>

                <p className="mt-3 text-[11px] font-semibold text-[#12213a]">
                  Finance
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  Financial overview
                </p>

              </Link>

            </div>

          </section>

                    {/* DASHBOARD SUMMARY */}

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-sm font-bold text-[#12213a]">
                  Dashboard Summary
                </h2>

                <p className="mt-1 text-[10px] text-gray-400">
                  Key operational indicators from the current dashboard data.
                </p>
              </div>

              <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-[9px] font-semibold text-gray-500">
                {period} day period
              </span>

            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">

                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                  Revenue
                </p>

                <p className="mt-2 text-lg font-bold text-[#12213a]">
                  {formatCurrency(
                    revenuePeriod
                  )}
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  Current period
                </p>

              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">

                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                  Gross Profit
                </p>

                <p className="mt-2 text-lg font-bold text-green-600">
                  {formatCurrency(
                    grossProfit
                  )}
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  Margin{" "}
                  {grossMargin.toFixed(
                    1
                  )}
                  %
                </p>

              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">

                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                  Inventory
                </p>

                <p className="mt-2 text-lg font-bold text-blue-600">
                  {formatCurrency(
                    stockValue
                  )}
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  {formatNumber(
                    totalSkus
                  )}{" "}
                  SKUs
                </p>

              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">

                <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                  Orders
                </p>

                <p className="mt-2 text-lg font-bold text-purple-600">
                  {formatNumber(
                    periodOrders
                  )}
                </p>

                <p className="mt-1 text-[9px] text-gray-400">
                  Current period
                </p>

              </div>

            </div>

          </section>

          {/* FOOTER NOTE */}

          <div className="mt-5 flex flex-col gap-2 rounded-lg border border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

            <p className="text-[9px] text-gray-400">
              Dashboard information is displayed from the available frontend API data.
            </p>

            <button
              type="button"
              onClick={() => refresh()}
              disabled={loading}
              className="self-start rounded-md px-2 py-1 text-[9px] font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50 sm:self-auto"
            >
              {loading
                ? "Updating..."
                : "Update Dashboard"}
            </button>

          </div>

        </div>
      </main>
    </PageLayout>
  );
}