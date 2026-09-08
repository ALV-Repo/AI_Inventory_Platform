"use client";

import { useMemo, useState } from "react";

type Customer = {
  name: string;
  company: string;
  phone: string;
  email: string;
  gstin: string;
  creditLimit: number;
  outstanding: number;
  orders: number;
  invoices: number;
  payments: number;
  returns: number;
  communications: number;
  lastInteraction: string;
};

const customers: Customer[] = [
  {
    name: "Apex Retail Solutions",
    company: "Apex Retail Solutions",
    phone: "+91 98765 43210",
    email: "accounts@apexretail.com",
    gstin: "29ABCDE1234F1Z5",
    creditLimit: 100000,
    outstanding: 82000,
    orders: 12,
    invoices: 10,
    payments: 8,
    returns: 1,
    communications: 15,
    lastInteraction: "04 Sep 2026",
  },
  {
    name: "Green Valley Stores",
    company: "Green Valley Stores",
    phone: "+91 98765 11111",
    email: "accounts@greenvalley.com",
    gstin: "36ABCDE5678G1Z2",
    creditLimit: 75000,
    outstanding: 28000,
    orders: 9,
    invoices: 8,
    payments: 7,
    returns: 2,
    communications: 11,
    lastInteraction: "03 Sep 2026",
  },
  {
    name: "Metro Office Supplies",
    company: "Metro Office Supplies",
    phone: "+91 98765 22222",
    email: "sales@metrooffice.com",
    gstin: "36METRO1234H1Z6",
    creditLimit: 50000,
    outstanding: 47000,
    orders: 7,
    invoices: 6,
    payments: 5,
    returns: 1,
    communications: 9,
    lastInteraction: "02 Sep 2026",
  },
];

export default function Customer360Page() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const filteredCustomers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return customers;

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(value) ||
        customer.company.toLowerCase().includes(value) ||
        customer.phone.includes(value) ||
        customer.email.toLowerCase().includes(value) ||
        customer.gstin.toLowerCase().includes(value)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            Customer 360°
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View complete customer profile, transactions and relationship
            history.
          </p>
        </div>

        <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer, company, phone, email or GSTIN..."
            className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Customer Profiles
            </h2>
            <p className="text-xs text-slate-500">
              Select a customer to view the complete 360° profile.
            </p>
          </div>

          <div className="divide-y">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.name}
                className="flex items-center justify-between px-5 py-4"
              >
                <div>
                  <p className="font-semibold text-slate-900">
                    {customer.name}
                  </p>
                  <p className="text-sm text-slate-500">
                    {customer.company}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {customer.phone} · {customer.email}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCustomer(customer)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  View 360°
                </button>
              </div>
            ))}

            {filteredCustomers.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                No customers found.
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {selectedCustomer.name}
                </h2>
                <p className="text-sm text-slate-500">
                  Customer 360° Profile
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg border px-3 py-2 text-sm text-slate-600"
              >
                Close
              </button>
            </div>

            <div className="space-y-6 p-6">
              <section>
                <h3 className="mb-3 font-semibold text-slate-900">
                  Customer Profile
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Company</p>
                    <p className="font-medium">{selectedCustomer.company}</p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Phone</p>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">Email</p>
                    <p className="font-medium">{selectedCustomer.email}</p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-500">GSTIN</p>
                    <p className="font-medium">{selectedCustomer.gstin}</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 font-semibold text-slate-900">
                  Financial Overview
                </h3>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-slate-500">Credit Limit</p>
                    <p className="text-lg font-bold text-blue-600">
                      ₹{selectedCustomer.creditLimit.toLocaleString()}
                    </p>
                  </div>

                  <div className="rounded-lg border p-4">
                    <p className="text-xs text-slate-500">Outstanding</p>
                    <p className="text-lg font-bold text-orange-600">
                      ₹{selectedCustomer.outstanding.toLocaleString()}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="mb-3 font-semibold text-slate-900">
                  Transaction History
                </h3>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
                  {[
                    ["Orders", selectedCustomer.orders],
                    ["Invoices", selectedCustomer.invoices],
                    ["Payments", selectedCustomer.payments],
                    ["Returns", selectedCustomer.returns],
                    ["Communications", selectedCustomer.communications],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-lg border p-4 text-center"
                    >
                      <p className="text-2xl font-bold text-slate-900">
                        {value}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-3 font-semibold text-slate-900">
                  Communications
                </h3>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-sm text-slate-600">
                    Total interactions:{" "}
                    <span className="font-semibold">
                      {selectedCustomer.communications}
                    </span>
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Last interaction: {selectedCustomer.lastInteraction}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="mb-3 font-semibold text-slate-900">
                  AI Customer Insights
                </h3>

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-medium text-blue-900">
                    Customer Relationship Insight
                  </p>
                  <p className="mt-2 text-sm text-blue-800">
                    Customer has an active purchase relationship with regular
                    transactions. Monitor outstanding balance and payment
                    behaviour before extending additional credit.
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}