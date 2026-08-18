"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";

type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  brand: string;
  warehouse: string;
  stock: number;
  reserved: number;
  reorderLevel: number;
  purchasePrice: number;
  sellingPrice: number;
  status: "In stock" | "Low stock" | "Out of stock";
};

const products: Product[] = [
  {
    id: 1,
    name: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
    category: "Toys",
    brand: "Hot Wheels",
    warehouse: "Main Store",
    stock: 1,
    reserved: 0,
    reorderLevel: 43,
    purchasePrice: 720,
    sellingPrice: 999,
    status: "Low stock",
  },
  {
    id: 2,
    name: "Bluetooth Speaker",
    sku: "ELC-BT-600",
    category: "Electronics",
    brand: "SoundMax",
    warehouse: "Main Store",
    stock: 2,
    reserved: 0,
    reorderLevel: 22,
    purchasePrice: 850,
    sellingPrice: 1299,
    status: "Low stock",
  },
  {
    id: 3,
    name: "Football Size 5",
    sku: "SPT-BL-900",
    category: "Sports",
    brand: "Vector",
    warehouse: "Main Store",
    stock: 4,
    reserved: 1,
    reorderLevel: 13,
    purchasePrice: 650,
    sellingPrice: 899,
    status: "Low stock",
  },
  {
    id: 4,
    name: "Christmas Tree 4ft",
    sku: "SEA-XM-960",
    category: "Seasonal",
    brand: "Festiva",
    warehouse: "Warehouse A",
    stock: 81,
    reserved: 0,
    reorderLevel: 10,
    purchasePrice: 1250,
    sellingPrice: 1899,
    status: "In stock",
  },
  {
    id: 5,
    name: "Fashion Doll Set",
    sku: "TOY-DL-410",
    category: "Toys",
    brand: "DreamPlay",
    warehouse: "Warehouse A",
    stock: 56,
    reserved: 2,
    reorderLevel: 15,
    purchasePrice: 380,
    sellingPrice: 699,
    status: "In stock",
  },
  {
    id: 6,
    name: "Ceramic Planter",
    sku: "HOM-PL-810",
    category: "Home",
    brand: "UrbanHome",
    warehouse: "Main Store",
    stock: 53,
    reserved: 4,
    reorderLevel: 12,
    purchasePrice: 260,
    sellingPrice: 499,
    status: "In stock",
  },
  {
    id: 7,
    name: "Wireless Keyboard",
    sku: "ELC-KB-220",
    category: "Electronics",
    brand: "KeyPro",
    warehouse: "Main Store",
    stock: 32,
    reserved: 5,
    reorderLevel: 10,
    purchasePrice: 900,
    sellingPrice: 1499,
    status: "In stock",
  },
  {
    id: 8,
    name: "USB-C Fast Charger",
    sku: "ELC-CH-450",
    category: "Electronics",
    brand: "PowerMax",
    warehouse: "Warehouse B",
    stock: 8,
    reserved: 2,
    reorderLevel: 12,
    purchasePrice: 420,
    sellingPrice: 799,
    status: "Low stock",
  },
  {
    id: 9,
    name: "Running Shoes",
    sku: "FAS-RS-120",
    category: "Fashion",
    brand: "Sprint",
    warehouse: "Warehouse B",
    stock: 0,
    reserved: 0,
    reorderLevel: 8,
    purchasePrice: 1500,
    sellingPrice: 2499,
    status: "Out of stock",
  },
  {
    id: 10,
    name: "Office Backpack",
    sku: "BAG-OF-320",
    category: "Bags",
    brand: "UrbanCarry",
    warehouse: "Main Store",
    stock: 19,
    reserved: 3,
    reorderLevel: 8,
    purchasePrice: 800,
    sellingPrice: 1399,
    status: "In stock",
  },
];

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function StatusBadge({
  status,
}: {
  status: Product["status"];
}) {
  if (status === "In stock") {
    return (
      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-semibold text-emerald-700">
        In stock
      </span>
    );
  }

  if (status === "Low stock") {
    return (
      <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[9px] font-semibold text-orange-600">
        Low stock
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-full bg-red-50 px-2.5 py-1 text-[9px] font-semibold text-red-600">
      Out of stock
    </span>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  warning,
}: {
  title: string;
  value: string;
  subtitle: string;
  warning?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border bg-white p-4 shadow-sm ${
        warning
          ? "border-l-2 border-l-orange-400"
          : "border-gray-200"
      }`}
    >
      <div className="text-[9px] font-semibold tracking-wide text-gray-500">
        {title}
      </div>

      <div
        className={`mt-2 text-xl font-bold ${
          warning ? "text-orange-500" : "text-[#172a43]"
        }`}
      >
        {value}
      </div>

      <div className="mt-1 text-[9px] text-gray-500">
        {subtitle}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [warehouse, setWarehouse] = useState("All warehouses");
  const [status, setStatus] = useState("All status");
  const [showModal, setShowModal] = useState(false);

  const categories = [
    "All categories",
    "Toys",
    "Electronics",
    "Sports",
    "Seasonal",
    "Home",
    "Fashion",
    "Bags",
  ];

  const warehouses = [
    "All warehouses",
    "Main Store",
    "Warehouse A",
    "Warehouse B",
  ];

  const statuses = [
    "All status",
    "In stock",
    "Low stock",
    "Out of stock",
  ];

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.sku
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.brand
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All categories" ||
        product.category === category;

      const matchesWarehouse =
        warehouse === "All warehouses" ||
        product.warehouse === warehouse;

      const matchesStatus =
        status === "All status" ||
        product.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWarehouse &&
        matchesStatus
      );
    });
  }, [search, category, warehouse, status]);

  const totalStock = products.reduce(
    (sum, product) => sum + product.stock,
    0
  );

  const totalReserved = products.reduce(
    (sum, product) => sum + product.reserved,
    0
  );

  const inventoryValue = products.reduce(
    (sum, product) =>
      sum + product.stock * product.purchasePrice,
    0
  );

  const lowStockCount = products.filter(
    (product) =>
      product.status === "Low stock" ||
      product.status === "Out of stock"
  ).length;

  return (
    <div className="min-h-screen bg-[#f4f6f9] text-[#172a43]">

      <Sidebar />

      <main className="ml-44 min-h-screen">
        <div className="mx-auto max-w-[1150px] px-5 py-5">

          {/* HEADER */}
          <header className="mb-5 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold">
                Inventory
              </h1>

              <p className="mt-1 text-[10px] text-gray-500">
                Manage products, stock levels and inventory
                valuation
              </p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="rounded-md bg-[#11233f] px-4 py-2 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#1c3658]"
            >
              + Add product
            </button>
          </header>

          {/* STAT CARDS */}
          <section className="grid grid-cols-4 gap-3">

            <StatCard
              title="TOTAL PRODUCTS"
              value={products.length.toString()}
              subtitle="Active SKUs"
            />

            <StatCard
              title="TOTAL STOCK"
              value={totalStock.toLocaleString("en-IN")}
              subtitle={`${totalReserved} units reserved`}
            />

            <StatCard
              title="INVENTORY VALUE"
              value={formatCurrency(inventoryValue)}
              subtitle="At purchase cost"
            />

            <StatCard
              title="LOW STOCK"
              value={lowStockCount.toString()}
              subtitle="Products need attention"
              warning
            />

          </section>

          {/* INVENTORY TABLE */}
          <section className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">

            {/* TABLE HEADER */}
            <div className="border-b border-gray-200 px-4 py-4">
              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-[12px] font-semibold">
                    Product inventory
                  </h2>

                  <p className="mt-1 text-[9px] text-gray-500">
                    Track stock across your stores and
                    warehouses
                  </p>
                </div>

                <span className="rounded border border-dashed border-blue-500 px-2 py-1 text-[8px] font-semibold text-blue-600">
                  INVENTORY
                </span>

              </div>

              {/* FILTERS */}
              <div className="mt-4 flex gap-2">

                <div className="relative flex-1">
                  <input
                    value={search}
                    onChange={(e) =>
                      setSearch(e.target.value)
                    }
                    placeholder="Search product, SKU or brand..."
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-[9px] outline-none transition focus:border-blue-400 focus:bg-white"
                  />
                </div>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[9px] outline-none"
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

                <select
                  value={warehouse}
                  onChange={(e) =>
                    setWarehouse(e.target.value)
                  }
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[9px] outline-none"
                >
                  {warehouses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="rounded-md border border-gray-200 bg-white px-3 py-2 text-[9px] outline-none"
                >
                  {statuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

              </div>
            </div>

            {/* TABLE */}
            <div className="overflow-x-auto">

              <table className="w-full min-w-[950px] border-collapse">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left text-[8px] font-semibold uppercase tracking-wide text-gray-500">

                    <th className="px-4 py-3">
                      Product
                    </th>

                    <th className="px-3 py-3">
                      Category
                    </th>

                    <th className="px-3 py-3">
                      Warehouse
                    </th>

                    <th className="px-3 py-3 text-right">
                      Stock
                    </th>

                    <th className="px-3 py-3 text-right">
                      Reserved
                    </th>

                    <th className="px-3 py-3 text-right">
                      Available
                    </th>

                    <th className="px-3 py-3 text-right">
                      Buy price
                    </th>

                    <th className="px-3 py-3 text-right">
                      Sell price
                    </th>

                    <th className="px-3 py-3">
                      Status
                    </th>

                    <th className="px-3 py-3 text-center">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredProducts.map((product) => {
                    const available =
                      product.stock -
                      product.reserved;

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 transition hover:bg-gray-50"
                      >

                        {/* PRODUCT */}
                        <td className="px-4 py-3">

                          <div className="flex items-center gap-3">

                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#eef3f8] text-[10px] font-bold text-[#11233f]">
                              {product.name
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <div className="text-[10px] font-semibold">
                                {product.name}
                              </div>

                              <div className="mt-1 text-[8px] text-gray-500">
                                {product.sku}
                              </div>

                              <div className="mt-0.5 text-[7px] text-gray-400">
                                {product.brand}
                              </div>
                            </div>

                          </div>

                        </td>

                        {/* CATEGORY */}
                        <td className="px-3 py-3">
                          <span className="text-[9px] text-gray-600">
                            {product.category}
                          </span>
                        </td>

                        {/* WAREHOUSE */}
                        <td className="px-3 py-3">
                          <span className="text-[9px] text-gray-600">
                            {product.warehouse}
                          </span>
                        </td>

                        {/* STOCK */}
                        <td className="px-3 py-3 text-right">
                          <span className="text-[10px] font-semibold">
                            {product.stock}
                          </span>

                          <div className="mt-1 text-[7px] text-gray-400">
                            Reorder:{" "}
                            {product.reorderLevel}
                          </div>
                        </td>

                        {/* RESERVED */}
                        <td className="px-3 py-3 text-right">
                          <span className="text-[9px] text-gray-600">
                            {product.reserved}
                          </span>
                        </td>

                        {/* AVAILABLE */}
                        <td className="px-3 py-3 text-right">
                          <span
                            className={`text-[10px] font-semibold ${
                              available <=
                              product.reorderLevel
                                ? "text-orange-500"
                                : "text-[#172a43]"
                            }`}
                          >
                            {available}
                          </span>
                        </td>

                        {/* PURCHASE PRICE */}
                        <td className="px-3 py-3 text-right">
                          <span className="text-[9px]">
                            {formatCurrency(
                              product.purchasePrice
                            )}
                          </span>
                        </td>

                        {/* SELLING PRICE */}
                        <td className="px-3 py-3 text-right">
                          <span className="text-[9px]">
                            {formatCurrency(
                              product.sellingPrice
                            )}
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="px-3 py-3">
                          <StatusBadge
                            status={product.status}
                          />
                        </td>

                        {/* ACTION */}
                        <td className="px-3 py-3 text-center">

                          <button
                            className="rounded border border-gray-200 px-2 py-1 text-[8px] text-gray-600 hover:bg-gray-50"
                            onClick={() =>
                              alert(
                                `Product: ${product.name}`
                              )
                            }
                          >
                            View
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>

            {/* EMPTY STATE */}
            {filteredProducts.length === 0 && (
              <div className="px-4 py-12 text-center">
                <div className="text-2xl">⌕</div>

                <div className="mt-2 text-[11px] font-semibold">
                  No products found
                </div>

                <p className="mt-1 text-[9px] text-gray-500">
                  Try changing your search or filters.
                </p>
              </div>
            )}

            {/* FOOTER */}
            <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">

              <span className="text-[9px] text-gray-500">
                Showing{" "}
                <strong className="text-gray-700">
                  {filteredProducts.length}
                </strong>{" "}
                of{" "}
                <strong className="text-gray-700">
                  {products.length}
                </strong>{" "}
                products
              </span>

              <div className="flex gap-1">

                <button className="rounded border border-gray-200 px-2 py-1 text-[8px] text-gray-400">
                  Previous
                </button>

                <button className="rounded bg-[#11233f] px-2.5 py-1 text-[8px] font-semibold text-white">
                  1
                </button>

                <button className="rounded border border-gray-200 px-2.5 py-1 text-[8px] text-gray-600">
                  2
                </button>

                <button className="rounded border border-gray-200 px-2 py-1 text-[8px] text-gray-600">
                  Next
                </button>

              </div>

            </div>

          </section>

        </div>
      </main>

      {/* ADD PRODUCT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-5">

          <div className="w-full max-w-[520px] rounded-xl bg-white shadow-xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

              <div>
                <h2 className="text-[13px] font-bold text-[#172a43]">
                  Add product
                </h2>

                <p className="mt-1 text-[9px] text-gray-500">
                  Create a new product in the inventory
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100"
              >
                ×
              </button>

            </div>

            {/* FORM */}
            <div className="grid grid-cols-2 gap-3 p-5">

              <div>
                <label className="text-[9px] font-semibold text-gray-600">
                  Product name
                </label>

                <input
                  placeholder="Product name"
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-semibold text-gray-600">
                  SKU
                </label>

                <input
                  placeholder="SKU code"
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-semibold text-gray-600">
                  Category
                </label>

                <select className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none">
                  {categories
                    .filter(
                      (item) =>
                        item !== "All categories"
                    )
                    .map((item) => (
                      <option key={item}>
                        {item}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-semibold text-gray-600">
                  Brand
                </label>

                <input
                  placeholder="Brand"
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-semibold text-gray-600">
                  Purchase price
                </label>

                <input
                  type="number"
                  placeholder="₹ 0"
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-semibold text-gray-600">
                  Selling price
                </label>

                <input
                  type="number"
                  placeholder="₹ 0"
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-semibold text-gray-600">
                  Opening stock
                </label>

                <input
                  type="number"
                  placeholder="0"
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none focus:border-blue-400"
                />
              </div>

              <div>
                <label className="text-[9px] font-semibold text-gray-600">
                  Reorder level
                </label>

                <input
                  type="number"
                  placeholder="0"
                  className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-[9px] outline-none focus:border-blue-400"
                />
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="flex justify-end gap-2 border-t border-gray-200 px-5 py-4">

              <button
                onClick={() => setShowModal(false)}
                className="rounded-md border border-gray-200 px-4 py-2 text-[9px] text-gray-600"
              >
                Cancel
              </button>

              <button
                onClick={() => setShowModal(false)}
                className="rounded-md bg-[#11233f] px-4 py-2 text-[9px] font-semibold text-white hover:bg-[#1c3658]"
              >
                Save product
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}