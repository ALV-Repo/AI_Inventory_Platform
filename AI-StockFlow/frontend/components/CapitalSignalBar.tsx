"use client";
import { inr } from "@/lib/api";

/**
 * Signature widget: a proportional band showing where stock capital sits.
 * Inventory's real story is which money is stuck, so that gets the hero slot.
 */
const BANDS = [
  { key: "fast_moving", label: "Selling well", color: "#0E7C6B" },
  { key: "slow_moving", label: "Slowing down", color: "#C77800" },
  { key: "overstocked", label: "Overstocked",  color: "#7A6BB5" },
  { key: "non_moving",  label: "Not moving",   color: "#B93B2E" },
];

export function CapitalSignalBar({ summary }: { summary: Record<string, number> }) {
  const total = Object.values(summary).reduce((a, b) => a + b, 0);
  if (total <= 0) {
    return (
      <div className="rounded-lg border border-line bg-white p-6 text-center shadow-card">
        <p className="text-sm text-ink-soft">
          No stock on hand yet. Add products and record a goods receipt to see where your capital sits.
        </p>
      </div>
    );
  }

  return (
    <section className="rounded-lg border border-line bg-white p-5 shadow-card">
      <div className="mb-3.5 flex flex-wrap items-baseline justify-between gap-4">
        <h2 className="font-display text-sm font-semibold">
          Where your stock capital is sitting
          <span className="ml-2 font-sans text-xs font-normal text-ink-soft">
            At weighted average cost
          </span>
        </h2>
        <span className="font-mono text-xl font-semibold tracking-tight">{inr(total)}</span>
      </div>

      <div className="flex h-[34px] gap-0.5 overflow-hidden rounded-md bg-[#EDF0F5]">
        {BANDS.map((b) => {
          const value = summary[b.key] ?? 0;
          if (value <= 0) return null;
          const pct = (value / total) * 100;
          return (
            <div
              key={b.key}
              style={{ flex: value, background: b.color }}
              title={`${b.label}: ${inr(value)}`}
              className="relative"
            >
              {pct > 9 && (
                <span className="absolute inset-0 grid place-items-center font-mono text-[11px] font-semibold text-white">
                  {pct.toFixed(0)}%
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-5">
        {BANDS.map((b) => (
          <div key={b.key} className="flex items-center gap-1.5 text-xs">
            <span className="h-2 w-2 rounded-sm" style={{ background: b.color }} />
            <span className="text-ink-soft">{b.label}</span>
            <b className="font-mono">{inr(summary[b.key] ?? 0)}</b>
          </div>
        ))}
      </div>
    </section>
  );
}
