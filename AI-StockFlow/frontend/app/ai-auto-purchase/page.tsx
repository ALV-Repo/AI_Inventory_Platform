"use client";

import { useEffect, useState } from "react";
import useDashboard from "@/hooks/useDashboard";
import ReorderQueue, {
  ReorderItem,
} from "@/components/dashboard/ReorderQueue";

export default function AIAutoPurchasePage() {
  const {
    reorderSuggestions,
    loading,
    error,
    refresh,
  } = useDashboard();

  const [queue, setQueue] = useState<ReorderItem[]>([]);
  const [processedIds, setProcessedIds] = useState<
    Set<string | number>
  >(new Set());

  useEffect(() => {
    setQueue(
      reorderSuggestions.filter((item, index) => {
        const id =
          item.id ??
          item.product_id ??
          item.sku ??
          index;

        return !processedIds.has(id);
      })
    );
  }, [reorderSuggestions, processedIds]);

  const getItemId = (
    item: ReorderItem,
    index: number
  ) =>
    item.id ??
    item.product_id ??
    item.sku ??
    index;

  async function handleDecision(
    item: ReorderItem,
    decision: "approve" | "skip"
  ) {
    const index = queue.indexOf(item);
    const id = getItemId(item, index);

    // Immediately remove the item from the visible queue.
    setProcessedIds((previous) => {
      const next = new Set(previous);
      next.add(id);
      return next;
    });

    // Refresh dashboard data after the decision.
    // Backend decision persistence is not available yet.
    await refresh();

    console.log(
      `${decision === "approve" ? "Approved" : "Skipped"} reorder item:`,
      item
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#12213a]">
              AI Auto Purchase
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Review AI-generated reorder recommendations and decide which
              products need replenishment.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setProcessedIds(new Set());
              refresh();
            }}
            disabled={loading}
            className="rounded-lg bg-[#12213a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1d3055] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              Unable to load reorder recommendations.
            </p>

            <p className="mt-1 text-xs text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => refresh()}
              className="mt-3 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">
              Reorder Suggestions
            </p>

            <p className="mt-2 text-2xl font-bold text-[#12213a]">
              {queue.length}
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              Products requiring review
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">
              AI Recommendation
            </p>

            <p className="mt-2 text-sm font-bold text-orange-600">
              Review Queue
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              Approve or skip each suggestion
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium text-gray-500">
              Purchase Control
            </p>

            <p className="mt-2 text-sm font-bold text-green-600">
              Manual Approval
            </p>

            <p className="mt-1 text-[10px] text-gray-400">
              Orders require user confirmation
            </p>
          </div>

        </div>

        {/* Reorder Queue */}
        <ReorderQueue
          items={queue}
          onDecision={async (item, decision) => {
            await handleDecision(item, decision);
          }}
        />

      </div>
    </main>
  );
}