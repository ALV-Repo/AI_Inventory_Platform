"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, fmtDate } from "../../../lib/api";

type PickList = {
  id: number;
  sales_order_id: number;
  warehouse_id: number;
  status: string;
  assigned_to?: number;
  created_at: string;
  completed_at?: string;
  line_count: number;
};

const statusColor = (s: string) => ({
  pending: "bg-yellow-50 text-yellow-700",
  in_progress: "bg-blue-50 text-blue-700",
  completed: "bg-green-50 text-green-700",
}[s.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function PickListPage() {
  const [lists, setLists] = useState<PickList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Record<string, unknown> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.warehouse.pickLists(statusFilter === "all" ? undefined : statusFilter);
      setLists(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load pick lists.");
    } finally {
      setLoading(false);
    }
  }

  async function viewDetail(id: number) {
    try {
      setDetailLoading(true);
      const data = await api.warehouse.getPickList(id);
      setSelected(data as Record<string, unknown>);
    } catch {
      setError("Failed to load pick list detail.");
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pick Lists</h1>
          <p className="mt-1 text-sm text-gray-500">Warehouse picking tasks for sales orders</p>
        </div>

        {/* Sub-nav */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            { label: "Overview", href: "/warehouse" },
            { label: "Pick Lists", href: "/warehouse/pick-list" },
            { label: "Put-Away", href: "/warehouse/put-away" },
            { label: "Dispatch", href: "/warehouse/dispatch" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${href === "/warehouse/pick-list" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {label}
            </Link>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Filter */}
        <div className="mb-5 flex gap-2">
          {["all", "pending", "in_progress", "completed"].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); load(); }}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${statusFilter === s ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              {s.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading pick lists...</p>
            </div>
          ) : lists.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-gray-500 text-sm">No pick lists found</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Pick List #", "Sales Order", "Lines", "Status", "Created", "Completed", "Action"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lists.map(pl => (
                  <tr key={pl.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-gray-900">PL-{pl.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">SO-{pl.sales_order_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{pl.line_count} items</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(pl.status)}`}>
                        {pl.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{fmtDate(pl.created_at)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{pl.completed_at ? fmtDate(pl.completed_at) : "-"}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => viewDetail(pl.id)} className="text-sm font-medium text-blue-600 hover:text-blue-800">View Lines</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Detail modal */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setSelected(null)}>
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Pick List PL-{selected.id as number}</h2>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="mb-4 grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-gray-500">Sales Order:</span> <span className="font-medium">SO-{selected.sales_order_id as number}</span></div>
                <div><span className="text-gray-500">Status:</span> <span className="font-medium capitalize">{String(selected.status).replace("_", " ")}</span></div>
              </div>
              <h3 className="mb-2 font-semibold text-gray-800 text-sm">Pick Lines</h3>
              <div className="space-y-2">
                {((selected.lines as Array<Record<string, unknown>>) ?? []).map((line, i) => (
                  <div key={i} className={`rounded-lg border p-3 text-sm ${line.is_picked ? "border-green-200 bg-green-50" : "border-gray-200"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">Product #{line.product_id as number}</span>
                      <span className={`text-xs font-semibold ${line.is_picked ? "text-green-600" : "text-yellow-600"}`}>
                        {line.is_picked ? "✓ Picked" : "Pending"}
                      </span>
                    </div>
                    <div className="mt-1 text-gray-500">
                      Required: {line.quantity_required as number} | Picked: {line.quantity_picked as number}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setSelected(null)} className="mt-5 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Close</button>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
