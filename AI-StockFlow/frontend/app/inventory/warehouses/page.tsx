"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";
import { api } from "../../../lib/api";

type Warehouse = {
  id: number;
  code: string;
  name: string;
  address?: string;
  is_active: boolean;
};

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", address: "" });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.request<Warehouse[]>("/inventory/warehouses");
      setWarehouses(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load warehouses.");
    } finally {
      setLoading(false);
    }
  }

  async function createWarehouse() {
    if (!form.code || !form.name) return;
    try {
      setSaving(true);
      await api.request("/inventory/warehouses", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowCreate(false);
      setForm({ code: "", name: "", address: "" });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create warehouse.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
            <p className="mt-1 text-sm text-gray-500">Manage warehouse locations</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            + Add Warehouse
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Warehouses</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{loading ? "..." : warehouses.length}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active</p>
            <p className="mt-2 text-2xl font-bold text-green-600">{loading ? "..." : warehouses.filter(w => w.is_active).length}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading warehouses...</p>
            </div>
          ) : warehouses.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">🏭</p>
              <p className="text-sm text-gray-500">No warehouses yet</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Code", "Name", "Address", "Status"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {warehouses.map(w => (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm font-bold text-blue-600">{w.code}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{w.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{w.address ?? "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${w.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {w.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Add Warehouse</h2>
              <div className="space-y-3">
                {[
                  { label: "Code *", key: "code", placeholder: "e.g. WH-HYD-01" },
                  { label: "Name *", key: "name", placeholder: "e.g. Hyderabad Central" },
                  { label: "Address", key: "address", placeholder: "Full address" },
                ].map(({ label, key, placeholder }) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                    <input type="text" placeholder={placeholder}
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={createWarehouse} disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Add Warehouse"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
