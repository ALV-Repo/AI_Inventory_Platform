"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageLayout from "../../components/layout/PageLayout";

type StockStatus = "Healthy" | "Low Stock" | "Out of Stock";

type Product = {
  id: number;
  name: string;
  sku: string;
  category: string;
  warehouse: string;
  onHand: number;
  reserved: number;
  reorderPoint: number;
  unitCost: number;
};

const initialProducts: Product[] = [
  {
    id: 1,
    name: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
    category: "Toys",
    warehouse: "Main Store",
    onHand: 24,
    reserved: 6,
    reorderPoint: 10,
    unitCost: 4200,
  },
  {
    id: 2,
    name: "Bluetooth Speaker",
    sku: "ELC-BT-600",
    category: "Electronics",
    warehouse: "Main Store",
    onHand: 8,
    reserved: 2,
    reorderPoint: 10,
    unitCost: 3200,
  },
  {
    id: 3,
    name: "Football Size 5",
    sku: "SPT-BL-900",
    category: "Sports",
    warehouse: "Warehouse A",
    onHand: 17,
    reserved: 2,
    reorderPoint: 8,
    unitCost: 1800,
  },
  {
    id: 4,
    name: "Christmas Tree 4ft",
    sku: "SEA-XM-960",
    category: "Seasonal",
    warehouse: "Main Store",
    onHand: 81,
    reserved: 0,
    reorderPoint: 15,
    unitCost: 12500,
  },
  {
    id: 5,
    name: "Fashion Doll Set",
    sku: "TOY-DL-410",
    category: "Toys",
    warehouse: "Warehouse B",
    onHand: 56,
    reserved: 6,
    reorderPoint: 12,
    unitCost: 380,
  },
  {
    id: 6,
    name: "Ceramic Planter",
    sku: "HOM-PL-810",
    category: "Home",
    warehouse: "Main Store",
    onHand: 53,
    reserved: 5,
    reorderPoint: 10,
    unitCost: 260,
  },
  {
    id: 7,
    name: "Wireless Keyboard",
    sku: "ELC-KB-120",
    category: "Electronics",
    warehouse: "Warehouse A",
    onHand: 3,
    reserved: 0,
    reorderPoint: 8,
    unitCost: 1200,
  },
  {
    id: 8,
    name: "USB Microphone",
    sku: "ELC-MC-500",
    category: "Electronics",
    warehouse: "Main Store",
    onHand: 0,
    reserved: 0,
    reorderPoint: 5,
    unitCost: 2400,
  },
  {
    id: 9,
    name: "Gaming Mouse",
    sku: "ELC-MS-100",
    category: "Electronics",
    warehouse: "Main Store",
    onHand: 20,
    reserved: 0,
    reorderPoint: 5,
    unitCost: 1500,
  },
];

const categories = [
  "All",
  "Electronics",
  "Toys",
  "Sports",
  "Seasonal",
  "Home",
];

const warehouses = [
  "Main Store",
  "Warehouse A",
  "Warehouse B",
];

function getAvailable(product: Product) {
  return Math.max(product.onHand - product.reserved, 0);
}

