"use client";

import { useMemo, useState } from "react";

type PickStatus = "Pending" | "In Progress" | "Picked";

type PickItem = {
  id: string;
  sku: string;
  name: string;
  location: string;
  bin: string;
  quantity: number;
  picked: number;
  status: PickStatus;
};

const initialItems: PickItem[] = [
  {
    id: "PI-001",
    sku: "KB-WL-001",
    name: "Wireless Keyboard",
    location: "Zone A / Rack A1",
    bin: "A1-01",
    quantity: 10,
    picked: 0,
    status: "Pending",
  },
  {
    id: "PI-002",
    sku: "MIC-USB-002",
    name: "USB Microphone",
    location: "Zone A / Rack A2",
    bin: "A2-04",
    quantity: 5,
    picked: 0,
    status: "Pending",
  },
  {
    id: "PI-003",
    sku: "CHA-OFC-003",
    name: "Office Chair",
    location: "Zone B / Rack B1",
    bin: "B1-08",
    quantity: 8,
    picked: 0,
    status: "Pending",
  },
  {
    id: "PI-004",
    sku: "MON-24-004",
    name: "24-inch Monitor",
    location: "Zone B / Rack B2",
    bin: "B2-03",
    quantity: 6,
    picked: 0,
    status: "Pending",
  },
  {
    id: "PI-005",
    sku: "BIN-ST-005",
    name: "Storage Bins",
    location: "Zone C / Rack C1",
    bin: "C1-12",
    quantity: 12,
    picked: 0,
    status: "Pending",
  },
];

