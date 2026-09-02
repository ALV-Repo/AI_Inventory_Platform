"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

type Supplier = {
  id: number;
  name: string;
  code: string;
  contact: string;
  email: string;
  phone: string;
  category: string;
  location: string;
  rating: number;
  totalOrders: number;
  totalValue: number;
  outstanding: number;
  status: "Active" | "On Hold";
  lastOrder: string;
};

const supplierData: Record<number, Supplier> = {
  1: {
    id: 1,
    name: "Tech Supplies India",
    code: "SUP-001",
    contact: "Rahul Mehta",
    email: "rahul@techsupplies.in",
    phone: "+91 98765 43210",
    category: "Electronics",
    location: "Bengaluru",
    rating: 4.8,
    totalOrders: 24,
    totalValue: 845000,
    outstanding: 42000,
    status: "Active",
    lastOrder: "21 Aug 2026",
  },

  2: {
    id: 2,
    name: "Digital World",
    code: "SUP-002",
    contact: "Priya Sharma",
    email: "priya@digitalworld.in",
    phone: "+91 99887 66554",
    category: "Electronics",
    location: "Hyderabad",
    rating: 4.5,
    totalOrders: 18,
    totalValue: 628000,
    outstanding: 28000,
    status: "Active",
    lastOrder: "20 Aug 2026",
  },

  3: {
    id: 3,
    name: "Office Mart",
    code: "SUP-003",
    contact: "Arjun Rao",
    email: "arjun@officemart.in",
    phone: "+91 91234 56789",
    category: "Office Supplies",
    location: "Chennai",
    rating: 4.2,
    totalOrders: 15,
    totalValue: 412000,
    outstanding: 12500,
    status: "Active",
    lastOrder: "19 Aug 2026",
  },

  4: {
    id: 4,
    name: "Industrial Solutions",
    code: "SUP-004",
    contact: "Sneha Reddy",
    email: "sneha@industrial.in",
    phone: "+91 90909 80808",
    category: "Industrial",
    location: "Pune",
    rating: 4.0,
    totalOrders: 11,
    totalValue: 385000,
    outstanding: 35000,
    status: "On Hold",
    lastOrder: "18 Aug 2026",
  },

  5: {
    id: 5,
    name: "Metro Electronics",
    code: "SUP-005",
    contact: "Vikram Singh",
    email: "vikram@metroelectronics.in",
    phone: "+91 90123 45678",
    category: "Electronics",
    location: "Mumbai",
    rating: 4.7,
    totalOrders: 21,
    totalValue: 725000,
    outstanding: 18500,
    status: "Active",
    lastOrder: "16 Aug 2026",
  },

  6: {
    id: 6,
    name: "Home Essentials",
    code: "SUP-006",
    contact: "Kavya Nair",
    email: "kavya@homeessentials.in",
    phone: "+91 93456 78901",
    category: "Home",
    location: "Kochi",
    rating: 4.3,
    totalOrders: 13,
    totalValue: 298000,
    outstanding: 9000,
    status: "Active",
    lastOrder: "14 Aug 2026",
  },
};

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

const purchaseOrders = [
  {
    number: "PO-2026-001",
    date: "21 Aug 2026",
    items: 3,
    amount: 84000,
    status: "Pending Approval",
  },
  {
    number: "PO-2026-002",
    date: "12 Aug 2026",
    items: 4,
    amount: 48000,
    status: "Approved",
  },
  {
    number: "PO-2026-003",
    date: "02 Aug 2026",
    items: 5,
    amount: 32000,
    status: "Received",
  },
  {
    number: "PO-2026-004",
    date: "21 Jul 2026",
    items: 2,
    amount: 28000,
    status: "Received",
  },
];

