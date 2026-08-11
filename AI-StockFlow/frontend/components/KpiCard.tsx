export function KpiCard({
  label, value, note, delta, alert, loading,
}: {
  label: string; value: string; note?: string;
  delta?: number; alert?: boolean; loading?: boolean;
}) {
  return (
    <div className={`rounded-lg border border-line bg-white p-4 shadow-card ${
      alert ? "border-l-[3px] border-l-warn" : ""
    }`}>
      <p className="text-[10.5px] font-semibold uppercase tracking-[.1em] text-ink-soft">
        {label}
      </p>
      <p className={`mt-2 font-mono text-2xl font-semibold tracking-tight ${
        alert ? "text-warn" : ""
      } ${loading ? "animate-pulse text-ink-soft" : ""}`}>
        {loading ? "—" : value}
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-xs">
        {delta !== undefined && (
          <span className={`font-mono font-semibold ${delta >= 0 ? "text-good" : "text-crit"}`}>
            {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}
        {note && <span className="text-ink-soft">{note}</span>}
      </p>
    </div>
  );
}
