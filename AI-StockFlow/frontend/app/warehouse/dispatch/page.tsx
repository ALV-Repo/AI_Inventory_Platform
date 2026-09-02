"use client";

import { useMemo, useState } from "react";

type ChecklistStatus = "Ready" | "Pending" | "Exception";

type ChecklistItem = {
  id: string;
  title: string;
  description: string;
  status: ChecklistStatus;
  required: boolean;
};

type DispatchOrder = {
  id: string;
  customer: string;
  destination: string;
  warehouse: string;
  carrier: string;
  vehicle: string;
  dispatchDate: string;
  totalItems: number;
  totalUnits: number;
  checklist: ChecklistItem[];
};

const initialOrders: DispatchOrder[] = [
  {
    id: "DO-2026-001",
    customer: "Metro Retail Pvt Ltd",
    destination: "Hyderabad",
    warehouse: "Hyderabad Central",
    carrier: "Swift Logistics",
    vehicle: "TS09AB1234",
    dispatchDate: "22 Aug 2026",
    totalItems: 8,
    totalUnits: 125,
    checklist: [
      {
        id: "CHK-001",
        title: "Order picking completed",
        description: "All ordered products have been picked.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-002",
        title: "Packing completed",
        description: "All items have been packed securely.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-003",
        title: "Quantity verification",
        description: "Picked quantities match the dispatch order.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-004",
        title: "Barcode verification",
        description: "All product barcodes have been verified.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-005",
        title: "Shipping labels",
        description: "Shipping and destination labels are attached.",
        status: "Pending",
        required: true,
      },
      {
        id: "CHK-006",
        title: "Vehicle readiness",
        description: "Assigned vehicle is available for loading.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-007",
        title: "Documents",
        description: "Required dispatch documents are prepared.",
        status: "Ready",
        required: true,
      },
    ],
  },

  {
    id: "DO-2026-002",
    customer: "Bangalore Electronics",
    destination: "Bengaluru",
    warehouse: "Bengaluru Warehouse",
    carrier: "BlueDart Freight",
    vehicle: "KA05MN7788",
    dispatchDate: "22 Aug 2026",
    totalItems: 12,
    totalUnits: 210,
    checklist: [
      {
        id: "CHK-008",
        title: "Order picking completed",
        description: "All ordered products have been picked.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-009",
        title: "Packing completed",
        description: "All items have been packed securely.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-010",
        title: "Quantity verification",
        description: "Picked quantities match the dispatch order.",
        status: "Exception",
        required: true,
      },
      {
        id: "CHK-011",
        title: "Barcode verification",
        description: "All product barcodes have been verified.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-012",
        title: "Shipping labels",
        description: "Shipping and destination labels are attached.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-013",
        title: "Vehicle readiness",
        description: "Assigned vehicle is available for loading.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-014",
        title: "Documents",
        description: "Required dispatch documents are prepared.",
        status: "Ready",
        required: true,
      },
    ],
  },

  {
    id: "DO-2026-003",
    customer: "Mumbai Wholesale Hub",
    destination: "Mumbai",
    warehouse: "Mumbai Distribution Hub",
    carrier: "Delhivery",
    vehicle: "MH12PQ5566",
    dispatchDate: "23 Aug 2026",
    totalItems: 15,
    totalUnits: 340,
    checklist: [
      {
        id: "CHK-015",
        title: "Order picking completed",
        description: "All ordered products have been picked.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-016",
        title: "Packing completed",
        description: "All items have been packed securely.",
        status: "Pending",
        required: true,
      },
      {
        id: "CHK-017",
        title: "Quantity verification",
        description: "Picked quantities match the dispatch order.",
        status: "Pending",
        required: true,
      },
      {
        id: "CHK-018",
        title: "Barcode verification",
        description: "All product barcodes have been verified.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-019",
        title: "Shipping labels",
        description: "Shipping and destination labels are attached.",
        status: "Pending",
        required: true,
      },
      {
        id: "CHK-020",
        title: "Vehicle readiness",
        description: "Assigned vehicle is available for loading.",
        status: "Ready",
        required: true,
      },
      {
        id: "CHK-021",
        title: "Documents",
        description: "Required dispatch documents are prepared.",
        status: "Ready",
        required: true,
      },
    ],
  },
];

