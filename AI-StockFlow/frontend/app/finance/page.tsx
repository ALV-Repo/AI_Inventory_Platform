"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr } from "../../lib/api";

type PL = {
  period: { from: string; to: string };
  revenue: number;
  gst: number;
  net_sales: number;
  cogs: number;
  gross_profit: number;
  expenses: number;
  net_profit: number;
};

type CashFlow = {
  inflows: number;
  payments: number;
  expenses: number;
  total_outflows: number;
  net_cash_flow: number;
};

type Aging = {
  accounts_receivable: Record<string, number>;
  accounts_payable: Record<string, number>;
  ar_total: number;
  ap_total: number;
};

export default function FinancePage() {
  const [pl, setPL] = useState<PL | null>(null);
  const [cashflow, setCashflow] = useState<CashFlow | null>(null);
  const [aging, setAging] = useState<Aging | null>(null);
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
      const dateFrom = from.toISOString().split("T")[0];
      const dateTo = today.toISOString().split("T")[0];

      const [plData, cfData, agingData] = await Promise.all([
        api.finance.profitLoss(dateFrom, dateTo),
        api.finance.cashFlow(dateFrom, dateTo),
        api.finance.aging(),
      ]);
      setPL(plData as PL);
      setCashflow(cfData as CashFlow);
      setAging(agingData as Aging);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load finance data.");
    } finally {
      setLoading(false);
    }
  }

  const metricColor = (v: number) => v >= 0 ? "text-green-600" : "text-red-600";

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
            <p className="mt-1 text-sm text-gray-500">P&L, cash flow, aging and GST</p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${days === d ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>

        {/* Sub-nav */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            { label: "Overview", href: "/finance" },
            { label: "Expenses", href: "/finance/expenses" },
            { label: "Payments", href: "/finance/payments" },
            { label: "Aging", href: "/finance/aging" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {label}
            </Link>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading finance data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* P&L */}
            {pl && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Profit & Loss</h2>
                  <p className="text-sm text-gray-500">Last {days} days</p>
                </div>
                <div className="grid grid-cols-2 gap-0 sm:grid-cols-4">
                  {[
                    { label: "Revenue", value: pl.revenue, highlight: false },
                    { label: "Net Sales", value: pl.net_sales, highlight: false },
                    { label: "Gross Profit", value: pl.gross_profit, highlight: true },
                    { label: "Net Profit", value: pl.net_profit, highlight: true },
                  ].map((m, i) => (
                    <div key={m.label} className={`p-6 ${i < 3 ? "border-r border-gray-100" : ""}`}>
                      <p className="text-sm text-gray-500">{m.label}</p>
                      <p className={`mt-2 text-2xl font-bold ${m.highlight ? metricColor(m.value) : "text-gray-900"}`}>
                        {inr(m.value)}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-0 border-t border-gray-100">
                  {[
                    { label: "GST Collected", value: pl.gst },
                    { label: "COGS", value: pl.cogs },
                    { label: "Expenses", value: pl.expenses },
                  ].map((m, i) => (
                    <div key={m.label} className={`p-5 ${i < 2 ? "border-r border-gray-100" : ""}`}>
                      <p className="text-sm text-gray-500">{m.label}</p>
                      <p className="mt-1 text-lg font-semibold text-gray-700">{inr(m.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cash Flow */}
            {cashflow && (
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Cash Flow</h2>
                  <p className="text-sm text-gray-500">Last {days} days</p>
                </div>
                <div className="grid grid-cols-2 gap-0 sm:grid-cols-4">
                  {[
                    { label: "Inflows", value: cashflow.inflows, color: "text-green-600" },
                    { label: "Payments", value: cashflow.payments, color: "text-red-600" },
                    { label: "Expenses", value: cashflow.expenses, color: "text-red-600" },
                    { label: "Net Cash Flow", value: cashflow.net_cash_flow, color: metricColor(cashflow.net_cash_flow) },
                  ].map((m, i) => (
                    <div key={m.label} className={`p-6 ${i < 3 ? "border-r border-gray-100" : ""}`}>
                      <p className="text-sm text-gray-500">{m.label}</p>
                      <p className={`mt-2 text-2xl font-bold ${m.color}`}>{inr(m.value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Aging */}
            {aging && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {[
                  { title: "Accounts Receivable (A/R)", data: aging.accounts_receivable, total: aging.ar_total, color: "text-blue-600" },
                  { title: "Accounts Payable (A/P)", data: aging.accounts_payable, total: aging.ap_total, color: "text-orange-600" },
                ].map(section => (
                  <div key={section.title} className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                      <span className={`text-lg font-bold ${section.color}`}>{inr(section.total)}</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {Object.entries(section.data).map(([bucket, amount]) => (
                        <div key={bucket} className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">{bucket} days</span>
                          <div className="flex items-center gap-3">
                            <div className="h-2 w-32 rounded-full bg-gray-100">
                              <div
                                className={`h-2 rounded-full ${section.color.includes("blue") ? "bg-blue-500" : "bg-orange-500"}`}
                                style={{ width: section.total ? `${Math.min((amount / section.total) * 100, 100)}%` : "0%" }}
                              />
                            </div>
                            <span className="text-sm font-semibold text-gray-900 w-24 text-right">{inr(amount)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
