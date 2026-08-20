"use client";

import { useMemo, useState } from "react";

type CountStatus =
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Approved";

type CountItem = {
  id: number;
  product: string;
  sku: string;
  category: string;
  warehouse: string;
  expectedQty: number;
  countedQty: number;
  variance: number;
  status: CountStatus;
  countedBy: string;
  countDate: string;
  notes: string;
};

const initialItems: CountItem[] = [
  {
    id: 1,
    product: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
    category: "Toys",
    warehouse: "Main Store",
    expectedQty: 24,
    countedQty: 24,
    variance: 0,
    status: "Completed",
    countedBy: "Admin User",
    countDate: "20 Aug 2026",
    notes: "",
  },
  {
    id: 2,
    product: "Bluetooth Speaker",
    sku: "ELC-BT-608",
    category: "Electronics",
    warehouse: "Main Store",
    expectedQty: 8,
    countedQty: 7,
    variance: -1,
    status: "Completed",
    countedBy: "Rahul",
    countDate: "19 Aug 2026",
    notes: "One damaged unit found.",
  },
  {
    id: 3,
    product: "Football Size 5",
    sku: "SPT-BL-908",
    category: "Sports",
    warehouse: "Warehouse A",
    expectedQty: 17,
    countedQty: 18,
    variance: 1,
    status: "Approved",
    countedBy: "Priya",
    countDate: "18 Aug 2026",
    notes: "Extra unit found.",
  },
  {
    id: 4,
    product: "Christmas Tree 4ft",
    sku: "SEA-XM-968",
    category: "Seasonal",
    warehouse: "Main Store",
    expectedQty: 81,
    countedQty: 81,
    variance: 0,
    status: "Completed",
    countedBy: "Admin User",
    countDate: "18 Aug 2026",
    notes: "",
  },
  {
    id: 5,
    product: "Fashion Doll Set",
    sku: "TOY-DL-410",
    category: "Toys",
    warehouse: "Warehouse B",
    expectedQty: 56,
    countedQty: 54,
    variance: -2,
    status: "In Progress",
    countedBy: "Sneha",
    countDate: "20 Aug 2026",
    notes: "Two units missing.",
  },
  {
    id: 6,
    product: "Ceramic Planter",
    sku: "HOM-PL-810",
    category: "Home",
    warehouse: "Main Store",
    expectedQty: 53,
    countedQty: 53,
    variance: 0,
    status: "Approved",
    countedBy: "Admin User",
    countDate: "17 Aug 2026",
    notes: "",
  },
  {
    id: 7,
    product: "Wireless Keyboard",
    sku: "ELC-KB-120",
    category: "Electronics",
    warehouse: "Warehouse A",
    expectedQty: 3,
    countedQty: 3,
    variance: 0,
    status: "Pending",
    countedBy: "Not started",
    countDate: "20 Aug 2026",
    notes: "",
  },
  {
    id: 8,
    product: "USB Microphone",
    sku: "ELC-MC-508",
    category: "Electronics",
    warehouse: "Main Store",
    expectedQty: 12,
    countedQty: 11,
    variance: -1,
    status: "Completed",
    countedBy: "Rahul",
    countDate: "20 Aug 2026",
    notes: "",
  },
  {
    id: 9,
    product: "Gaming Mouse",
    sku: "ELC-MS-180",
    category: "Electronics",
    warehouse: "Main Store",
    expectedQty: 20,
    countedQty: 20,
    variance: 0,
    status: "Completed",
    countedBy: "Admin User",
    countDate: "16 Aug 2026",
    notes: "",
  },
];

const warehouses = [
  "Main Store",
  "Warehouse A",
  "Warehouse B",
];

const categories = [
  "Toys",
  "Electronics",
  "Sports",
  "Seasonal",
  "Home",
];

