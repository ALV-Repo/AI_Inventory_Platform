"use client";

import { useEffect, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr } from "../../../lib/api";

type PipelineItem = {
  id: number;
  customer_id: number;
  title: string;
  stage: string;
  value: number;
  expected_close_date?: string;
  notes?: string;
  created_at: string;
};

const STAGES = ["prospect", "proposal", "negotiation", "closed_won", "closed_lost"];

const stageColor = (s: string) => ({
  prospect: "bg-gray-100 text-gray-700 border-gray-200",
  proposal: "bg-blue-50 text-blue-700 border-blue-200",
  negotiation: "bg-yellow-50 text-yellow-700 border-yellow-200",
  closed_won: "bg-green-50 text-green-700 border-green-200",
  closed_lost: "bg-red-50 text-red-700 border-red-200",
}[s] ?? "bg-gray-100 text-gray-700");

export default function CRMPipelinePage() {
  const [kanban, setKanban] = useState<Record<string, PipelineItem[]>>({});
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.crm.pipeline();
      setKanban(data.kanban);
      setTotalValue(data.total_pipeline_value);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load pipeline.");
    } finally {
      setLoading(false);
    }
  }

  const stageLabel = (s: string) => s.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Pipeline</h1>
            <p className="mt-1 text-sm text-gray-500">Kanban view of all open opportunities</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-sm">
            <p className="text-sm text-gray-500">Total Pipeline Value</p>
            <p className="text-xl font-bold text-blue-600">{inr(totalValue)}</p>
          </div>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="py-16 text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-sm text-gray-500">Loading pipeline...</p>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-4 overflow-x-auto pb-4">
            {STAGES.map(stage => {
              const items = kanban[stage] ?? [];
              const stageValue = items.reduce((a, i) => a + (i.value || 0), 0);
              return (
                <div key={stage} className="min-w-[200px]">
                  <div className={`mb-3 rounded-lg border px-3 py-2 ${stageColor(stage)}`}>
                    <p className="text-xs font-semibold uppercase tracking-wide">{stageLabel(stage)}</p>
                    <p className="text-sm font-bold mt-0.5">{items.length} · {inr(stageValue)}</p>
                  </div>
                  <div className="space-y-2">
                    {items.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-gray-200 p-4 text-center">
                        <p className="text-xs text-gray-400">No items</p>
                      </div>
                    ) : items.map(item => (
                      <div key={item.id} className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        <p className="mt-1 text-xs text-gray-500">Customer #{item.customer_id}</p>
                        <p className="mt-2 text-sm font-bold text-blue-600">{inr(item.value)}</p>
                        {item.expected_close_date && (
                          <p className="mt-1 text-xs text-gray-400">Close: {new Date(item.expected_close_date).toLocaleDateString("en-IN")}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