export default function SupplierDetailPage() {
  const params = useParams();

  const id = Number(params.id);

  const supplier = supplierData[id] || supplierData[1];

  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-[#f5f7fa] px-5 py-6">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <Link
          href="/suppliers"
          className="mb-4 inline-flex items-center text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          ← Back to Suppliers
        </Link>

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div className="flex items-center gap-4">

            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#12213a] text-lg font-bold text-white">
              {supplier.name.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">
                  {supplier.name}
                </h1>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                    supplier.status === "Active"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {supplier.status}
                </span>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                {supplier.code} • {supplier.category} • {supplier.location}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                alert("Edit supplier form will be connected here.")
              }
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Edit Supplier
            </button>

            <button
              type="button"
              onClick={() =>
                alert("New purchase order will be created here.")
              }
              className="rounded-md bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b3152]"
            >
              + Purchase Order
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Supplier Rating
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              ★ {supplier.rating}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Performance score
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Total Orders
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {supplier.totalOrders}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Purchase orders
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Purchase Value
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {money(supplier.totalValue)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Lifetime purchase value
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Outstanding
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-500">
              {money(supplier.outstanding)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Pending payment
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
          {["overview", "orders", "ledger"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-5 py-2 text-xs font-semibold capitalize ${
                activeTab === tab
                  ? "bg-[#12213a] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

            {/* Supplier Information */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">

              <h2 className="text-base font-bold text-slate-900">
                Supplier Information
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Contact and supplier profile details.
              </p>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">

                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Supplier Name
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {supplier.name}
                  </p>
                </div>

                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Supplier Code
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {supplier.code}
                  </p>
                </div>

                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Contact Person
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {supplier.contact}
                  </p>
                </div>

                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Phone
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {supplier.phone}
                  </p>
                </div>

                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Email
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {supplier.email}
                  </p>
                </div>

                <div className="rounded-md bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Location
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {supplier.location}
                  </p>
                </div>

              </div>
            </div>

            {/* Performance */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">

              <h2 className="text-base font-bold text-slate-900">
                Supplier Performance
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Current supplier health indicators.
              </p>

              <div className="mt-6 space-y-5">

                <div>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-slate-500">
                      Overall rating
                    </span>
                    <span className="font-semibold">
                      {supplier.rating}/5
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{
                        width: `${(supplier.rating / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-slate-500">
                      Order reliability
                    </span>
                    <span className="font-semibold">
                      92%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-blue-500"
                      style={{ width: "92%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-slate-500">
                      Delivery performance
                    </span>
                    <span className="font-semibold">
                      88%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-teal-500"
                      style={{ width: "88%" }}
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex justify-between text-xs">
                    <span className="text-slate-500">
                      Quality score
                    </span>
                    <span className="font-semibold">
                      95%
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{ width: "95%" }}
                    />
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-base font-bold text-slate-900">
                Purchase Orders
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Recent purchase orders from this supplier.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                      PO Number
                    </th>

                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                      Date
                    </th>

                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                      Items
                    </th>

                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                      Amount
                    </th>

                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-4 py-3 text-[10px] uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {purchaseOrders.map((order) => (
                    <tr
                      key={order.number}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm font-semibold text-blue-600">
                        {order.number}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {order.date}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {order.items}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-800">
                        {money(order.amount)}
                      </td>

                      <td className="px-4 py-4">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-700">
                          {order.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            alert(`Opening ${order.number}`)
                          }
                          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
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
        )}

        {/* Ledger */}
        {activeTab === "ledger" && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Total Purchases
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {money(supplier.totalValue)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Lifetime supplier purchases
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Outstanding
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-500">
                {money(supplier.outstanding)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Amount pending payment
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] uppercase tracking-wider text-slate-400">
                Last Order
              </p>

              <p className="mt-2 text-lg font-bold text-slate-800">
                {supplier.lastOrder}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Most recent purchase order
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:col-span-3">
              <h2 className="text-base font-bold text-slate-900">
                Supplier Ledger
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Financial activity summary for this supplier.
              </p>

              <div className="mt-5 overflow-x-auto">
                <table className="w-full min-w-[650px] text-left">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-4 py-3 text-[10px] uppercase text-slate-500">
                        Date
                      </th>

                      <th className="px-4 py-3 text-[10px] uppercase text-slate-500">
                        Reference
                      </th>

                      <th className="px-4 py-3 text-[10px] uppercase text-slate-500">
                        Description
                      </th>

                      <th className="px-4 py-3 text-[10px] uppercase text-slate-500">
                        Debit
                      </th>

                      <th className="px-4 py-3 text-[10px] uppercase text-slate-500">
                        Credit
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-4 text-sm">
                        21 Aug 2026
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold">
                        PO-2026-001
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        Purchase order
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold">
                        {money(84000)}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-400">
                        —
                      </td>
                    </tr>

                    <tr className="border-b border-slate-100">
                      <td className="px-4 py-4 text-sm">
                        12 Aug 2026
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold">
                        PAY-2026-018
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        Supplier payment
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-400">
                        —
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-emerald-600">
                        {money(42000)}
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bottom note */}
        <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <div className="flex gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-700">
              i
            </div>

            <div>
              <p className="text-xs font-semibold text-blue-900">
                Supplier monitoring
              </p>

              <p className="mt-1 text-xs text-blue-700">
                Review supplier performance, outstanding payments and
                purchase history regularly to maintain healthy procurement
                operations.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}