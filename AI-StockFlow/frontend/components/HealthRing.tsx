"use client";

import type { HealthScore } from "@/lib/api";

const LABELS: Record<string, string> = {
  inventory_health: "Inventory health",
  sales_health: "Sales health",
  cash_flow: "Cash flow",
  supplier_score: "Supplier score",
  customer_growth: "Customer growth",
};

const DEFAULT_SCORE: HealthScore = {
  overall_score: 0,
  grade: "N/A",
  components: {
    inventory_health: 0,
    sales_health: 0,
    cash_flow: 0,
    supplier_score: 0,
    customer_growth: 0,
  },
  weakest_area: "N/A",
  recommendation:
    "Health score data is not available yet.",
};

export function HealthRing({
  score,
}: {
  score?: HealthScore | null;
}) {
  const safeScore = score ?? DEFAULT_SCORE;

  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Number(safeScore.overall_score ?? 0)
    )
  );

  const grade = safeScore.grade ?? "N/A";

  const recommendation =
    safeScore.recommendation ??
    "Health score data is not available yet.";

  const r = 48;
  const circ = 2 * Math.PI * r;

  const colour =
    overallScore >= 80
      ? "#0E7C6B"
      : overallScore >= 65
        ? "#C77800"
        : "#B93B2E";

  const components = safeScore.components ?? {};

  return (
    <div className="rounded-lg border border-line bg-white shadow-card">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-line px-4.5 py-3.5">

        <div>
          <h2 className="font-display text-sm font-semibold">
            Business health
          </h2>

          <p className="mt-0.5 text-xs text-ink-soft">
            Weighted across five areas
          </p>
        </div>

        <span
          className="
            rounded
            border
            border-dashed
            border-ai
            bg-[#F2F5FC]
            px-1.5
            py-0.5
            text-[10px]
            font-bold
            uppercase
            tracking-wider
            text-ai
          "
        >
          AI scored
        </span>

      </div>

      {/* BODY */}
      <div className="p-4">

        <div className="flex flex-wrap items-center gap-5">

          {/* SCORE RING */}
          <div className="relative flex-none">

            <svg
              width={112}
              height={112}
              viewBox="0 0 112 112"
            >
              {/* Background ring */}
              <circle
                cx={56}
                cy={56}
                r={r}
                fill="none"
                stroke="#E9EDF3"
                strokeWidth={11}
              />

              {/* Progress ring */}
              <circle
                cx={56}
                cy={56}
                r={r}
                fill="none"
                stroke={colour}
                strokeWidth={11}
                strokeLinecap="round"
                transform="rotate(-90 56 56)"
                strokeDasharray={circ}
                strokeDashoffset={
                  circ *
                  (1 - overallScore / 100)
                }
              />
            </svg>

            {/* Score text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">

              <b className="font-mono text-[26px] font-semibold tracking-tight">
                {Math.round(overallScore)}
              </b>

              <i className="text-[10px] not-italic uppercase tracking-widest text-ink-soft">
                Grade {grade}
              </i>

            </div>

          </div>

          {/* COMPONENT SCORES */}
          <div className="min-w-[210px] flex-1 space-y-2.5">

            {Object.entries(components).map(
              ([key, rawValue]) => {

                const value = Math.min(
                  100,
                  Math.max(
                    0,
                    Number(rawValue ?? 0)
                  )
                );

                const componentColour =
                  value >= 75
                    ? "#0E7C6B"
                    : value >= 60
                      ? "#C77800"
                      : "#B93B2E";

                return (
                  <div
                    key={key}
                    className="
                      grid
                      grid-cols-[1fr_46px]
                      items-center
                      gap-2.5
                      text-xs
                    "
                  >

                    <div>

                      <span>
                        {LABELS[key] ?? key}
                      </span>

                      <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[#E9EDF3]">

                        <i
                          className="block h-full rounded-full"
                          style={{
                            width: `${value}%`,
                            background:
                              componentColour,
                          }}
                        />

                      </span>

                    </div>

                    <span className="text-right font-mono text-xs font-semibold">
                      {Math.round(value)}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </div>

        {/* RECOMMENDATION */}
        <div className="mt-3.5 rounded-lg border-l-[3px] border-ai bg-[#F2F5FC] px-3 py-2.5 text-xs">

          <b className="mb-1 block text-[10.5px] uppercase tracking-wider text-ai">
            Where to focus
          </b>

          {recommendation}

        </div>

      </div>

    </div>
  );
}

export default HealthRing;