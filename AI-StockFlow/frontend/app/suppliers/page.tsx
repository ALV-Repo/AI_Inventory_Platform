"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

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

const suppliers: Supplier[] = [
  {
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
  {
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
  {
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
  {
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
  {
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
  {
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
];

const money = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function SuppliersPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((supplier) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        !searchText ||
        supplier.name.toLowerCase().includes(searchText) ||
        supplier.code.toLowerCase().includes(searchText) ||
        supplier.contact.toLowerCase().includes(searchText) ||
        supplier.location.toLowerCase().includes(searchText);

      const matchesCategory =
        category === "All Categories" ||
        supplier.category === category;

      const matchesStatus =
        status === "All Statuses" ||
        supplier.status === status;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [search, category, status]);

  const totalValue = suppliers.reduce(
    (sum, supplier) => sum + supplier.totalValue,
    0
  );

  const outstanding = suppliers.reduce(
    (sum, supplier) => sum + supplier.outstanding,
    0
  );

  const activeSuppliers = suppliers.filter(
    (supplier) => supplier.status === "Active"
  ).length;

  return (
    <div className="min-h-screen bg-[#f5f7fa] px-5 py-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Suppliers
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage suppliers, contacts, performance and purchase history.
            </p>
          </div>

          <button
            type="button"
            className="rounded-md bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1b3152]"
            onClick={() =>
              alert("New supplier form will be connected here.")
            }
          >
            + New Supplier
          </button>
        </div>

        {/* KPI Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Total Suppliers
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {suppliers.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Registered suppliers
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Active Suppliers
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {activeSuppliers}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Currently supplying
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Purchase Value
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {money(totalValue)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Total supplier purchases
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Outstanding
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-500">
              {money(outstanding)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Pending supplier payments
            </p>
          </div>
        </div>

        {/* Search / Filters */}
        <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">

          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px_180px_auto]">

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search supplier, code, contact or location..."
              className="rounded-md border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Office Supplies</option>
              <option>Industrial</option>
              <option>Home</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option>All Statuses</option>
              <option>Active</option>
              <option>On Hold</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("All Categories");
                setStatus("All Statuses");
              }}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Supplier List */}
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-bold text-slate-900">
              Supplier List
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Showing {filteredSuppliers.length} of {suppliers.length} suppliers
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Supplier
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Contact
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Category
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Location
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Rating
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Orders
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Outstanding
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr
                    key={supplier.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-semibold text-sm text-slate-900">
                        {supplier.name}
                      </div>

                      <div className="mt-1 text-[10px] text-slate-400">
                        {supplier.code}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-slate-700">
                        {supplier.contact}
                      </div>

                      <div className="mt-1 text-xs text-slate-400">
                        {supplier.phone}
                      </div>
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {supplier.category}
                    </td>

                    <td className="px-4 py-4 text-sm text-slate-600">
                      {supplier.location}
                    </td>

                    <td className="px-4 py-4">
                      <span className="font-semibold text-sm text-slate-700">
                        ★ {supplier.rating}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                      {supplier.totalOrders}
                    </td>

                    <td className="px-4 py-4 text-sm font-semibold text-orange-600">
                      {money(supplier.outstanding)}
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          supplier.status === "Active"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        href={`/suppliers/${supplier.id}`}
                        className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}

                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-12 text-center"
                    >
                      <p className="text-sm font-semibold text-slate-700">
                        No suppliers found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer information */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Best Rated
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Tech Supplies India
            </p>

            <p className="mt-1 text-xs text-emerald-600">
              ★ 4.8 supplier rating
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Highest Purchase Value
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Tech Supplies India
            </p>

            <p className="mt-1 text-xs text-blue-600">
              {money(845000)}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Attention Required
            </p>

            <p className="mt-2 text-sm font-bold text-slate-800">
              Industrial Solutions
            </p>

            <p className="mt-1 text-xs text-orange-600">
              Supplier currently on hold
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}