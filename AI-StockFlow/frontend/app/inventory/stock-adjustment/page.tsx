"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";

type AdjustmentType = "Increase" | "Decrease";
type AdjustmentStatus = "Draft" | "Pending Approval" | "Completed" | "Rejected";

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
  id: string;
  product: string;
  sku: string;
  warehouse: string;
  type: AdjustmentType;
  quantity: number;
  reason: string;
  date: string;
  status: AdjustmentStatus;
  user: string;
  reference: string;
  stockBefore: number;
  stockAfter: number;
  notes: string;
};

const products: Product[] = [
  { id: 1, name: "Hot Wheels Track Set", sku: "TOY-HW-002", category: "Toys", warehouse: "Main Store", currentStock: 24, unitPrice: 4200 },
  { id: 2, name: "Bluetooth Speaker", sku: "ELC-BT-608", category: "Electronics", warehouse: "Main Store", currentStock: 8, unitPrice: 2800 },
  { id: 3, name: "Football Size 5", sku: "SPT-BL-908", category: "Sports", warehouse: "Warehouse A", currentStock: 17, unitPrice: 1500 },
  { id: 4, name: "Christmas Tree 4ft", sku: "SEA-XM-968", category: "Seasonal", warehouse: "Main Store", currentStock: 81, unitPrice: 3500 },
  { id: 5, name: "Fashion Doll Set", sku: "TOY-DL-410", category: "Toys", warehouse: "Warehouse B", currentStock: 56, unitPrice: 2200 },
  { id: 6, name: "Ceramic Planter", sku: "HOM-PL-810", category: "Home", warehouse: "Main Store", currentStock: 53, unitPrice: 1800 },
  { id: 7, name: "Wireless Keyboard", sku: "ELC-KB-138", category: "Electronics", warehouse: "Warehouse A", currentStock: 3, unitPrice: 3200 },
  { id: 8, name: "USB Microphone", sku: "ELC-MC-508", category: "Electronics", warehouse: "Main Store", currentStock: 12, unitPrice: 4500 },
];

const initialAdjustments: AdjustmentRecord[] = [
  { id: "ADJ-001", product: "Bluetooth Speaker", sku: "ELC-BT-608", warehouse: "Main Store", type: "Decrease", quantity: 2, reason: "Damaged units", date: "20 Aug 2026", status: "Completed", user: "Rahul", reference: "ADJ-001", stockBefore: 10, stockAfter: 8, notes: "" },
  { id: "ADJ-002", product: "Hot Wheels Track Set", sku: "TOY-HW-002", warehouse: "Main Store", type: "Increase", quantity: 5, reason: "Stock received", date: "19 Aug 2026", status: "Completed", user: "Admin User", reference: "ADJ-002", stockBefore: 19, stockAfter: 24, notes: "" },
  { id: "ADJ-003", product: "USB Microphone", sku: "ELC-MC-508", warehouse: "Main Store", type: "Decrease", quantity: 1, reason: "Missing stock", date: "18 Aug 2026", status: "Completed", user: "Rahul", reference: "ADJ-003", stockBefore: 13, stockAfter: 12, notes: "" },
  { id: "ADJ-004", product: "Football Size 5", sku: "SPT-BL-908", warehouse: "Warehouse A", type: "Increase", quantity: 3, reason: "Physical count", date: "17 Aug 2026", status: "Pending Approval", user: "Priya", reference: "ADJ-004", stockBefore: 14, stockAfter: 17, notes: "" },
];

const reasonOptions = [
  "Damaged units",
  "Stock received",
  "Missing stock",
  "Physical count",
  "Counting variance",
  "Expiry",
  "Quality issue",
  "System correction",
  "Other",
];

const statusClass: Record<AdjustmentStatus, string> = {
  Draft: "bg-gray-100 text-gray-700",
  "Pending Approval": "bg-amber-50 text-amber-700",
  Completed: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
};

const readJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key: string, value: unknown) => {
  if (typeof window !== "undefined") localStorage.setItem(key, JSON.stringify(value));
};

