"use client";

import { useMemo, useState } from "react";

type PutAwayStatus =
  | "Pending"
  | "Ready"
  | "Completed"
  | "Exception";

type PutAwayTask = {
  id: string;
  sku: string;
  product: string;
  sourceLocation: string;
  suggestedBin: string;
  quantity: number;
  putAwayQuantity: number;
  status: PutAwayStatus;
  priority: "High" | "Medium" | "Low";
};

const initialTasks: PutAwayTask[] = [
  {
    id: "PA-001",
    sku: "KB-WL-001",
    product: "Wireless Keyboard",
    sourceLocation: "Receiving / Dock 01",
    suggestedBin: "A1-01-02",
    quantity: 25,
    putAwayQuantity: 0,
    status: "Ready",
    priority: "High",
  },
  {
    id: "PA-002",
    sku: "MIC-USB-002",
    product: "USB Microphone",
    sourceLocation: "Receiving / Dock 02",
    suggestedBin: "A2-04-01",
    quantity: 15,
    putAwayQuantity: 0,
    status: "Pending",
    priority: "Medium",
  },
  {
    id: "PA-003",
    sku: "MON-24-004",
    product: "24-inch Monitor",
    sourceLocation: "Receiving / Dock 03",
    suggestedBin: "B2-03-01",
    quantity: 12,
    putAwayQuantity: 0,
    status: "Ready",
    priority: "High",
  },
  {
    id: "PA-004",
    sku: "BIN-ST-005",
    product: "Storage Bins",
    sourceLocation: "Receiving / Dock 01",
    suggestedBin: "C1-12-02",
    quantity: 40,
    putAwayQuantity: 0,
    status: "Pending",
    priority: "Low",
  },
  {
    id: "PA-005",
    sku: "CHA-OFC-003",
    product: "Office Chair",
    sourceLocation: "Receiving / Dock 04",
    suggestedBin: "B1-08-01",
    quantity: 8,
    putAwayQuantity: 0,
    status: "Exception",
    priority: "High",
  },
];

