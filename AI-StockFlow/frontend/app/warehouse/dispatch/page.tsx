"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, fmtDate } from "../../../lib/api";

type Dispatch = {
  id: number;
  sales_order_id: number;
  gate_pass_number: string;
  courier?: string;
  tracking_number?: string;
  dispatched_at: string;
  status: string;
};

const statusColor = (s: string) => ({
  dispatched: "bg-blue-50 text-blue-700",
  delivered: "bg-green-50 text-green-700",
  returned: "bg-red-50 text-red-700",
}[s.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function DispatchPage() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ sales_order_id: "", warehouse_id: "1", courier: "", vehicle_number: "", tracking_number: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.warehouse.dispatches();
      setDispatches(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load dispatches.");
    } finally {
      setLoading(false);
    }
  }

  async function createDispatch() {
    if (!form.sales_order_id) return;
    try {
      setSaving(true);
      await api.warehouse.createDispatch({
        sales_order_id: Number(form.sales_order_id),
        warehouse_id: Number(form.warehouse_id),
        courier: form.courier || undefined,
        vehicle_number: form.vehicle_number || undefined,
        tracking_number: form.tracking_number || undefined,
      });
      setShowCreate(false);
      setForm({ sales_order_id: "", warehouse_id: "1", courier: "", vehicle_number: "", tracking_number: "" });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create dispatch.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dispatch</h1>
            <p className="mt-1 text-sm text-gray-500">Outbound shipments and gate passes</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            + New Dispatch
          </button>
        </div>

        {/* Sub-nav */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            { label: "Overview", href: "/warehouse" },
            { label: "Pick Lists", href: "/warehouse/pick-list" },
            { label: "Put-Away", href: "/warehouse/put-away" },
            { label: "Dispatch", href: "/warehouse/dispatch" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${href === "/warehouse/dispatch" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {label}
            </Link>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Dispatches", value: dispatches.length, color: "text-gray-900" },
            { label: "In Transit", value: dispatches.filter(d => d.status === "dispatched").length, color: "text-blue-600" },
            { label: "Delivered", value: dispatches.filter(d => d.status === "delivered").length, color: "text-green-600" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-2xl font-bold ${c.color}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading dispatches...</p>
            </div>
          ) : dispatches.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">🚚</p>
              <p className="text-gray-500 text-sm">No dispatches yet</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Gate Pass", "Sales Order", "Courier", "Tracking", "Dispatched", "Status"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dispatches.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm font-bold text-gray-900">{d.gate_pass_number}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">SO-{d.sales_order_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{d.courier ?? "-"}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{d.tracking_number ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{fmtDate(d.dispatched_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(d.status)}`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create dispatch modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">New Dispatch</h2>
              <div className="space-y-3">
                {[
                  { label: "Sales Order ID *", key: "sales_order_id", type: "number" },
                  { label: "Warehouse ID", key: "warehouse_id", type: "number" },
                  { label: "Courier", key: "courier", type: "text" },
                  { label: "Vehicle Number", key: "vehicle_number", type: "text" },
                  { label: "Tracking Number", key: "tracking_number", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                    <input type={type} value={String(form[key as keyof typeof form])}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={createDispatch} disabled={saving} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Creating..." : "Create Dispatch"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
