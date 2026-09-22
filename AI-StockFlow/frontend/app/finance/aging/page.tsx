"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr } from "../../../lib/api";

type Aging = {
  accounts_receivable: Record<string, number>;
  accounts_payable: Record<string, number>;
  ar_total: number; ap_total: number;
};

const financeLinks = [
  { label: "Overview", href: "/finance" },
  { label: "P&L", href: "/finance/profit-loss" },
  { label: "Aging", href: "/finance/aging" },
  { label: "Expenses", href: "/finance/expenses" },
  { label: "GST", href: "/finance/gst-summary" },
  { label: "Payments", href: "/finance/payments" },
];

export default function AgingPage() {
  const [aging, setAging] = useState<Aging | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.finance.aging();
      setAging(data as Aging);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load aging.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Aging Report</h1>
          <p className="mt-1 text-sm text-gray-500">Outstanding receivables and payables by age bucket</p>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          {financeLinks.map(({ label, href }) => (
            <Link key={href} href={href} className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${href === "/finance/aging" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {label}
            </Link>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading aging report...</p>
          </div>
        ) : aging && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[
              { title: "Accounts Receivable (A/R)", data: aging.accounts_receivable, total: aging.ar_total, color: "blue" },
              { title: "Accounts Payable (A/P)", data: aging.accounts_payable, total: aging.ap_total, color: "orange" },
            ].map(section => (
              <div key={section.title} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">{section.title}</h2>
                  <span className={`text-lg font-bold text-${section.color}-600`}>{inr(section.total)}</span>
                </div>
                <div className="p-5 space-y-4">
                  {Object.entries(section.data).map(([bucket, amount]) => (
                    <div key={bucket}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-500">{bucket} days</span>
                        <span className="text-sm font-semibold text-gray-900">{inr(amount)}</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-gray-100">
                        <div
                          className={`h-2.5 rounded-full bg-${section.color}-500`}
                          style={{ width: section.total ? `${Math.min((amount / section.total) * 100, 100)}%` : "0%" }}
                        />
                      </div>
                      <p className="mt-0.5 text-right text-xs text-gray-400">
                        {section.total ? ((amount / section.total) * 100).toFixed(0) : 0}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
