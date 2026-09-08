"use client";

import { useEffect, useMemo, useState } from "react";

type InvoiceStatus = "Paid" | "Pending" | "Overdue";

type Invoice = {
  id: string;
  invoiceNumber: string;
  customer: string;
  phone: string;
  gstin?: string;
  placeOfSupply?: string;
  hsnSac?: string;
  date: string;
  dueDate: string;
  items: number;
  amount: number;
  gst: number;
  status: InvoiceStatus;
  paymentMode: string;
  irn?: string;
  irnStatus?: "Generated" | "Not Generated";
};

const initialInvoices: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2026-041",
    customer: "Apex Retail Solutions",
    phone: "+91 98765 43210",
    gstin: "29ABCDE1234F1Z5",
placeOfSupply: "Karnataka",
hsnSac: "8471",
irn: "",
irnStatus: "Not Generated",
    date: "21 Aug 2026",
    dueDate: "28 Aug 2026",
    items: 4,
    amount: 68500,
    gst: 12330,
    status: "Pending",
    paymentMode: "Bank Transfer",
  },
  {
    id: "2",
    invoiceNumber: "INV-2026-038",
    customer: "Green Valley Stores",
    phone: "+91 91234 56789",
    date: "20 Aug 2026",
    dueDate: "20 Aug 2026",
    items: 2,
    amount: 32000,
    gst: 5760,
    status: "Paid",
    paymentMode: "UPI",
  },
  {
    id: "3",
    invoiceNumber: "INV-2026-032",
    customer: "Metro Office Supplies",
    phone: "+91 99887 66554",
    date: "19 Aug 2026",
    dueDate: "26 Aug 2026",
    items: 6,
    amount: 84500,
    gst: 15210,
    status: "Paid",
    paymentMode: "Card",
  },
  {
    id: "4",
    invoiceNumber: "INV-2026-027",
    customer: "Sunrise Electronics",
    phone: "+91 90123 45678",
    date: "18 Aug 2026",
    dueDate: "24 Aug 2026",
    items: 3,
    amount: 45800,
    gst: 8244,
    status: "Paid",
    paymentMode: "UPI",
  },
  {
    id: "5",
    invoiceNumber: "INV-2026-021",
    customer: "City Mart",
    phone: "+91 93456 78901",
    date: "17 Aug 2026",
    dueDate: "22 Aug 2026",
    items: 5,
    amount: 27500,
    gst: 4950,
    status: "Overdue",
    paymentMode: "Cash",
  },
];

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function InvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | InvoiceStatus>("All");
  const [selectedInvoice, setSelectedInvoice] =
    useState<Invoice | null>(null);

    const [invoices, setInvoices] = useState<Invoice[]>(() => {
  if (typeof window === "undefined") {
    return initialInvoices;
  }

  const saved = localStorage.getItem("stockflow-invoices");

  return saved ? JSON.parse(saved) : initialInvoices;
});

useEffect(() => {
  localStorage.setItem("stockflow-invoices", JSON.stringify(invoices));
}, [invoices]);

