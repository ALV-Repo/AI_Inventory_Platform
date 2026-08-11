/**
 * API client for the AI StockFlow backend.
 * Handles token storage, automatic refresh, and typed responses.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export type Role =
  | "super_admin" | "owner" | "store_manager" | "cashier"
  | "warehouse_staff" | "procurement" | "accountant";

export interface DashboardSummary {
  today: { revenue: number; orders: number };
  period: {
    days: number; revenue: number; orders: number;
    gross_profit: number; margin_pct: number; revenue_change_pct: number;
  };
  inventory: {
    value: number; sku_count: number;
    low_stock_count: number; out_of_stock_count: number;
  };
}

export interface TrendPoint { date: string; revenue: number; orders: number }

export interface TopProduct {
  product_id: number; sku: string; name: string;
  units_sold: number; revenue: number; gross_profit: number;
}

export interface ReorderSuggestion {
  recommendation_id: number;
  product_id: number; sku: string; name: string;
  on_hand: number; available: number; days_of_cover: number;
  suggested_qty: number; estimated_cost: number;
  forecast_confidence: number; forecast_method: string;
  reasoning: Record<string, unknown>; requires_approval: boolean;
}

export interface DeadStockReport {
  summary: Record<string, number>;
  total_locked_in_slow_or_dead: number;
  items: Array<{
    product_id: number; sku: string; name: string;
    on_hand: number; capital_locked: number; velocity_class: string;
    days_since_last_sale: number | null;
    recommended_action: string; suggested_discount_pct: number;
  }>;
}

export interface CopilotAnswer {
  question: string; answer: string;
  grounded_in: Record<string, unknown>;
  source: "llm" | "rules";
}

export interface HealthScore {
  overall_score: number; grade: string;
  components: Record<string, number>;
  weakest_area: string; recommendation: string;
}

/** Thrown for any non-2xx response, carrying the server's message. */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const tokens = {
  get access() {
    return typeof window === "undefined" ? null : sessionStorage.getItem("sf_access");
  },
  get refresh() {
    return typeof window === "undefined" ? null : sessionStorage.getItem("sf_refresh");
  },
  set(access: string, refresh: string) {
    sessionStorage.setItem("sf_access", access);
    sessionStorage.setItem("sf_refresh", refresh);
  },
  clear() {
    sessionStorage.removeItem("sf_access");
    sessionStorage.removeItem("sf_refresh");
  },
};

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(tokens.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 401 && retry && tokens.refresh) {
    const refreshed = await refreshSession();
    if (refreshed) return request<T>(path, init, false);
    tokens.clear();
    throw new ApiError(401, "Your session expired. Sign in again.");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? "The request could not be completed.");
  }

  return res.json() as Promise<T>;
}

async function refreshSession(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: tokens.refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokens.set(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export const api = {
  async signIn(email: string, password: string) {
    const form = new URLSearchParams({ username: email, password });
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.detail ?? "Email or password is incorrect.");
    }
    const data = await res.json();
    tokens.set(data.access_token, data.refresh_token);
    return data;
  },

  signOut() {
    tokens.clear();
  },

  me: () => request<Record<string, unknown>>("/auth/me"),

  // Dashboard
  summary: (days = 30) => request<DashboardSummary>(`/dashboard/summary?days=${days}`),
  salesTrend: (days = 30) => request<TrendPoint[]>(`/dashboard/sales-trend?days=${days}`),
  topProducts: (days = 30, limit = 10) =>
    request<TopProduct[]>(`/dashboard/top-products?days=${days}&limit=${limit}`),
  gstSummary: (days = 30) => request<unknown>(`/dashboard/gst-summary?days=${days}`),

  // Inventory
  products: (params: { search?: string; lowStockOnly?: boolean } = {}) => {
    const q = new URLSearchParams();
    if (params.search) q.set("search", params.search);
    if (params.lowStockOnly) q.set("low_stock_only", "true");
    return request<unknown[]>(`/inventory/products?${q}`);
  },
  adjustStock: (body: {
    product_id: number; warehouse_id: number; quantity: number; reason_code: string;
  }) => request<unknown>("/inventory/adjustments", { method: "POST", body: JSON.stringify(body) }),

  // AI
  reorderSuggestions: () => request<ReorderSuggestion[]>("/ai/reorder-suggestions"),
  deadStock: () => request<DeadStockReport>("/ai/dead-stock"),
  healthScore: () => request<HealthScore>("/ai/health-score"),
  forecast: (productId: number, days = 30) =>
    request<unknown>(`/ai/forecast/${productId}?horizon_days=${days}`),
  askCopilot: (question: string) =>
    request<CopilotAnswer>("/ai/copilot", {
      method: "POST",
      body: JSON.stringify({ question }),
    }),
  decideRecommendation: (recommendationId: number, decision: "accepted" | "rejected") =>
    request<{ id: number; status: string; draft_po_id: number | null }>(
      `/ai/recommendations/${recommendationId}/decision`,
      { method: "POST", body: JSON.stringify({ decision }) },
    ),

  // Sales
  createSale: (body: unknown) =>
    request<unknown>("/sales", { method: "POST", body: JSON.stringify(body) }),
  sales: (limit = 50) => request<unknown[]>(`/sales?limit=${limit}`),
};

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);