function getStatus(product: Product): StockStatus {
  if (product.onHand === 0) {
    return "Out of Stock";
  }

  if (getAvailable(product) <= product.reorderPoint) {
    return "Low Stock";
  }

  return "Healthy";
}

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function InventoryPage() {
  const router = useRouter();

  const [products, setProducts] =
    useState<Product[]>(initialProducts);

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [warehouse, setWarehouse] = useState("All");
  const [stockStatus, setStockStatus] = useState("All");

  // --------------------------------------------------
  // ADD PRODUCT
  // --------------------------------------------------

  const [showAddProduct, setShowAddProduct] =
    useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "Electronics",
    warehouse: "Main Store",
    quantity: "",
    reorderPoint: "10",
    unitCost: "",
  });

  // --------------------------------------------------
  // EDIT PRODUCT
  // --------------------------------------------------

  const [showEditProduct, setShowEditProduct] =
    useState(false);

  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  // --------------------------------------------------
  // STOCK ADJUSTMENT
  // --------------------------------------------------

  const [showAdjustment, setShowAdjustment] =
    useState(false);

  const [selectedProduct, setSelectedProduct] =
    useState<Product | null>(null);

  const [adjustmentType, setAdjustmentType] =
    useState<"increase" | "decrease">("increase");

  const [adjustmentQuantity, setAdjustmentQuantity] =
    useState("");

  const [adjustmentReason, setAdjustmentReason] =
    useState("");

  // --------------------------------------------------
  // TRANSFER STOCK
  // --------------------------------------------------

  const [showTransfer, setShowTransfer] =
    useState(false);

  const [transferProduct, setTransferProduct] =
    useState<Product | null>(null);

  const [transferFrom, setTransferFrom] =
    useState("");

  const [transferTo, setTransferTo] =
    useState("");

  const [transferQuantity, setTransferQuantity] =
    useState("");

  const [transferReason, setTransferReason] =
    useState("");

  // --------------------------------------------------
  // BARCODE SCANNER
  // --------------------------------------------------

  const [showBarcode, setShowBarcode] =
    useState(false);

  const [barcodeValue, setBarcodeValue] =
    useState("");

  const [barcodeProduct, setBarcodeProduct] =
    useState<Product | null>(null);

  // --------------------------------------------------
  // CYCLE COUNT
  // --------------------------------------------------

  const [showCycleCount, setShowCycleCount] =
    useState(false);

  const [cycleProduct, setCycleProduct] =
    useState<Product | null>(null);

  const [physicalQuantity, setPhysicalQuantity] =
    useState("");

  const [cycleReason, setCycleReason] =
    useState("");

  // --------------------------------------------------
  // FILTERED PRODUCTS
  // --------------------------------------------------

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = search
        .toLowerCase()
        .trim();

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(searchText) ||
        product.sku
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All" ||
        product.category === category;

      const matchesWarehouse =
        warehouse === "All" ||
        product.warehouse === warehouse;

      const matchesStatus =
        stockStatus === "All" ||
        getStatus(product) === stockStatus;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesWarehouse &&
        matchesStatus
      );
    });
  }, [
    products,
    search,
    category,
    warehouse,
    stockStatus,
  ]);

  // --------------------------------------------------
  // KPI VALUES
  // --------------------------------------------------

  const totalProducts = products.length;

  const totalUnits = products.reduce(
    (total, product) =>
      total + product.onHand,
    0
  );

  const stockValue = products.reduce(
    (total, product) =>
      total +
      product.onHand * product.unitCost,
    0
  );

  const needsAttention = products.filter(
    (product) =>
      getStatus(product) !== "Healthy"
  ).length;

  const lowStockCount = products.filter(
    (product) =>
      getStatus(product) === "Low Stock"
  ).length;

  const outOfStockCount = products.filter(
    (product) =>
      getStatus(product) === "Out of Stock"
  ).length;

  // --------------------------------------------------
  // VIEW PRODUCT
  // --------------------------------------------------

  function handleView(product: Product) {
  router.push(`/inventory/${product.id}`);
}

  // --------------------------------------------------
  // ADD PRODUCT
  // --------------------------------------------------

  function handleAddProduct(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !newProduct.name.trim() ||
      !newProduct.sku.trim()
    ) {
      alert(
        "Please enter product name and SKU."
      );
      return;
    }

    const quantity = Number(
      newProduct.quantity
    );

    const reorderPoint = Number(
      newProduct.reorderPoint
    );

    const unitCost = Number(
      newProduct.unitCost
    );

    if (
      Number.isNaN(quantity) ||
      Number.isNaN(reorderPoint) ||
      Number.isNaN(unitCost)
    ) {
      alert("Please enter valid numbers.");
      return;
    }

    const product: Product = {
      id: Date.now(),
      name: newProduct.name.trim(),
      sku: newProduct.sku
        .trim()
        .toUpperCase(),
      category: newProduct.category,
      warehouse: newProduct.warehouse,
      onHand: Math.max(quantity, 0),
      reserved: 0,
      reorderPoint: Math.max(
        reorderPoint,
        0
      ),
      unitCost: Math.max(
        unitCost,
        0
      ),
    };

    setProducts((current) => [
      ...current,
      product,
    ]);

    setNewProduct({
      name: "",
      sku: "",
      category: "Electronics",
      warehouse: "Main Store",
      quantity: "",
      reorderPoint: "10",
      unitCost: "",
    });

    setShowAddProduct(false);

    alert("Product added successfully.");
  }

  // --------------------------------------------------
  // EDIT PRODUCT
  // --------------------------------------------------

  function openEditProduct(
    product: Product
  ) {
    setEditingProduct({
      ...product,
    });

    setShowEditProduct(true);
  }

  function handleEditProduct(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!editingProduct) {
      return;
    }

    if (
      !editingProduct.name.trim() ||
      !editingProduct.sku.trim()
    ) {
      alert(
        "Please enter product name and SKU."
      );
      return;
    }

    if (
      !Number.isFinite(
        editingProduct.onHand
      ) ||
      editingProduct.onHand < 0
    ) {
      alert("Enter a valid stock quantity.");
      return;
    }

    if (
      !Number.isFinite(
        editingProduct.reorderPoint
      ) ||
      editingProduct.reorderPoint < 0
    ) {
      alert(
        "Enter a valid reorder point."
      );
      return;
    }

    if (
      !Number.isFinite(
        editingProduct.unitCost
      ) ||
      editingProduct.unitCost < 0
    ) {
      alert("Enter a valid unit cost.");
      return;
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === editingProduct.id
          ? {
              ...editingProduct,
              name: editingProduct.name.trim(),
              sku: editingProduct.sku
                .trim()
                .toUpperCase(),
            }
          : product
      )
    );

    setShowEditProduct(false);
    setEditingProduct(null);

    alert(
      "Product updated successfully."
    );
  }

  // --------------------------------------------------
  // STOCK ADJUSTMENT
  // --------------------------------------------------

  function openAdjustment(
    product: Product
  ) {
    setSelectedProduct(product);
    setAdjustmentType("increase");
    setAdjustmentQuantity("");
    setAdjustmentReason("");
    setShowAdjustment(true);
  }

  function handleAdjustment(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!selectedProduct) {
      return;
    }

    const quantity = Number(
      adjustmentQuantity
    );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      alert("Enter a valid quantity.");
      return;
    }

    if (
      adjustmentType === "decrease" &&
      quantity > selectedProduct.onHand
    ) {
      alert(
        "Quantity cannot be greater than current stock."
      );
      return;
    }

    setProducts((current) =>
      current.map((product) => {
        if (
          product.id !==
          selectedProduct.id
        ) {
          return product;
        }

        const newOnHand =
          adjustmentType ===
          "increase"
            ? product.onHand + quantity
            : Math.max(
                product.onHand -
                  quantity,
                0
              );

        return {
          ...product,
          onHand: newOnHand,
        };
      })
    );

    setShowAdjustment(false);
    setSelectedProduct(null);

    alert(
      "Stock adjusted successfully."
    );
  }

    // --------------------------------------------------
  // TRANSFER STOCK
  // --------------------------------------------------

  function openTransfer(product: Product) {
    setTransferProduct(product);
    setTransferFrom(product.warehouse);

    const defaultDestination =
      warehouses.find(
        (item) => item !== product.warehouse
      ) || "";

    setTransferTo(defaultDestination);
    setTransferQuantity("");
    setTransferReason("");
    setShowTransfer(true);
  }

  function handleTransfer(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!transferProduct) {
      return;
    }

    const quantity = Number(
      transferQuantity
    );

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      alert("Enter a valid transfer quantity.");
      return;
    }

    if (!transferFrom || !transferTo) {
      alert(
        "Please select both warehouses."
      );
      return;
    }

    if (transferFrom === transferTo) {
      alert(
        "Source and destination warehouses must be different."
      );
      return;
    }

    if (quantity > transferProduct.onHand) {
      alert(
        "Transfer quantity cannot exceed current stock."
      );
      return;
    }

    /*
     * Frontend demo:
     * We update the selected product's warehouse
     * and reduce its available quantity.
     *
     * The real create → approve → dispatch → receive
     * workflow will later connect to the backend API.
     */

    setProducts((current) =>
      current.map((product) => {
        if (
          product.id !==
          transferProduct.id
        ) {
          return product;
        }

        return {
          ...product,
          warehouse: transferTo,
          onHand: Math.max(
            product.onHand - quantity,
            0
          ),
        };
      })
    );

    setShowTransfer(false);
    setTransferProduct(null);

    alert(
      `Transfer created successfully.\n\n${quantity} units moved from ${transferFrom} to ${transferTo}.`
    );
  }

  // --------------------------------------------------
  // CYCLE COUNT
  // --------------------------------------------------

  function openCycleCount(
    product: Product
  ) {
    setCycleProduct(product);
    setPhysicalQuantity(
      product.onHand.toString()
    );
    setCycleReason("");
    setShowCycleCount(true);
  }

  function handleCycleCount(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!cycleProduct) {
      return;
    }

    const physical = Number(
      physicalQuantity
    );

    if (
      !Number.isFinite(physical) ||
      physical < 0
    ) {
      alert(
        "Enter a valid physical quantity."
      );
      return;
    }

    const variance =
      physical - cycleProduct.onHand;

    setProducts((current) =>
      current.map((product) =>
        product.id === cycleProduct.id
          ? {
              ...product,
              onHand: physical,
            }
          : product
      )
    );

    setShowCycleCount(false);
    setCycleProduct(null);

    alert(
      `Cycle count completed.\n\nVariance: ${
        variance > 0
          ? "+"
          : ""
      }${variance} units.`
    );
  }

  // --------------------------------------------------
  // BARCODE SEARCH
  // --------------------------------------------------

  function handleBarcodeSearch() {
    const value = barcodeValue
      .trim()
      .toLowerCase();

    if (!value) {
      alert(
        "Please enter or scan a barcode/SKU."
      );
      return;
    }

    const found = products.find(
      (product) =>
        product.sku.toLowerCase() === value ||
        product.name
          .toLowerCase()
          .includes(value)
    );

    if (!found) {
      setBarcodeProduct(null);

      alert(
        "No product found for this barcode or SKU."
      );

      return;
    }

    setBarcodeProduct(found);
  }

  // --------------------------------------------------
  // CLEAR FILTERS
  // --------------------------------------------------

  function clearFilters() {
    setSearch("");
    setCategory("All");
    setWarehouse("All");
    setStockStatus("All");
  }

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f8fafc] px-6 py-7 text-slate-900">

        <div className="mx-auto max-w-7xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#12213a]">
                Inventory
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                Manage products, stock levels, warehouses
                and inventory operations.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={() => {
                  setBarcodeValue("");
                  setBarcodeProduct(null);
                  setShowBarcode(true);
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Scan Barcode
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowTransfer(true)
                }
                className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 hover:bg-blue-100"
              >
                Transfer Stock
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowAddProduct(true)
                }
                className="rounded-lg bg-[#12213a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1d3055]"
              >
                + Add Product
              </button>

            </div>
          </div>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Total Products
              </p>

              <p className="mt-2 text-2xl font-bold text-[#12213a]">
                {totalProducts}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                Active products
              </p>

            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Total Units
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {totalUnits.toLocaleString("en-IN")}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                Units currently in stock
              </p>

            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Stock Value
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(stockValue)}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                Current inventory value
              </p>

            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                Needs Attention
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-500">
                {needsAttention}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                {lowStockCount} low stock ·{" "}
                {outOfStockCount} out of stock
              </p>

            </div>

          </div>

          {/* =================================================
              FILTERS
          ================================================= */}

          <section className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

            <div className="mb-3 flex items-center justify-between">

              <div>
                <h2 className="text-sm font-semibold text-[#12213a]">
                  Product Search & Filters
                </h2>

                <p className="mt-1 text-[10px] text-gray-400">
                  Search products and filter inventory
                  by category, warehouse or stock status.
                </p>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>

            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">

              {/* SEARCH */}

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Search
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Product name or SKU..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Category
                </label>

                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                >
                  {categories.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item === "All"
                          ? "All Categories"
                          : item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* WAREHOUSE */}

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Warehouse
                </label>

                <select
                  value={warehouse}
                  onChange={(e) =>
                    setWarehouse(e.target.value)
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                >
                  <option value="All">
                    All Warehouses
                  </option>

                  {warehouses.map(
                    (item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* STOCK STATUS */}

              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  Stock Status
                </label>

                <select
                  value={stockStatus}
                  onChange={(e) =>
                    setStockStatus(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-500"
                >
                  <option value="All">
                    All Status
                  </option>

                  <option value="Healthy">
                    Healthy
                  </option>

                  <option value="Low Stock">
                    Low Stock
                  </option>

                  <option value="Out of Stock">
                    Out of Stock
                  </option>
                </select>
              </div>

            </div>
          </section>

          {/* =================================================
              PRODUCT TABLE
          ================================================= */}

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="flex flex-col gap-3 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div>
                <h2 className="text-sm font-semibold text-[#12213a]">
                  Product List
                </h2>

                <p className="mt-1 text-[10px] text-gray-400">
                  Showing {filteredProducts.length} of{" "}
                  {products.length} products
                </p>
              </div>

              <div className="flex gap-2 text-[10px]">

                <span className="rounded-full bg-green-100 px-2.5 py-1 font-semibold text-green-700">
                  Healthy
                </span>

                <span className="rounded-full bg-orange-100 px-2.5 py-1 font-semibold text-orange-700">
                  Low Stock
                </span>

                <span className="rounded-full bg-red-100 px-2.5 py-1 font-semibold text-red-700">
                  Out of Stock
                </span>

              </div>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1000px] border-collapse text-xs">

                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Product
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Category
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Warehouse
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      On Hand
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Reserved
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Available
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Status
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Unit Cost
                    </th>

                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredProducts.map(
                    (product) => {
                      const status =
                        getStatus(product);

                      return (
                        <tr
                          key={product.id}
                          className="border-b border-gray-100 transition hover:bg-gray-50"
                        >

                          {/* PRODUCT */}

                          <td className="px-4 py-3">

                            <p className="font-semibold text-[#12213a]">
                              {product.name}
                            </p>

                            <p className="mt-0.5 font-mono text-[10px] text-gray-400">
                              {product.sku}
                            </p>

                          </td>

                          {/* CATEGORY */}

                          <td className="px-4 py-3 text-gray-600">
                            {product.category}
                          </td>

                          {/* WAREHOUSE */}

                          <td className="px-4 py-3 text-gray-600">
                            {product.warehouse}
                          </td>

                          {/* ON HAND */}

                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {product.onHand}
                          </td>

                          {/* RESERVED */}

                          <td className="px-4 py-3 text-gray-500">
                            {product.reserved}
                          </td>

                          {/* AVAILABLE */}

                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {getAvailable(
                              product
                            )}
                          </td>

                          {/* STATUS */}

                          <td className="px-4 py-3">

                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                                status ===
                                "Healthy"
                                  ? "bg-green-100 text-green-700"
                                  : status ===
                                    "Low Stock"
                                  ? "bg-orange-100 text-orange-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {status}
                            </span>

                          </td>

                          {/* UNIT COST */}

                          <td className="px-4 py-3 font-medium text-gray-700">
                            {formatCurrency(
                              product.unitCost
                            )}
                          </td>

                          {/* ACTIONS */}

                          <td className="px-4 py-3">

                            <div className="flex flex-wrap gap-1.5">

                              <button
                                type="button"
                                onClick={() =>
                                  handleView(
                                    product
                                  )
                                }
                                className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[10px] font-medium text-gray-700 hover:bg-gray-50"
                              >
                                View
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openEditProduct(
                                    product
                                  )
                                }
                                className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-blue-700 hover:bg-blue-100"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openAdjustment(
                                    product
                                  )
                                }
                                className="rounded-md bg-[#12213a] px-2.5 py-1.5 text-[10px] font-semibold text-white hover:bg-[#1d3055]"
                              >
                                Adjust
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openTransfer(
                                    product
                                  )
                                }
                                className="rounded-md border border-purple-200 bg-purple-50 px-2.5 py-1.5 text-[10px] font-semibold text-purple-700 hover:bg-purple-100"
                              >
                                Transfer
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openCycleCount(
                                    product
                                  )
                                }
                                className="rounded-md border border-teal-200 bg-teal-50 px-2.5 py-1.5 text-[10px] font-semibold text-teal-700 hover:bg-teal-100"
                              >
                                Count
                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

            {filteredProducts.length ===
              0 && (
              <div className="px-6 py-14 text-center">

                <p className="text-sm font-semibold text-gray-700">
                  No products found
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  Try changing your search or
                  filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-4 rounded-lg bg-[#12213a] px-4 py-2 text-xs font-semibold text-white"
                >
                  Clear Filters
                </button>

              </div>
            )}

          </section>

          {/* =================================================
              INVENTORY SUMMARY
          ================================================= */}

          <section className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">

            <div className="rounded-xl border border-gray-200 bg-white p-4">

              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                Low Stock Products
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-600">
                {lowStockCount}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                Products approaching reorder point
              </p>

            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">

              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                Out of Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {outOfStockCount}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                Products requiring replenishment
              </p>

            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">

              <p className="text-[10px] uppercase tracking-wide text-gray-400">
                Inventory Value
              </p>

              <p className="mt-2 text-2xl font-bold text-green-600">
                {formatCurrency(
                  stockValue
                )}
              </p>

              <p className="mt-1 text-[10px] text-gray-500">
                Total value of on-hand stock
              </p>

            </div>

          </section>

                    {/* =================================================
              ADD PRODUCT MODAL
          ================================================= */}

          {showAddProduct && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

              <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">

                {/* Modal Header */}

                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                  <div>
                    <h2 className="text-lg font-bold text-[#12213a]">
                      Add Product
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Add a new product to inventory.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowAddProduct(false)
                    }
                    className="text-xl text-gray-400 hover:text-gray-700"
                  >
                    ×
                  </button>

                </div>

                {/* Form */}

                <form
                  onSubmit={handleAddProduct}
                  className="space-y-4 p-5"
                >

                  {/* Product Name */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Product Name
                    </label>

                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter product name"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      required
                    />
                  </div>

                  {/* SKU */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      SKU
                    </label>

                    <input
                      type="text"
                      value={newProduct.sku}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          sku: e.target.value,
                        })
                      }
                      placeholder="Example: ELC-BT-700"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                      required
                    />
                  </div>

                  {/* Category + Warehouse */}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Category
                      </label>

                      <select
                        value={newProduct.category}
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            category:
                              e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      >
                        {categories
                          .filter(
                            (item) =>
                              item !== "All"
                          )
                          .map((item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Warehouse
                      </label>

                      <select
                        value={
                          newProduct.warehouse
                        }
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            warehouse:
                              e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      >
                        {warehouses.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                  </div>

                  {/* Quantity + Reorder Point */}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Initial Quantity
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          newProduct.quantity
                        }
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            quantity:
                              e.target.value,
                          })
                        }
                        placeholder="0"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Reorder Point
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          newProduct.reorderPoint
                        }
                        onChange={(e) =>
                          setNewProduct({
                            ...newProduct,
                            reorderPoint:
                              e.target.value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                  </div>

                  {/* Unit Cost */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Unit Cost
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        newProduct.unitCost
                      }
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          unitCost:
                            e.target.value,
                        })
                      }
                      placeholder="₹0.00"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Buttons */}

                  <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">

                    <button
                      type="button"
                      onClick={() =>
                        setShowAddProduct(false)
                      }
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="rounded-lg bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3055]"
                    >
                      Add Product
                    </button>

                  </div>

                </form>
              </div>
            </div>
          )}

          {/* =================================================
              EDIT PRODUCT MODAL
          ================================================= */}

          {showEditProduct &&
            editingProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">

                  {/* Header */}

                  <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                    <div>
                      <h2 className="text-lg font-bold text-[#12213a]">
                        Edit Product
                      </h2>

                      <p className="mt-1 text-xs text-gray-500">
                        Update product information.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowEditProduct(
                          false
                        );
                        setEditingProduct(
                          null
                        );
                      }}
                      className="text-xl text-gray-400 hover:text-gray-700"
                    >
                      ×
                    </button>

                  </div>

                  {/* Form */}

                  <form
                    onSubmit={
                      handleEditProduct
                    }
                    className="space-y-4 p-5"
                  >

                    {/* Product Name */}

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Product Name
                      </label>

                      <input
                        type="text"
                        value={
                          editingProduct.name
                        }
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            name: e.target
                              .value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* SKU */}

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        SKU
                      </label>

                      <input
                        type="text"
                        value={
                          editingProduct.sku
                        }
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            sku: e.target
                              .value,
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Category + Warehouse */}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                          Category
                        </label>

                        <select
                          value={
                            editingProduct.category
                          }
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              category:
                                e.target
                                  .value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                          {categories
                            .filter(
                              (item) =>
                                item !==
                                "All"
                            )
                            .map((item) => (
                              <option
                                key={item}
                                value={item}
                              >
                                {item}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                          Warehouse
                        </label>

                        <select
                          value={
                            editingProduct.warehouse
                          }
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              warehouse:
                                e.target
                                  .value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        >
                          {warehouses.map(
                            (item) => (
                              <option
                                key={item}
                                value={item}
                              >
                                {item}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                    </div>

                    {/* Stock + Reorder */}

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                          On Hand
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            editingProduct.onHand
                          }
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              onHand: Number(
                                e.target.value
                              ),
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-xs font-semibold text-gray-700">
                          Reorder Point
                        </label>

                        <input
                          type="number"
                          min="0"
                          value={
                            editingProduct.reorderPoint
                          }
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              reorderPoint:
                                Number(
                                  e.target
                                    .value
                                ),
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        />
                      </div>

                    </div>

                    {/* Unit Cost */}

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Unit Cost
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          editingProduct.unitCost
                        }
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            unitCost:
                              Number(
                                e.target
                                  .value
                              ),
                          })
                        }
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    {/* Buttons */}

                    <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">

                      <button
                        type="button"
                        onClick={() => {
                          setShowEditProduct(
                            false
                          );
                          setEditingProduct(
                            null
                          );
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="rounded-lg bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3055]"
                      >
                        Save Changes
                      </button>

                    </div>

                  </form>
                </div>
              </div>
            )}

          {/* =================================================
              STOCK ADJUSTMENT MODAL
          ================================================= */}

          {showAdjustment &&
            selectedProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">

                  {/* Header */}

                  <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                    <div>
                      <h2 className="text-lg font-bold text-[#12213a]">
                        Stock Adjustment
                      </h2>

                      <p className="mt-1 text-xs text-gray-500">
                        {selectedProduct.name}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowAdjustment(
                          false
                        );
                        setSelectedProduct(
                          null
                        );
                      }}
                      className="text-xl text-gray-400 hover:text-gray-700"
                    >
                      ×
                    </button>

                  </div>

                  {/* Current Stock */}

                  <div className="mx-5 mt-5 rounded-lg bg-gray-50 p-4">

                    <div className="flex items-center justify-between">

                      <span className="text-xs text-gray-500">
                        Current Stock
                      </span>

                      <span className="text-lg font-bold text-[#12213a]">
                        {selectedProduct.onHand}
                      </span>

                    </div>

                    <div className="mt-1 flex items-center justify-between">

                      <span className="text-xs text-gray-500">
                        Available
                      </span>

                      <span className="text-xs font-semibold text-gray-700">
                        {getAvailable(
                          selectedProduct
                        )}
                      </span>

                    </div>

                  </div>

                  {/* Form */}

                  <form
                    onSubmit={
                      handleAdjustment
                    }
                    className="space-y-4 p-5"
                  >

                    {/* Adjustment Type */}

                    <div>
                      <label className="mb-2 block text-xs font-semibold text-gray-700">
                        Adjustment Type
                      </label>

                      <div className="grid grid-cols-2 gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            setAdjustmentType(
                              "increase"
                            )
                          }
                          className={`rounded-lg border px-3 py-2.5 text-xs font-semibold ${
                            adjustmentType ===
                            "increase"
                              ? "border-green-500 bg-green-50 text-green-700"
                              : "border-gray-300 text-gray-600"
                          }`}
                        >
                          + Increase
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setAdjustmentType(
                              "decrease"
                            )
                          }
                          className={`rounded-lg border px-3 py-2.5 text-xs font-semibold ${
                            adjustmentType ===
                            "decrease"
                              ? "border-red-500 bg-red-50 text-red-700"
                              : "border-gray-300 text-gray-600"
                          }`}
                        >
                          − Decrease
                        </button>

                      </div>
                    </div>

                    {/* Quantity */}

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={
                          adjustmentQuantity
                        }
                        onChange={(e) =>
                          setAdjustmentQuantity(
                            e.target.value
                          )
                        }
                        placeholder="Enter quantity"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    {/* Reason Code */}

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Reason Code
                      </label>

                      <select
                        value={
                          adjustmentReason
                        }
                        onChange={(e) =>
                          setAdjustmentReason(
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                        required
                      >
                        <option value="">
                          Select reason
                        </option>

                        <option value="Damage">
                          Damage
                        </option>

                        <option value="Lost">
                          Lost
                        </option>

                        <option value="Found">
                          Found
                        </option>

                        <option value="Counting Error">
                          Counting Error
                        </option>

                        <option value="Expired">
                          Expired
                        </option>

                        <option value="Manual Correction">
                          Manual Correction
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </div>

                    {/* Buttons */}

                    <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">

                      <button
                        type="button"
                        onClick={() => {
                          setShowAdjustment(
                            false
                          );
                          setSelectedProduct(
                            null
                          );
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="rounded-lg bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3055]"
                      >
                        Save Adjustment
                      </button>

                    </div>

                  </form>
                </div>
              </div>
            )}

          {/* =================================================
              TRANSFER STOCK MODAL
          ================================================= */}

          {showTransfer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

              <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                  <div>
                    <h2 className="text-lg font-bold text-[#12213a]">
                      Transfer Stock
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Create a stock transfer between warehouses.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowTransfer(false);
                      setTransferProduct(null);
                    }}
                    className="text-xl text-gray-400 hover:text-gray-700"
                  >
                    ×
                  </button>

                </div>

                {/* Transfer Form */}

                <form
                  onSubmit={handleTransfer}
                  className="space-y-4 p-5"
                >

                  {/* Product */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Product
                    </label>

                    <select
                      value={
                        transferProduct?.id ?? ""
                      }
                      onChange={(e) => {
                        const product =
                          products.find(
                            (item) =>
                              item.id ===
                              Number(
                                e.target.value
                              )
                          );

                        if (product) {
                          setTransferProduct(
                            product
                          );
                          setTransferFrom(
                            product.warehouse
                          );
                        }
                      }}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">
                        Select product
                      </option>

                      {products.map(
                        (product) => (
                          <option
                            key={product.id}
                            value={product.id}
                          >
                            {product.name} —{" "}
                            {product.sku}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  {/* Current Stock */}

                  {transferProduct && (
                    <div className="rounded-lg bg-blue-50 p-3">

                      <div className="flex items-center justify-between">

                        <span className="text-xs text-blue-700">
                          Current Stock
                        </span>

                        <span className="font-bold text-blue-900">
                          {
                            transferProduct.onHand
                          }
                        </span>

                      </div>

                      <div className="mt-1 text-[10px] text-blue-600">
                        Current warehouse:{" "}
                        {
                          transferProduct.warehouse
                        }
                      </div>

                    </div>
                  )}

                  {/* From / To */}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        From Warehouse
                      </label>

                      <select
                        value={transferFrom}
                        onChange={(e) =>
                          setTransferFrom(
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="">
                          Select source
                        </option>

                        {warehouses.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        To Warehouse
                      </label>

                      <select
                        value={transferTo}
                        onChange={(e) =>
                          setTransferTo(
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="">
                          Select destination
                        </option>

                        {warehouses.map(
                          (item) => (
                            <option
                              key={item}
                              value={item}
                            >
                              {item}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                  </div>

                  {/* Quantity */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Transfer Quantity
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={
                        transferQuantity
                      }
                      onChange={(e) =>
                        setTransferQuantity(
                          e.target.value
                        )
                      }
                      placeholder="Enter quantity"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  {/* Reason */}

                  <div>
                    <label className="mb-1 block text-xs font-semibold text-gray-700">
                      Transfer Reason
                    </label>

                    <select
                      value={transferReason}
                      onChange={(e) =>
                        setTransferReason(
                          e.target.value
                        )
                      }
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                      <option value="">
                        Select reason
                      </option>

                      <option value="Replenishment">
                        Replenishment
                      </option>

                      <option value="Demand Balancing">
                        Demand Balancing
                      </option>

                      <option value="Warehouse Reallocation">
                        Warehouse Reallocation
                      </option>

                      <option value="Emergency Transfer">
                        Emergency Transfer
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>
                  </div>

                  {/* Workflow Status */}

                  <div className="rounded-lg border border-dashed border-gray-300 p-3">

                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      Transfer Workflow
                    </p>

                    <div className="flex items-center justify-between text-[10px]">

                      <span className="rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-700">
                        Create
                      </span>

                      <span className="text-gray-300">
                        →
                      </span>

                      <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-500">
                        Approve
                      </span>

                      <span className="text-gray-300">
                        →
                      </span>

                      <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-500">
                        Dispatch
                      </span>

                      <span className="text-gray-300">
                        →
                      </span>

                      <span className="rounded-full bg-gray-100 px-2 py-1 text-gray-500">
                        Receive
                      </span>

                    </div>

                  </div>

                  {/* Buttons */}

                  <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">

                    <button
                      type="button"
                      onClick={() => {
                        setShowTransfer(false);
                        setTransferProduct(
                          null
                        );
                      }}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="rounded-lg bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3055]"
                    >
                      Create Transfer
                    </button>

                  </div>

                </form>
              </div>
            </div>
          )}

          {/* =================================================
              CYCLE COUNT MODAL
          ================================================= */}

          {showCycleCount &&
            cycleProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

                <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">

                  {/* Header */}

                  <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                    <div>
                      <h2 className="text-lg font-bold text-[#12213a]">
                        Cycle Count
                      </h2>

                      <p className="mt-1 text-xs text-gray-500">
                        Verify physical stock and calculate variance.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowCycleCount(false);
                        setCycleProduct(null);
                      }}
                      className="text-xl text-gray-400 hover:text-gray-700"
                    >
                      ×
                    </button>

                  </div>

                  <form
                    onSubmit={handleCycleCount}
                    className="space-y-4 p-5"
                  >

                    {/* Product */}

                    <div className="rounded-lg bg-gray-50 p-4">

                      <p className="text-sm font-semibold text-[#12213a]">
                        {cycleProduct.name}
                      </p>

                      <p className="mt-1 font-mono text-[10px] text-gray-400">
                        {cycleProduct.sku}
                      </p>

                    </div>

                    {/* System Quantity */}

                    <div className="grid grid-cols-2 gap-3">

                      <div className="rounded-lg border border-gray-200 p-3">

                        <p className="text-[10px] uppercase tracking-wide text-gray-400">
                          System Quantity
                        </p>

                        <p className="mt-2 text-xl font-bold text-[#12213a]">
                          {
                            cycleProduct.onHand
                          }
                        </p>

                      </div>

                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">

                        <p className="text-[10px] uppercase tracking-wide text-blue-500">
                          Physical Quantity
                        </p>

                        <input
                          type="number"
                          min="0"
                          value={
                            physicalQuantity
                          }
                          onChange={(e) =>
                            setPhysicalQuantity(
                              e.target.value
                            )
                          }
                          className="mt-1 w-full bg-transparent text-xl font-bold text-blue-900 outline-none"
                        />

                      </div>

                    </div>

                    {/* Variance Preview */}

                    <div className="rounded-lg border border-dashed border-gray-300 p-3">

                      <div className="flex items-center justify-between">

                        <span className="text-xs text-gray-500">
                          Expected Variance
                        </span>

                        <span
                          className={`text-sm font-bold ${
                            Number(
                              physicalQuantity ||
                                0
                            ) -
                              cycleProduct.onHand >
                            0
                              ? "text-green-600"
                              : Number(
                                    physicalQuantity ||
                                      0
                                  ) -
                                    cycleProduct.onHand <
                                0
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {Number(
                            physicalQuantity ||
                              0
                          ) -
                            cycleProduct.onHand >
                          0
                            ? "+"
                            : ""}
                          {Number(
                            physicalQuantity ||
                              0
                          ) -
                            cycleProduct.onHand}
                        </span>

                      </div>

                    </div>

                    {/* Reason */}

                    <div>
                      <label className="mb-1 block text-xs font-semibold text-gray-700">
                        Count Reason
                      </label>

                      <select
                        value={cycleReason}
                        onChange={(e) =>
                          setCycleReason(
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="">
                          Select reason
                        </option>

                        <option value="Routine Cycle Count">
                          Routine Cycle Count
                        </option>

                        <option value="Annual Stock Count">
                          Annual Stock Count
                        </option>

                        <option value="Variance Investigation">
                          Variance Investigation
                        </option>

                        <option value="Audit">
                          Audit
                        </option>

                        <option value="Other">
                          Other
                        </option>
                      </select>
                    </div>

                    {/* Buttons */}

                    <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">

                      <button
                        type="button"
                        onClick={() => {
                          setShowCycleCount(false);
                          setCycleProduct(
                            null
                          );
                        }}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="rounded-lg bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3055]"
                      >
                        Complete Count
                      </button>

                    </div>

                  </form>
                </div>
              </div>
            )}

          {/* =================================================
              BARCODE SCANNER MODAL
          ================================================= */}

          {showBarcode && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

              <div className="w-full max-w-md rounded-xl bg-white shadow-2xl">

                {/* Header */}

                <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

                  <div>
                    <h2 className="text-lg font-bold text-[#12213a]">
                      Barcode Scanner
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Scan a barcode or enter a product SKU.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setShowBarcode(false)
                    }
                    className="text-xl text-gray-400 hover:text-gray-700"
                  >
                    ×
                  </button>

                </div>

                {/* Scanner Area */}

                <div className="p-5">

                  <div className="mb-4 flex h-36 items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50">

                    <div className="text-center">

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-white text-2xl shadow-sm">
                        ▦
                      </div>

                      <p className="mt-3 text-xs font-semibold text-blue-800">
                        Scanner Input Ready
                      </p>

                      <p className="mt-1 text-[10px] text-blue-500">
                        Connect a barcode scanner or type the SKU below.
                      </p>

                    </div>

                  </div>

                  {/* Input */}

                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Barcode / SKU
                  </label>

                  <div className="flex gap-2">

                    <input
                      autoFocus
                      type="text"
                      value={barcodeValue}
                      onChange={(e) =>
                        setBarcodeValue(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter"
                        ) {
                          e.preventDefault();
                          handleBarcodeSearch();
                        }
                      }}
                      placeholder="Scan or enter SKU..."
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-mono outline-none focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={
                        handleBarcodeSearch
                      }
                      className="rounded-lg bg-[#12213a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1d3055]"
                    >
                      Search
                    </button>

                  </div>

                  {/* Result */}

                  {barcodeProduct && (
                    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">

                      <div className="flex items-start justify-between">

                        <div>

                          <p className="text-sm font-bold text-green-900">
                            {
                              barcodeProduct.name
                            }
                          </p>

                          <p className="mt-1 font-mono text-[10px] text-green-700">
                            {
                              barcodeProduct.sku
                            }
                          </p>

                        </div>

                        <span className="rounded-full bg-green-100 px-2 py-1 text-[10px] font-semibold text-green-700">
                          Product Found
                        </span>

                      </div>

                      <div className="mt-3 grid grid-cols-3 gap-2">

                        <div className="rounded-lg bg-white p-2">

                          <p className="text-[9px] text-gray-400">
                            On Hand
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-800">
                            {
                              barcodeProduct.onHand
                            }
                          </p>

                        </div>

                        <div className="rounded-lg bg-white p-2">

                          <p className="text-[9px] text-gray-400">
                            Available
                          </p>

                          <p className="mt-1 text-sm font-bold text-gray-800">
                            {getAvailable(
                              barcodeProduct
                            )}
                          </p>

                        </div>

                        <div className="rounded-lg bg-white p-2">

                          <p className="text-[9px] text-gray-400">
                            Warehouse
                          </p>

                          <p className="mt-1 truncate text-xs font-bold text-gray-800">
                            {
                              barcodeProduct.warehouse
                            }
                          </p>

                        </div>

                      </div>

                    </div>
                  )}

                  {/* Footer */}

                  <div className="mt-5 flex justify-end">

                    <button
                      type="button"
                      onClick={() =>
                        setShowBarcode(false)
                      }
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Close
                    </button>

                  </div>

                </div>
              </div>
            </div>
          )}

          {/* =================================================
              PAGE FOOTER
          ================================================= */}

          <div className="py-8 text-center text-[10px] text-gray-400">
            AI StockFlow • Inventory Management
          </div>

        </div>
      </main>
    </PageLayout>
  );
}


