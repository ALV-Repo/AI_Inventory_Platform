"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";
import { api, fmtDate } from "../../../lib/api";

type Activity = {
  id: number;
  lead_id: number;
  activity_type: string;
  description: string;
  due_date?: string;
  completed: boolean;
  completed_at?: string;
  created_at: string;
};

type Lead = {
  id: number;
  name: string;
  status: string;
  activities?: Activity[];
};

const typeColor = (t: string) => ({
  call: "bg-blue-50 text-blue-700",
  email: "bg-purple-50 text-purple-700",
  meeting: "bg-green-50 text-green-700",
  note: "bg-gray-100 text-gray-700",
  follow_up: "bg-orange-50 text-orange-700",
}[t?.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function CRMFollowUpsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [allActivities, setAllActivities] = useState<(Activity & { lead_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const leadsData = await api.crm.leads();
      setLeads(leadsData);

      // Load activities for all leads
      const activitiesWithLead: (Activity & { lead_name: string })[] = [];
      for (const lead of leadsData.slice(0, 20)) {
        try {
          const acts = await api.crm.activities(lead.id);
          (acts as Activity[]).forEach(a => {
            activitiesWithLead.push({ ...a, lead_name: lead.name });
          });
        } catch {}
      }
      // Sort by due_date
      activitiesWithLead.sort((a, b) => {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
      setAllActivities(activitiesWithLead);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load follow-ups.");
    } finally {
      setLoading(false);
    }
  }

  async function completeActivity(id: number) {
    try {
      await api.crm.completeActivity(id);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to mark complete.");
    }
  }

  const filtered = useMemo(() => allActivities.filter(a => {
    if (filter === "pending") return !a.completed;
    if (filter === "completed") return a.completed;
    return true;
  }), [allActivities, filter]);

  const pending = allActivities.filter(a => !a.completed).length;
  const overdue = allActivities.filter(a =>
    !a.completed && a.due_date && new Date(a.due_date) < new Date()
  ).length;

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CRM Follow-ups</h1>
          <p className="mt-1 text-sm text-gray-500">Scheduled activities and interactions across all leads</p>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Activities", value: allActivities.length },
            { label: "Pending", value: pending, color: "text-yellow-600" },
            { label: "Overdue", value: overdue, color: "text-red-600" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-2xl font-bold ${c.color ?? "text-gray-900"}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex gap-2">
          {(["all", "pending", "completed"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${filter === f ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              {f}
            </button>
          ))}
          <button onClick={load} className="ml-auto rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        <div className="space-y-3">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading activities...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-sm text-gray-500">No {filter} activities</p>
            </div>
          ) : filtered.map(act => {
            const isOverdue = !act.completed && act.due_date && new Date(act.due_date) < new Date();
            return (
              <div key={act.id} className={`rounded-xl border bg-white p-4 shadow-sm ${isOverdue ? "border-red-200" : "border-gray-200"} ${act.completed ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${typeColor(act.activity_type)}`}>
                        {act.activity_type.replace("_", " ")}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{act.lead_name}</span>
                      {isOverdue && <span className="text-xs font-semibold text-red-600">OVERDUE</span>}
                    </div>
                    <p className="text-sm text-gray-600">{act.description}</p>
                    {act.due_date && (
                      <p className={`mt-1 text-xs ${isOverdue ? "text-red-500" : "text-gray-400"}`}>
                        Due: {fmtDate(act.due_date)}
                      </p>
                    )}
                  </div>
                  {!act.completed && (
                    <button onClick={() => completeActivity(act.id)}
                      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700">
                      ✓ Mark Done
                    </button>
                  )}
                  {act.completed && (
                    <span className="text-xs text-green-600 font-semibold">✓ Completed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
