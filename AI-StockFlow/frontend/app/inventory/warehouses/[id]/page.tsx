"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

type Warehouse = {
  id: string;
  name: string;
  code: string;
  location: string;
  manager: string;
  capacity: number;
  used: number;
  products: number;
  status: "Active" | "Inactive";
};

const warehouses: Warehouse[] = [
  {
    id: "main-store",
    name: "Main Store",
    code: "WH-MAIN",
    location: "Hyderabad",
    manager: "Admin User",
    capacity: 10000,
    used: 7200,
    products: 128,
    status: "Active",
  },
  {
    id: "warehouse-a",
    name: "Warehouse A",
    code: "WH-A",
    location: "Vijayawada",
    manager: "Rahul",
    capacity: 8000,
    used: 5100,
    products: 84,
    status: "Active",
  },
  {
    id: "warehouse-b",
    name: "Warehouse B",
    code: "WH-B",
    location: "Visakhapatnam",
    manager: "Priya",
    capacity: 6000,
    used: 2900,
    products: 61,
    status: "Active",
  },
  {
    id: "old-storage",
    name: "Old Storage",
    code: "WH-OLD",
    location: "Guntur",
    manager: "Admin User",
    capacity: 4000,
    used: 0,
    products: 0,
    status: "Inactive",
  },
];

export default function WarehouseDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const warehouseId = String(params.id);

  const warehouse = warehouses.find(
    (item) => item.id === warehouseId
  );

  const [showEdit, setShowEdit] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);

  if (!warehouse) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-6xl">
          <button
            onClick={() => router.push("/inventory/warehouses")}
            className="mb-5 text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Warehouses
          </button>

          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              Warehouse Not Found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              The requested warehouse could not be found.
            </p>

            <button
              onClick={() => router.push("/inventory/warehouses")}
              className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
            >
              Back to Warehouses
            </button>
          </div>
        </div>
      </main>
    );
  }

  const utilization =
    warehouse.capacity > 0
      ? Math.round((warehouse.used / warehouse.capacity) * 100)
      : 0;

  const available = warehouse.capacity - warehouse.used;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/inventory/warehouses")}
            className="mb-3 text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to Warehouses
          </button>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm text-blue-600">
                Inventory / Warehouses / {warehouse.name}
              </p>

              <h1 className="mt-1 text-3xl font-bold text-slate-900">
                {warehouse.name}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage warehouse information, inventory and storage capacity.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEdit(true)}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Edit Warehouse
              </button>

              <button
                onClick={() => setShowAddStock(true)}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                + Add Stock
              </button>
            </div>
          </div>
        </div>

        {/* Warehouse Summary */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard
            label="Warehouse Code"
            value={warehouse.code}
            description="Unique warehouse ID"
          />

          <SummaryCard
            label="Products"
            value={warehouse.products.toLocaleString("en-IN")}
            description="Products stored"
          />

          <SummaryCard
            label="Available Capacity"
            value={available.toLocaleString("en-IN")}
            description="Units available"
          />

          <SummaryCard
            label="Status"
            value={warehouse.status}
            description="Current operational status"
            valueClass={
              warehouse.status === "Active"
                ? "text-green-600"
                : "text-red-500"
            }
          />
        </div>

        {/* Warehouse Information */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Warehouse Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Basic information about this warehouse.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <InfoBox
              label="Warehouse Name"
              value={warehouse.name}
            />

            <InfoBox
              label="Warehouse Code"
              value={warehouse.code}
            />

            <InfoBox
              label="Location"
              value={warehouse.location}
            />

            <InfoBox
              label="Manager"
              value={warehouse.manager}
            />

            <InfoBox
              label="Status"
              value={warehouse.status}
            />

            <InfoBox
              label="Product Count"
              value={`${warehouse.products} products`}
            />
          </div>
        </section>

        {/* Capacity */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Storage Capacity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Current warehouse storage utilization.
              </p>
            </div>

            <span className="text-2xl font-bold text-blue-600">
              {utilization}%
            </span>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm">
              <span className="text-slate-600">
                {warehouse.used.toLocaleString("en-IN")} units used
              </span>

              <span className="text-slate-500">
                {warehouse.capacity.toLocaleString("en-IN")} total
              </span>
            </div>

            <div className="h-4 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${utilization}%` }}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <CapacityCard
                label="Used Capacity"
                value={warehouse.used}
                className="text-blue-600"
              />

              <CapacityCard
                label="Available Capacity"
                value={available}
                className="text-green-600"
              />

              <CapacityCard
                label="Total Capacity"
                value={warehouse.capacity}
                className="text-slate-900"
              />
            </div>
          </div>
        </section>

        {/* Inventory Overview */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Inventory Overview
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Products currently assigned to this warehouse.
              </p>
            </div>

            <button
              onClick={() => router.push("/inventory")}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              View Inventory
            </button>
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                  <th className="px-3 py-3">Product</th>
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3">Stock</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                <InventoryRow
                  product="Hot Wheels Track Set"
                  sku="TOY-HW-002"
                  stock={24}
                  status="Healthy"
                />

                <InventoryRow
                  product="Bluetooth Speaker"
                  sku="ELC-BT-600"
                  stock={8}
                  status="Low Stock"
                />

                <InventoryRow
                  product="Football Size 5"
                  sku="SPT-BL-900"
                  stock={17}
                  status="Healthy"
                />
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent Warehouse Activity
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Latest inventory movements.
          </p>

          <div className="mt-5 space-y-4">
            <Activity
              title="Stock received"
              description="Hot Wheels Track Set - 20 units added"
              time="Today, 10:42 AM"
              type="IN"
            />

            <Activity
              title="Stock transferred"
              description="Bluetooth Speaker - 5 units transferred"
              time="Yesterday, 4:15 PM"
              type="OUT"
            />

            <Activity
              title="Cycle count completed"
              description="Inventory count completed successfully"
              time="22 Aug 2026"
              type="COUNT"
            />
          </div>
        </section>

        {/* Footer Actions */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => router.push("/inventory/warehouses")}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            ← Back to Warehouses
          </button>

          <button
            onClick={() => setShowEdit(true)}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
          >
            Edit Warehouse
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Edit Warehouse
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Update warehouse details.
                </p>
              </div>

              <button
                onClick={() => setShowEdit(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <InputField
                label="Warehouse Name"
                defaultValue={warehouse.name}
              />

              <InputField
                label="Location"
                defaultValue={warehouse.location}
              />

              <InputField
                label="Manager"
                defaultValue={warehouse.manager}
              />

              <InputField
                label="Capacity"
                defaultValue={warehouse.capacity.toString()}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowEdit(false)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowEdit(false);
                  alert("Warehouse updated successfully!");
                }}
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Stock Modal */}
      {showAddStock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Add Stock
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add inventory to {warehouse.name}.
                </p>
              </div>

              <button
                onClick={() => setShowAddStock(false)}
                className="text-xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <InputField
                label="Product"
                defaultValue="Hot Wheels Track Set"
              />

              <InputField
                label="Quantity"
                defaultValue="10"
                type="number"
              />

              <InputField
                label="Reference"
                defaultValue="GRN-2026-001"
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowAddStock(false)}
                className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowAddStock(false);
                  alert("Stock added successfully!");
                }}
                className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white"
              >
                Add Stock
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  label,
  value,
  description,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string;
  description: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function CapacityCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs uppercase text-slate-400">
        {label}
      </p>

      <p className={`mt-2 text-xl font-bold ${className}`}>
        {value.toLocaleString("en-IN")}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        units
      </p>
    </div>
  );
}

