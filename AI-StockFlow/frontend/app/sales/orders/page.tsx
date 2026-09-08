"use client";

import React, { useMemo, useState } from "react";

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
  },
];

const products = [
  {
    name: "Wireless Keyboard",
    price: 1200,
  },
  {
    name: "USB Microphone",
    price: 2400,
  },
  {
    name: "Gaming Mouse",
    price: 1500,
  },
  {
    name: "Bluetooth Speaker",
    price: 3200,
  },
  {
    name: "Hot Wheels Track Set",
    price: 4200,
  },
];

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

export default function SalesOrdersPage() {
  const [orders, setOrders] =
    useState<SalesOrder[]>(initialOrders);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showCreate, setShowCreate] = useState(false);
  const [selectedOrder, setSelectedOrder] =
    useState<SalesOrder | null>(null);

  const [showSuccess, setShowSuccess] = useState("");

  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [payment, setPayment] = useState("Pending");

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

    const amount = product.price * quantity;

    const newOrder: SalesOrder = {
      id: `SO-2026-${String(orders.length + 1).padStart(3, "0")}`,
      customer,
      phone: phone || "Not provided",
      date: "21 Aug 2026",
      items: quantity,
      amount,
      payment,
      status: "Draft",
    };

    setOrders((current) => [newOrder, ...current]);

    resetForm();
    setShowCreate(false);
    setShowSuccess("Sales order created successfully.");
  }

  function confirmOrder(order: SalesOrder) {
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? { ...item, status: "Confirmed" }
          : item
      )
    );

    setSelectedOrder(null);
    setShowSuccess(`${order.id} confirmed successfully.`);
  }

  function completeOrder(order: SalesOrder) {
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

    setSelectedOrder(null);
    setShowSuccess(`${order.id} marked as completed.`);
  }

  function cancelOrder(order: SalesOrder) {
    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? { ...item, status: "Cancelled" }
          : item
      )
    );

    setSelectedOrder(null);
    setShowSuccess(`${order.id} cancelled.`);
  }

  return (
    <div className="min-h-screen bg-slate-50 px-5 py-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Sales Orders
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Manage sales orders, order status, payments and
              customer fulfilment.
            </p>
          </div>

          <button
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
              onClick={() => setShowSuccess("")}
              className="font-semibold"
            >
              ×
            </button>
          </div>
        )}

        {/* KPI Cards */}
        <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
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

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-400">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {pendingCount}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Awaiting processing
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
              Showing {filteredOrders.length} of {orders.length}{" "}
              orders
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Order
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Customer
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Date
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Items
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Payment
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wider text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-slate-900">
                        {order.id}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        Sales order
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

                    <td className="px-4 py-4 text-xs text-slate-600">
                      {order.date}
                    </td>

                    <td className="px-4 py-4 text-xs text-slate-700">
                      {order.items}
                    </td>

                    <td className="px-4 py-4 text-xs font-bold text-slate-900">
                      {formatCurrency(order.amount)}
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </button>

                        {order.status === "Draft" && (
                          <button
                            onClick={() => confirmOrder(order)}
                            className="rounded-md bg-blue-600 px-2.5 py-1.5 text-[10px] font-semibold text-white"
                          >
                            Confirm
                          </button>
                        )}

                        {order.status === "Processing" && (
                          <button
                            onClick={() => completeOrder(order)}
                            className="rounded-md bg-emerald-600 px-2.5 py-1.5 text-[10px] font-semibold text-white"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
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

        {/* Bottom Summary */}
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  Create a new customer sales order.
                </p>
              </div>

              <button
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
                        key={product.name}
                        value={product.name}
                      >
                        {product.name} —{" "}
                        {formatCurrency(product.price)}
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
                  <div className="mt-3 flex justify-between rounded-lg bg-white px-3 py-3 text-xs">
                    <span className="text-slate-500">
                      Order amount
                    </span>

                    <span className="font-bold text-slate-900">
                      {formatCurrency(
                        (products.find(
                          (product) =>
                            product.name === selectedProduct
                        )?.price || 0) * quantity
                      )}
                    </span>
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
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>

              <button
                onClick={createOrder}
                className="rounded-lg bg-[#12213a] px-5 py-2 text-xs font-semibold text-white"
              >
                Create Sales Order
              </button>
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
                  Sales order details
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="text-lg text-slate-400"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 p-6">
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Customer
                </span>

                <span className="text-xs font-semibold text-slate-900">
                  {selectedOrder.customer}
                </span>
              </div>

              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Phone
                </span>

                <span className="text-xs font-semibold text-slate-900">
                  {selectedOrder.phone}
                </span>
              </div>

              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Order Date
                </span>

                <span className="text-xs font-semibold text-slate-900">
                  {selectedOrder.date}
                </span>
              </div>

              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Items
                </span>

                <span className="text-xs font-semibold text-slate-900">
                  {selectedOrder.items}
                </span>
              </div>

              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Payment
                </span>

                <span className="text-xs font-semibold text-slate-900">
                  {selectedOrder.payment}
                </span>
              </div>

              <div className="flex justify-between rounded-lg bg-blue-50 p-4">
                <span className="text-xs font-semibold text-blue-700">
                  Total Amount
                </span>

                <span className="text-base font-bold text-blue-700">
                  {formatCurrency(selectedOrder.amount)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Status
                </span>

                <StatusBadge status={selectedOrder.status} />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600"
              >
                Close
              </button>

              {selectedOrder.status === "Draft" && (
                <button
                  onClick={() => confirmOrder(selectedOrder)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Confirm Order
                </button>
              )}

              {selectedOrder.status === "Processing" && (
                <button
                  onClick={() => completeOrder(selectedOrder)}
                  className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Mark Completed
                </button>
              )}

              {selectedOrder.status !== "Completed" &&
                selectedOrder.status !== "Cancelled" && (
                  <button
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