const csvEscape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export default function StockAdjustmentPage() {
  const [selectedProductId, setSelectedProductId] = useState(1);
  const [adjustmentType, setAdjustmentType] = useState<AdjustmentType>("Increase");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [user, setUser] = useState("Admin User");
  const [warehouseFilter, setWarehouseFilter] = useState("All Warehouses");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [search, setSearch] = useState("");
  const [adjustments, setAdjustments] = useState<AdjustmentRecord[]>([]);
  const [stockLevels, setStockLevels] = useState<Record<number, number>>({});
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AdjustmentRecord | null>(null);

  useEffect(() => {
    setAdjustments(readJSON("inventory-adjustments", initialAdjustments));
    setStockLevels(readJSON("inventory-stock-levels", {}));
  }, []);

  const selectedProduct = useMemo(() => {
    const product = products.find((item) => item.id === selectedProductId) ?? products[0];
    return { ...product, currentStock: stockLevels[product.id] ?? product.currentStock };
  }, [selectedProductId, stockLevels]);

  const newStock = adjustmentType === "Increase"
    ? selectedProduct.currentStock + Math.max(0, quantity)
    : Math.max(0, selectedProduct.currentStock - Math.max(0, quantity));

  const filteredAdjustments = useMemo(() => {
    const term = search.trim().toLowerCase();
    return adjustments.filter((item) => {
      const matchesSearch = !term ||
        item.product.toLowerCase().includes(term) ||
        item.sku.toLowerCase().includes(term) ||
        item.reference.toLowerCase().includes(term) ||
        item.reason.toLowerCase().includes(term);
      return matchesSearch &&
        (warehouseFilter === "All Warehouses" || item.warehouse === warehouseFilter) &&
        (typeFilter === "All Types" || item.type === typeFilter) &&
        (statusFilter === "All Statuses" || item.status === statusFilter);
    });
  }, [adjustments, search, warehouseFilter, typeFilter, statusFilter]);

  const metrics = useMemo(() => ({
    total: adjustments.length,
    increases: adjustments.filter((x) => x.type === "Increase").length,
    decreases: adjustments.filter((x) => x.type === "Decrease").length,
    pending: adjustments.filter((x) => x.status === "Pending Approval").length,
    completed: adjustments.filter((x) => x.status === "Completed").length,
    increaseUnits: adjustments.filter((x) => x.type === "Increase").reduce((s, x) => s + x.quantity, 0),
    decreaseUnits: adjustments.filter((x) => x.type === "Decrease").reduce((s, x) => s + x.quantity, 0),
  }), [adjustments]);

  const validate = () => {
    if (!reason.trim()) {
      setMessage("Please select an adjustment reason.");
      return false;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setMessage("Quantity must be greater than 0.");
      return false;
    }
    if (adjustmentType === "Decrease" && quantity > selectedProduct.currentStock) {
      setMessage("Decrease quantity cannot be greater than current stock.");
      return false;
    }
    return true;
  };

  const createAdjustment = (submitForApproval: boolean) => {
    if (!validate()) return;

    const now = new Date();
    const timestamp = now.toLocaleString("en-IN");
    const reference = `ADJ-${now.getFullYear()}-${String(Date.now()).slice(-6)}`;
    const record: AdjustmentRecord = {
      id: reference,
      product: selectedProduct.name,
      sku: selectedProduct.sku,
      warehouse: selectedProduct.warehouse,
      type: adjustmentType,
      quantity,
      reason,
      date: timestamp,
      status: submitForApproval ? "Pending Approval" : "Draft",
      user,
      reference,
      stockBefore: selectedProduct.currentStock,
      stockAfter: newStock,
      notes,
    };

    const next = [record, ...adjustments];
    setAdjustments(next);
    writeJSON("inventory-adjustments", next);

    if (submitForApproval) {
      setMessage(`${reference} submitted for approval. Inventory has not been changed yet.`);
    } else {
      setMessage(`${reference} saved as draft. Inventory has not been changed.`);
    }
    setQuantity(1);
    setReason("");
    setNotes("");
    setShowConfirm(false);
  };

  const completeAdjustment = (record: AdjustmentRecord) => {
    if (record.status !== "Pending Approval") return;

    const product = products.find((x) => x.sku === record.sku && x.warehouse === record.warehouse);
    if (!product) {
      setMessage("Product could not be matched for inventory update.");
      return;
    }

    const currentStock = stockLevels[product.id] ?? product.currentStock;
    const updatedStock = record.type === "Increase"
      ? currentStock + record.quantity
      : currentStock - record.quantity;

    if (updatedStock < 0) {
      setMessage("Adjustment cannot make inventory negative.");
      return;
    }

    const updatedStockLevels = { ...stockLevels, [product.id]: updatedStock };
    setStockLevels(updatedStockLevels);
    writeJSON("inventory-stock-levels", updatedStockLevels);

    const inventoryProducts = readJSON<Record<string, unknown>[]>("inventory-products", []);
    if (inventoryProducts.length) {
      writeJSON("inventory-products", inventoryProducts.map((item) => {
        const sameSku = String(item.sku ?? "").toLowerCase() === record.sku.toLowerCase();
        const sameWarehouse = String(item.warehouse ?? "").toLowerCase() === record.warehouse.toLowerCase();
        if (!sameSku || !sameWarehouse) return item;
        return {
          ...item,
          onHand: updatedStock,
          on_hand: updatedStock,
          available: updatedStock,
          availableStock: updatedStock,
          lastStockUpdate: new Date().toISOString(),
        };
      }));
    }

    const ledger = readJSON<Record<string, unknown>[]>("inventory-stock-ledger", []);
    const ledgerEntry = {
      id: `LED-${Date.now()}`,
      transactionId: `TXN-${record.reference}`,
      type: "ADJUSTMENT",
      transactionType: "ADJUSTMENT",
      movementType: record.type,
      referenceId: record.reference,
      referenceType: "Stock Adjustment",
      product: record.product,
      sku: record.sku,
      warehouse: record.warehouse,
      quantityBefore: currentStock,
      stockBefore: currentStock,
      quantityChange: record.type === "Increase" ? record.quantity : -record.quantity,
      quantityAfter: updatedStock,
      stockAfter: updatedStock,
      availableStock: updatedStock,
      reason: record.reason,
      notes: record.notes,
      user: record.user,
      timestamp: new Date().toISOString(),
    };
    writeJSON("inventory-stock-ledger", [ledgerEntry, ...ledger]);

    const auditLogs = readJSON<Record<string, unknown>[]>("audit-logs", []);
    writeJSON("audit-logs", [{
      id: `AUD-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: record.user,
      role: "Admin",
      action: "Stock Adjustment Completed",
      module: "Inventory",
      description: `${record.type} adjustment of ${record.quantity} units for ${record.product}`,
      referenceId: record.reference,
      status: "Success",
      ip: "Local",
    }, ...auditLogs]);

    const updatedRecords = adjustments.map((item) =>
      item.id === record.id ? { ...item, status: "Completed" as AdjustmentStatus, stockBefore: currentStock, stockAfter: updatedStock } : item,
    );
    setAdjustments(updatedRecords);
    writeJSON("inventory-adjustments", updatedRecords);
    setSelectedRecord(null);
    setMessage(`${record.reference} approved and completed. Inventory and stock ledger updated.`);
  };

  const rejectAdjustment = (record: AdjustmentRecord) => {
    const updated = adjustments.map((item) =>
      item.id === record.id ? { ...item, status: "Rejected" as AdjustmentStatus } : item,
    );
    setAdjustments(updated);
    writeJSON("inventory-adjustments", updated);
    setSelectedRecord(null);
    setMessage(`${record.reference} rejected. Inventory was not changed.`);
  };

  const deleteDraft = (record: AdjustmentRecord) => {
    if (record.status !== "Draft") return;
    const updated = adjustments.filter((item) => item.id !== record.id);
    setAdjustments(updated);
    writeJSON("inventory-adjustments", updated);
    setSelectedRecord(null);
    setMessage(`${record.reference} deleted.`);
  };

  const exportCSV = () => {
    if (!filteredAdjustments.length) {
      setMessage("No adjustment records to export.");
      return;
    }
    const headers = ["Reference", "Product", "SKU", "Warehouse", "Type", "Quantity", "Reason", "Date", "Status", "User", "Stock Before", "Stock After"];
    const rows = filteredAdjustments.map((x) => [
      x.reference, x.product, x.sku, x.warehouse, x.type, x.quantity, x.reason, x.date, x.status, x.user, x.stockBefore, x.stockAfter,
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "stock-adjustments.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setSelectedProductId(1);
    setAdjustmentType("Increase");
    setQuantity(1);
    setReason("");
    setNotes("");
    setMessage("Adjustment form reset.");
  };

  const warehouses = [...new Set(products.map((x) => x.warehouse))];

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f5f7fa] px-4 py-6 text-[#12213a] md:px-6 md:py-8">
        <div className="mx-auto max-w-[1500px]">
          <header className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Inventory Control / Adjustments</p>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-black tracking-tight">Stock Adjustment</h1>
                <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-500">
                  Controlled Inventory Change
                </span>
              </div>
              <p className="mt-2 max-w-3xl text-sm text-gray-500">
                Record justified stock corrections with approval workflow, audit history and immutable-style ledger references.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={resetForm} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50">
                Reset
              </button>
              <button type="button" onClick={() => document.getElementById("adjustment-form")?.scrollIntoView({ behavior: "smooth" })} className="rounded-xl bg-[#12213a] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#1c3154]">
                + New Adjustment
              </button>
            </div>
          </header>

          <section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["Total Adjustments", metrics.total, "All recorded requests", "text-[#12213a]"],
              ["Increase Units", metrics.increaseUnits, `${metrics.increases} increase records`, "text-green-600"],
              ["Decrease Units", metrics.decreaseUnits, `${metrics.decreases} decrease records`, "text-red-500"],
              ["Pending Approval", metrics.pending, `${metrics.completed} completed`, "text-amber-600"],
            ].map(([label, value, sub, color]) => (
              <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                <p className={`mt-2 text-3xl font-black ${color}`}>{value}</p>
                <p className="mt-1 text-xs text-gray-500">{sub}</p>
              </div>
            ))}
          </section>

          <section className="mb-7 grid gap-4 lg:grid-cols-4">
            {[
              ["01", "Select product", "Identify the exact SKU and warehouse."],
              ["02", "Define adjustment", "Increase or decrease with quantity."],
              ["03", "Justify change", "Use a controlled reason and notes."],
              ["04", "Approve & post", "Update stock and create ledger entry."],
            ].map(([step, title, sub]) => (
              <div key={step} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-xs font-black text-blue-600">{step}</div>
                <p className="font-black">{title}</p>
                <p className="mt-1 text-xs leading-5 text-gray-500">{sub}</p>
              </div>
            ))}
          </section>

          <section id="adjustment-form" className="mb-7 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-black">Create Adjustment Request</h2>
                  <p className="mt-1 text-xs text-gray-500">Requests are submitted for approval before inventory is changed.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-black text-blue-700">AUDIT CONTROLLED</span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                <label className="block xl:col-span-2">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Product / SKU</span>
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(Number(e.target.value))} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50">
                    {products.map((product) => <option key={product.id} value={product.id}>{product.name} — {product.sku}</option>)}
                  </select>
                </label>

                <div>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Warehouse</span>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-sm font-bold">{selectedProduct.warehouse}</div>
                </div>

                <div>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Current Stock</span>
                  <div className="rounded-xl border border-green-100 bg-green-50 px-3 py-3 text-lg font-black text-green-700">{selectedProduct.currentStock} units</div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <button type="button" onClick={() => setAdjustmentType("Increase")} className={`rounded-2xl border p-5 text-left transition ${adjustmentType === "Increase" ? "border-green-400 bg-green-50 ring-4 ring-green-50" : "border-gray-200 hover:border-green-300"}`}>
                  <p className="text-lg font-black text-green-600">+ Increase Stock</p>
                  <p className="mt-1 text-xs text-gray-500">Add units after an approved inventory correction.</p>
                </button>
                <button type="button" onClick={() => setAdjustmentType("Decrease")} className={`rounded-2xl border p-5 text-left transition ${adjustmentType === "Decrease" ? "border-red-400 bg-red-50 ring-4 ring-red-50" : "border-gray-200 hover:border-red-300"}`}>
                  <p className="text-lg font-black text-red-500">− Decrease Stock</p>
                  <p className="mt-1 text-xs text-gray-500">Remove units for damage, shortage or another approved reason.</p>
                </button>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Quantity</span>
                  <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(0, Number(e.target.value) || 0))} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" />
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Reason Code</span>
                  <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50">
                    <option value="">Select reason</option>
                    {reasonOptions.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label>
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Requested By</span>
                  <input value={user} onChange={(e) => setUser(e.target.value)} className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">Supporting Notes / Document Reference</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="Explain the adjustment, physical count reference, damage note, or supporting document..." className="w-full resize-none rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50" />
              </label>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Stock Preview</p>
                    <p className="mt-1 font-bold text-gray-700">{selectedProduct.name} · {selectedProduct.sku}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-500">{selectedProduct.currentStock}</span>
                    <span className="text-gray-400">→</span>
                    <span className="text-xl font-black text-[#12213a]">{newStock}</span>
                    <span className={`rounded-full px-3 py-1.5 text-xs font-black ${adjustmentType === "Increase" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {adjustmentType === "Increase" ? "+" : "−"}{quantity}
                    </span>
                  </div>
                </div>
              </div>

              {message && <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">{message}</div>}

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button type="button" onClick={() => createAdjustment(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50">Save Draft</button>
                <button type="button" onClick={() => { if (validate()) setShowConfirm(true); }} className={`rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-sm ${adjustmentType === "Increase" ? "bg-green-600 hover:bg-green-700" : "bg-red-500 hover:bg-red-600"}`}>
                  Submit for Approval
                </button>
              </div>
            </div>
          </section>

          <section className="mb-7 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-black">Adjustment History</h2>
                <p className="mt-1 text-xs text-gray-500">Review requests, approvals and completed stock movements.</p>
              </div>
              <button type="button" onClick={exportCSV} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50">Export CSV</button>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product, SKU, reference..." className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
              <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                <option>All Warehouses</option>
                {warehouses.map((x) => <option key={x}>{x}</option>)}
              </select>
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                <option>All Types</option><option>Increase</option><option>Decrease</option>
              </select>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500">
                <option>All Statuses</option><option>Draft</option><option>Pending Approval</option><option>Completed</option><option>Rejected</option>
              </select>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="font-black">Adjustment Register</h2>
                <p className="mt-1 text-xs text-gray-500">Showing {filteredAdjustments.length} of {adjustments.length} records</p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[10px] font-black text-gray-600">{filteredAdjustments.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1250px] text-left">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    {["Reference", "Product", "Warehouse", "Movement", "Qty", "Stock", "Reason", "Date", "Status", "User", "Action"].map((heading) => (
                      <th key={heading} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAdjustments.length === 0 ? (
                    <tr><td colSpan={11} className="px-6 py-12 text-center text-sm text-gray-500">No adjustment records found.</td></tr>
                  ) : filteredAdjustments.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4 text-xs font-black text-[#12213a]">{item.reference}</td>
                      <td className="px-5 py-4"><p className="text-sm font-bold">{item.product}</p><p className="mt-1 text-[10px] text-gray-400">{item.sku}</p></td>
                      <td className="px-5 py-4 text-xs text-gray-600">{item.warehouse}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${item.type === "Increase" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{item.type}</span></td>
                      <td className={`px-5 py-4 text-sm font-black ${item.type === "Increase" ? "text-green-600" : "text-red-500"}`}>{item.type === "Increase" ? "+" : "−"}{item.quantity}</td>
                      <td className="px-5 py-4 text-xs font-semibold text-gray-600">{item.stockBefore} → {item.stockAfter}</td>
                      <td className="max-w-[180px] px-5 py-4 text-xs text-gray-600">{item.reason}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">{item.date}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass[item.status]}`}>{item.status}</span></td>
                      <td className="px-5 py-4 text-xs font-semibold text-gray-600">{item.user}</td>
                      <td className="px-5 py-4"><button type="button" onClick={() => setSelectedRecord(item)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-[10px] font-bold hover:bg-gray-50">View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <footer className="py-8 text-center text-[10px] font-semibold text-gray-400">
            AI StockFlow • Controlled Stock Adjustment Management
          </footer>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
              <div className="border-b border-gray-100 px-6 py-5">
                <h2 className="font-black text-[#12213a]">Submit Adjustment for Approval?</h2>
                <p className="mt-1 text-xs text-gray-500">The stock will not change until the request is approved and completed.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 p-6">
                <div className="rounded-xl bg-gray-50 p-4"><p className="text-[10px] font-black uppercase text-gray-400">Product</p><p className="mt-1 text-sm font-bold">{selectedProduct.name}</p></div>
                <div className="rounded-xl bg-gray-50 p-4"><p className="text-[10px] font-black uppercase text-gray-400">Movement</p><p className="mt-1 text-sm font-bold">{adjustmentType} {quantity}</p></div>
                <div className="rounded-xl bg-gray-50 p-4"><p className="text-[10px] font-black uppercase text-gray-400">Reason</p><p className="mt-1 text-sm font-bold">{reason}</p></div>
                <div className="rounded-xl bg-gray-50 p-4"><p className="text-[10px] font-black uppercase text-gray-400">Preview</p><p className="mt-1 text-sm font-bold">{selectedProduct.currentStock} → {newStock}</p></div>
              </div>
              <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button type="button" onClick={() => setShowConfirm(false)} className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700">Go Back</button>
                <button type="button" onClick={() => createAdjustment(true)} className="rounded-xl bg-[#12213a] px-5 py-2.5 text-sm font-bold text-white">Confirm & Submit</button>
              </div>
            </div>
          </div>
        )}

        {selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <div className="flex items-center gap-2"><h2 className="font-black">{selectedRecord.reference}</h2><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${statusClass[selectedRecord.status]}`}>{selectedRecord.status}</span></div>
                  <p className="mt-1 text-xs text-gray-500">{selectedRecord.product} · {selectedRecord.sku}</p>
                </div>
                <button type="button" onClick={() => setSelectedRecord(null)} className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100">✕</button>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-2">
                {[
                  ["Warehouse", selectedRecord.warehouse],
                  ["Movement", `${selectedRecord.type} ${selectedRecord.quantity}`],
                  ["Stock Before", String(selectedRecord.stockBefore)],
                  ["Stock After", String(selectedRecord.stockAfter)],
                  ["Reason", selectedRecord.reason],
                  ["Requested By", selectedRecord.user],
                  ["Date", selectedRecord.date],
                  ["Notes", selectedRecord.notes || "—"],
                ].map(([label, value]) => <div key={label} className="rounded-xl bg-gray-50 p-4"><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p><p className="mt-1 text-sm font-bold text-gray-700">{value}</p></div>)}
              </div>
              <div className="flex flex-wrap justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                {selectedRecord.status === "Pending Approval" && <>
                  <button type="button" onClick={() => rejectAdjustment(selectedRecord)} className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600">Reject</button>
                  <button type="button" onClick={() => completeAdjustment(selectedRecord)} className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white">Approve & Complete</button>
                </>}
                {selectedRecord.status === "Draft" && <button type="button" onClick={() => deleteDraft(selectedRecord)} className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-600">Delete Draft</button>}
                <button type="button" onClick={() => setSelectedRecord(null)} className="rounded-xl bg-[#12213a] px-5 py-2.5 text-sm font-bold text-white">Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </PageLayout>
  );
}
