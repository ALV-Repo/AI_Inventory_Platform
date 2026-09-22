"use client";

import { useMemo, useState } from "react";

type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  warehouse: string;
  stock: number;
  price: number;
  status: "Healthy" | "Low Stock" | "Out of Stock";
};

type ScanRecord = {
  id: number;
  sku: string;
  product: string;
  warehouse: string;
  action: "Scan" | "Stock In" | "Stock Out";
  quantity: number;
  date: string;
  user: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
    category: "Toys",
    warehouse: "Main Store",
    stock: 24,
    price: 4200,
    status: "Healthy",
  },
  {
    id: 2,
    name: "Bluetooth Speaker",
    sku: "ELC-BT-608",
    category: "Electronics",
    warehouse: "Main Store",
    stock: 8,
    price: 2800,
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Football Size 5",
    sku: "SPT-BL-908",
    category: "Sports",
    warehouse: "Warehouse A",
    stock: 17,
    price: 1500,
    status: "Healthy",
  },
  {
    id: 4,
    name: "Christmas Tree 4ft",
    sku: "SEA-XM-968",
    category: "Seasonal",
    warehouse: "Main Store",
    stock: 81,
    price: 6500,
    status: "Healthy",
  },
  {
    id: 5,
    name: "Fashion Doll Set",
    sku: "TOY-DL-410",
    category: "Toys",
    warehouse: "Warehouse B",
    stock: 56,
    price: 2200,
    status: "Healthy",
  },
  {
    id: 6,
    name: "Ceramic Planter",
    sku: "HOM-PL-810",
    category: "Home",
    warehouse: "Main Store",
    stock: 53,
    price: 1200,
    status: "Healthy",
  },
  {
    id: 7,
    name: "Wireless Keyboard",
    sku: "ELC-KB-128",
    category: "Electronics",
    warehouse: "Warehouse A",
    stock: 3,
    price: 3200,
    status: "Low Stock",
  },
  {
    id: 8,
    name: "USB Microphone",
    sku: "ELC-MC-508",
    category: "Electronics",
    warehouse: "Main Store",
    stock: 12,
    price: 4500,
    status: "Healthy",
  },
  {
    id: 9,
    name: "Gaming Mouse",
    sku: "ELC-MS-180",
    category: "Electronics",
    warehouse: "Main Store",
    stock: 20,
    price: 1800,
    status: "Healthy",
  },
];

