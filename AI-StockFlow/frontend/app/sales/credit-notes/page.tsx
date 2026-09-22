"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr, fmtDate } from "../../../lib/api";

type SalesReturn = {
  id: number;
  return_number: string;
  sales_order_id: number;
  customer_id?: number;
  return_date: string;
  reason: string;
  refund_amount: number;
  tax_amount: number;
  total_amount: number;
  status: string;
  created_at: string;
};

type SalesOrder = { id: number; order_number: string; customer_id?: number };

const statusColor = (s: string) => ({
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
}[s?.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function SalesCreditNotesPage() {
  const [returns, setReturns] = useState<SalesReturn[]>([]);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState<number | null>(null);
  const [form, setForm] = useState({
    sales_order_id: "",
    reason: "",
    product_id: "",
    quantity: "",
    unit_price: "",
    gst_rate: "18",
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [ret, ords] = await Promise.all([
        api.request<SalesReturn[]>("/sales/returns"),
        api.sales(),
      ]);
      setReturns(ret);
      setOrders(ords as SalesOrder[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load credit notes.");
    } finally {
      setLoading(false);
    }
  }

  async function createReturn() {
    if (!form.sales_order_id || !form.product_id || !form.quantity) return;
    try {
      setSaving(true);
      await api.request("/sales/returns", {
        method: "POST",
        body: JSON.stringify({
          sales_order_id: Number(form.sales_order_id),
          reason: form.reason,
          lines: [{
            product_id: Number(form.product_id),
            quantity: Number(form.quantity),
            unit_price: Number(form.unit_price || 0),
            gst_rate: Number(form.gst_rate || 18),
          }],
        }),
      });
      setShowCreate(false);
      setForm({ sales_order_id: "", reason: "", product_id: "", quantity: "", unit_price: "", gst_rate: "18" });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create credit note.");
    } finally {
      setSaving(false);
    }
  }

  async function approveReturn(id: number) {
    try {
      setApproving(id);
      await api.request(`/sales/returns/${id}/approve`, { method: "POST" });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to approve.");
    } finally {
      setApproving(null);
    }
  }

  const totalRefund = returns.reduce((a, r) => a + (r.total_amount || 0), 0);
  const pending = returns.filter(r => r.status === "pending").length;

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Credit Notes / Sales Returns</h1>
            <p className="mt-1 text-sm text-gray-500">Manage sales returns and customer refunds</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            + New Credit Note
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: "Total Returns", value: returns.length },
            { label: "Pending Approval", value: pending, color: "text-yellow-600" },
            { label: "Total Refund Value", value: inr(totalRefund), color: "text-red-600" },
            { label: "Approved", value: returns.filter(r => r.status === "approved").length, color: "text-green-600" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-xl font-bold ${c.color ?? "text-gray-900"}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading credit notes...</p>
            </div>
          ) : returns.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-sm text-gray-500">No credit notes yet</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Return #", "Sales Order", "Customer", "Reason", "Refund", "Tax", "Total", "Status", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {returns.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-sm font-bold text-blue-600">{r.return_number}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">SO-{r.sales_order_id}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{r.customer_id ? `#${r.customer_id}` : "Walk-in"}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 max-w-[120px] truncate">{r.reason || "-"}</td>
                    <td className="px-5 py-4 text-sm text-gray-900">{inr(r.refund_amount)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{inr(r.tax_amount)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-red-600">{inr(r.total_amount)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(r.status)}`}>{r.status}</span>
                    </td>
                    <td className="px-5 py-4">
                      {r.status === "pending" && (
                        <button onClick={() => approveReturn(r.id)} disabled={approving === r.id}
                          className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                          {approving === r.id ? "..." : "Approve"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">New Credit Note</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Sales Order *</label>
                  <select value={form.sales_order_id} onChange={e => setForm(f => ({ ...f, sales_order_id: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option value="">Select sales order...</option>
                    {orders.map(o => <option key={o.id} value={o.id}>{(o as unknown as Record<string, string>).order_number ?? `SO-${o.id}`}</option>)}
                  </select>
                </div>
                {[
                  { label: "Product ID *", key: "product_id", type: "number" },
                  { label: "Return Quantity *", key: "quantity", type: "number" },
                  { label: "Unit Price (₹)", key: "unit_price", type: "number" },
                  { label: "GST Rate (%)", key: "gst_rate", type: "number" },
                  { label: "Reason", key: "reason", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                    <input type={type} value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={createReturn} disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Creating..." : "Create Credit Note"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
