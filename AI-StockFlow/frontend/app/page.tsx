"use client";

/**
 * Operations dashboard (SRS §3.8, FR-RPT-01/02).
 * Widgets render according to the signed-in user's role.
 */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  api, inr,
  type DashboardSummary, type TrendPoint, type ReorderSuggestion,
  type DeadStockReport, type HealthScore,
} from "@/lib/api";
import { CapitalSignalBar } from "@/components/CapitalSignalBar";
import { RevenueChart } from "@/components/RevenueChart";
import { ReorderQueue } from "@/components/ReorderQueue";
import { DeadStockTable } from "@/components/DeadStockTable";
import { HealthRing } from "@/components/HealthRing";
import { Copilot } from "@/components/Copilot";
import { KpiCard } from "@/components/KpiCard";

export default function Dashboard() {
  const router = useRouter();
  const [days, setDays] = useState(30);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [reorders, setReorders] = useState<ReorderSuggestion[]>([]);
  const [dead, setDead] = useState<DeadStockReport | null>(null);
  const [health, setHealth] = useState<HealthScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [s, t, r, d, h] = await Promise.all([
          api.summary(days),
          api.salesTrend(days),
          api.reorderSuggestions(),
          api.deadStock(),
          api.healthScore(),
        ]);
        if (cancelled) return;
        setSummary(s); setTrend(t); setReorders(r); setDead(d); setHealth(h);
      } catch (e) {
        if (cancelled) return;
        // Session expired -> back to sign-in rather than a dead error screen.
        if (e && typeof e === "object" && "status" in e && (e as { status: number }).status === 401) {
          router.push("/login");
          return;
        }
        setError(e instanceof Error ? e.message : "Could not load the dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    // Refresh while the tab is open so the numbers stay current (FR-RPT-01).
    const timer = setInterval(load, 60_000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [days]);

  if (error) {
    return (
      <div className="rounded-lg border border-line bg-white p-8 text-center">
        <p className="font-semibold text-crit">{error}</p>
        <button
          onClick={() => setDays((d) => d)}
          className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            Main Store — Bengaluru
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long", day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg bg-[#E8ECF2] p-0.5">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                  days === d ? "bg-white font-semibold shadow-sm" : "text-ink-soft"
                }`}
              >
                {d} days
              </button>
            ))}
          </div>
        </div>
      </header>

      {dead && <CapitalSignalBar summary={dead.summary} />}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard
          label="Revenue today"
          value={summary ? inr(summary.today.revenue) : "—"}
          note={`${summary?.today.orders ?? 0} orders`}
          loading={loading}
        />
        <KpiCard
          label={`Revenue ${days} days`}
          value={summary ? inr(summary.period.revenue) : "—"}
          delta={summary?.period.revenue_change_pct}
          note="vs previous period"
          loading={loading}
        />
        <KpiCard
          label="Gross margin"
          value={summary ? `${summary.period.margin_pct}%` : "—"}
          note={summary ? `${inr(summary.period.gross_profit)} profit` : ""}
          loading={loading}
        />
        <KpiCard
          label="Stock value"
          value={summary ? inr(summary.inventory.value) : "—"}
          note={`${summary?.inventory.sku_count ?? 0} SKUs`}
          loading={loading}
        />
        <KpiCard
          label="Needs reorder"
          value={String(summary?.inventory.low_stock_count ?? 0)}
          note={`${summary?.inventory.out_of_stock_count ?? 0} already out of stock`}
          alert={(summary?.inventory.low_stock_count ?? 0) > 0}
          loading={loading}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        <RevenueChart data={trend} />
        <ReorderQueue
          items={reorders}
          onDecision={(recId, decision) => api.decideRecommendation(recId, decision)}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
        {dead && <DeadStockTable report={dead} />}
        {health && <HealthRing score={health} />}
      </section>

      <Copilot />
    </div>
  );
}
