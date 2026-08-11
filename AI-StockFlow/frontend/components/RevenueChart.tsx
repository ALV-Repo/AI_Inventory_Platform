"use client";
import { inr, type TrendPoint } from "@/lib/api";

/** Inline SVG so the chart carries no runtime dependency. */
export function RevenueChart({ data }: { data: TrendPoint[] }) {
  if (!data.length) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-lg border border-line bg-white shadow-card">
        <p className="text-sm text-ink-soft">No sales recorded in this period yet.</p>
      </div>
    );
  }

  const W = 720, H = 230, PL = 52, PR = 12, PT = 14, PB = 26;
  const max = Math.max(...data.map((d) => d.revenue)) * 1.12 || 1;
  const iw = W - PL - PR, ih = H - PT - PB;
  const x = (i: number) => PL + (i / Math.max(1, data.length - 1)) * iw;
  const y = (v: number) => PT + ih - (v / max) * ih;

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.revenue).toFixed(1)}`).join(" ");
  const bestIdx = data.reduce((b, d, i) => (d.revenue > data[b].revenue ? i : b), 0);

  return (
    <div className="rounded-lg border border-line bg-white shadow-card">
      <div className="border-b border-line px-4.5 py-3.5">
        <h2 className="font-display text-sm font-semibold">Revenue and orders</h2>
        <p className="mt-0.5 text-xs text-ink-soft">Daily totals including GST</p>
      </div>
      <div className="p-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-[230px] w-full"
             role="img" aria-label={`Daily revenue over the last ${data.length} days`}>
          {[0, 1, 2, 3, 4].map((g) => {
            const gy = PT + (ih / 4) * g;
            return (
              <g key={g}>
                <line x1={PL} y1={gy} x2={W - PR} y2={gy} stroke="#EDF0F5" />
                <text x={PL - 8} y={gy + 3.5} textAnchor="end"
                      className="fill-ink-soft font-mono text-[10px]">
                  {Math.round((max - (max / 4) * g) / 1000)}k
                </text>
              </g>
            );
          })}

          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#12213A" stopOpacity=".16" />
              <stop offset="100%" stopColor="#12213A" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={`${line} L${x(data.length - 1)},${PT + ih} L${PL},${PT + ih} Z`} fill="url(#rev)" />
          <path d={line} fill="none" stroke="#12213A" strokeWidth={2} strokeLinejoin="round" />

          <circle cx={x(bestIdx)} cy={y(data[bestIdx].revenue)} r={4.5}
                  fill="#0E7C6B" stroke="#fff" strokeWidth={2} />
          <text x={x(bestIdx)} y={y(data[bestIdx].revenue) - 11} textAnchor="middle"
                className="fill-good font-mono text-[10px] font-semibold">
            {inr(data[bestIdx].revenue)}
          </text>

          {data.map((d, i) =>
            i % Math.ceil(data.length / 5) === 0 || i === data.length - 1 ? (
              <text key={i} x={x(i)} y={H - 8} textAnchor="middle"
                    className="fill-ink-soft font-mono text-[10px]">
                {new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </text>
            ) : null
          )}
          <line x1={PL} y1={PT + ih} x2={W - PR} y2={PT + ih} stroke="#DFE5EC" />
        </svg>
      </div>
    </div>
  );
}
