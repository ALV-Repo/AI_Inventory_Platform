"use client";

import { useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageLayout from "../../../components/layout/PageLayout";
import useInventory from "../../../hooks/useInventory";

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

type Bin = {
  id: number;
  warehouse: string;
  code: string;
  name: string;
  capacity: number;
};

type StockLedgerEntry = {
  id: number;
  date: string;
  type: string;
  warehouse: string;
  reference: string;
  quantity: number;
  balance: number;
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

function formatCurrency(value: number | undefined) {
  return `₹${(value ?? 0).toLocaleString("en-IN")}`;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();

  const productId = Number(params.id);

  const {
    products: inventoryProducts,
    loading: inventoryLoading,
  } = useInventory();

  const apiProduct = inventoryProducts.find(
    (item) => Number(item.id) === productId
  );

  const fallbackProduct = products.find(
  (item) => item.id === productId
);

const storedProduct: Product | undefined =
  typeof window !== "undefined"
    ? (() => {
        try {
          const stored = localStorage.getItem(
            "inventory-view-product"
          );

          if (!stored) {
            return undefined;
          }

          const parsed = JSON.parse(stored);

if (Number(parsed?.id) !== productId) {
  return undefined;
}

return {
  ...parsed,
  variants: Array.isArray(parsed.variants)
  ? parsed.variants.map(
      (variant: any, index: number) => ({
        id: index + 1,
        name:
          variant.name ||
          parsed.name ||
          "Variant",
        sku: variant.sku || "",
        color: variant.color || "Standard",
        size: variant.size || "Standard",
        stock: Number(
          variant.onHand ??
            variant.stock ??
            0
        ),
        price: Number(
          variant.unitCost ??
            variant.price ??
            parsed.unitCost ??
            0
        ),
      })
    )
  : [],
};
        } catch {
          return undefined;
        }
      })()
    : undefined;

const product: Product | undefined = apiProduct
  ? {
      id: Number(apiProduct.id),
      name:
        apiProduct.name ??
        apiProduct.product_name ??
        fallbackProduct?.name ??
        "",
      category:
        apiProduct.category ??
        apiProduct.category_name ??
        fallbackProduct?.category ??
        "",
      warehouse:
        apiProduct.warehouse ??
        apiProduct.warehouse_name ??
        fallbackProduct?.warehouse ??
        "Main Store",
      description:
        fallbackProduct?.description ??
        "Inventory product details and stock information.",
      variants:
        fallbackProduct?.variants ??
        [
          {
            id: Number(apiProduct.id) * 1000,
            name:
              apiProduct.name ??
              apiProduct.product_name ??
              "Standard",
            sku:
              apiProduct.sku ??
              apiProduct.code ??
              `PROD-${apiProduct.id}`,
            color: "Standard",
            size: "Standard",
            stock: Number(
              apiProduct.current_stock ??
                apiProduct.quantity ??
                apiProduct.on_hand ??
                apiProduct.available ??
                0
            ),
            price: Number(
              apiProduct.selling_price ??
                apiProduct.purchase_price ??
                apiProduct.unit_cost ??
                0
            ),
          },
        ],
    }
  : fallbackProduct ?? storedProduct;

  const [selectedVariantId, setSelectedVariantId] =
    useState<number | null>(
      product?.variants[0]?.id ?? null
    );

  const [selectedWarehouse, setSelectedWarehouse] =
    useState("Main Store");

  const [bins, setBins] = useState<Bin[]>([
    {
      id: 1,
      warehouse: "Main Store",
      code: "A-01",
      name: "Main Store Bin A-01",
      capacity: 100,
    },
    {
      id: 2,
      warehouse: "Main Store",
      code: "A-02",
      name: "Main Store Bin A-02",
      capacity: 150,
    },
  ]);

  const [binCode, setBinCode] = useState("");
  const [binName, setBinName] = useState("");
  const [binCapacity, setBinCapacity] = useState("");

  const [ledgerFromDate, setLedgerFromDate] =
    useState("");

  const [ledgerToDate, setLedgerToDate] =
    useState("");

  const [stockLedger] =
    useState<StockLedgerEntry[]>([
      {
        id: 1,
        date: "2026-09-04",
        type: "Opening Stock",
        warehouse: "Main Store",
        reference: "OPEN-001",
        quantity: 24,
        balance: 24,
      },
      {
        id: 2,
        date: "2026-09-04",
        type: "Stock In",
        warehouse: "Main Store",
        reference: "GRN-2026-0091",
        quantity: 10,
        balance: 34,
      },
      {
        id: 3,
        date: "2026-09-03",
        type: "Sale",
        warehouse: "Main Store",
        reference: "SO-2026-0148",
        quantity: -5,
        balance: 29,
      },
      {
        id: 4,
        date: "2026-09-02",
        type: "Stock Adjustment",
        warehouse: "Main Store",
        reference: "ADJ-2026-0012",
        quantity: 2,
        balance: 31,
      },
      {
        id: 5,
        date: "2026-09-01",
        type: "Stock Transfer",
        warehouse: "Main Store",
        reference: "TRF-2026-0045",
        quantity: -5,
        balance: 26,
      },
    ]);

  const [showBarcode, setShowBarcode] =
    useState(false);

  const [scannerInput, setScannerInput] =
    useState("");

  const [scannerMessage, setScannerMessage] =
    useState("");

  const scannerRef =
    useRef<HTMLInputElement>(null);

  const selectedVariant = useMemo(() => {
  if (!product) {
    return undefined;
  }

  return (
    product.variants.find(
      (variant) =>
        variant.id === selectedVariantId
    ) ?? product.variants[0]
  );
}, [product, selectedVariantId]);

  const warehouseStocks =
  warehouseStock[product?.id ?? 0] ??
  (apiProduct
    ? [
        {
          warehouse:
            apiProduct.warehouse ??
            apiProduct.warehouse_name ??
            "Main Store",
          onHand: Number(
            apiProduct.current_stock ??
              apiProduct.quantity ??
              apiProduct.on_hand ??
              0
          ),
          reserved: Number(apiProduct.reserved ?? 0),
          available: Number(
            apiProduct.available ??
              apiProduct.current_stock ??
              apiProduct.quantity ??
              apiProduct.on_hand ??
              0
          ),
        },
      ]
    : []);

  const selectedWarehouseStock =
    warehouseStocks.find(
      (item) =>
        item.warehouse === selectedWarehouse
    ) ?? warehouseStocks[0];

  const filteredStockLedger =
    stockLedger.filter((entry) => {
      const matchesFromDate =
        !ledgerFromDate ||
        entry.date >= ledgerFromDate;

      const matchesToDate =
        !ledgerToDate ||
        entry.date <= ledgerToDate;

      return matchesFromDate && matchesToDate;
    });

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

    const foundVariant =
      product?.variants.find(
        (variant) =>
          variant.sku.toUpperCase() ===
          scannedSku
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

  const handleAddBin = () => {
    const code = binCode.trim();
    const name = binName.trim();
    const capacity = Number(binCapacity);

    if (!code || !name || capacity <= 0) {
      alert("Please fill all bin fields.");
      return;
    }

    const duplicate = bins.some(
      (bin) =>
        bin.warehouse === selectedWarehouse &&
        bin.code.toLowerCase() ===
          code.toLowerCase()
    );

    if (duplicate) {
      alert(
        "A bin with this code already exists in this warehouse."
      );
      return;
    }

    setBins((current) => [
      ...current,
      {
        id: Date.now(),
        warehouse: selectedWarehouse,
        code,
        name,
        capacity,
      },
    ]);

    setBinCode("");
    setBinName("");
    setBinCapacity("");
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
                onClick={() =>
                  router.push(
                    `/inventory/${product.id}/edit`
                  )
                }
                className="rounded-lg bg-[#12213a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1d3055]"
              >
                Edit Product
              </button>
            </div>
          </div>

          {/* PRODUCT + VARIANT */}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">

            {/* PRODUCT CARD */}

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

            {/* VARIANT PICKER */}

            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-2">
              <div className="mb-5">
                <h2 className="text-base font-bold text-[#12213a]">
                  Variant Picker
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Select a product variant to view
                  its SKU, stock, price, color and
                  size.
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

                    {/* SELECTED VARIANT ACTIONS */}

          {selectedVariant && (
            <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-base font-bold text-[#12213a]">
                  Variant Actions
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Manage barcode and stock actions for
                  the selected variant.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={openBarcode}
                  className="rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-blue-300 hover:bg-blue-50"
                >
                  <p className="text-sm font-bold text-[#12213a]">
                    Barcode Scanner
                  </p>

                  <p className="mt-1 text-[10px] text-gray-500">
                    Scan or enter the SKU to select a
                    variant.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      `Stock adjustment for ${selectedVariant.sku}`
                    )
                  }
                  className="rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-orange-300 hover:bg-orange-50"
                >
                  <p className="text-sm font-bold text-[#12213a]">
                    Adjust Stock
                  </p>

                  <p className="mt-1 text-[10px] text-gray-500">
                    Record a manual stock adjustment.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    router.push("/inventory")
                  }
                  className="rounded-lg border border-gray-200 bg-white p-4 text-left hover:border-green-300 hover:bg-green-50"
                >
                  <p className="text-sm font-bold text-[#12213a]">
                    View Inventory
                  </p>

                  <p className="mt-1 text-[10px] text-gray-500">
                    Return to the inventory product list.
                  </p>
                </button>
              </div>
            </section>
          )}

          {/* STOCK SUMMARY */}

          <section className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Total Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-[#12213a]">
                {selectedVariant?.stock ?? 0}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Selected variant
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Reserved
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-600">
                {selectedWarehouseStock?.reserved ??
                  0}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Current warehouse
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Available
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {selectedWarehouseStock?.available ??
                  selectedVariant?.stock ??
                  0}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Available to sell
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Unit Price
              </p>

              <p className="mt-2 text-2xl font-bold text-[#12213a]">
                {formatCurrency(
                  selectedVariant?.price ?? 0
                )}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                Current selling price
              </p>
            </div>
          </section>

          {/* BIN BUILDER */}

          <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-bold text-[#12213a]">
                Bin Builder
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Create and manage storage bins for
                this product.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-gray-600">
                  Warehouse
                </label>

                <select
                  value={selectedWarehouse}
                  onChange={(event) =>
                    setSelectedWarehouse(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                >
                  {warehouseStocks.map(
                    (warehouse) => (
                      <option
                        key={warehouse.warehouse}
                        value={warehouse.warehouse}
                      >
                        {warehouse.warehouse}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold text-gray-600">
                  Bin Code
                </label>

                <input
                  type="text"
                  value={binCode}
                  onChange={(event) =>
                    setBinCode(event.target.value)
                  }
                  placeholder="A-03"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold text-gray-600">
                  Bin Name
                </label>

                <input
                  type="text"
                  value={binName}
                  onChange={(event) =>
                    setBinName(event.target.value)
                  }
                  placeholder="Main Store Bin A-03"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold text-gray-600">
                  Capacity
                </label>

                <input
                  type="number"
                  min="1"
                  value={binCapacity}
                  onChange={(event) =>
                    setBinCapacity(event.target.value)
                  }
                  placeholder="100"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleAddBin}
                className="rounded-lg bg-[#12213a] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1d3055]"
              >
                Add Bin
              </button>
            </div>

            <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Warehouse
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Code
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Name
                    </th>

                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Capacity
                    </th>

                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {bins
                    .filter(
                      (bin) =>
                        bin.warehouse ===
                        selectedWarehouse
                    )
                    .map((bin) => (
                      <tr
                        key={bin.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {bin.warehouse}
                        </td>

                        <td className="px-4 py-3 font-mono text-xs font-semibold text-[#12213a]">
                          {bin.code}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-600">
                          {bin.name}
                        </td>

                        <td className="px-4 py-3 text-right text-xs font-semibold text-gray-700">
                          {bin.capacity}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setBins((current) =>
                                current.filter(
                                  (item) =>
                                    item.id !==
                                    bin.id
                                )
                              )
                            }
                            className="text-[10px] font-semibold text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                  {bins.filter(
                    (bin) =>
                      bin.warehouse ===
                      selectedWarehouse
                  ).length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-xs text-gray-400"
                      >
                        No bins created for this
                        warehouse.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* STOCK BY WAREHOUSE */}

          <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-[#12213a]">
                  Stock by Warehouse
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Warehouse-level stock availability
                  for the selected product.
                </p>
              </div>

              <select
                value={selectedWarehouse}
                onChange={(event) =>
                  setSelectedWarehouse(
                    event.target.value
                  )
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-blue-500"
              >
                {warehouseStocks.map(
                  (warehouse) => (
                    <option
                      key={warehouse.warehouse}
                      value={warehouse.warehouse}
                    >
                      {warehouse.warehouse}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {warehouseStocks.map(
                (warehouse) => (
                  <button
                    key={warehouse.warehouse}
                    type="button"
                    onClick={() =>
                      setSelectedWarehouse(
                        warehouse.warehouse
                      )
                    }
                    className={`rounded-xl border p-4 text-left transition ${
                      selectedWarehouse ===
                      warehouse.warehouse
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-[#12213a]">
                        {warehouse.warehouse}
                      </p>

                      {selectedWarehouse ===
                        warehouse.warehouse && (
                        <span className="rounded-full bg-blue-600 px-2 py-1 text-[9px] font-semibold text-white">
                          Selected
                        </span>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-gray-50 p-2">
                        <p className="text-[8px] uppercase text-gray-400">
                          On Hand
                        </p>

                        <p className="mt-1 text-sm font-bold text-[#12213a]">
                          {warehouse.onHand}
                        </p>
                      </div>

                      <div className="rounded-lg bg-orange-50 p-2">
                        <p className="text-[8px] uppercase text-orange-500">
                          Reserved
                        </p>

                        <p className="mt-1 text-sm font-bold text-orange-700">
                          {warehouse.reserved}
                        </p>
                      </div>

                      <div className="rounded-lg bg-green-50 p-2">
                        <p className="text-[8px] uppercase text-green-500">
                          Available
                        </p>

                        <p className="mt-1 text-sm font-bold text-green-700">
                          {warehouse.available}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>
          </section>

                    {/* RECENT INVENTORY ACTIVITY */}

          <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-[#12213a]">
                  Recent Inventory Activity
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Latest stock movements and inventory
                  events for this product.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push("/reports")
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                View Reports
              </button>
            </div>

            <div className="space-y-3">
              {[
                {
                  date: "04 Sep 2026",
                  type: "Stock In",
                  reference: "GRN-2026-0091",
                  quantity: "+10",
                  description:
                    "Goods received into Main Store.",
                  positive: true,
                },
                {
                  date: "03 Sep 2026",
                  type: "Sale",
                  reference: "SO-2026-0148",
                  quantity: "-5",
                  description:
                    "Stock deducted after completed sale.",
                  positive: false,
                },
                {
                  date: "02 Sep 2026",
                  type: "Adjustment",
                  reference: "ADJ-2026-0012",
                  quantity: "+2",
                  description:
                    "Manual stock adjustment recorded.",
                  positive: true,
                },
                {
                  date: "01 Sep 2026",
                  type: "Transfer",
                  reference: "TRF-2026-0045",
                  quantity: "-5",
                  description:
                    "Stock transferred from Main Store.",
                  positive: false,
                },
              ].map((activity) => (
                <div
                  key={activity.reference}
                  className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        activity.positive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {activity.positive
                        ? "+"
                        : "−"}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold text-[#12213a]">
                          {activity.type}
                        </p>

                        <span className="font-mono text-[9px] text-blue-600">
                          {activity.reference}
                        </span>
                      </div>

                      <p className="mt-1 text-[10px] text-gray-500">
                        {activity.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 md:justify-end">
                    <span className="text-[10px] text-gray-400">
                      {activity.date}
                    </span>

                    <span
                      className={`text-sm font-bold ${
                        activity.positive
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {activity.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* STOCK LEDGER */}

          <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-base font-bold text-[#12213a]">
                Stock Ledger
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                View stock movements and balances for
                this product.
              </p>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-[10px] font-semibold text-gray-600">
                  From Date
                </label>

                <input
                  type="date"
                  value={ledgerFromDate}
                  onChange={(event) =>
                    setLedgerFromDate(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] font-semibold text-gray-600">
                  To Date
                </label>

                <input
                  type="date"
                  value={ledgerToDate}
                  onChange={(event) =>
                    setLedgerToDate(
                      event.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setLedgerFromDate("");
                    setLedgerToDate("");
                  }}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Clear Dates
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-left">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Date
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Type
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Warehouse
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Reference
                    </th>

                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Quantity
                    </th>

                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                      Balance
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredStockLedger.map(
                    (entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-gray-50"
                      >
                        <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-700">
                          {entry.date}
                        </td>

                        <td className="px-4 py-3 text-xs font-semibold text-[#12213a]">
                          {entry.type}
                        </td>

                        <td className="px-4 py-3 text-xs text-gray-600">
                          {entry.warehouse}
                        </td>

                        <td className="px-4 py-3 text-xs text-blue-600">
                          {entry.reference}
                        </td>

                        <td
                          className={`px-4 py-3 text-right text-xs font-semibold ${
                            entry.quantity >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {entry.quantity > 0
                            ? "+"
                            : ""}
                          {entry.quantity}
                        </td>

                        <td className="px-4 py-3 text-right text-xs font-bold text-[#12213a]">
                          {entry.balance}
                        </td>
                      </tr>
                    )
                  )}

                  {filteredStockLedger.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-8 text-center text-xs text-gray-400"
                      >
                        No stock ledger entries
                        found for the selected date
                        range.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] text-gray-400">
                Showing{" "}
                {filteredStockLedger.length}{" "}
                ledger entries
              </p>

              <p className="text-[10px] text-gray-400">
                Positive = stock in · Negative =
                stock out
              </p>
            </div>
          </section>

          {/* INVENTORY NOTES */}

          <section className="mt-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="text-base font-bold text-[#12213a]">
                Inventory Notes
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Operational notes for this inventory
                product.
              </p>
            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs font-semibold text-blue-900">
                Stock management reminder
              </p>

              <p className="mt-1 text-[10px] leading-5 text-blue-700">
                Review warehouse availability,
                reserved quantities and recent stock
                movements before making manual
                adjustments.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-[9px] uppercase tracking-wide text-gray-400">
                  Selected Warehouse
                </p>

                <p className="mt-1 text-xs font-bold text-[#12213a]">
                  {selectedWarehouse}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-[9px] uppercase tracking-wide text-gray-400">
                  Selected SKU
                </p>

                <p className="mt-1 truncate font-mono text-xs font-bold text-[#12213a]">
                  {selectedVariant?.sku ?? "—"}
                </p>
              </div>

              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <p className="text-[9px] uppercase tracking-wide text-gray-400">
                  Current Balance
                </p>

                <p className="mt-1 text-xs font-bold text-green-600">
                  {selectedWarehouseStock?.available ??
                    0}{" "}
                  units
                </p>
              </div>
            </div>
          </section>

                {/* BARCODE SCANNER MODAL */}

          {showBarcode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-[#12213a]">
                      Barcode / SKU Scanner
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Scan a barcode or manually enter a
                      variant SKU.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeBarcode}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-sm font-bold text-gray-500 hover:bg-gray-200"
                    aria-label="Close scanner"
                  >
                    ×
                  </button>
                </div>

                <div className="mt-6 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 p-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm">
                    ▦
                  </div>

                  <p className="mt-3 text-sm font-bold text-blue-950">
                    Ready to Scan
                  </p>

                  <p className="mt-1 text-[10px] text-blue-600">
                    Place the cursor in the field below
                    and scan your barcode.
                  </p>
                </div>

                <div className="mt-5">
                  <label className="mb-1 block text-[10px] font-semibold text-gray-600">
                    Barcode / SKU
                  </label>

                  <input
                    ref={scannerRef}
                    type="text"
                    value={scannerInput}
                    onChange={handleScannerInput}
                    onKeyDown={handleScannerKeyDown}
                    placeholder={
                      selectedVariant?.sku ??
                      "Enter SKU"
                    }
                    autoComplete="off"
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-[10px] text-gray-400">
                    Press Enter after scanning or typing
                    the SKU.
                  </p>
                </div>

                {scannerMessage && (
                  <div
                    className={`mt-4 rounded-lg border p-3 text-xs font-semibold ${
                      scannerMessage.startsWith(
                        "Product found"
                      )
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {scannerMessage}
                  </div>
                )}

                {selectedVariant && (
                  <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-400">
                      Current Variant
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-[#12213a]">
                          {selectedVariant.name}
                        </p>

                        <p className="mt-1 font-mono text-[10px] text-gray-500">
                          {selectedVariant.sku}
                        </p>
                      </div>

                      <span className="rounded-full bg-green-100 px-2.5 py-1 text-[9px] font-semibold text-green-700">
                        Stock{" "}
                        {selectedVariant.stock}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeBarcode}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const scannedSku =
                        scannerInput
                          .trim()
                          .toUpperCase();

                      if (!scannedSku) {
                        setScannerMessage(
                          "Please scan or enter a SKU."
                        );
                        return;
                      }

                      const foundVariant =
                        product.variants.find(
                          (variant) =>
                            variant.sku.toUpperCase() ===
                            scannedSku
                        );

                      if (foundVariant) {
                        setSelectedVariantId(
                          foundVariant.id
                        );

                        setScannerMessage(
                          `Product found: ${foundVariant.name}`
                        );

                        setScannerInput("");
                      } else {
                        setScannerMessage(
                          "No product variant found for this barcode/SKU."
                        );
                      }
                    }}
                    className="rounded-lg bg-[#12213a] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1d3055]"
                  >
                    Search SKU
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  );
}