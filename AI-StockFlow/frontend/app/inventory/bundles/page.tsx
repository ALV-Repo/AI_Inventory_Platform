"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr } from "../../../lib/api";

type BOM = {
  id: number;
  product_id: number;
  is_active: boolean;
  lines: Array<{ component_product_id: number; quantity: number }>;
};

type Product = { id: number; sku: string; name: string; selling_price: number };

export default function BundlesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [components, setComponents] = useState<Array<{ product_id: string; quantity: string }>>([
    { product_id: "", quantity: "1" },
  ]);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const prods = await api.products();
      setProducts(prods as Product[]);
      // Load BOMs for each product
      const allBoms: BOM[] = [];
      for (const p of (prods as Product[]).slice(0, 20)) {
        try {
          const bom = await api.request<BOM>(`/inventory/bom/${p.id}`);
          if (bom) allBoms.push(bom);
        } catch {}
      }
      setBoms(allBoms);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load bundles.");
    } finally {
      setLoading(false);
    }
  }

  async function createBundle() {
    if (!selectedProduct || components.some(c => !c.product_id || !c.quantity)) return;
    try {
      setSaving(true);
      await api.request("/inventory/bom", {
        method: "POST",
        body: JSON.stringify({
          product_id: Number(selectedProduct),
          lines: components.map(c => ({
            component_product_id: Number(c.product_id),
            quantity: Number(c.quantity),
          })),
        }),
      });
      setShowCreate(false);
      setSelectedProduct("");
      setComponents([{ product_id: "", quantity: "1" }]);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create bundle.");
    } finally {
      setSaving(false);
    }
  }

  const getProduct = (id: number) => products.find(p => p.id === id);

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Product Bundles / BOM</h1>
            <p className="mt-1 text-sm text-gray-500">Manage product bundles and bill of materials</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            + Create Bundle
          </button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading bundles...</p>
          </div>
        ) : boms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 py-16 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm text-gray-500">No bundles created yet</p>
            <button onClick={() => setShowCreate(true)}
              className="mt-4 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700">
              Create First Bundle
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {boms.map(bom => {
              const parent = getProduct(bom.product_id);
              return (
                <div key={bom.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{parent?.name ?? `Product #${bom.product_id}`}</p>
                      <p className="text-xs text-gray-400">SKU: {parent?.sku} · {bom.lines.length} components</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${bom.is_active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {bom.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {bom.lines.map((line, i) => {
                      const comp = getProduct(line.component_product_id);
                      return (
                        <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                          <span className="text-sm text-gray-700">{comp?.name ?? `Product #${line.component_product_id}`}</span>
                          <span className="text-sm font-medium text-gray-900">× {line.quantity}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Create Bundle</h2>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">Parent Product *</label>
                <select value={selectedProduct} onChange={e => setSelectedProduct(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                  <option value="">Select product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="mb-2 block text-sm font-medium text-gray-700">Components</label>
                {components.map((c, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select value={c.product_id} onChange={e => {
                      const updated = [...components];
                      updated[i].product_id = e.target.value;
                      setComponents(updated);
                    }} className="flex-1 rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none focus:border-blue-500">
                      <option value="">Select component...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" min={1} value={c.quantity} onChange={e => {
                      const updated = [...components];
                      updated[i].quantity = e.target.value;
                      setComponents(updated);
                    }} className="w-20 rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none focus:border-blue-500" />
                    {components.length > 1 && (
                      <button onClick={() => setComponents(components.filter((_, j) => j !== i))}
                        className="text-red-500 hover:text-red-700 px-2">✕</button>
                    )}
                  </div>
                ))}
                <button onClick={() => setComponents([...components, { product_id: "", quantity: "1" }])}
                  className="text-sm text-blue-600 hover:underline">+ Add Component</button>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={createBundle} disabled={saving}
                  className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Creating..." : "Create Bundle"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
