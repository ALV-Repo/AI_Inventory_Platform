"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";
import { api, fmtDate } from "../../../lib/api";

type PutAway = {
  id: number;
  purchase_order_id: number;
  product_id: number;
  warehouse_id: number;
  suggested_bin_id?: number;
  actual_bin_id?: number;
  quantity: number;
  status: string;
  assigned_to?: number;
  created_at: string;
};

const statusColor = (s: string) => ({
  pending: "bg-yellow-50 text-yellow-700",
  completed: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-red-700",
}[s?.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function PutAwayPage() {
  const [tasks, setTasks] = useState<PutAway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completing, setCompleting] = useState<number | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.warehouse.putAways();
      setTasks(data as PutAway[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load put-away tasks.");
    } finally {
      setLoading(false);
    }
  }

  async function completeTask(id: number) {
    try {
      setCompleting(id);
      await api.warehouse.completePutAway(id);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to complete put-away.");
    } finally {
      setCompleting(null);
    }
  }

  const filtered = tasks.filter(t =>
    filter === "all" ? true : t.status === filter
  );

  const pending = tasks.filter(t => t.status === "pending").length;

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Put-Away Tasks</h1>
            <p className="mt-1 text-sm text-gray-500">Place received goods into warehouse bins</p>
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Tasks", value: tasks.length },
            { label: "Pending", value: pending, color: "text-yellow-600" },
            { label: "Completed", value: tasks.filter(t => t.status === "completed").length, color: "text-green-600" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-2xl font-bold ${c.color ?? "text-gray-900"}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex gap-2">
          {["all", "pending", "completed"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${filter === f ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              {f}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading tasks...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-sm text-gray-500">No {filter === "all" ? "" : filter} put-away tasks</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Task #", "PO Ref", "Product", "Warehouse", "Qty", "Status", "Created", "Action"].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-sm font-bold text-gray-900">PA-{t.id}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">PO-{t.purchase_order_id}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">#{t.product_id}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">WH-{t.warehouse_id}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{t.quantity}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{fmtDate(t.created_at)}</td>
                    <td className="px-5 py-4">
                      {t.status === "pending" && (
                        <button onClick={() => completeTask(t.id)} disabled={completing === t.id}
                          className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                          {completing === t.id ? "..." : "Complete"}
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
