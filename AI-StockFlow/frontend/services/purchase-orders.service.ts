import { request } from "./api";

export interface PurchaseOrder {
  id?: string | number;
  request_number?: string;
  pr_number?: string;

  product?: string;
  product_name?: string;

  sku?: string;
  product_code?: string;

  quantity?: number;
  requested_quantity?: number;

  estimated_value?: number;
  amount?: number;
  total_value?: number;

  requester?: string;
  requested_by?: string;

  department?: string;
  warehouse?: string;
  warehouse_name?: string;

  supplier?: string;
  supplier_name?: string;

  requested_date?: string;
  request_date?: string;
  created_at?: string;

  required_date?: string;

  priority?: string;
  status?: string;

  reason?: string;
  notes?: string;

  [key: string]: unknown;
}

export async function getPurchaseOrders(): Promise<unknown> {
  return request<unknown>("/purchase-orders");
}

export async function getPurchaseOrderSummary(): Promise<unknown> {
  return request<unknown>("/purchase-orders/summary");
}