export default function DispatchPage() {
  const [orders, setOrders] =
    useState<DispatchOrder[]>(initialOrders);

  const [selectedOrderId, setSelectedOrderId] =
    useState(initialOrders[0].id);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [message, setMessage] = useState("");

  const selectedOrder =
    orders.find(
      (order) => order.id === selectedOrderId
    ) ?? orders[0];

  const filteredOrders = useMemo(() => {
    const value = search.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesSearch =
        !value ||
        order.id.toLowerCase().includes(value) ||
        order.customer.toLowerCase().includes(value) ||
        order.destination.toLowerCase().includes(value) ||
        order.warehouse.toLowerCase().includes(value);

      const statuses = order.checklist.map(
        (item) => item.status
      );

      const orderStatus = statuses.includes("Exception")
        ? "Exception"
        : statuses.includes("Pending")
          ? "Pending"
          : "Ready";

      const matchesStatus =
        statusFilter === "All" ||
        orderStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const readyCount = selectedOrder.checklist.filter(
    (item) => item.status === "Ready"
  ).length;

  const pendingCount = selectedOrder.checklist.filter(
    (item) => item.status === "Pending"
  ).length;

  const exceptionCount = selectedOrder.checklist.filter(
    (item) => item.status === "Exception"
  ).length;

  const requiredCount =
    selectedOrder.checklist.filter(
      (item) => item.required
    ).length;

  const completedRequired =
    selectedOrder.checklist.filter(
      (item) =>
        item.required && item.status === "Ready"
    ).length;

  const readiness =
    requiredCount === 0
      ? 0
      : Math.round(
          (completedRequired / requiredCount) * 100
        );

  const dispatchBlocked =
    pendingCount > 0 || exceptionCount > 0;

  function updateChecklistStatus(
    checklistId: string,
    status: ChecklistStatus
  ) {
    setOrders((current) =>
      current.map((order) => {
        if (order.id !== selectedOrder.id) {
          return order;
        }

        return {
          ...order,
          checklist: order.checklist.map(
            (item) =>
              item.id === checklistId
                ? {
                    ...item,
                    status,
                  }
                : item
          ),
        };
      })
    );

    setMessage(
      status === "Ready"
        ? "Checklist item marked ready."
        : status === "Exception"
          ? "Exception recorded for this checklist item."
          : "Checklist item marked pending."
    );
  }

  function confirmDispatch() {
    if (dispatchBlocked) {
      setMessage(
        "Dispatch is blocked. Resolve all pending and exception items first."
      );
      return;
    }

    setMessage(
      `Dispatch ${selectedOrder.id} is ready for release.`
    );
  }

  function getOrderStatus(order: DispatchOrder) {
    const statuses = order.checklist.map(
      (item) => item.status
    );

    if (statuses.includes("Exception")) {
      return "Exception";
    }

    if (statuses.includes("Pending")) {
      return "Pending";
    }

    return "Ready";
  }

  return (
    <main className="min-h-screen bg-slate-50 px-3 py-5 text-slate-800 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

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

            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Dispatch Readiness
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Verify dispatch readiness and resolve exceptions
              before releasing an order.
            </p>

          </div>

          <button
            type="button"
            onClick={confirmDispatch}
            className={`rounded-lg px-5 py-3 text-[10px] font-bold text-white ${
              dispatchBlocked
                ? "bg-slate-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {dispatchBlocked
              ? "Dispatch Blocked"
              : "Confirm Dispatch"}
          </button>

        </div>

        {/* KPI */}

        <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <SummaryCard
            title="Checklist Items"
            value={String(selectedOrder.checklist.length)}
            subtitle="Total checks"
          />

          <SummaryCard
            title="Ready"
            value={String(readyCount)}
            subtitle="Checks completed"
            valueClass="text-green-600"
          />

          <SummaryCard
            title="Pending"
            value={String(pendingCount)}
            subtitle="Need completion"
            valueClass="text-orange-500"
          />

          <SummaryCard
            title="Exceptions"
            value={String(exceptionCount)}
            subtitle="Need attention"
            valueClass="text-red-600"
          />

        </section>

        {/* SEARCH */}

        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-3">

          <div className="grid gap-2 md:grid-cols-[1fr_180px]">

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search dispatch order, customer, warehouse..."
              className="rounded-md border border-slate-300 px-3 py-2.5 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-md border border-slate-300 bg-white px-3 py-2.5 text-xs outline-none"
            >
              <option value="All">All Status</option>
              <option value="Ready">Ready</option>
              <option value="Pending">Pending</option>
              <option value="Exception">Exception</option>
            </select>

          </div>

        </section>

        {/* DISPATCH ORDER SELECTOR */}

        <section className="mb-5 rounded-xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 px-5 py-4">

            <h2 className="text-sm font-semibold">
              Dispatch Orders
            </h2>

            <p className="mt-1 text-[10px] text-slate-500">
              Select an order to review its dispatch readiness.
            </p>

          </div>

          <div className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-3">

            {filteredOrders.map((order) => {

              const orderStatus =
                getOrderStatus(order);

              const isSelected =
                selectedOrder.id === order.id;

              return (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => {
                    setSelectedOrderId(order.id);
                    setMessage("");
                  }}
                  className={`rounded-xl border p-4 text-left transition ${
                    isSelected
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="text-xs font-bold text-slate-800">
                        {order.id}
                      </p>

                      <p className="mt-1 text-[10px] text-slate-500">
                        {order.customer}
                      </p>

                    </div>

                    <OrderStatusBadge
                      status={orderStatus}
                    />

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">

                    <SmallInfo
                      label="Items"
                      value={String(order.totalItems)}
                    />

                    <SmallInfo
                      label="Units"
                      value={String(order.totalUnits)}
                    />

                    <SmallInfo
                      label="Destination"
                      value={order.destination}
                    />

                    <SmallInfo
                      label="Warehouse"
                      value={order.warehouse}
                    />

                  </div>

                </button>
              );
            })}

          </div>

          {filteredOrders.length === 0 && (
            <div className="px-5 py-12 text-center">

              <p className="text-sm font-semibold text-slate-700">
                No dispatch orders found.
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or status filter.
              </p>

            </div>
          )}

        </section>

        {/* ORDER DETAILS */}

        <section className="mb-5 rounded-xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 px-5 py-4">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <h2 className="text-sm font-semibold">
                    {selectedOrder.id}
                  </h2>

                  <OrderStatusBadge
                    status={getOrderStatus(
                      selectedOrder
                    )}
                  />

                </div>

                <p className="mt-1 text-[10px] text-slate-500">
                  Dispatch readiness overview
                </p>

              </div>

              <div className="text-left lg:text-right">

                <p className="text-[9px] uppercase tracking-wide text-slate-400">
                  Readiness
                </p>

                <p className="text-xl font-bold text-blue-600">
                  {readiness}%
                </p>

              </div>

            </div>

            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">

              <div
                className={`h-full rounded-full transition-all ${
                  exceptionCount > 0
                    ? "bg-red-500"
                    : readiness === 100
                      ? "bg-green-600"
                      : "bg-blue-600"
                }`}
                style={{
                  width: `${readiness}%`,
                }}
              />

            </div>

          </div>

          {/* ORDER INFO */}

          <div className="grid grid-cols-2 gap-px border-b border-slate-200 bg-slate-200 sm:grid-cols-3 lg:grid-cols-6">

            <OrderInfo
              label="Customer"
              value={selectedOrder.customer}
            />

            <OrderInfo
              label="Destination"
              value={selectedOrder.destination}
            />

            <OrderInfo
              label="Warehouse"
              value={selectedOrder.warehouse}
            />

            <OrderInfo
              label="Carrier"
              value={selectedOrder.carrier}
            />

            <OrderInfo
              label="Vehicle"
              value={selectedOrder.vehicle}
            />

            <OrderInfo
              label="Dispatch Date"
              value={selectedOrder.dispatchDate}
            />

          </div>

          {/* CHECKLIST */}

          <div className="p-5">

            <div className="mb-4">

              <h3 className="text-sm font-semibold">
                Dispatch Readiness Checklist
              </h3>

              <p className="mt-1 text-[10px] text-slate-500">
                Every required checkpoint must be ready before
                dispatch can be released.
              </p>

            </div>

            <div className="space-y-3">

              {selectedOrder.checklist.map(
                (item) => (

                  <ChecklistRow
                    key={item.id}
                    item={item}
                    onStatusChange={
                      updateChecklistStatus
                    }
                  />

                )
              )}

            </div>

          </div>

        </section>

                {/* DISPATCH MESSAGE */}

        {message && (
          <section className="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4">

            <div className="flex gap-3">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                i
              </div>

              <div>

                <p className="text-xs font-semibold text-blue-800">
                  Dispatch Status
                </p>

                <p className="mt-1 text-[10px] leading-5 text-blue-700">
                  {message}
                </p>

              </div>

            </div>

          </section>
        )}

        {/* EXCEPTION PANEL */}

        {exceptionCount > 0 && (
          <section className="mb-5 rounded-xl border border-red-200 bg-red-50">

            <div className="border-b border-red-200 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700">
                  !
                </div>

                <div>

                  <h3 className="text-sm font-semibold text-red-800">
                    Dispatch Exceptions
                  </h3>

                  <p className="mt-1 text-[10px] text-red-600">
                    {exceptionCount} checklist item
                    {exceptionCount === 1 ? "" : "s"} require
                    attention before dispatch.
                  </p>

                </div>

              </div>

            </div>

            <div className="divide-y divide-red-100">

              {selectedOrder.checklist
                .filter(
                  (item) =>
                    item.status === "Exception"
                )
                .map((item) => (

                  <div
                    key={item.id}
                    className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >

                    <div>

                      <p className="text-xs font-semibold text-red-800">
                        {item.title}
                      </p>

                      <p className="mt-1 text-[10px] text-red-600">
                        {item.description}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateChecklistStatus(
                          item.id,
                          "Ready"
                        )
                      }
                      className="rounded-md bg-red-600 px-4 py-2 text-[10px] font-semibold text-white hover:bg-red-700"
                    >
                      Resolve Exception
                    </button>

                  </div>

                ))}

            </div>

          </section>
        )}

        {/* DISPATCH DECISION */}

        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h3 className="text-sm font-semibold text-slate-800">
                Dispatch Decision
              </h3>

              <p className="mt-1 text-[10px] leading-5 text-slate-500">
                The system checks all required readiness conditions
                before allowing the dispatch to be released.
              </p>

            </div>

            <div className="flex items-center gap-3">

              <div
                className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${
                  dispatchBlocked
                    ? "bg-red-100 text-red-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {dispatchBlocked
                  ? "NOT READY"
                  : "READY TO DISPATCH"}
              </div>

              <button
                type="button"
                onClick={confirmDispatch}
                disabled={dispatchBlocked}
                className="rounded-lg bg-green-600 px-5 py-2.5 text-[10px] font-bold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Release Dispatch
              </button>

            </div>

          </div>

          {/* DECISION CHECKS */}

          <div className="mt-5 grid gap-3 sm:grid-cols-3">

            <DecisionCard
              title="Required Checks"
              value={`${completedRequired}/${requiredCount}`}
              ready={completedRequired === requiredCount}
            />

            <DecisionCard
              title="Pending"
              value={String(pendingCount)}
              ready={pendingCount === 0}
            />

            <DecisionCard
              title="Exceptions"
              value={String(exceptionCount)}
              ready={exceptionCount === 0}
            />

          </div>

        </section>

        {/* WORKFLOW GUIDE */}

        <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5">

          <div className="flex gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              ✓
            </div>

            <div>

              <h3 className="text-xs font-semibold text-slate-800">
                Dispatch Readiness Workflow
              </h3>

              <div className="mt-3 grid gap-3 md:grid-cols-4">

                <WorkflowStep
                  number="1"
                  title="Pick"
                  description="Verify that all order items have been picked."
                />

                <WorkflowStep
                  number="2"
                  title="Pack"
                  description="Confirm packing and quantity verification."
                />

                <WorkflowStep
                  number="3"
                  title="Verify"
                  description="Check labels, barcodes and documents."
                />

                <WorkflowStep
                  number="4"
                  title="Dispatch"
                  description="Release only when every required check is ready."
                />

              </div>

            </div>

          </div>

        </section>

        {/* FOOTER */}

        <div className="pb-8 pt-4 text-center">

          <p className="text-[10px] text-slate-400">
            AI StockFlow • Dispatch Readiness & Exception Management
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
   ORDER STATUS BADGE
   ========================================================= */

function OrderStatusBadge({
  status,
}: {
  status: string;
}) {

  const styles: Record<string, string> = {
    Ready: "bg-green-100 text-green-700",
    Pending: "bg-orange-100 text-orange-700",
    Exception: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${
        styles[status] ??
        "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}


/* =========================================================
   CHECKLIST ROW
   ========================================================= */

function ChecklistRow({
  item,
  onStatusChange,
}: {
  item: ChecklistItem;
  onStatusChange: (
    id: string,
    status: ChecklistStatus
  ) => void;
}) {

  return (
    <div
      className={`rounded-xl border p-4 ${
        item.status === "Exception"
          ? "border-red-200 bg-red-50/40"
          : item.status === "Pending"
            ? "border-orange-200 bg-orange-50/30"
            : "border-green-100 bg-green-50/20"
      }`}
    >

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex items-start gap-3">

          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
              item.status === "Ready"
                ? "bg-green-100 text-green-700"
                : item.status === "Exception"
                  ? "bg-red-100 text-red-700"
                  : "bg-orange-100 text-orange-700"
            }`}
          >
            {item.status === "Ready"
              ? "✓"
              : item.status === "Exception"
                ? "!"
                : "•"}
          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <p className="text-xs font-semibold text-slate-800">
                {item.title}
              </p>

              {item.required && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold text-slate-500">
                  Required
                </span>
              )}

            </div>

            <p className="mt-1 text-[10px] leading-5 text-slate-500">
              {item.description}
            </p>

          </div>

        </div>

        <div className="flex items-center gap-2">

          <OrderStatusBadge
            status={item.status}
          />

          {item.status !== "Ready" && (
            <button
              type="button"
              onClick={() =>
                onStatusChange(
                  item.id,
                  "Ready"
                )
              }
              className="rounded-md border border-green-300 bg-white px-3 py-2 text-[9px] font-semibold text-green-700 hover:bg-green-50"
            >
              Mark Ready
            </button>
          )}

          {item.status === "Ready" && (
            <button
              type="button"
              onClick={() =>
                onStatusChange(
                  item.id,
                  "Exception"
                )
              }
              className="rounded-md border border-red-200 bg-white px-3 py-2 text-[9px] font-semibold text-red-600 hover:bg-red-50"
            >
              Flag
            </button>
          )}

        </div>

      </div>

    </div>
  );
}


/* =========================================================
   SMALL INFO
   ========================================================= */

function SmallInfo({
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


/* =========================================================
   ORDER INFO
   ========================================================= */

function OrderInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {

  return (
    <div className="bg-white px-4 py-3">

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
   DECISION CARD
   ========================================================= */

function DecisionCard({
  title,
  value,
  ready,
}: {
  title: string;
  value: string;
  ready: boolean;
}) {

  return (
    <div
      className={`rounded-xl border p-4 ${
        ready
          ? "border-green-100 bg-green-50"
          : "border-red-100 bg-red-50"
      }`}
    >

      <div className="flex items-center justify-between">

        <p
          className={`text-[9px] font-semibold uppercase tracking-wide ${
            ready
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {title}
        </p>

        <span
          className={`text-sm font-bold ${
            ready
              ? "text-green-700"
              : "text-red-700"
          }`}
        >
          {ready ? "✓" : "!"}
        </span>

      </div>

      <p
        className={`mt-2 text-xl font-bold ${
          ready
            ? "text-green-700"
            : "text-red-700"
        }`}
      >
        {value}
      </p>

    </div>
  );
}


/* =========================================================
   WORKFLOW STEP
   ========================================================= */

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">

      <div className="flex items-start gap-2">

        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#10233f] text-[9px] font-bold text-white">
          {number}
        </div>

        <div>

          <p className="text-[10px] font-semibold text-slate-800">
            {title}
          </p>

          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            {description}
          </p>

        </div>

      </div>

    </div>
  );
}