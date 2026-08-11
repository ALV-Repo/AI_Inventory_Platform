"use client";
import { inr, type DeadStockReport } from "@/lib/api";

const LABEL: Record<string, { text: string; cls: string }> = {
  non_moving:  { text: "Not moving",  cls: "bg-[#FBECEA] text-crit" },
  slow_moving: { text: "Slowing",     cls: "bg-[#FCF3E3] text-warn" },
  overstocked: { text: "Overstocked", cls: "bg-[#F1EEF9] text-over" },
};

export function DeadStockTable({ report }: { report: DeadStockReport }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-line px-4.5 py-3.5">
        <div>
          <h2 className="font-display text-sm font-semibold">Stock not moving</h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            {inr(report.total_locked_in_slow_or_dead)} tied up · ranked by capital
          </p>
        </div>
        <span className="rounded border border-dashed border-ai bg-[#F2F5FC] px-1.5 py-0.5
                         text-[10px] font-bold uppercase tracking-wider text-ai">
          AI classified
        </span>
      </div>

      {report.items.length === 0 ? (
        <p className="p-6 text-center text-sm text-ink-soft">
          Everything is turning over. No slow or dead stock to clear.
        </p>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-[#FAFBFD]">
              {["Product", "Status", "On hand", "Capital", "Idle", "Suggested action"].map((h, i) => (
                <th key={h} className={`border-b border-line px-4.5 py-2.5 text-[10.5px] font-semibold
                                        uppercase tracking-wider text-ink-soft
                                        ${i >= 2 && i <= 4 ? "text-right" : "text-left"}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.items.slice(0, 8).map((item) => {
              const label = LABEL[item.velocity_class] ?? { text: item.velocity_class, cls: "" };
              return (
                <tr key={item.product_id} className="hover:bg-[#FAFBFD]">
                  <td className="border-b border-[#EEF1F5] px-4.5 py-2.5">
                    <p className="text-[13px] font-semibold">{item.name}</p>
                    <p className="font-mono text-[10.5px] text-ink-soft">{item.sku}</p>
                  </td>
                  <td className="border-b border-[#EEF1F5] px-4.5 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${label.cls}`}>
                      {label.text}
                    </span>
                  </td>
                  <td className="border-b border-[#EEF1F5] px-4.5 py-2.5 text-right font-mono text-[13px]">
                    {item.on_hand}
                  </td>
                  <td className="border-b border-[#EEF1F5] px-4.5 py-2.5 text-right font-mono text-[13px] font-semibold">
                    {inr(item.capital_locked)}
                  </td>
                  <td className="border-b border-[#EEF1F5] px-4.5 py-2.5 text-right font-mono text-[13px]">
                    {item.days_since_last_sale === null ? "never" : `${item.days_since_last_sale}d`}
                  </td>
                  <td className="border-b border-[#EEF1F5] px-4.5 py-2.5 text-xs text-ink-soft">
                    {item.recommended_action}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
