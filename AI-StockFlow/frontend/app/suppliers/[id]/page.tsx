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

  const supplier =
    supplierData[id] || supplierData[1];

  const [activeTab, setActiveTab] =
    useState("overview");

  const [showEditSupplier, setShowEditSupplier] =
    useState(false);

  const [supplierForm, setSupplierForm] =
    useState({
      gstin: "29ABCDE1234F1Z5",
      paymentTerms: "30 Days",
      leadTimeDays: "7",
      priceList: "Standard Supplier Price List",
    });

  return (
    <>
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
                  {supplier.code} • {supplier.category} •{" "}
                  {supplier.location}
                </p>
              </div>
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  setShowEditSupplier(true)
                }
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Edit Supplier
              </button>

              <button
                type="button"
                onClick={() =>
                  alert(
                    "New purchase order will be created here."
                  )
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

            {["overview", "orders", "ledger"].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() =>
                    setActiveTab(tab)
                  }
                  className={`rounded-md px-5 py-2 text-xs font-semibold capitalize ${
                    activeTab === tab
                      ? "bg-[#12213a] text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab}
                </button>
              )
            )}

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

                  {/* Overall Rating */}

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
                          width: `${
                            (supplier.rating / 5) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Order Reliability */}

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

                  {/* Delivery Performance */}

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

                                    {/* Quality Score */}

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

                  {/* Fill Rate */}

                  <div>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-slate-500">
                        Fill rate
                      </span>

                      <span className="font-semibold">
                        94%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: "94%" }}
                      />
                    </div>
                  </div>

                  {/* On-Time Delivery */}

                  <div>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-slate-500">
                        On-time delivery
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

                  {/* Quality Rejection Rate */}

                  <div>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-slate-500">
                        Quality rejection rate
                      </span>

                      <span className="font-semibold">
                        5%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-orange-500"
                        style={{ width: "5%" }}
                      />
                    </div>
                  </div>

                  {/* Price Stability */}

                  <div>
                    <div className="mb-2 flex justify-between text-xs">
                      <span className="text-slate-500">
                        Price stability
                      </span>

                      <span className="font-semibold">
                        91%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-indigo-500"
                        style={{ width: "91%" }}
                      />
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* ORDERS TAB */}

          {activeTab === "orders" && (
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-bold text-slate-900">
                  Purchase Orders
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Purchase order history for this supplier.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">

                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        PO Number
                      </th>

                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Items
                      </th>

                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Amount
                      </th>

                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {purchaseOrders.map((order) => (
                      <tr
                        key={order.number}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-xs font-semibold text-blue-600">
                          {order.number}
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-600">
                          {order.date}
                        </td>

                        <td className="px-5 py-4 text-xs text-slate-600">
                          {order.items}
                        </td>

                        <td className="px-5 py-4 text-xs font-semibold text-slate-800">
                          {money(order.amount)}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              order.status ===
                              "Received"
                                ? "bg-emerald-100 text-emerald-700"
                                : order.status ===
                                  "Approved"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}

                  </tbody>

                </table>
              </div>

            </div>
          )}

          {/* LEDGER TAB */}

          {activeTab === "ledger" && (
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-base font-bold text-slate-900">
                  Supplier Ledger
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Purchase and payment activity for this supplier.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-left">

                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Reference
                      </th>

                      <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Type
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Debit
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Credit
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Balance
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    <tr>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        21 Aug 2026
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-blue-600">
                        PO-2026-001
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600">
                        Purchase
                      </td>

                      <td className="px-5 py-4 text-right text-xs font-semibold text-red-600">
                        {money(84000)}
                      </td>

                      <td className="px-5 py-4 text-right text-xs text-slate-400">
                        —
                      </td>

                      <td className="px-5 py-4 text-right text-xs font-bold text-slate-800">
                        {money(42000)}
                      </td>
                    </tr>

                    <tr>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        18 Aug 2026
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-blue-600">
                        PAY-2026-018
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600">
                        Payment
                      </td>

                      <td className="px-5 py-4 text-right text-xs text-slate-400">
                        —
                      </td>

                      <td className="px-5 py-4 text-right text-xs font-semibold text-emerald-600">
                        {money(42000)}
                      </td>

                      <td className="px-5 py-4 text-right text-xs font-bold text-slate-800">
                        {money(42000)}
                      </td>
                    </tr>

                    <tr>
                      <td className="px-5 py-4 text-xs text-slate-600">
                        02 Aug 2026
                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-blue-600">
                        PO-2026-003
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600">
                        Purchase
                      </td>

                      <td className="px-5 py-4 text-right text-xs font-semibold text-red-600">
                        {money(32000)}
                      </td>

                      <td className="px-5 py-4 text-right text-xs text-slate-400">
                        —
                      </td>

                      <td className="px-5 py-4 text-right text-xs font-bold text-slate-800">
                        {money(84000)}
                      </td>
                    </tr>

                  </tbody>

                </table>
              </div>

            </div>
          )}

          {/* SUPPLIER MONITORING */}

          <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 px-5 py-4">
            <div className="flex gap-3">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-600">
                i
              </div>

              <div>
                <p className="text-xs font-semibold text-blue-700">
                  Supplier monitoring
                </p>

                <p className="mt-1 text-[10px] text-blue-600">
                  Review supplier performance,
                  outstanding payments and purchase
                  history regularly to maintain healthy
                  procurement operations.
                </p>
              </div>

            </div>
          </div>

                    {/* Additional Supplier Scorecard */}

          {activeTab === "overview" && (
            <div className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900">
                  Supplier Scorecard
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Key procurement performance metrics for supplier evaluation.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    On-Time Delivery
                  </p>

                  <p className="mt-2 text-xl font-bold text-teal-600">
                    88%
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Orders delivered on schedule
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Fill Rate
                  </p>

                  <p className="mt-2 text-xl font-bold text-blue-600">
                    94%
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Ordered quantity fulfilled
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Quality Rejection
                  </p>

                  <p className="mt-2 text-xl font-bold text-orange-500">
                    5%
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Items rejected during inspection
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">
                    Price Stability
                  </p>

                  <p className="mt-2 text-xl font-bold text-indigo-600">
                    91%
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Stability of supplier pricing
                  </p>
                </div>

              </div>
            </div>
          )}

          {/* Supplier Summary */}

          {activeTab === "overview" && (
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Payment Terms
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  {supplierForm.paymentTerms}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Current supplier payment agreement
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Lead Time
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900">
                  {supplierForm.leadTimeDays} days
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Default procurement lead time
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Price List
                </p>

                <p className="mt-2 text-sm font-bold text-slate-900">
                  {supplierForm.priceList}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Active supplier pricing
                </p>
              </div>

            </div>
          )}

                    {/* Edit Supplier Modal */}

          {showEditSupplier && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

              <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">

                {/* Modal Header */}

                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Edit Supplier
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Update supplier master information.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowEditSupplier(false)
                    }
                    className="text-xl text-slate-400 hover:text-slate-700"
                  >
                    ×
                  </button>

                </div>

                {/* Form */}

                <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">

                  {/* Supplier Name */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Supplier Name
                    </label>

                    <input
                      value={supplier.name}
                      disabled
                      className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500"
                    />
                  </div>

                  {/* Supplier Code */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Supplier Code
                    </label>

                    <input
                      value={supplier.code}
                      disabled
                      className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-500"
                    />
                  </div>

                  {/* GSTIN */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      GSTIN
                    </label>

                    <input
                      value={supplierForm.gstin}
                      onChange={(event) =>
                        setSupplierForm((current) => ({
                          ...current,
                          gstin:
                            event.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="29ABCDE1234F1Z5"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Payment Terms */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Payment Terms
                    </label>

                    <select
                      value={supplierForm.paymentTerms}
                      onChange={(event) =>
                        setSupplierForm((current) => ({
                          ...current,
                          paymentTerms:
                            event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="Advance">
                        Advance
                      </option>

                      <option value="15 Days">
                        15 Days
                      </option>

                      <option value="30 Days">
                        30 Days
                      </option>

                      <option value="45 Days">
                        45 Days
                      </option>

                      <option value="60 Days">
                        60 Days
                      </option>
                    </select>
                  </div>

                  {/* Lead Time */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Default Lead Time
                    </label>

                    <div className="flex items-center gap-2">

                      <input
                        type="number"
                        min="1"
                        value={supplierForm.leadTimeDays}
                        onChange={(event) =>
                          setSupplierForm((current) => ({
                            ...current,
                            leadTimeDays:
                              event.target.value,
                          }))
                        }
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
                      />

                      <span className="text-xs text-slate-500">
                        days
                      </span>

                    </div>
                  </div>

                  {/* Price List */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">
                      Price List
                    </label>

                    <select
                      value={supplierForm.priceList}
                      onChange={(event) =>
                        setSupplierForm((current) => ({
                          ...current,
                          priceList:
                            event.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
                    >
                      <option value="Standard Supplier Price List">
                        Standard Supplier Price List
                      </option>

                      <option value="Preferred Supplier Price List">
                        Preferred Supplier Price List
                      </option>

                      <option value="Contract Price List">
                        Contract Price List
                      </option>
                    </select>
                  </div>

                </div>

                {/* Modal Footer */}

                <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">

                  <button
                    type="button"
                    onClick={() =>
                      setShowEditSupplier(false)
                    }
                    className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !supplierForm.gstin.trim() ||
                        !supplierForm.paymentTerms ||
                        Number(
                          supplierForm.leadTimeDays
                        ) <= 0 ||
                        !supplierForm.priceList
                      ) {
                        alert(
                          "Please complete all supplier master fields."
                        );

                        return;
                      }

                      alert(
                        `Supplier ${supplier.code} updated successfully.`
                      );

                      setShowEditSupplier(false);
                    }}
                    className="rounded-md bg-[#12213a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1b3152]"
                  >
                    Save Changes
                  </button>

                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}