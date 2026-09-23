"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr } from "../../lib/api";

type Product = {
  id: number; sku: string; name: string; category: string | null;
  brand: string | null; uom: string; gst_rate: number;
  cost_price: number; selling_price: number; reorder_level: number;
  safety_stock: number; on_hand: number; reserved: number; available: number;
};

type StockStatus = "Healthy" | "Low Stock" | "Out of Stock";

function getStatus(p: Product): StockStatus {
  if (p.on_hand <= 0) return "Out of Stock";
  if (p.available <= p.reorder_level) return "Low Stock";
  return "Healthy";
}

const statusStyle = (s: StockStatus) => ({
  "Healthy":      "bg-green-50 text-green-700",
  "Low Stock":    "bg-orange-50 text-orange-700",
  "Out of Stock": "bg-red-50 text-red-700",
}[s]);

const STOCK_FILTERS = ["All", "Healthy", "Low Stock", "Out of Stock"] as const;

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [adjustReason, setAdjustReason] = useState("manual_adjustment");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [newProduct, setNewProduct] = useState({
    name: "", sku: "", category: "", brand: "",
    selling_price: "", cost_price: "", gst_rate: "18",
    reorder_level: "10", safety_stock: "5", uom: "pcs",
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true); setError(null);
      const data = await api.products({});
      setProducts(data as Product[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load inventory.");
    } finally { setLoading(false); }
  }

  async function handleAdjust() {
    if (!selectedProduct || !adjustQty) return;
    try {
      setSaving(true);
      await api.adjustStock({ product_id: selectedProduct.id, warehouse_id: 1, quantity: Number(adjustQty), reason_code: adjustReason });
      setShowAdjust(false); setAdjustQty(""); setSelectedProduct(null);
      setSuccess("Stock adjusted."); setTimeout(() => setSuccess(""), 3000);
      await load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Adjustment failed."); }
    finally { setSaving(false); }
  }

  async function handleAddProduct() {
    if (!newProduct.name.trim() || !newProduct.sku.trim()) { alert("Name and SKU are required."); return; }
    try {
      setSaving(true);
      await api.request("/inventory/products", { method: "POST", body: JSON.stringify({
        name: newProduct.name, sku: newProduct.sku, category: newProduct.category || null,
        brand: newProduct.brand || null, selling_price: Number(newProduct.selling_price) || 0,
        cost_price: Number(newProduct.cost_price) || 0, gst_rate: Number(newProduct.gst_rate) || 18,
        reorder_level: Number(newProduct.reorder_level) || 10, safety_stock: Number(newProduct.safety_stock) || 5, uom: newProduct.uom || "pcs",
      })});
      setShowAdd(false);
      setNewProduct({ name: "", sku: "", category: "", brand: "", selling_price: "", cost_price: "", gst_rate: "18", reorder_level: "10", safety_stock: "5", uom: "pcs" });
      setSuccess("Product added."); setTimeout(() => setSuccess(""), 3000);
      await load();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Failed to add product."); }
    finally { setSaving(false); }
  }

  const filtered = useMemo(() => products.filter(p => {
    const ms = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" || getStatus(p) === statusFilter;
    return ms && mf;
  }), [products, search, statusFilter]);

  const totalValue = products.reduce((a, p) => a + p.on_hand * p.cost_price, 0);
  const lowCount = products.filter(p => getStatus(p) === "Low Stock").length;
  const outCount = products.filter(p => getStatus(p) === "Out of Stock").length;

  if (loading) return (
    <PageLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm text-gray-500">Loading inventory...</p>
        </div>
      </div>
    </PageLayout>
  );

  if (error && products.length === 0) return (
    <PageLayout>
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <p className="font-semibold text-red-800">{error}</p>
          <button onClick={load} className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-xs font-semibold text-white">Retry</button>
        </div>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f8fafc] px-6 py-7">
        <div className="mx-auto max-w-7xl">

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
              <p className="mt-1 text-sm text-gray-500">{products.length} products · {inr(totalValue)} stock value</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="rounded-lg bg-[#12213a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1d3055]">
              + Add Product
            </button>
          </div>

          {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{success}</div>}

          <div className="mb-6 grid grid-cols-4 gap-4">
            {[
              { label: "Total SKUs", value: products.length, color: "text-gray-900" },
              { label: "Stock Value", value: inr(totalValue), color: "text-blue-600" },
              { label: "Low Stock", value: lowCount, color: lowCount > 0 ? "text-orange-600" : "text-gray-900" },
              { label: "Out of Stock", value: outCount, color: outCount > 0 ? "text-red-600" : "text-gray-900" },
            ].map(c => (
              <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">{c.label}</p>
                <p className={`mt-2 text-2xl font-bold ${c.color}`}>{c.value}</p>
              </div>
            ))}
          </div>

          <div className="mb-5 flex gap-3">
            <input type="text" placeholder="Search by name, SKU or category..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none">
              {STOCK_FILTERS.map(f => <option key={f}>{f}</option>)}
            </select>
            <button onClick={load} className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["SKU", "Product", "Category", "On Hand", "Available", "Selling Price", "Cost", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="py-16 text-center text-sm text-gray-400">No products match your filters.</td></tr>
                ) : filtered.map(p => {
                  const status = getStatus(p);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.sku}</td>
                      <td className="px-4 py-3">
                        <Link href={`/inventory/${p.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">{p.name}</Link>
                        {p.brand && <p className="text-xs text-gray-400">{p.brand}</p>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.category ?? "-"}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">{p.on_hand} {p.uom}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{p.available} {p.uom}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{inr(p.selling_price)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{inr(p.cost_price)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyle(status)}`}>{status}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedProduct(p); setShowAdjust(true); }}
                            className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700">Adjust</button>
                          <Link href={`/inventory/${p.id}`} className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-600 hover:bg-gray-50">View</Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
                Showing {filtered.length} of {products.length} products
              </div>
            )}
          </div>
        </div>

        {showAdjust && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowAdjust(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="mb-1 text-xl font-bold text-gray-900">Stock Adjustment</h2>
              <p className="mb-4 text-sm text-gray-500">{selectedProduct.name} · On hand: {selectedProduct.on_hand}</p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Quantity (+ to add, - to remove)</label>
                  <input type="number" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} placeholder="e.g. 10 or -5"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Reason</label>
                  <select value={adjustReason} onChange={e => setAdjustReason(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                    <option value="manual_adjustment">Manual Adjustment</option>
                    <option value="damage">Damage / Write-off</option>
                    <option value="theft">Theft / Loss</option>
                    <option value="cycle_count_variance">Cycle Count Variance</option>
                    <option value="return">Customer Return</option>
                    <option value="opening_stock">Opening Stock</option>
                  </select>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowAdjust(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleAdjust} disabled={saving || !adjustQty} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Apply"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowAdd(false)}>
            <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Add Product</h2>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["Product Name *", "name", "text"],
                  ["SKU *", "sku", "text"],
                  ["Category", "category", "text"],
                  ["Brand", "brand", "text"],
                  ["Selling Price (₹)", "selling_price", "number"],
                  ["Cost Price (₹)", "cost_price", "number"],
                  ["GST Rate (%)", "gst_rate", "number"],
                  ["Reorder Level", "reorder_level", "number"],
                  ["Safety Stock", "safety_stock", "number"],
                  ["Unit of Measure", "uom", "text"],
                ] as [string, string, string][]).map(([label, key, type]) => (
                  <div key={key}>
                    <label className="mb-1 block text-xs font-medium text-gray-700">{label}</label>
                    <input type={type} value={newProduct[key as keyof typeof newProduct]}
                      onChange={e => setNewProduct(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowAdd(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleAddProduct} disabled={saving} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Add Product"}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </PageLayout>
  );
}
