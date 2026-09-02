"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";
import PageLayout from "../../components/layout/PageLayout";

/* =========================================================
   TYPES
========================================================= */

type POStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Sent"
  | "Partially Received"
  | "Received"
  | "Cancelled";

type PurchaseOrderItem = {
  product: string;
  sku: string;
  ordered: number;
  received: number;
  unitPrice: number;
  total: number;
};

type PurchaseOrder = {
  id: string;
  number: string;
  supplier: string;
  supplierGST: string;
  warehouse: string;
  requester: string;
  orderDate: string;
  expectedDate: string;
  paymentTerms: string;
  status: POStatus;
  notes: string;
  items: PurchaseOrderItem[];
};

type NewPOForm = {
  supplier: string;
  warehouse: string;
  requester: string;
  expectedDate: string;
  paymentTerms: string;
  notes: string;
  product: string;
  sku: string;
  quantity: number;
  unitPrice: number;
};

/* =========================================================
   DEMO PURCHASE ORDERS
========================================================= */

const initialPurchaseOrders: PurchaseOrder[] = [
  {
    id: "1",
    number: "PO-202608-00001",
    supplier: "Tech Supplies India",
    supplierGST: "36AABCT1234F1Z5",
    warehouse: "Hyderabad Central",
    requester: "Inventory Team",
    orderDate: "25 Aug 2026",
    expectedDate: "05 Sept 2026",
    paymentTerms: "30 days",
    status: "Approved",
    notes: "Created from approved purchase request PR-2026-001.",
    items: [
      {
        product: "Wireless Keyboard",
        sku: "KB-WL-001",
        ordered: 250,
        received: 0,
        unitPrice: 850,
        total: 212500,
      },
    ],
  },

  {
    id: "2",
    number: "PO-202608-00002",
    supplier: "Digital World",
    supplierGST: "29AABCD5678G1Z2",
    warehouse: "Bengaluru Warehouse",
    requester: "Sales Team",
    orderDate: "24 Aug 2026",
    expectedDate: "02 Sept 2026",
    paymentTerms: "30 days",
    status: "Sent",
    notes: "Purchase order sent to supplier.",
    items: [
      {
        product: "USB Microphone",
        sku: "MIC-USB-002",
        ordered: 150,
        received: 0,
        unitPrice: 1250,
        total: 187500,
      },
    ],
  },

  {
    id: "3",
    number: "PO-202608-00003",
    supplier: "Metro Electronics",
    supplierGST: "27AABCM9012H1Z8",
    warehouse: "Mumbai Distribution Hub",
    requester: "IT Department",
    orderDate: "22 Aug 2026",
    expectedDate: "12 Sept 2026",
    paymentTerms: "45 days",
    status: "Partially Received",
    notes: "Partial shipment received from supplier.",
    items: [
      {
        product: "24-inch Monitor",
        sku: "MON-24-004",
        ordered: 100,
        received: 40,
        unitPrice: 14200,
        total: 1420000,
      },
    ],
  },

  {
    id: "4",
    number: "PO-202608-00004",
    supplier: "Office Mart",
    supplierGST: "07AABCO3456J1Z1",
    warehouse: "Delhi Store Center",
    requester: "Administration",
    orderDate: "20 Aug 2026",
    expectedDate: "10 Sept 2026",
    paymentTerms: "30 days",
    status: "Draft",
    notes: "Draft purchase order awaiting approval.",
    items: [
      {
        product: "Office Chair",
        sku: "CHA-OFC-003",
        ordered: 80,
        received: 0,
        unitPrice: 5200,
        total: 416000,
      },
    ],
  },

  {
    id: "5",
    number: "PO-202608-00005",
    supplier: "Industrial Solutions",
    supplierGST: "33AABCI7890K1Z4",
    warehouse: "Pune Distribution Center",
    requester: "Warehouse Team",
    orderDate: "18 Aug 2026",
    expectedDate: "15 Sept 2026",
    paymentTerms: "30 days",
    status: "Received",
    notes: "All ordered quantities received.",
    items: [
      {
        product: "Storage Bins",
        sku: "BIN-ST-005",
        ordered: 120,
        received: 120,
        unitPrice: 680,
        total: 81600,
      },
    ],
  },

  {
    id: "6",
    number: "PO-202608-00006",
    supplier: "Retail Systems",
    supplierGST: "36AABCR4567L1Z8",
    warehouse: "Hyderabad Central",
    requester: "Warehouse Team",
    orderDate: "17 Aug 2026",
    expectedDate: "08 Sept 2026",
    paymentTerms: "30 days",
    status: "Cancelled",
    notes: "Order cancelled after budget review.",
    items: [
      {
        product: "Barcode Scanner",
        sku: "SCAN-BAR-006",
        ordered: 25,
        received: 0,
        unitPrice: 3500,
        total: 87500,
      },
    ],
  },
];

