"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

type Purchase = {
  id: string;
  invoice: string;
  date: string;
  items: number;
  amount: number;
  payment: "Paid" | "Pending" | "Overdue";
  status: "Completed" | "Processing" | "Cancelled";
};

const customerData = {
  1: {
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul.sharma@example.com",
    city: "Hyderabad",
    status: "Active",
    creditLimit: 100000,
    outstanding: 12500,
    purchases: 45890,
    orders: 12,
  },
  2: {
    name: "Priya Reddy",
    phone: "+91 99887 66554",
    email: "priya.reddy@example.com",
    city: "Vijayawada",
    status: "Active",
    creditLimit: 75000,
    outstanding: 6200,
    purchases: 32450,
    orders: 8,
  },
  3: {
    name: "Arjun Kumar",
    phone: "+91 91234 56789",
    email: "arjun.kumar@example.com",
    city: "Bangalore",
    status: "Active",
    creditLimit: 50000,
    outstanding: 8500,
    purchases: 18750,
    orders: 5,
  },
  4: {
    name: "Sneha Verma",
    phone: "+91 93456 78901",
    email: "sneha.verma@example.com",
    city: "Chennai",
    status: "Inactive",
    creditLimit: 40000,
    outstanding: 0,
    purchases: 12600,
    orders: 4,
  },
  5: {
    name: "Vikram Singh",
    phone: "+91 97654 32109",
    email: "vikram.singh@example.com",
    city: "Mumbai",
    status: "Active",
    creditLimit: 125000,
    outstanding: 18500,
    purchases: 56200,
    orders: 15,
  },
  6: {
    name: "Ananya Patel",
    phone: "+91 94567 89012",
    email: "ananya.patel@example.com",
    city: "Pune",
    status: "Active",
    creditLimit: 60000,
    outstanding: 4200,
    purchases: 28900,
    orders: 7,
  },
};

