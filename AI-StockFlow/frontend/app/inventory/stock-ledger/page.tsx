"use client";

import { useEffect, useMemo, useState } from "react";

type StockLedgerEntry = {
  id: string;
  timestamp: string;
  product: string;
  sku: string;
  warehouse: string;
  movementType: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  reason: string;
  reference: string;
  user: string;
};

export default function StockLedgerPage() {
  const [entries, setEntries] = useState<StockLedgerEntry[]>([]);
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] =
    useState("All Warehouses");
  const [movementFilter, setMovementFilter] =
    useState("All Movements");

  useEffect(() => {
    const savedLedger = localStorage.getItem("inventory-stock-ledger");

    if (savedLedger) {
      try {
        setEntries(JSON.parse(savedLedger));
      } catch {
        setEntries([]);
      }
    }
  }, []);

  const warehouses = useMemo(
    () => [
      "All Warehouses",
      ...Array.from(new Set(entries.map((entry) => entry.warehouse))),
    ],
    [entries]
  );

  const movementTypes = useMemo(
    () => [
      "All Movements",
      ...Array.from(new Set(entries.map((entry) => entry.movementType))),
    ],
    [entries]
  );

  const filteredEntries = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return entries.filter((entry) => {
      const matchesSearch =
        !searchTerm ||
        entry.product.toLowerCase().includes(searchTerm) ||
        entry.sku.toLowerCase().includes(searchTerm) ||
        entry.reference.toLowerCase().includes(searchTerm) ||
        entry.reason.toLowerCase().includes(searchTerm) ||
        entry.user.toLowerCase().includes(searchTerm);

      const matchesWarehouse =
        warehouseFilter === "All Warehouses" ||
        entry.warehouse === warehouseFilter;

      const matchesMovement =
        movementFilter === "All Movements" ||
        entry.movementType === movementFilter;

      return (
        matchesSearch &&
        matchesWarehouse &&
        matchesMovement
      );
    });
  }, [entries, search, warehouseFilter, movementFilter]);

  const totalMovements = entries.length;

  const totalIncreases = entries.filter(
    (entry) => entry.quantity > 0
  ).length;

  const totalDecreases = entries.filter(
    (entry) => entry.quantity < 0
  ).length;

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Stock Ledger
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Complete inventory stock movement history with
            before-and-after quantities.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Total Movements
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalMovements}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Stock In
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {totalIncreases}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Stock Out
            </p>
            <p className="mt-2 text-3xl font-bold text-red-600">
              {totalDecreases}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, SKU, reference..."
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none focus:border-slate-500"
            />

            <select
              value={warehouseFilter}
              onChange={(event) =>
                setWarehouseFilter(event.target.value)
              }
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none"
            >
              {warehouses.map((warehouse) => (
                <option key={warehouse} value={warehouse}>
                  {warehouse}
                </option>
              ))}
            </select>

            <select
              value={movementFilter}
              onChange={(event) =>
                setMovementFilter(event.target.value)
              }
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm outline-none"
            >
              {movementTypes.map((movement) => (
                <option key={movement} value={movement}>
                  {movement}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Product
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Warehouse
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Movement
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Quantity
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    Before
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">
                    After
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Reason
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">
                    User
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      No stock ledger entries found.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-t border-slate-200"
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {entry.timestamp}
                      </td>

                      <td className="px-4 py-3 font-medium text-slate-900">
                        {entry.product}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {entry.sku}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {entry.warehouse}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            entry.quantity > 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {entry.movementType}
                        </span>
                      </td>

                      <td
                        className={`px-4 py-3 text-right font-semibold ${
                          entry.quantity > 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {entry.quantity > 0 ? "+" : ""}
                        {entry.quantity}
                      </td>

                      <td className="px-4 py-3 text-right text-slate-600">
                        {entry.stockBefore}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {entry.stockAfter}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {entry.reason}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {entry.reference}
                      </td>

                      <td className="px-4 py-3 text-slate-600">
                        {entry.user}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="text-sm text-slate-500">
          Showing {filteredEntries.length} of {entries.length} ledger
          entries.
        </div>
      </div>
    </main>
  );
}