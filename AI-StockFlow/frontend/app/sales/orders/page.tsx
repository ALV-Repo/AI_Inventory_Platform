"use client";

import React, { useEffect, useMemo, useState } from "react";

type OrderStatus =
  | "Draft"
  | "Confirmed"
  | "Processing"
  | "Completed"
  | "Cancelled";

type SalesOrder = {
  id: string;
  customer: string;
  phone: string;
  date: string;
  items: number;
  amount: number;
  payment: string;
  status: OrderStatus;
  productName: string;
  sku: string;
  warehouse: string;
  orderedQty: number;
};

type StockReservation = {
  id: string;
  orderId: string;
  productName: string;
  sku: string;
  warehouse: string;
  quantity: number;
  status: "Active" | "Released";
  createdAt: string;
  releasedAt?: string;
};

type StockSnapshot = {
  onHand: number;
  reserved: number;
  atp: number;
};

const initialOrders: SalesOrder[] = [
  {
    id: "SO-2026-001",
    customer: "Apex Retail Solutions",
    phone: "+91 98765 43210",
    date: "21 Aug 2026",
    items: 4,
    amount: 68500,
    payment: "Pending",
    status: "Confirmed",
    productName: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
    warehouse: "Main Store",
    orderedQty: 4,
  },
  {
    id: "SO-2026-002",
    customer: "Green Valley Stores",
    phone: "+91 91234 56789",
    date: "20 Aug 2026",
    items: 2,
    amount: 32000,
    payment: "Paid",
    status: "Completed",
    productName: "Bluetooth Speaker",
    sku: "ELC-BT-600-BLK",
    warehouse: "Main Store",
    orderedQty: 2,
  },
  {
    id: "SO-2026-003",
    customer: "Metro Office Supplies",
    phone: "+91 99887 66554",
    date: "19 Aug 2026",
    items: 6,
    amount: 84500,
    payment: "Partial",
    status: "Processing",
    productName: "Wireless Keyboard",
    sku: "GAD-KB-100",
    warehouse: "Main Store",
    orderedQty: 6,
  },
  {
    id: "SO-2026-004",
    customer: "Sunrise Electronics",
    phone: "+91 90123 45678",
    date: "18 Aug 2026",
    items: 3,
    amount: 45800,
    payment: "Paid",
    status: "Completed",
    productName: "Gaming Mouse",
    sku: "GAD-MS-100",
    warehouse: "Main Store",
    orderedQty: 3,
  },
  {
    id: "SO-2026-005",
    customer: "City Mart",
    phone: "+91 93456 78901",
    date: "17 Aug 2026",
    items: 5,
    amount: 27500,
    payment: "Pending",
    status: "Draft",
    productName: "USB Microphone",
    sku: "GAD-MIC-100",
    warehouse: "Main Store",
    orderedQty: 5,
  },
];

const products = [
  {
    name: "Wireless Keyboard",
    sku: "GAD-KB-100",
    price: 1200,
    onHand: 32,
    warehouse: "Main Store",
  },
  {
    name: "USB Microphone",
    sku: "GAD-MIC-100",
    price: 2400,
    onHand: 18,
    warehouse: "Main Store",
  },
  {
    name: "Gaming Mouse",
    sku: "GAD-MS-100",
    price: 1500,
    onHand: 25,
    warehouse: "Main Store",
  },
  {
    name: "Bluetooth Speaker",
    sku: "ELC-BT-600-BLK",
    price: 3200,
    onHand: 8,
    warehouse: "Main Store",
  },
  {
    name: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
    price: 4200,
    onHand: 24,
    warehouse: "Main Store",
  },
];

const warehouses = ["Main Store", "Warehouse A", "Warehouse B"];

const fallbackWarehouseStock: Record<
  string,
  Record<string, number>
> = {
  "GAD-KB-100": {
    "Main Store": 32,
    "Warehouse A": 12,
    "Warehouse B": 8,
  },
  "GAD-MIC-100": {
    "Main Store": 18,
    "Warehouse A": 8,
    "Warehouse B": 5,
  },
  "GAD-MS-100": {
    "Main Store": 25,
    "Warehouse A": 10,
    "Warehouse B": 6,
  },
  "ELC-BT-600-BLK": {
    "Main Store": 8,
    "Warehouse A": 5,
    "Warehouse B": 3,
  },
  "TOY-HW-002": {
    "Main Store": 24,
    "Warehouse A": 12,
    "Warehouse B": 7,
  },
};

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    Draft: "bg-slate-100 text-slate-700",
    Confirmed: "bg-blue-100 text-blue-700",
    Processing: "bg-amber-100 text-amber-700",
    Completed: "bg-emerald-100 text-emerald-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function ReservationBadge({
  status,
}: {
  status: "Active" | "Released" | "None";
}) {
  const styles = {
    Active: "bg-blue-100 text-blue-700",
    Released: "bg-slate-100 text-slate-500",
    None: "bg-slate-100 text-slate-400",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {status === "None" ? "Not Reserved" : status}
    </span>
  );
}

