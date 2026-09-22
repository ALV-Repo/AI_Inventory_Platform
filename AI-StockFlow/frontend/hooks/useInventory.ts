"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { request } from "../services/api";

export interface InventoryProduct {
  id: number;
  sku?: string;
  code?: string;
  name?: string;
  product_name?: string;

  category?: string;
  category_name?: string;

  warehouse?: string;
  warehouse_name?: string;

  on_hand?: number;
  reserved?: number;
  available?: number;

  quantity?: number;
  current_stock?: number;

  reorder_level?: number;
  reorder_point?: number;

  unit_cost?: number;
  purchase_price?: number;
  selling_price?: number;

  status?: string;

  [key: string]: unknown;
}

interface UseInventoryResult {
  products: InventoryProduct[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function normalizeProducts(
  data: unknown
): InventoryProduct[] {
  if (Array.isArray(data)) {
    return data as InventoryProduct[];
  }

  if (
    typeof data === "object" &&
    data !== null
  ) {
    const response = data as {
      data?: unknown;
      items?: unknown;
      products?: unknown;
      results?: unknown;
    };

    if (Array.isArray(response.data)) {
      return response.data as InventoryProduct[];
    }

    if (Array.isArray(response.items)) {
      return response.items as InventoryProduct[];
    }

    if (
      Array.isArray(
        response.products
      )
    ) {
      return response.products as InventoryProduct[];
    }

    if (
      Array.isArray(
        response.results
      )
    ) {
      return response.results as InventoryProduct[];
    }
  }

  return [];
}

async function fetchInventory(): Promise<
  InventoryProduct[]
> {
  const data = await request<unknown>(
    "/inventory/products"
  );

  return normalizeProducts(data);
}

export function useInventory(): UseInventoryResult {
  const [products, setProducts] =
    useState<InventoryProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const loadInventory =
    useCallback(async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await fetchInventory();

        setProducts(data);
      } catch (err) {
        setProducts([]);

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load inventory data."
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  return {
    products,
    loading,
    error,
    refresh: loadInventory,
  };
}

export default useInventory;