const [invoicePrefix, setInvoicePrefix] = useState("INV-");
const [invoiceFinancialYear, setInvoiceFinancialYear] = useState("2026");
const [nextInvoiceNumber, setNextInvoiceNumber] = useState("042");
const [showNumberingSettings, setShowNumberingSettings] = useState(false);

  const filteredInvoices = useMemo(() => {
    const query = search.toLowerCase().trim();

    return invoices.filter((invoice) => {
      const matchesSearch =
        !query ||
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        invoice.customer.toLowerCase().includes(query) ||
        invoice.phone.toLowerCase().includes(query);

      const matchesStatus =
        status === "All" || invoice.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const totalValue = invoices.reduce(
    (sum, invoice) => sum + invoice.amount,
    0
  );

  const paidValue = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const pendingValue = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);

    const handleGenerateIrn = () => {
  if (!selectedInvoice) return;

  const mockIrn =
    `${crypto.randomUUID().replace(/-/g, "")}${crypto
      .randomUUID()
      .replace(/-/g, "")}`;

  const updatedInvoice = {
  ...selectedInvoice,
  irn: mockIrn,
  irnStatus: "Generated" as const,
};

setSelectedInvoice(updatedInvoice);

setInvoices((currentInvoices) =>
  currentInvoices.map((invoice) =>
    invoice.id === selectedInvoice.id ? updatedInvoice : invoice
  )
);
};

  return (
  <>
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Invoices</h1>
            <p className="mt-1 text-sm text-slate-500">
              View invoices, GST breakup, payment status and printable
              invoice documents.
            </p>
          </div>

          <div className="flex gap-2">
  <button
    onClick={() => setShowNumberingSettings(true)}
    className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
  >
    ⚙ Numbering Series
  </button>

  <button
    onClick={() => window.print()}
    className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
  >
    Print / PDF
  </button>
</div>
        </div>

        {/* Summary cards */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Invoices
            </p>
            <p className="mt-2 text-2xl font-bold">
              {invoices.length}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              All sales invoices
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Invoice Value
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {formatCurrency(totalValue)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Combined invoice value
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Paid Value
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {formatCurrency(paidValue)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Successfully collected
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Outstanding
            </p>
            <p className="mt-2 text-2xl font-bold text-orange-500">
              {formatCurrency(pendingValue)}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Pending / overdue invoices
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
              placeholder="Search invoice number, customer or phone..."
              className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "All" | InvoiceStatus)
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Overdue">Overdue</option>
            </select>

            <button
              onClick={() => {
                setSearch("");
                setStatus("All");
              }}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </section>

        {/* Invoice list */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold">Invoice List</h2>
            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredInvoices.length} of {invoices.length} invoices
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">GST</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">IRN Status</th>
                  <th className="px-5 py-3">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">
                        {invoice.invoiceNumber}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Sales invoice
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium">
                        {invoice.customer}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {invoice.phone}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {invoice.date}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {invoice.dueDate}
                    </td>

                    <td className="px-5 py-4">
                      {invoice.items}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {formatCurrency(invoice.amount)}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {formatCurrency(invoice.gst)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          invoice.status === "Paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : invoice.status === "Pending"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
  <span
    className={`rounded-full px-3 py-1 text-xs font-semibold ${
      invoice.irnStatus === "Generated"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-orange-100 text-orange-700"
    }`}
  >
    {invoice.irnStatus ?? "Not Generated"}
  </span>
</td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Bottom summary */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Paid Invoices
            </p>
            <p className="mt-2 text-xl font-bold text-emerald-600">
              {invoices.filter((i) => i.status === "Paid").length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Pending Invoices
            </p>
            <p className="mt-2 text-xl font-bold text-blue-600">
              {invoices.filter((i) => i.status === "Pending").length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Overdue Invoices
            </p>
            <p className="mt-2 text-xl font-bold text-red-600">
              {invoices.filter((i) => i.status === "Overdue").length}
            </p>
          </div>
        </section>
      </div>

      {/* Invoice modal */}
      {selectedInvoice && (
        <div className="invoice-print-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="invoice-print-modal max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-6">
              <div>
                <h2 className="text-xl font-bold">
                  Invoice {selectedInvoice.invoiceNumber}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tax invoice and GST details
                </p>
              </div>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-400">
                    Bill To
                  </p>
                  <p className="mt-2 font-semibold">
                    {selectedInvoice.customer}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedInvoice.phone}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs uppercase text-slate-400">
                    Invoice Details
                  </p>
                  <p className="mt-2 text-sm">
                    Invoice:{" "}
                    <strong>
                      {selectedInvoice.invoiceNumber}
                    </strong>
                  </p>
                  <p className="mt-1 text-sm">
                    Date: {selectedInvoice.date}
                  </p>
                  <p className="mt-1 text-sm">
                    Due: {selectedInvoice.dueDate}
                  </p>
                  <div className="mt-3 border-t border-slate-200 pt-3">
  <p className="text-xs uppercase text-slate-400">
    E-Invoice / IRN Status
  </p>

  <p
    className={`mt-1 font-semibold ${
      selectedInvoice.irnStatus === "Generated"
        ? "text-emerald-600"
        : "text-orange-600"
    }`}
  >
    {selectedInvoice.irnStatus ?? "Not Generated"}
  </p>

  {selectedInvoice.irn && (
    <p className="mt-2 break-all text-xs text-slate-500">
      IRN: {selectedInvoice.irn}
    </p>
  )}
</div>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        Description
                      </th>
                      <th className="px-4 py-3 text-right">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-right">
                        Taxable Value
                      </th>
                      <th className="px-4 py-3 text-right">
                        GST
                      </th>
                      <th className="px-4 py-3 text-right">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-t">
                      <td className="px-4 py-4">
                        Product / Sales Items
                      </td>
                      <td className="px-4 py-4 text-right">
                        {selectedInvoice.items}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {formatCurrency(
                          selectedInvoice.amount -
                            selectedInvoice.gst
                        )}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {formatCurrency(selectedInvoice.gst)}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold">
                        {formatCurrency(selectedInvoice.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

                            {/* GST Breakup */}
              <div className="mt-6 rounded-lg border border-slate-200">
                <div className="border-b bg-slate-50 px-4 py-3">
                  <h3 className="font-semibold">GST Breakup</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      Taxable Amount
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatCurrency(
                        selectedInvoice.amount -
                          selectedInvoice.gst
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      CGST
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatCurrency(selectedInvoice.gst / 2)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      SGST
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatCurrency(selectedInvoice.gst / 2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Totals */}
              <div className="mt-6 flex justify-end">
                <div className="w-full max-w-sm space-y-3 rounded-lg bg-slate-50 p-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Taxable Amount
                    </span>
                    <span>
                      {formatCurrency(
                        selectedInvoice.amount -
                          selectedInvoice.gst
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      GST
                    </span>
                    <span>
                      {formatCurrency(selectedInvoice.gst)}
                    </span>
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">
                        Grand Total
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(selectedInvoice.amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="mt-6 rounded-lg border border-slate-200 p-5">
                <h3 className="font-semibold">
                  Payment Information
                </h3>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-400">
                      Payment Mode
                    </p>
                    <p className="mt-1 font-medium">
                      {selectedInvoice.paymentMode}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Payment Status
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedInvoice.status === "Paid"
                          ? "bg-emerald-100 text-emerald-700"
                          : selectedInvoice.status === "Pending"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedInvoice.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Invoice Amount
                    </p>
                    <p className="mt-1 font-semibold">
                      {formatCurrency(selectedInvoice.amount)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Invoice Footer */}
              <div className="mt-6 border-t pt-5">
                <p className="text-center text-xs text-slate-400">
                  This is a computer-generated tax invoice.
                </p>
                <p className="mt-1 text-center text-xs text-slate-400">
                  AI StockFlow • Inventory & Business Management
                </p>
              </div>

              {/* Modal Actions */}
<div className="mt-6 flex flex-wrap justify-end gap-3">
  {selectedInvoice.irnStatus !== "Generated" && (
    <button
      onClick={handleGenerateIrn}
      className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
    >
      Generate IRN
    </button>
  )}

  <button
    onClick={() => setSelectedInvoice(null)}
    className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50"
  >
    Close
  </button>

  <button
    onClick={() => window.print()}
    className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
  >
    Print Invoice
  </button>
</div>
            </div>
          </div>
        </div>
      )}

          {/* Print styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 8mm;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            height: auto !important;
          }

          body * {
            visibility: hidden !important;
          }

          .invoice-print-overlay,
          .invoice-print-overlay * {
            visibility: visible !important;
          }

          .invoice-print-overlay {
            position: absolute !important;
            inset: 0 !important;
            display: block !important;
            width: 100% !important;
            height: auto !important;
            min-height: 0 !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }

          .invoice-print-modal {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            max-width: none !important;
            height: auto !important;
            max-height: none !important;
            min-height: 0 !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            zoom: 0.68 !important;
            width: 100% !important;
          }

          .invoice-print-modal button {
            display: none !important;
          }

          .invoice-print-modal * {
            break-inside: avoid !important;
          }
        }
      `}</style>  
    </main>

    {showNumberingSettings && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Invoice Numbering Series
          </h2>
          <p className="text-xs text-slate-500">
            Configure the invoice numbering format.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNumberingSettings(false)}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Close
        </button>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Prefix
          </label>
          <input
            type="text"
            value={invoicePrefix}
onChange={(e) => setInvoicePrefix(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Financial Year
          </label>
          <input
            type="text"
            value={invoiceFinancialYear}
onChange={(e) => setInvoiceFinancialYear(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Next Number
          </label>
          <input
            type="text"
            value={nextInvoiceNumber}
            onChange={(e) => {
  const value = e.target.value;
  setNextInvoiceNumber(value);
}}
            min={1}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
  Preview:
  <span className="ml-2 font-semibold text-slate-900">
    {invoicePrefix}
    {invoiceFinancialYear}-
    {String(Number(nextInvoiceNumber) || 0).padStart(3, "0")}
  </span>
</div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => setShowNumberingSettings(false)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
  const newInvoiceNumber = `${invoicePrefix}${invoiceFinancialYear}-${String(
    Number(nextInvoiceNumber) || 0
  ).padStart(3, "0")}`;

  setInvoices((currentInvoices) =>
    currentInvoices.map((invoice) =>
      invoice.id === "1"
        ? { ...invoice, invoiceNumber: newInvoiceNumber }
        : invoice
    )
  );

  setShowNumberingSettings(false);
}}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Save Series
          </button>
        </div>
      </div>
    </div>
  </div>
)}

   </>
  );
}