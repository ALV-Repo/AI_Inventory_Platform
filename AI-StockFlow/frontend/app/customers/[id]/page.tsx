"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr, fmtDate } from "../../../lib/api";

type Customer360 = {
  customer: {
    id: number;
    name: string;
    gstin?: string;
    phone?: string;
    email?: string;
    credit_limit: number;
    outstanding: number;
  };
  total_orders: number;
  total_revenue: number;
  avg_order_value: number;
  recent_orders: Array<{
    id: number;
    order_number: string;
    order_date: string;
    total: number;
    status: string;
  }>;
};

export default function CustomerDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [data, setData] = useState<Customer360 | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "orders">("overview");

  useEffect(() => { if (id) load(); }, [id]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const result = await api.crm.customer360(id);
      setData(result as Customer360);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load customer.");
    } finally {
      setLoading(false);
    }
  }

  const c = data?.customer;

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/customers" className="text-sm text-blue-600 hover:text-blue-800">← Customers</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-900">{loading ? "Loading..." : c?.name}</h1>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {!loading && data && (
          <>
            {/* KPI Cards */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              {[
                { label: "Total Orders", value: data.total_orders },
                { label: "Total Revenue", value: inr(data.total_revenue), color: "text-blue-600" },
                { label: "Avg Order Value", value: inr(data.avg_order_value) },
              ].map(kpi => (
                <div key={kpi.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className={`mt-2 text-xl font-bold ${kpi.color ?? "text-gray-900"}`}>{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1 w-fit">
              {(["overview", "orders"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`rounded-md px-5 py-2 text-sm font-medium capitalize transition ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                  {t}
                </button>
              ))}
            </div>

            {tab === "overview" && c && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Name", c.name],
                    ["GSTIN", c.gstin ?? "-"],
                    ["Phone", c.phone ?? "-"],
                    ["Email", c.email ?? "-"],
                    ["Credit Limit", inr(c.credit_limit)],
                    ["Outstanding", inr(c.outstanding)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between border-b pb-3">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "orders" && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                </div>
                <table className="w-full text-left">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      {["Order #", "Date", "Total", "Status"].map(h => (
                        <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.recent_orders.length === 0 ? (
                      <tr><td colSpan={4} className="py-8 text-center text-sm text-gray-400">No orders yet</td></tr>
                    ) : data.recent_orders.map(o => (
                      <tr key={o.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-mono text-sm text-blue-600">{o.order_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{fmtDate(o.order_date)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{inr(o.total)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize bg-green-50 text-green-700">{o.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
