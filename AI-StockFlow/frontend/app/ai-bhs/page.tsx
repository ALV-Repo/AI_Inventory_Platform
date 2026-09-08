"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";
import { api } from "../../lib/api";

type HealthScore = {
  overall_score: number;
  grade: string;
  components: Record<string, number>;
  weakest_area: string;
  recommendation: string;
};

const gradeColor = (g: string) => ({
  A: { bg: "bg-green-50", text: "text-green-700", ring: "stroke-green-500" },
  B: { bg: "bg-blue-50", text: "text-blue-700", ring: "stroke-blue-500" },
  C: { bg: "bg-yellow-50", text: "text-yellow-700", ring: "stroke-yellow-500" },
  D: { bg: "bg-red-50", text: "text-red-700", ring: "stroke-red-500" },
}[g] ?? { bg: "bg-gray-50", text: "text-gray-700", ring: "stroke-gray-400" });

const componentLabel = (key: string) => ({
  inventory_health: "Inventory Health",
  sales_health: "Sales Health",
  cash_flow: "Cash Flow",
  supplier_score: "Supplier Score",
  customer_growth: "Customer Growth",
}[key] ?? key.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase()));

export default function BusinessHealthPage() {
  const [score, setScore] = useState<HealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.healthScore();
      setScore(data as HealthScore);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load health score.");
    } finally {
      setLoading(false);
    }
  }

  const colors = score ? gradeColor(score.grade) : gradeColor("C");

  // SVG ring parameters
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const progress = score ? (score.overall_score / 100) * circumference : 0;

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Business Health Score</h1>
            <p className="mt-1 text-sm text-gray-500">AI-computed composite score across 5 business dimensions</p>
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Computing business health score...</p>
          </div>
        ) : score && (
          <div className="space-y-6">
            {/* Main score card */}
            <div className={`rounded-2xl border p-8 ${colors.bg}`}>
              <div className="flex flex-col items-center sm:flex-row sm:items-center sm:gap-12">
                {/* SVG Ring */}
                <div className="relative flex items-center justify-center mb-6 sm:mb-0">
                  <svg width="200" height="200" className="-rotate-90">
                    <circle cx="100" cy="100" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="16" />
                    <circle
                      cx="100" cy="100" r={radius}
                      fill="none"
                      className={colors.ring}
                      strokeWidth="16"
                      strokeDasharray={`${progress} ${circumference}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className={`text-5xl font-bold ${colors.text}`}>{score.overall_score}</p>
                    <p className={`text-2xl font-bold ${colors.text}`}>Grade {score.grade}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1">
                  <h2 className={`text-2xl font-bold mb-2 ${colors.text}`}>
                    {score.grade === "A" ? "Excellent" : score.grade === "B" ? "Good" : score.grade === "C" ? "Needs Attention" : "Critical"}
                  </h2>
                  <div className={`rounded-lg border p-4 mb-4 ${colors.bg}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">AI Recommendation</p>
                    <p className={`text-sm font-medium ${colors.text}`}>{score.recommendation}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                      Weakest: {componentLabel(score.weakest_area)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Component breakdown */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-lg font-semibold text-gray-900">Score Breakdown</h2>
              <div className="space-y-4">
                {Object.entries(score.components).map(([key, value]) => {
                  const pct = Math.min(Math.round(value), 100);
                  const isWeakest = key === score.weakest_area;
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">{componentLabel(key)}</span>
                          {isWeakest && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs text-orange-600">Weakest</span>}
                        </div>
                        <span className={`text-sm font-bold ${pct >= 70 ? "text-green-600" : pct >= 40 ? "text-yellow-600" : "text-red-600"}`}>
                          {pct}/100
                        </span>
                      </div>
                      <div className="h-3 w-full rounded-full bg-gray-100">
                        <div
                          className={`h-3 rounded-full transition-all ${pct >= 70 ? "bg-green-500" : pct >= 40 ? "bg-yellow-500" : "bg-red-500"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-xs text-gray-400">
              Health score is computed by AI from inventory, sales, finance and supplier data. Refresh daily for accurate readings.
            </p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
