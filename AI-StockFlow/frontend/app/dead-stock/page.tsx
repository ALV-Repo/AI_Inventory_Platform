"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr } from "../../lib/api";

type DeadStockItem = {
  product_id: number;
  sku: string;
  name: string;
  on_hand: number;
  capital_locked: number;
  velocity_class: string;
  days_since_last_sale: number | null;
  recommended_action: string;
  suggested_discount_pct: number;
};

type DeadStockReport = {
  summary: Record<string, number>;
  total_locked_in_slow_or_dead: number;
  items: DeadStockItem[];
};

const velocityColor = (v: string) => ({
  dead: "bg-red-50 text-red-700 border-red-200",
  slow: "bg-orange-50 text-orange-700 border-orange-200",
  fast: "bg-green-50 text-green-700 border-green-200",
}[v.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function DeadStockPage() {
  const [report, setReport] = useState<DeadStockReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.deadStock();
      setReport(data as DeadStockReport);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load dead stock report.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = (report?.items ?? []).filter(item => {
    const matchFilter = filter === "all" || item.velocity_class.toLowerCase() === filter;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dead Stock Detection</h1>
            <p className="mt-1 text-sm text-gray-500">AI-powered velocity classification — capital locked in slow and dead inventory</p>
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Analysing inventory velocity...</p>
          </div>
        ) : report && (
          <>
            {/* Summary cards */}
            <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="text-sm text-red-600">Capital Locked</p>
                <p className="mt-2 text-2xl font-bold text-red-700">{inr(report.total_locked_in_slow_or_dead)}</p>
                <p className="mt-1 text-xs text-red-500">In slow + dead stock</p>
              </div>
              {Object.entries(report.summary).map(([key, count]) => (
                <div key={key} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500 capitalize">{key.replace("_", " ")}</p>
                  <p className="mt-2 text-2xl font-bold text-gray-900">{count}</p>
                  <p className="mt-1 text-xs text-gray-400">SKUs</p>
                </div>
              ))}
            </div>

            {/* Filter + search */}
            <div className="mb-5 flex gap-3 flex-wrap">
              {["all", "dead", "slow", "fast"].map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${filter === f ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                  {f}
                </button>
              ))}
              <input
                type="text"
                placeholder="Search SKU or product..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Inventory Velocity Report</h2>
                <span className="text-sm text-gray-500">{filtered.length} items</span>
              </div>
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {["SKU", "Product", "Stock", "Days Since Sale", "Capital Locked", "Velocity", "Recommended Action", "Discount"].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400">No items found</td></tr>
                  ) : filtered.map(item => (
                    <tr key={item.product_id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-mono text-sm text-gray-600">{item.sku}</td>
                      <td className="px-5 py-3 font-medium text-gray-900">{item.name}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{item.on_hand}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{item.days_since_last_sale ?? "Never sold"}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-red-600">{inr(item.capital_locked)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium capitalize ${velocityColor(item.velocity_class)}`}>
                          {item.velocity_class}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{item.recommended_action}</td>
                      <td className="px-5 py-3 text-sm font-semibold text-orange-600">
                        {item.suggested_discount_pct > 0 ? `${item.suggested_discount_pct}%` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
