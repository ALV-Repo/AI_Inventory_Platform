"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr } from "../../lib/api";

type Customer = {
  id: number;
  name: string;
  gstin?: string;
  phone?: string;
  email?: string;
  credit_limit: number;
  outstanding: number;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Customer | null>(null);
  const [customer360, setCustomer360] = useState<Record<string, unknown> | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.customers.list();
      setCustomers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  }

  async function openCustomer(c: Customer) {
    setSelected(c);
    setCustomer360(null);
    try {
      const data = await api.crm.customer360(c.id);
      setCustomer360(data as Record<string, unknown>);
    } catch {}
  }

  const filtered = useMemo(() =>
    customers.filter(c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone ?? "").includes(search) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase())
    ), [customers, search]);

  const totalOutstanding = customers.reduce((a, c) => a + (c.outstanding || 0), 0);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
            <p className="mt-1 text-sm text-gray-500">Customer master with credit and purchase history</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Customers", value: customers.length },
            { label: "Total Outstanding", value: inr(totalOutstanding), color: "text-orange-600" },
            { label: "With Credit Limit", value: customers.filter(c => c.credit_limit > 0).length },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-2xl font-bold ${c.color ?? "text-gray-900"}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-5 flex gap-3">
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading customers...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Name", "Phone", "Email", "GSTIN", "Credit Limit", "Outstanding", "Action"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400">No customers found</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{c.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.phone ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.email ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{c.gstin ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{inr(c.credit_limit)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-orange-600">{inr(c.outstanding)}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => openCustomer(c)} className="text-sm font-medium text-blue-600 hover:text-blue-800">360° View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* 360 modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setSelected(null)}>
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Phone", selected.phone ?? "-"],
                  ["Email", selected.email ?? "-"],
                  ["GSTIN", selected.gstin ?? "-"],
                  ["Credit Limit", inr(selected.credit_limit)],
                  ["Outstanding", inr(selected.outstanding)],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>

              {customer360 && (
                <>
                  {/* AI insights */}
                  {(customer360.ai_insights as Record<string, unknown>) && (
                    <div className="mb-4 rounded-lg bg-purple-50 p-4">
                      <p className="mb-2 font-semibold text-purple-800 text-sm">AI Insights</p>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        {[
                          ["Segment", (customer360.ai_insights as Record<string, unknown>).segment as string],
                          ["Purchases/mo", String((customer360.ai_insights as Record<string, unknown>).purchase_frequency_per_month)],
                          ["Churn Risk", (customer360.ai_insights as Record<string, unknown>).churn_risk as string],
                        ].map(([label, value]) => (
                          <div key={label} className="text-center">
                            <p className="text-gray-500 text-xs">{label}</p>
                            <p className="font-semibold text-purple-900 capitalize">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  {(customer360.summary as Record<string, unknown>) && (
                    <div className="mb-4 grid grid-cols-3 gap-3 text-sm">
                      {[
                        ["Total Orders", String((customer360.summary as Record<string, unknown>).total_orders)],
                        ["Total Spent", inr((customer360.summary as Record<string, unknown>).total_spent as number)],
                        ["Avg Order", inr((customer360.summary as Record<string, unknown>).avg_order_value as number)],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg bg-gray-50 p-3 text-center">
                          <p className="text-gray-500 text-xs">{label}</p>
                          <p className="font-bold text-gray-900">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recent orders */}
                  {(customer360.recent_orders as unknown[])?.length > 0 && (
                    <div>
                      <p className="mb-2 font-semibold text-gray-800 text-sm">Recent Orders</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {(customer360.recent_orders as Array<Record<string, unknown>>).map((o, i) => (
                          <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 p-2 text-sm">
                            <span className="font-mono text-gray-600">{String(o.order_number)}</span>
                            <span className="font-semibold text-gray-900">{inr(o.total as number)}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs ${o.status === "confirmed" ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                              {String(o.status)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
              <button onClick={() => setSelected(null)} className="mt-5 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Close</button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
