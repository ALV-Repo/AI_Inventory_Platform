"use client";

import React, { useMemo, useState } from "react";

type QuotationStatus =
  | "Draft"
  | "Sent"
  | "Accepted"
  | "Expired"
  | "Converted";

type Quotation = {
  id: string;
  customer: string;
  phone: string;
  date: string;
  validUntil: string;
  items: number;
  amount: number;
  status: QuotationStatus;
};

const initialQuotations: Quotation[] = [
  {
    id: "QT-2026-001",
    customer: "Apex Retail Solutions",
    phone: "+91 98765 43210",
    date: "21 Aug 2026",
    validUntil: "28 Aug 2026",
    items: 4,
    amount: 68500,
    status: "Sent",
  },
  {
    id: "QT-2026-002",
    customer: "Green Valley Stores",
    phone: "+91 91234 56789",
    date: "20 Aug 2026",
    validUntil: "27 Aug 2026",
    items: 2,
    amount: 32000,
    status: "Accepted",
  },
  {
    id: "QT-2026-003",
    customer: "Metro Office Supplies",
    phone: "+91 99887 66554",
    date: "19 Aug 2026",
    validUntil: "26 Aug 2026",
    items: 6,
    amount: 84500,
    status: "Draft",
  },
  {
    id: "QT-2026-004",
    customer: "Sunrise Electronics",
    phone: "+91 90123 45678",
    date: "17 Aug 2026",
    validUntil: "24 Aug 2026",
    items: 3,
    amount: 45800,
    status: "Converted",
  },
  {
    id: "QT-2026-005",
    customer: "City Mart",
    phone: "+91 93456 78901",
    date: "15 Aug 2026",
    validUntil: "22 Aug 2026",
    items: 5,
    amount: 27500,
    status: "Expired",
  },
];

