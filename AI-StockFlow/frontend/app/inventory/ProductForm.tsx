"use client";

import { useState } from "react";

interface ProductFormProps {
  onClose: () => void;
  onSave: (product: {
    name: string;
    sku: string;
    category: string;
    warehouse: string;
    quantity: number;
    reorderPoint: number;
  }) => void;
}

export default function ProductForm({
  onClose,
  onSave,
}: ProductFormProps) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [warehouse, setWarehouse] = useState("Main Store");
  const [quantity, setQuantity] = useState("");
  const [reorderPoint, setReorderPoint] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !sku || !quantity || !reorderPoint) {
      return;
    }

    onSave({
      name,
      sku,
      category,
      warehouse,
      quantity: Number(quantity),
      reorderPoint: Number(reorderPoint),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Add Product
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Add a new product to your inventory
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-slate-400 hover:text-slate-700"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">

          {/* Product Name */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Product Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* SKU */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              SKU
            </label>

            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="e.g. ELE-KB-120"
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>Electronics</option>
              <option>Toys</option>
              <option>Sports</option>
              <option>Home</option>
              <option>Seasonal</option>
              <option>Other</option>
            </select>
          </div>

          {/* Warehouse */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Warehouse
            </label>

            <select
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              <option>Main Store</option>
              <option>Warehouse A</option>
              <option>Warehouse B</option>
            </select>
          </div>

          {/* Quantity + Reorder Point */}
          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Initial Quantity
              </label>

              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                Reorder Point
              </label>

              <input
                type="number"
                min="0"
                value={reorderPoint}
                onChange={(e) => setReorderPoint(e.target.value)}
                placeholder="10"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 border-t pt-5">

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Add Product
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}