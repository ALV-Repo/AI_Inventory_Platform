"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr, fmtDate } from "../../../lib/api";

type SalesOrder = {
  id: number;
  order_number: string;
  customer_id?: number;
  status: string;
  order_date: string;
  total: number;
  tax_amount: number;
  payment_mode: string;
  irn?: string;
  irn_status?: string;
};

const statusColor = (s: string) => ({
  confirmed: "bg-green-50 text-green-700",
  draft: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-50 text-red-700",
}[s?.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function SalesInvoicesPage() {
  const [invoices, setInvoices] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.sales();
      // Filter to only confirmed orders (these are the invoices)
      setInvoices((data as SalesOrder[]).filter(o => o.status === "confirmed"));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() =>
    invoices.filter(i => i.order_number?.toLowerCase().includes(search.toLowerCase())),
    [invoices, search]
  );

  const totalRevenue = invoices.reduce((a, i) => a + (i.total || 0), 0);
  const totalGst = invoices.reduce((a, i) => a + (i.tax_amount || 0), 0);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Invoices</h1>
            <p className="mt-1 text-sm text-gray-500">Confirmed sales orders / tax invoices</p>
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Invoices", value: invoices.length },
            { label: "Total Revenue", value: inr(totalRevenue), color: "text-blue-600" },
            { label: "Total GST", value: inr(totalGst), color: "text-orange-600" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-2xl font-bold ${c.color ?? "text-gray-900"}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5">
          <input type="text" placeholder="Search by invoice number..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading invoices...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Invoice #", "Date", "Customer", "Payment Mode", "GST", "Total", "IRN Status", "Status"].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400">No invoices found</td></tr>
                ) : filtered.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-sm font-semibold text-blue-600">{inv.order_number}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{fmtDate(inv.order_date)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{inv.customer_id ? `#${inv.customer_id}` : "Walk-in"}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 capitalize">{inv.payment_mode}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{inr(inv.tax_amount)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{inr(inv.total)}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{inv.irn_status ?? "Not Required"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(inv.status)}`}>
                        {inv.status}
                      </span>
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
