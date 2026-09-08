"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../components/layout/PageLayout";
import { api, fmtDate, type PickListSummary, type DispatchRecord } from "../../lib/api";

export default function WarehousePage() {
  const [pickLists, setPickLists] = useState<PickListSummary[]>([]);
  const [dispatches, setDispatches] = useState<DispatchRecord[]>([]);
  const [bins, setBins] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"bins" | "picklist" | "dispatch">("picklist");

  useEffect(() => { load(); }, [activeTab]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      if (activeTab === "picklist") {
        const data = await api.warehouse.pickLists();
        setPickLists(data);
      } else if (activeTab === "dispatch") {
        const data = await api.warehouse.dispatches();
        setDispatches(data);
      } else {
        const data = await api.warehouse.bins();
        setBins(data.bins as unknown[]);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load warehouse data.");
    } finally {
      setLoading(false);
    }
  }

  const pickStatusColor = (s: string) =>
    s === "completed" ? "bg-green-50 text-green-700" :
    s === "in_progress" ? "bg-yellow-50 text-yellow-700" :
    "bg-gray-100 text-gray-700";

  const dispatchStatusColor = (s: string) =>
    s === "delivered" ? "bg-green-50 text-green-700" :
    s === "dispatched" ? "bg-blue-50 text-blue-700" :
    "bg-red-50 text-red-700";

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Warehouse Management</h1>
          <p className="mt-1 text-sm text-gray-500">Bins, pick lists, put-away and dispatch</p>
        </div>

        {/* Sub-nav */}
        <div className="mb-6 flex gap-2">
          {[
            { label: "Pick Lists", href: "/warehouse/pick-list" },
            { label: "Put-Away", href: "/warehouse/put-away" },
            { label: "Dispatch", href: "/warehouse/dispatch" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {label}
            </Link>
          ))}
        </div>

        {/* Tab bar */}
        <div className="mb-5 flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1 w-fit">
          {(["picklist", "dispatch", "bins"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${activeTab === tab ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              {tab === "picklist" ? "Pick Lists" : tab === "dispatch" ? "Dispatches" : "Bin Locations"}
            </button>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading...</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* Pick lists tab */}
            {activeTab === "picklist" && (
              <>
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Pick Lists ({pickLists.length})</h2>
                  <button onClick={load} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
                </div>
                {pickLists.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-4xl mb-3">📦</p>
                    <p className="text-gray-500 text-sm">No pick lists yet. They are created from sales orders.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        {["ID", "Sales Order", "Lines", "Assigned To", "Status", "Created", "Completed"].map(h => (
                          <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pickLists.map(pl => (
                        <tr key={pl.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-sm text-gray-600">#{pl.id}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">SO-{pl.sales_order_id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{pl.line_count} items</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{pl.assigned_to ?? "-"}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${pickStatusColor(pl.status)}`}>
                              {pl.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{fmtDate(pl.created_at)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{pl.completed_at ? fmtDate(pl.completed_at) : "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            {/* Dispatch tab */}
            {activeTab === "dispatch" && (
              <>
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Dispatches ({dispatches.length})</h2>
                  <button onClick={load} className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
                </div>
                {dispatches.length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-4xl mb-3">🚚</p>
                    <p className="text-gray-500 text-sm">No dispatches yet.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        {["Gate Pass", "Sales Order", "Courier", "Tracking", "Dispatched At", "Status"].map(h => (
                          <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {dispatches.map(d => (
                        <tr key={d.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-sm font-semibold text-gray-900">{d.gate_pass_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">SO-{d.sales_order_id}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{d.courier ?? "-"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{d.tracking_number ?? "-"}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{fmtDate(d.dispatched_at)}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${dispatchStatusColor(d.status)}`}>
                              {d.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}

            {/* Bins tab */}
            {activeTab === "bins" && (
              <>
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Bin Locations ({(bins as unknown[]).length})</h2>
                </div>
                {(bins as unknown[]).length === 0 ? (
                  <div className="py-16 text-center">
                    <p className="text-4xl mb-3">🗄️</p>
                    <p className="text-gray-500 text-sm">No bins configured yet.</p>
                    <p className="text-gray-400 text-xs mt-1">Use the API to create zones → racks → bins.</p>
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        {["Zone", "Rack", "Bin Code", "Capacity", "Active"].map(h => (
                          <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(bins as Array<Record<string, unknown>>).map((b, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{String(b.zone)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{String(b.rack)}</td>
                          <td className="px-6 py-4 font-mono text-sm text-gray-900">{String(b.bin_code)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600">{Number(b.capacity)} units</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${b.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                              {b.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
