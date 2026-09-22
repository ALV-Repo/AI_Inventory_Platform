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

type Decision = "accepted" | "rejected" | null;
type Decisions = Record<number, Decision>;

export default function PriceReviewPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [decisions, setDecisions] = useState<Decisions>({});
  const [deciding, setDeciding] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.reorderSuggestions();
      setRecommendations(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load price recommendations.");
    } finally {
      setLoading(false);
    }
  }

  async function decide(rec: Recommendation, decision: "accepted" | "rejected") {
    try {
      setDeciding(rec.recommendation_id);
      await api.decideRecommendation(rec.recommendation_id, decision);
      setDecisions(prev => ({ ...prev, [rec.recommendation_id]: decision }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Decision failed.");
    } finally {
      setDeciding(null);
    }
  }

  const pending = recommendations.filter(r => !decisions[r.recommendation_id]);
  const accepted = recommendations.filter(r => decisions[r.recommendation_id] === "accepted");
  const rejected = recommendations.filter(r => decisions[r.recommendation_id] === "rejected");

  const confidenceColor = (c: number) =>
    c >= 0.8 ? "text-green-600" : c >= 0.6 ? "text-yellow-600" : "text-red-600";

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Reorder Recommendations</h1>
            <p className="mt-1 text-sm text-gray-500">
              AI-suggested purchase quantities — every action requires human approval (NFR-16)
            </p>
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Pending Review", value: pending.length, color: "text-yellow-600" },
            { label: "Accepted", value: accepted.length, color: "text-green-600" },
            { label: "Rejected", value: rejected.length, color: "text-red-600" },
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
            <p className="text-sm text-gray-500">Loading AI recommendations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-16 text-center">
            <p className="text-4xl mb-3">✅</p>
            <p className="text-gray-600 font-medium">No reorder recommendations at this time</p>
            <p className="text-gray-400 text-sm mt-1">All products are above reorder levels</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map(rec => {
              const decision = decisions[rec.recommendation_id];
              return (
                <div key={rec.recommendation_id}
                  className={`rounded-xl border bg-white p-5 shadow-sm transition ${decision === "accepted" ? "border-green-200 bg-green-50" : decision === "rejected" ? "border-red-100 opacity-60" : "border-gray-200"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-mono text-sm text-gray-500">{rec.sku}</span>
                        <h3 className="font-semibold text-gray-900">{rec.name}</h3>
                        {decision && (
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${decision === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {decision}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:grid-cols-4">
                        <div><span className="text-gray-400">On Hand</span> <span className="font-medium text-gray-900 ml-1">{rec.on_hand}</span></div>
                        <div><span className="text-gray-400">Days Cover</span> <span className="font-medium text-gray-900 ml-1">{rec.days_of_cover}d</span></div>
                        <div><span className="text-gray-400">Suggested Qty</span> <span className="font-bold text-blue-600 ml-1">{rec.suggested_qty}</span></div>
                        <div><span className="text-gray-400">Est. Cost</span> <span className="font-bold text-gray-900 ml-1">{inr(rec.estimated_cost)}</span></div>
                      </div>
                      <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                        <span>Method: <span className="font-medium capitalize">{rec.forecast_method}</span></span>
                        <span className={`font-medium ${confidenceColor(rec.forecast_confidence)}`}>
                          Confidence: {(rec.forecast_confidence * 100).toFixed(0)}%
                        </span>
                        {rec.requires_approval && (
                          <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-yellow-700 font-medium">Requires approval</span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    {!decision && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => decide(rec, "accepted")}
                          disabled={deciding === rec.recommendation_id}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          {deciding === rec.recommendation_id ? "..." : "✓ Accept"}
                        </button>
                        <button
                          onClick={() => decide(rec, "rejected")}
                          disabled={deciding === rec.recommendation_id}
                          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-400">
          AI recommendations are suggestions only. All purchase actions require human approval per SRS NFR-16.
        </p>
      </div>
    </PageLayout>
  );
}
