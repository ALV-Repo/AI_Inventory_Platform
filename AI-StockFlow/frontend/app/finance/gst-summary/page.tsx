"use client";

import { useMemo, useState } from "react";

type GSTTransaction = {
  id: string;
  date: string;
  invoiceNo: string;
  party: string;
  gstin: string;
  type: "Sales" | "Purchase";
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
};

const initialTransactions: GSTTransaction[] = [
  {
    id: "GST-001",
    date: "2026-09-01",
    invoiceNo: "INV-2026-041",
    party: "Apex Retail Solutions",
    gstin: "29ABCDE1234F1Z5",
    type: "Sales",
    taxableValue: 68500,
    cgst: 6165,
    sgst: 6165,
    igst: 0,
  },
  {
    id: "GST-002",
    date: "2026-09-02",
    invoiceNo: "INV-2026-042",
    party: "Green Valley Stores",
    gstin: "36ABCDE5678G1Z2",
    type: "Sales",
    taxableValue: 42000,
    cgst: 3780,
    sgst: 3780,
    igst: 0,
  },
  {
    id: "GST-003",
    date: "2026-09-03",
    invoiceNo: "PO-2026-018",
    party: "Test Electronics Pvt Ltd",
    gstin: "22AAAAA0000A1Z5",
    type: "Purchase",
    taxableValue: 50000,
    cgst: 4500,
    sgst: 4500,
    igst: 0,
  },
  {
    id: "GST-004",
    date: "2026-09-04",
    invoiceNo: "INV-2026-043",
    party: "Metro Office Supplies",
    gstin: "27PQRSX9876H1Z8",
    type: "Sales",
    taxableValue: 30000,
    cgst: 0,
    sgst: 0,
    igst: 5400,
  },
];

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;