export default function CycleCountPage() {
  /* =========================
     MAIN DATA
  ========================= */

  const [items, setItems] =
    useState<CountItem[]>(initialItems);

  /* =========================
     FILTERS
  ========================= */

  const [search, setSearch] = useState("");

  const [warehouseFilter, setWarehouseFilter] =
    useState("All");

  const [categoryFilter, setCategoryFilter] =
    useState("All");

  const [statusFilter, setStatusFilter] =
    useState<"All" | CountStatus>("All");

  /* =========================
     CREATE MODAL
  ========================= */

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [newWarehouse, setNewWarehouse] =
    useState("Main Store");

  const [newCategory, setNewCategory] =
    useState("Toys");

  const [newProductId, setNewProductId] =
    useState("");

  const [newNotes, setNewNotes] =
    useState("");

  /* =========================
     MANAGE MODAL
  ========================= */

  const [selectedItem, setSelectedItem] =
    useState<CountItem | null>(null);

  const [manageCount, setManageCount] =
    useState(0);

  const [manageStatus, setManageStatus] =
    useState<CountStatus>("In Progress");

  const [manageNotes, setManageNotes] =
    useState("");

  /* =========================
     VARIANCE REPORT
  ========================= */

  const [showVarianceReport, setShowVarianceReport] =
    useState(false);

  /* =========================
     SUMMARY
  ========================= */

  const totalCounts = items.length;

  const pendingCounts = items.filter(
    (item) => item.status === "Pending"
  ).length;

  const inProgressCounts = items.filter(
    (item) => item.status === "In Progress"
  ).length;

  const completedCounts = items.filter(
    (item) =>
      item.status === "Completed" ||
      item.status === "Approved"
  ).length;

  const varianceItems = items.filter(
    (item) => item.variance !== 0
  );

  const positiveVariance = items
    .filter((item) => item.variance > 0)
    .reduce(
      (sum, item) => sum + item.variance,
      0
    );

  const negativeVariance = items
    .filter((item) => item.variance < 0)
    .reduce(
      (sum, item) => sum + Math.abs(item.variance),
      0
    );

  const totalVariance = items.reduce(
    (sum, item) => sum + item.variance,
    0
  );

  /* =========================
     FILTERING
  ========================= */

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        query === "" ||
        item.product
          .toLowerCase()
          .includes(query) ||
        item.sku
          .toLowerCase()
          .includes(query) ||
        item.warehouse
          .toLowerCase()
          .includes(query);

      const matchesWarehouse =
        warehouseFilter === "All" ||
        item.warehouse === warehouseFilter;

      const matchesCategory =
        categoryFilter === "All" ||
        item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesWarehouse &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [
    items,
    search,
    warehouseFilter,
    categoryFilter,
    statusFilter,
  ]);

  /* =========================
     CLEAR FILTERS
  ========================= */

  const clearFilters = () => {
    setSearch("");
    setWarehouseFilter("All");
    setCategoryFilter("All");
    setStatusFilter("All");
  };

  /* =========================
     OPEN MANAGE MODAL
  ========================= */

  const openManageModal = (item: CountItem) => {
    setSelectedItem(item);
    setManageCount(item.countedQty);
    setManageStatus(item.status);
    setManageNotes(item.notes);
  };

  /* =========================
     SAVE MANAGED COUNT
  ========================= */

  const saveManagedCount = () => {
    if (!selectedItem) {
      return;
    }

    const countedQuantity = Math.max(
      0,
      Number(manageCount)
    );

    const variance =
      countedQuantity -
      selectedItem.expectedQty;

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === selectedItem.id
          ? {
              ...item,
              countedQty: countedQuantity,
              variance,
              status: manageStatus,
              notes: manageNotes,
              countedBy: "Admin User",
              countDate: "20 Aug 2026",
            }
          : item
      )
    );

    setSelectedItem(null);

    alert("Cycle count updated successfully.");
  };

  /* =========================
     CREATE COUNT
  ========================= */

  const createCycleCount = () => {
    if (!newProductId) {
      alert("Please select a product.");
      return;
    }

    const product = items.find(
      (item) =>
        String(item.id) === newProductId
    );

    if (!product) {
      alert("Product not found.");
      return;
    }

    const newItem: CountItem = {
      id: Date.now(),
      product: product.product,
      sku: product.sku,
      category: newCategory,
      warehouse: newWarehouse,
      expectedQty: product.expectedQty,
      countedQty: 0,
      variance: -product.expectedQty,
      status: "In Progress",
      countedBy: "Admin User",
      countDate: "20 Aug 2026",
      notes: newNotes,
    };

    setItems((currentItems) => [
      newItem,
      ...currentItems,
    ]);

    setShowCreateModal(false);

    setNewProductId("");
    setNewNotes("");

    alert("Cycle count started successfully.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

                {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>
            <p className="mb-1 text-sm font-medium text-blue-600">
              Inventory / Cycle Count
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              Cycle Count
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Verify physical inventory quantities and review stock variances.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              type="button"
              onClick={() => setShowVarianceReport(true)}
              className="rounded-lg border border-blue-300 bg-white px-5 py-2.5 text-sm font-semibold text-blue-600 hover:bg-blue-50"
            >
              Variance Report
            </button>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg bg-[#12213a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3154]"
            >
              + Start Cycle Count
            </button>

          </div>

        </div>

        {/* SUMMARY CARDS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Total Counts
            </p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {totalCounts}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Count records
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {pendingCounts}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Counts waiting
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              In Progress
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {inProgressCounts}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Currently being counted
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {completedCounts}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Completed counts
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Variance Items
            </p>

            <p className="mt-2 text-3xl font-bold text-red-500">
              {varianceItems.length}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Items with difference
            </p>
          </div>

        </div>

        {/* WORKFLOW */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-5">

            <h2 className="text-lg font-semibold text-gray-900">
              Cycle Count Workflow
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Complete the physical inventory verification process.
            </p>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

            {/* STEP 1 */}

            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                1
              </div>

              <h3 className="font-semibold text-gray-900">
                Select
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Select warehouse and products for counting.
              </p>

              <p className="mt-3 text-xs font-medium text-blue-600">
                Count scope
              </p>

            </div>

            {/* STEP 2 */}

            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                2
              </div>

              <h3 className="font-semibold text-gray-900">
                Count
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Enter the actual physical quantity.
              </p>

              <p className="mt-3 text-xs font-medium text-purple-600">
                Physical verification
              </p>

            </div>

            {/* STEP 3 */}

            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                3
              </div>

              <h3 className="font-semibold text-gray-900">
                Compare
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Compare expected and counted quantities.
              </p>

              <p className="mt-3 text-xs font-medium text-orange-600">
                Variance calculated
              </p>

            </div>

            {/* STEP 4 */}

            <div className="rounded-xl border border-green-200 bg-green-50 p-4">

              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                4
              </div>

              <h3 className="font-semibold text-gray-900">
                Approve
              </h3>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Review variance and approve the result.
              </p>

              <p className="mt-3 text-xs font-medium text-green-600">
                Count completed
              </p>

            </div>

          </div>

        </div>

        {/* VARIANCE SUMMARY */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Positive Variance
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              +{positiveVariance}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Extra physical stock found
            </p>

          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Negative Variance
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              -{negativeVariance}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Missing physical stock
            </p>

          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Net Variance
            </p>

            <p
              className={`mt-2 text-2xl font-bold ${
                totalVariance > 0
                  ? "text-green-600"
                  : totalVariance < 0
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {totalVariance > 0
                ? `+${totalVariance}`
                : totalVariance}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Overall stock difference
            </p>

          </div>

        </div>

        {/* FILTERS */}

        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                Count Records
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Search and filter cycle count records.
              </p>

            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear Filters
            </button>

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

            {/* SEARCH */}

            <div>

              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Product, SKU or warehouse..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />

            </div>

            {/* WAREHOUSE */}

            <div>

              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Warehouse
              </label>

              <select
                value={warehouseFilter}
                onChange={(e) =>
                  setWarehouseFilter(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Warehouses
                </option>

                {warehouses.map((warehouse) => (
                  <option
                    key={warehouse}
                    value={warehouse}
                  >
                    {warehouse}
                  </option>
                ))}

              </select>

            </div>

            {/* CATEGORY */}

            <div>

              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Category
              </label>

              <select
                value={categoryFilter}
                onChange={(e) =>
                  setCategoryFilter(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Categories
                </option>

                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}

              </select>

            </div>

            {/* STATUS */}

            <div>

              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as
                      | "All"
                      | CountStatus
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >

                <option value="All">
                  All Statuses
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="In Progress">
                  In Progress
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Approved">
                  Approved
                </option>

              </select>

            </div>

          </div>

        </div>

        {/* TABLE */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="font-semibold text-gray-900">
                Cycle Count List
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Showing {filteredItems.length} of{" "}
                {items.length} records
              </p>

            </div>

            <span className="w-fit rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              {varianceItems.length} variance items
            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1150px] text-left">

              <thead className="border-b border-gray-200 bg-gray-50">

                <tr>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Warehouse
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Expected
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Counted
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Variance
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Counted By
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredItems.length === 0 ? (

                  <tr>

                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-sm text-gray-500"
                    >
                      No cycle count records found.
                    </td>

                  </tr>

                ) : (

                  filteredItems.map((item) => (

                    <tr
                      key={item.id}
                      className="transition hover:bg-gray-50"
                    >

                      <td className="px-5 py-4">

                        <div className="font-semibold text-gray-900">
                          {item.product}
                        </div>

                        <div className="mt-1 font-mono text-xs text-gray-400">
                          {item.sku}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {item.category}
                        </div>

                      </td>

                      <td className="px-5 py-4 text-sm text-gray-700">
                        {item.warehouse}
                      </td>

                      <td className="px-5 py-4">

                        <span className="font-semibold text-gray-900">
                          {item.expectedQty}
                        </span>

                        <span className="ml-1 text-xs text-gray-400">
                          units
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <span className="font-semibold text-gray-900">
                          {item.countedQty}
                        </span>

                        <span className="ml-1 text-xs text-gray-400">
                          units
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        {item.variance === 0 ? (

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            0
                          </span>

                        ) : item.variance > 0 ? (

                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                            +{item.variance}
                          </span>

                        ) : (

                          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                            {item.variance}
                          </span>

                        )}

                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === "Pending"
                              ? "bg-orange-100 text-orange-700"
                              : item.status === "In Progress"
                              ? "bg-blue-100 text-blue-700"
                              : item.status === "Completed"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {item.status}
                        </span>

                      </td>

                      <td className="px-5 py-4">

                        <div className="text-sm text-gray-700">
                          {item.countedBy}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {item.countDate}
                        </div>

                      </td>

                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            openManageModal(item)
                          }
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Manage
                        </button>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

        {/* CREATE CYCLE COUNT MODAL */}

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Start Cycle Count
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Select the warehouse and product to begin counting.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                  ✕
                </button>

              </div>

              <div className="space-y-5 px-6 py-6">

                {/* WAREHOUSE */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Warehouse
                  </label>

                  <select
                    value={newWarehouse}
                    onChange={(e) =>
                      setNewWarehouse(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >

                    <option value="">
                      Select warehouse
                    </option>

                    {warehouses.map((warehouse) => (
                      <option
                        key={warehouse}
                        value={warehouse}
                      >
                        {warehouse}
                      </option>
                    ))}

                  </select>

                </div>

                {/* CATEGORY */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Category
                  </label>

                  <select
                    value={newCategory}
                    onChange={(e) =>
                      setNewCategory(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >

                    <option value="">
                      Select category
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    ))}

                  </select>

                </div>

                {/* PRODUCT */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product
                  </label>

                  <select
  value={newProductId}
  onChange={(e) => setNewProductId(e.target.value)}
  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
>
  <option value="">
    Select product
  </option>

  {items
    .filter((item) => {
      if (!newCategory) {
        return true;
      }

      return item.category === newCategory;
    })
    .map((item) => (
      <option
        key={item.id}
        value={String(item.id)}
      >
        {item.product} — {item.sku}
      </option>
    ))}
</select>

                </div>

                {/* NOTES */}

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Notes
                  </label>

                  <textarea
                    value={newNotes}
                    onChange={(e) =>
                      setNewNotes(e.target.value)
                    }
                    rows={4}
                    placeholder="Add any instructions or notes..."
                    className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />

                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={createCycleCount}
                  className="rounded-lg bg-[#12213a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3154]"
                >
                  Start Count
                </button>

              </div>

            </div>

          </div>
        )}

        {/* MANAGE COUNT MODAL */}

{selectedItem && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
    <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Manage Cycle Count
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Review and update the selected count.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSelectedItem(null)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"
        >
          ✕
        </button>
      </div>

      <div className="space-y-5 px-6 py-6">

        {/* PRODUCT */}

        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Product
          </p>

          <p className="mt-1 font-semibold text-gray-900">
            {selectedItem.product}
          </p>

          <p className="mt-1 font-mono text-xs text-gray-400">
            {selectedItem.sku}
          </p>
        </div>

        {/* STOCK INFORMATION */}

        <div className="grid grid-cols-3 gap-3">

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-400">
              Expected
            </p>

            <p className="mt-1 text-xl font-bold text-gray-900">
              {selectedItem.expectedQty}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-400">
              Counted
            </p>

            <p className="mt-1 text-xl font-bold text-blue-600">
              {manageCount}
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-xs text-gray-400">
              Variance
            </p>

            <p
              className={`mt-1 text-xl font-bold ${
                manageCount - selectedItem.expectedQty > 0
                  ? "text-green-600"
                  : manageCount - selectedItem.expectedQty < 0
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {manageCount - selectedItem.expectedQty > 0
                ? `+${manageCount - selectedItem.expectedQty}`
                : manageCount - selectedItem.expectedQty}
            </p>
          </div>

        </div>

        {/* COUNTED QUANTITY */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Actual Counted Quantity
          </label>

          <input
            type="number"
            min="0"
            value={manageCount}
            onChange={(e) =>
              setManageCount(Math.max(0, Number(e.target.value)))
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

        {/* STATUS */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Status
          </label>

          <select
            value={manageStatus}
            onChange={(e) =>
              setManageStatus(e.target.value as CountStatus)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="Pending">
              Pending
            </option>

            <option value="In Progress">
              In Progress
            </option>

            <option value="Completed">
              Completed
            </option>

            <option value="Approved">
              Approved
            </option>
          </select>
        </div>

        {/* NOTES */}

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Notes
          </label>

          <textarea
            value={manageNotes}
            onChange={(e) => setManageNotes(e.target.value)}
            rows={3}
            placeholder="Add notes..."
            className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          />
        </div>

      </div>

      <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

        <button
          type="button"
          onClick={() => setSelectedItem(null)}
          className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={saveManagedCount}
          className="rounded-lg bg-[#12213a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3154]"
        >
          Save Count
        </button>

      </div>

    </div>
  </div>
)}

                {/* VARIANCE REPORT */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-4">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Variance Report
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Review products with stock differences after counting.
                </p>
              </div>

              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                {items.filter((item) => item.variance !== 0).length} Variances
              </span>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="border-b border-gray-200 bg-gray-50">

                <tr>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Product
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    SKU
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Expected
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Counted
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Variance
                  </th>

                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-gray-100">

                {items
                  .filter((item) => item.variance !== 0)
                  .map((item) => (

                    <tr
                      key={item.id}
                      className="hover:bg-gray-50"
                    >

                      <td className="px-6 py-4">

                        <p className="font-medium text-gray-900">
                          {item.product}
                        </p>

                      </td>

                      <td className="px-6 py-4">

                        <span className="font-mono text-xs text-gray-500">
                          {item.sku}
                        </span>

                      </td>

                      <td className="px-6 py-4 text-sm text-gray-700">
                        {item.expectedQty}
                      </td>

                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.countedQty}
                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`font-semibold ${
                            item.variance > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {item.variance > 0
                            ? `+${item.variance}`
                            : item.variance}
                        </span>

                      </td>

                      <td className="px-6 py-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            item.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : item.status === "Approved"
                              ? "bg-blue-100 text-blue-700"
                              : item.status === "In Progress"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {item.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                {items.filter((item) => item.variance !== 0).length === 0 && (

                  <tr>

                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center"
                    >

                      <div className="text-3xl">
                        ✓
                      </div>

                      <p className="mt-2 font-medium text-gray-900">
                        No Variances
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        All counted quantities match the expected stock.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

                </div>

      </div>

    </div>
  );
}