const purchaseHistory: Record<number, Purchase[]> = {
  1: [
    {
      id: "1",
      invoice: "INV-2026-041",
      date: "21 Aug 2026",
      items: 4,
      amount: 12500,
      payment: "Pending",
      status: "Processing",
    },
    {
      id: "2",
      invoice: "INV-2026-032",
      date: "19 Aug 2026",
      items: 3,
      amount: 9800,
      payment: "Paid",
      status: "Completed",
    },
    {
      id: "3",
      invoice: "INV-2026-018",
      date: "14 Aug 2026",
      items: 5,
      amount: 14300,
      payment: "Paid",
      status: "Completed",
    },
    {
      id: "4",
      invoice: "INV-2026-007",
      date: "05 Aug 2026",
      items: 2,
      amount: 9290,
      payment: "Paid",
      status: "Completed",
    },
  ],

  2: [
    {
      id: "1",
      invoice: "INV-2026-038",
      date: "20 Aug 2026",
      items: 2,
      amount: 8200,
      payment: "Paid",
      status: "Completed",
    },
    {
      id: "2",
      invoice: "INV-2026-021",
      date: "16 Aug 2026",
      items: 3,
      amount: 10450,
      payment: "Paid",
      status: "Completed",
    },
    {
      id: "3",
      invoice: "INV-2026-009",
      date: "07 Aug 2026",
      items: 2,
      amount: 13800,
      payment: "Pending",
      status: "Processing",
    },
  ],

  3: [
    {
      id: "1",
      invoice: "INV-2026-035",
      date: "20 Aug 2026",
      items: 2,
      amount: 6250,
      payment: "Paid",
      status: "Completed",
    },
    {
      id: "2",
      invoice: "INV-2026-017",
      date: "13 Aug 2026",
      items: 3,
      amount: 12500,
      payment: "Pending",
      status: "Processing",
    },
  ],

  4: [
    {
      id: "1",
      invoice: "INV-2026-027",
      date: "18 Aug 2026",
      items: 3,
      amount: 12600,
      payment: "Paid",
      status: "Completed",
    },
  ],

  5: [
    {
      id: "1",
      invoice: "INV-2026-029",
      date: "18 Aug 2026",
      items: 5,
      amount: 18200,
      payment: "Paid",
      status: "Completed",
    },
    {
      id: "2",
      invoice: "INV-2026-014",
      date: "11 Aug 2026",
      items: 4,
      amount: 19800,
      payment: "Pending",
      status: "Processing",
    },
    {
      id: "3",
      invoice: "INV-2026-005",
      date: "03 Aug 2026",
      items: 3,
      amount: 8200,
      payment: "Paid",
      status: "Completed",
    },
  ],

  6: [
    {
      id: "1",
      invoice: "INV-2026-031",
      date: "19 Aug 2026",
      items: 2,
      amount: 9500,
      payment: "Paid",
      status: "Completed",
    },
    {
      id: "2",
      invoice: "INV-2026-012",
      date: "09 Aug 2026",
      items: 3,
      amount: 7600,
      payment: "Paid",
      status: "Completed",
    },
    {
      id: "3",
      invoice: "INV-2026-003",
      date: "02 Aug 2026",
      items: 2,
      amount: 11800,
      payment: "Pending",
      status: "Processing",
    },
  ],
};

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function CustomerDetailPage() {
  const params = useParams();

  const customerId = Number(params.id);

  const customer =
    customerData[customerId as keyof typeof customerData] ||
    customerData[1];

  const purchases = purchaseHistory[customerId] || purchaseHistory[1];

  const [activeTab, setActiveTab] = useState<
    "overview" | "history"
  >("overview");

  const [search, setSearch] = useState("");

  const filteredPurchases = purchases.filter((purchase) => {
    const value = search.toLowerCase();

    return (
      purchase.invoice.toLowerCase().includes(value) ||
      purchase.date.toLowerCase().includes(value) ||
      purchase.payment.toLowerCase().includes(value) ||
      purchase.status.toLowerCase().includes(value)
    );
  });

  const paidAmount = purchases
    .filter((purchase) => purchase.payment === "Paid")
    .reduce((sum, purchase) => sum + purchase.amount, 0);

  const pendingAmount = purchases
    .filter((purchase) => purchase.payment !== "Paid")
    .reduce((sum, purchase) => sum + purchase.amount, 0);

  const creditAvailable =
    customer.creditLimit - customer.outstanding;

  return (
    <main className="min-h-screen bg-slate-50 p-6 text-slate-900">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <div className="mb-5">
          <Link
            href="/customers"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Customers
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#12213a] text-xl font-bold text-white">
                {customer.name
                  .split(" ")
                  .map((name) => name[0])
                  .join("")
                  .slice(0, 2)}
              </div>

              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold">
                    {customer.name}
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      customer.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {customer.status}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Customer #{customerId} • {customer.city}
                </p>
              </div>

            </div>

            <button
              onClick={() =>
                alert("Edit customer form coming soon")
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
            >
              Edit Customer
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <MetricCard
            title="TOTAL PURCHASES"
            value={formatCurrency(customer.purchases)}
            subtitle="Lifetime purchase value"
            color="text-blue-600"
          />

          <MetricCard
            title="TOTAL ORDERS"
            value={customer.orders}
            subtitle="Orders placed"
            color="text-slate-900"
          />

          <MetricCard
            title="OUTSTANDING"
            value={formatCurrency(customer.outstanding)}
            subtitle="Amount pending"
            color="text-orange-500"
          />

          <MetricCard
            title="AVAILABLE CREDIT"
            value={formatCurrency(Math.max(creditAvailable, 0))}
            subtitle={`Limit ${formatCurrency(customer.creditLimit)}`}
            color="text-emerald-600"
          />

        </section>

        {/* Tabs */}
        <div className="mb-5 flex gap-2 rounded-xl border border-slate-200 bg-white p-2">

          <button
            onClick={() => setActiveTab("overview")}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
              activeTab === "overview"
                ? "bg-[#12213a] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
              activeTab === "history"
                ? "bg-[#12213a] text-white"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Purchase History
          </button>

        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">

            {/* Contact Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Customer Information
              </h2>

              <div className="mt-5 space-y-4">

                <InfoRow
                  label="Full Name"
                  value={customer.name}
                />

                <InfoRow
                  label="Phone"
                  value={customer.phone}
                />

                <InfoRow
                  label="Email"
                  value={customer.email}
                />

                <InfoRow
                  label="City"
                  value={customer.city}
                />

                <InfoRow
                  label="Customer Status"
                  value={customer.status}
                />

              </div>
            </div>

            {/* Credit Information */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold">
                Credit Information
              </h2>

              <div className="mt-5 grid grid-cols-2 gap-4">

                <CreditBox
                  label="Credit Limit"
                  value={formatCurrency(customer.creditLimit)}
                />

                <CreditBox
                  label="Outstanding"
                  value={formatCurrency(customer.outstanding)}
                />

                <CreditBox
                  label="Available Credit"
                  value={formatCurrency(
                    Math.max(creditAvailable, 0)
                  )}
                />

                <CreditBox
                  label="Orders"
                  value={String(customer.orders)}
                />

              </div>

              <div className="mt-5">
                <div className="mb-2 flex justify-between text-xs">
                  <span className="text-slate-500">
                    Credit utilization
                  </span>

                  <span className="font-semibold">
                    {Math.round(
                      (customer.outstanding /
                        customer.creditLimit) *
                        100
                    )}
                    %
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${Math.min(
                        (customer.outstanding /
                          customer.creditLimit) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <h2 className="text-lg font-bold">
                Purchase Summary
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

                <SummaryBox
                  label="Lifetime Purchases"
                  value={formatCurrency(customer.purchases)}
                  color="text-blue-600"
                />

                <SummaryBox
                  label="Paid Purchases"
                  value={formatCurrency(paidAmount)}
                  color="text-emerald-600"
                />

                <SummaryBox
                  label="Pending Purchases"
                  value={formatCurrency(pendingAmount)}
                  color="text-orange-500"
                />

              </div>
            </div>

          </section>
        )}

        {/* Purchase History */}
        {activeTab === "history" && (
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-lg font-bold">
                  Purchase History
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Complete sales and invoice history for this customer.
                </p>
              </div>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoice or status..."
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />

            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">

                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

                  <tr>
                    <th className="px-5 py-3">
                      Invoice
                    </th>

                    <th className="px-5 py-3">
                      Date
                    </th>

                    <th className="px-5 py-3">
                      Items
                    </th>

                    <th className="px-5 py-3">
                      Amount
                    </th>

                    <th className="px-5 py-3">
                      Payment
                    </th>

                    <th className="px-5 py-3">
                      Status
                    </th>

                    <th className="px-5 py-3">
                      Action
                    </th>
                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredPurchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="font-semibold">
                          {purchase.invoice}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Sales invoice
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {purchase.date}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {purchase.items}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold">
                        {formatCurrency(purchase.amount)}
                      </td>

                      <td className="px-5 py-4">
                        <PaymentBadge
                          payment={purchase.payment}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <OrderStatusBadge
                          status={purchase.status}
                        />
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() =>
                            alert(
                              `Invoice: ${purchase.invoice}\nAmount: ${formatCurrency(
                                purchase.amount
                              )}`
                            )
                          }
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

            {filteredPurchases.length === 0 && (
              <div className="p-12 text-center text-sm text-slate-500">
                No purchase history found.
              </div>
            )}

          </section>
        )}
      </div>
    </main>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  color = "text-slate-900",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>

      <p className={`mt-2 text-2xl font-bold ${color}`}>
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {subtitle}
      </p>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function CreditBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-base font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function SummaryBox({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-xl font-bold ${color}`}>
        {value}
      </p>
    </div>
  );
}

function PaymentBadge({
  payment,
}: {
  payment: Purchase["payment"];
}) {
  const styles = {
    Paid: "bg-emerald-100 text-emerald-700",
    Pending: "bg-blue-100 text-blue-700",
    Overdue: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[payment]}`}
    >
      {payment}
    </span>
  );
}

function OrderStatusBadge({
  status,
}: {
  status: Purchase["status"];
}) {
  const styles = {
    Completed: "bg-emerald-100 text-emerald-700",
    Processing: "bg-amber-100 text-amber-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}