const initialScans: ScanRecord[] = [
  {
    id: 1,
    sku: "TOY-HW-002",
    product: "Hot Wheels Track Set",
    warehouse: "Main Store",
    action: "Scan",
    quantity: 24,
    date: "20 Aug 2026",
    user: "Admin User",
  },
  {
    id: 2,
    sku: "ELC-BT-608",
    product: "Bluetooth Speaker",
    warehouse: "Main Store",
    action: "Stock Out",
    quantity: 2,
    date: "20 Aug 2026",
    user: "Rahul",
  },
  {
    id: 3,
    sku: "SPT-BL-908",
    product: "Football Size 5",
    warehouse: "Warehouse A",
    action: "Stock In",
    quantity: 5,
    date: "19 Aug 2026",
    user: "Priya",
  },
  {
    id: 4,
    sku: "ELC-KB-128",
    product: "Wireless Keyboard",
    warehouse: "Warehouse A",
    action: "Scan",
    quantity: 3,
    date: "19 Aug 2026",
    user: "Admin User",
  },
  {
    id: 5,
    sku: "ELC-MC-508",
    product: "USB Microphone",
    warehouse: "Main Store",
    action: "Scan",
    quantity: 12,
    date: "18 Aug 2026",
    user: "Rahul",
  },
];

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function BarcodeScannerPage() {
  const [barcode, setBarcode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    null
  );

  const [scanHistory, setScanHistory] =
    useState<ScanRecord[]>(initialScans);

  const [action, setAction] = useState<"Stock In" | "Stock Out">(
    "Stock In"
  );

  const [quantity, setQuantity] = useState(1);

  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");

  const handleScan = () => {
    const value = barcode.trim().toLowerCase();

    if (!value) {
      setMessage("Please enter a barcode or SKU.");
      return;
    }

    const product = products.find(
      (item) =>
        item.sku.toLowerCase() === value ||
        item.name.toLowerCase().includes(value)
    );

    if (!product) {
      setSelectedProduct(null);
      setMessage("Product not found. Please check the barcode or SKU.");
      return;
    }

    setSelectedProduct(product);
    setMessage(`Product found: ${product.name}`);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setBarcode(product.sku);
    setMessage(`Selected ${product.name}`);
  };

  const handleInventoryAction = () => {
    if (!selectedProduct) {
      setMessage("Please scan or select a product first.");
      return;
    }

    if (quantity <= 0) {
      setMessage("Quantity must be greater than 0.");
      return;
    }

    if (action === "Stock Out" && quantity > selectedProduct.stock) {
      setMessage("Stock out quantity cannot exceed available stock.");
      return;
    }

    const updatedStock =
      action === "Stock In"
        ? selectedProduct.stock + quantity
        : selectedProduct.stock - quantity;

    setSelectedProduct({
      ...selectedProduct,
      stock: updatedStock,
      status:
        updatedStock === 0
          ? "Out of Stock"
          : updatedStock <= 5
          ? "Low Stock"
          : "Healthy",
    });

    const newRecord: ScanRecord = {
      id: Date.now(),
      sku: selectedProduct.sku,
      product: selectedProduct.name,
      warehouse: selectedProduct.warehouse,
      action,
      quantity,
      date: "20 Aug 2026",
      user: "Admin User",
    };

    setScanHistory((previous) => [newRecord, ...previous]);

    setMessage(
      `${action} completed successfully for ${selectedProduct.name}.`
    );

    setQuantity(1);
  };

  const filteredHistory = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return scanHistory;
    }

    return scanHistory.filter(
      (item) =>
        item.product.toLowerCase().includes(value) ||
        item.sku.toLowerCase().includes(value) ||
        item.warehouse.toLowerCase().includes(value) ||
        item.action.toLowerCase().includes(value)
    );
  }, [search, scanHistory]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* PAGE HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 text-sm font-medium text-blue-600">
              Inventory / Barcode Scanner
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Barcode Scanner
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Scan products, check inventory and perform quick stock
              operations.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setBarcode("");
                setSelectedProduct(null);
                setMessage("");
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Clear Scanner
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total Products
            </p>

            <p className="mt-2 text-3xl font-bold">
              {products.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Available for scanning
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {products.reduce((total, item) => total + item.stock, 0)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Units across products
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Low Stock
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {
                products.filter(
                  (item) => item.status === "Low Stock"
                ).length
              }
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Products need attention
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Recent Scans
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {scanHistory.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Scanner activity
            </p>
          </div>

        </div>

        {/* SCANNER */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-lg font-bold">
              Scan Product
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter a barcode or SKU to find the product.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:flex-row">

            <div className="relative flex-1">
              <input
                type="text"
                value={barcode}
                onChange={(event) => setBarcode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleScan();
                  }
                }}
                placeholder="Scan barcode or enter SKU..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                ▣
              </div>
            </div>

            <button
              onClick={handleScan}
              className="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Scan Product
            </button>

          </div>

          {message && (
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {message}
            </div>
          )}

        </section>

        {/* PRODUCT RESULT */}
        {selectedProduct && (
          <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Scanned Product
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Product information returned from the scanner.
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedProduct.status === "Healthy"
                    ? "bg-green-100 text-green-700"
                    : selectedProduct.status === "Low Stock"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {selectedProduct.status}
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Product
                </p>

                <p className="mt-1 font-semibold">
                  {selectedProduct.name}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  SKU
                </p>

                <p className="mt-1 font-semibold">
                  {selectedProduct.sku}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Warehouse
                </p>

                <p className="mt-1 font-semibold">
                  {selectedProduct.warehouse}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Category
                </p>

                <p className="mt-1 font-semibold">
                  {selectedProduct.category}
                </p>
              </div>

            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">

              <div className="rounded-lg border border-green-100 bg-green-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-green-700">
                  Available Stock
                </p>

                <p className="mt-2 text-3xl font-bold text-green-700">
                  {selectedProduct.stock}
                </p>

                <p className="text-xs text-green-600">
                  Units available
                </p>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-blue-700">
                  Unit Price
                </p>

                <p className="mt-2 text-3xl font-bold text-blue-700">
                  {formatCurrency(selectedProduct.price)}
                </p>

                <p className="text-xs text-blue-600">
                  Current selling price
                </p>
              </div>

            </div>

          </section>
        )}

                {/* QUICK PRODUCT SELECTION */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-lg font-bold">
              Quick Product Selection
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a product directly if you do not have a barcode.
            </p>
          </div>

          <div className="mb-5">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, SKU or warehouse..."
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">

            {products
              .filter((product) => {
                const value = search.toLowerCase().trim();

                if (!value) {
                  return true;
                }

                return (
                  product.name.toLowerCase().includes(value) ||
                  product.sku.toLowerCase().includes(value) ||
                  product.warehouse.toLowerCase().includes(value)
                );
              })
              .map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`rounded-lg border p-4 text-left transition ${
                    selectedProduct?.id === product.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50"
                  }`}
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <p className="font-semibold text-slate-900">
                        {product.name}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {product.sku}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                        product.status === "Healthy"
                          ? "bg-green-100 text-green-700"
                          : product.status === "Low Stock"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.status}
                    </span>

                  </div>

                  <div className="mt-4 flex items-center justify-between">

                    <div>
                      <p className="text-xs text-slate-400">
                        Warehouse
                      </p>

                      <p className="text-sm font-medium text-slate-700">
                        {product.warehouse}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-400">
                        Stock
                      </p>

                      <p className="text-sm font-bold text-green-600">
                        {product.stock}
                      </p>
                    </div>

                  </div>

                </button>
              ))}

          </div>

        </section>

        {/* STOCK ACTIONS */}
        {selectedProduct && (
          <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-bold">
                Quick Stock Action
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Increase or decrease stock for the scanned product.
              </p>
            </div>

            {/* ACTION SELECTOR */}
            <div className="mb-6">

              <p className="mb-3 text-sm font-medium text-slate-700">
                Action
              </p>

              <div className="grid gap-3 md:grid-cols-2">

                <button
                  onClick={() => setAction("Stock In")}
                  className={`rounded-lg border p-4 text-left transition ${
                    action === "Stock In"
                      ? "border-green-400 bg-green-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-xl text-green-700">
                      +
                    </div>

                    <div>
                      <p className="font-semibold text-green-700">
                        Stock In
                      </p>

                      <p className="text-xs text-slate-500">
                        Add units to inventory
                      </p>
                    </div>

                  </div>

                </button>

                <button
                  onClick={() => setAction("Stock Out")}
                  className={`rounded-lg border p-4 text-left transition ${
                    action === "Stock Out"
                      ? "border-red-400 bg-red-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-xl text-red-700">
                      −
                    </div>

                    <div>
                      <p className="font-semibold text-red-700">
                        Stock Out
                      </p>

                      <p className="text-xs text-slate-500">
                        Remove units from inventory
                      </p>
                    </div>

                  </div>

                </button>

              </div>

            </div>

            {/* QUANTITY */}
            <div className="mb-6">

              <label className="mb-2 block text-sm font-medium text-slate-700">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(event) =>
                  setQuantity(Number(event.target.value))
                }
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            {/* ACTION PREVIEW */}
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-5">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
                    Stock Preview
                  </p>

                  <p className="mt-2 font-semibold text-slate-900">
                    {selectedProduct.name}
                  </p>

                  <p className="text-xs text-slate-500">
                    {selectedProduct.sku}
                  </p>
                </div>

                <div className="text-right">

                  <p className="text-sm text-slate-500">
                    {selectedProduct.stock} →{" "}
                    {action === "Stock In"
                      ? selectedProduct.stock + quantity
                      : Math.max(
                          0,
                          selectedProduct.stock - quantity
                        )}{" "}
                    units
                  </p>

                  <p
                    className={`mt-1 text-lg font-bold ${
                      action === "Stock In"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {action === "Stock In" ? "+" : "-"}
                    {quantity} units
                  </p>

                </div>

              </div>

            </div>

            {/* ACTION BUTTON */}
            <div className="flex justify-end">

              <button
                onClick={handleInventoryAction}
                className={`rounded-lg px-6 py-3 text-sm font-semibold text-white ${
                  action === "Stock In"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {action === "Stock In"
                  ? "Add Stock"
                  : "Remove Stock"}
              </button>

            </div>

          </section>
        )}

                {/* SCAN HISTORY */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-lg font-bold">
                  Recent Scan History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track recent barcode scans and inventory operations.
                </p>
              </div>

              <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {filteredHistory.length} Records
              </span>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Product
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    SKU
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Warehouse
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Quantity
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    User
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredHistory.map((record) => (

                  <tr
                    key={record.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >

                    <td className="px-6 py-4">

                      <p className="font-semibold text-slate-900">
                        {record.product}
                      </p>

                    </td>

                    <td className="px-6 py-4">

                      <span className="text-xs font-medium text-slate-500">
                        {record.sku}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-sm text-slate-700">
                      {record.warehouse}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          record.action === "Stock In"
                            ? "bg-green-100 text-green-700"
                            : record.action === "Stock Out"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {record.action}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`font-semibold ${
                          record.action === "Stock Out"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {record.action === "Stock Out"
                          ? `-${record.quantity}`
                          : `+${record.quantity}`}
                      </span>

                    </td>

                    <td className="px-6 py-4 text-sm text-slate-500">
                      {record.date}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {record.user}
                    </td>

                  </tr>

                ))}

                {filteredHistory.length === 0 && (
                  <tr>

                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center"
                    >

                      <div className="text-3xl">
                        🔍
                      </div>

                      <p className="mt-3 font-semibold text-slate-700">
                        No scan records found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Try a different product, SKU or warehouse.
                      </p>

                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* SCANNER INSTRUCTIONS */}
        <section className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-6">

          <div className="flex flex-col gap-5 md:flex-row">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xl text-blue-700">
              ℹ
            </div>

            <div className="flex-1">

              <h2 className="font-bold text-blue-900">
                How to use the Barcode Scanner
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-3">

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    1. Scan
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Enter the product barcode or SKU in the scanner
                    field and press Scan Product.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    2. Verify
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Check the product, warehouse and available stock
                    before making an inventory change.
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    3. Update
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Choose Stock In or Stock Out, enter the quantity
                    and complete the inventory operation.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </section>

                {/* SCANNER STATUS */}
        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100">
                <span className="h-3 w-3 rounded-full bg-green-500" />
              </div>

              <div>
                <p className="font-semibold text-slate-900">
                  Scanner Ready
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Barcode scanner is ready to accept product SKUs.
                </p>
              </div>

            </div>

            <div className="flex flex-wrap gap-2">

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                Online
              </span>

              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Keyboard Scanner
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                Enter to Scan
              </span>

            </div>

          </div>

        </section>

        {/* FOOTER NOTE */}
        <div className="pb-8 text-center">

          <p className="text-xs text-slate-400">
            AI StockFlow • Barcode & Inventory Management
          </p>

        </div>

              </div>
              </main>
    );
}