"use client";

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

  const getReorderLevel = (
    item: ReorderItem
  ) =>
    Number(
      item.reorder_level ??
        item.reorder_point ??
        0
    );

  const getOrderQuantity = (
    item: ReorderItem
  ) =>
    Number(
      item.recommended_order_quantity ??
        item.order_quantity ??
        0
    );

  async function handleDecision(
    item: ReorderItem,
    decision: "approve" | "skip",
    index: number
  ) {
    const id = getId(item, index);

    try {
      setProcessing(id);

      await onDecision?.(
        item,
        decision
      );
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

      {/* Header */}

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
          {items.length === 1
            ? "item"
            : "items"}
        </span>

      </div>

      {/* Items */}

      <div className="divide-y divide-gray-100">

        {items.map(
          (item, index) => {
            const id = getId(
              item,
              index
            );

            const stock =
              getStock(item);

            const reorderLevel =
              getReorderLevel(item);

            const orderQuantity =
              getOrderQuantity(item);

            const isProcessing =
              processing === id;

            return (
              <div
                key={String(id)}
                className="p-4"
              >

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  {/* Product */}

                  <div className="min-w-0">

                    <p className="truncate text-xs font-semibold text-[#12213a]">
                      {getName(item)}
                    </p>

                    <p className="mt-1 text-[9px] text-gray-400">
                      SKU: {getSku(item)}
                    </p>

                  </div>

                  {/* Stats */}

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

                  {/* Actions */}

                  <div className="flex shrink-0 gap-2">

                    <button
                      type="button"
                      disabled={
                        isProcessing
                      }
                      onClick={() =>
                        handleDecision(
                          item,
                          "approve",
                          index
                        )
                      }
                      className="rounded-lg bg-[#12213a] px-3 py-2 text-[10px] font-semibold text-white hover:bg-[#1d3055] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isProcessing
                        ? "Processing..."
                        : "Approve Order"}
                    </button>

                    <button
                      type="button"
                      disabled={
                        isProcessing
                      }
                      onClick={() =>
                        handleDecision(
                          item,
                          "skip",
                          index
                        )
                      }
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[10px] font-semibold text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Skip
                    </button>

                  </div>

                </div>

              </div>
            );
          }
        )}

      </div>
    </div>
  );
}