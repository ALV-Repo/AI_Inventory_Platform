"use client";

import { useEffect, useMemo, useState } from "react";

type BankTransaction = {
  id: string;
  date: string;
  description: string;
  reference: string;
  amount: number;
  type: "Credit" | "Debit";
  status: "Unmatched" | "Matched";
};

const initialTransactions: BankTransaction[] = [
  {
    id: "BT-001",
    date: "15/08/2026",
    description: "Customer Payment - Wireless Headphones",
    reference: "INV-2026-041",
    amount: 68500,
    type: "Credit",
    status: "Unmatched",
  },
  {
    id: "BT-002",
    date: "14/08/2026",
    description: "Supplier Payment - Tech Supplies India",
    reference: "PO-00005",
    amount: 87500,
    type: "Debit",
    status: "Matched",
  },
  {
    id: "BT-003",
    date: "13/08/2026",
    description: "Customer Payment - Gaming Keyboard",
    reference: "INV-2026-038",
    amount: 56000,
    type: "Credit",
    status: "Unmatched",
  },
  {
    id: "BT-004",
    date: "12/08/2026",
    description: "Warehouse Operating Expense",
    reference: "EXP-1002",
    amount: 32500,
    type: "Debit",
    status: "Matched",
  },
  {
    id: "BT-005",
    date: "11/08/2026",
    description: "Customer Payment - Bluetooth Speaker",
    reference: "INV-2026-039",
    amount: 98500,
    type: "Credit",
    status: "Unmatched",
  },
];

export default function BankReconciliationPage() {
  const [transactions, setTransactions] =
    useState<BankTransaction[]>(initialTransactions);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  const [statementBalance, setStatementBalance] = useState(0);
  const [showImport, setShowImport] = useState(false);
  const [importMessage, setImportMessage] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("stockflow-bank-reconciliation");

    if (saved) {
      try {
        setTransactions(JSON.parse(saved));
      } catch {
        setTransactions(initialTransactions);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "stockflow-bank-reconciliation",
      JSON.stringify(transactions)
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return transactions.filter((transaction) => {
      const matchesSearch =
        !query ||
        transaction.description.toLowerCase().includes(query) ||
        transaction.reference.toLowerCase().includes(query) ||
        transaction.id.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || transaction.status === statusFilter;

      const matchesType =
        typeFilter === "All" || transaction.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [transactions, search, statusFilter, typeFilter]);

  const bankCredits = transactions
    .filter((transaction) => transaction.type === "Credit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const bankDebits = transactions
    .filter((transaction) => transaction.type === "Debit")
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  const matchedCount = transactions.filter(
    (transaction) => transaction.status === "Matched"
  ).length;

  const unmatchedCount = transactions.filter(
    (transaction) => transaction.status === "Unmatched"
  ).length;

  const reconciledAmount = transactions
    .filter((transaction) => transaction.status === "Matched")
    .reduce((sum, transaction) => {
      return sum + (transaction.type === "Credit"
        ? transaction.amount
        : -transaction.amount);
    }, 0);

  const difference = statementBalance - reconciledAmount;

  const toggleMatch = (id: string) => {
    setTransactions((current) =>
      current.map((transaction) =>
        transaction.id === id
          ? {
              ...transaction,
              status:
                transaction.status === "Matched" ? "Unmatched" : "Matched",
            }
          : transaction
      )
    );
  };

  const matchAll = () => {
    setTransactions((current) =>
      current.map((transaction) => ({
        ...transaction,
        status: "Matched",
      }))
    );
  };

  const resetReconciliation = () => {
    setTransactions((current) =>
      current.map((transaction) => ({
        ...transaction,
        status: "Unmatched",
      }))
    );
  };

  const handleImport = () => {
    setShowImport(false);
    setImportMessage("Bank statement imported successfully.");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Bank Reconciliation
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Match bank transactions with recorded financial transactions.
            </p>
          </div>

          <button
            onClick={() => {
              setShowImport(true);
              setImportMessage("");
            }}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Import Statement
          </button>
        </div>

        {importMessage && (
          <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {importMessage}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-400">
              Bank Credits
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              ₹{bankCredits.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-400">
              Bank Debits
            </p>
            <p className="mt-2 text-2xl font-bold text-red-500">
              ₹{bankDebits.toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-400">
              Matched
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {matchedCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-400">
              Unmatched
            </p>
            <p className="mt-2 text-2xl font-bold text-orange-500">
              {unmatchedCount}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border bg-white p-5">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                Reconciliation Summary
              </h2>
              <p className="text-sm text-slate-500">
                Compare the bank statement with reconciled transactions.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={matchAll}
                className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Match All
              </button>

              <button
                onClick={resetReconciliation}
                className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Statement Balance</p>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-semibold">₹</span>
                <input
                  type="number"
                  value={statementBalance || ""}
                  onChange={(e) =>
                    setStatementBalance(Number(e.target.value) || 0)
                  }
                  placeholder="Enter bank balance"
                  className="w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">
                Reconciled Balance
              </p>
              <p className="mt-2 text-xl font-bold text-slate-900">
                ₹{reconciledAmount.toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs text-slate-500">Difference</p>
              <p
                className={`mt-2 text-xl font-bold ${
                  difference === 0 ? "text-green-600" : "text-orange-500"
                }`}
              >
                ₹{difference.toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {difference === 0
                  ? "Account reconciled"
                  : "Reconciliation pending"}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border bg-white">
          <div className="border-b p-5">
            <h2 className="font-semibold text-slate-900">
              Bank Transactions
            </h2>
            <p className="text-sm text-slate-500">
              Match each bank transaction with its corresponding record.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 border-b p-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transaction or reference..."
              className="min-w-[240px] flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="All">All Types</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="All">All Status</option>
              <option value="Matched">Matched</option>
              <option value="Unmatched">Unmatched</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Transaction</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-slate-400">
                        {transaction.id}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {transaction.date}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {transaction.reference}
                    </td>

                    <td
                      className={`px-5 py-4 font-medium ${
                        transaction.type === "Credit"
                          ? "text-green-600"
                          : "text-red-500"
                      }`}
                    >
                      {transaction.type}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      ₹{transaction.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          transaction.status === "Matched"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleMatch(transaction.id)}
                        className="font-medium text-blue-600 hover:text-blue-800"
                      >
                        {transaction.status === "Matched"
                          ? "Unmatch"
                          : "Match"}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t px-5 py-3 text-xs text-slate-500">
            Showing {filteredTransactions.length} of {transactions.length}{" "}
            transactions
          </div>
        </div>
      </div>

      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Import Bank Statement
                </h2>
                <p className="text-sm text-slate-500">
                  Upload a bank statement file.
                </p>
              </div>

              <button
                onClick={() => setShowImport(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="p-5">
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Statement File
              </label>

              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                className="w-full rounded-lg border p-2 text-sm"
              />

              <p className="mt-2 text-xs text-slate-400">
                Supported formats: CSV, XLSX, XLS
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t p-5">
              <button
                onClick={() => setShowImport(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleImport}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Import Statement
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}