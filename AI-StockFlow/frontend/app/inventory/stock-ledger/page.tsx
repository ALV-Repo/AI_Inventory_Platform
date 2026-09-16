"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../../components/layout/PageLayout";

type MovementType =
  | "STOCK IN"
  | "STOCK OUT"
  | "ADJUSTMENT"
  | "TRANSFER"
  | "RESERVATION"
  | "RELEASE"
  | "SALE"
  | "BUNDLE"
  | "CYCLE COUNT";

type StockLedgerEntry = {
  id: string;
  timestamp: string;
  product: string;
  sku: string;
  warehouse: string;
  movementType: MovementType | string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  availableBefore?: number;
  availableAfter?: number;
  reason: string;
  reference: string;
  user: string;
  source?: string;
};

const LEDGER_KEY = "inventory-stock-ledger";

const MOVEMENT_TYPES: MovementType[] = [
  "STOCK IN",
  "STOCK OUT",
  "ADJUSTMENT",
  "TRANSFER",
  "RESERVATION",
  "RELEASE",
  "SALE",
  "BUNDLE",
  "CYCLE COUNT",
];

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatNumber(value: number) {
  return value.toLocaleString("en-IN");
}

function movementTone(movement: string, quantity: number) {
  const normalized = movement.toUpperCase();

  if (
    normalized === "STOCK IN" ||
    normalized === "RELEASE" ||
    (normalized === "ADJUSTMENT" && quantity > 0)
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized === "STOCK OUT" ||
    normalized === "SALE" ||
    normalized === "BUNDLE" ||
    normalized === "RESERVATION" ||
    (normalized === "ADJUSTMENT" && quantity < 0)
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (normalized === "TRANSFER") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function movementSign(quantity: number) {
  if (quantity > 0) return "+";
  if (quantity < 0) return "−";
  return "";
}

function normalizeEntry(entry: Partial<StockLedgerEntry>, index: number): StockLedgerEntry {
  const quantity = Number(entry.quantity ?? 0);
  const stockBefore = Number(entry.stockBefore ?? 0);
  const stockAfter = Number(
    entry.stockAfter ?? stockBefore + quantity
  );

  return {
    id: String(entry.id ?? `LEDGER-${Date.now()}-${index}`),
    timestamp: String(entry.timestamp ?? new Date().toISOString()),
    product: String(entry.product ?? "Unknown Product"),
    sku: String(entry.sku ?? "—"),
    warehouse: String(entry.warehouse ?? "Main Store"),
    movementType: String(entry.movementType ?? "ADJUSTMENT"),
    quantity: Number.isFinite(quantity) ? quantity : 0,
    stockBefore: Number.isFinite(stockBefore) ? stockBefore : 0,
    stockAfter: Number.isFinite(stockAfter) ? stockAfter : 0,
    availableBefore:
      entry.availableBefore == null || !Number.isFinite(Number(entry.availableBefore))
        ? undefined
        : Number(entry.availableBefore),
    availableAfter:
      entry.availableAfter == null || !Number.isFinite(Number(entry.availableAfter))
        ? undefined
        : Number(entry.availableAfter),
    reason: String(entry.reason ?? "Inventory transaction"),
    reference: String(entry.reference ?? "—"),
    user: String(entry.user ?? "System"),
    source: String(entry.source ?? "Inventory"),
  };
}

export default function StockLedgerPage() {
  const [entries, setEntries] = useState<StockLedgerEntry[]>([]);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("All Warehouses");
  const [movementFilter, setMovementFilter] = useState("All Movements");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [productFilter, setProductFilter] = useState("All Products");
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedEntry, setSelectedEntry] =
    useState<StockLedgerEntry | null>(null);

  useEffect(() => {
    try {
      const savedLedger = localStorage.getItem(LEDGER_KEY);

      if (!savedLedger) {
        setEntries([]);
        return;
      }

      const parsed = JSON.parse(savedLedger);

      if (Array.isArray(parsed)) {
        setEntries(
          parsed
            .map((entry, index) => normalizeEntry(entry, index))
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            )
        );
      }
    } catch {
      setEntries([]);
    }
  }, [refreshKey]);

  const warehouses = useMemo(
    () => [
      "All Warehouses",
      ...Array.from(new Set(entries.map((entry) => entry.warehouse))).sort(),
    ],
    [entries]
  );

  const products = useMemo(
    () => [
      "All Products",
      ...Array.from(new Set(entries.map((entry) => entry.product))).sort(),
    ],
    [entries]
  );

  const movementTypes = useMemo(
    () => [
      "All Movements",
      ...Array.from(
        new Set([
          ...MOVEMENT_TYPES,
          ...entries.map((entry) => entry.movementType),
        ])
      ),
    ],
    [entries]
  );

  const filteredEntries = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const now = Date.now();

    return entries.filter((entry) => {
      const matchesSearch =
        !searchTerm ||
        entry.product.toLowerCase().includes(searchTerm) ||
        entry.sku.toLowerCase().includes(searchTerm) ||
        entry.reference.toLowerCase().includes(searchTerm) ||
        entry.reason.toLowerCase().includes(searchTerm) ||
        entry.user.toLowerCase().includes(searchTerm) ||
        entry.warehouse.toLowerCase().includes(searchTerm) ||
        entry.movementType.toLowerCase().includes(searchTerm);

      const matchesWarehouse =
        warehouseFilter === "All Warehouses" ||
        entry.warehouse === warehouseFilter;

      const matchesProduct =
        productFilter === "All Products" ||
        entry.product === productFilter;

      const matchesMovement =
        movementFilter === "All Movements" ||
        entry.movementType === movementFilter;

      const entryDate = new Date(entry.timestamp);
      const cutoff = new Date(now);

      if (dateFilter === "Today") {
        cutoff.setHours(0, 0, 0, 0);
      } else if (dateFilter === "7 Days") {
        cutoff.setDate(cutoff.getDate() - 7);
        cutoff.setHours(0, 0, 0, 0);
      } else if (dateFilter === "30 Days") {
        cutoff.setDate(cutoff.getDate() - 30);
        cutoff.setHours(0, 0, 0, 0);
      }

      const matchesDate =
        dateFilter === "All Time" ||
        (!Number.isNaN(entryDate.getTime()) && entryDate >= cutoff);

      return (
        matchesSearch &&
        matchesWarehouse &&
        matchesProduct &&
        matchesMovement &&
        matchesDate
      );
    });
  }, [
    entries,
    search,
    warehouseFilter,
    productFilter,
    movementFilter,
    dateFilter,
  ]);

  const metrics = useMemo(() => {
    const positive = entries.filter((entry) => entry.quantity > 0);
    const negative = entries.filter((entry) => entry.quantity < 0);

    return {
      total: entries.length,
      increases: positive.length,
      decreases: negative.length,
      netQuantity: entries.reduce(
        (total, entry) => total + entry.quantity,
        0
      ),
      transfers: entries.filter(
        (entry) => entry.movementType.toUpperCase() === "TRANSFER"
      ).length,
      reservations: entries.filter(
        (entry) =>
          entry.movementType.toUpperCase() === "RESERVATION"
      ).length,
    };
  }, [entries]);

  function clearFilters() {
    setSearch("");
    setWarehouseFilter("All Warehouses");
    setProductFilter("All Products");
    setMovementFilter("All Movements");
    setDateFilter("All Time");
  }

  function exportLedger() {
    const headers = [
      "Ledger ID",
      "Date & Time",
      "Product",
      "SKU",
      "Warehouse",
      "Movement Type",
      "Quantity Change",
      "Stock Before",
      "Stock After",
      "Available Before",
      "Available After",
      "Reason",
      "Reference",
      "User",
      "Source",
    ];

    const escapeCsv = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredEntries.map((entry) => [
      entry.id,
      entry.timestamp,
      entry.product,
      entry.sku,
      entry.warehouse,
      entry.movementType,
      entry.quantity,
      entry.stockBefore,
      entry.stockAfter,
      entry.availableBefore ?? "",
      entry.availableAfter ?? "",
      entry.reason,
      entry.reference,
      entry.user,
      entry.source ?? "Inventory",
    ]);

    const csv = [
      headers.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `stock-ledger-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <PageLayout>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-7">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-blue-700">
                  Inventory Control
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Stock Ledger
                </h1>
                <p className="mt-1.5 max-w-2xl text-xs font-medium leading-5 text-slate-500">
                  Immutable-style inventory transaction history with
                  traceable quantity changes, references, users and
                  before/after stock positions.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={exportLedger}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-xs font-semibold text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-100 hover:shadow-md"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={() => setRefreshKey((value) => value + 1)}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-semibold text-blue-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md"
                >
                  Refresh
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4 text-[10px] font-semibold">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-600">
                READ-ONLY VIEW
              </span>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700">
                TRACEABLE
              </span>
              <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-violet-700">
                AUDIT READY
              </span>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Total Movements"
              value={metrics.total}
              helper="Ledger transactions"
            />
            <MetricCard
              label="Stock In"
              value={metrics.increases}
              helper="Positive quantity movements"
              valueClass="text-emerald-600"
            />
            <MetricCard
              label="Stock Out"
              value={metrics.decreases}
              helper="Negative quantity movements"
              valueClass="text-red-600"
            />
            <MetricCard
              label="Net Quantity"
              value={`${metrics.netQuantity > 0 ? "+" : ""}${formatNumber(
                metrics.netQuantity
              )}`}
              helper={`${metrics.transfers} transfers · ${metrics.reservations} reservations`}
              valueClass={
                metrics.netQuantity >= 0
                  ? "text-blue-600"
                  : "text-orange-600"
              }
            />
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm sm:p-6">
            <div className="mb-4">
              <h2 className="text-base font-bold tracking-tight text-slate-800">
                Ledger Filters
              </h2>
              <p className="mt-1 text-[11px] font-medium text-slate-500">
                Search and narrow the transaction history without modifying
                ledger records.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
              <div className="lg:col-span-1">
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                  Search
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Product, SKU, reference, user..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <FilterSelect
                label="Warehouse"
                value={warehouseFilter}
                onChange={setWarehouseFilter}
                options={warehouses}
              />

              <FilterSelect
                label="Product"
                value={productFilter}
                onChange={setProductFilter}
                options={products}
              />

              <FilterSelect
                label="Movement"
                value={movementFilter}
                onChange={setMovementFilter}
                options={movementTypes}
              />

              <FilterSelect
                label="Period"
                value={dateFilter}
                onChange={setDateFilter}
                options={["All Time", "Today", "7 Days", "30 Days"]}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
              <p className="text-[11px] font-medium text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-800">
                  {filteredEntries.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-800">
                  {entries.length}
                </span>{" "}
                ledger entries
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                Ledger records are not editable from this screen
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold tracking-tight text-slate-900">
                  Transaction History
                </h2>
                <p className="mt-1 text-[10px] font-medium text-slate-400">
                  Every row represents a stock movement event.
                </p>
              </div>

              <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 shadow-sm">
                {filteredEntries.length} records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1500px] w-full border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/90 text-left">
                    <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Date & Time
                    </th>
                    <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Product
                    </th>
                    <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      SKU
                    </th>
                    <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Warehouse
                    </th>
                    <th className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Movement
                    </th>
                    <th className="px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Change
                    </th>
                    <th className="px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Before
                    </th>
                    <th className="px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      After
                    </th>
                    <th className="px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Available
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Reason
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Reference
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      User
                    </th>
                    <th className="px-4 py-3.5 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Source
                    </th>
                    <th className="px-4 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Details
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEntries.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-20 text-center">
                        <div className="mx-auto max-w-sm">
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-lg text-slate-400">
                            —
                          </div>
                          <p className="mt-4 text-sm font-bold text-slate-700">
                            No ledger entries found
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-400">
                            There are no transactions matching the current
                            search and filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="border-b border-slate-100 transition hover:bg-blue-50/30"
                      >
                        <td className="whitespace-nowrap px-4 py-3.5 text-[11px] font-medium text-slate-500">
                          {formatDateTime(entry.timestamp)}
                        </td>

                        <td className="px-4 py-3.5">
                          <p className="font-semibold text-slate-800">
                            {entry.product}
                          </p>
                          <p className="mt-0.5 font-mono text-[9px] text-slate-400">
                            {entry.id}
                          </p>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-[10px] font-semibold text-slate-600">
                          {entry.sku}
                        </td>

                        <td className="px-4 py-3.5 font-medium text-slate-600">
                          {entry.warehouse}
                        </td>

                        <td className="px-4 py-3.5">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide ${movementTone(
                              entry.movementType,
                              entry.quantity
                            )}`}
                          >
                            {entry.movementType}
                          </span>
                        </td>

                        <td
                          className={`px-4 py-3.5 text-right text-sm font-bold ${
                            entry.quantity > 0
                              ? "text-emerald-600"
                              : entry.quantity < 0
                                ? "text-red-600"
                                : "text-slate-500"
                          }`}
                        >
                          {movementSign(entry.quantity)}
                          {formatNumber(Math.abs(entry.quantity))}
                        </td>

                        <td className="px-4 py-3.5 text-right font-medium text-slate-500">
                          {formatNumber(entry.stockBefore)}
                        </td>

                        <td className="px-4 py-3.5 text-right font-bold text-slate-800">
                          {formatNumber(entry.stockAfter)}
                        </td>

                        <td className="px-4 py-3.5 text-right font-semibold text-blue-700">
                          {entry.availableAfter == null
                            ? "—"
                            : formatNumber(entry.availableAfter)}
                        </td>

                        <td className="max-w-[220px] px-4 py-3.5 text-slate-600">
                          <span className="line-clamp-2">
                            {entry.reason}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 font-mono text-[10px] font-semibold text-slate-600">
                          {entry.reference}
                        </td>

                        <td className="px-4 py-3.5 font-medium text-slate-600">
                          {entry.user}
                        </td>

                        <td className="px-4 py-3.5 text-[10px] font-semibold text-slate-500">
                          {entry.source ?? "Inventory"}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedEntry(entry)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-xs font-bold text-amber-700">
                !
              </div>
              <div>
                <p className="text-xs font-bold text-amber-800">
                  Ledger integrity
                </p>
                <p className="mt-1 text-[11px] leading-5 text-amber-700">
                  This screen intentionally provides no edit or delete
                  controls. The current frontend persists ledger records in
                  localStorage. Full immutable enforcement, authorization,
                  append-only database constraints and server-side audit
                  guarantees must be implemented by the backend before
                  production use.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_80px_rgba(15,23,42,0.20)]">
            <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 px-6 py-5">
              <div>
                <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-blue-700">
                  Ledger Detail
                </span>
                <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900">
                  {selectedEntry.product}
                </h2>
                <p className="mt-1 font-mono text-[10px] text-slate-400">
                  {selectedEntry.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="rounded-lg p-2 text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close ledger detail"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
              <DetailItem label="Date & Time" value={formatDateTime(selectedEntry.timestamp)} />
              <DetailItem label="Movement" value={selectedEntry.movementType} />
              <DetailItem label="SKU" value={selectedEntry.sku} mono />
              <DetailItem label="Warehouse" value={selectedEntry.warehouse} />
              <DetailItem
                label="Quantity Change"
                value={`${movementSign(selectedEntry.quantity)}${formatNumber(
                  Math.abs(selectedEntry.quantity)
                )}`}
              />
              <DetailItem
                label="Stock Before"
                value={formatNumber(selectedEntry.stockBefore)}
              />
              <DetailItem
                label="Stock After"
                value={formatNumber(selectedEntry.stockAfter)}
              />
              <DetailItem
                label="Available Before"
                value={
                  selectedEntry.availableBefore == null
                    ? "Not recorded"
                    : formatNumber(selectedEntry.availableBefore)
                }
              />
              <DetailItem
                label="Available After"
                value={
                  selectedEntry.availableAfter == null
                    ? "Not recorded"
                    : formatNumber(selectedEntry.availableAfter)
                }
              />
              <DetailItem label="Reference" value={selectedEntry.reference} mono />
              <DetailItem label="User" value={selectedEntry.user} />
              <DetailItem label="Source" value={selectedEntry.source ?? "Inventory"} />
              <div className="sm:col-span-2">
                <DetailItem label="Reason" value={selectedEntry.reason} />
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <p className="text-[10px] font-medium leading-5 text-slate-500">
                This transaction is displayed as a historical record. No
                mutation controls are provided from the ledger view.
              </p>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

function MetricCard({
  label,
  value,
  helper,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: number | string;
  helper: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(15,23,42,0.09)]">
      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${valueClass}`}>
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
      <p className="mt-1 text-[10px] font-medium text-slate-400">
        {helper}
      </p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1.5 break-words text-xs font-semibold text-slate-700 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}
