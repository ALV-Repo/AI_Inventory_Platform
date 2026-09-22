"use client";

import Link from "next/link";
import { useState } from "react";

export interface ReorderItem {
  id?: number | string;
  product_id?: number | string;
  name?: string;
  product_name?: string;
  sku?: string;
  code?: string;
  current_stock?: number;
  available?: number;
  on_hand?: number;
  reorder_level?: number;
  reorder_point?: number;
  recommended_order_quantity?: number;
  order_quantity?: number;
  reserved_stock?: number;
  demand_forecast?: number;
  supplier_lead_time?: number;
  safety_stock?: number;
  reasoning?: string;
  reason?: string;
  [key: string]: unknown;
}

interface ReorderQueueProps {
  items: ReorderItem[];
  onDecision?: (
    item: ReorderItem,
    decision: "approve" | "skip"
  ) => void | Promise<void>;
}

export default function ReorderQueue({
  items,
  onDecision,
}: ReorderQueueProps) {
  const [processing, setProcessing] =
    useState<string | number | null>(null);

  const [expanded, setExpanded] =
    useState<string | number | null>(null);

  const getId = (item: ReorderItem, index: number) =>
    item.id ??
    item.product_id ??
    item.sku ??
    index;

  const getName = (item: ReorderItem) =>
    item.product_name ??
    item.name ??
    "Unknown Product";

  const getSku = (item: ReorderItem) =>
    item.sku ??
    item.code ??
    "—";

  const getStock = (item: ReorderItem) =>
    Number(
      item.available ??
        item.current_stock ??
        item.on_hand ??
        0
    );

  const getReorderLevel = (item: ReorderItem) =>
    Number(
      item.reorder_level ??
        item.reorder_point ??
        0
    );

  const getOrderQuantity = (item: ReorderItem) =>
    Number(
      item.recommended_order_quantity ??
        item.order_quantity ??
        0
    );

  const getReason = (item: ReorderItem) => {
    if (typeof item.reasoning === "string" && item.reasoning.trim()) {
      return item.reasoning;
    }

    if (typeof item.reason === "string" && item.reason.trim()) {
      return item.reason;
    }

    const stock = getStock(item);
    const reorderLevel = getReorderLevel(item);
    const orderQuantity = getOrderQuantity(item);

    if (stock <= reorderLevel) {
      return `Current stock (${stock}) is at or below the configured reorder level (${reorderLevel}). The recommended order quantity is ${orderQuantity} units.`;
    }

    return `The product has a recommended replenishment quantity of ${orderQuantity} units based on the available reorder recommendation data.`;
  };

  async function handleDecision(
    item: ReorderItem,
    decision: "approve" | "skip",
    index: number
  ) {
    const id = getId(item, index);

    try {
      setProcessing(id);
      await onDecision?.(item, decision);
    } finally {
      setProcessing(null);
    }
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-bold text-[#12213a]">
            Reorder Queue
          </h2>

          <p className="mt-1 text-[10px] text-gray-400">
            Products that may need replenishment.
          </p>
        </div>

        <div className="rounded-lg bg-green-50 px-4 py-6 text-center">
          <p className="text-xs font-semibold text-green-700">
            No reorder suggestions
          </p>

          <p className="mt-1 text-[9px] text-green-600">
            Inventory levels look healthy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-[#12213a]">
            Reorder Queue
          </h2>

          <p className="mt-1 text-[10px] text-gray-400">
            Review products that need replenishment.
          </p>
        </div>

        <span className="rounded-full bg-orange-50 px-3 py-1 text-[9px] font-semibold text-orange-600">
          {items.length}{" "}
          {items.length === 1 ? "item" : "items"}
        </span>
      </div>

      <div className="divide-y divide-gray-100">
        {items.map((item, index) => {
          const id = getId(item, index);
          const stock = getStock(item);
          const reorderLevel = getReorderLevel(item);
          const orderQuantity = getOrderQuantity(item);
          const isProcessing = processing === id;
          const isExpanded = expanded === id;

          return (
            <div key={String(id)} className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#12213a]">
                    {getName(item)}
                  </p>

                  <p className="mt-1 text-[9px] text-gray-400">
                    SKU: {getSku(item)}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-[8px] uppercase tracking-wide text-gray-400">
                      Current
                    </p>

                    <p className="mt-1 text-xs font-bold text-orange-600">
                      {stock}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] uppercase tracking-wide text-gray-400">
                      Reorder At
                    </p>

                    <p className="mt-1 text-xs font-bold text-gray-700">
                      {reorderLevel}
                    </p>
                  </div>

                  <div>
                    <p className="text-[8px] uppercase tracking-wide text-gray-400">
                      Suggested
                    </p>

                    <p className="mt-1 text-xs font-bold text-blue-600">
                      {orderQuantity}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded(isExpanded ? null : id)
                    }
                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    {isExpanded ? "Hide Reasoning" : "Reasoning"}
                  </button>

                  <Link
  href={`/purchase-orders?draft=1&product_id=${encodeURIComponent(
    String(item.product_id ?? item.id ?? "")
  )}&product_name=${encodeURIComponent(
    getName(item)
  )}&sku=${encodeURIComponent(
    getSku(item)
  )}&quantity=${encodeURIComponent(
    String(Math.max(1, getOrderQuantity(item)))
  )}`}
                    className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-[10px] font-semibold text-purple-700 hover:bg-purple-100"
                  >
                    Draft PO
                  </Link>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() =>
                      handleDecision(item, "approve", index)
                    }
                    className="rounded-lg bg-[#12213a] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#1d3055] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing
                      ? "Processing..."
                      : "Approve Order"}
                  </button>

                  <button
                    type="button"
                    disabled={isProcessing}
                    onClick={() =>
                      handleDecision(item, "skip", index)
                    }
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Skip
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-blue-700">
                    AI Recommendation Reasoning
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-700">
                    {getReason(item)}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-md bg-white p-3">
                      <p className="text-[8px] uppercase text-gray-400">
                        Current Stock
                      </p>
                      <p className="mt-1 text-xs font-bold text-gray-700">
                        {stock}
                      </p>
                    </div>

                    <div className="rounded-md bg-white p-3">
                      <p className="text-[8px] uppercase text-gray-400">
                        Reorder Level
                      </p>
                      <p className="mt-1 text-xs font-bold text-gray-700">
                        {reorderLevel}
                      </p>
                    </div>

                    <div className="rounded-md bg-white p-3">
                      <p className="text-[8px] uppercase text-gray-400">
                        Suggested Qty
                      </p>
                      <p className="mt-1 text-xs font-bold text-blue-600">
                        {orderQuantity}
                      </p>
                    </div>

                    <div className="rounded-md bg-white p-3">
                      <p className="text-[8px] uppercase text-gray-400">
                        Reserved Stock
                      </p>
                      <p className="mt-1 text-xs font-bold text-gray-700">
                        {Number(item.reserved_stock ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}