/**
 * API client for AI StockFlow — single source of truth for all API calls.
 * Dev C additions: suppliers, crm, hrm, warehouse endpoints.
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

// ── Shared types ──────────────────────────────────────────────────────────────

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
  recommendation_id: number; product_id: number; sku: string; name: string;
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

// ── Dev C types ───────────────────────────────────────────────────────────────

export interface Supplier {
  id: number; name: string; gstin?: string; phone?: string; email?: string;
  payment_terms_days: number; lead_time_days: number;
  on_time_rate: number; is_active: boolean;
}
export interface VendorScorecard {
  supplier_id: number; supplier_name: string;
  total_orders: number; received_orders: number;
  on_time_rate: number; fill_rate: number;
  quality_rejection_rate: number; scorecard_score: number; grade: string;
}
export interface SupplierLedger {
  supplier_id: number; supplier_name: string;
  total_purchases: number; outstanding_balance: number;
  payment_terms_days: number;
  orders: Array<{ id: number; po_number: string; order_date: string; status: string; total: number }>;
}
export interface Lead {
  id: number; name: string; email?: string; phone?: string;
  source: string; status: string; notes?: string;
  assigned_to?: number; created_at: string; activity_count: number;
}
export interface PipelineItem {
  id: number; customer_id: number; title: string;
  stage: string; value: number;
  expected_close_date?: string; notes?: string; created_at: string;
}
export interface Employee {
  id: number; employee_code: string; full_name: string;
  email?: string; phone?: string; department?: string;
  designation?: string; joining_date: string;
  basic_salary: number; status: string;
}
export interface AttendanceRecord {
  id: number; employee_id: number; date: string;
  check_in?: string; check_out?: string;
  status: string; source: string;
}
export interface LeaveRequest {
  id: number; employee_id: number; leave_type: string;
  from_date: string; to_date: string; days: number;
  reason?: string; status: string; created_at: string;
}
export interface PickListSummary {
  id: number; sales_order_id: number; warehouse_id: number;
  status: string; assigned_to?: number; created_at: string;
  completed_at?: string; line_count: number;
}
export interface DispatchRecord {
  id: number; sales_order_id: number; gate_pass_number: string;
  courier?: string; tracking_number?: string;
  dispatched_at: string; status: string;
}

/** Thrown for any non-2xx response */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// ── Token management ──────────────────────────────────────────────────────────

const tokens = {
  get access() { return typeof window === "undefined" ? null : sessionStorage.getItem("sf_access"); },
  get refresh() { return typeof window === "undefined" ? null : sessionStorage.getItem("sf_refresh"); },
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
  } catch { return false; }
}

// ── API methods ───────────────────────────────────────────────────────────────

