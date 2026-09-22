"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api, fmtDate } from "../../lib/api";

type AuditLog = {
  id: number;
  user_id: number;
  action: string;
  entity_type: string;
  entity_id: number;
  details: Record<string, unknown>;
  ip_address: string;
  created_at: string;
};

const actionColor = (action: string) => {
  if (action.includes("created")) return "bg-green-50 text-green-700";
  if (action.includes("updated") || action.includes("approved")) return "bg-blue-50 text-blue-700";
  if (action.includes("deleted") || action.includes("rejected")) return "bg-red-50 text-red-700";
  return "bg-gray-100 text-gray-700";
};

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [selected, setSelected] = useState<AuditLog | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.auditLogs.list();
      setLogs(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }

  const modules = ["All", ...Array.from(new Set(logs.map(l => l.entity_type).filter(Boolean)))];

  const filtered = useMemo(() => logs.filter(l => {
    const matchSearch = l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.entity_type ?? "").toLowerCase().includes(search.toLowerCase());
    const matchModule = moduleFilter === "All" || l.entity_type === moduleFilter;
    return matchSearch && matchModule;
  }), [logs, search, moduleFilter]);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Audit Trail</h1>
            <p className="mt-1 text-sm text-gray-500">Immutable log of all actions across the platform</p>
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Filters */}
        <div className="mb-5 flex gap-3">
          <input
            type="text"
            placeholder="Search by action or module..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            {modules.map(m => <option key={m} value={m}>{m === "All" ? "All Modules" : m}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading audit logs...</p>
            </div>
          ) : (
            <>
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Activity Log</h2>
                <span className="text-sm text-gray-500">{filtered.length} entries</span>
              </div>
              <table className="w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    {["Time", "Action", "Module", "Entity ID", "User", "IP", "Details"].map(h => (
                      <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400">No audit logs found</td></tr>
                  ) : filtered.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(log.created_at)}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${actionColor(log.action)}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-600">{log.entity_type ?? "-"}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">{log.entity_id ?? "-"}</td>
                      <td className="px-5 py-3 text-sm text-gray-600">User #{log.user_id}</td>
                      <td className="px-5 py-3 text-xs font-mono text-gray-500">{log.ip_address ?? "-"}</td>
                      <td className="px-5 py-3">
                        {log.details && (
                          <button onClick={() => setSelected(log)} className="text-xs font-medium text-blue-600 hover:text-blue-800">View</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* Detail modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setSelected(null)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Audit Log Details</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Action</span><span className="font-medium">{selected.action}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Module</span><span className="font-medium">{selected.entity_type}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Entity ID</span><span className="font-medium">{selected.entity_id}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Time</span><span className="font-medium">{fmtDate(selected.created_at)}</span></div>
                <div className="flex justify-between border-b pb-2"><span className="text-gray-500">IP</span><span className="font-mono text-xs">{selected.ip_address ?? "-"}</span></div>
              </div>
              {selected.details && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-1 text-xs font-semibold text-gray-500 uppercase">Details</p>
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-40">
                    {JSON.stringify(selected.details, null, 2)}
                  </pre>
                </div>
              )}
              <button onClick={() => setSelected(null)} className="mt-4 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Close</button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
