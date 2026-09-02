"use client";

import { useMemo, useState } from "react";
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
    totalPurchases: 28900,
    orders: 7,
    status: "Active",
  },
];

const pipelineStages: LeadStatus[] = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Won",
];

const sourceOptions = [
  "All Sources",
  "Website",
  "Referral",
  "WhatsApp",
  "Campaign",
];

const statusColors: Record<LeadStatus, string> = {
  New: "bg-blue-100 text-blue-700",
  Contacted: "bg-purple-100 text-purple-700",
  Qualified: "bg-yellow-100 text-yellow-700",
  Proposal: "bg-orange-100 text-orange-700",
  Won: "bg-green-100 text-green-700",
  Lost: "bg-red-100 text-red-700",
};

export default function CustomersPage() {
  const [activeTab, setActiveTab] = useState<
    "leads" | "pipeline" | "customers" | "customer360"
  >("leads");

  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [customers] = useState<Customer[]>(initialCustomers);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(customers[0]);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showFollowUp, setShowFollowUp] = useState(false);

  const [leadForm, setLeadForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    source: "Website",
    value: "",
    expectedClose: "",
  });

  const [followUp, setFollowUp] = useState({
    date: "",
    time: "",
    note: "",
  });

  const filteredLeads = useMemo(() => {
    const value = search.toLowerCase();

    return leads.filter((lead) => {
      const matchesSearch =
        !value ||
        lead.name.toLowerCase().includes(value) ||
        lead.company.toLowerCase().includes(value) ||
        lead.email.toLowerCase().includes(value) ||
        lead.phone.toLowerCase().includes(value);

      const matchesSource =
        sourceFilter === "All Sources" || lead.source === sourceFilter;

      return matchesSearch && matchesSource;
    });
  }, [leads, search, sourceFilter]);

  const filteredCustomers = useMemo(() => {
    const value = search.toLowerCase();

    return customers.filter(
      (customer) =>
        customer.name.toLowerCase().includes(value) ||
        customer.company.toLowerCase().includes(value) ||
        customer.email.toLowerCase().includes(value) ||
        customer.city.toLowerCase().includes(value)
    );
  }, [customers, search]);

  const totalPipelineValue = leads
    .filter((lead) => lead.status !== "Lost")
    .reduce((sum, lead) => sum + lead.value, 0);

  const wonValue = leads
    .filter((lead) => lead.status === "Won")
    .reduce((sum, lead) => sum + lead.value, 0);

  const qualifiedValue = leads
    .filter((lead) => lead.status === "Qualified")
    .reduce((sum, lead) => sum + lead.value, 0);

  const conversionRate = Math.round((wonValue / totalPipelineValue) * 100);

  const totalRevenue = customers.reduce(
    (sum, customer) => sum + customer.totalPurchases,
    0
  );

  const createLead = () => {
    if (!leadForm.name || !leadForm.company || !leadForm.phone) {
      alert("Please enter lead name, company and phone.");
      return;
    }

    const newLead: Lead = {
      id: `LD-2026-${String(leads.length + 1).padStart(3, "0")}`,
      name: leadForm.name,
      company: leadForm.company,
      phone: leadForm.phone,
      email: leadForm.email,
      source: leadForm.source,
      value: Number(leadForm.value) || 0,
      expectedClose: leadForm.expectedClose || "Not specified",
      status: "New",
      lastActivity: "24 Aug 2026",
    };

    setLeads((current) => [newLead, ...current]);

    setLeadForm({
      name: "",
      company: "",
      phone: "",
      email: "",
      source: "Website",
      value: "",
      expectedClose: "",
    });

    setShowLeadForm(false);
    alert("Lead created successfully.");
  };

  const moveLead = (leadId: string, status: LeadStatus) => {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === leadId
          ? {
              ...lead,
              status,
              lastActivity: "24 Aug 2026",
            }
          : lead
      )
    );
  };

  const scheduleFollowUp = () => {
    if (!followUp.date || !followUp.time) {
      alert("Please select date and time.");
      return;
    }

    alert(
      `Follow-up scheduled for ${followUp.date} at ${followUp.time}${
        followUp.note ? `\n\n${followUp.note}` : ""
      }`
    );

    setFollowUp({
      date: "",
      time: "",
      note: "",
    });

    setShowFollowUp(false);
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                CRM & Customers
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage leads, customer relationships and sales pipeline.
              </p>
            </div>

            <button
              onClick={() => setShowLeadForm(true)}
              className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              + Create Lead
            </button>
          </div>

          {/* KPI CARDS */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <KpiCard
              title="Total Leads"
              value={String(leads.length)}
              subtitle="Active CRM leads"
            />

            <KpiCard
              title="Pipeline Value"
              value={`₹${totalPipelineValue.toLocaleString("en-IN")}`}
              subtitle="Open opportunity value"
              blue
            />

            <KpiCard
              title="Qualified Value"
              value={`₹${qualifiedValue.toLocaleString("en-IN")}`}
              subtitle="Qualified opportunities"
              yellow
            />

            <KpiCard
              title="Conversion"
              value={`${conversionRate || 0}%`}
              subtitle={`₹${wonValue.toLocaleString("en-IN")} won`}
              green
            />
          </div>

          {/* TABS */}
          <div className="mb-6 flex flex-wrap gap-2 rounded-xl border bg-white p-2 shadow-sm">
            <TabButton
              active={activeTab === "leads"}
              onClick={() => setActiveTab("leads")}
            >
              Lead List
            </TabButton>

            <TabButton
              active={activeTab === "pipeline"}
              onClick={() => setActiveTab("pipeline")}
            >
              Sales Pipeline
            </TabButton>

            <TabButton
              active={activeTab === "customers"}
              onClick={() => setActiveTab("customers")}
            >
              Customers
            </TabButton>

            <TabButton
              active={activeTab === "customer360"}
              onClick={() => setActiveTab("customer360")}
            >
              Customer 360
            </TabButton>
          </div>

          {/* LEADS */}
          {activeTab === "leads" && (
            <section>
              <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search lead, company, email..."
                    className="rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="rounded-lg border px-4 py-3 text-sm"
                  >
                    {sourceOptions.map((source) => (
                      <option key={source}>{source}</option>
                    ))}
                  </select>

                  <select className="rounded-lg border px-4 py-3 text-sm">
                    <option>All Statuses</option>
                    <option>New</option>
                    <option>Contacted</option>
                    <option>Qualified</option>
                    <option>Proposal</option>
                    <option>Won</option>
                    <option>Lost</option>
                  </select>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Lead List
                  </h2>
                  <p className="text-sm text-slate-500">
                    Manage leads and their current sales stage.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs">Lead</th>
                        <th className="px-5 py-3 text-left text-xs">Source</th>
                        <th className="px-5 py-3 text-right text-xs">
                          Value
                        </th>
                        <th className="px-5 py-3 text-left text-xs">
                          Close Date
                        </th>
                        <th className="px-5 py-3 text-center text-xs">
                          Status
                        </th>
                        <th className="px-5 py-3 text-center text-xs">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredLeads.map((lead) => (
                        <tr
                          key={lead.id}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold text-slate-900">
                              {lead.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {lead.company}
                            </p>
                            <p className="text-xs text-slate-400">
                              {lead.email}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-700">
                            {lead.source}
                          </td>

                          <td className="px-5 py-4 text-right font-semibold">
                            ₹{lead.value.toLocaleString("en-IN")}
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {lead.expectedClose}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[lead.status]}`}
                            >
                              {lead.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => {
                                setSearch(lead.name);
                                setActiveTab("customer360");
                              }}
                              className="mr-3 text-sm font-semibold text-blue-600"
                            >
                              View
                            </button>

                            <button
                              onClick={() => setShowFollowUp(true)}
                              className="text-sm font-semibold text-purple-600"
                            >
                              Follow-up
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredLeads.length === 0 && (
                  <div className="p-10 text-center text-slate-500">
                    No leads found.
                  </div>
                )}
              </div>
            </section>
          )}

          {/* PIPELINE */}
          {activeTab === "pipeline" && (
            <section>
              <div className="mb-5 rounded-xl border bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-3 md:flex-row">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Sales Pipeline
                    </h2>
                    <p className="text-sm text-slate-500">
                      Drag-and-drop style pipeline stage management.
                    </p>
                  </div>

                  <div className="text-sm text-slate-600">
                    Pipeline:
                    <strong className="ml-2 text-slate-900">
                      ₹{totalPipelineValue.toLocaleString("en-IN")}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-5">
                {pipelineStages.map((stage) => {
                  const stageLeads = leads.filter(
                    (lead) => lead.status === stage
                  );

                  const stageValue = stageLeads.reduce(
                    (sum, lead) => sum + lead.value,
                    0
                  );

                  return (
                    <div
                      key={stage}
                      className="min-h-[360px] rounded-xl border bg-slate-100 p-3"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-800">
                            {stage}
                          </h3>
                          <p className="text-xs text-slate-500">
                            ₹{stageValue.toLocaleString("en-IN")}
                          </p>
                        </div>

                        <span className="rounded-full bg-white px-2 py-1 text-xs font-bold">
                          {stageLeads.length}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {stageLeads.map((lead) => (
                          <div
                            key={lead.id}
                            draggable
                            onDragStart={(event) => {
                              event.dataTransfer.setData(
                                "leadId",
                                lead.id
                              );
                            }}
                            className="cursor-grab rounded-lg border bg-white p-4 shadow-sm active:cursor-grabbing"
                          >
                            <div className="mb-2 flex justify-between gap-2">
                              <p className="font-semibold text-slate-900">
                                {lead.name}
                              </p>
                              <span className="text-xs text-slate-400">
                                {lead.id}
                              </span>
                            </div>

                            <p className="text-xs text-slate-500">
                              {lead.company}
                            </p>

                            <p className="mt-3 font-bold text-blue-600">
                              ₹{lead.value.toLocaleString("en-IN")}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Close: {lead.expectedClose}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={(event) => {
                          event.preventDefault();
                          const leadId =
                            event.dataTransfer.getData("leadId");

                          if (leadId) {
                            moveLead(leadId, stage);
                          }
                        }}
                        className="mt-4 rounded-lg border-2 border-dashed border-slate-300 p-4 text-center text-xs text-slate-400"
                      >
                        Drop lead here
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* CUSTOMER LIST */}
          {activeTab === "customers" && (
            <section>
              <div className="mb-4 rounded-xl border bg-white p-4 shadow-sm">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search customer by name, company, email or city..."
                  className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="border-b px-6 py-4">
                  <h2 className="text-lg font-semibold">
                    Customer List
                  </h2>
                  <p className="text-sm text-slate-500">
                    Customer information and purchase history.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-blue-600 text-white">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs">
                          Customer
                        </th>
                        <th className="px-5 py-3 text-left text-xs">
                          Company
                        </th>
                        <th className="px-5 py-3 text-left text-xs">
                          City
                        </th>
                        <th className="px-5 py-3 text-right text-xs">
                          Orders
                        </th>
                        <th className="px-5 py-3 text-right text-xs">
                          Purchase Value
                        </th>
                        <th className="px-5 py-3 text-center text-xs">
                          Status
                        </th>
                        <th className="px-5 py-3 text-center text-xs">
                          Action
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr
                          key={customer.id}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <p className="font-semibold">
                              {customer.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {customer.email}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {customer.company}
                          </td>

                          <td className="px-5 py-4 text-sm">
                            {customer.city}
                          </td>

                          <td className="px-5 py-4 text-right">
                            {customer.orders}
                          </td>

                          <td className="px-5 py-4 text-right font-semibold">
                            ₹
                            {customer.totalPurchases.toLocaleString(
                              "en-IN"
                            )}
                          </td>

                          <td className="px-5 py-4 text-center">
                            <span
                              className={`rounded-full px-3 py-1 text-xs ${
                                customer.status === "Active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {customer.status}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-center">
                            <button
                              onClick={() => {
                                setSelectedCustomer(customer);
                                setActiveTab("customer360");
                              }}
                              className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
                            >
                              Customer 360
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* CUSTOMER 360 */}
          {activeTab === "customer360" && selectedCustomer && (
            <section>
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="rounded-xl border bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
                      {selectedCustomer.name.charAt(0)}
                    </div>

                    <div>
                      <h2 className="text-xl font-bold">
                        {selectedCustomer.name}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {selectedCustomer.company}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 text-sm">
                    <InfoRow
                      label="Phone"
                      value={selectedCustomer.phone}
                    />
                    <InfoRow
                      label="Email"
                      value={selectedCustomer.email}
                    />
                    <InfoRow
                      label="City"
                      value={selectedCustomer.city}
                    />
                    <InfoRow
                      label="Status"
                      value={selectedCustomer.status}
                    />
                  </div>
                </div>

                <div className="lg:col-span-2">
                  <div className="rounded-xl border bg-white shadow-sm">
                    <div className="border-b px-6 py-4">
                      <h2 className="text-lg font-semibold">
                        Customer 360
                      </h2>
                      <p className="text-sm text-slate-500">
                        Complete customer relationship overview.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
                      <MiniMetric
                        title="Orders"
                        value={String(selectedCustomer.orders)}
                      />

                      <MiniMetric
                        title="Purchase Value"
                        value={`₹${selectedCustomer.totalPurchases.toLocaleString(
                          "en-IN"
                        )}`}
                      />

                      <MiniMetric
                        title="Avg Order"
                        value={`₹${Math.round(
                          selectedCustomer.totalPurchases /
                            selectedCustomer.orders
                        ).toLocaleString("en-IN")}`}
                      />

                      <MiniMetric
                        title="Customer Since"
                        value="2025"
                      />
                    </div>

                    <div className="grid gap-4 border-t p-6 md:grid-cols-2">
                      <div className="rounded-lg bg-blue-50 p-5">
                        <h3 className="font-semibold text-blue-900">
                          AI Customer Insight
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-blue-800">
                          {selectedCustomer.name} is an active customer
                          with consistent purchase activity. The customer
                          may be a good candidate for repeat-order and
                          cross-sell campaigns.
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-5">
                        <h3 className="font-semibold text-slate-900">
                          Recommended Action
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Schedule a follow-up and review recent purchase
                          history before contacting the customer.
                        </p>

                        <button
                          onClick={() => setShowFollowUp(true)}
                          className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                        >
                          Schedule Follow-up
                        </button>
                      </div>
                    </div>

                    {/* ACTIVITY TIMELINE */}
                    <div className="border-t p-6">
                      <h3 className="mb-5 font-semibold">
                        Activity Timeline
                      </h3>

                      <div className="space-y-5">
                        <TimelineItem
                          title="Purchase order completed"
                          date="24 Aug 2026"
                          description="Customer purchase successfully processed."
                        />

                        <TimelineItem
                          title="Customer contacted"
                          date="21 Aug 2026"
                          description="Sales team followed up regarding new products."
                        />

                        <TimelineItem
                          title="Previous order delivered"
                          date="14 Aug 2026"
                          description="Order delivered successfully."
                        />

                        <TimelineItem
                          title="Customer created"
                          date="12 Jan 2025"
                          description="Customer profile added to StockFlow."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* CREATE LEAD MODAL */}
      {showLeadForm && (
        <Modal
          title="Create New Lead"
          onClose={() => setShowLeadForm(false)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              label="Lead Name"
              value={leadForm.name}
              onChange={(value) =>
                setLeadForm({ ...leadForm, name: value })
              }
              placeholder="Enter name"
            />

            <Input
              label="Company"
              value={leadForm.company}
              onChange={(value) =>
                setLeadForm({ ...leadForm, company: value })
              }
              placeholder="Company name"
            />

            <Input
              label="Phone"
              value={leadForm.phone}
              onChange={(value) =>
                setLeadForm({ ...leadForm, phone: value })
              }
              placeholder="+91..."
            />

            <Input
              label="Email"
              value={leadForm.email}
              onChange={(value) =>
                setLeadForm({ ...leadForm, email: value })
              }
              placeholder="email@example.com"
            />

            <div>
              <label className="mb-1 block text-sm font-medium">
                Lead Source
              </label>

              <select
                value={leadForm.source}
                onChange={(e) =>
                  setLeadForm({
                    ...leadForm,
                    source: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-3 py-2.5 text-sm"
              >
                {sourceOptions
                  .filter((item) => item !== "All Sources")
                  .map((source) => (
                    <option key={source}>{source}</option>
                  ))}
              </select>
            </div>

            <Input
              label="Expected Value"
              value={leadForm.value}
              onChange={(value) =>
                setLeadForm({ ...leadForm, value })
              }
              placeholder="₹"
              type="number"
            />

            <Input
              label="Expected Close Date"
              value={leadForm.expectedClose}
              onChange={(value) =>
                setLeadForm({
                  ...leadForm,
                  expectedClose: value,
                })
              }
              type="date"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowLeadForm(false)}
              className="rounded-lg border px-5 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>

            <button
              onClick={createLead}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Create Lead
            </button>
          </div>
        </Modal>
      )}

      {/* FOLLOW-UP MODAL */}
      {showFollowUp && (
        <Modal
          title="Schedule Follow-up"
          onClose={() => setShowFollowUp(false)}
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Date"
                type="date"
                value={followUp.date}
                onChange={(value) =>
                  setFollowUp({
                    ...followUp,
                    date: value,
                  })
                }
              />

              <Input
                label="Time"
                type="time"
                value={followUp.time}
                onChange={(value) =>
                  setFollowUp({
                    ...followUp,
                    time: value,
                  })
                }
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Reminder / Activity Note
              </label>

              <textarea
                value={followUp.note}
                onChange={(e) =>
                  setFollowUp({
                    ...followUp,
                    note: e.target.value,
                  })
                }
                placeholder="Enter follow-up notes..."
                rows={4}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFollowUp(false)}
                className="rounded-lg border px-5 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                onClick={scheduleFollowUp}
                className="rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Schedule Reminder
              </button>
            </div>
          </div>
        </Modal>
      )}
    </PageLayout>
  );
}

/* ================= COMPONENTS ================= */

function KpiCard({
  title,
  value,
  subtitle,
  blue = false,
  yellow = false,
  green = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  blue?: boolean;
  yellow?: boolean;
  green?: boolean;
}) {
  const valueClass = green
    ? "text-green-600"
    : yellow
    ? "text-yellow-600"
    : blue
    ? "text-blue-600"
    : "text-slate-900";

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>

      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
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
    <div className="flex justify-between gap-4 border-b pb-3">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}

function MiniMetric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}

function TimelineItem({
  title,
  date,
  description,
}: {
  title: string;
  date: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 h-3 w-3 shrink-0 rounded-full bg-blue-600" />

      <div className="flex-1 border-b pb-4">
        <div className="flex flex-col justify-between gap-1 md:flex-row">
          <h4 className="font-semibold text-slate-900">{title}</h4>
          <span className="text-xs text-slate-400">{date}</span>
        </div>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}