/* =========================================================
   HELPERS
========================================================= */

const statusTabs: Array<"All" | POStatus> = [
  "All",
  "Draft",
  "Pending Approval",
  "Approved",
  "Sent",
  "Partially Received",
  "Received",
  "Cancelled",
];

function money(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function getPOValue(po: PurchaseOrder) {
  return po.items.reduce((sum, item) => sum + item.total, 0);
}

function getStatusClass(status: POStatus) {
  switch (status) {
    case "Approved":
      return "bg-emerald-100 text-emerald-700";

    case "Sent":
      return "bg-blue-100 text-blue-700";

    case "Partially Received":
      return "bg-amber-100 text-amber-700";

    case "Received":
      return "bg-emerald-100 text-emerald-700";

    case "Cancelled":
      return "bg-red-100 text-red-700";

    case "Pending Approval":
      return "bg-orange-100 text-orange-700";

    case "Draft":
    default:
      return "bg-slate-100 text-slate-600";
  }
}

/* =========================================================
   PAGE
========================================================= */

export default function PurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(
    initialPurchaseOrders
  );

  const [search, setSearch] = useState("");

  const [activeStatus, setActiveStatus] =
    useState<"All" | POStatus>("All");

  const [selectedPO, setSelectedPO] =
    useState<PurchaseOrder | null>(null);

  const [showCreatePO, setShowCreatePO] = useState(false);

  const [newPO, setNewPO] = useState<NewPOForm>({
    supplier: "",
    warehouse: "Hyderabad Central",
    requester: "",
    expectedDate: "",
    paymentTerms: "30 days",
    notes: "",
    product: "",
    sku: "",
    quantity: 1,
    unitPrice: 0,
  });

  useEffect(() => {
  const savedOrders = localStorage.getItem(
    "stockflow-purchase-orders"
  );

  if (!savedOrders) {
    return;
  }

  try {
    const parsedOrders =
      JSON.parse(savedOrders);

    if (Array.isArray(parsedOrders)) {
      setPurchaseOrders(parsedOrders);
    }
  } catch {
    localStorage.removeItem(
      "stockflow-purchase-orders"
    );
  }
}, []);

useEffect(() => {
  localStorage.setItem(
    "stockflow-purchase-orders",
    JSON.stringify(purchaseOrders)
  );
}, [purchaseOrders]);

  /* =========================================================
     FILTERING
  ========================================================= */

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return purchaseOrders.filter((po) => {
      const matchesSearch =
        !query ||
        po.number.toLowerCase().includes(query) ||
        po.supplier.toLowerCase().includes(query) ||
        po.warehouse.toLowerCase().includes(query) ||
        po.requester.toLowerCase().includes(query) ||
        po.items.some(
          (item) =>
            item.product.toLowerCase().includes(query) ||
            item.sku.toLowerCase().includes(query)
        );

      const matchesStatus =
        activeStatus === "All" || po.status === activeStatus;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, search, activeStatus]);

  /* =========================================================
     KPI VALUES
  ========================================================= */

  const totalOrders = purchaseOrders.length;

  const pendingApproval = purchaseOrders.filter(
    (po) => po.status === "Pending Approval"
  ).length;

  const approvedOrSent = purchaseOrders.filter(
    (po) =>
      po.status === "Approved" ||
      po.status === "Sent"
  ).length;

  const totalValue = purchaseOrders
    .filter((po) => po.status !== "Cancelled")
    .reduce((sum, po) => sum + getPOValue(po), 0);

  const draftCount = purchaseOrders.filter(
    (po) => po.status === "Draft"
  ).length;

  const partiallyReceivedCount = purchaseOrders.filter(
    (po) => po.status === "Partially Received"
  ).length;

  const receivedCount = purchaseOrders.filter(
    (po) => po.status === "Received"
  ).length;

  const cancelledCount = purchaseOrders.filter(
    (po) => po.status === "Cancelled"
  ).length;

  const outstandingValue = purchaseOrders
    .filter(
      (po) =>
        po.status !== "Received" &&
        po.status !== "Cancelled"
    )
    .reduce((sum, po) => sum + getPOValue(po), 0);

  /* =========================================================
     ACTIONS
  ========================================================= */

  const handleSendPO = (id: string) => {
    setPurchaseOrders((current) =>
      current.map((po) =>
        po.id === id
          ? {
              ...po,
              status: "Sent",
            }
          : po
      )
    );

    setSelectedPO((current) =>
      current?.id === id
        ? {
            ...current,
            status: "Sent",
          }
        : current
    );
  };

  const handleApprovePO = (id: string) => {
    setPurchaseOrders((current) =>
      current.map((po) =>
        po.id === id
          ? {
              ...po,
              status: "Approved",
            }
          : po
      )
    );

    setSelectedPO((current) =>
      current?.id === id
        ? {
            ...current,
            status: "Approved",
          }
        : current
    );
  };

  const handleCancelPO = (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this purchase order?"
    );

    if (!confirmed) {
      return;
    }

    setPurchaseOrders((current) =>
      current.map((po) =>
        po.id === id
          ? {
              ...po,
              status: "Cancelled",
            }
          : po
      )
    );

    setSelectedPO((current) =>
      current?.id === id
        ? {
            ...current,
            status: "Cancelled",
          }
        : current
    );
  };

  const resetNewPO = () => {
    setNewPO({
      supplier: "",
      warehouse: "Hyderabad Central",
      requester: "",
      expectedDate: "",
      paymentTerms: "30 days",
      notes: "",
      product: "",
      sku: "",
      quantity: 1,
      unitPrice: 0,
    });
  };

  const handleCreatePO = () => {
    if (
      !newPO.supplier.trim() ||
      !newPO.requester.trim() ||
      !newPO.expectedDate ||
      !newPO.product.trim() ||
      !newPO.sku.trim() ||
      newPO.quantity <= 0 ||
      newPO.unitPrice <= 0
    ) {
      window.alert(
        "Please fill all required fields."
      );
      return;
    }

    const nextNumber =
      purchaseOrders.length + 1;

    const newPurchaseOrder: PurchaseOrder = {
      id: Date.now().toString(),

      number: `PO-202608-${String(
        nextNumber
      ).padStart(5, "0")}`,

      supplier: newPO.supplier,

      supplierGST: "GSTIN-PENDING",

      warehouse: newPO.warehouse,

      requester: newPO.requester,

      orderDate:
        new Date().toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        ),

      expectedDate:
        new Date(
          `${newPO.expectedDate}T00:00:00`
        ).toLocaleDateString(
          "en-GB",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        ),

      paymentTerms: newPO.paymentTerms,

      status: "Draft",

      notes:
        newPO.notes ||
        "Purchase order created manually.",

      items: [
        {
          product: newPO.product,

          sku: newPO.sku,

          ordered: newPO.quantity,

          received: 0,

          unitPrice: newPO.unitPrice,

          total:
            newPO.quantity *
            newPO.unitPrice,
        },
      ],
    };

    setPurchaseOrders((current) => [
      newPurchaseOrder,
      ...current,
    ]);

    setShowCreatePO(false);

    resetNewPO();
  };

    /* =========================================================
     CREATE PO TOTAL
  ========================================================= */

  const newPOTotal =
    Number(newPO.quantity || 0) *
    Number(newPO.unitPrice || 0);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#f5f7fa] px-5 py-6">
        <div className="mx-auto max-w-7xl">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-6 flex items-start justify-between">

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Purchase Orders
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage purchase orders, approvals, supplier
                communication and receipts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreatePO(true)}
              className="rounded-md bg-[#12213a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1b3152]"
            >
              + New Purchase Order
            </button>

          </div>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">

            {/* Total Orders */}

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Total Orders
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {totalOrders}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                All purchase orders
              </p>

            </div>

            {/* Pending Approval */}

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Pending Approval
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-500">
                {pendingApproval}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Require approval
              </p>

            </div>

            {/* Approved / Sent */}

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Approved / Sent
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {approvedOrSent}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Ready or sent to supplier
              </p>

            </div>

            {/* Total Value */}

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Total Value
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {money(totalValue)}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Active order value
              </p>

            </div>

          </div>

          {/* =================================================
              SEARCH + STATUS FILTERS
          ================================================= */}

          <div className="mb-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search PO, supplier, product, SKU..."
                className="min-w-0 flex-1 rounded-md border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              />

              <div className="flex flex-wrap gap-2">

                {statusTabs.map((status) => {

                  const isActive =
                    activeStatus === status;

                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() =>
                        setActiveStatus(status)
                      }
                      className={`rounded-md border px-3 py-2 text-xs font-semibold transition ${
                        isActive
                          ? "border-[#12213a] bg-[#12213a] text-white"
                          : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}

              </div>

            </div>

          </div>

          {/* =================================================
              SUMMARY LINE
          ================================================= */}

          <div className="mb-5 flex flex-wrap items-center gap-4 px-1 text-xs text-slate-500">

            <span>
              Draft:{" "}
              <strong className="text-slate-700">
                {draftCount}
              </strong>
            </span>

            <span>
              Partially Received:{" "}
              <strong className="text-slate-700">
                {partiallyReceivedCount}
              </strong>
            </span>

            <span>
              Received:{" "}
              <strong className="text-slate-700">
                {receivedCount}
              </strong>
            </span>

            <span>
              Cancelled:{" "}
              <strong className="text-slate-700">
                {cancelledCount}
              </strong>
            </span>

            <span>
              Outstanding Value:{" "}
              <strong className="text-slate-700">
                {money(outstandingValue)}
              </strong>
            </span>

          </div>

          {/* =================================================
              PURCHASE ORDER TABLE
          ================================================= */}

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">

            {/* Table Header */}

            <div className="border-b border-slate-200 px-5 py-4">

              <h2 className="text-base font-bold text-slate-900">
                Purchase Orders
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Showing{" "}
                {filteredOrders.length} of{" "}
                {purchaseOrders.length} purchase orders
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[1100px] text-left">

                <thead>

                  <tr className="border-b border-slate-200 bg-slate-50">

                    <th className="px-5 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      PO Number
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Supplier
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Order Date
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Expected
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Items
                    </th>

                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Value
                    </th>

                    <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredOrders.map((po) => {

                    const orderValue =
                      getPOValue(po);

                    const totalItems =
                      po.items.reduce(
                        (sum, item) =>
                          sum + item.ordered,
                        0
                      );

                    return (
                      <tr
                        key={po.id}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >

                        {/* PO Number */}

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPO(po)
                            }
                            className="text-sm font-semibold text-blue-700 hover:text-blue-900 hover:underline"
                          >
                            {po.number}
                          </button>

                          <div className="mt-1 text-[10px] text-slate-400">
                            {po.warehouse}
                          </div>

                        </td>

                        {/* Supplier */}

                        <td className="px-4 py-4">

                          <div className="text-sm font-semibold text-slate-800">
                            {po.supplier}
                          </div>

                          <div className="mt-1 text-[10px] text-slate-400">
                            {po.supplierGST}
                          </div>

                        </td>

                        {/* Order Date */}

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {po.orderDate}
                        </td>

                        {/* Expected Date */}

                        <td className="px-4 py-4 text-sm text-slate-600">
                          {po.expectedDate}
                        </td>

                        {/* Items */}

                        <td className="px-4 py-4">

                          <div className="text-sm font-semibold text-slate-700">
                            {po.items.length}
                          </div>

                          <div className="mt-1 text-[10px] text-slate-400">
                            {totalItems} units
                          </div>

                        </td>

                        {/* Value */}

                        <td className="px-4 py-4 text-right text-sm font-semibold text-slate-800">
                          {money(orderValue)}
                        </td>

                        {/* Status */}

                        <td className="px-4 py-4">

                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                              po.status
                            )}`}
                          >
                            {po.status}
                          </span>

                        </td>

                        {/* Actions */}

                        <td className="px-5 py-4">

                          <div className="flex justify-end gap-2">

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPO(po)
                              }
                              className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              View
                            </button>

                            {po.status === "Approved" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleSendPO(po.id)
                                }
                                className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                              >
                                Send
                              </button>
                            )}

                            {po.status === "Pending Approval" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleApprovePO(
                                    po.id
                                  )
                                }
                                className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                            )}

                          </div>

                        </td>

                      </tr>
                    );
                  })}

                  {/* Empty State */}

                  {filteredOrders.length === 0 && (
                    <tr>

                      <td
                        colSpan={8}
                        className="px-5 py-14 text-center"
                      >

                        <p className="text-sm font-semibold text-slate-700">
                          No purchase orders found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try changing your search or
                          status filter.
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setActiveStatus("All");
                          }}
                          className="mt-4 rounded-md border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Clear Filters
                        </button>

                      </td>

                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </div>

        </div>
      </div>

            {/* =====================================================
          PURCHASE ORDER DETAIL MODAL
      ===================================================== */}

      {selectedPO && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedPO(null)}
        >
          <div
            className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            {/* Modal Header */}

            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                  Purchase Order
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {selectedPO.number}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPO(null)}
                className="text-xl text-slate-400 hover:text-slate-700"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {/* PO Information */}

            <div className="grid grid-cols-1 gap-5 border-b border-slate-200 px-6 py-5 md:grid-cols-3">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Supplier
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedPO.supplier}
                </p>

                <p className="mt-1 text-[10px] text-slate-400">
                  {selectedPO.supplierGST}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Order Date
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedPO.orderDate}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Expected Date
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedPO.expectedDate}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Warehouse
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedPO.warehouse}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Requester
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedPO.requester}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Payment Terms
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedPO.paymentTerms}
                </p>
              </div>

              <div className="md:col-span-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </p>

                <span
                  className={`mt-2 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold ${getStatusClass(
                    selectedPO.status
                  )}`}
                >
                  {selectedPO.status}
                </span>
              </div>

            </div>

            {/* Order Items */}

            <div className="px-6 py-5">

              <h3 className="mb-3 text-sm font-bold text-slate-900">
                Order Items
              </h3>

              <div className="overflow-hidden rounded-lg border border-slate-200">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[700px] text-left">

                    <thead>

                      <tr className="border-b border-slate-200 bg-slate-50">

                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Product
                        </th>

                        <th className="px-4 py-3 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          SKU
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Ordered
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Received
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Unit Price
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Total
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {selectedPO.items.map((item, index) => (
                        <tr
                          key={`${selectedPO.id}-${index}`}
                          className="border-b border-slate-100 last:border-b-0"
                        >

                          <td className="px-4 py-4">

                            <div className="text-sm font-semibold text-slate-800">
                              {item.product}
                            </div>

                          </td>

                          <td className="px-4 py-4 text-sm text-slate-500">
                            {item.sku}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-700">
                            {item.ordered}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-600">
                            {item.received}
                          </td>

                          <td className="px-4 py-4 text-right text-sm text-slate-600">
                            {money(item.unitPrice)}
                          </td>

                          <td className="px-4 py-4 text-right text-sm font-semibold text-slate-800">
                            {money(item.total)}
                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* Total */}

              <div className="mt-4 flex justify-end">

                <div className="rounded-lg bg-slate-50 px-5 py-3 text-right">

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Order Total
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {money(getPOValue(selectedPO))}
                  </p>

                </div>

              </div>

              {/* Notes */}

              {selectedPO.notes && (
                <div className="mt-4 rounded-lg bg-slate-50 p-4">

                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Notes
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {selectedPO.notes}
                  </p>

                </div>
              )}

            </div>

            {/* Modal Actions */}

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">

              {/* Approve */}

              {selectedPO.status === "Pending Approval" && (
                <button
                  type="button"
                  onClick={() =>
                    handleApprovePO(selectedPO.id)
                  }
                  className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Approve PO
                </button>
              )}

              {/* Send */}

              {(selectedPO.status === "Approved" ||
                selectedPO.status === "Pending Approval") && (
                <button
                  type="button"
                  onClick={() =>
                    handleSendPO(selectedPO.id)
                  }
                  className="rounded-md bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  Send to Supplier
                </button>
              )}

              {/* Receive */}

              {(selectedPO.status === "Sent" ||
                selectedPO.status === "Partially Received") && (
                <button
                  type="button"
                  onClick={() => {
                    setPurchaseOrders((current) =>
                      current.map((po) => {

                        if (po.id !== selectedPO.id) {
                          return po;
                        }

                        const updatedItems =
                          po.items.map((item) => ({
                            ...item,
                            received:
                              item.ordered,
                          }));

                        return {
                          ...po,
                          status: "Received",
                          items: updatedItems,
                        };
                      })
                    );

                    setSelectedPO((current) => {

                      if (!current) {
                        return current;
                      }

                      return {
                        ...current,
                        status: "Received",
                        items: current.items.map(
                          (item) => ({
                            ...item,
                            received:
                              item.ordered,
                          })
                        ),
                      };
                    });
                  }}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Receive Goods
                </button>
              )}

              {/* Cancel */}

              {selectedPO.status !== "Received" &&
                selectedPO.status !== "Cancelled" && (
                  <button
                    type="button"
                    onClick={() =>
                      handleCancelPO(
                        selectedPO.id
                      )
                    }
                    className="rounded-md border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Cancel
                  </button>
                )}

              {/* Print */}

              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Print PO
              </button>

              {/* Close */}

              <button
                type="button"
                onClick={() =>
                  setSelectedPO(null)
                }
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}

            {/* =====================================================
          CREATE PURCHASE ORDER MODAL
      ===================================================== */}

      {showCreatePO && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowCreatePO(false)}
        >
          <div
            className="w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >

            {/* Modal Header */}

            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                  Procurement
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  Create Purchase Order
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Create a new purchase order for a supplier.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowCreatePO(false);
                  resetNewPO();
                }}
                className="text-xl text-slate-400 hover:text-slate-700"
                aria-label="Close"
              >
                ×
              </button>

            </div>

            {/* Form */}

            <div className="max-h-[70vh] overflow-y-auto px-6 py-5">

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* Supplier */}

                <div className="md:col-span-2">

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Supplier *
                  </label>

                  <input
                    type="text"
                    value={newPO.supplier}
                    onChange={(event) =>
                      setNewPO((current) => ({
                        ...current,
                        supplier:
                          event.target.value,
                      }))
                    }
                    placeholder="Supplier name"
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                {/* Warehouse */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Warehouse *
                  </label>

                  <select
                    value={newPO.warehouse}
                    onChange={(event) =>
                      setNewPO((current) => ({
                        ...current,
                        warehouse:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >

                    <option>
                      Hyderabad Central
                    </option>

                    <option>
                      Bengaluru Warehouse
                    </option>

                    <option>
                      Mumbai Distribution Hub
                    </option>

                    <option>
                      Delhi Store Center
                    </option>

                    <option>
                      Pune Distribution Center
                    </option>

                    <option>
                      Chennai Warehouse
                    </option>

                  </select>

                </div>

                {/* Requester */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Requester *
                  </label>

                  <input
                    type="text"
                    value={newPO.requester}
                    onChange={(event) =>
                      setNewPO((current) => ({
                        ...current,
                        requester:
                          event.target.value,
                      }))
                    }
                    placeholder="Requester / department"
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                {/* Expected Date */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Expected Date *
                  </label>

                  <input
                    type="date"
                    value={newPO.expectedDate}
                    onChange={(event) =>
                      setNewPO((current) => ({
                        ...current,
                        expectedDate:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                {/* Payment Terms */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Payment Terms
                  </label>

                  <select
                    value={newPO.paymentTerms}
                    onChange={(event) =>
                      setNewPO((current) => ({
                        ...current,
                        paymentTerms:
                          event.target.value,
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >

                    <option>
                      15 days
                    </option>

                    <option>
                      30 days
                    </option>

                    <option>
                      45 days
                    </option>

                    <option>
                      60 days
                    </option>

                    <option>
                      Advance Payment
                    </option>

                  </select>

                </div>

                {/* Product */}

                <div className="md:col-span-2">

                  <div className="mb-3 border-t border-slate-200 pt-5">

                    <h3 className="text-sm font-bold text-slate-900">
                      Order Item
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Add the product and quantity for this purchase order.
                    </p>

                  </div>

                </div>

                {/* Product Name */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Product *
                  </label>

                  <input
                    type="text"
                    value={newPO.product}
                    onChange={(event) =>
                      setNewPO((current) => ({
                        ...current,
                        product:
                          event.target.value,
                      }))
                    }
                    placeholder="Product name"
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                {/* SKU */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    SKU *
                  </label>

                  <input
                    type="text"
                    value={newPO.sku}
                    onChange={(event) =>
                      setNewPO((current) => ({
                        ...current,
                        sku:
                          event.target.value,
                      }))
                    }
                    placeholder="SKU-001"
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                {/* Quantity */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={newPO.quantity}
                    onChange={(event) =>
                      setNewPO((current) => ({
                        ...current,
                        quantity:
                          Number(
                            event.target.value
                          ),
                      }))
                    }
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                {/* Unit Price */}

                <div>

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Unit Price (₹) *
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={newPO.unitPrice}
                    onChange={(event) =>
                      setNewPO((current) => ({
                        ...current,
                        unitPrice:
                          Number(
                            event.target.value
                          ),
                      }))
                    }
                    placeholder="0"
                    className="w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                </div>

                {/* Notes */}

                <div className="md:col-span-2">

                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    Notes
                  </label>

                  <textarea
                    value={newPO.notes}
                    onChange={(event) =>
                      setNewPO((current) => ({
                        ...current,
                        notes:
                          event.target.value,
                      }))
                    }
                    placeholder="Additional notes..."
                    rows={3}
                    className="w-full resize-none rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />

                </div>

              </div>

              {/* Order Summary */}

              <div className="mt-5 rounded-lg border border-blue-100 bg-blue-50 p-4">

                <div className="flex items-center justify-between">

                  <div>

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                      Order Summary
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      {newPO.quantity || 0} units ×{" "}
                      {money(
                        newPO.unitPrice || 0
                      )}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-600">
                      Estimated Value
                    </p>

                    <p className="mt-1 text-lg font-bold text-blue-700">
                      {money(newPOTotal)}
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* Modal Footer */}

            <div className="flex justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">

              <button
                type="button"
                onClick={() => {
                  setShowCreatePO(false);
                  resetNewPO();
                }}
                className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreatePO}
                className="rounded-md bg-[#12213a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1b3152]"
              >
                Create Purchase Order
              </button>

            </div>

          </div>
        </div>
           )}

      {/* =====================================================
          END PAGE
      ===================================================== */}

    </PageLayout>
  );
}