import { request } from "./api";

export interface InventoryProduct {
  id: number | string;
  name?: string;
  sku?: string;
  quantity?: number;
  stock?: number;
  price?: number;
  cost_price?: number;
  [key: string]: unknown;
}

export interface ProductsResponse {
  products?: InventoryProduct[];
  items?: InventoryProduct[];
  data?: InventoryProduct[];
  total?: number;
  [key: string]: unknown;
}

export async function getProducts(): Promise<
  ProductsResponse | InventoryProduct[]
> {
  return request<ProductsResponse | InventoryProduct[]>("/inventory/products");
}

export async function getStockMovements(): Promise<unknown> {
  return request<unknown>("/inventory/movements");
}