const products = [
  {
    name: "Wireless Keyboard",
    price: 1200,
  },
  {
    name: "USB Microphone",
    price: 2400,
  },
  {
    name: "Gaming Mouse",
    price: 1500,
  },
  {
    name: "Bluetooth Speaker",
    price: 3200,
  },
  {
    name: "Hot Wheels Track Set",
    price: 4200,
  },
];

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function StatusBadge({ status }: { status: QuotationStatus }) {
  const styles: Record<QuotationStatus, string> = {
    Draft: "bg-slate-100 text-slate-700",
    Sent: "bg-blue-100 text-blue-700",
    Accepted: "bg-emerald-100 text-emerald-700",
    Expired: "bg-red-100 text-red-700",
    Converted: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function QuotationsPage() {
  const [quotations, setQuotations] =
    useState<Quotation[]>(initialQuotations);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showCreate, setShowCreate] = useState(false);
  const [selectedQuotation, setSelectedQuotation] =
    useState<Quotation | null>(null);

  const [showSuccess, setShowSuccess] = useState("");

  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);

  const filteredQuotations = useMemo(() => {
    return quotations.filter((quotation) => {
      const matchesSearch =
        quotation.id.toLowerCase().includes(search.toLowerCase()) ||
        quotation.customer.toLowerCase().includes(search.toLowerCase()) ||
        quotation.phone.includes(search);

      const matchesStatus =
        statusFilter === "All" || quotation.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [quotations, search, statusFilter]);

  const totalValue = quotations.reduce(
    (sum, quotation) => sum + quotation.amount,
    0
  );

  const draftCount = quotations.filter(
    (quotation) => quotation.status === "Draft"
  ).length;

  const sentCount = quotations.filter(
    (quotation) => quotation.status === "Sent"
  ).length;

  const acceptedCount = quotations.filter(
    (quotation) => quotation.status === "Accepted"
  ).length;

  const convertedCount = quotations.filter(
    (quotation) => quotation.status === "Converted"
  ).length;

  function resetCreateForm() {
    setCustomer("");
    setPhone("");
    setValidUntil("");
    setSelectedProduct("");
    setQuantity(1);
  }

  function createQuotation() {
    if (!customer.trim()) {
      alert("Please enter customer name.");
      return;
    }

    if (!selectedProduct) {
      alert("Please select a product.");
      return;
    }

    const product = products.find(
      (item) => item.name === selectedProduct
    );

    if (!product) return;

    const amount = product.price * quantity;

    const newQuotation: Quotation = {
      id: `QT-2026-${String(quotations.length + 1).padStart(3, "0")}`,
      customer,
      phone: phone || "Not provided",
      date: "21 Aug 2026",
      validUntil: validUntil || "28 Aug 2026",
      items: quantity,
      amount,
      status: "Draft",
    };

    setQuotations((current) => [newQuotation, ...current]);

    resetCreateForm();
    setShowCreate(false);
    setShowSuccess("Quotation created successfully.");
  }

  function convertToOrder(quotation: Quotation) {
    setQuotations((current) =>
      current.map((item) =>
        item.id === quotation.id
          ? { ...item, status: "Converted" }
          : item
      )
    );

    setSelectedQuotation(null);
    setShowSuccess(
      `${quotation.id} converted to a sales order successfully.`
    );
  }

  function sendQuotation(quotation: Quotation) {
    setQuotations((current) =>
      current.map((item) =>
        item.id === quotation.id
          ? { ...item, status: "Sent" }
          : item
      )
    );

    setShowSuccess(`${quotation.id} sent to customer.`);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Quotations
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Create quotations, manage customer offers and convert
              accepted quotations into sales orders.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-[#12213a] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1b3153]"
          >
            + New Quotation
          </button>
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
            <span>{showSuccess}</span>

            <button
              onClick={() => setShowSuccess("")}
              className="font-semibold"
            >
              ×
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Total Quotations
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {quotations.length}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              All quotations
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Draft
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-700">
              {draftCount}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Not yet sent
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Accepted
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {acceptedCount}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Ready for conversion
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Quotation Value
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {formatCurrency(totalValue)}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Combined quotation value
            </p>
          </div>
        </div>

        {/* Status Tabs */}
        <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2">
          {[
            "All",
            "Draft",
            "Sent",
            "Accepted",
            "Expired",
            "Converted",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                statusFilter === status
                  ? "bg-[#12213a] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {status}

              <span className="ml-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">
                {status === "All"
                  ? quotations.length
                  : quotations.filter(
                      (quotation) => quotation.status === status
                    ).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by quotation number, customer or phone..."
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-xs outline-none focus:border-blue-400"
            />

            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Quotation List */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-900">
              Quotation List
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Showing {filteredQuotations.length} of{" "}
              {quotations.length} quotations
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Quotation
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Valid Until
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Items
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredQuotations.map((quotation) => (
                  <tr
                    key={quotation.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-slate-900">
                        {quotation.id}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        Sales quotation
                      </p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="text-xs font-medium text-slate-800">
                        {quotation.customer}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        {quotation.phone}
                      </p>
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-600">
                      {quotation.date}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-600">
                      {quotation.validUntil}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-700">
                      {quotation.items}
                    </td>

                    <td className="px-4 py-4 text-xs font-bold text-slate-900">
                      {formatCurrency(quotation.amount)}
                    </td>

                    <td className="px-4 py-4">
                      <StatusBadge status={quotation.status} />
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setSelectedQuotation(quotation)
                          }
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </button>

                        {quotation.status === "Draft" && (
                          <button
                            onClick={() =>
                              sendQuotation(quotation)
                            }
                            className="rounded-md bg-blue-600 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-blue-700"
                          >
                            Send
                          </button>
                        )}

                        {quotation.status === "Accepted" && (
                          <button
                            onClick={() =>
                              convertToOrder(quotation)
                            }
                            className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-emerald-700"
                          >
                            Convert
                          </button>
                        )}

                        {quotation.status === "Converted" && (
                          <span className="px-2 py-1.5 text-[10px] font-semibold text-purple-600">
                            Order Created
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredQuotations.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-slate-700">
                No quotations found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or status filter.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Summary */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">
              Sent Quotations
            </p>

            <p className="mt-2 text-xl font-bold text-blue-600">
              {sentCount}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Awaiting customer response
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">
              Converted Orders
            </p>

            <p className="mt-2 text-xl font-bold text-purple-600">
              {convertedCount}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Quotations converted to orders
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">
              Accepted Value
            </p>

            <p className="mt-2 text-xl font-bold text-emerald-600">
              {formatCurrency(
                quotations
                  .filter(
                    (quotation) =>
                      quotation.status === "Accepted"
                  )
                  .reduce(
                    (sum, quotation) => sum + quotation.amount,
                    0
                  )
              )}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Ready for sales order conversion
            </p>
          </div>
        </div>
      </div>

      {/* Create Quotation Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  New Quotation
                </h2>

                <p className="mt-1 text-[10px] text-slate-400">
                  Create a quotation for your customer.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowCreate(false);
                  resetCreateForm();
                }}
                className="text-lg text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold text-slate-600">
                    Customer Name
                  </label>

                  <input
                    value={customer}
                    onChange={(event) =>
                      setCustomer(event.target.value)
                    }
                    placeholder="Enter customer name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold text-slate-600">
                    Phone
                  </label>

                  <input
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-semibold text-slate-600">
                  Valid Until
                </label>

                <input
                  type="date"
                  value={validUntil}
                  onChange={(event) =>
                    setValidUntil(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-bold text-slate-800">
                  Quotation Item
                </p>

                <div className="grid grid-cols-[1fr_120px] gap-3">
                  <select
                    value={selectedProduct}
                    onChange={(event) =>
                      setSelectedProduct(event.target.value)
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="">Select product</option>

                    {products.map((product) => (
                      <option
                        key={product.name}
                        value={product.name}
                      >
                        {product.name} —{" "}
                        {formatCurrency(product.price)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(
                        Math.max(1, Number(event.target.value))
                      )
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
                  />
                </div>

                {selectedProduct && (
                  <div className="mt-3 flex justify-between rounded-lg bg-white px-3 py-3 text-xs">
                    <span className="text-slate-500">
                      Estimated amount
                    </span>

                    <span className="font-bold text-slate-900">
                      {formatCurrency(
                        (products.find(
                          (product) =>
                            product.name === selectedProduct
                        )?.price || 0) * quantity
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => {
                  setShowCreate(false);
                  resetCreateForm();
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={createQuotation}
                className="rounded-lg bg-[#12213a] px-5 py-2 text-xs font-semibold text-white"
              >
                Create Quotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Quotation Modal */}
      {selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {selectedQuotation.id}
                </h2>

                <p className="mt-1 text-[10px] text-slate-400">
                  Quotation details
                </p>
              </div>

              <button
                onClick={() => setSelectedQuotation(null)}
                className="text-lg text-slate-400"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 p-6">
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Customer
                </span>

                <span className="text-xs font-semibold text-slate-900">
                  {selectedQuotation.customer}
                </span>
              </div>

              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Phone
                </span>

                <span className="text-xs font-semibold text-slate-900">
                  {selectedQuotation.phone}
                </span>
              </div>

              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Date
                </span>

                <span className="text-xs font-semibold text-slate-900">
                  {selectedQuotation.date}
                </span>
              </div>

              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Valid Until
                </span>

                <span className="text-xs font-semibold text-slate-900">
                  {selectedQuotation.validUntil}
                </span>
              </div>

              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Items
                </span>

                <span className="text-xs font-semibold text-slate-900">
                  {selectedQuotation.items}
                </span>
              </div>

              <div className="flex justify-between rounded-lg bg-blue-50 p-4">
                <span className="text-xs font-semibold text-blue-700">
                  Total Amount
                </span>

                <span className="text-base font-bold text-blue-700">
                  {formatCurrency(selectedQuotation.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Status
                </span>

                <StatusBadge
                  status={selectedQuotation.status}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setSelectedQuotation(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600"
              >
                Close
              </button>

              {selectedQuotation.status === "Accepted" && (
                <button
                  onClick={() =>
                    convertToOrder(selectedQuotation)
                  }
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Convert to Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}