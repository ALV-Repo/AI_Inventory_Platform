"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Proposal"
  | "Won"
  | "Lost";

type Lead = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: string;
  value: number;
  expectedClose: string;
  status: LeadStatus;
  lastActivity: string;
};

type Customer = {
  id: number;
  name: string;
  phone: string;
  email: string;
  city: string;
  company: string;
  gstin: string;
  creditLimit: number;
  priceLevel: string;
  totalPurchases: number;
  orders: number;
  status: "Active" | "Inactive";
};

const initialLeads: Lead[] = [
  {
    id: "LD-2026-001",
    name: "Rahul Sharma",
    company: "Sharma Technologies",
    phone: "+91 98765 43210",
    email: "rahul@sharmatech.in",
    source: "Website",
    value: 185000,
    expectedClose: "28 Aug 2026",
    status: "New",
    lastActivity: "24 Aug 2026",
  },
  {
    id: "LD-2026-002",
    name: "Priya Reddy",
    company: "Reddy Enterprises",
    phone: "+91 99887 66554",
    email: "priya@reddyenterprises.in",
    source: "Referral",
    value: 320000,
    expectedClose: "30 Aug 2026",
    status: "Contacted",
    lastActivity: "23 Aug 2026",
  },
  {
    id: "LD-2026-003",
    name: "Arjun Kumar",
    company: "AK Retail",
    phone: "+91 91234 56789",
    email: "arjun@akretail.in",
    source: "WhatsApp",
    value: 145000,
    expectedClose: "05 Sep 2026",
    status: "Qualified",
    lastActivity: "22 Aug 2026",
  },
  {
    id: "LD-2026-004",
    name: "Sneha Verma",
    company: "Verma Solutions",
    phone: "+91 93456 78901",
    email: "sneha@vermasolutions.in",
    source: "Website",
    value: 275000,
    expectedClose: "08 Sep 2026",
    status: "Proposal",
    lastActivity: "21 Aug 2026",
  },
  {
    id: "LD-2026-005",
    name: "Vikram Singh",
    company: "Singh Industries",
    phone: "+91 97654 32109",
    email: "vikram@singhindustries.in",
    source: "Referral",
    value: 425000,
    expectedClose: "15 Sep 2026",
    status: "Won",
    lastActivity: "20 Aug 2026",
  },
  {
    id: "LD-2026-006",
    name: "Ananya Patel",
    company: "Patel Mart",
    phone: "+91 94567 89012",
    email: "ananya@patelmart.in",
    source: "Campaign",
    value: 95000,
    expectedClose: "18 Sep 2026",
    status: "Lost",
    lastActivity: "19 Aug 2026",
  },
];

const initialCustomers: Customer[] = [
  {
    id: 1,
    name: "Rahul Sharma",
    phone: "+91 98765 43210",
    email: "rahul.sharma@example.com",
    city: "Hyderabad",
    company: "Sharma Technologies",
    gstin: "36ABCDE1234F1Z5",
    creditLimit: 100000,
    priceLevel: "Standard",
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
    company: "Reddy Enterprises",
    gstin: "37ABCDE1234F1Z5",
    creditLimit: 150000,
    priceLevel: "Wholesale",
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
    company: "AK Retail",
    gstin: "29ABCDE5678G1Z2",
    creditLimit: 75000,
    priceLevel: "Retail",
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
    company: "Verma Solutions",
    gstin: "33ABCDE9012H1Z3",
    creditLimit: 50000,
    priceLevel: "Standard",
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
    company: "Singh Industries",
    gstin: "27ABCDE3456J1Z4",
    creditLimit: 200000,
    priceLevel: "Wholesale",
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
    company: "Patel Mart",
    gstin: "24ABCDE7890K1Z5",
    creditLimit: 80000,
    priceLevel: "Retail",
    totalPurchases: 28900,
    orders: 7,
    status: "Active",
  },
];

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<
    "leads" | "pipeline" | "customers"
  >("customers");

  const [customers, setCustomers] = useState<Customer[]>(() => {
  if (typeof window === "undefined") {
    return initialCustomers;
  }

  const saved = localStorage.getItem("stockflow-customers");

  return saved ? JSON.parse(saved) : initialCustomers;
});

