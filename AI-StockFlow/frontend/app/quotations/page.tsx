"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr, fmtDate } from "../../lib/api";

type Quotation = {
  id: number;
  quote_number: string;
  customer_id?: number;
  status: string;
  valid_until?: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  created_at: string;
};

const statusColor = (s: string) => ({
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-50 text-blue-700",
  accepted: "bg-green-50 text-green-700",
  expired: "bg-red-50 text-red-700",
  converted: "bg-purple-50 text-purple-700",
}[s?.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [converting, setConverting] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.request<Quotation[]>("/sales/quotations");
      setQuotations(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load quotations.");
    } finally {
      setLoading(false);
    }
  }

  async function convertToOrder(id: number) {
    try {
      setConverting(id);
      await api.request(`/sales/quotations/${id}/convert`, { method: "POST" });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to convert quotation.");
    } finally {
      setConverting(null);
    }
  }

  const filtered = useMemo(() => quotations.filter(q => {
    const matchSearch = q.quote_number.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || q.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  }), [quotations, search, statusFilter]);

  const totalValue = quotations.reduce((a, q) => a + (q.total || 0), 0);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
            <p className="mt-1 text-sm text-gray-500">Sales quotations and proposals</p>
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: "Total Quotations", value: quotations.length },
            { label: "Draft", value: quotations.filter(q => q.status === "draft").length, color: "text-gray-600" },
            { label: "Accepted", value: quotations.filter(q => q.status === "accepted").length, color: "text-green-600" },
            { label: "Total Value", value: inr(totalValue), color: "text-blue-600" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-xl font-bold ${c.color ?? "text-gray-900"}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 flex gap-3">
          <input type="text" placeholder="Search by quote number..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none">
            {["All", "Draft", "Sent", "Accepted", "Expired", "Converted"].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading quotations...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-sm text-gray-500">No quotations found</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Quote #", "Customer", "Valid Until", "Subtotal", "Tax", "Total", "Status", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(q => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-blue-600">{q.quote_number}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{q.customer_id ? `Customer #${q.customer_id}` : "Walk-in"}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{q.valid_until ? fmtDate(q.valid_until) : "-"}</td>
                    <td className="px-5 py-4 text-sm text-gray-900">{inr(q.subtotal)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{inr(q.tax_amount)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{inr(q.total)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(q.status)}`}>
                        {q.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {q.status === "accepted" && (
                        <button onClick={() => convertToOrder(q.id)} disabled={converting === q.id}
                          className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                          {converting === q.id ? "..." : "Convert to Order"}
                        </button>
                      )}
                    </td>
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
