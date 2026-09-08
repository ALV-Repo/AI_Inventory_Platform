"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr, fmtDate } from "../../../lib/api";

export default function SupplierDetailPage() {
  const params = useParams();
  const id = Number(params.id);

  const [supplier, setSupplier] = useState<Record<string, unknown> | null>(null);
  const [scorecard, setScorecard] = useState<Record<string, unknown> | null>(null);
  const [ledger, setLedger] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "scorecard" | "ledger">("overview");

  useEffect(() => { if (id) load(); }, [id]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [s, sc, ld] = await Promise.all([
        api.suppliers.get(id),
        api.suppliers.scorecard(id),
        api.suppliers.ledger(id),
      ]);
      setSupplier(s as Record<string, unknown>);
      setScorecard(sc as Record<string, unknown>);
      setLedger(ld as Record<string, unknown>);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load supplier.");
    } finally {
      setLoading(false);
    }
  }

  const gradeColor = (g: string) => ({
    A: "bg-green-50 text-green-700",
    B: "bg-blue-50 text-blue-700",
    C: "bg-yellow-50 text-yellow-700",
    D: "bg-red-50 text-red-700",
  }[g] ?? "bg-gray-100 text-gray-700");

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/suppliers" className="text-sm text-blue-600 hover:text-blue-800">← Suppliers</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-900">
            {loading ? "Loading..." : supplier ? String(supplier.name) : "Supplier"}
          </h1>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          </div>
        ) : supplier && (
          <>
            {/* Tab bar */}
            <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1 w-fit">
              {(["overview", "scorecard", "ledger"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`rounded-md px-5 py-2 text-sm font-medium capitalize transition ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview */}
            {activeTab === "overview" && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Name", supplier.name],
                    ["GSTIN", supplier.gstin ?? "-"],
                    ["Phone", supplier.phone ?? "-"],
                    ["Email", supplier.email ?? "-"],
                    ["Payment Terms", `${supplier.payment_terms_days} days`],
                    ["Lead Time", `${supplier.lead_time_days} days`],
                    ["On-time Rate", `${((supplier.on_time_rate as number) * 100).toFixed(0)}%`],
                    ["Status", supplier.is_active ? "Active" : "Inactive"],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="flex justify-between border-b pb-3">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Scorecard */}
            {activeTab === "scorecard" && scorecard && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-6 mb-6">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl font-bold ${gradeColor(String(scorecard.grade))}`}>
                    {String(scorecard.grade)}
                  </div>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">{scorecard.scorecard_score as number}/100</p>
                    <p className="text-sm text-gray-500 mt-1">Vendor Score</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {[
                    ["Total Orders", scorecard.total_orders],
                    ["On-time Rate", `${((scorecard.on_time_rate as number) * 100).toFixed(0)}%`],
                    ["Fill Rate", `${((scorecard.fill_rate as number) * 100).toFixed(0)}%`],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-lg bg-gray-50 p-4 text-center">
                      <p className="text-gray-500 text-xs">{label}</p>
                      <p className="mt-1 text-xl font-bold text-gray-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ledger */}
            {activeTab === "ledger" && ledger && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <p className="text-sm text-gray-500">Total Purchases</p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">{inr(ledger.total_purchases as number)}</p>
                  </div>
                  <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
                    <p className="text-sm text-orange-600">Outstanding Balance</p>
                    <p className="mt-2 text-2xl font-bold text-orange-700">{inr(ledger.outstanding_balance as number)}</p>
                  </div>
                </div>
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="border-b border-gray-200 px-6 py-4">
                    <h2 className="font-semibold text-gray-900">Purchase Orders</h2>
                  </div>
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        {["PO Number", "Date", "Status", "Total"].map(h => (
                          <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(ledger.orders as Array<Record<string, unknown>>).map(o => (
                        <tr key={String(o.id)} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-sm text-blue-600">{String(o.po_number)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{fmtDate(String(o.order_date))}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 capitalize">{String(o.status)}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">{inr(o.total as number)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