function readInventoryStock(
  sku: string,
  warehouse: string,
  refreshKey = 0
): number {
  void refreshKey;

  const fallback = products.find(
    (item) => item.sku === sku && item.warehouse === warehouse
  );

  const fallbackWarehouseQuantity =
    fallbackWarehouseStock[sku]?.[warehouse] ?? fallback?.onHand ?? 0;

  if (typeof window === "undefined") {
    return fallbackWarehouseQuantity;
  }

  try {
    const overrides = JSON.parse(
      localStorage.getItem("inventory-stock-overrides") || "{}"
    ) as Record<string, number>;

    const overrideKey = `${sku}::${warehouse}`;
    if (typeof overrides[overrideKey] === "number") {
      return Math.max(0, overrides[overrideKey]);
    }

    const raw = localStorage.getItem("inventory-products");
    if (raw) {
      const inventoryItems = JSON.parse(raw);
      if (Array.isArray(inventoryItems)) {
        const matching = inventoryItems.find((item: any) => {
          const itemSku = String(item?.sku ?? item?.code ?? "").trim();
          const itemWarehouse = String(
            item?.warehouse ?? item?.warehouse_name ?? ""
          ).trim();

          return (
            itemSku.toLowerCase() === sku.toLowerCase() &&
            (!itemWarehouse ||
              itemWarehouse.toLowerCase() === warehouse.toLowerCase())
          );
        });

        if (matching) {
          const onHand = Number(
            matching.current_stock ??
              matching.on_hand ??
              matching.quantity ??
              matching.stock ??
              0
          );

          if (Number.isFinite(onHand)) {
            return Math.max(0, onHand);
          }
        }
      }
    }
  } catch {
    // Fall back to the local product catalog.
  }

  return fallbackWarehouseQuantity;
}

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>(() => {
    if (typeof window === "undefined") return initialOrders;

    try {
      const stored = localStorage.getItem("sales-orders");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Use initial demo orders.
    }

    return initialOrders;
  });

  const [reservations, setReservations] = useState<StockReservation[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem("inventory-stock-reservations");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }

      return initialOrders
        .filter(
          (order) =>
            order.status === "Confirmed" || order.status === "Processing"
        )
        .map((order) => ({
          id: `RES-${order.id}`,
          orderId: order.id,
          productName: order.productName,
          sku: order.sku,
          warehouse: order.warehouse,
          quantity: order.orderedQty,
          status: "Active" as const,
          createdAt: new Date().toISOString(),
        }));
    } catch {
      return [];
    }
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<SalesOrder | null>(null);

  const [showSuccess, setShowSuccess] = useState("");
  const [reservationMessage, setReservationMessage] = useState("");

  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState("Pending");

  const [reservationModal, setReservationModal] =
    useState<SalesOrder | null>(null);
  const [reservationWarehouse, setReservationWarehouse] =
    useState("Main Store");
  const [reservationQuantity, setReservationQuantity] = useState(1);
  const [stockRefreshKey, setStockRefreshKey] = useState(0);

  useEffect(() => {
    localStorage.setItem("sales-orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(
      "inventory-stock-reservations",
      JSON.stringify(reservations)
    );
  }, [reservations]);

  const getReservedQuantity = (
    sku: string,
    warehouse: string,
    excludeOrderId?: string
  ) =>
    reservations
      .filter(
        (reservation) =>
          reservation.status === "Active" &&
          reservation.sku.toLowerCase() === sku.toLowerCase() &&
          reservation.warehouse === warehouse &&
          reservation.orderId !== excludeOrderId
      )
      .reduce((sum, reservation) => sum + reservation.quantity, 0);

  const getStockSnapshot = (
    sku: string,
    warehouse: string,
    excludeOrderId?: string
  ): StockSnapshot => {
    const onHand = readInventoryStock(sku, warehouse, stockRefreshKey);
    const reserved = getReservedQuantity(
      sku,
      warehouse,
      excludeOrderId
    );

    return {
      onHand,
      reserved,
      atp: Math.max(0, onHand - reserved),
    };
  };

  const getOrderReservation = (order: SalesOrder) =>
    reservations.find(
      (reservation) =>
        reservation.orderId === order.id &&
        reservation.status === "Active"
    );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.id.toLowerCase().includes(search.toLowerCase()) ||
        order.customer.toLowerCase().includes(search.toLowerCase()) ||
        order.phone.includes(search);

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalValue = orders.reduce(
    (sum, order) => sum + order.amount,
    0
  );

  const pendingCount = orders.filter(
    (order) => order.status === "Confirmed"
  ).length;

  const processingCount = orders.filter(
    (order) => order.status === "Processing"
  ).length;

  const completedCount = orders.filter(
    (order) => order.status === "Completed"
  ).length;

  const activeReservationCount = reservations.filter(
    (reservation) => reservation.status === "Active"
  ).length;

  const activeReservedUnits = reservations
    .filter((reservation) => reservation.status === "Active")
    .reduce((sum, reservation) => sum + reservation.quantity, 0);

  const totalAtp = products.reduce(
    (sum, product) =>
      sum +
      getStockSnapshot(product.sku, product.warehouse).atp,
    0
  );

  const paidValue = orders
    .filter((order) => order.payment === "Paid")
    .reduce((sum, order) => sum + order.amount, 0);

  function resetForm() {
    setCustomer("");
    setPhone("");
    setSelectedProduct("");
    setQuantity(1);
    setPayment("Pending");
  }

  function createOrder() {
    if (!customer.trim()) {
      alert("Please enter customer name.");
      return;
    }

    if (!selectedProduct) {
      alert("Please select a product.");
      return;
    }

    const product = products.find(
      (item) => item.name === selectedProduct
    );

    if (!product) return;

    if (quantity <= 0) {
      alert("Quantity must be greater than 0.");
      return;
    }

    const amount = product.price * quantity;

    const newOrder: SalesOrder = {
      id: `SO-2026-${String(orders.length + 1).padStart(3, "0")}`,
      customer,
      phone: phone || "Not provided",
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      items: quantity,
      amount,
      payment,
      status: "Draft",
      productName: product.name,
      sku: product.sku,
      warehouse: product.warehouse,
      orderedQty: quantity,
    };

    setOrders((current) => [newOrder, ...current]);

    resetForm();
    setShowCreate(false);
    setShowSuccess("Sales order created successfully.");
  }

  function reserveStock(
    order: SalesOrder,
    warehouse = order.warehouse,
    requestedQuantity = order.orderedQty
  ): boolean {
    if (!order.sku) {
      setReservationMessage(
        "This order has no SKU. Add a product SKU before reserving stock."
      );
      return false;
    }

    if (requestedQuantity <= 0) {
      setReservationMessage("Reservation quantity must be greater than 0.");
      return false;
    }

    const existing = getOrderReservation(order);
    if (existing) {
      setReservationMessage(
        `${order.id} already has ${existing.quantity} unit(s) reserved.`
      );
      return false;
    }

    const snapshot = getStockSnapshot(order.sku, warehouse);

    if (requestedQuantity > snapshot.atp) {
      setReservationMessage(
        `Insufficient ATP. ${snapshot.atp} unit(s) are available to reserve for ${order.sku}.`
      );
      return false;
    }

    const reservation: StockReservation = {
      id: `RES-${Date.now()}`,
      orderId: order.id,
      productName: order.productName,
      sku: order.sku,
      warehouse,
      quantity: requestedQuantity,
      status: "Active",
      createdAt: new Date().toISOString(),
    };

    setReservations((current) => [...current, reservation]);

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              warehouse,
              orderedQty: requestedQuantity,
              items: requestedQuantity,
            }
          : item
      )
    );

    setReservationMessage(
      `${requestedQuantity} unit(s) reserved for ${order.id}.`
    );
    setStockRefreshKey((key) => key + 1);
    return true;
  }

  function releaseReservation(order: SalesOrder) {
    const active = getOrderReservation(order);

    if (!active) {
      setReservationMessage(`No active reservation exists for ${order.id}.`);
      return;
    }

    setReservations((current) =>
      current.map((reservation) =>
        reservation.id === active.id
          ? {
              ...reservation,
              status: "Released",
              releasedAt: new Date().toISOString(),
            }
          : reservation
      )
    );

    setReservationMessage(
      `${active.quantity} unit(s) released from ${order.id}.`
    );
    setStockRefreshKey((key) => key + 1);
  }

  function openReservation(order: SalesOrder) {
    setReservationModal(order);
    setReservationWarehouse(order.warehouse || "Main Store");
    setReservationQuantity(order.orderedQty || order.items || 1);
    setReservationMessage("");
  }

  function closeReservation() {
    setReservationModal(null);
    setReservationMessage("");
    setReservationQuantity(1);
  }

  function saveReservation() {
    if (!reservationModal) return;

    const success = reserveStock(
      reservationModal,
      reservationWarehouse,
      reservationQuantity
    );

    if (success) {
      setShowSuccess(
        `${reservationQuantity} unit(s) reserved for ${reservationModal.id}.`
      );
      setReservationModal(null);
      setReservationMessage("");
      setSelectedOrder(null);
    }
  }

  function confirmOrder(order: SalesOrder) {
    const activeReservation = getOrderReservation(order);

    if (!activeReservation) {
      const success = reserveStock(order);

      if (!success) {
        setShowSuccess("");
        setSelectedOrder(order);
        return;
      }
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? { ...item, status: "Confirmed" }
          : item
      )
    );

    setSelectedOrder(null);
    setShowSuccess(
      `${order.id} confirmed and stock reservation created.`
    );
  }

  function processOrder(order: SalesOrder) {
    const activeReservation = getOrderReservation(order);

    if (!activeReservation) {
      alert("Reserve stock before moving the order to Processing.");
      openReservation(order);
      return;
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? { ...item, status: "Processing" }
          : item
      )
    );

    setSelectedOrder(null);
    setShowSuccess(`${order.id} moved to Processing.`);
  }

  function consumeStock(order: SalesOrder, quantity: number) {
    if (typeof window === "undefined" || !order.sku) return;

    const overrideKey = `${order.sku}::${order.warehouse}`;

    try {
      const overrides = JSON.parse(
        localStorage.getItem("inventory-stock-overrides") || "{}"
      ) as Record<string, number>;

      const currentOnHand = readInventoryStock(
        order.sku,
        order.warehouse,
        stockRefreshKey
      );

      overrides[overrideKey] = Math.max(0, currentOnHand - quantity);

      localStorage.setItem(
        "inventory-stock-overrides",
        JSON.stringify(overrides)
      );

      const raw = localStorage.getItem("inventory-products");

      if (raw) {
        const inventoryItems = JSON.parse(raw);

        if (Array.isArray(inventoryItems)) {
          const updatedItems = inventoryItems.map((item: any) => {
            const itemSku = String(
              item?.sku ?? item?.code ?? ""
            ).trim();

            const itemWarehouse = String(
              item?.warehouse ?? item?.warehouse_name ?? ""
            ).trim();

            if (
              itemSku.toLowerCase() !== order.sku.toLowerCase() ||
              (itemWarehouse &&
                itemWarehouse.toLowerCase() !==
                  order.warehouse.toLowerCase())
            ) {
              return item;
            }

            const nextStock = Math.max(
              0,
              Number(
                item.current_stock ??
                  item.on_hand ??
                  item.quantity ??
                  item.stock ??
                  0
              ) - quantity
            );

            return {
              ...item,
              current_stock:
                item.current_stock !== undefined
                  ? nextStock
                  : item.current_stock,
              on_hand:
                item.on_hand !== undefined
                  ? nextStock
                  : item.on_hand,
              quantity:
                item.quantity !== undefined
                  ? nextStock
                  : item.quantity,
              stock:
                item.stock !== undefined
                  ? nextStock
                  : item.stock,
            };
          });

          localStorage.setItem(
            "inventory-products",
            JSON.stringify(updatedItems)
          );
        }
      }
    } catch {
      // Reservation state still remains valid even if inventory storage is unavailable.
    }
  }

  function completeOrder(order: SalesOrder) {
    const activeReservation = getOrderReservation(order);

    if (!activeReservation) {
      alert("No active reservation exists for this order.");
      openReservation(order);
      return;
    }

    consumeStock(order, activeReservation.quantity);

    setReservations((current) =>
      current.map((reservation) =>
        reservation.id === activeReservation.id
          ? {
              ...reservation,
              status: "Released",
              releasedAt: new Date().toISOString(),
            }
          : reservation
      )
    );

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              status: "Completed",
              payment: "Paid",
            }
          : item
      )
    );

    setStockRefreshKey((key) => key + 1);
    setSelectedOrder(null);
    setShowSuccess(
      `${order.id} completed. ${activeReservation.quantity} reserved unit(s) fulfilled and released.`
    );
  }

  function cancelOrder(order: SalesOrder) {
    const activeReservation = getOrderReservation(order);

    if (activeReservation) {
      setReservations((current) =>
        current.map((reservation) =>
          reservation.id === activeReservation.id
            ? {
                ...reservation,
                status: "Released",
                releasedAt: new Date().toISOString(),
              }
            : reservation
        )
      );
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? { ...item, status: "Cancelled" }
          : item
      )
    );

    setSelectedOrder(null);
    setStockRefreshKey((key) => key + 1);
    setShowSuccess(
      activeReservation
        ? `${order.id} cancelled and ${activeReservation.quantity} reserved unit(s) released.`
        : `${order.id} cancelled.`
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[9px] font-bold text-blue-700">
                FR-INV-09
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                ATP CONTROL
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900">
              Sales Orders
            </h1>

            <p className="mt-1 max-w-2xl text-xs text-slate-500">
              Manage sales orders, customer fulfilment and warehouse-level
              stock reservations. Confirmed orders reserve inventory and
              reduce Available-to-Promise (ATP).
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="rounded-lg bg-[#12213a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1b3153]"
          >
            + New Sales Order
          </button>
        </div>

        {/* Success */}
        {showSuccess && (
          <div className="mb-5 flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">
            <span>{showSuccess}</span>

            <button
              type="button"
              onClick={() => setShowSuccess("")}
              className="font-semibold"
            >
              ×
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Total Orders
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {orders.length}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              All sales orders
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-blue-500">
              Active Reservations
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-700">
              {activeReservationCount}
            </p>
            <p className="mt-1 text-[10px] text-blue-500">
              {activeReservedUnits} units reserved
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-emerald-500">
              Total ATP
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-700">
              {totalAtp}
            </p>
            <p className="mt-1 text-[10px] text-emerald-600">
              Available to promise
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Completed
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {completedCount}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              Successfully fulfilled
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Total Value
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {formatCurrency(totalValue)}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              Combined order value
            </p>
          </div>
        </div>

        {/* ATP Summary */}
        <section className="mb-5 rounded-xl border border-blue-100 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">
                  Stock Reservation &amp; ATP
                </h2>
                <span className="rounded-full bg-blue-100 px-2 py-1 text-[9px] font-bold text-blue-700">
                  FR-INV-09
                </span>
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                ATP = On Hand − Active Reserved Quantity
              </p>
            </div>

            <span className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-500">
              Reservation data is persisted locally
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Product / SKU
                  </th>
                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Warehouse
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    On Hand
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Reserved
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    ATP
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Availability
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {products.map((product) => {
                  const snapshot = getStockSnapshot(
                    product.sku,
                    product.warehouse
                  );

                  return (
                    <tr
                      key={product.sku}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-3">
                        <p className="text-xs font-semibold text-slate-800">
                          {product.name}
                        </p>
                        <p className="mt-1 font-mono text-[9px] text-slate-400">
                          {product.sku}
                        </p>
                      </td>

                      <td className="px-4 py-3 text-xs text-slate-600">
                        {product.warehouse}
                      </td>

                      <td className="px-4 py-3 text-right text-xs font-semibold text-slate-800">
                        {snapshot.onHand}
                      </td>

                      <td className="px-4 py-3 text-right text-xs font-semibold text-orange-600">
                        {snapshot.reserved}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                          {snapshot.atp}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-[10px] font-semibold ${
                            snapshot.atp === 0
                              ? "text-red-600"
                              : snapshot.atp <= 5
                                ? "text-amber-600"
                                : "text-emerald-600"
                          }`}
                        >
                          {snapshot.atp === 0
                            ? "Unavailable"
                            : snapshot.atp <= 5
                              ? "Low ATP"
                              : "Available"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Status Tabs */}
        <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2">
          {[
            "All",
            "Draft",
            "Confirmed",
            "Processing",
            "Completed",
            "Cancelled",
          ].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition ${
                statusFilter === status
                  ? "bg-[#12213a] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {status}
              <span
                className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] ${
                  statusFilter === status
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {status === "All"
                  ? orders.length
                  : orders.filter(
                      (order) => order.status === status
                    ).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex gap-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by order number, customer or phone..."
              className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-xs outline-none focus:border-blue-400"
            />

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-900">
              Sales Order List
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Order
                  </th>
                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Product
                  </th>
                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Warehouse
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Qty
                  </th>
                  <th className="px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    ATP
                  </th>
                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Payment
                  </th>
                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Reservation
                  </th>
                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const activeReservation = getOrderReservation(order);
                  const snapshot = getStockSnapshot(
                    order.sku,
                    order.warehouse
                  );

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <p className="text-xs font-bold text-slate-900">
                          {order.id}
                        </p>
                        <p className="mt-1 text-[9px] text-slate-400">
                          {order.date}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-xs font-medium text-slate-800">
                          {order.customer}
                        </p>
                        <p className="mt-1 text-[9px] text-slate-400">
                          {order.phone}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-xs font-semibold text-slate-800">
                          {order.productName}
                        </p>
                        <p className="mt-1 font-mono text-[9px] text-slate-400">
                          {order.sku}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-600">
                        {order.warehouse}
                      </td>

                      <td className="px-4 py-4 text-right text-xs font-bold text-slate-800">
                        {order.orderedQty}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <span
                          className={`text-xs font-bold ${
                            snapshot.atp >= order.orderedQty
                              ? "text-emerald-600"
                              : "text-red-600"
                          }`}
                        >
                          {snapshot.atp}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`text-[10px] font-semibold ${
                            order.payment === "Paid"
                              ? "text-emerald-600"
                              : order.payment === "Partial"
                                ? "text-amber-600"
                                : "text-slate-500"
                          }`}
                        >
                          {order.payment}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <StatusBadge status={order.status} />
                      </td>

                      <td className="px-4 py-4">
                        <ReservationBadge
                          status={
                            activeReservation ? "Active" : "None"
                          }
                        />
                        {activeReservation && (
                          <p className="mt-1 text-[9px] text-slate-400">
                            {activeReservation.quantity} unit(s)
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(order)}
                            className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
                          >
                            View
                          </button>

                          {order.status === "Draft" && (
                            <button
                              type="button"
                              onClick={() => confirmOrder(order)}
                              className="rounded-md bg-blue-600 px-2.5 py-1.5 text-[10px] font-semibold text-white"
                            >
                              Confirm
                            </button>
                          )}

                          {order.status === "Confirmed" && (
                            <button
                              type="button"
                              onClick={() => processOrder(order)}
                              className="rounded-md bg-amber-600 px-2.5 py-1.5 text-[10px] font-semibold text-white"
                            >
                              Process
                            </button>
                          )}

                          {order.status === "Processing" && (
                            <button
                              type="button"
                              onClick={() => completeOrder(order)}
                              className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-[10px] font-semibold text-white"
                            >
                              Complete
                            </button>
                          )}

                          {order.status !== "Completed" &&
                            order.status !== "Cancelled" && (
                              <button
                                type="button"
                                onClick={() => openReservation(order)}
                                className="rounded-md border border-blue-200 bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-blue-700"
                              >
                                {activeReservation
                                  ? "Manage"
                                  : "Reserve"}
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm font-medium text-slate-700">
                No sales orders found
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or status filter.
              </p>
            </div>
          )}
        </div>

        {/* Active Reservation Ledger */}
        <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-sm font-bold text-slate-900">
              Active Reservation Ledger
            </h2>
            <p className="mt-1 text-[10px] text-slate-400">
              Every active reservation reduces ATP for its SKU and warehouse.
            </p>
          </div>

          {reservations.filter(
            (reservation) => reservation.status === "Active"
          ).length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-slate-400">
              No active stock reservations.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-left">
                    <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                      Reservation
                    </th>
                    <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                      Sales Order
                    </th>
                    <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                      SKU
                    </th>
                    <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                      Warehouse
                    </th>
                    <th className="px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                      Reserved Qty
                    </th>
                    <th className="px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                      ATP After Reservation
                    </th>
                    <th className="px-4 py-3 text-right text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {reservations
                    .filter(
                      (reservation) => reservation.status === "Active"
                    )
                    .map((reservation) => {
                      const snapshot = getStockSnapshot(
                        reservation.sku,
                        reservation.warehouse
                      );

                      const order = orders.find(
                        (item) => item.id === reservation.orderId
                      );

                      return (
                        <tr
                          key={reservation.id}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-5 py-3">
                            <p className="font-mono text-[10px] font-semibold text-blue-700">
                              {reservation.id}
                            </p>
                            <p className="mt-1 text-[9px] text-slate-400">
                              {reservation.productName}
                            </p>
                          </td>

                          <td className="px-4 py-3 text-xs font-semibold text-slate-800">
                            {reservation.orderId}
                          </td>

                          <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                            {reservation.sku}
                          </td>

                          <td className="px-4 py-3 text-xs text-slate-600">
                            {reservation.warehouse}
                          </td>

                          <td className="px-4 py-3 text-right text-xs font-bold text-orange-600">
                            {reservation.quantity}
                          </td>

                          <td className="px-4 py-3 text-right text-xs font-bold text-emerald-600">
                            {snapshot.atp}
                          </td>

                          <td className="px-4 py-3 text-right">
                            {order && (
                              <button
                                type="button"
                                onClick={() =>
                                  releaseReservation(order)
                                }
                                className="rounded-md border border-red-200 px-2.5 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                              >
                                Release
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Bottom Summary */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">
              Confirmed Orders
            </p>
            <p className="mt-2 text-xl font-bold text-blue-600">
              {pendingCount}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              Awaiting processing
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">
              Processing Orders
            </p>
            <p className="mt-2 text-xl font-bold text-amber-600">
              {processingCount}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              Currently being fulfilled
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">
              Paid Order Value
            </p>
            <p className="mt-2 text-xl font-bold text-emerald-600">
              {formatCurrency(paidValue)}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              Fully paid sales orders
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-[9px] uppercase tracking-wider text-slate-400">
              Average Order Value
            </p>
            <p className="mt-2 text-xl font-bold text-blue-600">
              {formatCurrency(
                orders.length
                  ? Math.round(totalValue / orders.length)
                  : 0
              )}
            </p>
            <p className="mt-1 text-[10px] text-slate-400">
              Across all sales orders
            </p>
          </div>
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  New Sales Order
                </h2>
                <p className="mt-1 text-[10px] text-slate-400">
                  Create a draft order. Stock is reserved when the order is confirmed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
                className="text-lg text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold text-slate-600">
                    Customer Name
                  </label>
                  <input
                    value={customer}
                    onChange={(event) =>
                      setCustomer(event.target.value)
                    }
                    placeholder="Enter customer name"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold text-slate-600">
                    Phone
                  </label>
                  <input
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-bold text-slate-800">
                  Order Item
                </p>

                <div className="grid grid-cols-[1fr_120px] gap-3">
                  <select
                    value={selectedProduct}
                    onChange={(event) =>
                      setSelectedProduct(event.target.value)
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
                  >
                    <option value="">Select product</option>

                    {products.map((product) => (
                      <option
                        key={product.sku}
                        value={product.name}
                      >
                        {product.name} — {formatCurrency(product.price)}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(
                        Math.max(1, Number(event.target.value))
                      )
                    }
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
                  />
                </div>

                {selectedProduct && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white px-3 py-3 text-xs">
                      <span className="text-slate-500">Order amount</span>
                      <p className="mt-1 font-bold text-slate-900">
                        {formatCurrency(
                          (products.find(
                            (product) =>
                              product.name === selectedProduct
                          )?.price || 0) * quantity
                        )}
                      </p>
                    </div>

                    <div className="rounded-lg bg-white px-3 py-3 text-xs">
                      <span className="text-slate-500">Current ATP</span>
                      <p className="mt-1 font-bold text-emerald-600">
                        {(() => {
                          const product = products.find(
                            (item) =>
                              item.name === selectedProduct
                          );

                          return product
                            ? getStockSnapshot(
                                product.sku,
                                product.warehouse
                              ).atp
                            : 0;
                        })()}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-semibold text-slate-600">
                  Payment Status
                </label>

                <select
                  value={payment}
                  onChange={(event) =>
                    setPayment(event.target.value)
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none"
                >
                  <option>Pending</option>
                  <option>Partial</option>
                  <option>Paid</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createOrder}
                className="rounded-lg bg-[#12213a] px-5 py-2 text-xs font-semibold text-white"
              >
                Create Sales Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Modal */}
      {reservationModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-5">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">
                    Reserve Stock
                  </h2>
                  <span className="rounded-full bg-blue-100 px-2 py-1 text-[9px] font-bold text-blue-700">
                    FR-INV-09
                  </span>
                </div>

                <p className="mt-1 text-[10px] text-slate-400">
                  {reservationModal.id} · {reservationModal.productName}
                </p>
              </div>

              <button
                type="button"
                onClick={closeReservation}
                className="text-lg text-slate-400 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[9px] uppercase tracking-wide text-slate-400">
                    SKU
                  </p>
                  <p className="mt-1 font-mono text-xs font-bold text-slate-800">
                    {reservationModal.sku}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[9px] uppercase tracking-wide text-slate-400">
                    Requested
                  </p>
                  <p className="mt-1 text-xs font-bold text-slate-800">
                    {reservationModal.orderedQty} units
                  </p>
                </div>
              </div>

              {getOrderReservation(reservationModal) ? (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-bold text-blue-800">
                    Active reservation already exists
                  </p>
                  <p className="mt-1 text-[10px] text-blue-600">
                    {getOrderReservation(reservationModal)?.quantity} unit(s)
                    are currently excluded from ATP for this order.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      releaseReservation(reservationModal);
                      setReservationModal(null);
                    }}
                    className="mt-3 rounded-lg border border-red-200 bg-white px-4 py-2 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                  >
                    Release Reservation
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold text-slate-600">
                      Warehouse
                    </label>
                    <select
                      value={reservationWarehouse}
                      onChange={(event) =>
                        setReservationWarehouse(event.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                    >
                      {warehouses.map((warehouse) => (
                        <option key={warehouse} value={warehouse}>
                          {warehouse}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const snapshot = getStockSnapshot(
                      reservationModal.sku,
                      reservationWarehouse
                    );

                    return (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-[9px] uppercase tracking-wide text-slate-400">
                            On Hand
                          </p>
                          <p className="mt-1 text-lg font-bold text-slate-800">
                            {snapshot.onHand}
                          </p>
                        </div>

                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                          <p className="text-[9px] uppercase tracking-wide text-slate-400">
                            Reserved
                          </p>
                          <p className="mt-1 text-lg font-bold text-orange-600">
                            {snapshot.reserved}
                          </p>
                        </div>

                        <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                          <p className="text-[9px] uppercase tracking-wide text-emerald-600">
                            ATP
                          </p>
                          <p className="mt-1 text-lg font-bold text-emerald-700">
                            {snapshot.atp}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  <div>
                    <label className="mb-1.5 block text-[10px] font-semibold text-slate-600">
                      Quantity to Reserve
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={reservationQuantity}
                      onChange={(event) =>
                        setReservationQuantity(
                          Math.max(
                            1,
                            Number(event.target.value) || 1
                          )
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-400"
                    />
                  </div>
                </>
              )}

              {reservationMessage && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[10px] font-semibold text-amber-700">
                  {reservationMessage}
                </div>
              )}

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                <p className="text-[10px] font-semibold text-slate-700">
                  ATP protection
                </p>
                <p className="mt-1 text-[10px] leading-5 text-slate-500">
                  A reservation is allowed only when the requested quantity
                  does not exceed current ATP. Active reservations reduce ATP
                  and prevent the same units from being promised to another
                  order.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={closeReservation}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600"
              >
                Close
              </button>

              {!getOrderReservation(reservationModal) && (
                <button
                  type="button"
                  onClick={saveReservation}
                  className="rounded-lg bg-[#12213a] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1b3153]"
                >
                  Reserve Stock
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-5">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {selectedOrder.id}
                </h2>
                <p className="mt-1 text-[10px] text-slate-400">
                  Sales order and reservation details
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-lg text-slate-400"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-500">
                    Customer
                  </span>
                  <p className="mt-1 text-xs font-semibold text-slate-900">
                    {selectedOrder.customer}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-500">
                    Phone
                  </span>
                  <p className="mt-1 text-xs font-semibold text-slate-900">
                    {selectedOrder.phone}
                  </p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-[10px] text-slate-500">
                  Product
                </span>
                <p className="mt-1 text-xs font-semibold text-slate-900">
                  {selectedOrder.productName}
                </p>
                <p className="mt-1 font-mono text-[9px] text-slate-400">
                  {selectedOrder.sku}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-500">
                    Warehouse
                  </span>
                  <p className="mt-1 text-xs font-semibold text-slate-900">
                    {selectedOrder.warehouse}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-500">
                    Order Qty
                  </span>
                  <p className="mt-1 text-xs font-semibold text-slate-900">
                    {selectedOrder.orderedQty}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-3">
                  <span className="text-[10px] text-slate-500">
                    Reserved
                  </span>
                  <p className="mt-1 text-xs font-semibold text-blue-700">
                    {getOrderReservation(selectedOrder)?.quantity ?? 0}
                  </p>
                </div>
              </div>

              {(() => {
                const active = getOrderReservation(selectedOrder);
                const snapshot = getStockSnapshot(
                  selectedOrder.sku,
                  selectedOrder.warehouse
                );

                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-slate-100 bg-white p-3">
                      <span className="text-[9px] uppercase tracking-wide text-slate-400">
                        On Hand
                      </span>
                      <p className="mt-1 text-base font-bold text-slate-800">
                        {snapshot.onHand}
                      </p>
                    </div>

                    <div className="rounded-lg border border-orange-100 bg-orange-50 p-3">
                      <span className="text-[9px] uppercase tracking-wide text-orange-500">
                        Reserved
                      </span>
                      <p className="mt-1 text-base font-bold text-orange-600">
                        {snapshot.reserved}
                      </p>
                    </div>

                    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                      <span className="text-[9px] uppercase tracking-wide text-emerald-600">
                        ATP
                      </span>
                      <p className="mt-1 text-base font-bold text-emerald-700">
                        {snapshot.atp}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="flex justify-between rounded-lg bg-blue-50 p-4">
                <span className="text-xs font-semibold text-blue-700">
                  Total Amount
                </span>
                <span className="text-base font-bold text-blue-700">
                  {formatCurrency(selectedOrder.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Status</span>
                <StatusBadge status={selectedOrder.status} />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Stock Reservation
                </span>
                <ReservationBadge
                  status={
                    getOrderReservation(selectedOrder)
                      ? "Active"
                      : "None"
                  }
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600"
              >
                Close
              </button>

              {selectedOrder.status === "Draft" && (
                <button
                  type="button"
                  onClick={() => confirmOrder(selectedOrder)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Confirm &amp; Reserve
                </button>
              )}

              {selectedOrder.status === "Confirmed" && (
                <button
                  type="button"
                  onClick={() => processOrder(selectedOrder)}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Move to Processing
                </button>
              )}

              {selectedOrder.status === "Processing" && (
                <button
                  type="button"
                  onClick={() => completeOrder(selectedOrder)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Mark Completed
                </button>
              )}

              {selectedOrder.status !== "Completed" &&
                selectedOrder.status !== "Cancelled" && (
                  <>
                    <button
                      type="button"
                      onClick={() => openReservation(selectedOrder)}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700"
                    >
                      {getOrderReservation(selectedOrder)
                        ? "Manage Reservation"
                        : "Reserve Stock"}
                    </button>

                    {getOrderReservation(selectedOrder) && (
                      <button
                        type="button"
                        onClick={() =>
                          releaseReservation(selectedOrder)
                        }
                        className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600"
                      >
                        Release
                      </button>
                    )}
                  </>
                )}

              {selectedOrder.status !== "Completed" &&
                selectedOrder.status !== "Cancelled" && (
                  <button
                    type="button"
                    onClick={() => cancelOrder(selectedOrder)}
                    className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600"
                  >
                    Cancel Order
                  </button>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
