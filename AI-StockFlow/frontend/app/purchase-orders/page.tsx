"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type PurchaseOrder = {
  id?: number | string;
  order_id?: number | string;
  order_number?: string;
  po_number?: string;

  supplier?: string;
  supplier_name?: string;

  status?: string;

  total?: number;
  total_value?: number;
  amount?: number;

  order_date?: string;
  created_at?: string;
  expected_date?: string;
  delivery_date?: string;
};

type PurchaseSummary = {
  total_orders?: number;
  draft_orders?: number;
  submitted_orders?: number;
  approved_orders?: number;
  received_orders?: number;
  cancelled_orders?: number;
  total_value?: number;
};

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [summary, setSummary] = useState<PurchaseSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedOrder, setSelectedOrder] =
    useState<PurchaseOrder | null>(null);

  const [showCreateModal, setShowCreateModal] = useState(false);

  // ------------------------------------------------------------
  // LOAD FRONTEND DEMO DATA
  // ------------------------------------------------------------

  useEffect(() => {
    loadPurchaseOrders();
  }, []);

  async function loadPurchaseOrders() {
    try {
      setLoading(true);
      setError("");

      // Frontend-only demo data.
      // Backend Purchase Order API is not connected here.

      const demoOrders: PurchaseOrder[] = [
        {
          id: 1,
          order_number: "PO-1001",
          supplier_name: "Tech Supplies India",
          status: "Approved",
          total_value: 125000,
          order_date: "2026-08-10",
          expected_date: "2026-08-20",
        },
        {
          id: 2,
          order_number: "PO-1002",
          supplier_name: "Global Electronics",
          status: "Pending",
          total_value: 87500,
          order_date: "2026-08-11",
          expected_date: "2026-08-23",
        },
        {
          id: 3,
          order_number: "PO-1003",
          supplier_name: "Smart Components Pvt Ltd",
          status: "Submitted",
          total_value: 156000,
          order_date: "2026-08-12",
          expected_date: "2026-08-25",
        },
        {
          id: 4,
          order_number: "PO-1004",
          supplier_name: "Digital World Traders",
          status: "Received",
          total_value: 98500,
          order_date: "2026-08-08",
          expected_date: "2026-08-15",
        },
        {
          id: 5,
          order_number: "PO-1005",
          supplier_name: "Prime Tech Solutions",
          status: "Approved",
          total_value: 142750,
          order_date: "2026-08-13",
          expected_date: "2026-08-28",
        },
        {
          id: 6,
          order_number: "PO-1006",
          supplier_name: "ABC Office Systems",
          status: "Draft",
          total_value: 54000,
          order_date: "2026-08-14",
          expected_date: "2026-08-30",
        },
      ];

      const demoSummary: PurchaseSummary = {
        total_orders: 6,
        draft_orders: 1,
        submitted_orders: 1,
        approved_orders: 2,
        received_orders: 1,
        cancelled_orders: 0,
        total_value: 663750,
      };

      setOrders(demoOrders);
      setSummary(demoSummary);
    } catch (err) {
      console.error("Purchase Orders error:", err);
      setError("Unable to load purchase orders.");
    } finally {
      setLoading(false);
    }
  }

  // ------------------------------------------------------------
  // HELPER FUNCTIONS
  // ------------------------------------------------------------

  const getOrderNumber = (order: PurchaseOrder) => {
    return (
      order.order_number ??
      order.po_number ??
      order.order_id ??
      order.id ??
      "-"
    );
  };

  const getSupplier = (order: PurchaseOrder) => {
    return order.supplier_name ?? order.supplier ?? "-";
  };

  const getAmount = (order: PurchaseOrder) => {
    return Number(
      order.total_value ??
        order.total ??
        order.amount ??
        0
    );
  };

  const getOrderDate = (order: PurchaseOrder) => {
    return order.order_date ?? order.created_at ?? "-";
  };

  const getExpectedDate = (order: PurchaseOrder) => {
    return order.expected_date ?? order.delivery_date ?? "-";
  };

  const getStatus = (order: PurchaseOrder) => {
    return order.status ?? "Pending";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (value: string) => {
    if (!value || value === "-") {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString("en-IN");
  };

  // ------------------------------------------------------------
  // SEARCH + FILTER
  // ------------------------------------------------------------

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderNumber = String(
        getOrderNumber(order)
      ).toLowerCase();

      const supplier = String(
        getSupplier(order)
      ).toLowerCase();

      const status = String(
        getStatus(order)
      ).toLowerCase();

      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        orderNumber.includes(searchValue) ||
        supplier.includes(searchValue) ||
        status.includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  // ------------------------------------------------------------
  // SUMMARY VALUES
  // ------------------------------------------------------------

  const totalOrders =
    summary?.total_orders ?? orders.length;

  const totalValue =
    summary?.total_value ??
    orders.reduce(
      (sum, order) => sum + getAmount(order),
      0
    );

  const approvedOrders =
    summary?.approved_orders ??
    orders.filter(
      (order) =>
        getStatus(order).toLowerCase() === "approved"
    ).length;

  const receivedOrders =
    summary?.received_orders ??
    orders.filter(
      (order) =>
        getStatus(order).toLowerCase() === "received"
    ).length;

  const pendingOrders = orders.filter((order) => {
    const status = getStatus(order).toLowerCase();

    return (
      status === "pending" ||
      status === "draft" ||
      status === "submitted"
    );
  }).length;

  // ------------------------------------------------------------
  // STATUS STYLES
  // ------------------------------------------------------------

  const statusClasses = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-50 text-green-700 border-green-200";

      case "received":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "submitted":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "draft":
        return "bg-gray-100 text-gray-700 border-gray-200";

      case "cancelled":
      case "canceled":
        return "bg-red-50 text-red-700 border-red-200";

      case "pending":
        return "bg-orange-50 text-orange-700 border-orange-200";

      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  return (
    <PageLayout>
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Purchase Orders
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage purchase orders, suppliers and procurement activity
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Create Purchase Order
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* SUMMARY CARDS */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          {/* TOTAL ORDERS */}

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Orders
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading ? "..." : totalOrders}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              All purchase orders
            </p>
          </div>

          {/* TOTAL VALUE */}

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Value
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {loading
                ? "..."
                : formatCurrency(totalValue)}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Purchase order value
            </p>
          </div>

          {/* APPROVED */}

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Approved
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {loading ? "..." : approvedOrders}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Approved orders
            </p>
          </div>

          {/* PENDING */}

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-600">
              {loading ? "..." : pendingOrders}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Awaiting action
            </p>
          </div>
        </div>

        {/* FILTER BAR */}

        <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">

            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search order number, supplier or status..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">
                All Status
              </option>

              <option value="Draft">
                Draft
              </option>

              <option value="Submitted">
                Submitted
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Received">
                Received
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Cancelled">
                Cancelled
              </option>
            </select>

            <button
              onClick={loadPurchaseOrders}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* PURCHASE ORDERS TABLE */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Purchase Orders
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Recent procurement activity
                </p>
              </div>

              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                Demo Data
              </span>

            </div>
          </div>

          {loading ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              <p className="text-sm text-gray-500">
                Loading purchase orders...
              </p>

            </div>
          ) : filteredOrders.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <div className="mb-3 text-4xl">
                📦
              </div>

              <h3 className="text-lg font-semibold text-gray-900">
                No purchase orders found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or status filter.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px] text-left">

                <thead className="border-b border-gray-200 bg-gray-50">

                  <tr>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order Number
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Supplier
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Order Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Expected
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredOrders.map((order, index) => {

                    const status = getStatus(order);

                    return (
                      <tr
                        key={
                          order.id ??
                          order.order_id ??
                          `${getOrderNumber(order)}-${index}`
                        }
                        className="transition hover:bg-gray-50"
                      >

                        <td className="px-6 py-4">

                          <button
                            onClick={() =>
                              setSelectedOrder(order)
                            }
                            className="font-semibold text-blue-600 hover:text-blue-800"
                          >
                            {getOrderNumber(order)}
                          </button>

                        </td>

                        <td className="px-6 py-4 text-sm text-gray-700">
                          {getSupplier(order)}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(
                            String(getOrderDate(order))
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(
                            String(getExpectedDate(order))
                          )}
                        </td>

                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(
                            getAmount(order)
                          )}
                        </td>

                        <td className="px-6 py-4">

                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClasses(
                              status
                            )}`}
                          >
                            {status}
                          </span>

                        </td>

                        <td className="px-6 py-4">

                          <button
                            onClick={() =>
                              setSelectedOrder(order)
                            }
                            className="text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

            </div>
          )}

          {/* TABLE FOOTER */}

          {!loading && filteredOrders.length > 0 && (
            <div className="border-t border-gray-200 px-6 py-4">

              <p className="text-sm text-gray-500">

                Showing{" "}

                <span className="font-medium text-gray-900">
                  {filteredOrders.length}
                </span>{" "}

                of{" "}

                <span className="font-medium text-gray-900">
                  {orders.length}
                </span>{" "}

                purchase orders

              </p>

            </div>
          )}

        </div>

        {/* ADDITIONAL SUMMARY */}

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-xl border border-gray-200 bg-white p-5">

            <p className="text-sm text-gray-500">
              Received Orders
            </p>

            <p className="mt-2 text-xl font-bold text-blue-600">
              {receivedOrders}
            </p>

          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">

            <p className="text-sm text-gray-500">
              Submitted Orders
            </p>

            <p className="mt-2 text-xl font-bold text-yellow-600">
              {summary?.submitted_orders ?? 0}
            </p>

          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">

            <p className="text-sm text-gray-500">
              Cancelled Orders
            </p>

            <p className="mt-2 text-xl font-bold text-red-600">
              {summary?.cancelled_orders ?? 0}
            </p>

          </div>

        </div>

      </div>

      {/* =====================================================
          VIEW ORDER MODAL
      ====================================================== */}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setSelectedOrder(null)}
        >

          <div
            className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Purchase Order
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {getOrderNumber(selectedOrder)}
                </p>

              </div>

              <button
                onClick={() =>
                  setSelectedOrder(null)
                }
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4">

              <div className="flex justify-between border-b pb-3">

                <span className="text-sm text-gray-500">
                  Order Number
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {getOrderNumber(selectedOrder)}
                </span>

              </div>

              <div className="flex justify-between border-b pb-3">

                <span className="text-sm text-gray-500">
                  Supplier
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {getSupplier(selectedOrder)}
                </span>

              </div>

              <div className="flex justify-between border-b pb-3">

                <span className="text-sm text-gray-500">
                  Order Date
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {formatDate(
                    String(
                      getOrderDate(selectedOrder)
                    )
                  )}
                </span>

              </div>

              <div className="flex justify-between border-b pb-3">

                <span className="text-sm text-gray-500">
                  Expected Date
                </span>

                <span className="text-sm font-semibold text-gray-900">
                  {formatDate(
                    String(
                      getExpectedDate(selectedOrder)
                    )
                  )}
                </span>

              </div>

              <div className="flex justify-between border-b pb-3">

                <span className="text-sm text-gray-500">
                  Total Amount
                </span>

                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(
                    getAmount(selectedOrder)
                  )}
                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-sm text-gray-500">
                  Status
                </span>

                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClasses(
                    getStatus(selectedOrder)
                  )}`}
                >
                  {getStatus(selectedOrder)}
                </span>

              </div>

            </div>

            <button
              onClick={() =>
                setSelectedOrder(null)
              }
              className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Close
            </button>

          </div>

        </div>
      )}

      {/* =====================================================
          CREATE PURCHASE ORDER MODAL
      ====================================================== */}

      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() =>
            setShowCreateModal(false)
          }
        >

          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="mb-5 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-gray-900">
                  Create Purchase Order
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Purchase order creation
                </p>

              </div>

              <button
                onClick={() =>
                  setShowCreateModal(false)
                }
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">

              <p className="text-sm font-medium text-blue-800">
                Purchase order creation UI
              </p>

              <p className="mt-1 text-sm text-blue-700">
                This page is currently using frontend demo
                data. The backend Purchase Order creation
                endpoint is not connected.
              </p>

            </div>

            <button
              onClick={() =>
                setShowCreateModal(false)
              }
              className="mt-6 w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </main>
    </PageLayout>
  );
}