function InventoryRow({
  product,
  sku,
  stock,
  status,
}: {
  product: string;
  sku: string;
  stock: number;
  status: "Healthy" | "Low Stock";
}) {
  return (
    <tr className="border-b border-slate-100">
      <td className="px-3 py-4 text-sm font-medium text-slate-900">
        {product}
      </td>

      <td className="px-3 py-4 text-sm text-slate-500">
        {sku}
      </td>

      <td className="px-3 py-4 text-sm font-semibold text-slate-900">
        {stock}
      </td>

      <td className="px-3 py-4">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            status === "Healthy"
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-700"
          }`}
        >
          {status}
        </span>
      </td>

      <td className="px-3 py-4">
        <button className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">
          View
        </button>
      </td>
    </tr>
  );
}

function Activity({
  title,
  description,
  time,
  type,
}: {
  title: string;
  description: string;
  time: string;
  type: "IN" | "OUT" | "COUNT";
}) {
  const badge =
    type === "IN"
      ? "bg-green-100 text-green-700"
      : type === "OUT"
      ? "bg-orange-100 text-orange-700"
      : "bg-blue-100 text-blue-700";

  return (
    <div className="flex items-center gap-4 rounded-lg border border-slate-100 p-4">
      <span
        className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${badge}`}
      >
        {type}
      </span>

      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <p className="text-xs text-slate-400">
        {time}
      </p>
    </div>
  );
}

function InputField({
  label,
  defaultValue,
  type = "text",
}: {
  label: string;
  defaultValue: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
      />
    </div>
  );
}