export const api = {
  // Auth
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
  signOut() { tokens.clear(); },
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
  adjustStock: (body: { product_id: number; warehouse_id: number; quantity: number; reason_code: string }) =>
    request<unknown>("/inventory/adjustments", { method: "POST", body: JSON.stringify(body) }),

  // AI
  reorderSuggestions: () => request<ReorderSuggestion[]>("/ai/reorder-suggestions"),
  deadStock: () => request<DeadStockReport>("/ai/dead-stock"),
  healthScore: () => request<HealthScore>("/ai/health-score"),
  forecast: (productId: number, days = 30) =>
    request<unknown>(`/ai/forecast/${productId}?horizon_days=${days}`),
  askCopilot: (question: string) =>
    request<CopilotAnswer>("/ai/copilot", { method: "POST", body: JSON.stringify({ question }) }),
  decideRecommendation: (recommendationId: number, decision: "accepted" | "rejected") =>
    request<{ id: number; status: string; draft_po_id: number | null }>(
      `/ai/recommendations/${recommendationId}/decision`,
      { method: "POST", body: JSON.stringify({ decision }) },
    ),

  // Sales
  createSale: (body: unknown) =>
    request<unknown>("/sales", { method: "POST", body: JSON.stringify(body) }),
  sales: (limit = 50) => request<unknown[]>(`/sales?limit=${limit}`),

  // ── Dev C: Suppliers (FR-PUR-03, FR-PUR-06, FR-PUR-07) ──────────────────
  suppliers: {
    list: () => request<Supplier[]>("/suppliers"),
    get: (id: number) => request<Supplier>(`/suppliers/${id}`),
    create: (body: Omit<Supplier, "id" | "on_time_rate" | "is_active">) =>
      request<Supplier>("/suppliers", { method: "POST", body: JSON.stringify(body) }),
    update: (id: number, body: Partial<Supplier>) =>
      request<Supplier>(`/suppliers/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    deactivate: (id: number) =>
      fetch(`${BASE}/suppliers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${tokens.access}` },
      }),
    scorecard: (id: number) => request<VendorScorecard>(`/suppliers/${id}/scorecard`),
    ledger: (id: number) => request<SupplierLedger>(`/suppliers/${id}/ledger`),
  },

  // ── Dev C: CRM (FR-CRM-01 to FR-CRM-04) ─────────────────────────────────
  crm: {
    leads: (params?: { source?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.source) q.set("source", params.source);
      if (params?.status) q.set("status", params.status);
      return request<Lead[]>(`/crm/leads?${q}`);
    },
    getLead: (id: number) => request<Lead>(`/crm/leads/${id}`),
    createLead: (body: { name: string; email?: string; phone?: string; source?: string; notes?: string }) =>
      request<Lead>("/crm/leads", { method: "POST", body: JSON.stringify(body) }),
    updateLead: (id: number, body: Partial<Lead>) =>
      request<Lead>(`/crm/leads/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    activities: (leadId: number) => request<unknown[]>(`/crm/leads/${leadId}/activities`),
    addActivity: (body: { lead_id: number; activity_type?: string; description: string; due_date?: string }) =>
      request<unknown>("/crm/activities", { method: "POST", body: JSON.stringify(body) }),
    completeActivity: (id: number) =>
      request<unknown>(`/crm/activities/${id}/complete`, { method: "POST" }),
    customer360: (customerId: number) => request<unknown>(`/crm/customers/${customerId}/360`),
    pipeline: (stage?: string) => {
      const q = stage ? `?stage=${stage}` : "";
      return request<{ total_pipeline_value: number; kanban: Record<string, PipelineItem[]>; items: PipelineItem[] }>(`/crm/pipeline${q}`);
    },
    createPipelineItem: (body: { customer_id: number; title: string; stage?: string; value?: number }) =>
      request<PipelineItem>("/crm/pipeline", { method: "POST", body: JSON.stringify(body) }),
    updatePipelineItem: (id: number, body: Partial<PipelineItem>) =>
      request<PipelineItem>(`/crm/pipeline/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  },

  // ── Dev C: HRM (FR-HRM-01 to FR-HRM-04) ─────────────────────────────────
  hrm: {
    employees: (params?: { department?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.department) q.set("department", params.department);
      if (params?.status) q.set("status", params.status);
      return request<Employee[]>(`/hrm/employees?${q}`);
    },
    getEmployee: (id: number) => request<Employee>(`/hrm/employees/${id}`),
    createEmployee: (body: Omit<Employee, "id" | "status">) =>
      request<Employee>("/hrm/employees", { method: "POST", body: JSON.stringify(body) }),
    updateEmployee: (id: number, body: Partial<Employee>) =>
      request<Employee>(`/hrm/employees/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    attendance: (params?: { employee_id?: number; date_from?: string; date_to?: string }) => {
      const q = new URLSearchParams();
      if (params?.employee_id) q.set("employee_id", String(params.employee_id));
      if (params?.date_from) q.set("date_from", params.date_from);
      if (params?.date_to) q.set("date_to", params.date_to);
      return request<AttendanceRecord[]>(`/hrm/attendance?${q}`);
    },
    markAttendance: (body: { employee_id: number; date: string; status?: string; source?: string }) =>
      request<unknown>("/hrm/attendance", { method: "POST", body: JSON.stringify(body) }),
    leaveRequests: (params?: { employee_id?: number; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.employee_id) q.set("employee_id", String(params.employee_id));
      if (params?.status) q.set("status", params.status);
      return request<LeaveRequest[]>(`/hrm/leave?${q}`);
    },
    applyLeave: (body: { employee_id: number; leave_type?: string; from_date: string; to_date: string; reason?: string }) =>
      request<unknown>("/hrm/leave", { method: "POST", body: JSON.stringify(body) }),
    approveLeave: (id: number) => request<unknown>(`/hrm/leave/${id}/approve`, { method: "POST" }),
    rejectLeave: (id: number) => request<unknown>(`/hrm/leave/${id}/reject`, { method: "POST" }),
    payslips: (params?: { employee_id?: number; year?: number }) => {
      const q = new URLSearchParams();
      if (params?.employee_id) q.set("employee_id", String(params.employee_id));
      if (params?.year) q.set("year", String(params.year));
      return request<unknown[]>(`/hrm/payslips?${q}`);
    },
    generatePayslip: (employee_id: number, month: number, year: number) =>
      request<unknown>(`/hrm/payslips/generate?employee_id=${employee_id}&month=${month}&year=${year}`, { method: "POST" }),
  },

  // ── Dev C: Warehouse (FR-WHS-01 to FR-WHS-04) ────────────────────────────
  warehouse: {
    bins: (warehouse_id?: number) => {
      const q = warehouse_id ? `?warehouse_id=${warehouse_id}` : "";
      return request<{ bins: unknown[]; tree: Record<string, unknown> }>(`/warehouse/bins${q}`);
    },
    createBin: (body: { warehouse_id: number; zone: string; rack: string; bin_code: string; capacity?: number }) =>
      request<unknown>("/warehouse/bins", { method: "POST", body: JSON.stringify(body) }),
    pickLists: (status?: string) => {
      const q = status ? `?status=${status}` : "";
      return request<PickListSummary[]>(`/warehouse/pick-lists${q}`);
    },
    getPickList: (id: number) => request<unknown>(`/warehouse/pick-lists/${id}`),
    createPickList: (sales_order_id: number) =>
      request<unknown>(`/warehouse/pick-lists?sales_order_id=${sales_order_id}`, { method: "POST" }),
    confirmPickLine: (pickListId: number, lineId: number, qty: number) =>
      request<unknown>(
        `/warehouse/pick-lists/${pickListId}/confirm-line?line_id=${lineId}&quantity_picked=${qty}`,
        { method: "POST" },
      ),
    putAways: (status?: string) => {
      const q = status ? `?status=${status}` : "";
      return request<unknown[]>(`/warehouse/put-away${q}`);
    },
    createPutAway: (body: { purchase_order_id: number; product_id: number; warehouse_id: number; quantity: number }) =>
      request<unknown>("/warehouse/put-away", { method: "POST", body: JSON.stringify(body) }),
    completePutAway: (id: number, bin_id?: number) =>
      request<unknown>(
        `/warehouse/put-away/${id}/complete${bin_id ? `?actual_bin_id=${bin_id}` : ""}`,
        { method: "POST" },
      ),
    dispatches: () => request<DispatchRecord[]>("/warehouse/dispatch"),
    createDispatch: (body: { sales_order_id: number; warehouse_id: number; courier?: string; vehicle_number?: string; tracking_number?: string }) =>
      request<DispatchRecord>("/warehouse/dispatch", { method: "POST", body: JSON.stringify(body) }),
  },
};

// ── Formatting helpers ────────────────────────────────────────────────────────

export const inr = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(n);

export const fmtDate = (d: string | null | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-IN");
};
