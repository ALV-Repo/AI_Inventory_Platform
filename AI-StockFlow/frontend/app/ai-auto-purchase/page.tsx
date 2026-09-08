"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr } from "../../lib/api";

type Recommendation = {
  recommendation_id: number;
  product_id: number;
  sku: string;
  name: string;
  on_hand: number;
  available: number;
  days_of_cover: number;
  suggested_qty: number;
  estimated_cost: number;
  forecast_confidence: number;
  forecast_method: string;
  reasoning: Record<string, unknown>;
  requires_approval: boolean;
};

export default function AIAutoPurchasePage() {
  const [queue, setQueue] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deciding, setDeciding] = useState<number | null>(null);
  const [processed, setProcessed] = useState<Record<number, "accepted" | "rejected">>({});

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.reorderSuggestions();
      setQueue(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load reorder queue.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDecision(rec: Recommendation, decision: "accepted" | "rejected") {
    try {
      setDeciding(rec.recommendation_id);
      const result = await api.decideRecommendation(rec.recommendation_id, decision);
      setProcessed(prev => ({ ...prev, [rec.recommendation_id]: decision }));
      if (decision === "accepted" && (result as Record<string, unknown>).draft_po_id) {
        alert(`✅ Purchase order draft created (PO ID: ${(result as Record<string, unknown>).draft_po_id})`);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Decision failed.");
    } finally {
      setDeciding(null);
    }
  }

  const pending = queue.filter(r => !processed[r.recommendation_id]);
  const totalEstimatedCost = pending.reduce((a, r) => a + r.estimated_cost, 0);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Auto Purchase</h1>
            <p className="mt-1 text-sm text-gray-500">
              AI-suggested reorders — approve to create draft PO, skip to dismiss
            </p>
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {/* NFR-16 notice */}
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 px-5 py-4">
          <p className="text-sm font-semibold text-yellow-800">⚠ Human approval required</p>
          <p className="mt-1 text-xs text-yellow-700">
            All AI purchase suggestions require explicit human approval before any order is placed. No order is ever auto-created (SRS NFR-16).
          </p>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Pending Approval", value: pending.length, color: "text-yellow-600" },
            { label: "Approved", value: Object.values(processed).filter(d => d === "accepted").length, color: "text-green-600" },
            { label: "Total Est. Cost", value: inr(totalEstimatedCost), color: "text-gray-900" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-xl font-bold ${c.color}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading AI reorder queue...</p>
          </div>
        ) : pending.length === 0 ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-16 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="font-semibold text-green-800">All suggestions reviewed</p>
            <p className="text-sm text-green-600 mt-1">No pending reorder recommendations</p>
            <button onClick={load} className="mt-4 rounded-lg border border-green-300 px-6 py-2 text-sm font-medium text-green-700 hover:bg-green-100">
              Refresh
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pending.map(rec => (
              <div key={rec.recommendation_id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-mono font-semibold text-blue-700">{rec.sku}</span>
                      <h3 className="font-semibold text-gray-900">{rec.name}</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm mb-3">
                      <div className="rounded-lg bg-gray-50 p-3 text-center">
                        <p className="text-xs text-gray-400">On Hand</p>
                        <p className="font-bold text-gray-900">{rec.on_hand}</p>
                      </div>
                      <div className="rounded-lg bg-gray-50 p-3 text-center">
                        <p className="text-xs text-gray-400">Days Cover</p>
                        <p className={`font-bold ${rec.days_of_cover <= 7 ? "text-red-600" : "text-gray-900"}`}>{rec.days_of_cover}d</p>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <p className="text-xs text-blue-500">Suggested Qty</p>
                        <p className="font-bold text-blue-700">{rec.suggested_qty}</p>
                      </div>
                      <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <p className="text-xs text-blue-500">Est. Cost</p>
                        <p className="font-bold text-blue-700">{inr(rec.estimated_cost)}</p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400">
                      AI method: <span className="font-medium capitalize text-gray-600">{rec.forecast_method}</span>
                      {" · "}Confidence: <span className={`font-medium ${rec.forecast_confidence >= 0.8 ? "text-green-600" : "text-yellow-600"}`}>
                        {(rec.forecast_confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => handleDecision(rec, "accepted")}
                      disabled={deciding === rec.recommendation_id}
                      className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {deciding === rec.recommendation_id ? "..." : "✓ Approve Order"}
                    </button>
                    <button
                      onClick={() => handleDecision(rec, "rejected")}
                      disabled={deciding === rec.recommendation_id}
                      className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
