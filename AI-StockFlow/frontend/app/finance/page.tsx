"use client";

import { useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "Income" | "Expense";
  amount: number;
  status: "Completed" | "Pending";
};

const transactions: Transaction[] = [
  {
    id: "TXN-1001",
    date: "15/08/2026",
    description: "Customer Payment - Wireless Headphones",
    category: "Sales",
    type: "Income",
    amount: 125000,
    status: "Completed",
  },
  {
    id: "TXN-1002",
    date: "14/08/2026",
    description: "Supplier Payment - Tech Supplies India",
    category: "Purchases",
    type: "Expense",
    amount: 87500,
    status: "Completed",
  },
  {
    id: "TXN-1003",
    date: "13/08/2026",
    description: "Customer Payment - Gaming Keyboard",
    category: "Sales",
    type: "Income",
    amount: 156000,
    status: "Completed",
  },
  {
    id: "TXN-1004",
    date: "12/08/2026",
    description: "Warehouse Operating Expense",
    category: "Operations",
    type: "Expense",
    amount: 32500,
    status: "Completed",
  },
  {
    id: "TXN-1005",
    date: "11/08/2026",
    description: "Customer Payment - Bluetooth Speaker",
    category: "Sales",
    type: "Income",
    amount: 98500,
    status: "Pending",
  },
  {
    id: "TXN-1006",
    date: "10/08/2026",
    description: "Employee Payroll",
    category: "HR",
    type: "Expense",
    amount: 72500,
    status: "Completed",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function FinancePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState("All Types");

  const totalIncome = transactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const pendingAmount = transactions
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => sum + item.amount, 0);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        item.description
          .toLowerCase()
          .includes(searchText) ||
        item.category
          .toLowerCase()
          .includes(searchText) ||
        item.id
          .toLowerCase()
          .includes(searchText);

      const matchesType =
        typeFilter === "All Types" ||
        item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [search, typeFilter]);

  const profitMargin =
    totalIncome > 0
      ? ((netProfit / totalIncome) * 100).toFixed(1)
      : "0.0";

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f8fafc] px-6 py-7 text-slate-900">

        <div className="mx-auto max-w-6xl">

          {/* HEADER */}
          <div className="mb-6 flex items-start justify-between">

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Finance
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Monitor revenue, expenses, cash flow and
                financial performance
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>

          </div>

          {/* KPI CARDS */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <KpiCard
              title="Total Revenue"
              value={formatCurrency(totalIncome)}
              subtitle="↑ 12.4% this month"
              color="green"
            />

            <KpiCard
              title="Total Expenses"
              value={formatCurrency(totalExpense)}
              subtitle="Operating expenses"
              color="orange"
            />

            <KpiCard
              title="Net Profit"
              value={formatCurrency(netProfit)}
              subtitle="Healthy margin"
              color="green"
            />

            <KpiCard
              title="Pending Payments"
              value={formatCurrency(pendingAmount)}
              subtitle="Awaiting settlement"
              color="orange"
            />

          </div>

          {/* FINANCIAL OVERVIEW */}
          <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 px-5 py-4">

              <h2 className="text-sm font-semibold">
                Financial Overview
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Revenue and expense performance
              </p>

            </div>

            <div className="grid gap-8 p-5 md:grid-cols-2">

              {/* REVENUE */}
              <div>

                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">
                    Revenue
                  </p>

                  <strong className="text-sm">
                    {formatCurrency(totalIncome)}
                  </strong>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">

                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: "82%" }}
                  />

                </div>

                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>
                    {formatCurrency(totalIncome)}
                  </span>

                  <span>82%</span>
                </div>

              </div>

              {/* EXPENSE */}
              <div>

                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">
                    Expenses
                  </p>

                  <strong className="text-sm">
                    {formatCurrency(totalExpense)}
                  </strong>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">

                  <div
                    className="h-full rounded-full bg-orange-500"
                    style={{ width: "46%" }}
                  />

                </div>

                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>
                    {formatCurrency(totalExpense)}
                  </span>

                  <span>46%</span>
                </div>

              </div>

            </div>

          </section>

          {/* SEARCH + FILTER */}
          <section className="mb-5 rounded-xl border border-slate-200 bg-white p-3">

            <div className="grid gap-2 md:grid-cols-[1fr_180px]">

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search transaction, category or ID..."
                className="rounded-md border border-slate-300 px-3 py-2 text-xs outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />

              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value)
                }
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none"
              >
                <option>All Types</option>
                <option>Income</option>
                <option>Expense</option>
              </select>

            </div>

          </section>

          {/* TRANSACTIONS */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 px-5 py-4">

              <h2 className="text-sm font-semibold">
                Recent Transactions
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Latest financial activity
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full border-collapse text-xs">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Transaction
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Date
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Category
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Type
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Amount
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Status
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredTransactions.map((item) => (

                    <tr
                      key={item.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >

                      {/* TRANSACTION */}
                      <td className="px-4 py-3">

                        <p className="font-semibold text-slate-800">
                          {item.description}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {item.id}
                        </p>

                      </td>

                      {/* DATE */}
                      <td className="px-4 py-3 text-slate-600">
                        {item.date}
                      </td>

                      {/* CATEGORY */}
                      <td className="px-4 py-3 text-slate-600">
                        {item.category}
                      </td>

                      {/* TYPE */}
                      <td className="px-4 py-3">

                        <span
                          className={`font-semibold ${
                            item.type === "Income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.type}
                        </span>

                      </td>

                      {/* AMOUNT */}
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {formatCurrency(item.amount)}
                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                            item.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {item.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

              {filteredTransactions.length === 0 && (
                <div className="px-6 py-12 text-center">

                  <p className="text-sm font-medium text-slate-700">
                    No transactions found.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try changing your search or filter.
                  </p>

                </div>
              )}

            </div>

            <div className="border-t border-slate-200 px-5 py-3">

              <p className="text-[10px] text-slate-500">
                Showing {filteredTransactions.length} of{" "}
                {transactions.length} transactions
              </p>

            </div>

          </section>

          {/* FINANCE INSIGHTS */}
          <section className="mt-5 grid gap-3 md:grid-cols-3">

            <InsightCard
              title="Profitability"
              value={`${profitMargin}%`}
              description="Current net profit margin"
            />

            <InsightCard
              title="Cash Flow"
              value={formatCurrency(netProfit)}
              description="Positive operating cash flow"
            />

            <InsightCard
              title="Pending Collection"
              value={formatCurrency(pendingAmount)}
              description="Payments requiring attention"
              warning
            />

          </section>

          {/* FOOTER */}
          <div className="py-8 text-center text-[10px] text-slate-400">
            AI StockFlow • Finance Management
          </div>

        </div>
      </main>
    </PageLayout>
  );
}

/* ============================================================
   KPI CARD
============================================================ */

function KpiCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: "green" | "orange";
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <p className="text-[10px] uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </h2>

      <p
        className={`mt-1 text-[10px] ${
          color === "green"
            ? "text-green-600"
            : "text-orange-500"
        }`}
      >
        {subtitle}
      </p>

    </div>
  );
}

/* ============================================================
   INSIGHT CARD
============================================================ */

function InsightCard({
  title,
  value,
  description,
  warning = false,
}: {
  title: string;
  value: string;
  description: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-[10px] uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <h3
        className={`mt-2 text-2xl font-bold ${
          warning
            ? "text-orange-500"
            : "text-slate-900"
        }`}
      >
        {value}
      </h3>

      <p className="mt-1 text-[10px] text-slate-500">
        {description}
      </p>

    </div>
  );
}