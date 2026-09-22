"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr } from "../../../lib/api";

type Product = { id: number; sku: string; name: string; category?: string };

export default function StockAdjustmentPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    product_id: "",
    warehouse_id: "1",
    quantity: "",
    reason_code: "manual_adjustment",
  });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [prods, movs] = await Promise.all([
        api.products(),
        api.request<unknown[]>("/inventory/movements"),
      ]);
      setProducts(prods as Product[]);
      setMovements(movs);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  async function submitAdjustment() {
    if (!form.product_id || !form.quantity) return;
    try {
      setSaving(true);
      setError("");
      await api.adjustStock({
        product_id: Number(form.product_id),
        warehouse_id: Number(form.warehouse_id),
        quantity: Number(form.quantity),
        reason_code: form.reason_code,
      });
      setSuccess("Stock adjustment applied successfully.");
      setForm({ product_id: "", warehouse_id: "1", quantity: "", reason_code: "manual_adjustment" });
      await loadData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Adjustment failed.");
    } finally {
      setSaving(false);
    }
  }

  const REASON_CODES = [
    { value: "manual_adjustment", label: "Manual Adjustment" },
    { value: "damage", label: "Damage / Write-off" },
    { value: "theft", label: "Theft / Loss" },
    { value: "cycle_count_variance", label: "Cycle Count Variance" },
    { value: "return", label: "Customer Return" },
    { value: "opening_stock", label: "Opening Stock" },
  ];

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Stock Adjustment</h1>
          <p className="mt-1 text-sm text-gray-500">Manually adjust stock levels with audit trail</p>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{success}</div>}

        {/* Adjustment Form */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">New Adjustment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Product *</label>
              <select value={form.product_id} onChange={e => setForm(f => ({ ...f, product_id: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                <option value="">Select product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Reason *</label>
              <select value={form.reason_code} onChange={e => setForm(f => ({ ...f, reason_code: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                {REASON_CODES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Quantity (+ to add, - to reduce) *</label>
              <input type="number" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="e.g. 10 or -5"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Warehouse ID</label>
              <input type="number" value={form.warehouse_id} onChange={e => setForm(f => ({ ...f, warehouse_id: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
            </div>
          </div>
          <button onClick={submitAdjustment} disabled={saving || !form.product_id || !form.quantity}
            className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Applying..." : "Apply Adjustment"}
          </button>
        </div>

        {/* Movement History */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="font-semibold text-gray-900">Recent Stock Movements</h2>
          </div>
          {loading ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Product", "Type", "Quantity", "Unit Cost", "Reason", "Date"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(movements as Array<Record<string, unknown>>).slice(0, 20).map((m, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm text-gray-900">Product #{String(m.product_id)}</td>
                    <td className="px-6 py-3 text-sm capitalize text-gray-600">{String(m.movement_type).replace("_", " ")}</td>
                    <td className={`px-6 py-3 text-sm font-semibold ${Number(m.quantity) >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {Number(m.quantity) >= 0 ? "+" : ""}{String(m.quantity)}
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{inr(m.unit_cost as number)}</td>
                    <td className="px-6 py-3 text-sm text-gray-600 capitalize">{String(m.reason_code ?? "-").replace("_", " ")}</td>
                    <td className="px-6 py-3 text-sm text-gray-500">{String(m.created_at ?? "-").split("T")[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