export default function PickListPage() {
  const [items, setItems] = useState<PickItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [scanValue, setScanValue] = useState("");
  const [selectedItem, setSelectedItem] =
    useState<PickItem | null>(null);
  const [message, setMessage] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  const filteredItems = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) return items;

    return items.filter(
      (item) =>
        item.id.toLowerCase().includes(value) ||
        item.sku.toLowerCase().includes(value) ||
        item.name.toLowerCase().includes(value) ||
        item.bin.toLowerCase().includes(value) ||
        item.location.toLowerCase().includes(value)
    );
  }, [items, search]);

  const totalItems = items.length;

  const completedItems = items.filter(
    (item) => item.status === "Picked"
  ).length;

  const pendingItems = items.filter(
    (item) => item.status !== "Picked"
  ).length;

  const totalQuantity = items.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const pickedQuantity = items.reduce(
    (sum, item) => sum + item.picked,
    0
  );

  const progress =
    totalQuantity === 0
      ? 0
      : Math.round((pickedQuantity / totalQuantity) * 100);

  function confirmPick(itemId: string) {
    setItems((current) =>
      current.map((item) => {
        if (item.id !== itemId) return item;

        const nextPicked = Math.min(
          item.picked + 1,
          item.quantity
        );

        return {
          ...item,
          picked: nextPicked,
          status:
            nextPicked >= item.quantity
              ? "Picked"
              : "In Progress",
        };
      })
    );

    setMessage("Item scan confirmed successfully.");
  }

  function scanItem() {
    const value = scanValue.trim().toLowerCase();

    if (!value) {
      setMessage("Enter or scan an SKU, item ID or bin.");
      return;
    }

    const found = items.find(
      (item) =>
        item.id.toLowerCase() === value ||
        item.sku.toLowerCase() === value ||
        item.bin.toLowerCase() === value
    );

    if (!found) {
      setMessage(
        "Item not found. Please check the barcode or bin."
      );
      return;
    }

    setSelectedItem(found);
    setMessage(`Item found: ${found.name}`);
  }

  function finishPickList() {
    if (completedItems !== totalItems) {
      setMessage(
        "Complete all pick items before confirming the pick list."
      );
      return;
    }

    setMessage("Pick list completed successfully.");
  }

  function resetPickList() {
    setItems(initialItems);
    setSelectedItem(null);
    setScanValue("");
    setMessage("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 text-slate-800 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <button
              type="button"
              onClick={() =>
                window.history.back()
              }
              className="mb-2 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
            >
              ← Back to Warehouse
            </button>

            <h1 className="text-xl font-bold sm:text-2xl">
              Pick List
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Mobile picking workflow with barcode scan confirmation.
            </p>
          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={resetPickList}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() =>
                setShowScanner(!showScanner)
              }
              className="rounded-md bg-[#10233f] px-4 py-2 text-[10px] font-semibold text-white"
            >
              {showScanner
                ? "Close Scanner"
                : "Scan Item"}
            </button>

          </div>

        </div>

        {/* PICK LIST SUMMARY */}

        <section className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">

          <SummaryCard
            title="Total Items"
            value={String(totalItems)}
            subtitle="Items to pick"
          />

          <SummaryCard
            title="Pending"
            value={String(pendingItems)}
            subtitle="Remaining items"
            valueClass="text-orange-500"
          />

          <SummaryCard
            title="Picked"
            value={String(completedItems)}
            subtitle="Completed items"
            valueClass="text-green-600"
          />

          <SummaryCard
            title="Progress"
            value={`${progress}%`}
            subtitle={`${pickedQuantity} / ${totalQuantity} units`}
            valueClass="text-blue-600"
          />

        </section>

        {/* PROGRESS */}

        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold">
                Picking Progress
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                Complete each item by scanning its barcode.
              </p>
            </div>

            <span className="text-sm font-bold text-blue-600">
              {progress}%
            </span>

          </div>

          <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">

            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

        </section>

        {/* SCANNER */}

        {showScanner && (
          <section className="mb-5 rounded-xl border border-blue-200 bg-white p-4">

            <div className="mb-3">

              <h2 className="text-sm font-semibold">
                Scan Confirmation
              </h2>

              <p className="mt-1 text-[10px] text-slate-500">
                Scan a barcode or manually enter the SKU,
                item ID or bin number.
              </p>

            </div>

            <div className="flex flex-col gap-2 sm:flex-row">

              <input
                type="text"
                value={scanValue}
                onChange={(event) =>
                  setScanValue(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    scanItem();
                  }
                }}
                placeholder="Scan barcode / enter SKU / bin..."
                className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                autoFocus
              />

              <button
                type="button"
                onClick={scanItem}
                className="min-h-11 rounded-lg bg-blue-600 px-5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Confirm Scan
              </button>

            </div>

            {selectedItem && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-xs font-semibold text-green-800">
                      {selectedItem.name}
                    </p>

                    <p className="mt-1 text-[10px] text-green-700">
                      {selectedItem.sku} • Bin{" "}
                      {selectedItem.bin}
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      confirmPick(selectedItem.id)
                    }
                    disabled={
                      selectedItem.picked >=
                      selectedItem.quantity
                    }
                    className="rounded-md bg-green-600 px-4 py-2 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Confirm Pick
                  </button>

                </div>

              </div>
            )}

            {message && (
              <p className="mt-3 rounded-md bg-slate-50 px-3 py-2 text-[10px] font-medium text-slate-600">
                {message}
              </p>
            )}

          </section>
        )}

        {/* SEARCH */}

        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-3">

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search item, SKU, bin or location..."
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />

        </section>

        {/* PICK ITEMS */}

        <section className="rounded-xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 px-4 py-4 sm:px-5">

            <h2 className="text-sm font-semibold">
              Items to Pick
            </h2>

            <p className="mt-1 text-[10px] text-slate-500">
              {filteredItems.length} items displayed
            </p>

          </div>

          <div className="divide-y divide-slate-100">

            {filteredItems.map((item) => (

              <div
                key={item.id}
                className="p-4 transition hover:bg-slate-50 sm:p-5"
              >

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  {/* ITEM */}

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
                        {item.id.replace("PI-", "")}
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-xs font-bold text-slate-800 sm:text-sm">
                            {item.name}
                          </h3>

                          <StatusBadge
                            status={item.status}
                          />

                        </div>

                        <p className="mt-1 text-[10px] text-slate-400">
                          SKU: {item.sku}
                        </p>

                      </div>

                    </div>

                    {/* LOCATION */}

                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">

                      <InfoBox
                        label="Location"
                        value={item.location}
                      />

                      <InfoBox
                        label="Bin"
                        value={item.bin}
                      />

                      <InfoBox
                        label="Quantity"
                        value={`${item.picked} / ${item.quantity}`}
                      />

                    </div>

                  </div>

                  {/* ACTION */}

                  <div className="flex gap-2 lg:flex-col">

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedItem(item);
                        setScanValue(item.sku);
                        setShowScanner(true);
                      }}
                      className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 lg:min-w-28"
                    >
                      Scan
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        confirmPick(item.id)
                      }
                      disabled={
                        item.picked >= item.quantity
                      }
                      className="flex-1 rounded-md bg-[#10233f] px-4 py-2.5 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 lg:min-w-28"
                    >
                      {item.status === "Picked"
                        ? "Picked"
                        : "Pick 1"}
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

          {filteredItems.length === 0 && (
            <div className="px-5 py-12 text-center">

              <p className="text-sm font-semibold text-slate-700">
                No pick items found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try another search term.
              </p>

            </div>
          )}

        </section>

                {/* PICK LIST COMPLETION */}

        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-sm font-semibold text-slate-800">
                Pick List Confirmation
              </p>

              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                Confirm the pick list after all required quantities
                have been collected from the warehouse.
              </p>
            </div>

            <button
              type="button"
              onClick={finishPickList}
              disabled={completedItems !== totalItems}
              className="rounded-lg bg-green-600 px-5 py-3 text-[10px] font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Confirm Pick List
            </button>

          </div>

          {/* COMPLETION STATUS */}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">

            <div className="rounded-lg bg-slate-50 p-3">

              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                Total Units
              </p>

              <p className="mt-1 text-lg font-bold text-slate-800">
                {totalQuantity}
              </p>

            </div>

            <div className="rounded-lg bg-green-50 p-3">

              <p className="text-[9px] font-semibold uppercase tracking-wide text-green-600">
                Picked
              </p>

              <p className="mt-1 text-lg font-bold text-green-700">
                {pickedQuantity}
              </p>

            </div>

            <div className="rounded-lg bg-orange-50 p-3">

              <p className="text-[9px] font-semibold uppercase tracking-wide text-orange-600">
                Remaining
              </p>

              <p className="mt-1 text-lg font-bold text-orange-700">
                {totalQuantity - pickedQuantity}
              </p>

            </div>

            <div className="rounded-lg bg-blue-50 p-3">

              <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-600">
                Completion
              </p>

              <p className="mt-1 text-lg font-bold text-blue-700">
                {progress}%
              </p>

            </div>

          </div>

        </section>

        {/* MOBILE SCAN INSTRUCTIONS */}

        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">

          <div className="flex gap-3">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm text-blue-700">
              ✓
            </div>

            <div>

              <h3 className="text-xs font-semibold text-slate-800">
                Mobile Picking Instructions
              </h3>

              <div className="mt-2 space-y-1.5 text-[10px] leading-5 text-slate-500">

                <p>
                  <span className="font-semibold text-slate-700">
                    1.
                  </span>{" "}
                  Go to the displayed warehouse location.
                </p>

                <p>
                  <span className="font-semibold text-slate-700">
                    2.
                  </span>{" "}
                  Scan the item barcode or enter the SKU manually.
                </p>

                <p>
                  <span className="font-semibold text-slate-700">
                    3.
                  </span>{" "}
                  Verify the item and bin before confirming the pick.
                </p>

                <p>
                  <span className="font-semibold text-slate-700">
                    4.
                  </span>{" "}
                  Repeat until all required quantities are picked.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* FOOTER */}

        <div className="pb-8 pt-6 text-center">

          <p className="text-[10px] text-slate-400">
            AI StockFlow • Mobile Pick List & Scan Confirmation
          </p>

        </div>

      </div>
    </main>
  );
}


/* =========================================================
   SUMMARY CARD
   ========================================================= */

type SummaryCardProps = {
  title: string;
  value: string;
  subtitle: string;
  valueClass?: string;
};

function SummaryCard({
  title,
  value,
  subtitle,
  valueClass = "text-slate-800",
}: SummaryCardProps) {

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className={`mt-2 text-xl font-bold ${valueClass}`}>
        {value}
      </p>

      <p className="mt-1 text-[9px] text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}


/* =========================================================
   STATUS BADGE
   ========================================================= */

function StatusBadge({
  status,
}: {
  status: PickStatus;
}) {

  const styles = {
    Pending: "bg-orange-100 text-orange-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Picked: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[9px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}


/* =========================================================
   INFO BOX
   ========================================================= */

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div className="rounded-md bg-slate-50 px-3 py-2">

      <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[10px] font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
}