"use client";

import { useMemo, useState } from "react";

type NoteType = "Credit Note" | "Debit Note";
type NoteStatus = "Draft" | "Issued" | "Cancelled";

type SalesReturnStatus =
  | "Draft"
  | "Approved"
  | "Processed"
  | "Completed"
  | "Cancelled";

type SalesReturn = {
  id: string;
  returnNumber: string;
  invoiceNumber: string;
  customer: string;
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
  reason: string;
  status: SalesReturnStatus;
  stockRestored: boolean;
  ledgerAdjusted: boolean;
};

type Note = {
  id: string;
  noteNumber: string;
  type: NoteType;
  invoiceNumber: string;
  customer: string;
  date: string;
  reason: string;
  amount: number;
  gst: number;
  status: NoteStatus;
};

const initialNotes: Note[] = [
  {
    id: "1",
    noteNumber: "CN-2026-001",
    type: "Credit Note",
    invoiceNumber: "INV-2026-041",
    customer: "Apex Retail Solutions",
    date: "04 Sep 2026",
    reason: "Sales return",
    amount: 10000,
    gst: 1800,
    status: "Issued",
  },
  {
    id: "2",
    noteNumber: "CN-2026-002",
    type: "Credit Note",
    invoiceNumber: "INV-2026-038",
    customer: "Green Valley Stores",
    date: "02 Sep 2026",
    reason: "Price adjustment",
    amount: 5000,
    gst: 900,
    status: "Issued",
  },
  {
    id: "3",
    noteNumber: "DN-2026-001",
    type: "Debit Note",
    invoiceNumber: "INV-2026-032",
    customer: "Metro Office Supplies",
    date: "01 Sep 2026",
    reason: "Additional charges",
    amount: 3000,
    gst: 540,
    status: "Draft",
  },
];

const initialSalesReturns: SalesReturn[] = [
  {
    id: "SR-1",
    returnNumber: "SR-2026-001",
    invoiceNumber: "INV-2026-041",
    customer: "Apex Retail Solutions",
    product: "Wireless Keyboard",
    quantity: 2,
    unitPrice: 1200,
    total: 2400,
    reason: "Damaged product",
    status: "Completed",
    stockRestored: true,
        ledgerAdjusted: true,
  },

  {
    id: "SR-2",
    returnNumber: "SR-2026-002",
    invoiceNumber: "INV-2026-043",
    customer: "Green Valley Stores",
    product: "Wireless Keyboard",
    quantity: 1,
    unitPrice: 1200,
    total: 1200,
    reason: "Customer return",
    status: "Draft",
    stockRestored: false,
    ledgerAdjusted: false,
  },
];

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function CreditNotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);

  const [salesReturns, setSalesReturns] =
  useState<SalesReturn[]>(initialSalesReturns);

