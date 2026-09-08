"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr, type Supplier } from "../../lib/api";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [scorecard, setScorecard] = useState<Record<string, unknown> | null>(null);
  const [ledger, setLedger] = useState<Record<string, unknown> | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", gstin: "", payment_terms_days: 30, lead_time_days: 7 });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.suppliers.list();
      setSuppliers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load suppliers.");
    } finally {
      setLoading(false);
    }
  }

  async function openSupplier(s: Supplier) {
    setSelected(s);
    setScorecard(null);
    setLedger(null);
    try {
      const [sc, ld] = await Promise.all([
        api.suppliers.scorecard(s.id),
        api.suppliers.ledger(s.id),
      ]);
      setScorecard(sc as Record<string, unknown>);
      setLedger(ld as Record<string, unknown>);
    } catch {}
  }

  async function handleCreate() {
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      await api.suppliers.create(form);
      setShowCreate(false);
      setForm({ name: "", phone: "", email: "", gstin: "", payment_terms_days: 30, lead_time_days: 7 });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create supplier.");
    } finally {
      setSaving(false);
    }
  }

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const gradeColor = (g: string) =>
    g === "A" ? "text-green-700 bg-green-50" :
    g === "B" ? "text-blue-700 bg-blue-50" :
    g === "C" ? "text-yellow-700 bg-yellow-50" : "text-red-700 bg-red-50";

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
            <p className="mt-1 text-sm text-gray-500">Manage suppliers, scorecards and ledgers</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
          >
            + Add Supplier
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Search */}
        <div className="mb-5 flex gap-3">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Suppliers", value: suppliers.length, color: "text-gray-900" },
            { label: "Active", value: suppliers.filter(s => s.is_active).length, color: "text-green-600" },
            { label: "Avg Lead Time", value: suppliers.length ? `${Math.round(suppliers.reduce((a, s) => a + s.lead_time_days, 0) / suppliers.length)} days` : "-", color: "text-blue-600" },
          ].map((c) => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-2xl font-bold ${c.color}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">Supplier List</h2>
          </div>
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading suppliers...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Name", "Contact", "GSTIN", "Payment Terms", "Lead Time", "On-time Rate", "Action"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button onClick={() => openSupplier(s)} className="font-semibold text-blue-600 hover:text-blue-800">{s.name}</button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.phone ?? s.email ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.gstin ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.payment_terms_days} days</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{s.lead_time_days} days</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{(s.on_time_rate * 100).toFixed(0)}%</td>
                    <td className="px-6 py-4">
                      <button onClick={() => openSupplier(s)} className="text-sm font-medium text-blue-600 hover:text-blue-800">View</button>
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
            <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selected.name}</h2>
                  <p className="text-sm text-gray-500">{selected.gstin ?? "No GSTIN"}</p>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-100">✕</button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                {[
                  ["Phone", selected.phone ?? "-"],
                  ["Email", selected.email ?? "-"],
                  ["Payment Terms", `${selected.payment_terms_days} days`],
                  ["Lead Time", `${selected.lead_time_days} days`],
                  ["On-time Rate", `${(selected.on_time_rate * 100).toFixed(0)}%`],
                  ["Status", selected.is_active ? "Active" : "Inactive"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between border-b pb-2">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>

              {/* Scorecard */}
              {scorecard && (
                <div className="mb-4 rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">Vendor Scorecard</h3>
                  <div className="flex items-center gap-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full text-2xl font-bold ${gradeColor(scorecard.grade as string)}`}>
                      {scorecard.grade as string}
                    </div>
                    <div className="grid grid-cols-3 gap-6 text-sm">
                      <div><p className="text-gray-500">Score</p><p className="font-bold text-gray-900">{scorecard.scorecard_score as number}/100</p></div>
                      <div><p className="text-gray-500">Fill Rate</p><p className="font-bold text-gray-900">{((scorecard.fill_rate as number) * 100).toFixed(0)}%</p></div>
                      <div><p className="text-gray-500">Orders</p><p className="font-bold text-gray-900">{scorecard.total_orders as number}</p></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Ledger summary */}
              {ledger && (
                <div className="rounded-lg border border-gray-200 p-4">
                  <h3 className="mb-3 font-semibold text-gray-900">Ledger Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Total Purchases</span>
                      <span className="font-bold text-gray-900">{inr(ledger.total_purchases as number)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Outstanding</span>
                      <span className="font-bold text-orange-600">{inr(ledger.outstanding_balance as number)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Add Supplier</h2>
              <div className="space-y-3">
                {[
                  { label: "Name *", key: "name", type: "text" },
                  { label: "Phone", key: "phone", type: "tel" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "GSTIN", key: "gstin", type: "text" },
                  { label: "Payment Terms (days)", key: "payment_terms_days", type: "number" },
                  { label: "Lead Time (days)", key: "lead_time_days", type: "number" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                    <input
                      type={type}
                      value={String(form[key as keyof typeof form])}
                      onChange={(e) => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={saving} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Add Supplier"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
