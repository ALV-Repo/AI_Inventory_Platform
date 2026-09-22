"use client";

import { useCallback, useEffect, useState } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export interface HealthScore {
  overall_score: number;
  grade: string;
  components: {
    inventory_health: number;
    sales_health: number;
    cash_flow: number;
    supplier_score: number;
    customer_growth: number;
    [key: string]: number;
  };
  weakest_area: string;
  recommendation: string;
}

export interface DashboardSummary {
  revenue_today?: number;
  revenue_30_days?: number;
  revenue_period?: number;
  gross_margin?: number;
  gross_profit?: number;
  stock_value?: number;
  total_skus?: number;
  needs_reorder?: number;
  out_of_stock?: number;
  orders_today?: number;
  orders_30_days?: number;
  period_orders?: number;
  orders?: number;
  revenue_change_pct?: number;
  period_days?: number;
  health_score?: HealthScore;
  [key: string]: unknown;
}

export interface ReorderSuggestion {
  id?: number | string;
  product_id?: number | string;
  recommendation_id?: number;
  sku?: string;
  name?: string;
  product_name?: string;
  on_hand?: number;
  available?: number;
  days_of_cover?: number;
  suggested_qty?: number;
  estimated_cost?: number;
  forecast_confidence?: number;
  forecast_method?: string;
  reasoning?: Record<string, unknown>;
  requires_approval?: boolean;
  [key: string]: unknown;
}

export type DateRangeMode = "preset" | "custom";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("sf_access");
}

async function apiFetch<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export default function useDashboard() {
  // Preset period (days)
  const [period, setPeriod] = useState<number>(30);

  // Custom date range
  const [dateMode, setDateMode] = useState<DateRangeMode>("preset");
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState<string>(() =>
    new Date().toISOString().split("T")[0]
  );

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [reorderSuggestions, setReorderSuggestions] = useState<ReorderSuggestion[]>([]);
  const [deadStock, setDeadStock] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Compute effective days from custom range
  const effectiveDays = dateMode === "custom"
    ? Math.max(1, Math.round((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000))
    : period;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, r, d] = await Promise.all([
        apiFetch<Record<string, unknown>>(`/dashboard/summary?days=${effectiveDays}`),
        apiFetch<ReorderSuggestion[]>("/ai/reorder-suggestions").catch(() => []),
        apiFetch<{ items: unknown[] }>("/ai/dead-stock").then(r => r.items ?? []).catch(() => []),
      ]);
      setSummary(s as DashboardSummary);
      setReorderSuggestions(Array.isArray(r) ? r : []);
      setDeadStock(Array.isArray(d) ? d : []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [effectiveDays]);

  useEffect(() => { load(); }, [load]);

  // When preset period changes, update dateFrom/dateTo
  const handleSetPeriod = useCallback((days: number) => {
    setPeriod(days);
    setDateMode("preset");
    const to = new Date();
    const from = new Date();
    from.setDate(from.getDate() - days);
    setDateFrom(from.toISOString().split("T")[0]);
    setDateTo(to.toISOString().split("T")[0]);
  }, []);

  // When custom range is applied
  const handleCustomRange = useCallback((from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    setDateMode("custom");
  }, []);

  return {
    summary,
    reorderSuggestions,
    deadStock,
    loading,
    error,
    period,
    setPeriod: handleSetPeriod,
    dateMode,
    dateFrom,
    dateTo,
    setCustomRange: handleCustomRange,
    refresh: load,
    effectiveDays,
  };
}