export default function GSTSummaryPage() {
  const [transactions, setTransactions] =
    useState<GSTTransaction[]>(initialTransactions);

  const [fromDate, setFromDate] = useState("2026-09-01");
  const [toDate, setToDate] = useState("2026-09-30");
  const [typeFilter, setTypeFilter] = useState<"All" | "Sales" | "Purchase">(
    "All"
  );
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTransaction, setNewTransaction] = useState({
    invoiceNo: "",
    party: "",
    gstin: "",
    type: "Sales" as "Sales" | "Purchase",
    taxableValue: "",
    cgst: "",
    sgst: "",
    igst: "",
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesDate =
        transaction.date >= fromDate && transaction.date <= toDate;

      const matchesType =
        typeFilter === "All" || transaction.type === typeFilter;

      const searchValue = search.toLowerCase();

      const matchesSearch =
        !searchValue ||
        transaction.invoiceNo.toLowerCase().includes(searchValue) ||
        transaction.party.toLowerCase().includes(searchValue) ||
        transaction.gstin.toLowerCase().includes(searchValue);

      return matchesDate && matchesType && matchesSearch;
    });
  }, [transactions, fromDate, toDate, typeFilter, search]);

  const summary = useMemo(() => {
    const sales = filteredTransactions.filter(
      (transaction) => transaction.type === "Sales"
    );

    const purchases = filteredTransactions.filter(
      (transaction) => transaction.type === "Purchase"
    );

    const salesTaxable = sales.reduce(
      (sum, transaction) => sum + transaction.taxableValue,
      0
    );

    const purchaseTaxable = purchases.reduce(
      (sum, transaction) => sum + transaction.taxableValue,
      0
    );

    const outputCGST = sales.reduce(
      (sum, transaction) => sum + transaction.cgst,
      0
    );

    const outputSGST = sales.reduce(
      (sum, transaction) => sum + transaction.sgst,
      0
    );

    const outputIGST = sales.reduce(
      (sum, transaction) => sum + transaction.igst,
      0
    );

    const inputCGST = purchases.reduce(
      (sum, transaction) => sum + transaction.cgst,
      0
    );

    const inputSGST = purchases.reduce(
      (sum, transaction) => sum + transaction.sgst,
      0
    );

    const inputIGST = purchases.reduce(
      (sum, transaction) => sum + transaction.igst,
      0
    );

    const outputGST = outputCGST + outputSGST + outputIGST;
    const inputGST = inputCGST + inputSGST + inputIGST;

    return {
      salesTaxable,
      purchaseTaxable,
      outputCGST,
      outputSGST,
      outputIGST,
      inputCGST,
      inputSGST,
      inputIGST,
      outputGST,
      inputGST,
      netGST: outputGST - inputGST,
    };
  }, [filteredTransactions]);

  const resetForm = () => {
    setNewTransaction({
      invoiceNo: "",
      party: "",
      gstin: "",
      type: "Sales",
      taxableValue: "",
      cgst: "",
      sgst: "",
      igst: "",
    });
  };

  const handleAddTransaction = () => {
    if (
      !newTransaction.invoiceNo ||
      !newTransaction.party ||
      !newTransaction.gstin ||
      !newTransaction.taxableValue
    ) {
      alert("Please fill Invoice No, Party, GSTIN and Taxable Value.");
      return;
    }

    const transaction: GSTTransaction = {
      id: `GST-${String(transactions.length + 1).padStart(3, "0")}`,
      date: new Date().toISOString().split("T")[0],
      invoiceNo: newTransaction.invoiceNo,
      party: newTransaction.party,
      gstin: newTransaction.gstin,
      type: newTransaction.type,
      taxableValue: Number(newTransaction.taxableValue) || 0,
      cgst: Number(newTransaction.cgst) || 0,
      sgst: Number(newTransaction.sgst) || 0,
      igst: Number(newTransaction.igst) || 0,
    };

    setTransactions((current) => [transaction, ...current]);
    setShowAddModal(false);
    resetForm();
  };

  const exportCSV = () => {
    const headers = [
      "Date",
      "Invoice No",
      "Party",
      "GSTIN",
      "Type",
      "Taxable Value",
      "CGST",
      "SGST",
      "IGST",
      "Total GST",
    ];

    const rows = filteredTransactions.map((transaction) => [
      transaction.date,
      transaction.invoiceNo,
      transaction.party,
      transaction.gstin,
      transaction.type,
      transaction.taxableValue,
      transaction.cgst,
      transaction.sgst,
      transaction.igst,
      transaction.cgst + transaction.sgst + transaction.igst,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `gst-summary-${fromDate}-to-${toDate}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">GST Summary</h1>
            <p className="mt-1 text-sm text-slate-500">
              Review output GST, input tax credit and net GST liability.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={exportCSV}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Export CSV
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Add GST Entry
            </button>
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Sales Taxable Value</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(summary.salesTaxable)}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Purchase Taxable Value</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(summary.purchaseTaxable)}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Output GST</p>
            <p className="mt-2 text-2xl font-bold text-orange-600">
              {formatCurrency(summary.outputGST)}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Net GST Liability</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {formatCurrency(summary.netGST)}
            </p>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Transaction Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(
                    e.target.value as "All" | "Sales" | "Purchase"
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="All">All</option>
                <option value="Sales">Sales</option>
                <option value="Purchase">Purchase</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Search
              </label>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Invoice, party or GSTIN"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Output GST</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>CGST</span>
                <span>{formatCurrency(summary.outputCGST)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST</span>
                <span>{formatCurrency(summary.outputSGST)}</span>
              </div>
              <div className="flex justify-between">
                <span>IGST</span>
                <span>{formatCurrency(summary.outputIGST)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t pt-3 font-bold">
                <span>Total Output GST</span>
                <span>{formatCurrency(summary.outputGST)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Input Tax Credit</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>CGST</span>
                <span>{formatCurrency(summary.inputCGST)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST</span>
                <span>{formatCurrency(summary.inputSGST)}</span>
              </div>
              <div className="flex justify-between">
                <span>IGST</span>
                <span>{formatCurrency(summary.inputIGST)}</span>
              </div>
              <div className="mt-3 flex justify-between border-t pt-3 font-bold">
                <span>Total ITC</span>
                <span>{formatCurrency(summary.inputGST)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">GST Payable</h2>
            <div className="mt-4">
              <p className="text-sm text-slate-500">
                Output GST − Input Tax Credit
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {formatCurrency(summary.netGST)}
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="font-semibold text-slate-900">
              GST Transactions ({filteredTransactions.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Invoice</th>
                  <th className="px-4 py-3">Party</th>
                  <th className="px-4 py-3">GSTIN</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Taxable</th>
                  <th className="px-4 py-3 text-right">CGST</th>
                  <th className="px-4 py-3 text-right">SGST</th>
                  <th className="px-4 py-3 text-right">IGST</th>
                  <th className="px-4 py-3 text-right">Total GST</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredTransactions.map((transaction) => {
                  const totalGST =
                    transaction.cgst +
                    transaction.sgst +
                    transaction.igst;

                  return (
                    <tr key={transaction.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{transaction.date}</td>
                      <td className="px-4 py-3 font-medium">
                        {transaction.invoiceNo}
                      </td>
                      <td className="px-4 py-3">{transaction.party}</td>
                      <td className="px-4 py-3">{transaction.gstin}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            transaction.type === "Sales"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {transaction.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(transaction.taxableValue)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(transaction.cgst)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(transaction.sgst)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatCurrency(transaction.igst)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {formatCurrency(totalGST)}
                      </td>
                    </tr>
                  );
                })}

                {filteredTransactions.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No GST transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                Add GST Entry
              </h2>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-xl text-slate-500 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                placeholder="Invoice No"
                value={newTransaction.invoiceNo}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    invoiceNo: e.target.value,
                  })
                }
                className="rounded-lg border px-3 py-2"
              />

              <input
                placeholder="Party Name"
                value={newTransaction.party}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    party: e.target.value,
                  })
                }
                className="rounded-lg border px-3 py-2"
              />

              <input
                placeholder="GSTIN"
                value={newTransaction.gstin}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    gstin: e.target.value,
                  })
                }
                className="rounded-lg border px-3 py-2"
              />

              <select
                value={newTransaction.type}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    type: e.target.value as "Sales" | "Purchase",
                  })
                }
                className="rounded-lg border px-3 py-2"
              >
                <option value="Sales">Sales</option>
                <option value="Purchase">Purchase</option>
              </select>

              <input
                type="number"
                placeholder="Taxable Value"
                value={newTransaction.taxableValue}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    taxableValue: e.target.value,
                  })
                }
                className="rounded-lg border px-3 py-2"
              />

              <input
                type="number"
                placeholder="CGST"
                value={newTransaction.cgst}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    cgst: e.target.value,
                  })
                }
                className="rounded-lg border px-3 py-2"
              />

              <input
                type="number"
                placeholder="SGST"
                value={newTransaction.sgst}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    sgst: e.target.value,
                  })
                }
                className="rounded-lg border px-3 py-2"
              />

              <input
                type="number"
                placeholder="IGST"
                value={newTransaction.igst}
                onChange={(e) =>
                  setNewTransaction({
                    ...newTransaction,
                    igst: e.target.value,
                  })
                }
                className="rounded-lg border px-3 py-2"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="rounded-lg border px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleAddTransaction}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}