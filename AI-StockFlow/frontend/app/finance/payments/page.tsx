"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr, fmtDate } from "../../../lib/api";

const financeLinks = [
  { label: "Overview", href: "/finance" },
  { label: "P&L", href: "/finance/profit-loss" },
  { label: "Aging", href: "/finance/aging" },
  { label: "Expenses", href: "/finance/expenses" },
  { label: "GST", href: "/finance/gst-summary" },
  { label: "Payments", href: "/finance/payments" },
];

type Transaction = {
  id: number; transaction_type: string; amount: number;
  payment_mode: string; reference_type?: string;
  transaction_date: string; notes?: string;
};

const typeColor = (t: string) =>
  t === "receipt" ? "bg-green-50 text-green-700" :
  t === "payment" ? "bg-red-50 text-red-700" :
  "bg-gray-100 text-gray-700";

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => { load(); }, [typeFilter]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.finance.transactions({
        transaction_type: typeFilter === "all" ? undefined : typeFilter,
      });
      setTransactions(data as Transaction[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load payments.");
    } finally {
      setLoading(false);
    }
  }

  const totalReceipts = transactions.filter(t => t.transaction_type === "receipt").reduce((a, t) => a + t.amount, 0);
  const totalPayments = transactions.filter(t => t.transaction_type === "payment").reduce((a, t) => a + t.amount, 0);

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Payments & Receipts</h1>
          <p className="mt-1 text-sm text-gray-500">All financial transactions</p>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          {financeLinks.map(({ label, href }) => (
            <Link key={href} href={href} className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${href === "/finance/payments" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {label}
            </Link>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-green-200 bg-green-50 p-5">
            <p className="text-sm text-green-600">Total Receipts</p>
            <p className="mt-2 text-2xl font-bold text-green-700">{inr(totalReceipts)}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-5">
            <p className="text-sm text-red-600">Total Payments</p>
            <p className="mt-2 text-2xl font-bold text-red-700">{inr(totalPayments)}</p>
          </div>
        </div>

        <div className="mb-5 flex gap-2">
          {["all", "receipt", "payment"].map(f => (
            <button key={f} onClick={() => setTypeFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${typeFilter === f ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              {f}
            </button>
          ))}
          <button onClick={load} className="ml-auto rounded-lg border border-gray-300 px-4 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">💳</p>
              <p className="text-gray-500 text-sm">No transactions found</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Date", "Type", "Reference", "Payment Mode", "Notes", "Amount"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{fmtDate(t.transaction_date)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${typeColor(t.transaction_type)}`}>
                        {t.transaction_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{t.reference_type ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{t.payment_mode}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-[160px] truncate">{t.notes ?? "-"}</td>
                    <td className={`px-6 py-4 text-sm font-bold ${t.transaction_type === "receipt" ? "text-green-600" : "text-red-600"}`}>
                      {t.transaction_type === "receipt" ? "+" : "-"}{inr(t.amount)}
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
