"use client";
import { useState } from "react";
import { inr, type ReorderSuggestion } from "@/lib/api";

/**
 * AI reorder proposals. Nothing here is committed without a human pressing
 * Approve (FR-AI-PUR-02, NFR-16), and every card shows its working (FR-AI-PUR-03).
 */
export function ReorderQueue({
  items, onDecision,
}: {
  items: ReorderSuggestion[];
  onDecision: (recommendationId: number, decision: "accepted" | "rejected") => Promise<unknown>;
}) {
  const [settled, setSettled] = useState<Record<number, "accepted" | "rejected">>({});

  async function decide(item: ReorderSuggestion, decision: "accepted" | "rejected") {
    setSettled((s) => ({ ...s, [item.recommendation_id]: decision }));
    try {
      await onDecision(item.recommendation_id, decision);
    } catch {
      // Server rejected it — put the card back so the user can retry.
      setSettled((s) => {
        const next = { ...s };
        delete next[item.recommendation_id];
        return next;
      });
    }
  }

  return (
    <div className="flex flex-col rounded-lg border border-line bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-line px-4.5 py-3.5">
        <div>
          <h2 className="font-display text-sm font-semibold">Reorder queue</h2>
          <p className="mt-0.5 text-xs text-ink-soft">Approve to raise a purchase order</p>
        </div>
        <span className="rounded border border-dashed border-ai bg-[#F2F5FC] px-1.5 py-0.5
                         text-[10px] font-bold uppercase tracking-wider text-ai">
          AI drafted
        </span>
      </div>

      <div className="max-h-[430px] overflow-y-auto">
        {items.length === 0 && (
          <p className="p-6 text-center text-sm text-ink-soft">
            Nothing needs reordering. Every item is above its reorder point.
          </p>
        )}

        {items.map((item) => {
          const decision = settled[item.recommendation_id];
          if (decision) {
            return (
              <div key={item.recommendation_id} className="border-b border-line px-4.5 py-3.5 text-sm">
                <span className={`font-semibold ${decision === "accepted" ? "text-good" : "text-ink-soft"}`}>
                  {decision === "accepted" ? "Purchase order drafted" : "Skipped"}
                </span>
                <span className="ml-2 text-xs text-ink-soft">
                  {decision === "accepted" ? "Awaiting approval" : "Will reappear tomorrow"}
                </span>
              </div>
            );
          }

          const urgent = item.days_of_cover >= 0 && item.days_of_cover < 5;
          const r = item.reasoning as Record<string, number | string>;

          return (
            <div key={item.recommendation_id} className="border-b border-line px-4.5 py-3.5 last:border-0">
              <div className="flex items-baseline justify-between gap-2.5">
                <div>
                  <p className="text-sm font-semibold">{item.name}</p>
                  <p className="font-mono text-[10.5px] text-ink-soft">{item.sku}</p>
                </div>
                <span className={`whitespace-nowrap rounded px-1.5 py-0.5 font-mono text-[11.5px] font-semibold ${
                  urgent ? "bg-[#FBECEA] text-crit" : "bg-[#FCF3E3] text-warn"
                }`}>
                  {item.days_of_cover < 0 ? "no demand" : `${item.days_of_cover} days left`}
                </span>
              </div>

              <p className="mt-2 rounded-md border-l-2 border-line bg-[#F7F9FC] px-2.5 py-2 text-xs text-ink-soft">
                <b className="font-mono text-ink">{r.available_stock}</b> available, selling{" "}
                <b className="font-mono text-ink">{r.daily_demand}</b>/day. Supplier takes{" "}
                <b className="font-mono text-ink">{r.lead_time_days}</b> days, so the reorder point is{" "}
                <b className="font-mono text-ink">{r.reorder_point}</b>.
              </p>

              <div className="mt-2.5 flex items-center gap-2">
                <span className="mr-auto font-mono text-xs font-semibold">
                  Order <b>{item.suggested_qty}</b>
                  <span className="font-normal text-ink-soft"> · {inr(item.estimated_cost)}</span>
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-ink-soft"
                      title={`Forecast confidence (${item.forecast_method})`}>
                  <span className="h-1 w-8 overflow-hidden rounded-full bg-[#E4E9F0]">
                    <i className="block h-full bg-good" style={{ width: `${item.forecast_confidence * 100}%` }} />
                  </span>
                  {Math.round(item.forecast_confidence * 100)}%
                </span>
              </div>

              <div className="mt-2.5 flex gap-2">
                <button onClick={() => decide(item, "accepted")}
                        className="rounded-lg bg-ink px-3 py-1.5 text-xs font-medium text-white hover:bg-ink-2">
                  Approve order
                </button>
                <button onClick={() => decide(item, "rejected")}
                        className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium hover:border-ink-soft">
                  Skip
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