useEffect(() => {
  localStorage.setItem("stockflow-customers", JSON.stringify(customers));
}, [customers]);

  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [showAddCustomer, setShowAddCustomer] = useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    company: "",
    gstin: "",
    creditLimit: "",
    priceLevel: "Standard",
  });

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return customers;
    }

    return customers.filter((customer) =>
      [
        customer.name,
        customer.phone,
        customer.email,
        customer.city,
        customer.company,
        customer.gstin,
        customer.priceLevel,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [customers, search]);

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.totalPurchases,
    0
  );

  const activeCustomers = customers.filter(
    (customer) => customer.status === "Active"
  ).length;

  const totalOrders = customers.reduce(
    (sum, customer) => sum + customer.orders,
    0
  );

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString("en-IN")}`;

  const handleAddCustomer = () => {
    if (
      !newCustomer.name ||
      !newCustomer.phone ||
      !newCustomer.company
    ) {
      alert("Please fill Name, Phone and Company.");
      return;
    }

    const customer: Customer = {
      id:
        customers.length > 0
          ? Math.max(...customers.map((item) => item.id)) + 1
          : 1,
      name: newCustomer.name,
      phone: newCustomer.phone,
      email: newCustomer.email,
      city: newCustomer.city,
      company: newCustomer.company,
      gstin: newCustomer.gstin,
      creditLimit: Number(newCustomer.creditLimit) || 0,
      priceLevel: newCustomer.priceLevel,
      totalPurchases: 0,
      orders: 0,
      status: "Active",
    };

    const updatedCustomers = [customer, ...customers];

setCustomers(updatedCustomers);

localStorage.setItem(
  "stockflow-customers",
  JSON.stringify(updatedCustomers)
);

    setSelectedCustomer(customer);
    setShowAddCustomer(false);

    setNewCustomer({
      name: "",
      phone: "",
      email: "",
      city: "",
      company: "",
      gstin: "",
      creditLimit: "",
      priceLevel: "Standard",
    });
  };

  const updateLeadStatus = (
    id: string,
    status: LeadStatus
  ) => {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === id
          ? { ...lead, status }
          : lead
      )
    );
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50 p-6 text-slate-900">
        <div className="mx-auto max-w-7xl">

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                CRM & Customers
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage leads, sales pipeline and customer master data.
              </p>
            </div>

            {activeTab === "customers" && (
              <button
                onClick={() => setShowAddCustomer(true)}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                + Add Customer
              </button>
            )}
          </div>

          <div className="mb-6 flex gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">

            <button
              onClick={() => setActiveTab("leads")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
                activeTab === "leads"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Leads
            </button>

            <button
              onClick={() => setActiveTab("pipeline")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
                activeTab === "pipeline"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Pipeline
            </button>

            <button
              onClick={() => setActiveTab("customers")}
              className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
                activeTab === "customers"
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Customers
            </button>

          </div>

          {activeTab === "customers" && (
            <>
              <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Total Customers
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {customers.length}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {activeCustomers} active customers
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Total Purchases
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {formatCurrency(totalRevenue)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Customer purchase history
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Total Orders
                  </p>

                  <p className="mt-2 text-2xl font-bold">
                    {totalOrders}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Across all customers
                  </p>
                </div>

              </section>

              <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search customer, GSTIN, company, phone..."
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />

              </section>
            </>
          )}

          {activeTab === "leads" && (
            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-5">
                <h2 className="font-semibold">
                  Sales Leads
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Manage and track potential customers.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-sm">

                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Lead</th>
                      <th className="px-5 py-3">Company</th>
                      <th className="px-5 py-3">Contact</th>
                      <th className="px-5 py-3">Source</th>
                      <th className="px-5 py-3">Value</th>
                      <th className="px-5 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            {lead.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {lead.id}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {lead.company}
                        </td>

                        <td className="px-5 py-4">
                          <p>{lead.phone}</p>
                          <p className="text-xs text-slate-500">
                            {lead.email}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          {lead.source}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {formatCurrency(lead.value)}
                        </td>

                        <td className="px-5 py-4">
                          <select
                            value={lead.status}
                            onChange={(event) =>
                              updateLeadStatus(
                                lead.id,
                                event.target.value as LeadStatus
                              )
                            }
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Proposal">Proposal</option>
                            <option value="Won">Won</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>

            </section>
          )}

          {activeTab === "pipeline" && (
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">

              {(
                [
                  "New",
                  "Qualified",
                  "Proposal",
                  "Won",
                  "Lost",
                ] as LeadStatus[]
              ).map((status) => {

                const statusLeads = leads.filter(
                  (lead) => lead.status === status
                );

                return (
                  <div
                    key={status}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="font-semibold">
                        {status}
                      </h2>

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">
                        {statusLeads.length}
                      </span>
                    </div>

                    <div className="space-y-3">

                      {statusLeads.map((lead) => (
                        <div
                          key={lead.id}
                          className="rounded-lg border border-slate-200 p-4"
                        >
                          <p className="font-semibold">
                            {lead.name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {lead.company}
                          </p>

                          <p className="mt-3 font-semibold">
                            {formatCurrency(lead.value)}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Close: {lead.expectedClose}
                          </p>
                        </div>
                      ))}

                      {statusLeads.length === 0 && (
                        <p className="py-6 text-center text-xs text-slate-400">
                          No leads
                        </p>
                      )}

                    </div>
                  </div>
                );
              })}

            </section>
          )}

          {activeTab === "customers" && (
            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-5">
                <h2 className="font-semibold">
                  Customer Master
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Showing {filteredCustomers.length} of{" "}
                  {customers.length} customers
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px] text-sm">

                  <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Contact</th>
                      <th className="px-5 py-3">GSTIN</th>
                      <th className="px-5 py-3">Credit Limit</th>
                      <th className="px-5 py-3">Price Level</th>
                      <th className="px-5 py-3">Purchases</th>
                      <th className="px-5 py-3">Orders</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                                      {filteredCustomers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold">
                            {customer.name}
                          </p>

                          <p className="text-xs text-slate-500">
                            {customer.company}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <p>{customer.phone}</p>

                          <p className="text-xs text-slate-500">
                            {customer.email}
                          </p>

                          <p className="text-xs text-slate-400">
                            {customer.city}
                          </p>
                        </td>

                        <td className="px-5 py-4 font-mono text-xs">
                          {customer.gstin || "Not Available"}
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {formatCurrency(customer.creditLimit)}
                        </td>

                        <td className="px-5 py-4">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            {customer.priceLevel}
                          </span>
                        </td>

                        <td className="px-5 py-4 font-semibold">
                          {formatCurrency(customer.totalPurchases)}
                        </td>

                        <td className="px-5 py-4">
                          {customer.orders}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              customer.status === "Active"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {customer.status}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelectedCustomer(customer)}
                            className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                          >
                            Customer 360
                          </button>
                        </td>
                      </tr>
                    ))}

                    {filteredCustomers.length === 0 && (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-5 py-12 text-center text-sm text-slate-500"
                        >
                          No customers found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">
                  Add Customer
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add customer master information.
                </p>
              </div>

              <button
                onClick={() => setShowAddCustomer(false)}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Customer Name
                </label>

                <input
                  value={newCustomer.name}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      name: e.target.value,
                    })
                  }
                  placeholder="Customer name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Company
                </label>

                <input
                  value={newCustomer.company}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      company: e.target.value,
                    })
                  }
                  placeholder="Company name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Phone
                </label>

                <input
                  value={newCustomer.phone}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      phone: e.target.value,
                    })
                  }
                  placeholder="+91..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Email
                </label>

                <input
                  value={newCustomer.email}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      email: e.target.value,
                    })
                  }
                  placeholder="customer@example.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  City
                </label>

                <input
                  value={newCustomer.city}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      city: e.target.value,
                    })
                  }
                  placeholder="City"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  GSTIN
                </label>

                <input
                  value={newCustomer.gstin}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      gstin: e.target.value.toUpperCase(),
                    })
                  }
                  placeholder="GSTIN"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Credit Limit
                </label>

                <input
                  type="number"
                  min="0"
                  value={newCustomer.creditLimit}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      creditLimit: e.target.value,
                    })
                  }
                  placeholder="₹"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Price Level
                </label>

                <select
                  value={newCustomer.priceLevel}
                  onChange={(e) =>
                    setNewCustomer({
                      ...newCustomer,
                      priceLevel: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                >
                  <option value="Standard">Standard</option>
                  <option value="Retail">Retail</option>
                  <option value="Wholesale">Wholesale</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

            </div>

            <div className="flex justify-end gap-3 border-t p-5">

              <button
                onClick={() => setShowAddCustomer(false)}
                className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={handleAddCustomer}
                className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Save Customer
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Customer 360 Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b p-5">
              <div>
                <h2 className="text-xl font-bold">
                  {selectedCustomer.name}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedCustomer.company}
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="space-y-5 p-5">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Phone
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedCustomer.phone}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Email
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedCustomer.email}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    City
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedCustomer.city}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    GSTIN
                  </p>
                  <p className="mt-1 font-mono font-semibold">
                    {selectedCustomer.gstin || "Not Available"}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Credit Limit
                  </p>
                  <p className="mt-1 font-semibold">
                    {formatCurrency(selectedCustomer.creditLimit)}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-400">
                    Price Level
                  </p>
                  <p className="mt-1 font-semibold">
                    {selectedCustomer.priceLevel}
                  </p>
                </div>

              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">
                  Purchase History
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs text-slate-400">
                      Total Orders
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {selectedCustomer.orders}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs text-slate-400">
                      Total Purchases
                    </p>

                    <p className="mt-1 text-xl font-bold text-emerald-600">
                      {formatCurrency(
                        selectedCustomer.totalPurchases
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="text-xs text-slate-400">
                      Average Order
                    </p>

                    <p className="mt-1 text-xl font-bold">
                      {formatCurrency(
                        selectedCustomer.orders > 0
                          ? Math.round(
                              selectedCustomer.totalPurchases /
                                selectedCustomer.orders
                            )
                          : 0
                      )}
                    </p>
                  </div>

                </div>
              </div>

              <div className="rounded-xl bg-blue-50 p-5">
                <h3 className="font-semibold text-blue-900">
                  Customer Summary
                </h3>

                <p className="mt-2 text-sm leading-6 text-blue-800">
                  {selectedCustomer.name} has{" "}
                  {selectedCustomer.orders} recorded orders with total
                  purchases of{" "}
                  {formatCurrency(selectedCustomer.totalPurchases)}.
                  The assigned price level is{" "}
                  {selectedCustomer.priceLevel}, with a credit limit of{" "}
                  {formatCurrency(selectedCustomer.creditLimit)}.
                </p>
              </div>

            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}