"use client";

import { useEffect, useMemo, useState } from "react";

type Payment = {
  id: string;
  party: string;
  type: "Customer" | "Supplier";
  reference: string;
  amount: number;
  mode: "Cash" | "UPI" | "Card" | "Bank Transfer";
  date: string;
  status: "Completed" | "Pending";
};

const initialPayments: Payment[] = [
  {
    id: "PAY-1001",
    party: "Apex Retail Solutions",
    type: "Customer",
    reference: "INV-2026-041",
    amount: 68500,
    mode: "Bank Transfer",
    date: "15/08/2026",
    status: "Completed",
  },
  {
    id: "PAY-1002",
    party: "Tech Supplies India",
    type: "Supplier",
    reference: "PO-00005",
    amount: 87500,
    mode: "Bank Transfer",
    date: "14/08/2026",
    status: "Completed",
  },
  {
    id: "PAY-1003",
    party: "Green Valley Stores",
    type: "Customer",
    reference: "INV-2026-038",
    amount: 56000,
    mode: "UPI",
    date: "13/08/2026",
    status: "Completed",
  },
  {
    id: "PAY-1004",
    party: "Office Mart Suppliers",
    type: "Supplier",
    reference: "PO-00006",
    amount: 32500,
    mode: "UPI",
    date: "12/08/2026",
    status: "Pending",
  },
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAddPayment, setShowAddPayment] = useState(false);

  const [party, setParty] = useState("");
  const [type, setType] = useState<"Customer" | "Supplier">("Customer");
  const [reference, setReference] = useState("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<Payment["mode"]>("Cash");
  const [date, setDate] = useState("2026-09-07");

  useEffect(() => {
    const saved = localStorage.getItem("stockflow-payments");

    if (saved) {
      setPayments(JSON.parse(saved));
    } else {
      setPayments(initialPayments);
      localStorage.setItem(
        "stockflow-payments",
        JSON.stringify(initialPayments)
      );
    }
  }, []);

  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem("stockflow-payments", JSON.stringify(payments));
    }
  }, [payments]);

  const filteredPayments = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !query ||
        payment.party.toLowerCase().includes(query) ||
        payment.reference.toLowerCase().includes(query) ||
        payment.id.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "All" || payment.type === typeFilter;

      const matchesStatus =
        statusFilter === "All" || payment.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [payments, search, typeFilter, statusFilter]);

  const totalReceived = payments
    .filter(
      (payment) =>
        payment.type === "Customer" && payment.status === "Completed"
    )
    .reduce((sum, payment) => sum + payment.amount, 0);

  const totalPaid = payments
    .filter(
      (payment) =>
        payment.type === "Supplier" && payment.status === "Completed"
    )
    .reduce((sum, payment) => sum + payment.amount, 0);

  const pendingAmount = payments
    .filter((payment) => payment.status === "Pending")
    .reduce((sum, payment) => sum + payment.amount, 0);

  const clearForm = () => {
    setParty("");
    setType("Customer");
    setReference("");
    setAmount("");
    setMode("Cash");
    setDate("2026-09-07");
  };

  const handleAddPayment = () => {
    if (!party.trim() || !amount || Number(amount) <= 0) {
      alert("Please enter party name and a valid amount.");
      return;
    }

    const newPayment: Payment = {
      id: `PAY-${Date.now()}`,
      party: party.trim(),
      type,
      reference: reference.trim() || "Manual Payment",
      amount: Number(amount),
      mode,
      date: new Date(date).toLocaleDateString("en-GB"),
      status: "Completed",
    };

    setPayments((current) => [newPayment, ...current]);
    setShowAddPayment(false);
    clearForm();

    alert("Payment recorded successfully.");
  };

  const markCompleted = (id: string) => {
    setPayments((current) =>
      current.map((payment) =>
        payment.id === id
          ? { ...payment, status: "Completed" }
          : payment
      )
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Payment Management
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Record and track customer receipts and supplier payments.
            </p>
          </div>

          <button
            onClick={() => setShowAddPayment(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Payment
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-400">
              Customer Receipts
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              ₹{totalReceived.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Completed customer payments
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-400">
              Supplier Payments
            </p>
            <p className="mt-2 text-2xl font-bold text-orange-600">
              ₹{totalPaid.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Completed supplier payments
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-400">
              Pending Payments
            </p>
            <p className="mt-2 text-2xl font-bold text-red-600">
              ₹{pendingAmount.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Payments requiring attention
            </p>
          </div>
        </div>

        <div className="mb-5 rounded-xl border bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search party, reference or payment ID..."
              className="rounded-lg border px-3 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="All">All Types</option>
              <option value="Customer">Customer</option>
              <option value="Supplier">Supplier</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="All">All Status</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {(search || typeFilter !== "All" || statusFilter !== "All") && (
            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("All");
                setStatusFilter("All");
              }}
              className="mt-3 text-xs font-medium text-blue-600"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Payment Records
            </h2>
            <p className="text-xs text-slate-500">
              Customer collections and supplier settlements
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Party</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Mode</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {payment.id}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {payment.party}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          payment.type === "Customer"
                            ? "text-green-600"
                            : "text-orange-600"
                        }
                      >
                        {payment.type}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {payment.reference}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {payment.date}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {payment.mode}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      ₹{payment.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={
                          payment.status === "Completed"
                            ? "rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-700"
                        }
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {payment.status === "Pending" && (
                        <button
                          onClick={() => markCompleted(payment.id)}
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredPayments.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-10 text-center text-sm text-slate-500"
                    >
                      No payments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t px-5 py-3 text-xs text-slate-500">
            Showing {filteredPayments.length} of {payments.length} payments
          </div>
        </div>
      </div>

      {showAddPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Add Payment
                </h2>
                <p className="text-xs text-slate-500">
                  Record a customer receipt or supplier payment.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowAddPayment(false);
                  clearForm();
                }}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Party
                </label>
                <input
                  value={party}
                  onChange={(e) => setParty(e.target.value)}
                  placeholder="Customer or supplier name"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) =>
                      setType(e.target.value as "Customer" | "Supplier")
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option value="Customer">Customer Receipt</option>
                    <option value="Supplier">Supplier Payment</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Amount
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-600">
                  Reference
                </label>
                <input
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="Invoice / PO / transaction reference"
                  className="w-full rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Payment Mode
                  </label>
                  <select
                    value={mode}
                    onChange={(e) =>
                      setMode(e.target.value as Payment["mode"])
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  >
                    <option>Cash</option>
                    <option>UPI</option>
                    <option>Card</option>
                    <option>Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-lg border px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t px-6 py-4">
              <button
                onClick={() => {
                  setShowAddPayment(false);
                  clearForm();
                }}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={handleAddPayment}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}