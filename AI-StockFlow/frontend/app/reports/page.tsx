"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr } from "../../lib/api";

export default function ReportsPage() {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [topProducts, setTopProducts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);

  useEffect(() => { load(); }, [days]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [s, tp] = await Promise.all([
        api.summary(days),
        api.topProducts(days, 10),
      ]);
      setSummary(s as Record<string, unknown>);
      setTopProducts(tp);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }

  type SummaryData = {
    today: { revenue: number; orders: number };
    period: { revenue: number; orders: number; gross_profit: number; margin_pct: number };
    inventory: { value: number; sku_count: number; low_stock_count: number };
  };

  const s = summary as SummaryData | null;

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="mt-1 text-sm text-gray-500">Business performance overview</p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${days === d ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                {d}d
              </button>
            ))}
            <button onClick={load} className="rounded-lg border border-gray-300 px-4 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading reports...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* KPI Summary */}
            {s && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: "Revenue", value: inr(s.period.revenue), sub: `Today: ${inr(s.today.revenue)}` },
                  { label: "Orders", value: s.period.orders, sub: `Today: ${s.today.orders}` },
                  { label: "Gross Profit", value: inr(s.period.gross_profit), sub: `Margin: ${s.period.margin_pct?.toFixed(1)}%` },
                  { label: "Stock Value", value: inr(s.inventory.value), sub: `${s.inventory.sku_count} SKUs` },
                ].map(c => (
                  <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">{c.label}</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{c.value}</p>
                    <p className="mt-1 text-xs text-gray-400">{c.sub}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Top Products */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Top Products — Last {days} days</h2>
              </div>
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {["#", "SKU", "Product", "Units Sold", "Revenue", "Gross Profit"].map(h => (
                      <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(topProducts as Array<Record<string, unknown>>).map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-bold text-gray-400">{i + 1}</td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">{String(p.sku)}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{String(p.name)}</td>
                      <td className="px-6 py-4 text-sm text-gray-700">{String(p.units_sold)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{inr(p.revenue as number)}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-green-600">{inr(p.gross_profit as number)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Inventory alerts */}
            {s && s.inventory.low_stock_count > 0 && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
                <p className="font-semibold text-orange-800">
                  ⚠ {s.inventory.low_stock_count} products are below reorder level
                </p>
                <p className="mt-1 text-sm text-orange-700">Go to Inventory → filter by Low Stock to view them.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
