"use client";
import type { HealthScore } from "@/lib/api";

const LABELS: Record<string, string> = {
  inventory_health: "Inventory health",
  sales_health: "Sales health",
  cash_flow: "Cash flow",
  supplier_score: "Supplier score",
  customer_growth: "Customer growth",
};

export function HealthRing({ score }: { score: HealthScore }) {
  const r = 48, circ = 2 * Math.PI * r;
  const colour = score.overall_score >= 80 ? "#0E7C6B"
               : score.overall_score >= 65 ? "#C77800" : "#B93B2E";

  return (
    <div className="rounded-lg border border-line bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-line px-4.5 py-3.5">
        <div>
          <h2 className="font-display text-sm font-semibold">Business health</h2>
          <p className="mt-0.5 text-xs text-ink-soft">Weighted across five areas</p>
        </div>
        <span className="rounded border border-dashed border-ai bg-[#F2F5FC] px-1.5 py-0.5
                         text-[10px] font-bold uppercase tracking-wider text-ai">
          AI scored
        </span>
      </div>

      <div className="p-4">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative flex-none">
            <svg width={112} height={112} viewBox="0 0 112 112">
              <circle cx={56} cy={56} r={r} fill="none" stroke="#E9EDF3" strokeWidth={11} />
              <circle cx={56} cy={56} r={r} fill="none" stroke={colour} strokeWidth={11}
                      strokeLinecap="round" transform="rotate(-90 56 56)"
                      strokeDasharray={circ}
                      strokeDashoffset={circ * (1 - score.overall_score / 100)} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <b className="font-mono text-[26px] font-semibold tracking-tight">
                {score.overall_score}
              </b>
              <i className="text-[10px] not-italic uppercase tracking-widest text-ink-soft">
                Grade {score.grade}
              </i>
            </div>
          </div>

          <div className="min-w-[210px] flex-1 space-y-2.5">
            {Object.entries(score.components).map(([key, value]) => {
              const c = value >= 75 ? "#0E7C6B" : value >= 60 ? "#C77800" : "#B93B2E";
              return (
                <div key={key} className="grid grid-cols-[1fr_46px] items-center gap-2.5 text-xs">
                  <div>
                    <span>{LABELS[key] ?? key}</span>
                    <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#E9EDF3]">
                      <i className="block h-full rounded-full"
                         style={{ width: `${value}%`, background: c }} />
                    </span>
                  </div>
                  <span className="text-right font-mono text-xs font-semibold">{value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-3.5 rounded-lg border-l-[3px] border-ai bg-[#F2F5FC] px-3 py-2.5 text-xs">
          <b className="mb-1 block text-[10.5px] uppercase tracking-wider text-ai">Where to focus</b>
          {score.recommendation}
        </div>
      </div>
    </div>
  );
}
