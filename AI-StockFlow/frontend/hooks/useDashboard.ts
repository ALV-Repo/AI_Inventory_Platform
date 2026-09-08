"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

/* =========================================================
   API BASE URL
   ========================================================= */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api/v1";

/* =========================================================
   HEALTH SCORE
   ========================================================= */

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

/* =========================================================
   DASHBOARD SUMMARY
   ========================================================= */

export interface DashboardSummary {
  revenue_today?: number;

  revenue_30_days?: number;

  gross_margin?: number;

  gross_profit?: number;

  stock_value?: number;

  total_skus?: number;

  needs_reorder?: number;

  out_of_stock?: number;

  orders_today?: number;

  orders_30_days?: number;

  revenue_change_pct?: number;

  period_days?: number;

  health_score?: HealthScore;

  [key: string]: unknown;
}

/* =========================================================
   REORDER SUGGESTION
   ========================================================= */

export interface ReorderSuggestion {
  id?: number | string;

  product_id?: number | string;

  product_name?: string;

  name?: string;

  sku?: string;

  code?: string;

  available?: number;

  current_stock?: number;

  selling_rate?: number;

  daily_sales?: number;

  supplier_lead_time?: number;

  lead_time_days?: number;

  reorder_point?: number;

  recommended_order_quantity?: number;

  order_quantity?: number;

  estimated_value?: number;

  value?: number;

  progress?: number;

  [key: string]: unknown;
}

/* =========================================================
   DEAD STOCK ITEM
   ========================================================= */

export interface DeadStockItem {
  id?: number | string;

  product_id?: number | string;

  product_name?: string;

  product?: string;

  name?: string;

  sku?: string;

  code?: string;

  status?: string;

  on_hand?: number;

  quantity?: number;

  current_stock?: number;

  capital?: number;

  inventory_value?: number;

  [key: string]: unknown;
}

/* =========================================================
   BACKEND DASHBOARD RESPONSE
   =========================================================

   The backend currently returns:

   {
     "today": {
       "revenue": 0,
       "orders": 0
     },

     "period": {
       "days": 30,
       "revenue": 631914.7,
       "orders": 144,
       "gross_profit": 227528,
       "margin_pct": 36.0,
       "revenue_change_pct": -61.7
     },

     "inventory": {
       "value": 509853,
       "sku_count": 20,
       "low_stock_count": 4,
       "out_of_stock_count": 0
     }
   }

   ========================================================= */

interface BackendDashboardResponse {
  today?: {
    revenue?: number;

    orders?: number;
  };

  period?: {
    days?: number;

    revenue?: number;

    orders?: number;

    gross_profit?: number;

    margin_pct?: number;

    revenue_change_pct?: number;
  };

  inventory?: {
    value?: number;

    sku_count?: number;

    low_stock_count?: number;

    out_of_stock_count?: number;
  };

  health_score?: HealthScore;

  [key: string]: unknown;
}

/* =========================================================
   HOOK RESULT
   ========================================================= */

interface DashboardData {
  summary: DashboardSummary | null;

  reorderSuggestions: ReorderSuggestion[];

  deadStock: DeadStockItem[];
}

interface UseDashboardResult
  extends DashboardData {
  loading: boolean;

  error: string | null;

  period: number;

  setPeriod: (
    days: number
  ) => void;

  refresh: () => Promise<void>;
}

/* =========================================================
   FETCH JSON
   ========================================================= */

async function fetchJson<T>(
  url: string,
  token: string
): Promise<T> {
  const response = await fetch(
    url,
    {
      method: "GET",

      headers: {
        Accept:
          "application/json",

        Authorization:
          `Bearer ${token}`,
      },

      cache: "no-store",
    }
  );

  const contentType =
    response.headers.get(
      "content-type"
    ) ?? "";

  let data: unknown = null;

  try {
    if (
      contentType.includes(
        "application/json"
      )
    ) {
      data =
        await response.json();
    } else {
      data =
        await response.text();
    }
  } catch {
    data = null;
  }

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (
      typeof data === "string" &&
      data.trim()
    ) {
      message = data;
    } else if (
      typeof data === "object" &&
      data !== null
    ) {
      const body =
        data as {
          detail?: unknown;
          message?: unknown;
        };

      if (body.detail) {
        message =
          String(body.detail);
      } else if (
        body.message
      ) {
        message =
          String(body.message);
      }
    }

    if (
      response.status === 401
    ) {
      message =
        "Authentication expired. Please sign in again.";
    }

    throw new Error(message);
  }

  return data as T;
}

