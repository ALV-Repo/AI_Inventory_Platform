"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr } from "../../../lib/api";

type Product = {
  id: number;
  sku: string;
  name: string;
  category?: string;
  selling_price: number;
  barcode?: string;
};

type ScanRecord = {
  id: number;
  sku: string;
  name: string;
  action: string;
  quantity: number;
  timestamp: string;
};

export default function BarcodeScannerPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [scanned, setScanned] = useState<Product | null>(null);
  const [scanInput, setScanInput] = useState("");
  const [action, setAction] = useState<"Stock In" | "Stock Out">("Stock In");
  const [quantity, setQuantity] = useState(1);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    try {
      const data = await api.products();
      setProducts(data as Product[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load products.");
    }
  }

  function handleScan() {
    if (!scanInput.trim()) return;
    setError("");
    const found = products.find(p =>
      p.sku.toLowerCase() === scanInput.toLowerCase() ||
      p.barcode?.toLowerCase() === scanInput.toLowerCase()
    );
    if (found) {
      setScanned(found);
    } else {
      setError(`No product found for: ${scanInput}`);
      setScanned(null);
    }
  }

  async function applyAction() {
    if (!scanned) return;
    try {
      setLoading(true);
      setError("");
      const qty = action === "Stock In" ? quantity : -quantity;
      await api.adjustStock({
        product_id: scanned.id,
        warehouse_id: 1,
        quantity: qty,
        reason_code: action === "Stock In" ? "barcode_stock_in" : "barcode_stock_out",
      });
      setScanHistory(prev => [{
        id: Date.now(),
        sku: scanned.sku,
        name: scanned.name,
        action,
        quantity,
        timestamp: new Date().toLocaleString("en-IN"),
      }, ...prev.slice(0, 19)]);
      setSuccess(`${action} of ${quantity} units of ${scanned.name} applied.`);
      setScanned(null);
      setScanInput("");
      setQuantity(1);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to apply action.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Barcode Scanner</h1>
          <p className="mt-1 text-sm text-gray-500">Scan product barcodes or enter SKU to update stock</p>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{success}</div>}

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Scanner */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Scan / Enter SKU</h2>
            <div className="flex gap-2 mb-4">
              <input type="text" value={scanInput} onChange={e => setScanInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleScan()}
                placeholder="Scan barcode or type SKU..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
              <button onClick={handleScan} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                Search
              </button>
            </div>

            {scanned && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
                <p className="font-semibold text-green-800">{scanned.name}</p>
                <p className="text-xs text-green-600 mt-1">SKU: {scanned.sku} · {inr(scanned.selling_price)}</p>
              </div>
            )}

            {scanned && (
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Action</label>
                  <div className="flex gap-2">
                    {(["Stock In", "Stock Out"] as const).map(a => (
                      <button key={a} onClick={() => setAction(a)}
                        className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${action === a ? (a === "Stock In" ? "bg-green-600 text-white" : "bg-red-600 text-white") : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
                  <input type="number" min={1} value={quantity} onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <button onClick={applyAction} disabled={loading}
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {loading ? "Applying..." : `Apply ${action}`}
                </button>
              </div>
            )}
          </div>

          {/* Scan History */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Scan History</h2>
            {scanHistory.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">No scans yet in this session</div>
            ) : (
              <div className="space-y-2">
                {scanHistory.map(r => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.name}</p>
                      <p className="text-xs text-gray-400">{r.sku} · {r.timestamp}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-semibold ${r.action === "Stock In" ? "text-green-600" : "text-red-600"}`}>
                        {r.action === "Stock In" ? "+" : "-"}{r.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
