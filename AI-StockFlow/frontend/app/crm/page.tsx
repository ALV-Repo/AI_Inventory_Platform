"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api, type Lead } from "../../lib/api";

const SOURCES = ["walk_in", "referral", "online", "campaign"];
const STATUSES = ["new", "contacted", "qualified", "converted", "lost"];

const statusColor = (s: string) => ({
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-yellow-50 text-yellow-700",
  qualified: "bg-purple-50 text-purple-700",
  converted: "bg-green-50 text-green-700",
  lost: "bg-red-50 text-red-700",
}[s] ?? "bg-gray-100 text-gray-700");

const sourceLabel = (s: string) => s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<unknown[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", source: "walk_in", notes: "" });
  const [activityForm, setActivityForm] = useState({ description: "", activity_type: "note" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, [statusFilter, sourceFilter]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.crm.leads({
        status: statusFilter || undefined,
        source: sourceFilter || undefined,
      });
      setLeads(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load leads.");
    } finally {
      setLoading(false);
    }
  }

  async function openLead(lead: Lead) {
    setSelected(lead);
    setActivities([]);
    try {
      const acts = await api.crm.activities(lead.id);
      setActivities(acts);
    } catch {}
  }

  async function createLead() {
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      await api.crm.createLead(form);
      setShowCreate(false);
      setForm({ name: "", email: "", phone: "", source: "walk_in", notes: "" });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create lead.");
    } finally {
      setSaving(false);
    }
  }

  async function addActivity() {
    if (!selected || !activityForm.description.trim()) return;
    try {
      setSaving(true);
      await api.crm.addActivity({ lead_id: selected.id, ...activityForm });
      const acts = await api.crm.activities(selected.id);
      setActivities(acts);
      setActivityForm({ description: "", activity_type: "note" });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to add activity.");
    } finally {
      setSaving(false);
    }
  }

  async function updateLeadStatus(lead: Lead, status: string) {
    try {
      await api.crm.updateLead(lead.id, { status });
      await load();
      if (selected?.id === lead.id) setSelected({ ...lead, status });
    } catch {}
  }

  const filtered = leads.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    (l.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (l.phone ?? "").includes(search)
  );

  const counts = STATUSES.reduce((acc, s) => ({ ...acc, [s]: leads.filter(l => l.status === s).length }), {} as Record<string, number>);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">CRM — Leads</h1>
            <p className="mt-1 text-sm text-gray-500">Track and manage customer leads</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            + Add Lead
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Pipeline status strip */}
        <div className="mb-6 grid grid-cols-5 gap-3">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className={`rounded-xl border p-4 text-left transition ${statusFilter === s ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 bg-white"}`}
            >
              <p className="text-sm text-gray-500 capitalize">{s}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{loading ? "-" : counts[s] ?? 0}</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 flex gap-3">
          <input
            type="text"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Sources</option>
            {SOURCES.map(s => <option key={s} value={s}>{sourceLabel(s)}</option>)}
          </select>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {/* Leads table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading leads...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Name", "Source", "Phone / Email", "Status", "Activities", "Action"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-12 text-center text-sm text-gray-400">No leads found</td></tr>
                ) : filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button onClick={() => openLead(lead)} className="font-semibold text-blue-600 hover:text-blue-800">{lead.name}</button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{sourceLabel(lead.source)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.phone ?? lead.email ?? "-"}</td>
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        onChange={e => updateLeadStatus(lead, e.target.value)}
                        className={`rounded-full border-0 px-3 py-1 text-xs font-medium outline-none ${statusColor(lead.status)}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s} className="bg-white text-gray-900 capitalize">{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{lead.activity_count}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => openLead(lead)} className="text-sm font-medium text-blue-600 hover:text-blue-800">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Lead detail modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setSelected(null)}>
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                  <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor(selected.status)}`}>
                    {selected.status}
                  </span>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Source:</span> <span className="font-medium">{sourceLabel(selected.source)}</span></div>
                <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selected.phone ?? "-"}</span></div>
                <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selected.email ?? "-"}</span></div>
              </div>

              {selected.notes && (
                <div className="mb-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{selected.notes}</div>
              )}

              {/* Activity timeline */}
              <h3 className="mb-2 font-semibold text-gray-900">Activity Timeline</h3>
              <div className="mb-4 space-y-2 max-h-40 overflow-y-auto">
                {(activities as Array<Record<string, unknown>>).length === 0 ? (
                  <p className="text-sm text-gray-400">No activities yet</p>
                ) : (activities as Array<Record<string, unknown>>).map((a, i) => (
                  <div key={i} className="rounded-lg border border-gray-100 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize text-gray-700">{String(a.activity_type)}</span>
                      <span className={`text-xs ${a.completed ? "text-green-600" : "text-gray-400"}`}>
                        {a.completed ? "✓ Done" : "Pending"}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-600">{String(a.description)}</p>
                  </div>
                ))}
              </div>

              {/* Add activity */}
              <div className="rounded-lg border border-gray-200 p-3">
                <p className="mb-2 text-sm font-medium text-gray-700">Add Activity</p>
                <select
                  value={activityForm.activity_type}
                  onChange={e => setActivityForm(f => ({ ...f, activity_type: e.target.value }))}
                  className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                >
                  {["note", "call", "email", "meeting", "follow_up"].map(t => (
                    <option key={t} value={t} className="capitalize">{t.replace("_", " ")}</option>
                  ))}
                </select>
                <textarea
                  placeholder="Describe the activity..."
                  value={activityForm.description}
                  onChange={e => setActivityForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                />
                <button
                  onClick={addActivity}
                  disabled={saving || !activityForm.description.trim()}
                  className="mt-2 w-full rounded-lg bg-blue-600 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add Activity"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create lead modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Add Lead</h2>
              <div className="space-y-3">
                {[
                  { label: "Name *", key: "name", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Phone", key: "phone", type: "tel" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                    <input
                      type={type}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Source</label>
                  <select
                    value={form.source}
                    onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    {SOURCES.map(s => <option key={s} value={s}>{sourceLabel(s)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={createLead} disabled={saving} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Add Lead"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