/* =========================================================
   NORMALIZE ARRAY RESPONSES
   ========================================================= */

function normalizeArray<T>(
  data: unknown
): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const value =
      data as {
        data?: unknown;

        items?: unknown;

        results?: unknown;
      };

    if (
      Array.isArray(
        value.data
      )
    ) {
      return value.data as T[];
    }

    if (
      Array.isArray(
        value.items
      )
    ) {
      return value.items as T[];
    }

    if (
      Array.isArray(
        value.results
      )
    ) {
      return value.results as T[];
    }
  }

  return [];
}

/* =========================================================
   NORMALIZE HEALTH SCORE
   ========================================================= */

function normalizeHealthScore(
  value: unknown
): HealthScore | undefined {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return undefined;
  }

  const score =
    value as Record<
      string,
      unknown
    >;

  const overallScore =
    Number(
      score.overall_score
    );

  if (
    !Number.isFinite(
      overallScore
    )
  ) {
    return undefined;
  }

  const componentsValue =
    score.components;

  if (
    typeof componentsValue !==
      "object" ||
    componentsValue === null
  ) {
    return undefined;
  }

  const components =
    componentsValue as Record<
      string,
      unknown
    >;

  return {
    overall_score:
      overallScore,

    grade:
      typeof score.grade ===
      "string"
        ? score.grade
        : "N/A",

    components: {
      inventory_health:
        Number(
          components.inventory_health
        ) || 0,

      sales_health:
        Number(
          components.sales_health
        ) || 0,

      cash_flow:
        Number(
          components.cash_flow
        ) || 0,

      supplier_score:
        Number(
          components.supplier_score
        ) || 0,

      customer_growth:
        Number(
          components.customer_growth
        ) || 0,
    },

    weakest_area:
      typeof score.weakest_area ===
      "string"
        ? score.weakest_area
        : "",

    recommendation:
      typeof score.recommendation ===
      "string"
        ? score.recommendation
        : "",
  };
}

/* =========================================================
   NORMALIZE DASHBOARD SUMMARY
   =========================================================

   Converts the backend nested response into
   the flat structure expected by dashboard/page.tsx.
   ========================================================= */

function normalizeDashboardSummary(
  data: BackendDashboardResponse,
  selectedPeriod: number
): DashboardSummary {
  const today =
    data.today ?? {};

  const period =
    data.period ?? {};

  const inventory =
    data.inventory ?? {};

  const healthScore =
    normalizeHealthScore(
      data.health_score
    );

  return {
    /* Today's revenue */

    revenue_today:
      Number(
        today.revenue
      ) || 0,

    /* Selected-period revenue */

    revenue_30_days:
      Number(
        period.revenue
      ) || 0,

    /* Gross profit */

    gross_profit:
      Number(
        period.gross_profit
      ) || 0,

    /* Gross margin */

    gross_margin:
      Number(
        period.margin_pct
      ) || 0,

    /* Inventory value */

    stock_value:
      Number(
        inventory.value
      ) || 0,

    /* Active SKUs */

    total_skus:
      Number(
        inventory.sku_count
      ) || 0,

    /* Low-stock products */

    needs_reorder:
      Number(
        inventory.low_stock_count
      ) || 0,

    /* Out-of-stock products */

    out_of_stock:
      Number(
        inventory.out_of_stock_count
      ) || 0,

    /* Orders */

    orders_today:
      Number(
        today.orders
      ) || 0,

    orders_30_days:
      Number(
        period.orders
      ) || 0,

    /* Revenue change */

    revenue_change_pct:
      Number(
        period.revenue_change_pct
      ) || 0,

    /* Selected period */

    period_days:
      selectedPeriod,

    /* AI business health */

    ...(healthScore
      ? {
          health_score:
            healthScore,
        }
      : {}),
  };
}

/* =========================================================
   TOKEN
   ========================================================= */