const [showSalesReturns, setShowSalesReturns] = useState(false);
const [selectedReturn, setSelectedReturn] =
  useState<SalesReturn | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"All" | NoteType>("All");
  const [statusFilter, setStatusFilter] =
    useState<"All" | NoteStatus>("All");

  const [showCreate, setShowCreate] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [noteType, setNoteType] = useState<NoteType>("Credit Note");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [customer, setCustomer] = useState("");
  const [date, setDate] = useState("06 Sep 2026");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [gst, setGst] = useState("");

  const filteredNotes = useMemo(() => {
    const query = search.toLowerCase().trim();

    return notes.filter((note) => {
      const matchesSearch =
        !query ||
        note.noteNumber.toLowerCase().includes(query) ||
        note.invoiceNumber.toLowerCase().includes(query) ||
        note.customer.toLowerCase().includes(query);

      const matchesType =
        typeFilter === "All" || note.type === typeFilter;

      const matchesStatus =
        statusFilter === "All" || note.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [notes, search, typeFilter, statusFilter]);

  const totalCredit = notes
    .filter((note) => note.type === "Credit Note")
    .reduce((sum, note) => sum + note.amount + note.gst, 0);

  const totalDebit = notes
    .filter((note) => note.type === "Debit Note")
    .reduce((sum, note) => sum + note.amount + note.gst, 0);

  const issuedCount = notes.filter(
    (note) => note.status === "Issued"
  ).length;

  const resetForm = () => {
    setNoteType("Credit Note");
    setInvoiceNumber("");
    setCustomer("");
    setDate("06 Sep 2026");
    setReason("");
    setAmount("");
    setGst("");
  };

  const handleCreate = () => {
    if (!invoiceNumber || !customer || !reason || !amount) {
      alert("Please fill Invoice Number, Customer, Reason and Amount.");
      return;
    }

    const prefix = noteType === "Credit Note" ? "CN" : "DN";
    const existingNumbers = notes
      .filter((note) => note.type === noteType)
      .map((note) => Number(note.noteNumber.split("-").pop()) || 0);

    const nextNumber =
      existingNumbers.length > 0
        ? Math.max(...existingNumbers) + 1
        : 1;

    const newNote: Note = {
      id: crypto.randomUUID(),
      noteNumber: `${prefix}-2026-${String(nextNumber).padStart(3, "0")}`,
      type: noteType,
      invoiceNumber,
      customer,
      date,
      reason,
      amount: Number(amount) || 0,
      gst: Number(gst) || 0,
      status: "Draft",
    };

    setNotes((current) => [newNote, ...current]);
    setShowCreate(false);
    setSelectedNote(newNote);
    resetForm();
  };

    const approveSalesReturn = (id: string) => {
    setSalesReturns((currentReturns) =>
      currentReturns.map((item) =>
        item.id === id
          ? { ...item, status: "Approved" }
          : item
      )
    );

    setSelectedReturn((current) =>
      current && current.id === id
        ? { ...current, status: "Approved" }
        : current
    );
  };

  const processSalesReturn = (id: string) => {
    setSalesReturns((currentReturns) =>
      currentReturns.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Completed",
              stockRestored: true,
              ledgerAdjusted: true,
            }
          : item
      )
    );

    setSelectedReturn((current) =>
      current && current.id === id
        ? {
            ...current,
            status: "Completed",
            stockRestored: true,
            ledgerAdjusted: true,
          }
        : current
    );
  };

  const issueNote = (id: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? { ...note, status: "Issued" }
          : note
      )
    );

    setSelectedNote((current) =>
      current && current.id === id
        ? { ...current, status: "Issued" }
        : current
    );
  };

  const cancelNote = (id: string) => {
    setNotes((current) =>
      current.map((note) =>
        note.id === id
          ? { ...note, status: "Cancelled" }
          : note
      )
    );

    setSelectedNote((current) =>
      current && current.id === id
        ? { ...current, status: "Cancelled" }
        : current
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Credit / Debit Notes
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage sales credit notes, debit notes and adjustments.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            + Create Note
          </button>

          <button
  onClick={() => setShowSalesReturns(true)}
  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
>
  Sales Returns
</button>

        </div>

        {/* Summary */}
        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Credit Notes
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {formatCurrency(totalCredit)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Total credit adjustments
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Debit Notes
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-600">
              {formatCurrency(totalDebit)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Total debit adjustments
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Issued Notes
            </p>

            <p className="mt-2 text-2xl font-bold">
              {issuedCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Successfully issued notes
            </p>
          </div>

        </section>

        {/* Filters */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search note, invoice or customer..."
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "All" | NoteType)
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Credit Note">Credit Note</option>
              <option value="Debit Note">Debit Note</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "All" | NoteStatus)
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Issued">Issued</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <button
              onClick={() => {
                setSearch("");
                setTypeFilter("All");
                setStatusFilter("All");
              }}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              Clear
            </button>

          </div>
        </section>

        {/* Notes Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold">
              Notes List
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredNotes.length} of {notes.length} notes
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-sm">

              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Note</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Reason</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">GST</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {filteredNotes.map((note) => (
                  <tr
                    key={note.id}
                    className="hover:bg-slate-50"
                  >

                    <td className="px-5 py-4 font-semibold">
                      {note.noteNumber}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          note.type === "Credit Note"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {note.type}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {note.invoiceNumber}
                    </td>

                    <td className="px-5 py-4 font-medium">
                      {note.customer}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {note.date}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {note.reason}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatCurrency(note.amount)}
                    </td>

                    <td className="px-5 py-4">
                      {formatCurrency(note.gst)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          note.status === "Issued"
                            ? "bg-emerald-100 text-emerald-700"
                            : note.status === "Draft"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {note.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedNote(note)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                      >
                        View
                      </button>
                    </td>

                  </tr>
                ))}

                {filteredNotes.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      No notes found.
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Create Note Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-lg font-bold">
                  Create Credit / Debit Note
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create an adjustment against an existing sales invoice.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Note Type
                </label>

                <select
                  value={noteType}
                  onChange={(e) =>
                    setNoteType(e.target.value as NoteType)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                >
                  <option value="Credit Note">
                    Credit Note
                  </option>
                  <option value="Debit Note">
                    Debit Note
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Invoice Number
                </label>

                <input
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="INV-2026-041"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Customer
                </label>

                <input
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  placeholder="Customer name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Date
                </label>

                <input
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Reason
                </label>

                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Sales return, price adjustment, additional charges..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Taxable Amount
                </label>

                <input
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  GST Amount
                </label>

                <input
                  type="number"
                  min="0"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

            </div>

            <div className="flex justify-end gap-3 border-t p-5">

              <button
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white"
              >
                Create Note
              </button>

            </div>

          </div>
        </div>
      )}

      {/* View Modal */}

            {showSalesReturns && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">Sales Returns</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage customer sales returns and stock restoration.
                </p>
              </div>

              <button
                onClick={() => setShowSalesReturns(false)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>

            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[850px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Return</th>
                    <th className="px-4 py-3">Invoice</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {salesReturns.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-semibold">
                        {item.returnNumber}
                      </td>

                      <td className="px-4 py-4 text-slate-600">
                        {item.invoiceNumber}
                      </td>

                      <td className="px-4 py-4 font-medium">
                        {item.customer}
                      </td>

                      <td className="px-4 py-4">
                        {item.product}
                      </td>

                      <td className="px-4 py-4">
                        {item.quantity}
                      </td>

                      <td className="px-4 py-4 font-semibold">
                        {formatCurrency(item.total)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => setSelectedReturn(item)}
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
             {selectedReturn && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedReturn.returnNumber}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Sales Return Details
                </p>
              </div>

              <button
                onClick={() => setSelectedReturn(null)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Invoice</p>
                  <p className="mt-1 font-semibold">
                    {selectedReturn.invoiceNumber}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Customer</p>
                  <p className="mt-1 font-semibold">
                    {selectedReturn.customer}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Product</p>
                  <p className="mt-1 font-semibold">
                    {selectedReturn.product}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">Quantity</p>
                  <p className="mt-1 font-semibold">
                    {selectedReturn.quantity}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-slate-400">Reason</p>
                <p className="mt-1 font-medium">
                  {selectedReturn.reason}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Unit Price</span>
                  <span>
                    {formatCurrency(selectedReturn.unitPrice)}
                  </span>
                </div>

                <div className="mt-3 flex justify-between border-t pt-3">
                  <span className="font-semibold">Return Total</span>
                  <span className="text-lg font-bold">
                    {formatCurrency(selectedReturn.total)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-4">
                  <p className="text-xs text-slate-400">Stock Restored</p>
                  <p className="mt-1 font-semibold text-emerald-600">
                    {selectedReturn.stockRestored ? "Yes" : "No"}
                  </p>
                </div>

                <div className="rounded-lg border p-4">
                  <p className="text-xs text-slate-400">
                    Customer Ledger
                  </p>
                  <p className="mt-1 font-semibold text-emerald-600">
                    {selectedReturn.ledgerAdjusted
                      ? "Adjusted"
                      : "Pending"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4">
  <div>
    <span className="text-sm text-slate-500">Status</span>
    <div className="mt-1">
      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        {selectedReturn.status}
      </span>
    </div>
  </div>

  {selectedReturn.status === "Draft" && (
    <button
      onClick={() => approveSalesReturn(selectedReturn.id)}
      className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
    >
      Approve Return
    </button>
  )}

  {selectedReturn.status === "Approved" && (
  <button
    onClick={() => processSalesReturn(selectedReturn.id)}
    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
  >
    Process Return
  </button>
)}
</div>
            </div>
          </div>
        </div>
      )}

      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedNote.noteNumber}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedNote.type}
                </p>
              </div>

              <button
                onClick={() => setSelectedNote(null)}
                className="rounded-lg border px-3 py-2 text-sm"
              >
                Close
              </button>
            </div>

            <div className="space-y-4 p-5">

              <div className="grid grid-cols-2 gap-4">

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Customer
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedNote.customer}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Invoice
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedNote.invoiceNumber}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Date
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedNote.date}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Status
                  </p>

                  <span className="mt-1 inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                    {selectedNote.status}
                  </span>
                </div>

              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-slate-400">
                  Reason
                </p>

                <p className="mt-1 font-medium">
                  {selectedNote.reason}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-5">

                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">
                    Taxable Amount
                  </span>

                  <span>
                    {formatCurrency(selectedNote.amount)}
                  </span>
                </div>

                <div className="mt-3 flex justify-between text-sm">
                  <span className="text-slate-500">
                    GST
                  </span>

                  <span>
                    {formatCurrency(selectedNote.gst)}
                  </span>
                </div>

                <div className="mt-3 flex justify-between border-t pt-3">
                  <span className="font-semibold">
                    Total
                  </span>

                  <span className="text-lg font-bold">
                    {formatCurrency(
                      selectedNote.amount + selectedNote.gst
                    )}
                  </span>
                </div>

              </div>

              <div className="flex flex-wrap justify-end gap-3">

                {selectedNote.status === "Draft" && (
                  <button
                    onClick={() => issueNote(selectedNote.id)}
                    className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Issue Note
                  </button>
                )}

                {selectedNote.status !== "Cancelled" && (
                  <button
                    onClick={() => cancelNote(selectedNote.id)}
                    className="rounded-lg border border-red-300 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Cancel Note
                  </button>
                )}

              </div>

            </div>
          </div>
        </div>
      )}

    </main>
  );
}