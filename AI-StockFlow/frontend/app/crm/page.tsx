"use client";

import { useEffect, useMemo, useState } from "react";

type LeadStatus = "New" | "Contacted" | "Qualified" | "Converted" | "Lost";

type Lead = {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  source: string;
  status: LeadStatus;
  value: number;
};

const initialLeads: Lead[] = [
  {
    id: "LEAD-001",
    name: "Rahul Mehta",
    company: "Apex Retail Solutions",
    phone: "+91 98765 43210",
    email: "rahul@apexretail.com",
    source: "Website",
    status: "New",
    value: 85000,
  },
  {
    id: "LEAD-002",
    name: "Priya Shah",
    company: "Green Valley Stores",
    phone: "+91 98765 11111",
    email: "priya@greenvalley.com",
    source: "Referral",
    status: "Contacted",
    value: 65000,
  },
  {
    id: "LEAD-003",
    name: "Arjun Rao",
    company: "Metro Office Supplies",
    phone: "+91 98765 22222",
    email: "arjun@metrooffice.com",
    source: "Campaign",
    status: "Qualified",
    value: 120000,
  },
];

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>(() => {
  if (typeof window === "undefined") return initialLeads;

  const saved = localStorage.getItem("stockflow-crm-leads");

  return saved ? JSON.parse(saved) : initialLeads;
});

useEffect(() => {
  localStorage.setItem("stockflow-crm-leads", JSON.stringify(leads));
}, [leads]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    source: "Website",
    value: "",
  });

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.name.toLowerCase().includes(search.toLowerCase()) ||
        lead.company.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone.includes(search) ||
        lead.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || lead.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, search, statusFilter]);

  const totalValue = leads.reduce((sum, lead) => sum + lead.value, 0);
  const qualified = leads.filter((lead) => lead.status === "Qualified").length;
  const converted = leads.filter((lead) => lead.status === "Converted").length;

  function addLead() {
    if (!form.name.trim() || !form.company.trim()) {
      alert("Please enter lead name and company.");
      return;
    }

    const newLead: Lead = {
      id: `LEAD-${String(leads.length + 1).padStart(3, "0")}`,
      name: form.name,
      company: form.company,
      phone: form.phone,
      email: form.email,
      source: form.source,
      status: "New",
      value: Number(form.value) || 0,
    };

    setLeads((current) => [newLead, ...current]);
    setForm({
      name: "",
      company: "",
      phone: "",
      email: "",
      source: "Website",
      value: "",
    });
    setShowAdd(false);
  }

  function updateStatus(id: string, status: LeadStatus) {
    setLeads((current) =>
      current.map((lead) =>
        lead.id === id ? { ...lead, status } : lead
      )
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">CRM</h1>
            <p className="text-sm text-slate-500">
              Manage leads, prospects and customer opportunities.
            </p>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            + Add Lead
          </button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-slate-500">TOTAL LEADS</p>
            <p className="mt-2 text-2xl font-bold">{leads.length}</p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-slate-500">QUALIFIED</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {qualified}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-slate-500">CONVERTED</p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {converted}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-slate-500">PIPELINE VALUE</p>
            <p className="mt-2 text-2xl font-bold">
              ₹{totalValue.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border bg-white p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lead, company, phone or email..."
              className="rounded-lg border px-3 py-2 text-sm"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold text-slate-900">Lead Management</h2>
            <p className="text-xs text-slate-500">
              Track prospects through the sales pipeline.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{lead.name}</div>
                      <div className="text-xs text-slate-400">{lead.id}</div>
                    </td>

                    <td className="px-4 py-3">{lead.company}</td>

                    <td className="px-4 py-3">
                      <div>{lead.phone}</div>
                      <div className="text-xs text-slate-400">
                        {lead.email}
                      </div>
                    </td>

                    <td className="px-4 py-3">{lead.source}</td>

                    <td className="px-4 py-3 font-semibold">
                      ₹{lead.value.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {lead.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) =>
                          updateStatus(
                            lead.id,
                            e.target.value as LeadStatus
                          )
                        }
                        className="rounded border px-2 py-1 text-xs"
                      >
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Converted">Converted</option>
                        <option value="Lost">Lost</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t p-3 text-xs text-slate-500">
            Showing {filteredLeads.length} of {leads.length} leads
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Add Lead</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-3">
              <input
                placeholder="Lead Name"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                className="rounded-lg border px-3 py-2 text-sm"
              />

              <input
                placeholder="Company"
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
                className="rounded-lg border px-3 py-2 text-sm"
              />

              <input
                placeholder="Phone"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                className="rounded-lg border px-3 py-2 text-sm"
              />

              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="rounded-lg border px-3 py-2 text-sm"
              />

              <select
                value={form.source}
                onChange={(e) =>
                  setForm({ ...form, source: e.target.value })
                }
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option>Website</option>
                <option>Referral</option>
                <option>Campaign</option>
                <option>Social Media</option>
                <option>Walk-in</option>
              </select>

              <input
                type="number"
                placeholder="Opportunity Value"
                value={form.value}
                onChange={(e) =>
                  setForm({ ...form, value: e.target.value })
                }
                className="rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={addLead}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Save Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}