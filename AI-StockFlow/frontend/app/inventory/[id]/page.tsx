"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageLayout from "../../../components/layout/PageLayout";

type Variant = {
  id: number;
  name: string;
  sku: string;
  color: string;
  size: string;
  stock: number;
  price: number;
};

type Product = {
  id: number;
  name: string;
  category: string;
  warehouse: string;
  description: string;
  variants: Variant[];
};

type WarehouseStock = {
  warehouse: string;
  onHand: number;
  reserved: number;
  available: number;
};

const products: Product[] = [
  {
    id: 1,
    name: "Hot Wheels Track Set",
    category: "Toys",
    warehouse: "Main Store",
    description:
      "High-speed Hot Wheels track set with multiple racing configurations.",
    variants: [
      {
        id: 101,
        name: "Standard",
        sku: "TOY-HW-002",
        color: "Red",
        size: "Standard",
        stock: 24,
        price: 4200,
      },
      {
        id: 102,
        name: "Deluxe",
        sku: "TOY-HW-002-DX",
        color: "Black",
        size: "Large",
        stock: 12,
        price: 5600,
      },
      {
        id: 103,
        name: "Racing Edition",
        sku: "TOY-HW-002-RC",
        color: "Blue",
        size: "Large",
        stock: 7,
        price: 6800,
      },
    ],
  },

  {
    id: 2,
    name: "Bluetooth Speaker",
    category: "Electronics",
    warehouse: "Main Store",
    description:
      "Portable Bluetooth speaker with wireless connectivity and rechargeable battery.",
    variants: [
      {
        id: 201,
        name: "Black",
        sku: "ELC-BT-600-BLK",
        color: "Black",
        size: "Standard",
        stock: 8,
        price: 3200,
      },
      {
        id: 202,
        name: "Blue",
        sku: "ELC-BT-600-BLU",
        color: "Blue",
        size: "Standard",
        stock: 14,
        price: 3200,
      },
      {
        id: 203,
        name: "Red",
        sku: "ELC-BT-600-RED",
        color: "Red",
        size: "Standard",
        stock: 5,
        price: 3400,
      },
    ],
  },

  {
    id: 3,
    name: "Football Size 5",
    category: "Sports",
    warehouse: "Warehouse A",
    description:
      "Professional size 5 football suitable for training and outdoor matches.",
    variants: [
      {
        id: 301,
        name: "White",
        sku: "SPT-BL-900-WHT",
        color: "White",
        size: "Size 5",
        stock: 17,
        price: 1800,
      },
      {
        id: 302,
        name: "Blue",
        sku: "SPT-BL-900-BLU",
        color: "Blue",
        size: "Size 5",
        stock: 11,
        price: 1900,
      },
    ],
  },

  {
    id: 4,
    name: "Christmas Tree 4ft",
    category: "Seasonal",
    warehouse: "Main Store",
    description:
      "Decorative artificial Christmas tree suitable for home and office use.",
    variants: [
      {
        id: 401,
        name: "Green",
        sku: "SEA-XM-960-GRN",
        color: "Green",
        size: "4ft",
        stock: 81,
        price: 12500,
      },
      {
        id: 402,
        name: "Snow",
        sku: "SEA-XM-960-SNW",
        color: "White",
        size: "4ft",
        stock: 20,
        price: 13800,
      },
    ],
  },
];

