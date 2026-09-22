"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr } from "../../../lib/api";

type PL = {
  period: { from: string; to: string };
  revenue: number; gst: number; net_sales: number;
  cogs: number; gross_profit: number; expenses: number; net_profit: number;
};

export default function ProfitLossPage() {
  const [pl, setPL] = useState<PL | null>(null);
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
      const data = await api.finance.profitLoss(
        from.toISOString().split("T")[0],
        today.toISOString().split("T")[0]
      );
      setPL(data as PL);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load P&L.");
    } finally {
      setLoading(false);
    }
  }

  const financeLinks = [
    { label: "Overview", href: "/finance" },
    { label: "P&L", href: "/finance/profit-loss" },
    { label: "Aging", href: "/finance/aging" },
    { label: "Expenses", href: "/finance/expenses" },
    { label: "GST", href: "/finance/gst-summary" },
    { label: "Payments", href: "/finance/payments" },
  ];

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Profit & Loss</h1>
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
            <Link key={href} href={href} className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${href === "/finance/profit-loss" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {label}
            </Link>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading P&L...</p>
          </div>
        ) : pl && (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
              <h2 className="font-semibold text-gray-900">Statement — Last {days} days</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {[
                { label: "Revenue (Gross)", value: pl.revenue, indent: false, bold: false },
                { label: "Less: GST Collected", value: -pl.gst, indent: true, bold: false },
                { label: "Net Sales", value: pl.net_sales, indent: false, bold: true },
                { label: "Less: Cost of Goods Sold", value: -pl.cogs, indent: true, bold: false },
                { label: "Gross Profit", value: pl.gross_profit, indent: false, bold: true, color: pl.gross_profit >= 0 ? "text-green-600" : "text-red-600" },
                { label: "Less: Operating Expenses", value: -pl.expenses, indent: true, bold: false },
                { label: "Net Profit", value: pl.net_profit, indent: false, bold: true, color: pl.net_profit >= 0 ? "text-green-600" : "text-red-600", large: true },
              ].map((row, i) => (
                <div key={i} className={`flex items-center justify-between px-6 py-4 ${row.large ? "bg-gray-50" : ""}`}>
                  <span className={`text-sm ${row.indent ? "pl-6 text-gray-500" : ""} ${row.bold ? "font-semibold text-gray-900" : "text-gray-600"}`}>
                    {row.label}
                  </span>
                  <span className={`font-${row.bold ? "bold" : "medium"} ${row.color ?? "text-gray-900"} ${row.large ? "text-xl" : "text-sm"}`}>
                    {inr(Math.abs(row.value))}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 px-6 py-3 text-xs text-gray-400">
              Gross margin: {pl.net_sales > 0 ? ((pl.gross_profit / pl.net_sales) * 100).toFixed(1) : 0}% · Net margin: {pl.net_sales > 0 ? ((pl.net_profit / pl.net_sales) * 100).toFixed(1) : 0}%
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