export default function PutAwayPage() {
  const [tasks, setTasks] =
    useState<PutAwayTask[]>(initialTasks);

  const [search, setSearch] = useState("");

  const [selectedTask, setSelectedTask] =
    useState<PutAwayTask | null>(null);

  const [scanValue, setScanValue] = useState("");

  const [quantity, setQuantity] = useState("");

  const [message, setMessage] = useState("");

  const [showScanner, setShowScanner] = useState(false);

  const filteredTasks = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return tasks;
    }

    return tasks.filter(
      (task) =>
        task.id.toLowerCase().includes(value) ||
        task.sku.toLowerCase().includes(value) ||
        task.product.toLowerCase().includes(value) ||
        task.sourceLocation
          .toLowerCase()
          .includes(value) ||
        task.suggestedBin
          .toLowerCase()
          .includes(value)
    );
  }, [tasks, search]);

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) =>
      task.status === "Pending" ||
      task.status === "Ready"
  ).length;

  const exceptionTasks = tasks.filter(
    (task) => task.status === "Exception"
  ).length;

  const totalUnits = tasks.reduce(
    (sum, task) => sum + task.quantity,
    0
  );

  const completedUnits = tasks.reduce(
    (sum, task) => sum + task.putAwayQuantity,
    0
  );

  const progress =
    totalUnits === 0
      ? 0
      : Math.round(
          (completedUnits / totalUnits) * 100
        );

  function openTask(task: PutAwayTask) {
    setSelectedTask(task);
    setQuantity(
      String(
        Math.max(
          task.quantity - task.putAwayQuantity,
          0
        )
      )
    );
    setScanValue("");
    setMessage("");
  }

  function scanBin() {
    if (!selectedTask) {
      setMessage("Please select a put-away task first.");
      return;
    }

    const value = scanValue.trim().toLowerCase();

    if (!value) {
      setMessage("Scan or enter the destination bin.");
      return;
    }

    if (
      value !== selectedTask.suggestedBin.toLowerCase()
    ) {
      setMessage(
        `Wrong bin. Please move the stock to ${selectedTask.suggestedBin}.`
      );
      return;
    }

    setMessage(
      `Bin ${selectedTask.suggestedBin} confirmed successfully.`
    );
  }

  function confirmPutAway() {
    if (!selectedTask) {
      setMessage("Select a put-away task first.");
      return;
    }

    const enteredQuantity = Number(quantity);

    if (
      !enteredQuantity ||
      enteredQuantity <= 0
    ) {
      setMessage("Enter a valid quantity.");
      return;
    }

    const remaining =
      selectedTask.quantity -
      selectedTask.putAwayQuantity;

    if (enteredQuantity > remaining) {
      setMessage(
        `Only ${remaining} units are remaining for this task.`
      );
      return;
    }

    if (
      scanValue.trim().toLowerCase() !==
      selectedTask.suggestedBin.toLowerCase()
    ) {
      setMessage(
        "Please scan and confirm the correct destination bin first."
      );
      return;
    }

    setTasks((current) =>
      current.map((task) => {
        if (task.id !== selectedTask.id) {
          return task;
        }

        const nextQuantity =
          task.putAwayQuantity +
          enteredQuantity;

        return {
          ...task,
          putAwayQuantity: nextQuantity,
          status:
            nextQuantity >= task.quantity
              ? "Completed"
              : "Ready",
        };
      })
    );

    setSelectedTask((current) => {
      if (!current) return null;

      const nextQuantity =
        current.putAwayQuantity +
        enteredQuantity;

      return {
        ...current,
        putAwayQuantity: nextQuantity,
        status:
          nextQuantity >= current.quantity
            ? "Completed"
            : "Ready",
      };
    });

    setMessage(
      enteredQuantity >= remaining
        ? "Put-away completed successfully."
        : "Put-away quantity confirmed."
    );

    setQuantity(
      String(
        Math.max(
          remaining - enteredQuantity,
          0
        )
      )
    );
  }

  function resetTasks() {
    setTasks(initialTasks);
    setSelectedTask(null);
    setScanValue("");
    setQuantity("");
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
              Put-away Guidance
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Move received stock to the recommended warehouse
              bin and confirm the destination by scanning.
            </p>

          </div>

          <div className="flex gap-2">

            <button
              type="button"
              onClick={resetTasks}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={() =>
                setShowScanner(!showScanner)
              }
              className="rounded-md bg-[#10233f] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#183557]"
            >
              {showScanner
                ? "Close Scanner"
                : "Scan Bin"}
            </button>

          </div>

        </div>

        {/* SUMMARY */}

        <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <SummaryCard
            title="Total Tasks"
            value={String(totalTasks)}
            subtitle="Put-away tasks"
          />

          <SummaryCard
            title="Pending"
            value={String(pendingTasks)}
            subtitle="Tasks remaining"
            valueClass="text-orange-500"
          />

          <SummaryCard
            title="Completed"
            value={String(completedTasks)}
            subtitle="Completed tasks"
            valueClass="text-green-600"
          />

          <SummaryCard
            title="Exceptions"
            value={String(exceptionTasks)}
            subtitle="Need attention"
            valueClass="text-red-600"
          />

        </section>

        {/* PROGRESS */}

        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-semibold">
                Put-away Progress
              </p>

              <p className="mt-1 text-[10px] text-slate-400">
                {completedUnits} of {totalUnits} units placed
                into storage.
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
                Destination Bin Scanner
              </h2>

              <p className="mt-1 text-[10px] text-slate-500">
                Scan the destination bin shown in the selected
                task before confirming put-away.
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
                    scanBin();
                  }
                }}
                placeholder="Scan destination bin..."
                className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                autoFocus
              />

              <button
                type="button"
                onClick={scanBin}
                className="min-h-11 rounded-lg bg-blue-600 px-5 text-xs font-semibold text-white hover:bg-blue-700"
              >
                Confirm Bin
              </button>

            </div>

            {selectedTask && (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">

                <InfoBox
                  label="Product"
                  value={selectedTask.product}
                />

                <InfoBox
                  label="Expected Bin"
                  value={selectedTask.suggestedBin}
                />

                <InfoBox
                  label="Quantity"
                  value={`${selectedTask.quantity} units`}
                />

              </div>
            )}

            {message && (
              <div className="mt-4 rounded-lg bg-slate-50 px-3 py-3 text-[10px] font-medium text-slate-600">
                {message}
              </div>
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
            placeholder="Search task, SKU, product, source or bin..."
            className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
          />

        </section>

        {/* TASK LIST */}

        <section className="rounded-xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 px-4 py-4 sm:px-5">

            <h2 className="text-sm font-semibold">
              Put-away Tasks
            </h2>

            <p className="mt-1 text-[10px] text-slate-500">
              Select a task to see its recommended destination.
            </p>

          </div>

          <div className="divide-y divide-slate-100">

            {filteredTasks.map((task) => (

              <div
                key={task.id}
                className={`p-4 transition hover:bg-slate-50 sm:p-5 ${
                  selectedTask?.id === task.id
                    ? "bg-blue-50/40"
                    : ""
                }`}
              >

                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                  {/* TASK INFORMATION */}

                  <div className="min-w-0 flex-1">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
                        {task.id.replace("PA-", "")}
                      </div>

                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="text-xs font-bold text-slate-800 sm:text-sm">
                            {task.product}
                          </h3>

                          <StatusBadge
                            status={task.status}
                          />

                          <PriorityBadge
                            priority={task.priority}
                          />

                        </div>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {task.id} • SKU: {task.sku}
                        </p>

                      </div>

                    </div>

                    {/* LOCATION GUIDANCE */}

                    <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">

                      <LocationBox
                        label="Source"
                        value={task.sourceLocation}
                      />

                      <LocationBox
                        label="Suggested Bin"
                        value={task.suggestedBin}
                        highlight
                      />

                      <LocationBox
                        label="Quantity"
                        value={`${task.putAwayQuantity} / ${task.quantity} units`}
                      />

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="flex gap-2 lg:flex-col">

                    <button
                      type="button"
                      onClick={() => {
                        openTask(task);
                        setShowScanner(true);
                      }}
                      className="flex-1 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50 lg:min-w-32"
                    >
                      View Guidance
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        openTask(task);
                        setShowScanner(true);
                      }}
                      disabled={
                        task.status === "Completed"
                      }
                      className="flex-1 rounded-md bg-[#10233f] px-4 py-2.5 text-[10px] font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300 lg:min-w-32"
                    >
                      {task.status === "Completed"
                        ? "Completed"
                        : "Start Put-away"}
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

          {filteredTasks.length === 0 && (
            <div className="px-5 py-12 text-center">

              <p className="text-sm font-semibold text-slate-700">
                No put-away tasks found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try another search term.
              </p>

            </div>
          )}

        </section>

                {/* SELECTED TASK GUIDANCE */}

        {selectedTask && (
          <section className="mt-5 rounded-xl border border-blue-200 bg-white">

            <div className="border-b border-slate-200 px-5 py-4">

              <div className="flex items-start justify-between gap-3">

                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Put-away Guidance
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-500">
                    Follow the recommended route and confirm the
                    destination bin before moving the stock.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>

              </div>

            </div>

            <div className="p-5">

              {/* ROUTE */}

              <div className="grid gap-3 md:grid-cols-3">

                <GuidanceStep
                  number="1"
                  title="Collect Stock"
                  value={selectedTask.sourceLocation}
                  description="Collect the received stock from this location."
                  active
                />

                <GuidanceStep
                  number="2"
                  title="Move to Destination"
                  value={selectedTask.suggestedBin}
                  description="Take the stock to the recommended storage bin."
                  active
                />

                <GuidanceStep
                  number="3"
                  title="Scan & Confirm"
                  value="Scan destination bin"
                  description="Confirm the bin before completing put-away."
                  active
                />

              </div>

              {/* PRODUCT DETAILS */}

              <div className="mt-5 rounded-lg bg-slate-50 p-4">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                  <InfoBox
                    label="Task ID"
                    value={selectedTask.id}
                  />

                  <InfoBox
                    label="SKU"
                    value={selectedTask.sku}
                  />

                  <InfoBox
                    label="Product"
                    value={selectedTask.product}
                  />

                  <InfoBox
                    label="Required Quantity"
                    value={`${selectedTask.quantity} units`}
                  />

                </div>

              </div>

              {/* QUANTITY */}

              <div className="mt-5">

                <label className="mb-2 block text-xs font-semibold text-slate-700">
                  Quantity to Put Away
                </label>

                <div className="flex flex-col gap-2 sm:flex-row">

                  <input
                    type="number"
                    min="1"
                    max={
                      selectedTask.quantity -
                      selectedTask.putAwayQuantity
                    }
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(event.target.value)
                    }
                    className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <div className="flex items-center rounded-lg bg-slate-100 px-4 text-xs text-slate-600">
                    Remaining:{" "}
                    <strong className="ml-1">
                      {selectedTask.quantity -
                        selectedTask.putAwayQuantity}
                    </strong>
                  </div>

                </div>

              </div>

              {/* DESTINATION */}

              <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">
                      Recommended Destination
                    </p>

                    <p className="mt-1 text-xl font-bold text-blue-900">
                      {selectedTask.suggestedBin}
                    </p>

                    <p className="mt-1 text-[10px] text-blue-700">
                      Scan this bin before confirming put-away.
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowScanner(true);
                      setScanValue(
                        selectedTask.suggestedBin
                      );
                    }}
                    className="rounded-lg bg-blue-600 px-5 py-3 text-[10px] font-bold text-white hover:bg-blue-700"
                  >
                    Scan Recommended Bin
                  </button>

                </div>

              </div>

              {/* MESSAGE */}

              {message && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">

                  <p className="text-[10px] font-medium text-slate-600">
                    {message}
                  </p>

                </div>
              )}

              {/* CONFIRM */}

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() => setSelectedTask(null)}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmPutAway}
                  disabled={
                    selectedTask.status === "Completed"
                  }
                  className="rounded-lg bg-green-600 px-5 py-3 text-[10px] font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {selectedTask.status === "Completed"
                    ? "Put-away Completed"
                    : "Confirm Put-away"}
                </button>

              </div>

            </div>

          </section>
        )}

        {/* MOBILE WORKFLOW */}

        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">

          <div className="flex gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              i
            </div>

            <div>

              <h2 className="text-xs font-semibold text-slate-800">
                Mobile Put-away Workflow
              </h2>

              <div className="mt-2 space-y-1.5 text-[10px] leading-5 text-slate-500">

                <p>
                  <span className="font-semibold text-slate-700">
                    1.
                  </span>{" "}
                  Select the put-away task assigned to you.
                </p>

                <p>
                  <span className="font-semibold text-slate-700">
                    2.
                  </span>{" "}
                  Go to the source location and collect the required
                  quantity.
                </p>

                <p>
                  <span className="font-semibold text-slate-700">
                    3.
                  </span>{" "}
                  Follow the suggested destination shown on the screen.
                </p>

                <p>
                  <span className="font-semibold text-slate-700">
                    4.
                  </span>{" "}
                  Scan the destination bin to prevent incorrect put-away.
                </p>

                <p>
                  <span className="font-semibold text-slate-700">
                    5.
                  </span>{" "}
                  Enter the quantity and confirm the put-away.
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* FOOTER */}

        <div className="pb-8 pt-6 text-center">

          <p className="text-[10px] text-slate-400">
            AI StockFlow • Mobile Put-away Guidance
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

      <p
        className={`mt-2 text-xl font-bold ${valueClass}`}
      >
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
  status: PutAwayStatus;
}) {

  const styles = {
    Pending: "bg-slate-100 text-slate-600",
    Ready: "bg-blue-100 text-blue-700",
    Completed: "bg-green-100 text-green-700",
    Exception: "bg-red-100 text-red-700",
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
   PRIORITY BADGE
   ========================================================= */

function PriorityBadge({
  priority,
}: {
  priority: "High" | "Medium" | "Low";
}) {

  const styles = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-orange-100 text-orange-700",
    Low: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-2 py-1 text-[9px] font-semibold ${styles[priority]}`}
    >
      {priority} Priority
    </span>
  );
}


/* =========================================================
   LOCATION BOX
   ========================================================= */

function LocationBox({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {

  return (
    <div
      className={`rounded-md px-3 py-2 ${
        highlight
          ? "border border-blue-100 bg-blue-50"
          : "bg-slate-50"
      }`}
    >

      <p
        className={`text-[8px] font-semibold uppercase tracking-wide ${
          highlight
            ? "text-blue-500"
            : "text-slate-400"
        }`}
      >
        {label}
      </p>

      <p
        className={`mt-1 truncate text-[10px] font-semibold ${
          highlight
            ? "text-blue-800"
            : "text-slate-700"
        }`}
      >
        {value}
      </p>

    </div>
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
    <div className="rounded-md bg-white px-3 py-2">

      <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[10px] font-semibold text-slate-700">
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   GUIDANCE STEP
   ========================================================= */

function GuidanceStep({
  number,
  title,
  value,
  description,
  active,
}: {
  number: string;
  title: string;
  value: string;
  description: string;
  active?: boolean;
}) {

  return (
    <div
      className={`rounded-xl border p-4 ${
        active
          ? "border-blue-100 bg-blue-50/50"
          : "border-slate-200 bg-white"
      }`}
    >

      <div className="flex items-start gap-3">

        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
            active
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {number}
        </div>

        <div className="min-w-0">

          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {title}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-800">
            {value}
          </p>

          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}