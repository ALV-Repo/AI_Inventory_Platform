import { request } from "./api";

/* =========================================================
   SALES TYPES
   ========================================================= */

export interface SaleLine {
  product_id: number;
  quantity: number;
  unit_price: number;
  tax_rate: number;
}

export interface CreateSaleInput {
  customer_id: number | null;
  warehouse_id: number;
  channel: string;
  payment_mode: string;
  lines: SaleLine[];
}

export interface Sale {
  id?: number;
  sale_id?: number;

  customer_id?: number | null;
  warehouse_id?: number;

  channel?: string;
  payment_mode?: string;
  status?: string;

  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  total?: number;

  created_at?: string;
  updated_at?: string;

  lines?: SaleLine[];
  items?: SaleLine[];

  [key: string]: unknown;
}

/* =========================================================
   GET SALES
   ========================================================= */

export async function getSales(
  limit: number = 50
): Promise<Sale[]> {
  return request<Sale[]>(
    `/sales?limit=${limit}`
  );
}

/* =========================================================
   GET TODAY'S SALES
   ---------------------------------------------------------
   The backend does not expose /sales/today.
   Therefore we use the existing /sales endpoint and
   calculate today's summary on the frontend.
   ========================================================= */

export interface TodaySalesSummary {
  revenue: number;
  orders: number;
}

export async function getTodaySales(): Promise<TodaySalesSummary> {
  const sales = await getSales(100);

  const today = new Date();

  const todaySales = sales.filter((sale) => {
    if (!sale.created_at) {
      return false;
    }

    const saleDate = new Date(sale.created_at);

    return (
      saleDate.getFullYear() === today.getFullYear() &&
      saleDate.getMonth() === today.getMonth() &&
      saleDate.getDate() === today.getDate()
    );
  });

  const revenue = todaySales.reduce((sum, sale) => {
    const amount =
      sale.total_amount ??
      sale.total ??
      0;

    return sum + Number(amount);
  }, 0);

  return {
    revenue,
    orders: todaySales.length,
  };
}

/* =========================================================
   CREATE SALE
   ========================================================= */

export async function createSale(
  payload: CreateSaleInput
): Promise<Sale> {
  return request<Sale>("/sales", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}