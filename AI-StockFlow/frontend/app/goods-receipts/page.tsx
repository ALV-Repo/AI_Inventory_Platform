"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr, fmtDate } from "../../lib/api";

type PO = {
  id: number;
  po_number: string;
  supplier_id: number;
  status: string;
  total: number;
  lines: Array<{
    id: number;
    product_id: number;
    quantity: number;
    received_qty: number;
    unit_price: number;
  }>;
};

export default function GoodsReceiptsPage() {
  const [orders, setOrders] = useState<PO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receiving, setReceiving] = useState<number | null>(null);
  const [success, setSuccess] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.purchaseOrders.list();
      // Show only approved/partial POs that need receiving
      setOrders((data as PO[]).filter(po =>
        po.status === "approved" || po.status === "partial"
      ));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load purchase orders.");
    } finally {
      setLoading(false);
    }
  }

  async function receiveOrder(po: PO) {
    try {
      setReceiving(po.id);
      // Build receive payload — receive all remaining quantities
      const lines = (po.lines ?? []).map(l => ({
        po_line_id: l.id,
        received_qty: l.quantity - (l.received_qty || 0),
      })).filter(l => l.received_qty > 0);

      await api.request(`/purchases/orders/${po.id}/receive`, {
        method: "POST",
        body: JSON.stringify({ lines }),
      });
      setSuccess(`PO ${po.po_number} received successfully.`);
      setTimeout(() => setSuccess(""), 3000);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to receive order.");
    } finally {
      setReceiving(null);
    }
  }

  const pendingOrders = orders.filter(o => o.status === "approved");
  const partialOrders = orders.filter(o => o.status === "partial");

  return (
    <PageLayout>
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Goods Receipts</h1>
            <p className="mt-1 text-sm text-gray-500">Receive stock against approved purchase orders</p>
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{success}</div>}

        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Pending Receipt", value: pendingOrders.length, color: "text-yellow-600" },
            { label: "Partially Received", value: partialOrders.length, color: "text-orange-600" },
            { label: "Total Value Pending", value: inr(orders.reduce((a, o) => a + (o.total || 0), 0)), color: "text-blue-600" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-2xl font-bold ${c.color}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading purchase orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white py-16 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-sm text-gray-500">No pending goods receipts</p>
            <p className="text-xs text-gray-400 mt-1">All approved purchase orders have been received</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(po => (
              <div key={po.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-blue-600">{po.po_number}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${po.status === "partial" ? "bg-orange-50 text-orange-700" : "bg-yellow-50 text-yellow-700"}`}>
                      {po.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900">{inr(po.total)}</span>
                    <button onClick={() => receiveOrder(po)}
                      disabled={receiving === po.id}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
                      {receiving === po.id ? "Receiving..." : "✓ Receive All"}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Supplier #{po.supplier_id} · {(po.lines ?? []).length} line items</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
