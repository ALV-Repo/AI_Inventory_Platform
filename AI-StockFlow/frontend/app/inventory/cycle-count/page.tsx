"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";
import { api, fmtDate } from "../../../lib/api";

type CycleCountSession = {
  id: number;
  warehouse_id: number;
  status: string;
  created_by: number;
  created_at: string;
  closed_at?: string;
};

const statusColor = (s: string) => ({
  open: "bg-blue-50 text-blue-700",
  closed: "bg-green-50 text-green-700",
}[s?.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function CycleCountPage() {
  const [sessions, setSessions] = useState<CycleCountSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      // GET cycle count sessions
      const data = await api.request<CycleCountSession[]>("/inventory/cycle-counts");
      setSessions(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load cycle count sessions.");
    } finally {
      setLoading(false);
    }
  }

  async function createSession() {
    try {
      setCreating(true);
      await api.request("/inventory/cycle-counts", {
        method: "POST",
        body: JSON.stringify({ warehouse_id: 1 }),
      });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create session.");
    } finally {
      setCreating(false);
    }
  }

  async function closeSession(id: number) {
    try {
      await api.request(`/inventory/cycle-counts/${id}/close`, { method: "POST" });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to close session.");
    }
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cycle Count</h1>
            <p className="mt-1 text-sm text-gray-500">Physical stock count sessions</p>
          </div>
          <button onClick={createSession} disabled={creating}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            {creating ? "Creating..." : "+ New Count Session"}
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Sessions", value: sessions.length },
            { label: "Open", value: sessions.filter(s => s.status === "open").length, color: "text-blue-600" },
            { label: "Closed", value: sessions.filter(s => s.status === "closed").length, color: "text-green-600" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-2xl font-bold ${c.color ?? "text-gray-900"}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">📊</p>
              <p className="text-sm text-gray-500">No cycle count sessions yet</p>
              <button onClick={createSession} className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Start First Count
              </button>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Session #", "Warehouse", "Status", "Created", "Closed", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sessions.map(s => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm font-bold text-gray-900">CC-{s.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Warehouse #{s.warehouse_id}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{fmtDate(s.created_at)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.closed_at ? fmtDate(s.closed_at) : "-"}</td>
                    <td className="px-6 py-4">
                      {s.status === "open" && (
                        <button onClick={() => closeSession(s.id)}
                          className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
                          Close Session
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
