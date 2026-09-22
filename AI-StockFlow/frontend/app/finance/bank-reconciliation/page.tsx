"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr, fmtDate } from "../../../lib/api";

type Transaction = {
  id: number;
  transaction_type: string;
  amount: number;
  payment_mode: string;
  reference_type?: string;
  transaction_date: string;
  notes?: string;
  matched?: boolean;
};

export default function BankReconciliationPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [filter, setFilter] = useState<"all" | "unmatched" | "matched">("unmatched");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      // Load bank transactions — filter by bank_transfer/upi/cheque payment modes
      const data = await api.finance.transactions();
      setTransactions(data as Transaction[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }

  function toggleMatch(id: number) {
    setMatched(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const bankTransactions = transactions.filter(t =>
    ["bank_transfer", "upi", "cheque", "neft", "rtgs"].includes(t.payment_mode?.toLowerCase())
  );

  const filtered = useMemo(() => bankTransactions.filter(t => {
    if (filter === "matched") return matched.has(t.id);
    if (filter === "unmatched") return !matched.has(t.id);
    return true;
  }), [bankTransactions, matched, filter]);

  const totalReceipts = bankTransactions.filter(t => t.transaction_type === "receipt").reduce((a, t) => a + t.amount, 0);
  const totalPayments = bankTransactions.filter(t => t.transaction_type === "payment").reduce((a, t) => a + t.amount, 0);
  const matchedCount = matched.size;
  const unmatchedCount = bankTransactions.length - matchedCount;

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bank Reconciliation</h1>
            <p className="mt-1 text-sm text-gray-500">Match bank transactions with system records</p>
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: "Total Transactions", value: bankTransactions.length },
            { label: "Matched", value: matchedCount, color: "text-green-600" },
            { label: "Unmatched", value: unmatchedCount, color: "text-orange-600" },
            { label: "Net Position", value: inr(totalReceipts - totalPayments), color: totalReceipts >= totalPayments ? "text-green-600" : "text-red-600" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-xl font-bold ${c.color ?? "text-gray-900"}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="mb-5 flex gap-2">
          {(["all", "unmatched", "matched"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${filter === f ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading bank transactions...</p>
            </div>
          ) : bankTransactions.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">🏦</p>
              <p className="text-sm text-gray-500">No bank transactions found</p>
              <p className="text-xs text-gray-400 mt-1">Add transactions with payment mode: bank_transfer, UPI, cheque, NEFT, or RTGS</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Date", "Type", "Reference", "Payment Mode", "Notes", "Amount", "Status", "Action"].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center text-sm text-gray-400">No {filter} transactions</td></tr>
                ) : filtered.map(t => {
                  const isMatched = matched.has(t.id);
                  return (
                    <tr key={t.id} className={`hover:bg-gray-50 ${isMatched ? "opacity-60" : ""}`}>
                      <td className="px-5 py-4 text-sm text-gray-600">{fmtDate(t.transaction_date)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${t.transaction_type === "receipt" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {t.transaction_type}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{t.reference_type ?? "-"}</td>
                      <td className="px-5 py-4 text-sm text-gray-600 capitalize">{t.payment_mode}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 max-w-[150px] truncate">{t.notes ?? "-"}</td>
                      <td className={`px-5 py-4 text-sm font-bold ${t.transaction_type === "receipt" ? "text-green-600" : "text-red-600"}`}>
                        {t.transaction_type === "receipt" ? "+" : "-"}{inr(t.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${isMatched ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                          {isMatched ? "Matched" : "Unmatched"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => toggleMatch(t.id)}
                          className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${isMatched ? "border border-gray-300 text-gray-600 hover:bg-gray-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                          {isMatched ? "Unmatch" : "Match"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
          ℹ Bank reconciliation matches system finance transactions with bank payment modes (bank transfer, UPI, cheque, NEFT, RTGS).
        </div>
      </div>
    </PageLayout>
  );
}
