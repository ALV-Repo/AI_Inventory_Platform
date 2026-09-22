import { request } from "./api";
export interface DashboardSummary {
  revenue_today?: number;
  revenue_30_days?: number;
  gross_margin?: number;
  gross_profit?: number;
  stock_value?: number;
  total_skus?: number;
  needs_reorder?: number;
  out_of_stock?: number;
  [key: string]: unknown;
}
export async function getDashboardSummary(days: number = 30): Promise<DashboardSummary> {
  return request<DashboardSummary>(`/dashboard/summary?days=${days}`);
}
export { request };