function getAccessToken(): string | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  /*
   * Authentication is stored by
   * authService.ts as:
   *
   * sessionStorage["sf_access"]
   */

  return sessionStorage.getItem(
    "sf_access"
  );
}

/* =========================================================
   AUTH ERROR
   ========================================================= */

function isAuthenticationError(
  error: unknown
): boolean {
  return (
    error instanceof Error &&
    (
      error.message
        .toLowerCase()
        .includes("authentication") ||
      error.message
        .toLowerCase()
        .includes("unauthorized") ||
      error.message
        .toLowerCase()
        .includes("401")
    )
  );
}

/* =========================================================
   MAIN HOOK
   ========================================================= */

export function useDashboard(): UseDashboardResult {
  const [
    summary,
    setSummary,
  ] =
    useState<
      DashboardSummary | null
    >(null);

  const [
    reorderSuggestions,
    setReorderSuggestions,
  ] =
    useState<
      ReorderSuggestion[]
    >([]);

  const [
    deadStock,
    setDeadStock,
  ] =
    useState<
      DeadStockItem[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  /* =======================================================
     DASHBOARD PERIOD
     ======================================================= */

  const [
    period,
    setPeriod,
  ] =
    useState(30);

  /* =======================================================
     LOAD DASHBOARD
     ======================================================= */

  const loadDashboard =
    useCallback(
      async () => {
        setLoading(true);
        setError(null);

        try {
          /*
           * Read the same token that
           * authService.ts writes.
           */

          const token =
            getAccessToken();

          if (!token) {
            throw new Error(
              "Authentication required. Please log in again."
            );
          }

          /*
           * Load all dashboard endpoints.
           *
           * All requests use the same
           * authenticated Bearer token.
           */

          const [
            summaryResponse,
            reorderResponse,
            deadStockResponse,
          ] =
            await Promise.all([
              fetchJson<
                BackendDashboardResponse
              >(
                `${BASE_URL}/dashboard/summary?days=${period}`,
                token
              ),

              fetchJson<unknown>(
                `${BASE_URL}/ai/reorder-suggestions`,
                token
              ),

              fetchJson<unknown>(
                `${BASE_URL}/ai/dead-stock`,
                token
              ),
            ]);

          /*
           * Normalize dashboard summary.
           */

          const normalizedSummary =
            normalizeDashboardSummary(
              summaryResponse,
              period
            );

          setSummary(
            normalizedSummary
          );

          /*
           * Normalize reorder
           * suggestions.
           */

          const normalizedReorder =
            normalizeArray<
              ReorderSuggestion
            >(
              reorderResponse
            );

          setReorderSuggestions(
            normalizedReorder
          );

          /*
           * Normalize dead stock.
           */

          const normalizedDeadStock =
            normalizeArray<
              DeadStockItem
            >(
              deadStockResponse
            );

          setDeadStock(
            normalizedDeadStock
          );

        } catch (err) {

          /*
           * Keep console output limited
           * to actual development errors.
           *
           * Do not log tokens or API
           * responses.
           */

          if (
            process.env
              .NODE_ENV !==
            "production"
          ) {
            console.error(
              "Dashboard data error:",
              err
            );
          }

          /*
           * Clear dashboard data when
           * the request fails so stale
           * information is not displayed.
           */

          setSummary(null);

          setReorderSuggestions(
            []
          );

          setDeadStock([]);

          /*
           * Convert authentication
           * errors into a clear message.
           */

          if (
            isAuthenticationError(
              err
            )
          ) {
            setError(
              "Authentication expired. Please sign in again."
            );
          } else {
            setError(
              err instanceof Error
                ? err.message
                : "Unable to load dashboard data."
            );
          }

        } finally {
          setLoading(false);
        }
      },
      [period]
    );

  /* =======================================================
     INITIAL LOAD + PERIOD CHANGE
     ======================================================= */

  useEffect(() => {
    loadDashboard();
  }, [
    loadDashboard,
  ]);

  /* =======================================================
     RETURN
     ======================================================= */

  return {
    summary,

    reorderSuggestions,

    deadStock,

    loading,

    error,

    period,

    setPeriod,

    refresh:
      loadDashboard,
  };
}

export default useDashboard;