"use client";

import { useEffect, useMemo, useState } from "react";

type FollowUpStatus = "Scheduled" | "Completed" | "Overdue";

type FollowUp = {
  id: string;
  lead: string;
  company: string;
  date: string;
  time: string;
  type: string;
  notes: string;
  status: FollowUpStatus;
};

type Interaction = {
  id: string;
  lead: string;
  date: string;
  type: string;
  notes: string;
};

const initialFollowUps: FollowUp[] = [
  {
    id: "FU-001",
    lead: "Rahul Mehta",
    company: "Apex Retail Solutions",
    date: "2026-09-08",
    time: "10:30",
    type: "Call",
    notes: "Discuss inventory management requirements.",
    status: "Scheduled",
  },
  {
    id: "FU-002",
    lead: "Priya Shah",
    company: "Green Valley Stores",
    date: "2026-09-06",
    time: "14:00",
    type: "Meeting",
    notes: "Product demonstration.",
    status: "Completed",
  },
  {
    id: "FU-003",
    lead: "Arjun Rao",
    company: "Metro Office Supplies",
    date: "2026-09-05",
    time: "11:00",
    type: "Email",
    notes: "Send quotation and pricing details.",
    status: "Overdue",
  },
];

const initialInteractions: Interaction[] = [
  {
    id: "INT-001",
    lead: "Rahul Mehta",
    date: "2026-09-04",
    type: "Call",
    notes: "Initial discussion completed.",
  },
  {
    id: "INT-002",
    lead: "Priya Shah",
    date: "2026-09-03",
    type: "Meeting",
    notes: "Demo completed successfully.",
  },
];

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>(() => {
    if (typeof window === "undefined") return initialFollowUps;

    const saved = localStorage.getItem("stockflow-crm-followups");
    return saved ? JSON.parse(saved) : initialFollowUps;
  });

  const [interactions, setInteractions] = useState<Interaction[]>(() => {
    if (typeof window === "undefined") return initialInteractions;

    const saved = localStorage.getItem("stockflow-crm-interactions");
    return saved ? JSON.parse(saved) : initialInteractions;
  });

  const [showAdd, setShowAdd] = useState(false);
  const [showInteraction, setShowInteraction] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [form, setForm] = useState({
    lead: "",
    company: "",
    date: "",
    time: "",
    type: "Call",
    notes: "",
  });

  const [interactionForm, setInteractionForm] = useState({
    lead: "",
    type: "Call",
    notes: "",
  });

  useEffect(() => {
    localStorage.setItem(
      "stockflow-crm-followups",
      JSON.stringify(followUps)
    );
  }, [followUps]);

  useEffect(() => {
    localStorage.setItem(
      "stockflow-crm-interactions",
      JSON.stringify(interactions)
    );
  }, [interactions]);

  const filteredFollowUps = useMemo(() => {
    return followUps.filter((item) => {
      const matchesSearch =
        item.lead.toLowerCase().includes(search.toLowerCase()) ||
        item.company.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [followUps, search, statusFilter]);

  const scheduled = followUps.filter(
    (item) => item.status === "Scheduled"
  ).length;

  const completed = followUps.filter(
    (item) => item.status === "Completed"
  ).length;

  const overdue = followUps.filter(
    (item) => item.status === "Overdue"
  ).length;

  function addFollowUp() {
    if (!form.lead.trim() || !form.date || !form.time) {
      alert("Please enter lead, date and time.");
      return;
    }

    const newFollowUp: FollowUp = {
      id: `FU-${String(followUps.length + 1).padStart(3, "0")}`,
      lead: form.lead,
      company: form.company,
      date: form.date,
      time: form.time,
      type: form.type,
      notes: form.notes,
      status: "Scheduled",
    };

    setFollowUps((current) => [newFollowUp, ...current]);

    setForm({
      lead: "",
      company: "",
      date: "",
      time: "",
      type: "Call",
      notes: "",
    });

    setShowAdd(false);
  }

  function updateStatus(id: string, status: FollowUpStatus) {
    setFollowUps((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  }

  function addInteraction() {
    if (!interactionForm.lead.trim() || !interactionForm.notes.trim()) {
      alert("Please enter lead and interaction notes.");
      return;
    }

    const newInteraction: Interaction = {
      id: `INT-${String(interactions.length + 1).padStart(3, "0")}`,
      lead: interactionForm.lead,
      date: new Date().toISOString().split("T")[0],
      type: interactionForm.type,
      notes: interactionForm.notes,
    };

    setInteractions((current) => [newInteraction, ...current]);

    setInteractionForm({
      lead: "",
      type: "Call",
      notes: "",
    });

    setShowInteraction(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              CRM Follow-ups
            </h1>
            <p className="text-sm text-slate-500">
              Schedule follow-ups, reminders and customer interactions.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowInteraction(true)}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
            >
              + Log Interaction
            </button>

            <button
              onClick={() => setShowAdd(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
            >
              + Schedule Follow-up
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-slate-500">TOTAL FOLLOW-UPS</p>
            <p className="mt-2 text-2xl font-bold">{followUps.length}</p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-slate-500">SCHEDULED</p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {scheduled}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-slate-500">COMPLETED</p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {completed}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-slate-500">OVERDUE</p>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {overdue}
            </p>
          </div>
        </div>

        <div className="mb-4 rounded-xl border bg-white p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lead, company or activity..."
              className="rounded-lg border px-3 py-2 text-sm"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="All">All Statuses</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-xl border bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold">Scheduled Follow-ups</h2>
            <p className="text-xs text-slate-500">
              Manage upcoming calls, meetings and reminders.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Notes</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredFollowUps.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{item.lead}</div>
                      <div className="text-xs text-slate-400">
                        {item.company}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div>{item.date}</div>
                      <div className="text-xs text-slate-400">
                        {item.time}
                      </div>
                    </td>

                    <td className="px-4 py-3">{item.type}</td>

                    <td className="max-w-xs px-4 py-3 text-xs text-slate-600">
                      {item.notes}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                        {item.status}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          updateStatus(
                            item.id,
                            e.target.value as FollowUpStatus
                          )
                        }
                        className="rounded border px-2 py-1 text-xs"
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="Completed">Completed</option>
                        <option value="Overdue">Overdue</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t p-3 text-xs text-slate-500">
            Showing {filteredFollowUps.length} of {followUps.length} follow-ups
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold">Interaction Timeline</h2>
            <p className="text-xs text-slate-500">
              All logged interactions against leads and customers.
            </p>
          </div>

          <div className="divide-y">
            {interactions.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-4"
              >
                <div>
                  <div className="font-semibold">{item.lead}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.date} · {item.type}
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    {item.notes}
                  </div>
                </div>

                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs">
                  {item.id}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Schedule Follow-up</h2>
              <button
                onClick={() => setShowAdd(false)}
                className="text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-3">
              <input
                placeholder="Lead / Customer"
                value={form.lead}
                onChange={(e) =>
                  setForm({ ...form, lead: e.target.value })
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

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm({ ...form, date: e.target.value })
                  }
                  className="rounded-lg border px-3 py-2 text-sm"
                />

                <input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm({ ...form, time: e.target.value })
                  }
                  className="rounded-lg border px-3 py-2 text-sm"
                />
              </div>

              <select
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option>Call</option>
                <option>Meeting</option>
                <option>Email</option>
                <option>WhatsApp</option>
                <option>Visit</option>
              </select>

              <textarea
                placeholder="Follow-up notes / reminder"
                value={form.notes}
                onChange={(e) =>
                  setForm({ ...form, notes: e.target.value })
                }
                className="min-h-24 rounded-lg border px-3 py-2 text-sm"
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
                onClick={addFollowUp}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {showInteraction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold">Log Interaction</h2>
              <button
                onClick={() => setShowInteraction(false)}
                className="text-slate-500"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-3">
              <input
                placeholder="Lead / Customer"
                value={interactionForm.lead}
                onChange={(e) =>
                  setInteractionForm({
                    ...interactionForm,
                    lead: e.target.value,
                  })
                }
                className="rounded-lg border px-3 py-2 text-sm"
              />

              <select
                value={interactionForm.type}
                onChange={(e) =>
                  setInteractionForm({
                    ...interactionForm,
                    type: e.target.value,
                  })
                }
                className="rounded-lg border px-3 py-2 text-sm"
              >
                <option>Call</option>
                <option>Meeting</option>
                <option>Email</option>
                <option>WhatsApp</option>
                <option>Visit</option>
              </select>

              <textarea
                placeholder="Interaction notes"
                value={interactionForm.notes}
                onChange={(e) =>
                  setInteractionForm({
                    ...interactionForm,
                    notes: e.target.value,
                  })
                }
                className="min-h-24 rounded-lg border px-3 py-2 text-sm"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setShowInteraction(false)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={addInteraction}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Save Interaction
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}