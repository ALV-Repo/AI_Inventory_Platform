"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";

type Expense = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  paymentMode: string;
  attachment?: string;
  status: "Completed" | "Pending";
};

const initialExpenses: Expense[] = [
  {
    id: "EXP-1001",
    date: "14/08/2026",
    description: "Office Supplies",
    category: "Operations",
    amount: 12500,
    paymentMode: "Bank Transfer",
    attachment: "office-supplies.pdf",
    status: "Completed",
  },
  {
    id: "EXP-1002",
    date: "12/08/2026",
    description: "Warehouse Operating Expense",
    category: "Warehouse",
    amount: 32500,
    paymentMode: "UPI",
    attachment: "warehouse-bill.pdf",
    status: "Completed",
  },
  {
    id: "EXP-1003",
    date: "10/08/2026",
    description: "Employee Payroll",
    category: "HR",
    amount: 72500,
    paymentMode: "Bank Transfer",
    attachment: "payroll-august.pdf",
    status: "Completed",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(() => {
  if (typeof window === "undefined") {
    return initialExpenses;
  }

  const savedExpenses = localStorage.getItem("stockflow-expenses");

  if (!savedExpenses) {
    return initialExpenses;
  }

  try {
    return JSON.parse(savedExpenses);
  } catch {
    localStorage.removeItem("stockflow-expenses");
    return initialExpenses;
  }
});

useEffect(() => {
  localStorage.setItem("stockflow-expenses", JSON.stringify(expenses));
}, [expenses]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [periodFilter, setPeriodFilter] = useState("All Periods");

  const [showForm, setShowForm] = useState(false);

  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Operations");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [expenseDate, setExpenseDate] = useState("2026-09-07");
  const [attachment, setAttachment] = useState("");

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const text = search.toLowerCase().trim();

      const matchesSearch =
        !text ||
        expense.description.toLowerCase().includes(text) ||
        expense.category.toLowerCase().includes(text) ||
        expense.id.toLowerCase().includes(text);

      const matchesCategory =
        categoryFilter === "All Categories" ||
        expense.category === categoryFilter;

      const matchesPeriod =
        periodFilter === "All Periods" ||
        (periodFilter === "August 2026" &&
          expense.date.endsWith("/08/2026")) ||
        (periodFilter === "September 2026" &&
          expense.date.endsWith("/09/2026"));

      return matchesSearch && matchesCategory && matchesPeriod;
    });
  }, [expenses, search, categoryFilter, periodFilter]);

  const handleAddExpense = () => {
    const numericAmount = Number(amount);

    if (!description.trim()) {
      alert("Please enter an expense description.");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      alert("Please enter a valid expense amount.");
      return;
    }

    const newExpense: Expense = {
      id: `EXP-${1000 + expenses.length + 1}`,
      date: new Date(expenseDate).toLocaleDateString("en-GB"),
      description: description.trim(),
      category,
      amount: numericAmount,
      paymentMode,
      attachment: attachment || undefined,
      status: "Completed",
    };

    setExpenses((current) => [newExpense, ...current]);

    setDescription("");
    setCategory("Operations");
    setAmount("");
    setPaymentMode("Cash");
    setExpenseDate("2026-09-07");
    setAttachment("");
    setShowForm(false);

    alert("Expense recorded successfully.");
  };

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f8fafc] px-6 py-7 text-slate-900">
        <div className="mx-auto max-w-6xl">

          {/* HEADER */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Expense Management
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Record, track and report business expenses
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              + Add Expense
            </button>
          </div>

          {/* SUMMARY */}
          <section className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <SummaryCard
              title="Total Expenses"
              value={formatCurrency(totalExpenses)}
              description="Recorded expenses"
            />

            <SummaryCard
              title="Transactions"
              value={String(expenses.length)}
              description="Expense records"
            />

            <SummaryCard
              title="Filtered Amount"
              value={formatCurrency(
                filteredExpenses.reduce(
                  (sum, expense) => sum + expense.amount,
                  0
                )
              )}
              description="Based on current filters"
            />
          </section>

          {/* FILTERS */}
          <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid gap-2 md:grid-cols-3">

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search expense, category or ID..."
                className="rounded-md border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
              />

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                <option>All Categories</option>
                <option>Operations</option>
                <option>Warehouse</option>
                <option>HR</option>
                <option>Travel</option>
                <option>Utilities</option>
                <option>Marketing</option>
                <option>Other</option>
              </select>

              <select
                value={periodFilter}
                onChange={(event) =>
                  setPeriodFilter(event.target.value)
                }
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs"
              >
                <option>All Periods</option>
                <option>August 2026</option>
                <option>September 2026</option>
              </select>

            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("All Categories");
                  setPeriodFilter("All Periods");
                }}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            </div>
          </section>

          {/* EXPENSE TABLE */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-semibold">
                Expense Records
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Expenses recorded by category and payment mode
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Expense
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Date
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Category
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Payment
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Amount
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Attachment
                    </th>
                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredExpenses.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-800">
                          {expense.description}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {expense.id}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {expense.date}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {expense.category}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {expense.paymentMode}
                      </td>

                      <td className="px-4 py-3 font-bold text-slate-800">
                        {formatCurrency(expense.amount)}
                      </td>

                      <td className="px-4 py-3">
                        {expense.attachment ? (
                          <span className="font-medium text-blue-600">
                            {expense.attachment}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            No attachment
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full bg-green-100 px-2.5 py-1 text-[10px] font-semibold text-green-700">
                          {expense.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredExpenses.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No expenses found.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 px-5 py-3">
              <p className="text-[10px] text-slate-500">
                Showing {filteredExpenses.length} of {expenses.length} expenses
              </p>
            </div>
          </section>

          {/* ADD EXPENSE MODAL */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div>
                    <h2 className="text-base font-semibold">
                      Add Expense
                    </h2>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Record a new business expense
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid gap-4 p-5">

                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Description
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      placeholder="e.g. Internet bill"
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(event) =>
                          setCategory(event.target.value)
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs"
                      >
                        <option>Operations</option>
                        <option>Warehouse</option>
                        <option>HR</option>
                        <option>Travel</option>
                        <option>Utilities</option>
                        <option>Marketing</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Amount
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={amount}
                        onChange={(event) =>
                          setAmount(event.target.value)
                        }
                        placeholder="0"
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Payment Mode
                      </label>
                      <select
                        value={paymentMode}
                        onChange={(event) =>
                          setPaymentMode(event.target.value)
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-xs"
                      >
                        <option>Cash</option>
                        <option>UPI</option>
                        <option>Card</option>
                        <option>Bank Transfer</option>
                        <option>Cheque</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium">
                        Expense Date
                      </label>
                      <input
                        type="date"
                        value={expenseDate}
                        onChange={(event) =>
                          setExpenseDate(event.target.value)
                        }
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium">
                      Attachment
                    </label>
                    <input
                      type="file"
                      onChange={(event) =>
                        setAttachment(
                          event.target.files?.[0]?.name || ""
                        )
                      }
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs"
                    />

                    <p className="mt-1 text-[10px] text-slate-400">
                      Attach a bill, receipt or supporting document.
                    </p>
                  </div>

                </div>

                <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-md border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleAddExpense}
                    className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Save Expense
                  </button>
                </div>

              </div>
            </div>
          )}

          <div className="py-8 text-center text-[10px] text-slate-400">
            AI StockFlow • Expense Management
          </div>

        </div>
      </main>
    </PageLayout>
  );
}

function SummaryCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <h3 className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </h3>

      <p className="mt-1 text-[10px] text-slate-500">
        {description}
      </p>
    </div>
  );
}