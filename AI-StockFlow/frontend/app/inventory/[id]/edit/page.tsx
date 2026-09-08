"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = params.id;

  const [productName, setProductName] = useState("Hot Wheels Track Set");
  const [sku, setSku] = useState("TOY-HW-002");
  const [category, setCategory] = useState("Toys");
  const [warehouse, setWarehouse] = useState("Main Store");
  const [description, setDescription] = useState(
    "High-speed Hot Wheels track set with multiple racing configurations."
  );
  const [price, setPrice] = useState("4200");
  const [stock, setStock] = useState("24");

  const handleSave = () => {
    if (!productName || !sku || !category || !warehouse) {
      alert("Please fill in all required fields.");
      return;
    }

    alert(`Product ${productId} updated successfully!`);
    router.push(`/inventory/${productId}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push(`/inventory/${productId}`)}
              className="mb-3 text-sm font-medium text-blue-600 hover:underline"
            >
              ← Back to Product
            </button>

            <p className="text-sm text-blue-600">
              Inventory / Edit Product
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Edit Product
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update product information and inventory details.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/inventory/${productId}`)}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Product Information */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Product Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Basic information about this inventory product.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Product Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Product Name *
              </label>

              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                placeholder="Enter product name"
              />
            </div>

            {/* SKU */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                SKU *
              </label>

              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                placeholder="Enter SKU"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category *
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option>Toys</option>
                <option>Electronics</option>
                <option>Sports</option>
                <option>Home</option>
                <option>Seasonal</option>
              </select>
            </div>

            {/* Warehouse */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Warehouse *
              </label>

              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option>Main Store</option>
                <option>Warehouse A</option>
                <option>Warehouse B</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Unit Price (₹)
              </label>

              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                placeholder="Enter price"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Current Stock
              </label>

              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                placeholder="Enter stock"
              />
            </div>
          </div>

          {/* Description */}
          <div className="mt-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              placeholder="Enter product description"
            />
          </div>
        </section>

        {/* Product Summary */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Product Summary
          </h2>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-400">
                Product ID
              </p>

              <p className="mt-1 font-semibold text-slate-900">
                #{productId}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-400">
                Unit Price
              </p>

              <p className="mt-1 font-semibold text-green-600">
                ₹{Number(price || 0).toLocaleString("en-IN")}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">
              <p className="text-xs uppercase text-slate-400">
                Current Stock
              </p>

              <p className="mt-1 font-semibold text-blue-600">
                {stock} units
              </p>
            </div>
          </div>
        </section>

        {/* Bottom Actions */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => router.push(`/inventory/${productId}`)}
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white hover:bg-green-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </main>
  );
}