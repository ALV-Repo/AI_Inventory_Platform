"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr, fmtDate } from "../../../lib/api";

type Expense = {
  id: number; category: string; amount: number;
  payment_mode: string; description?: string;
  expense_date: string; created_at: string;
};

const financeLinks = [
  { label: "Overview", href: "/finance" },
  { label: "P&L", href: "/finance/profit-loss" },
  { label: "Aging", href: "/finance/aging" },
  { label: "Expenses", href: "/finance/expenses" },
  { label: "GST", href: "/finance/gst-summary" },
  { label: "Payments", href: "/finance/payments" },
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: "", amount: "", payment_mode: "cash", description: "", expense_date: new Date().toISOString().split("T")[0] });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.finance.expenses();
      setExpenses(data as Expense[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  }

  async function createExpense() {
    if (!form.category || !form.amount) return;
    try {
      setSaving(true);
      await api.finance.createExpense({
        category: form.category,
        amount: Number(form.amount),
        payment_mode: form.payment_mode,
        description: form.description || undefined,
        expense_date: form.expense_date,
      });
      setShowCreate(false);
      setForm({ category: "", amount: "", payment_mode: "cash", description: "", expense_date: new Date().toISOString().split("T")[0] });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create expense.");
    } finally {
      setSaving(false);
    }
  }

  const total = expenses.reduce((a, e) => a + (e.amount || 0), 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
            <p className="mt-1 text-sm text-gray-500">Track and categorise business expenses</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            + Add Expense
          </button>
        </div>

        <div className="mb-6 flex gap-2 flex-wrap">
          {financeLinks.map(({ label, href }) => (
            <Link key={href} href={href} className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${href === "/finance/expenses" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {label}
            </Link>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="mt-2 text-2xl font-bold text-red-600">{inr(total)}</p>
          </div>
          {Object.entries(byCategory).slice(0, 3).map(([cat, amt]) => (
            <div key={cat} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500 capitalize">{cat}</p>
              <p className="mt-2 text-xl font-bold text-gray-900">{inr(amt)}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">🧾</p>
              <p className="text-gray-500 text-sm">No expenses recorded yet</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Date", "Category", "Description", "Payment Mode", "Amount"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{fmtDate(e.expense_date)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 capitalize">{e.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{e.description ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{e.payment_mode}</td>
                    <td className="px-6 py-4 text-sm font-bold text-red-600">{inr(e.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Add Expense</h2>
              <div className="space-y-3">
                {[
                  { label: "Category *", key: "category", type: "text" },
                  { label: "Amount (₹) *", key: "amount", type: "number" },
                  { label: "Date", key: "expense_date", type: "date" },
                  { label: "Description", key: "description", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                    <input type={type} value={String(form[key as keyof typeof form])}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Payment Mode</label>
                  <select value={form.payment_mode} onChange={e => setForm(f => ({ ...f, payment_mode: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                    {["cash", "bank_transfer", "upi", "card", "cheque"].map(m => (
                      <option key={m} value={m} className="capitalize">{m.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={createExpense} disabled={saving} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Add Expense"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
