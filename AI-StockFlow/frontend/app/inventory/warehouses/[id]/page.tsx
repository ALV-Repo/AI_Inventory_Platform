"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageLayout from "../../../../components/layout/PageLayout";

type Warehouse = {
  id: number | string;
  name: string;
  code: string;
  location: string;
  manager: string;
  capacity: number;
  used: number;
  products: number;
  status: "Active" | "Inactive";
  address?: string;
  phone?: string;
  email?: string;
  type?: "Distribution" | "Retail" | "Storage" | "Transit";
};

type InventoryProduct = {
  id: number;
  name: string;
  sku: string;
  warehouse: string;
  storageLocation: string;
  onHand: number;
  reserved: number;
  [key: string]: unknown;
};

type LedgerEntry = {
  id?: string | number;
  timestamp?: string;
  product?: string;
  sku?: string;
  warehouse?: string;
  movementType?: string;
  quantity?: number;
  stockBefore?: number;
  stockAfter?: number;
  availableBefore?: number;
  availableAfter?: number;
  reason?: string;
  reference?: string;
  user?: string;
  source?: string;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "IN" | "OUT" | "COUNT" | "ADJUSTMENT" | "TRANSFER";
};

const initialWarehouses: Warehouse[] = [
  {
    id: 1,
    name: "Main Store",
    code: "WH-MAIN",
    location: "Hyderabad",
    manager: "Admin User",
    capacity: 10000,
    used: 7200,
    products: 128,
    status: "Active",
    type: "Distribution",
  },
  {
    id: 2,
    name: "Warehouse A",
    code: "WH-A",
    location: "Vijayawada",
    manager: "Rahul",
    capacity: 8000,
    used: 5100,
    products: 84,
    status: "Active",
    type: "Storage",
  },
  {
    id: 3,
    name: "Warehouse B",
    code: "WH-B",
    location: "Visakhapatnam",
    manager: "Priya",
    capacity: 6000,
    used: 2900,
    products: 61,
    status: "Active",
    type: "Distribution",
  },
  {
    id: 4,
    name: "Old Storage",
    code: "WH-OLD",
    location: "Guntur",
    manager: "Admin User",
    capacity: 4000,
    used: 0,
    products: 0,
    status: "Inactive",
    type: "Storage",
  },
];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function readWarehouses(): Warehouse[] {
  try {
    const raw = localStorage.getItem("inventory-warehouses");
    if (!raw) return initialWarehouses;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return initialWarehouses;

    return parsed.map((item) => ({
      ...item,
      id: item.id ?? Date.now(),
      name: String(item.name ?? ""),
      code: String(item.code ?? ""),
      location: String(item.location ?? ""),
      manager: String(item.manager ?? "Admin User"),
      capacity: Number(item.capacity ?? 0),
      used: Number(item.used ?? 0),
      products: Number(item.products ?? 0),
      status: item.status === "Inactive" ? "Inactive" : "Active",
    }));
  } catch {
    return initialWarehouses;
  }
}

function readInventoryProducts(): InventoryProduct[] {
  try {
    const raw = localStorage.getItem("inventory-products");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item) => ({
      ...item,
      id: Number(item.id ?? 0),
      name: String(item.name ?? item.product_name ?? ""),
      sku: String(item.sku ?? item.code ?? ""),
      warehouse: String(item.warehouse ?? item.warehouse_name ?? "Main Store"),
      storageLocation: String(
        item.storageLocation ??
          item.storage_location ??
          item.location ??
          "Not assigned"
      ),
      onHand: Math.max(
        0,
        Number(item.onHand ?? item.on_hand ?? item.quantity ?? 0)
      ),
      reserved: Math.max(0, Number(item.reserved ?? 0)),
    }));
  } catch {
    return [];
  }
}

