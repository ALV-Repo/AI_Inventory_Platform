"use client";

import { useState } from "react";

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  totalPurchases: number;
  orders: number;
  status: "Active" | "Inactive";
}

const customers: Customer[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul.sharma@example.com",
    city: "Hyderabad",
    totalPurchases: 45890,
    orders: 12,
    status: "Active",
  },
  {
    id: 2,
    name: "Priya Reddy",
    phone: "+91 99887 66554",
    email: "priya.reddy@example.com",
    city: "Vijayawada",
    totalPurchases: 32450,
    orders: 8,
    status: "Active",
  },
  {
    id: 3,
    name: "Arjun Kumar",
    phone: "+91 91234 56789",
    email: "arjun.kumar@example.com",
    city: "Bangalore",
    totalPurchases: 18750,
    orders: 5,
    status: "Active",
  },
  {
    id: 4,
    name: "Sneha Verma",
    phone: "+91 93456 78901",
    email: "sneha.verma@example.com",
    city: "Chennai",
    totalPurchases: 12600,
    orders: 4,
    status: "Inactive",
  },
  {
    id: 5,
    name: "Vikram Singh",
    phone: "+91 97654 32109",
    email: "vikram.singh@example.com",
    city: "Mumbai",
    totalPurchases: 56200,
    orders: 15,
    status: "Active",
  },
  {
    id: 6,
    name: "Ananya Patel",
    phone: "+91 94567 89012",
    email: "ananya.patel@example.com",
    city: "Pune",
    totalPurchases: 28900,
    orders: 7,
    status: "Active",
  },
];

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filteredCustomers = customers.filter((customer) => {
    const value = search.toLowerCase();

    return (
      customer.name.toLowerCase().includes(value) ||
      customer.phone.toLowerCase().includes(value) ||
      customer.email.toLowerCase().includes(value) ||
      customer.city.toLowerCase().includes(value)
    );
  });

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.totalPurchases,
    0
  );

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.orders,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Customers
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage customers and view purchase history
            </p>
          </div>

          <button
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
            onClick={() => alert("Create customer form coming soon")}
          >
            + Add Customer
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Customers
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {totalCustomers}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Registered customers
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Active Customers
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {activeCustomers}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Currently active
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Customer Revenue
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Total purchases
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {totalOrders}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Customer orders
            </p>
          </div>

        </div>

        {/* Search */}
        <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <input
            type="text"
            placeholder="Search customer by name, phone, email or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {/* Customer Table */}
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

          <div className="border-b px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Customer List
            </h2>

            <p className="text-sm text-gray-500">
              Customer information and purchase history
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-blue-600 text-white">

                <tr>
                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Customer
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Phone
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    Email
                  </th>

                  <th className="px-5 py-3 text-left text-sm font-semibold">
                    City
                  </th>

                  <th className="px-5 py-3 text-right text-sm font-semibold">
                    Orders
                  </th>

                  <th className="px-5 py-3 text-right text-sm font-semibold">
                    Purchase Value
                  </th>

                  <th className="px-5 py-3 text-center text-sm font-semibold">
                    Status
                  </th>

                  <th className="px-5 py-3 text-center text-sm font-semibold">
                    Action
                  </th>
                </tr>

              </thead>

              <tbody>

                {filteredCustomers.map((customer) => (

                  <tr
                    key={customer.id}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">
                        {customer.name}
                      </div>

                      <div className="text-xs text-gray-500">
                        Customer #{customer.id}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {customer.phone}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {customer.email}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {customer.city}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-medium">
                      {customer.orders}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold">
                      ₹{customer.totalPurchases.toLocaleString("en-IN")}
                    </td>

                    <td className="px-5 py-4 text-center">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          customer.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {customer.status}
                      </span>

                    </td>

                    <td className="px-5 py-4 text-center">

                      <button
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        onClick={() =>
                          alert(
                            `Customer: ${customer.name}\nOrders: ${customer.orders}\nPurchase Value: ₹${customer.totalPurchases.toLocaleString(
                              "en-IN"
                            )}`
                          )
                        }
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {filteredCustomers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No customers found.
            </div>
          )}

          <div className="border-t px-6 py-4 text-sm text-gray-500">
            Showing {filteredCustomers.length} of {totalCustomers} customers
          </div>

        </div>

      </div>
    </div>
  );
}