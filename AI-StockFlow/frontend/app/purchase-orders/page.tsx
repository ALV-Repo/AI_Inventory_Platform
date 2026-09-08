"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr, fmtDate } from "../../lib/api";

type PO = {
  id: number;
  po_number: string;
  supplier_id: number;
  warehouse_id: number;
  status: string;
  order_date: string;
  expected_date: string;
  subtotal: number;
  tax_amount: number;
  total: number;
};

const statusColor = (s: string) => ({
  draft: "bg-gray-100 text-gray-700",
  approved: "bg-green-50 text-green-700",
  partial: "bg-yellow-50 text-yellow-700",
  received: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-700",
}[s.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<PO | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.purchaseOrders.list();
      setOrders(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load purchase orders.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => orders.filter(o => {
    const matchSearch = o.po_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  }), [orders, search, statusFilter]);

  const summary = {
    total: orders.length,
    draft: orders.filter(o => o.status === "draft").length,
    approved: orders.filter(o => o.status === "approved").length,
    received: orders.filter(o => o.status === "received").length,
    totalValue: orders.reduce((a, o) => a + (o.total || 0), 0),
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Purchase Orders</h1>
            <p className="mt-1 text-sm text-gray-500">Manage procurement and goods receipts</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">
          {[
            { label: "Total Orders", value: summary.total, color: "text-gray-900" },
            { label: "Draft", value: summary.draft, color: "text-gray-600" },
            { label: "Approved", value: summary.approved, color: "text-green-600" },
            { label: "Received", value: summary.received, color: "text-blue-600" },
            { label: "Total Value", value: inr(summary.totalValue), color: "text-gray-900" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-xl font-bold ${c.color}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 flex gap-3">
          <input
            type="text"
            placeholder="Search by PO number..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            {["All", "Draft", "Approved", "Partial", "Received", "Cancelled"].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading purchase orders...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">📦</p>
              <p className="text-gray-500 text-sm">No purchase orders found</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["PO Number", "Supplier", "Order Date", "Expected", "Subtotal", "Tax", "Total", "Status", "Action"].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-semibold text-blue-600">{o.po_number}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">Supplier #{o.supplier_id}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{fmtDate(o.order_date)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{o.expected_date ? fmtDate(o.expected_date) : "-"}</td>
                    <td className="px-5 py-4 text-sm text-gray-900">{inr(o.subtotal)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{inr(o.tax_amount)}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{inr(o.total)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelected(o)} className="text-sm font-medium text-blue-600 hover:text-blue-800">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && filtered.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-3 text-sm text-gray-500">
              Showing {filtered.length} of {orders.length} orders
            </div>
          )}
        </div>

        {/* Detail modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setSelected(null)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selected.po_number}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ["Supplier", `Supplier #${selected.supplier_id}`],
                  ["Warehouse", `Warehouse #${selected.warehouse_id}`],
                  ["Order Date", fmtDate(selected.order_date)],
                  ["Expected Date", selected.expected_date ? fmtDate(selected.expected_date) : "-"],
                  ["Subtotal", inr(selected.subtotal)],
                  ["Tax Amount", inr(selected.tax_amount)],
                  ["Total", inr(selected.total)],
                  ["Status", selected.status],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelected(null)} className="mt-5 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Close</button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
