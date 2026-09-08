"use client";

import { useMemo, useState } from "react";

type AdjustmentType = "Increase" | "Decrease";

type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  warehouse: string;
  currentStock: number;
  unitPrice: number;
};

type AdjustmentRecord = {
  id: number;
  product: string;
  sku: string;
  warehouse: string;
  type: AdjustmentType;
  quantity: number;
  reason: string;
  date: string;
  status: "Completed" | "Pending";
  user: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
    category: "Toys",
    warehouse: "Main Store",
    currentStock: 24,
    unitPrice: 4200,
  },
  {
    id: 2,
    name: "Bluetooth Speaker",
    sku: "ELC-BT-608",
    category: "Electronics",
    warehouse: "Main Store",
    currentStock: 8,
    unitPrice: 2800,
  },
  {
    id: 3,
    name: "Football Size 5",
    sku: "SPT-BL-908",
    category: "Sports",
    warehouse: "Warehouse A",
    currentStock: 17,
    unitPrice: 1500,
  },
  {
    id: 4,
    name: "Christmas Tree 4ft",
    sku: "SEA-XM-968",
    category: "Seasonal",
    warehouse: "Main Store",
    currentStock: 81,
    unitPrice: 3500,
  },
  {
    id: 5,
    name: "Fashion Doll Set",
    sku: "TOY-DL-410",
    category: "Toys",
    warehouse: "Warehouse B",
    currentStock: 56,
    unitPrice: 2200,
  },
  {
    id: 6,
    name: "Ceramic Planter",
    sku: "HOM-PL-810",
    category: "Home",
    warehouse: "Main Store",
    currentStock: 53,
    unitPrice: 1800,
  },
  {
    id: 7,
    name: "Wireless Keyboard",
    sku: "ELC-KB-138",
    category: "Electronics",
    warehouse: "Warehouse A",
    currentStock: 3,
    unitPrice: 3200,
  },
  {
    id: 8,
    name: "USB Microphone",
    sku: "ELC-MC-508",
    category: "Electronics",
    warehouse: "Main Store",
    currentStock: 12,
    unitPrice: 4500,
  },
];

const initialAdjustments: AdjustmentRecord[] = [
  {
    id: 1,
    product: "Bluetooth Speaker",
    sku: "ELC-BT-608",
    warehouse: "Main Store",
    type: "Decrease",
    quantity: 2,
    reason: "Damaged units",
    date: "20 Aug 2026",
    status: "Completed",
    user: "Rahul",
  },
  {
    id: 2,
    product: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
    warehouse: "Main Store",
    type: "Increase",
    quantity: 5,
    reason: "Stock received",
    date: "19 Aug 2026",
    status: "Completed",
    user: "Admin User",
  },
  {
    id: 3,
    product: "USB Microphone",
    sku: "ELC-MC-508",
    warehouse: "Main Store",
    type: "Decrease",
    quantity: 1,
    reason: "Missing stock",
    date: "18 Aug 2026",
    status: "Completed",
    user: "Rahul",
  },
  {
    id: 4,
    product: "Football Size 5",
    sku: "SPT-BL-908",
    warehouse: "Warehouse A",
    type: "Increase",
    quantity: 3,
    reason: "Physical count",
    date: "17 Aug 2026",
    status: "Pending",
    user: "Priya",
  },
];

