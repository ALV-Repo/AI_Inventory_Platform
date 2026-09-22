"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr, fmtDate } from "../../../lib/api";

type SalesOrder = {
  id: number;
  order_number: string;
  customer_id?: number;
  channel: string;
  status: string;
  order_date: string;
  subtotal: number;
  discount: number;
  tax_amount: number;
  total: number;
  payment_mode: string;
};

const statusColor = (s: string) => ({
  confirmed: "bg-green-50 text-green-700",
  draft: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-50 text-red-700",
  processing: "bg-blue-50 text-blue-700",
  completed: "bg-purple-50 text-purple-700",
}[s?.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.sales();
      setOrders(data as SalesOrder[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load sales orders.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => orders.filter(o => {
    const matchSearch = o.order_number?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || o.status?.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  }), [orders, search, statusFilter]);

  const totalRevenue = orders.reduce((a, o) => a + (o.total || 0), 0);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
            <p className="mt-1 text-sm text-gray-500">All sales transactions</p>
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: "Total Orders", value: orders.length },
            { label: "Confirmed", value: orders.filter(o => o.status === "confirmed").length, color: "text-green-600" },
            { label: "Total Revenue", value: inr(totalRevenue), color: "text-blue-600" },
            { label: "Avg Order Value", value: inr(orders.length ? totalRevenue / orders.length : 0) },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-xl font-bold ${c.color ?? "text-gray-900"}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 flex gap-3">
          <input type="text" placeholder="Search by order number..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none">
            {["All", "Confirmed", "Draft", "Processing", "Completed", "Cancelled"].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading orders...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">🧾</p>
              <p className="text-sm text-gray-500">No orders found</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Order #", "Channel", "Date", "Subtotal", "Discount", "Tax", "Total", "Payment", "Status"].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-blue-600">{o.order_number}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 capitalize">{o.channel}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{fmtDate(o.order_date)}</td>
                    <td className="px-5 py-4 text-sm text-gray-900">{inr(o.subtotal)}</td>
                    <td className="px-5 py-4 text-sm text-red-600">{o.discount > 0 ? `-${inr(o.discount)}` : "-"}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{inr(o.tax_amount)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{inr(o.total)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 capitalize">{o.payment_mode}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(o.status)}`}>
                        {o.status}
                      </span>
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
      </div>
    </PageLayout>
  );
}
