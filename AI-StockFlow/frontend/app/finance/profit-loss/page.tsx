"use client";

import { useMemo, useState } from "react";

type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "Income" | "Expense";
  amount: number;
};

const initialTransactions: Transaction[] = [
  {
    id: "TXN-001",
    date: "2026-09-01",
    description: "Product Sales",
    category: "Sales",
    type: "Income",
    amount: 125000,
  },
  {
    id: "TXN-002",
    date: "2026-09-02",
    description: "Office Supplies",
    category: "Operations",
    type: "Expense",
    amount: 12500,
  },
  {
    id: "TXN-003",
    date: "2026-09-03",
    description: "Warehouse Operating Expense",
    category: "Warehouse",
    type: "Expense",
    amount: 32500,
  },
  {
    id: "TXN-004",
    date: "2026-09-04",
    description: "Product Sales",
    category: "Sales",
    type: "Income",
    amount: 98500,
  },
  {
    id: "TXN-005",
    date: "2026-09-05",
    description: "Employee Payroll",
    category: "HR",
    type: "Expense",
    amount: 72500,
  },
  {
    id: "TXN-006",
    date: "2026-09-06",
    description: "Internet Bill",
    category: "Utilities",
    type: "Expense",
    amount: 2500,
  },
];

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

export default function ProfitLossPage() {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [period, setPeriod] = useState("This Month");
  const [search, setSearch] = useState("");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) =>
      `${transaction.description} ${transaction.category}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [transactions, search]);

  const income = useMemo(
    () =>
      filteredTransactions
        .filter((transaction) => transaction.type === "Income")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [filteredTransactions]
  );

  const expenses = useMemo(
    () =>
      filteredTransactions
        .filter((transaction) => transaction.type === "Expense")
        .reduce((sum, transaction) => sum + transaction.amount, 0),
    [filteredTransactions]
  );

  const grossProfit = income - expenses;
  const profitMargin = income > 0 ? (grossProfit / income) * 100 : 0;

  const expenseBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};

    filteredTransactions
      .filter((transaction) => transaction.type === "Expense")
      .forEach((transaction) => {
        breakdown[transaction.category] =
          (breakdown[transaction.category] || 0) + transaction.amount;
      });

    return Object.entries(breakdown).sort((a, b) => b[1] - a[1]);
  }, [filteredTransactions]);

  const addIncome = () => {
    const newTransaction: Transaction = {
      id: `TXN-${String(transactions.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      description: "Additional Sales Income",
      category: "Sales",
      type: "Income",
      amount: 10000,
    };

    setTransactions((current) => [newTransaction, ...current]);
  };

  return (
    <main className="p-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profit & Loss</h1>
          <p className="text-sm text-gray-500">
            Track income, expenses and profitability
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border px-3 py-2"
          >
            <option>This Month</option>
            <option>Last Month</option>
            <option>This Quarter</option>
            <option>This Year</option>
          </select>

          <button
            onClick={addIncome}
            className="rounded-lg bg-black px-4 py-2 text-white"
          >
            + Add Income
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Income</p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatCurrency(income)}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatCurrency(expenses)}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Net Profit</p>
          <h2 className="mt-2 text-2xl font-bold">
            {formatCurrency(grossProfit)}
          </h2>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Profit Margin</p>
          <h2 className="mt-2 text-2xl font-bold">
            {profitMargin.toFixed(1)}%
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">P&L Statement</h2>
              <p className="text-sm text-gray-500">{period}</p>
            </div>

            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b">
                <tr>
                  <th className="px-3 py-3">Date</th>
                  <th className="px-3 py-3">Description</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3 text-right">Amount</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b">
                    <td className="px-3 py-3">{transaction.date}</td>
                    <td className="px-3 py-3">{transaction.description}</td>
                    <td className="px-3 py-3">{transaction.category}</td>
                    <td className="px-3 py-3">{transaction.type}</td>
                    <td className="px-3 py-3 text-right font-medium">
                      {formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5">
          <h2 className="text-lg font-semibold">Expense Breakdown</h2>
          <p className="mb-4 text-sm text-gray-500">
            Expenses by category
          </p>

          <div className="space-y-4">
            {expenseBreakdown.map(([category, amount]) => {
              const percentage =
                expenses > 0 ? (amount / expenses) * 100 : 0;

              return (
                <div key={category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{category}</span>
                    <span className="font-medium">
                      {formatCurrency(amount)}
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-black"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}