export default function StockAdjustmentPage() {
  const [selectedProductId, setSelectedProductId] = useState<number>(1);
  const [adjustmentType, setAdjustmentType] =
    useState<AdjustmentType>("Increase");

  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");

  const [search, setSearch] = useState<string>("");
  const [warehouseFilter, setWarehouseFilter] =
    useState<string>("All Warehouses");
  const [typeFilter, setTypeFilter] =
    useState<string>("All Types");

  const [adjustments, setAdjustments] =
  useState<AdjustmentRecord[]>(initialAdjustments);

const [stockLevels, setStockLevels] = useState<Record<number, number>>({});

const [message, setMessage] = useState<string>("");

  const selectedProduct = useMemo(() => {
  const product =
    products.find((product) => product.id === selectedProductId) ??
    products[0];

  return {
    ...product,
    currentStock: stockLevels[product.id] ?? product.currentStock,
  };
}, [selectedProductId, stockLevels]);

  const filteredAdjustments = useMemo(() => {
    return adjustments.filter((item) => {
      const matchesSearch =
        item.product.toLowerCase().includes(search.toLowerCase()) ||
        item.sku.toLowerCase().includes(search.toLowerCase());

      const matchesWarehouse =
        warehouseFilter === "All Warehouses" ||
        item.warehouse === warehouseFilter;

      const matchesType =
        typeFilter === "All Types" || item.type === typeFilter;

      return matchesSearch && matchesWarehouse && matchesType;
    });
  }, [adjustments, search, warehouseFilter, typeFilter]);

  const totalAdjustments = adjustments.length;

  const increaseCount = adjustments.filter(
    (item) => item.type === "Increase"
  ).length;

  const decreaseCount = adjustments.filter(
    (item) => item.type === "Decrease"
  ).length;

  const pendingCount = adjustments.filter(
    (item) => item.status === "Pending"
  ).length;

  const newStock =
    adjustmentType === "Increase"
      ? selectedProduct.currentStock + quantity
      : Math.max(0, selectedProduct.currentStock - quantity);
        const handleAdjustment = () => {
    if (!reason.trim()) {
      setMessage("Please enter a reason for the adjustment.");
      return;
    }

    if (quantity <= 0) {
      setMessage("Quantity must be greater than 0.");
      return;
    }

    if (
      adjustmentType === "Decrease" &&
      quantity > selectedProduct.currentStock
    ) {
      setMessage("Decrease quantity cannot be greater than current stock.");
      return;
    }

    const updatedStock =
  adjustmentType === "Increase"
    ? selectedProduct.currentStock + quantity
    : selectedProduct.currentStock - quantity;

setStockLevels((previous) => ({
  ...previous,
  [selectedProduct.id]: updatedStock,
}));

    const newRecord: AdjustmentRecord = {
      id: adjustments.length + 1,
      product: selectedProduct.name,
      sku: selectedProduct.sku,
      warehouse: selectedProduct.warehouse,
      type: adjustmentType,
      quantity,
      reason,
      date: "20 Aug 2026",
      status: "Completed",
      user: "Admin User",
    };

    setAdjustments((previous) => [newRecord, ...previous]);

    setMessage(
      `${adjustmentType} adjustment of ${quantity} units completed successfully.`
    );

    setQuantity(1);
    setReason("");
  };

  const clearFilters = () => {
    setSearch("");
    setWarehouseFilter("All Warehouses");
    setTypeFilter("All Types");
  };

  return (
    <main className="min-h-screen bg-[#f5f7fa] px-6 py-8 text-[#12213a]">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-600">
              Inventory / Stock Adjustment
            </p>

            <h1 className="mt-1 text-3xl font-bold">
              Stock Adjustment
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Increase or decrease inventory stock with a complete adjustment
              history.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              document
                .getElementById("adjustment-form")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="rounded-lg bg-[#12213a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c3154]"
          >
            + New Adjustment
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Total Adjustments
            </p>

            <p className="mt-2 text-3xl font-bold text-[#12213a]">
              {totalAdjustments}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              All inventory adjustments
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Stock Increased
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {increaseCount}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Positive adjustments
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Stock Decreased
            </p>

            <p className="mt-2 text-3xl font-bold text-red-500">
              {decreaseCount}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Negative adjustments
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Pending Approval
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {pendingCount}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Waiting for approval
            </p>
          </div>
        </div>

        {/* ADJUSTMENT WORKFLOW */}
        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold">
              Adjustment Workflow
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Follow the standard process for changing inventory quantities.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                1
              </div>

              <h3 className="font-semibold">Select Product</h3>

              <p className="mt-1 text-xs text-gray-500">
                Choose the product and warehouse.
              </p>
            </div>

            <div className="rounded-xl border border-purple-200 bg-purple-50 p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-600">
                2
              </div>

              <h3 className="font-semibold">Choose Action</h3>

              <p className="mt-1 text-xs text-gray-500">
                Increase or decrease available stock.
              </p>
            </div>

            <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-600">
                3
              </div>

              <h3 className="font-semibold">Enter Quantity</h3>

              <p className="mt-1 text-xs text-gray-500">
                Enter the quantity and adjustment reason.
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 p-5">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-green-100 font-bold text-green-600">
                4
              </div>

              <h3 className="font-semibold">Complete</h3>

              <p className="mt-1 text-xs text-gray-500">
                Save the adjustment in inventory history.
              </p>
            </div>
          </div>
        </section>

        {/* ADJUSTMENT FORM */}
        <section
          id="adjustment-form"
          className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold">
              Create Stock Adjustment
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update inventory stock for a selected product.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* PRODUCT */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Product
              </label>

              <select
                value={selectedProductId}
                onChange={(event) =>
                  setSelectedProductId(Number(event.target.value))
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} — {product.sku}
                  </option>
                ))}
              </select>
            </div>

            {/* WAREHOUSE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Warehouse
              </label>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium">
                {selectedProduct.warehouse}
              </div>
            </div>

            {/* CURRENT STOCK */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Current Stock
              </label>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-2xl font-bold text-green-600">
                {selectedProduct.currentStock} units
              </div>
            </div>

            {/* UNIT PRICE */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Unit Price
              </label>

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold">
                ₹{selectedProduct.unitPrice.toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* TYPE */}
          <div className="mt-6">
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Adjustment Type
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setAdjustmentType("Increase")}
                className={`rounded-xl border p-5 text-left transition ${
                  adjustmentType === "Increase"
                    ? "border-green-400 bg-green-50"
                    : "border-gray-200 bg-white hover:border-green-300"
                }`}
              >
                <div className="text-lg font-semibold text-green-600">
                  + Increase Stock
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Add units to the current inventory.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAdjustmentType("Decrease")}
                className={`rounded-xl border p-5 text-left transition ${
                  adjustmentType === "Decrease"
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200 bg-white hover:border-red-300"
                }`}
              >
                <div className="text-lg font-semibold text-red-500">
                  − Decrease Stock
                </div>

                <p className="mt-1 text-xs text-gray-500">
                  Remove units from the current inventory.
                </p>
              </button>
            </div>
          </div>

          {/* QUANTITY + REASON */}
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(Number(event.target.value))
                }
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Reason
              </label>

              <input
                type="text"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Example: Damaged units"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* PREVIEW */}
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
              Stock Preview
            </p>

            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  {selectedProduct.name}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {selectedProduct.sku}
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-xs text-gray-500">
                  {selectedProduct.currentStock} → {newStock} units
                </p>

                <p
                  className={`mt-1 text-lg font-bold ${
                    adjustmentType === "Increase"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {adjustmentType === "Increase" ? "+" : "-"}
                  {quantity} units
                </p>
              </div>
            </div>
          </div>

          {/* MESSAGE */}
          {message && (
            <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {message}
            </div>
          )}

          {/* BUTTON */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleAdjustment}
              className={`rounded-lg px-6 py-3 text-sm font-semibold text-white ${
                adjustmentType === "Increase"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {adjustmentType === "Increase"
                ? "Increase Stock"
                : "Decrease Stock"}
            </button>
          </div>
        </section>

                {/* FILTERS */}
        <section className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Adjustment History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Search and review previous inventory adjustments.
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* SEARCH */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Product or SKU..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            {/* WAREHOUSE */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Warehouse
              </label>

              <select
                value={warehouseFilter}
                onChange={(event) =>
                  setWarehouseFilter(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option>All Warehouses</option>
                <option>Main Store</option>
                <option>Warehouse A</option>
                <option>Warehouse B</option>
              </select>
            </div>

            {/* TYPE */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Adjustment Type
              </label>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option>All Types</option>
                <option>Increase</option>
                <option>Decrease</option>
              </select>
            </div>
          </div>
        </section>

        {/* HISTORY TABLE */}
        <section className="mb-8 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  Adjustment List
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Showing {filteredAdjustments.length} of{" "}
                  {adjustments.length} adjustments
                </p>
              </div>

              <div className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                {filteredAdjustments.length} Records
              </div>
            </div>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Warehouse
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Reason
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                    User
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAdjustments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      No adjustment records found.
                    </td>
                  </tr>
                ) : (
                  filteredAdjustments.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                    >
                      {/* PRODUCT */}
                      <td className="px-6 py-5">
                        <div>
                          <p className="text-sm font-semibold text-[#12213a]">
                            {item.product}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {item.sku}
                          </p>
                        </div>
                      </td>

                      {/* WAREHOUSE */}
                      <td className="px-6 py-5 text-sm text-gray-600">
                        {item.warehouse}
                      </td>

                      {/* TYPE */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.type === "Increase"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>

                      {/* QUANTITY */}
                      <td className="px-6 py-5">
                        <span
                          className={`text-sm font-bold ${
                            item.type === "Increase"
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {item.type === "Increase" ? "+" : "-"}
                          {item.quantity}
                        </span>
                      </td>

                      {/* REASON */}
                      <td className="max-w-[180px] px-6 py-5 text-sm text-gray-600">
                        {item.reason}
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {item.date}
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === "Completed"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* USER */}
                      <td className="px-6 py-5 text-sm font-medium text-gray-700">
                        {item.user}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="divide-y divide-gray-100 md:hidden">
            {filteredAdjustments.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-gray-500">
                No adjustment records found.
              </div>
            ) : (
              filteredAdjustments.map((item) => (
                <div key={item.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#12213a]">
                        {item.product}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {item.sku}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.type === "Increase"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.type}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">
                        Warehouse
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {item.warehouse}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Quantity
                      </p>

                      <p
                        className={`mt-1 text-sm font-bold ${
                          item.type === "Increase"
                            ? "text-green-600"
                            : "text-red-500"
                        }`}
                      >
                        {item.type === "Increase" ? "+" : "-"}
                        {item.quantity}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Reason
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {item.reason}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-medium">
                        {item.date}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Completed"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {item.status}
                    </span>

                    <span className="text-xs text-gray-500">
                      {item.user}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
                {/* FOOTER */}

        <div className="border-t border-gray-200 py-8 text-center">
          <p className="text-xs text-gray-400">
            AI StockFlow • Stock Adjustment Management
          </p>
        </div>

      </div>
    </main>
  );
}