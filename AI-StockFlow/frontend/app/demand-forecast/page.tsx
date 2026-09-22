"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr } from "../../lib/api";

type Product = { id: number; sku: string; name: string; category: string };
type ForecastResult = {
  product_id: number;
  sku: string;
  name: string;
  predicted_demand: number;
  confidence: number;
  method: string;
  period_days: number;
};

export default function DemandForecastPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [forecasts, setForecasts] = useState<ForecastResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [forecastLoading, setForecastLoading] = useState(false);
  const [error, setError] = useState("");
  const [horizon, setHorizon] = useState(30);
  const [search, setSearch] = useState("");

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await api.products();
      setProducts(data as Product[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }

  async function runForecasts() {
    if (products.length === 0) return;
    try {
      setForecastLoading(true);
      setError("");
      // Run forecasts for first 10 products to avoid rate limiting
      const targets = products.slice(0, 10);
      const results = await Promise.allSettled(
        targets.map(p => api.forecast(p.id, horizon))
      );
      const successful = results
        .map((r, i) => {
          if (r.status === "fulfilled") {
            const d = r.value as Record<string, unknown>;
            return {
              product_id: targets[i].id,
              sku: targets[i].sku,
              name: targets[i].name,
              predicted_demand: d.predicted_demand as number,
              confidence: d.confidence as number,
              method: d.method as string,
              period_days: d.period_days as number ?? horizon,
            };
          }
          return null;
        })
        .filter(Boolean) as ForecastResult[];
      setForecasts(successful);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to run forecasts.");
    } finally {
      setForecastLoading(false);
    }
  }

  const filtered = forecasts.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.sku.toLowerCase().includes(search.toLowerCase())
  );

  const confidenceColor = (c: number) =>
    c >= 0.8 ? "text-green-600" : c >= 0.6 ? "text-yellow-600" : "text-red-600";

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Demand Forecast</h1>
            <p className="mt-1 text-sm text-gray-500">AI-powered per-SKU demand prediction with confidence scoring</p>
          </div>
          <div className="flex gap-3">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setHorizon(d)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${horizon === d ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                {d} days
              </button>
            ))}
            <button
              onClick={runForecasts}
              disabled={forecastLoading || loading}
              className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {forecastLoading ? "Running..." : "Run Forecast"}
            </button>
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading products...</p>
          </div>
        ) : forecasts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-16 text-center shadow-sm">
            <p className="text-5xl mb-4">📈</p>
            <h2 className="text-xl font-semibold text-gray-900">Ready to forecast</h2>
            <p className="mt-2 text-sm text-gray-500">{products.length} products loaded. Select a horizon and click Run Forecast.</p>
            <button
              onClick={runForecasts}
              disabled={forecastLoading}
              className="mt-6 rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {forecastLoading ? "Running AI Forecast..." : "Run Forecast Now"}
            </button>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Products Forecasted</p>
                <p className="mt-2 text-2xl font-bold text-gray-900">{forecasts.length}</p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Avg Confidence</p>
                <p className="mt-2 text-2xl font-bold text-green-600">
                  {(forecasts.reduce((a, f) => a + f.confidence, 0) / forecasts.length * 100).toFixed(0)}%
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Forecast Horizon</p>
                <p className="mt-2 text-2xl font-bold text-blue-600">{horizon} days</p>
              </div>
            </div>

            {/* Search */}
            <div className="mb-5">
              <input
                type="text"
                placeholder="Search product or SKU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {["SKU", "Product", "Predicted Demand", "Confidence", "Method", "Per Day"].map(h => (
                      <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(f => (
                    <tr key={f.product_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">{f.sku}</td>
                      <td className="px-6 py-4 font-medium text-gray-900">{f.name}</td>
                      <td className="px-6 py-4 text-sm font-bold text-gray-900">{Math.round(f.predicted_demand)} units</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 rounded-full bg-gray-100">
                            <div className="h-2 rounded-full bg-blue-500" style={{ width: `${f.confidence * 100}%` }} />
                          </div>
                          <span className={`text-sm font-semibold ${confidenceColor(f.confidence)}`}>
                            {(f.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 capitalize">{f.method}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{(f.predicted_demand / horizon).toFixed(1)}/day</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-gray-200 px-6 py-3 text-xs text-gray-400">
                Forecast method label shown per SRS FR-AI-FOR-04. Human review required before purchasing.
              </div>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
