"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr } from "../../../lib/api";

const financeLinks = [
  { label: "Overview", href: "/finance" },
  { label: "P&L", href: "/finance/profit-loss" },
  { label: "Aging", href: "/finance/aging" },
  { label: "Expenses", href: "/finance/expenses" },
  { label: "GST", href: "/finance/gst-summary" },
  { label: "Payments", href: "/finance/payments" },
];

export default function GSTSummaryPage() {
  const [gst, setGst] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [days, setDays] = useState(30);

  useEffect(() => { load(); }, [days]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const today = new Date();
      const from = new Date(today);
      from.setDate(from.getDate() - days);
      const data = await api.gstSummary(days);
      setGst(data as Record<string, unknown>);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load GST summary.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">GST Summary</h1>
            <p className="mt-1 text-sm text-gray-500">Output tax, input tax and net GST liability</p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${days === d ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          {financeLinks.map(({ label, href }) => (
            <Link key={href} href={href} className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${href === "/finance/gst-summary" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {label}
            </Link>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading GST summary...</p>
          </div>
        ) : gst && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Output GST (Collected)", key: "output_gst", color: "text-blue-600" },
                { label: "Input GST (Paid)", key: "input_gst", color: "text-orange-600" },
                { label: "Net GST Liability", key: "net_gst", color: "text-red-600" },
              ].map(c => (
                <div key={c.key} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-gray-500">{c.label}</p>
                  <p className={`mt-2 text-2xl font-bold ${c.color}`}>{inr((gst[c.key] as number) ?? 0)}</p>
                </div>
              ))}
            </div>

            {/* Rate-wise breakup */}
            {gst.rate_wise && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="font-semibold text-gray-900">Rate-wise Breakup</h2>
                </div>
                <table className="w-full text-left">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      {["GST Rate", "Taxable Amount", "CGST", "SGST", "IGST", "Total Tax"].map(h => (
                        <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(gst.rate_wise as Array<Record<string, unknown>>).map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{String(row.rate)}%</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{inr(row.taxable_amount as number)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{inr(row.cgst as number)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{inr(row.sgst as number)}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{inr(row.igst as number)}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{inr(row.total_tax as number)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
