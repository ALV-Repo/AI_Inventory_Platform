"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr } from "../../lib/api";

const PERIODS = [7, 30, 90];

export default function ReportsPage() {
  const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
  const [topProducts, setTopProducts] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);

  // Custom date range (MD change #2)
  const [showCustom, setShowCustom] = useState(false);
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [customTo, setCustomTo] = useState(() => new Date().toISOString().split("T")[0]);
  const [dateMode, setDateMode] = useState<"preset" | "custom">("preset");
  const [appliedLabel, setAppliedLabel] = useState("30d");

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

  function applyCustomRange() {
    if (!customFrom || !customTo || customFrom > customTo) return;
    const d = Math.max(1, Math.round((new Date(customTo).getTime() - new Date(customFrom).getTime()) / 86400000));
    setDays(d);
    setDateMode("custom");
    setAppliedLabel(`${customFrom} → ${customTo}`);
    setShowCustom(false);
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
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <p className="mt-1 text-sm text-gray-500">Business performance overview</p>
          </div>

          {/* Date controls (MD change #2) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
              {PERIODS.map(d => (
                <button key={d} onClick={() => { setDays(d); setDateMode("preset"); setAppliedLabel(`${d}d`); setShowCustom(false); }}
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${dateMode === "preset" && days === d ? "bg-[#12213a] text-white" : "text-gray-500 hover:bg-gray-100"}`}>
                  {d}d
                </button>
              ))}
            </div>
            <button onClick={() => setShowCustom(!showCustom)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${dateMode === "custom" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}>
              📅 {dateMode === "custom" ? appliedLabel : "Custom"}
            </button>
            <button onClick={load} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-50">Refresh</button>
          </div>
        </div>

        {/* Custom date picker */}
        {showCustom && (
          <div className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">From</label>
              <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-gray-500 mb-1">To</label>
              <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500" />
            </div>
            <button onClick={applyCustomRange} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">Apply</button>
            <button onClick={() => setShowCustom(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        )}

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading reports...</p>
          </div>
        ) : (
          <div className="space-y-6">
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

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-lg font-semibold text-gray-900">Top Products — {appliedLabel}</h2>
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

            {s && s.inventory.low_stock_count > 0 && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
                <p className="font-semibold text-orange-800">⚠ {s.inventory.low_stock_count} products are below reorder level</p>
                <p className="mt-1 text-sm text-orange-700">Go to Inventory → filter by Low Stock to view them.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