function readLedger(): LedgerEntry[] {
  try {
    const raw = localStorage.getItem("inventory-stock-ledger");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDateTime(value?: string) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function movementToActivityType(
  movement?: string
): ActivityItem["type"] {
  const normalized = String(movement ?? "").toUpperCase();
  if (
    normalized.includes("STOCK IN") ||
    normalized === "IN" ||
    normalized === "RECEIPT"
  ) {
    return "IN";
  }
  if (
    normalized.includes("STOCK OUT") ||
    normalized === "OUT" ||
    normalized === "SALE" ||
    normalized === "BUNDLE"
  ) {
    return "OUT";
  }
  if (normalized === "TRANSFER") return "TRANSFER";
  if (normalized === "CYCLE COUNT") return "COUNT";
  return "ADJUSTMENT";
}

export default function WarehouseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const warehouseId = String(params.id ?? "");

  const [warehouses, setWarehouses] =
    useState<Warehouse[]>(initialWarehouses);
  const [inventoryProducts, setInventoryProducts] =
    useState<InventoryProduct[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editManager, setEditManager] = useState("");
  const [editCapacity, setEditCapacity] = useState(1000);
  const [editType, setEditType] =
    useState<NonNullable<Warehouse["type"]>>("Storage");
  const [editAddress, setEditAddress] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const [stockProductId, setStockProductId] = useState("");
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockReference, setStockReference] = useState("");
  const [stockReason, setStockReason] = useState("Manual warehouse stock receipt");

  useEffect(() => {
    setWarehouses(readWarehouses());
    setInventoryProducts(readInventoryProducts());
    setLedger(readLedger());
    setHydrated(true);
  }, []);

  const warehouse = useMemo(() => {
    if (!hydrated) return undefined;

    return warehouses.find((item) => {
      const id = String(item.id);
      return (
        id === warehouseId ||
        slugify(item.name) === warehouseId ||
        slugify(item.code) === warehouseId
      );
    });
  }, [hydrated, warehouses, warehouseId]);

  const warehouseProducts = useMemo(() => {
    if (!warehouse) return [];

    const warehouseName = warehouse.name.trim().toLowerCase();
    return inventoryProducts.filter(
      (product) =>
        product.warehouse.trim().toLowerCase() === warehouseName
    );
  }, [inventoryProducts, warehouse]);

  const stockMetrics = useMemo(() => {
    const onHand = warehouseProducts.reduce(
      (sum, product) => sum + product.onHand,
      0
    );
    const reserved = warehouseProducts.reduce(
      (sum, product) => sum + product.reserved,
      0
    );

    return {
      productCount: warehouseProducts.length,
      onHand,
      reserved,
      available: Math.max(onHand - reserved, 0),
    };
  }, [warehouseProducts]);

  const warehouseLedger = useMemo(() => {
    if (!warehouse) return [];

    const name = warehouse.name.trim().toLowerCase();
    return ledger
      .filter(
        (entry) =>
          String(entry.warehouse ?? "").trim().toLowerCase() === name
      )
      .sort((a, b) => {
        const left = new Date(a.timestamp ?? 0).getTime();
        const right = new Date(b.timestamp ?? 0).getTime();
        return right - left;
      });
  }, [ledger, warehouse]);

  const activities = useMemo<ActivityItem[]>(() => {
    return warehouseLedger.slice(0, 8).map((entry, index) => {
      const type = movementToActivityType(entry.movementType);
      const movementLabel =
        type === "IN"
          ? "Stock received"
          : type === "OUT"
          ? "Stock issued"
          : type === "TRANSFER"
          ? "Stock transferred"
          : type === "COUNT"
          ? "Cycle count activity"
          : "Stock adjusted";

      const quantity = Math.abs(Number(entry.quantity ?? 0));

      return {
        id: String(entry.id ?? `${entry.timestamp}-${index}`),
        title: movementLabel,
        description: `${entry.product ?? entry.sku ?? "Inventory item"}${
          quantity ? ` — ${quantity.toLocaleString("en-IN")} units` : ""
        }${entry.reference ? ` • ${entry.reference}` : ""}`,
        time: formatDateTime(entry.timestamp),
        type,
      };
    });
  }, [warehouseLedger]);

  const utilization = useMemo(() => {
    if (!warehouse || warehouse.capacity <= 0) return 0;
    return Math.round((warehouse.used / warehouse.capacity) * 100);
  }, [warehouse]);

  const availableCapacity = warehouse
    ? Math.max(warehouse.capacity - warehouse.used, 0)
    : 0;

  useEffect(() => {
    if (!warehouse) return;

    setEditName(warehouse.name);
    setEditLocation(warehouse.location);
    setEditManager(warehouse.manager);
    setEditCapacity(warehouse.capacity);
    setEditType(warehouse.type ?? "Storage");
    setEditAddress(warehouse.address ?? "");
    setEditPhone(warehouse.phone ?? "");
    setEditEmail(warehouse.email ?? "");
  }, [warehouse]);

  const persistWarehouses = (updated: Warehouse[]) => {
    setWarehouses(updated);
    localStorage.setItem("inventory-warehouses", JSON.stringify(updated));
  };

  const appendLedger = (entry: LedgerEntry) => {
    const next = [
      {
        ...entry,
        id: entry.id ?? `WH-${Date.now()}`,
        timestamp: entry.timestamp ?? new Date().toISOString(),
        user: entry.user ?? "Admin User",
        source: entry.source ?? "Warehouse Detail",
      },
      ...ledger,
    ];
    setLedger(next);
    localStorage.setItem("inventory-stock-ledger", JSON.stringify(next));
  };

  const updateWarehouse = () => {
    if (!warehouse) return;

    const cleanName = editName.trim();
    const cleanLocation = editLocation.trim();
    const cleanManager = editManager.trim() || "Admin User";

    if (!cleanName || !cleanLocation) {
      alert("Warehouse name and location are required.");
      return;
    }

    if (editCapacity <= 0) {
      alert("Capacity must be greater than 0.");
      return;
    }

    if (editCapacity < warehouse.used) {
      alert(
        `Capacity cannot be lower than current used capacity (${warehouse.used.toLocaleString(
          "en-IN"
        )}).`
      );
      return;
    }

    const duplicate = warehouses.some(
      (item) =>
        String(item.id) !== String(warehouse.id) &&
        item.name.trim().toLowerCase() === cleanName.toLowerCase()
    );

    if (duplicate) {
      alert("Another warehouse already uses this name.");
      return;
    }

    setSaving(true);

    const updatedWarehouse: Warehouse = {
      ...warehouse,
      name: cleanName,
      location: cleanLocation,
      manager: cleanManager,
      capacity: editCapacity,
      type: editType,
      address: editAddress.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
    };

    const updated = warehouses.map((item) =>
      String(item.id) === String(warehouse.id)
        ? updatedWarehouse
        : item
    );

    persistWarehouses(updated);

    if (updatedWarehouse.name !== warehouse.name) {
      const products = inventoryProducts.map((product) =>
        product.warehouse.trim().toLowerCase() ===
        warehouse.name.trim().toLowerCase()
          ? { ...product, warehouse: updatedWarehouse.name }
          : product
      );
      setInventoryProducts(products);
      localStorage.setItem("inventory-products", JSON.stringify(products));
    }

    appendAuditLog(
      `${warehouse.name} warehouse details updated`
    );

    setSaving(false);
    setShowEdit(false);
    alert("Warehouse updated successfully.");
  };

  const appendAuditLog = (description: string) => {
    try {
      const raw = localStorage.getItem("audit-logs");
      const logs = raw ? JSON.parse(raw) : [];

      const next = [
        {
          id: `AUD-WH-${Date.now()}`,
          timestamp: new Date().toLocaleString("en-IN"),
          user: "Admin User",
          role: "Admin",
          action: "Warehouse Update",
          module: "Warehouse",
          description,
          status: "Success",
          ip: "Local",
        },
        ...(Array.isArray(logs) ? logs : []),
      ];

      localStorage.setItem("audit-logs", JSON.stringify(next));
    } catch {
      // Frontend audit persistence is best-effort.
    }
  };

  const addStock = () => {
    if (!warehouse) return;

    const quantity = Number(stockQuantity);

    if (!stockProductId) {
      alert("Select a product.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    const productIndex = inventoryProducts.findIndex(
      (product) => String(product.id) === stockProductId
    );

    if (productIndex < 0) {
      alert("Selected product was not found.");
      return;
    }

    const current = inventoryProducts[productIndex];

    if (
      current.warehouse.trim().toLowerCase() !==
      warehouse.name.trim().toLowerCase()
    ) {
      alert("Selected product is not assigned to this warehouse.");
      return;
    }

    const before = current.onHand;
    const availableBefore = Math.max(before - current.reserved, 0);
    const after = before + quantity;

    const updatedProducts = [...inventoryProducts];
    updatedProducts[productIndex] = {
      ...current,
      onHand: after,
    };

    setInventoryProducts(updatedProducts);
    localStorage.setItem(
      "inventory-products",
      JSON.stringify(updatedProducts)
    );

    const reference =
      stockReference.trim() || `WH-RECEIPT-${Date.now()}`;

    appendLedger({
      id: `WH-IN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      product: current.name,
      sku: current.sku,
      warehouse: warehouse.name,
      movementType: "STOCK IN",
      quantity,
      stockBefore: before,
      stockAfter: after,
      availableBefore,
      availableAfter: Math.max(after - current.reserved, 0),
      reason: stockReason.trim() || "Manual warehouse stock receipt",
      reference,
      user: "Admin User",
      source: "Warehouse Detail",
    });

    const updatedWarehouse: Warehouse = {
      ...warehouse,
      used: warehouse.used + quantity,
    };

    persistWarehouses(
      warehouses.map((item) =>
        String(item.id) === String(warehouse.id)
          ? updatedWarehouse
          : item
      )
    );

    appendAuditLog(
      `${quantity.toLocaleString(
        "en-IN"
      )} units of ${current.name} added to ${warehouse.name}`
    );

    setStockProductId("");
    setStockQuantity(1);
    setStockReference("");
    setStockReason("Manual warehouse stock receipt");
    setShowAddStock(false);
    alert("Stock added successfully.");
  };

  const toggleStatus = () => {
    if (!warehouse) return;

    const nextStatus: Warehouse["status"] =
      warehouse.status === "Active" ? "Inactive" : "Active";

    const updated: Warehouse[] = warehouses.map((item) =>
      String(item.id) === String(warehouse.id)
        ? { ...item, status: nextStatus }
        : item
    );

    persistWarehouses(updated);
    appendAuditLog(
      `${warehouse.name} status changed to ${nextStatus}`
    );
  };

  if (!hydrated) {
    return (
      <PageLayout>
        <main className="min-h-screen bg-slate-50 p-6">
          <div className="mx-auto max-w-7xl animate-pulse">
            <div className="h-5 w-36 rounded bg-slate-200" />
            <div className="mt-4 h-10 w-72 rounded bg-slate-200" />
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-28 rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>
          </div>
        </main>
      </PageLayout>
    );
  }

  if (!warehouse) {
    return (
      <PageLayout>
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-6">
          <div className="mx-auto max-w-6xl">
            <button
              type="button"
              onClick={() => router.push("/inventory/warehouses")}
              className="mb-5 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              ← Back to Warehouses
            </button>

            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                WH
              </div>
              <h1 className="mt-5 text-2xl font-bold text-slate-900">
                Warehouse Not Found
              </h1>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                The requested warehouse does not exist in the current
                warehouse master.
              </p>
              <button
                type="button"
                onClick={() => router.push("/inventory/warehouses")}
                className="mt-6 rounded-xl bg-[#12213a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3154]"
              >
                Back to Warehouses
              </button>
            </div>
          </div>
        </main>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <button
              type="button"
              onClick={() => router.push("/inventory/warehouses")}
              className="mb-4 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              ← Back to Warehouses
            </button>

            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-600">
                  <span>Inventory</span>
                  <span className="text-slate-300">/</span>
                  <span>Warehouses</span>
                  <span className="text-slate-300">/</span>
                  <span className="text-slate-500">{warehouse.code}</span>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    {warehouse.name}
                  </h1>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      warehouse.status === "Active"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {warehouse.status}
                  </span>
                </div>

                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  {warehouse.location} • {warehouse.type ?? "Storage"} •{" "}
                  {warehouse.manager}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setShowEdit(true)}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                >
                  Edit Warehouse
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddStock(true)}
                  className="rounded-xl bg-[#12213a] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#1c3154]"
                >
                  + Add Stock
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="On Hand"
              value={stockMetrics.onHand.toLocaleString("en-IN")}
              description="Current physical inventory"
              accent="blue"
            />
            <SummaryCard
              label="Reserved"
              value={stockMetrics.reserved.toLocaleString("en-IN")}
              description="Allocated against orders"
              accent="orange"
            />
            <SummaryCard
              label="Available"
              value={stockMetrics.available.toLocaleString("en-IN")}
              description="On hand less reserved"
              accent="green"
            />
            <SummaryCard
              label="Products"
              value={stockMetrics.productCount.toLocaleString("en-IN")}
              description="Inventory records in warehouse"
              accent="slate"
            />
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                    Warehouse profile
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Warehouse Information
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Master data and operational ownership.
                  </p>
                </div>

                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  {warehouse.code}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <InfoBox label="Warehouse Name" value={warehouse.name} />
                <InfoBox label="Location" value={warehouse.location} />
                <InfoBox label="Manager" value={warehouse.manager} />
                <InfoBox
                  label="Warehouse Type"
                  value={warehouse.type ?? "Storage"}
                />
                <InfoBox
                  label="Address"
                  value={warehouse.address || "Not provided"}
                />
                <InfoBox
                  label="Contact"
                  value={warehouse.phone || warehouse.email || "Not provided"}
                />
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                Capacity
              </p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <h2 className="text-xl font-bold text-slate-900">
                  Storage Utilization
                </h2>
                <span className="text-2xl font-bold text-blue-600">
                  {utilization}%
                </span>
              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all ${
                    utilization >= 90
                      ? "bg-red-500"
                      : utilization >= 70
                      ? "bg-orange-500"
                      : "bg-blue-600"
                  }`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <MiniMetric
                  label="Used"
                  value={warehouse.used.toLocaleString("en-IN")}
                />
                <MiniMetric
                  label="Available"
                  value={availableCapacity.toLocaleString("en-IN")}
                />
                <MiniMetric
                  label="Total"
                  value={warehouse.capacity.toLocaleString("en-IN")}
                />
                <MiniMetric
                  label="Status"
                  value={warehouse.status}
                />
              </div>
            </section>
          </div>

          <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  Live inventory
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Products in this Warehouse
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Stock is read from the shared inventory product store.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/inventory")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Open Inventory →
              </button>
            </div>

            {warehouseProducts.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-500">
                  SKU
                </div>
                <p className="mt-4 font-semibold text-slate-800">
                  No inventory records assigned
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Products assigned to this warehouse will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Product
                        </th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          SKU
                        </th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Location
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                          On Hand
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                          Reserved
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                          Available
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {warehouseProducts
                        .slice(0, showAllProducts ? undefined : 8)
                        .map((product) => {
                          const available = Math.max(
                            product.onHand - product.reserved,
                            0
                          );
                          return (
                            <tr
                              key={product.id}
                              className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                            >
                              <td className="px-6 py-4">
                                <p className="font-semibold text-slate-900">
                                  {product.name}
                                </p>
                              </td>
                              <td className="px-4 py-4 font-mono text-xs text-slate-500">
                                {product.sku}
                              </td>
                              <td className="px-4 py-4 text-sm text-slate-600">
                                {product.storageLocation}
                              </td>
                              <td className="px-4 py-4 text-right text-sm font-bold text-slate-900">
                                {product.onHand.toLocaleString("en-IN")}
                              </td>
                              <td className="px-4 py-4 text-right text-sm font-semibold text-orange-600">
                                {product.reserved.toLocaleString("en-IN")}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <span
                                  className={`text-sm font-bold ${
                                    available <= 0
                                      ? "text-red-600"
                                      : available <= 10
                                      ? "text-orange-600"
                                      : "text-emerald-600"
                                  }`}
                                >
                                  {available.toLocaleString("en-IN")}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {warehouseProducts.length > 8 && (
                  <div className="flex justify-center border-t border-slate-100 px-6 py-4">
                    <button
                      type="button"
                      onClick={() => setShowAllProducts((value) => !value)}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {showAllProducts
                        ? "Show Less"
                        : `View All ${warehouseProducts.length} Products`}
                    </button>
                  </div>
                )}
              </>
            )}
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                  Audit-ready movement history
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Recent Warehouse Activity
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest movements recorded in the inventory stock ledger.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/inventory/stock-ledger")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                Open Stock Ledger →
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {activities.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                  <p className="font-semibold text-slate-700">
                    No recent activity
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Inventory receipts, transfers, sales and adjustments will
                    appear here when recorded.
                  </p>
                </div>
              ) : (
                activities.map((activity) => (
                  <Activity
                    key={activity.id}
                    title={activity.title}
                    description={activity.description}
                    time={activity.time}
                    type={activity.type}
                  />
                ))
              )}
            </div>
          </section>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => router.push("/inventory/warehouses")}
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              ← Back to Warehouses
            </button>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={toggleStatus}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white ${
                  warehouse.status === "Active"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-emerald-600 hover:bg-emerald-700"
                }`}
              >
                {warehouse.status === "Active"
                  ? "Deactivate Warehouse"
                  : "Activate Warehouse"}
              </button>
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="rounded-xl bg-[#12213a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3154]"
              >
                Edit Warehouse
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-amber-800">
              Frontend integration note
            </p>
            <p className="mt-1 text-xs leading-5 text-amber-700">
              This page reads and writes the shared localStorage stores used by
              the current frontend. Backend authorization, tenant isolation,
              transactional stock locking and immutable audit enforcement must
              be implemented by the production API.
            </p>
          </div>
        </div>

        {showEdit && (
          <Modal title="Edit Warehouse" onClose={() => setShowEdit(false)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Warehouse Name *"
                value={editName}
                onChange={setEditName}
              />
              <Field
                label="Location *"
                value={editLocation}
                onChange={setEditLocation}
              />
              <Field
                label="Manager"
                value={editManager}
                onChange={setEditManager}
              />
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Warehouse Type
                </label>
                <select
                  value={editType}
                  onChange={(event) =>
                    setEditType(
                      event.target.value as NonNullable<Warehouse["type"]>
                    )
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="Distribution">Distribution</option>
                  <option value="Retail">Retail</option>
                  <option value="Storage">Storage</option>
                  <option value="Transit">Transit</option>
                </select>
              </div>
              <Field
                label="Capacity"
                value={String(editCapacity)}
                onChange={(value) =>
                  setEditCapacity(Math.max(1, Number(value) || 1))
                }
                type="number"
              />
              <Field
                label="Phone"
                value={editPhone}
                onChange={setEditPhone}
              />
              <Field
                label="Email"
                value={editEmail}
                onChange={setEditEmail}
                type="email"
              />
              <div className="sm:col-span-2">
                <Field
                  label="Address"
                  value={editAddress}
                  onChange={setEditAddress}
                />
              </div>
            </div>

            <ModalActions
              onCancel={() => setShowEdit(false)}
              onConfirm={updateWarehouse}
              confirmLabel={saving ? "Saving..." : "Save Changes"}
              disabled={saving}
            />
          </Modal>
        )}

        {showAddStock && (
          <Modal
            title="Add Stock"
            subtitle={`Add inventory to ${warehouse.name}. This creates a STOCK IN ledger entry.`}
            onClose={() => setShowAddStock(false)}
          >
            {warehouseProducts.length === 0 ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-800">
                  No products are assigned to this warehouse.
                </p>
                <p className="mt-1 text-xs text-amber-700">
                  Assign a product to this warehouse from the Inventory module
                  before using this stock receipt action.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Product *
                  </label>
                  <select
                    value={stockProductId}
                    onChange={(event) =>
                      setStockProductId(event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="">Select product</option>
                    {warehouseProducts.map((product) => (
                      <option key={product.id} value={String(product.id)}>
                        {product.name} — {product.sku}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Quantity *"
                    value={String(stockQuantity)}
                    onChange={(value) =>
                      setStockQuantity(Math.max(1, Number(value) || 1))
                    }
                    type="number"
                  />
                  <Field
                    label="Reference"
                    value={stockReference}
                    onChange={setStockReference}
                    placeholder="GRN / receipt reference"
                  />
                </div>

                <Field
                  label="Reason"
                  value={stockReason}
                  onChange={setStockReason}
                />
              </div>
            )}

            <ModalActions
              onCancel={() => setShowAddStock(false)}
              onConfirm={addStock}
              confirmLabel="Add Stock"
              disabled={warehouseProducts.length === 0}
            />
          </Modal>
        )}
      </main>
    </PageLayout>
  );
}

function SummaryCard({
  label,
  value,
  description,
  accent,
}: {
  label: string;
  value: string;
  description: string;
  accent: "blue" | "orange" | "green" | "slate";
}) {
  const styles = {
    blue: "border-blue-100 bg-blue-50/60 text-blue-700",
    orange: "border-orange-100 bg-orange-50/60 text-orange-700",
    green: "border-emerald-100 bg-emerald-50/60 text-emerald-700",
    slate: "border-slate-200 bg-white text-slate-700",
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${styles[accent]}`}>
      <p className="text-xs font-bold uppercase tracking-wide">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
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
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
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
  type: ActivityItem["type"];
}) {
  const badge =
    type === "IN"
      ? "bg-emerald-100 text-emerald-700"
      : type === "OUT"
      ? "bg-orange-100 text-orange-700"
      : type === "TRANSFER"
      ? "bg-violet-100 text-violet-700"
      : type === "COUNT"
      ? "bg-blue-100 text-blue-700"
      : "bg-slate-100 text-slate-700";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 sm:flex-row sm:items-center">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${badge}`}
      >
        {type}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      <p className="text-xs text-slate-400 sm:text-right">{time}</p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  onConfirm,
  confirmLabel,
  disabled = false,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  disabled?: boolean;
}) {
  return (
    <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={disabled}
        className="rounded-xl bg-[#12213a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3154] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {confirmLabel}
      </button>
    </div>
  );
}