const warehouseStock: Record<number, WarehouseStock[]> = {
  1: [
    {
      warehouse: "Main Store",
      onHand: 24,
      reserved: 6,
      available: 18,
    },
    {
      warehouse: "Warehouse A",
      onHand: 12,
      reserved: 2,
      available: 10,
    },
    {
      warehouse: "Warehouse B",
      onHand: 7,
      reserved: 1,
      available: 6,
    },
  ],

  2: [
    {
      warehouse: "Main Store",
      onHand: 8,
      reserved: 2,
      available: 6,
    },
    {
      warehouse: "Warehouse A",
      onHand: 5,
      reserved: 1,
      available: 4,
    },
    {
      warehouse: "Warehouse B",
      onHand: 3,
      reserved: 0,
      available: 3,
    },
  ],

  3: [
    {
      warehouse: "Main Store",
      onHand: 10,
      reserved: 2,
      available: 8,
    },
    {
      warehouse: "Warehouse A",
      onHand: 17,
      reserved: 2,
      available: 15,
    },
    {
      warehouse: "Warehouse B",
      onHand: 6,
      reserved: 1,
      available: 5,
    },
  ],

  4: [
    {
      warehouse: "Main Store",
      onHand: 81,
      reserved: 0,
      available: 81,
    },
    {
      warehouse: "Warehouse A",
      onHand: 15,
      reserved: 2,
      available: 13,
    },
    {
      warehouse: "Warehouse B",
      onHand: 10,
      reserved: 1,
      available: 9,
    },
  ],
};

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const productId = Number(params.id);

  const product = products.find(
    (item) => item.id === productId
  );

  const [selectedVariantId, setSelectedVariantId] =
    useState<number | null>(
      product?.variants[0]?.id ?? null
    );

  const [selectedWarehouse, setSelectedWarehouse] =
    useState("Main Store");

  const [showBarcode, setShowBarcode] = useState(false);

  const [scannerInput, setScannerInput] = useState("");

  const [scannerMessage, setScannerMessage] =
    useState("");

  const scannerRef =
    useRef<HTMLInputElement>(null);

  const selectedVariant = useMemo(() => {
    if (!product) {
      return null;
    }

    return (
      product.variants.find(
        (variant) =>
          variant.id === selectedVariantId
      ) ?? product.variants[0]
    );
  }, [product, selectedVariantId]);

  const warehouseStocks =
    warehouseStock[product?.id ?? 0] ?? [];

  const selectedWarehouseStock =
    warehouseStocks.find(
      (item) =>
        item.warehouse === selectedWarehouse
    ) ?? warehouseStocks[0];

  const openBarcode = () => {
    setShowBarcode(true);
    setScannerInput("");
    setScannerMessage("");

    setTimeout(() => {
      scannerRef.current?.focus();
    }, 100);
  };

  const closeBarcode = () => {
    setShowBarcode(false);
    setScannerInput("");
    setScannerMessage("");
  };

  const handleScannerInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setScannerInput(event.target.value);
    setScannerMessage("");
  };

  const handleScannerKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== "Enter") {
      return;
    }

    const scannedSku =
      scannerInput.trim().toUpperCase();

    if (!scannedSku) {
      setScannerMessage(
        "Please scan or enter a SKU."
      );
      return;
    }

    const foundVariant = product?.variants.find(
      (variant) =>
        variant.sku.toUpperCase() === scannedSku
    );

    if (foundVariant) {
      setSelectedVariantId(foundVariant.id);

      setScannerMessage(
        `Product found: ${foundVariant.name}`
      );

      setScannerInput("");
    } else {
      setScannerMessage(
        "No product variant found for this barcode/SKU."
      );
    }
  };

  const printBarcode = () => {
    window.print();
  };

  if (!product) {
    return (
      <PageLayout>
        <main className="min-h-screen bg-[#f8fafc] p-6">
          <div className="mx-auto max-w-5xl">
            <button
              type="button"
              onClick={() =>
                router.push("/inventory")
              }
              className="mb-5 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              ← Back to Inventory
            </button>

            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center shadow-sm">
              <h1 className="text-xl font-bold text-[#12213a]">
                Product Not Found
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                The requested inventory product
                could not be found.
              </p>
            </div>
          </div>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f8fafc] px-6 py-7">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <button
            type="button"
            onClick={() =>
              router.push("/inventory")
            }
            className="mb-5 text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            ← Back to Inventory
          </button>

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">

                <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-semibold text-blue-700">
                  {product.category}
                </span>

                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold text-gray-600">
                  {product.warehouse}
                </span>

              </div>

              <h1 className="text-2xl font-bold text-[#12213a]">
                {product.name}
              </h1>

              <p className="mt-1 max-w-2xl text-xs text-gray-500">
                {product.description}
              </p>
            </div>

            <div className="flex gap-2">

              <button
                type="button"
                onClick={() =>
                  router.push("/inventory")
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Inventory
              </button>

              <button
  type="button"
  onClick={() => router.push(`/inventory/${product.id}/edit`)}
  className="rounded-lg bg-[#12213a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1d3055]"
>
  Edit Product
</button>

            </div>
          </div>

          {/* PRODUCT + VARIANT */}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex h-56 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-blue-50">

                <div className="text-center">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-3xl font-bold text-[#12213a] shadow-sm">
                    {product.name
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <p className="mt-4 text-sm font-semibold text-[#12213a]">
                    {product.name}
                  </p>

                  <p className="mt-1 font-mono text-[10px] text-gray-400">
                    Product #{product.id}
                  </p>

                </div>

              </div>

              <div className="mt-5 space-y-3">

                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-xs text-gray-500">
                    Category
                  </span>

                  <span className="text-xs font-semibold text-gray-800">
                    {product.category}
                  </span>
                </div>

                <div className="flex justify-between border-b border-gray-100 pb-3">
                  <span className="text-xs text-gray-500">
                    Warehouse
                  </span>

                  <span className="text-xs font-semibold text-gray-800">
                    {product.warehouse}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-xs text-gray-500">
                    Variants
                  </span>

                  <span className="text-xs font-semibold text-gray-800">
                    {product.variants.length}
                  </span>
                </div>

              </div>
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">

              <div className="mb-5">

                <h2 className="text-base font-bold text-[#12213a]">
                  Variant Picker
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Select a product variant to view its
                  SKU, stock, price, color and size.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">

                {product.variants.map(
                  (variant) => {

                    const isSelected =
                      selectedVariantId ===
                      variant.id;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() =>
                          setSelectedVariantId(
                            variant.id
                          )
                        }
                        className={`rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                        }`}
                      >

                        <div className="flex items-start justify-between">

                          <div>
                            <p className="text-sm font-bold text-[#12213a]">
                              {variant.name}
                            </p>

                            <p className="mt-1 font-mono text-[10px] text-gray-400">
                              {variant.sku}
                            </p>
                          </div>

                          {isSelected && (
                            <span className="rounded-full bg-blue-600 px-2 py-1 text-[9px] font-semibold text-white">
                              Selected
                            </span>
                          )}

                        </div>

                        <div className="mt-4 space-y-2">

                          <div className="flex justify-between">
                            <span className="text-[10px] text-gray-400">
                              Color
                            </span>

                            <span className="text-[10px] font-semibold text-gray-700">
                              {variant.color}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-[10px] text-gray-400">
                              Size
                            </span>

                            <span className="text-[10px] font-semibold text-gray-700">
                              {variant.size}
                            </span>
                          </div>

                          <div className="flex justify-between">
                            <span className="text-[10px] text-gray-400">
                              Stock
                            </span>

                            <span
                              className={`text-[10px] font-bold ${
                                variant.stock === 0
                                  ? "text-red-600"
                                  : variant.stock <= 10
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                            >
                              {variant.stock}
                            </span>
                          </div>

                        </div>

                      </button>
                    );
                  }
                )}

              </div>

              {selectedVariant && (
                <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
                        Selected Variant
                      </p>

                      <h3 className="mt-1 text-lg font-bold text-blue-950">
                        {selectedVariant.name}
                      </h3>

                      <p className="mt-1 font-mono text-[10px] text-blue-600">
                        {selectedVariant.sku}
                      </p>

                    </div>

                    <div className="text-left md:text-right">

                      <p className="text-[10px] text-blue-500">
                        Unit Price
                      </p>

                      <p className="text-xl font-bold text-blue-950">
                        {formatCurrency(
                          selectedVariant.price
                        )}
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">

                    <div className="rounded-lg bg-white p-3">
                      <p className="text-[9px] uppercase tracking-wide text-gray-400">
                        SKU
                      </p>

                      <p className="mt-1 truncate font-mono text-xs font-semibold text-gray-800">
                        {selectedVariant.sku}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <p className="text-[9px] uppercase tracking-wide text-gray-400">
                        COLOR
                      </p>

                      <p className="mt-1 text-xs font-semibold text-gray-800">
                        {selectedVariant.color}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <p className="text-[9px] uppercase tracking-wide text-gray-400">
                        SIZE
                      </p>

                      <p className="mt-1 text-xs font-semibold text-gray-800">
                        {selectedVariant.size}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white p-3">
                      <p className="text-[9px] uppercase tracking-wide text-gray-400">
                        STOCK
                      </p>

                      <p
                        className={`mt-1 text-xs font-bold ${
                          selectedVariant.stock === 0
                            ? "text-red-600"
                            : selectedVariant.stock <= 10
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}
                      >
                        {selectedVariant.stock}
                      </p>
                    </div>

                  </div>

                </div>
              )}

            </section>

          </div>

                    {/* VARIANT INVENTORY SUMMARY */}

          {selectedVariant && (
            <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <h2 className="text-base font-bold text-[#12213a]">
                    Variant Inventory Summary
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Inventory information for the selected
                    product variant.
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                    selectedVariant.stock === 0
                      ? "bg-red-100 text-red-700"
                      : selectedVariant.stock <= 10
                      ? "bg-orange-100 text-orange-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {selectedVariant.stock === 0
                    ? "Out of Stock"
                    : selectedVariant.stock <= 10
                    ? "Low Stock"
                    : "Healthy Stock"}
                </span>

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[9px] uppercase tracking-wider text-gray-400">
                    SKU
                  </p>

                  <p className="mt-2 font-mono text-sm font-bold text-[#12213a]">
                    {selectedVariant.sku}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[9px] uppercase tracking-wider text-gray-400">
                    Available Stock
                  </p>

                  <p
                    className={`mt-2 text-xl font-bold ${
                      selectedVariant.stock === 0
                        ? "text-red-600"
                        : selectedVariant.stock <= 10
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {selectedVariant.stock}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[9px] uppercase tracking-wider text-gray-400">
                    Unit Price
                  </p>

                  <p className="mt-2 text-xl font-bold text-green-600">
                    {formatCurrency(
                      selectedVariant.price
                    )}
                  </p>
                </div>

                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[9px] uppercase tracking-wider text-gray-400">
                    Warehouse
                  </p>

                  <p className="mt-2 text-sm font-bold text-[#12213a]">
                    {product.warehouse}
                  </p>
                </div>

              </div>

            </section>
          )}

          {/* VARIANT ACTIONS */}

          <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-5">

              <h2 className="text-base font-bold text-[#12213a]">
                Variant Actions
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Perform inventory operations for the
                selected variant.
              </p>

            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <button
                type="button"
                onClick={() =>
  router.push(
    `/inventory/stock-adjustment?sku=${encodeURIComponent(
      selectedVariant?.sku ?? ""
    )}`
  )
}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                  ±
                </div>

                <p className="mt-3 text-sm font-semibold text-[#12213a]">
                  Adjust Stock
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Increase or decrease variant stock.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  alert(
                    `Transfer stock for ${selectedVariant?.sku}`
                  )
                }
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-purple-300 hover:bg-purple-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700">
                  ⇄
                </div>

                <p className="mt-3 text-sm font-semibold text-[#12213a]">
                  Transfer Stock
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Move the variant between warehouses.
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  alert(
                    `Cycle count for ${selectedVariant?.sku}`
                  )
                }
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-teal-300 hover:bg-teal-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-sm font-bold text-teal-700">
                  ✓
                </div>

                <p className="mt-3 text-sm font-semibold text-[#12213a]">
                  Cycle Count
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Verify physical variant quantity.
                </p>
              </button>

              <button
                type="button"
                onClick={openBarcode}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-left transition hover:border-orange-300 hover:bg-orange-50"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-sm font-bold text-orange-700">
                  ▦
                </div>

                <p className="mt-3 text-sm font-semibold text-[#12213a]">
                  Barcode
                </p>

                <p className="mt-1 text-[10px] text-gray-500">
                  Generate or print the variant barcode.
                </p>
              </button>

            </div>

          </section>

          {/* STOCK BY WAREHOUSE */}

          <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div>
                <h2 className="text-base font-bold text-[#12213a]">
                  Stock by Warehouse
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  View inventory availability across all warehouses.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700">
                {warehouseStocks.length} Warehouses
              </span>

            </div>

            {/* WAREHOUSE TABS */}

            <div className="mb-5 flex flex-wrap gap-2">

              {warehouseStocks.map((item) => {

                const active =
                  selectedWarehouse ===
                  item.warehouse;

                return (
                  <button
                    key={item.warehouse}
                    type="button"
                    onClick={() =>
                      setSelectedWarehouse(
                        item.warehouse
                      )
                    }
                    className={`rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                      active
                        ? "border-[#12213a] bg-[#12213a] text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {item.warehouse}
                  </button>
                );
              })}

            </div>

            {/* SELECTED WAREHOUSE */}

            {selectedWarehouseStock && (
              <div>

                <div className="mb-4 flex items-center justify-between">

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                      Selected Warehouse
                    </p>

                    <h3 className="mt-1 text-sm font-bold text-[#12213a]">
                      {selectedWarehouseStock.warehouse}
                    </h3>

                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold ${
                      selectedWarehouseStock.available === 0
                        ? "bg-red-100 text-red-700"
                        : selectedWarehouseStock.available <= 10
                        ? "bg-orange-100 text-orange-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {selectedWarehouseStock.available === 0
                      ? "Out of Stock"
                      : selectedWarehouseStock.available <= 10
                      ? "Low Stock"
                      : "Healthy"}
                  </span>

                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-[9px] uppercase tracking-wider text-gray-400">
                      On Hand
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#12213a]">
                      {selectedWarehouseStock.onHand}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Physical inventory
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-[9px] uppercase tracking-wider text-gray-400">
                      Reserved
                    </p>

                    <p className="mt-2 text-2xl font-bold text-orange-600">
                      {selectedWarehouseStock.reserved}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Reserved for orders
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-[9px] uppercase tracking-wider text-gray-400">
                      Available
                    </p>

                    <p className="mt-2 text-2xl font-bold text-green-600">
                      {selectedWarehouseStock.available}
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Available to sell
                    </p>

                  </div>

                </div>

              </div>
            )}

          </section>

                    {/* STOCK OVERVIEW */}

          <section className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">

            {/* STOCK BY VARIANT */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="mb-5">

                <h2 className="text-base font-bold text-[#12213a]">
                  Stock by Variant
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Current stock distribution across
                  product variants.
                </p>

              </div>

              <div className="space-y-4">

                {product.variants.map(
                  (variant) => {

                    const maxStock = Math.max(
                      ...product.variants.map(
                        (item) => item.stock
                      ),
                      1
                    );

                    const percentage = Math.round(
                      (variant.stock / maxStock) *
                        100
                    );

                    return (
                      <div key={variant.id}>

                        <div className="mb-2 flex items-center justify-between">

                          <div>

                            <p className="text-xs font-semibold text-[#12213a]">
                              {variant.name}
                            </p>

                            <p className="font-mono text-[9px] text-gray-400">
                              {variant.sku}
                            </p>

                          </div>

                          <span className="text-xs font-bold text-gray-700">
                            {variant.stock} units
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">

                          <div
                            className={`h-full rounded-full transition-all ${
                              variant.stock === 0
                                ? "bg-red-500"
                                : variant.stock <= 10
                                ? "bg-orange-500"
                                : "bg-teal-600"
                            }`}
                            style={{
                              width: `${percentage}%`,
                            }}
                          />

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            </div>

            {/* PRODUCT INFORMATION */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="mb-5">

                <h2 className="text-base font-bold text-[#12213a]">
                  Product Information
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Basic product and inventory information.
                </p>

              </div>

              <div className="space-y-3">

                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">

                  <span className="text-xs text-gray-500">
                    Product ID
                  </span>

                  <span className="font-mono text-xs font-semibold text-gray-800">
                    #{product.id}
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">

                  <span className="text-xs text-gray-500">
                    Category
                  </span>

                  <span className="text-xs font-semibold text-gray-800">
                    {product.category}
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">

                  <span className="text-xs text-gray-500">
                    Warehouse
                  </span>

                  <span className="text-xs font-semibold text-gray-800">
                    {product.warehouse}
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">

                  <span className="text-xs text-gray-500">
                    Total Variants
                  </span>

                  <span className="text-xs font-semibold text-gray-800">
                    {product.variants.length}
                  </span>

                </div>

                <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">

                  <span className="text-xs text-gray-500">
                    Total Stock
                  </span>

                  <span className="text-xs font-bold text-green-600">
                    {product.variants.reduce(
                      (total, variant) =>
                        total + variant.stock,
                      0
                    )}
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* RECENT INVENTORY ACTIVITY */}

          <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-base font-bold text-[#12213a]">
                  Recent Inventory Activity
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Recent stock operations for this product.
                </p>

              </div>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-[10px] font-semibold text-gray-600">
                Live
              </span>

            </div>

            <div className="divide-y divide-gray-100">

              <div className="flex items-center justify-between gap-4 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-sm font-bold text-green-700">
                    +
                  </div>

                  <div>

                    <p className="text-xs font-semibold text-[#12213a]">
                      Stock received
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Main Store • Today
                    </p>

                  </div>

                </div>

                <span className="text-xs font-bold text-green-600">
                  +12 units
                </span>

              </div>

              <div className="flex items-center justify-between gap-4 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                    ↔
                  </div>

                  <div>

                    <p className="text-xs font-semibold text-[#12213a]">
                      Stock transferred
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Warehouse A → Main Store
                    </p>

                  </div>

                </div>

                <span className="text-xs font-bold text-blue-600">
                  +6 units
                </span>

              </div>

              <div className="flex items-center justify-between gap-4 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-sm font-bold text-orange-700">
                    −
                  </div>

                  <div>

                    <p className="text-xs font-semibold text-[#12213a]">
                      Stock adjustment
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Damaged units • Yesterday
                    </p>

                  </div>

                </div>

                <span className="text-xs font-bold text-orange-600">
                  -2 units
                </span>

              </div>

              <div className="flex items-center justify-between gap-4 py-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700">
                    ✓
                  </div>

                  <div>

                    <p className="text-xs font-semibold text-[#12213a]">
                      Cycle count completed
                    </p>

                    <p className="mt-1 text-[10px] text-gray-400">
                      Main Store • 2 days ago
                    </p>

                  </div>

                </div>

                <span className="text-xs font-semibold text-gray-600">
                  Verified
                </span>

              </div>

            </div>

          </section>

          {/* INVENTORY NOTES */}

          <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-5">

              <h2 className="text-base font-bold text-[#12213a]">
                Inventory Notes
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Important notes for inventory management.
              </p>

            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

              <div className="flex gap-3">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                  i
                </div>

                <div>

                  <p className="text-xs font-semibold text-blue-900">
                    Stock monitoring
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-blue-700">
                    Keep monitoring this product regularly.
                    Use stock adjustment, transfer and cycle
                    count operations whenever inventory changes.
                  </p>

                </div>

              </div>

            </div>

          </section>

        </div>
      </main>

            {/* BARCODE MODAL */}

      {showBarcode && selectedVariant && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeBarcode}
        >

          <div
            className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

              <div>

                <h2 className="text-lg font-bold text-[#12213a]">
                  Barcode Scanner
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Scan a barcode or enter the SKU manually.
                </p>

              </div>

              <button
                type="button"
                onClick={closeBarcode}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                ✕
              </button>

            </div>

            {/* MODAL BODY */}

            <div className="p-6">

              <div className="mb-5 rounded-xl bg-gray-50 p-4">

                <p className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                  Selected Variant
                </p>

                <div className="mt-2 flex items-center justify-between">

                  <div>

                    <p className="text-sm font-bold text-[#12213a]">
                      {selectedVariant.name}
                    </p>

                    <p className="mt-1 font-mono text-[10px] text-gray-500">
                      {selectedVariant.sku}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-[9px] text-gray-400">
                      Stock
                    </p>

                    <p className="text-sm font-bold text-green-600">
                      {selectedVariant.stock}
                    </p>

                  </div>

                </div>

              </div>

              {/* SCANNER */}

              <div className="mb-5 flex justify-center">

                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-orange-50">

                  <div className="text-5xl text-orange-500">
                    ▦
                  </div>

                </div>

              </div>

              {/* INPUT */}

              <label className="mb-2 block text-xs font-semibold text-gray-700">
                Barcode / SKU
              </label>

              <input
                ref={scannerRef}
                type="text"
                value={scannerInput}
                onChange={handleScannerInput}
                onKeyDown={handleScannerKeyDown}
                placeholder="Scan barcode or enter SKU..."
                autoFocus
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              <p className="mt-2 text-[10px] text-gray-400">
                Press Enter after scanning.
              </p>

              {/* MESSAGE */}

              {scannerMessage && (

                <div
                  className={`mt-4 rounded-lg p-3 text-xs font-medium ${
                    scannerMessage.startsWith(
                      "Product found"
                    )
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {scannerMessage}
                </div>

              )}

              {/* BARCODE PREVIEW */}

              <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5">

                <p className="mb-3 text-[9px] font-semibold uppercase tracking-wider text-gray-400">
                  Barcode Preview
                </p>

                <div className="flex h-20 items-center justify-center overflow-hidden rounded-lg bg-white">

                  <div className="flex h-16 items-center gap-[3px]">

                    {Array.from(
                      {
                        length: 45,
                      },
                      (_, index) => (

                        <span
                          key={index}
                          className={`block bg-black ${
                            index % 5 === 0
                              ? "h-16 w-[3px]"
                              : index % 3 === 0
                              ? "h-14 w-[2px]"
                              : "h-16 w-[1px]"
                          }`}
                        />

                      )
                    )}

                  </div>

                </div>

                <p className="mt-3 text-center font-mono text-xs font-semibold tracking-[0.25em] text-gray-700">
                  {selectedVariant.sku}
                </p>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">

              <button
                type="button"
                onClick={closeBarcode}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>

              <button
                type="button"
                onClick={printBarcode}
                className="rounded-lg bg-[#12213a] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1c3154]"
              >
                Print Barcode
              </button>

            </div>

          </div>

        </div>

      )}

    </PageLayout>
  );
}
