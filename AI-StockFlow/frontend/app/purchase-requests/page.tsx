"use client";

import { useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type RequestStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Rejected"
  | "Converted";

type RequestPriority = "High" | "Medium" | "Low";

type PurchaseRequest = {
  id: string;
  requestNumber: string;
  product: string;
  sku: string;
  quantity: number;
  estimatedValue: number;
  priority: RequestPriority;
  requester: string;
  department: string;
  warehouse: string;
  supplier: string;
  date: string;
  status: RequestStatus;
};

const initialRequests: PurchaseRequest[] = [
  {
    id: "1",
    requestNumber: "PR-2026-001",
    product: "Wireless Keyboard",
    sku: "KB-WL-001",
    quantity: 250,
    estimatedValue: 212500,
    priority: "High",
    requester: "Inventory Team",
    department: "Operations",
    warehouse: "Hyderabad Central",
    supplier: "Tech Supplies India",
    date: "2026-08-25",
    status: "Pending Approval",
  },
  {
    id: "2",
    requestNumber: "PR-2026-002",
    product: "USB Microphone",
    sku: "MIC-USB-002",
    quantity: 150,
    estimatedValue: 187500,
    priority: "High",
    requester: "Sales Team",
    department: "Sales",
    warehouse: "Bengaluru Warehouse",
    supplier: "Digital World",
    date: "2026-08-24",
    status: "Pending Approval",
  },
  {
    id: "3",
    requestNumber: "PR-2026-003",
    product: "24-inch Monitor",
    sku: "MON-24-004",
    quantity: 100,
    estimatedValue: 1420000,
    priority: "Medium",
    requester: "IT Department",
    department: "Information Technology",
    warehouse: "Hyderabad Central",
    supplier: "Office Mart",
    date: "2026-08-22",
    status: "Approved",
  },
  {
    id: "4",
    requestNumber: "PR-2026-004",
    product: "Office Chair",
    sku: "CHA-OFC-003",
    quantity: 80,
    estimatedValue: 416000,
    priority: "Medium",
    requester: "Administration",
    department: "HR & Admin",
    warehouse: "Chennai Warehouse",
    supplier: "Office Mart",
    date: "2026-08-20",
    status: "Draft",
  },
  {
    id: "5",
    requestNumber: "PR-2026-005",
    product: "Storage Bins",
    sku: "BIN-ST-005",
    quantity: 120,
    estimatedValue: 81600,
    priority: "Low",
    requester: "Warehouse Team",
    department: "Warehouse",
    warehouse: "Hyderabad Central",
    supplier: "Industrial Solutions",
    date: "2026-08-18",
    status: "Converted",
  },
  {
    id: "6",
    requestNumber: "PR-2026-006",
    product: "Barcode Scanner",
    sku: "SCAN-BAR-006",
    quantity: 25,
    estimatedValue: 87500,
    priority: "Low",
    requester: "Warehouse Team",
    department: "Warehouse",
    warehouse: "Bengaluru Warehouse",
    supplier: "Tech Supplies India",
    date: "2026-08-17",
    status: "Rejected",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function getStatusClass(status: RequestStatus) {
  switch (status) {
    case "Approved":
      return "bg-emerald-100 text-emerald-700";

    case "Pending Approval":
      return "bg-amber-100 text-amber-700";

    case "Converted":
      return "bg-blue-100 text-blue-700";

    case "Rejected":
      return "bg-red-100 text-red-700";

    case "Draft":
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getPriorityClass(priority: RequestPriority) {
  switch (priority) {
    case "High":
      return "bg-red-50 text-red-600";

    case "Medium":
      return "bg-amber-50 text-amber-700";

    case "Low":
    default:
      return "bg-blue-50 text-blue-700";
  }
}

export default function PurchaseRequestsPage() {
  const [requests, setRequests] =
    useState<PurchaseRequest[]>(initialRequests);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | RequestStatus>("All");

  const [showForm, setShowForm] = useState(false);

  const [selectedRequest, setSelectedRequest] =
    useState<PurchaseRequest | null>(null);

  const [newRequest, setNewRequest] = useState({
    product: "",
    sku: "",
    quantity: 1,
    estimatedValue: 0,
    priority: "Medium" as RequestPriority,
    requester: "",
    department: "",
    warehouse: "Hyderabad Central",
    supplier: "",
  });

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((item) => {
      const matchesSearch =
        !query ||
        item.requestNumber.toLowerCase().includes(query) ||
        item.product.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.requester.toLowerCase().includes(query) ||
        item.supplier.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const pendingCount = requests.filter(
    (item) => item.status === "Pending Approval"
  ).length;

  const approvedCount = requests.filter(
    (item) => item.status === "Approved"
  ).length;

  const convertedCount = requests.filter(
    (item) => item.status === "Converted"
  ).length;

  const rejectedCount = requests.filter(
    (item) => item.status === "Rejected"
  ).length;

  const draftCount = requests.filter(
    (item) => item.status === "Draft"
  ).length;

  const highPriorityCount = requests.filter(
    (item) =>
      item.priority === "High" &&
      item.status === "Pending Approval"
  ).length;

  const totalRequestedValue = requests.reduce(
    (total, item) => total + item.estimatedValue,
    0
  );

  const pendingValue = requests
    .filter((item) => item.status === "Pending Approval")
    .reduce(
      (total, item) => total + item.estimatedValue,
      0
    );

  const handleCreateRequest = () => {
    if (
      !newRequest.product.trim() ||
      !newRequest.sku.trim() ||
      !newRequest.requester.trim() ||
      !newRequest.department.trim() ||
      !newRequest.supplier.trim() ||
      newRequest.quantity <= 0
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const nextNumber = String(requests.length + 1).padStart(
      3,
      "0"
    );

    const createdRequest: PurchaseRequest = {
      id: Date.now().toString(),
      requestNumber: `PR-2026-${nextNumber}`,
      product: newRequest.product,
      sku: newRequest.sku,
      quantity: newRequest.quantity,
      estimatedValue: newRequest.estimatedValue,
      priority: newRequest.priority,
      requester: newRequest.requester,
      department: newRequest.department,
      warehouse: newRequest.warehouse,
      supplier: newRequest.supplier,
      date: new Date().toISOString().split("T")[0],
      status: "Draft",
    };

    setRequests((current) => [
      createdRequest,
      ...current,
    ]);

    setNewRequest({
      product: "",
      sku: "",
      quantity: 1,
      estimatedValue: 0,
      priority: "Medium",
      requester: "",
      department: "",
      warehouse: "Hyderabad Central",
      supplier: "",
    });

    setShowForm(false);
  };

  const handleSubmit = (id: string) => {
    setRequests((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Pending Approval",
            }
          : item
      )
    );
  };

  const handleApprove = (id: string) => {
    setRequests((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Approved",
            }
          : item
      )
    );

    setSelectedRequest(null);
  };

  const handleReject = (id: string) => {
    setRequests((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Rejected",
            }
          : item
      )
    );

    setSelectedRequest(null);
  };

  const handleConvert = (id: string) => {
  const request = requests.find(
    (item) => item.id === id
  );

  if (!request) {
    return;
  }

  // Get existing Purchase Orders
  const savedOrders = localStorage.getItem(
    "stockflow-purchase-orders"
  );

  let purchaseOrders: any[] = [];

  if (savedOrders) {
    try {
      const parsedOrders = JSON.parse(savedOrders);

      if (Array.isArray(parsedOrders)) {
        purchaseOrders = parsedOrders;
      }
    } catch {
      purchaseOrders = [];
    }
  }

  // Generate next PO number
  const existingNumbers = purchaseOrders
    .map((po) => {
      const match = String(po.number || "").match(
        /PO-\d{6}-(\d+)$/
      );

      return match
        ? Number(match[1])
        : 0;
    })
    .filter((number) => Number.isFinite(number));

  const nextNumber =
    existingNumbers.length > 0
      ? Math.max(...existingNumbers) + 1
      : 1;

  // Calculate estimated unit price
  const unitPrice =
    request.quantity > 0
      ? Math.round(
          request.estimatedValue /
            request.quantity
        )
      : 0;

  // Create Purchase Order from Purchase Request
  const createdPO = {
    id: Date.now().toString(),

    number: `PO-202608-${String(
      nextNumber
    ).padStart(5, "0")}`,

    supplier: request.supplier,

    supplierGST: "GSTIN-PENDING",

    warehouse: request.warehouse,

    requester: request.requester,

    orderDate:
      new Date().toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),

    expectedDate: "Not specified",

    paymentTerms: "30 days",

    status: "Draft",

    notes: `Created from purchase request ${request.requestNumber}.`,

    items: [
      {
        product: request.product,

        sku: request.sku,

        ordered: request.quantity,

        received: 0,

        unitPrice: unitPrice,

        total: request.estimatedValue,
      },
    ],
  };

  // Save the new PO
  const updatedPurchaseOrders = [
    createdPO,
    ...purchaseOrders,
  ];

  localStorage.setItem(
    "stockflow-purchase-orders",
    JSON.stringify(
      updatedPurchaseOrders
    )
  );

  // Mark Purchase Request as Converted
  setRequests((current) =>
    current.map((item) =>
      item.id === id
        ? {
            ...item,
            status: "Converted",
          }
        : item
    )
  );

  setSelectedRequest(null);

  alert(
    `Purchase Order ${createdPO.number} created successfully.`
  );
};

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-500">
                Procurement
              </p>

              <h1 className="mt-1 text-3xl font-bold text-gray-900">
                Purchase Requests
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Create, review and manage internal purchase requests.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRequests([...requests])}
                className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
              >
                Refresh
              </button>

              <button
                type="button"
                onClick={() => setShowForm(true)}
                className="rounded-lg bg-[#12213a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c3152]"
              >
                + Create Request
              </button>
            </div>
          </div>

          {/* FRONTEND NOTICE */}

          <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
            <p className="text-xs font-semibold text-blue-800">
              Purchase Requests
            </p>

            <p className="mt-1 text-[11px] text-blue-600">
              Frontend workflow is active. Request data is currently
              handled locally.
            </p>
          </div>

          {/* KPI CARDS */}

          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Total Requests
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {requests.length}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                All purchase requests
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Pending Approval
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-600">
                {pendingCount}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Require review
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Approved
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-600">
                {approvedCount}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Approved requests
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                Requested Value
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {formatCurrency(totalRequestedValue)}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Estimated request value
              </p>
            </div>

          </div>

                    {/* PURCHASE REQUEST QUEUE */}

          <div className="mb-6 rounded-xl border bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Purchase Request Queue
                </h2>

                <p className="mt-1 text-[11px] text-gray-500">
                  Review internal purchasing requirements before creating
                  purchase orders.
                </p>
              </div>

              <div className="flex gap-2">
                <span className="rounded-full bg-amber-50 px-3 py-1 text-[10px] font-semibold text-amber-700">
                  {pendingCount} Pending
                </span>

                <span className="rounded-full bg-red-50 px-3 py-1 text-[10px] font-semibold text-red-600">
                  {highPriorityCount} High Priority
                </span>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700">
                  {formatCurrency(pendingValue)}
                </span>
              </div>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-3">
              {requests
                .filter(
                  (item) =>
                    item.status === "Pending Approval"
                )
                .slice(0, 3)
                .map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-blue-700">
                          {item.requestNumber}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-gray-900">
                          {item.product}
                        </p>

                        <p className="mt-1 text-[10px] text-gray-500">
                          {item.quantity} units · {item.warehouse}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-2 py-1 text-[9px] font-semibold ${getPriorityClass(
                          item.priority
                        )}`}
                      >
                        {item.priority}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(item.estimatedValue)}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedRequest(item)
                        }
                        className="rounded-lg bg-[#12213a] px-3 py-1.5 text-[10px] font-semibold text-white hover:bg-[#1c3152]"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {pendingCount === 0 && (
              <div className="px-5 py-8 text-center text-xs text-gray-500">
                No purchase requests are currently pending approval.
              </div>
            )}
          </div>

          {/* MAIN REQUEST TABLE */}

          <div className="rounded-xl border bg-white shadow-sm">
            <div className="border-b px-5 py-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Purchase Requests
                  </h2>

                  <p className="mt-1 text-[11px] text-gray-500">
                    Review and manage internal purchase requirements.
                  </p>
                </div>

                <div className="w-full lg:w-72">
                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search request, product or requester..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

              </div>

              {/* STATUS FILTERS */}

              <div className="mt-4 flex flex-wrap gap-2">

                {(
                  [
                    "All",
                    "Draft",
                    "Pending Approval",
                    "Approved",
                    "Rejected",
                    "Converted",
                  ] as const
                ).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() =>
                      setStatusFilter(status)
                    }
                    className={`rounded-lg px-3 py-1.5 text-[10px] font-semibold transition ${
                      statusFilter === status
                        ? "bg-[#12213a] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status}
                  </button>
                ))}

              </div>
            </div>

            {/* TABLE */}

            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-left">

                <thead>
                  <tr className="border-b bg-gray-50">

                    <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                      Request
                    </th>

                    <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                      Product
                    </th>

                    <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                      Quantity
                    </th>

                    <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                      Value
                    </th>

                    <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                      Priority
                    </th>

                    <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                      Requester
                    </th>

                    <th className="px-4 py-3 text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-[9px] font-semibold uppercase tracking-wide text-gray-500">
                      Actions
                    </th>

                  </tr>
                </thead>

                <tbody className="divide-y">

                  {filteredRequests.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* REQUEST */}

                      <td className="px-5 py-4">
                        <div>
                          <p className="text-xs font-bold text-blue-700">
                            {item.requestNumber}
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            {item.date}
                          </p>
                        </div>
                      </td>

                      {/* PRODUCT */}

                      <td className="px-4 py-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-900">
                            {item.product}
                          </p>

                          <p className="mt-1 text-[9px] text-gray-400">
                            SKU: {item.sku}
                          </p>
                        </div>
                      </td>

                      {/* QUANTITY */}

                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                      </td>

                      {/* VALUE */}

                      <td className="px-4 py-4">
                        <span className="text-xs font-semibold text-gray-900">
                          {formatCurrency(item.estimatedValue)}
                        </span>
                      </td>

                      {/* PRIORITY */}

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold ${getPriorityClass(
                            item.priority
                          )}`}
                        >
                          {item.priority}
                        </span>
                      </td>

                      {/* REQUESTER */}

                      <td className="px-4 py-4">
                        <div>
                          <p className="text-[10px] font-semibold text-gray-800">
                            {item.requester}
                          </p>

                          <p className="mt-1 text-[9px] text-gray-400">
                            {item.department}
                          </p>
                        </div>
                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold ${getStatusClass(
                            item.status
                          )}`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedRequest(item)
                            }
                            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[9px] font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </button>

                          {item.status === "Draft" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleSubmit(item.id)
                              }
                              className="rounded-lg bg-blue-600 px-3 py-1.5 text-[9px] font-semibold text-white hover:bg-blue-700"
                            >
                              Submit
                            </button>
                          )}

                          {item.status === "Pending Approval" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleApprove(item.id)
                              }
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[9px] font-semibold text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>
                          )}

                          {item.status === "Approved" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleConvert(item.id)
                              }
                              className="rounded-lg bg-[#12213a] px-3 py-1.5 text-[9px] font-semibold text-white hover:bg-[#1c3152]"
                            >
                              Convert
                            </button>
                          )}

                        </div>
                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

              {filteredRequests.length === 0 && (
                <div className="px-5 py-16 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                    📦
                  </div>

                  <p className="mt-4 text-sm font-semibold text-gray-700">
                    No purchase requests found
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Try changing the search or status filter.
                  </p>
                </div>
              )}
            </div>

            {/* TABLE FOOTER */}

            <div className="flex flex-col gap-2 border-t bg-gray-50 px-5 py-3 text-[10px] text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredRequests.length} of{" "}
                {requests.length} purchase requests
              </span>

              <div className="flex gap-4">
                <span>
                  Draft: {draftCount}
                </span>

                <span>
                  Approved: {approvedCount}
                </span>

                <span>
                  Converted: {convertedCount}
                </span>

                <span>
                  Rejected: {rejectedCount}
                </span>
              </div>
            </div>
          </div>
                    {/* CREATE REQUEST MODAL */}

          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

                {/* MODAL HEADER */}

                <div className="flex items-center justify-between border-b px-6 py-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Create Purchase Request
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Create an internal request for purchasing.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                {/* FORM */}

                <div className="max-h-[70vh] overflow-y-auto p-6">

                  <div className="grid gap-4 md:grid-cols-2">

                    {/* PRODUCT */}

                    <div className="md:col-span-2">
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Product *
                      </label>

                      <input
                        type="text"
                        value={newRequest.product}
                        onChange={(event) =>
                          setNewRequest((current) => ({
                            ...current,
                            product: event.target.value,
                          }))
                        }
                        placeholder="Enter product name"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* SKU */}

                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        SKU *
                      </label>

                      <input
                        type="text"
                        value={newRequest.sku}
                        onChange={(event) =>
                          setNewRequest((current) => ({
                            ...current,
                            sku: event.target.value,
                          }))
                        }
                        placeholder="SKU-001"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* QUANTITY */}

                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Quantity *
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={newRequest.quantity}
                        onChange={(event) =>
                          setNewRequest((current) => ({
                            ...current,
                            quantity: Number(
                              event.target.value
                            ),
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* ESTIMATED VALUE */}

                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Estimated Value (₹)
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={newRequest.estimatedValue}
                        onChange={(event) =>
                          setNewRequest((current) => ({
                            ...current,
                            estimatedValue: Number(
                              event.target.value
                            ),
                          }))
                        }
                        placeholder="0"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* PRIORITY */}

                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Priority
                      </label>

                      <select
                        value={newRequest.priority}
                        onChange={(event) =>
                          setNewRequest((current) => ({
                            ...current,
                            priority:
                              event.target.value as RequestPriority,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="Low">
                          Low
                        </option>

                        <option value="Medium">
                          Medium
                        </option>

                        <option value="High">
                          High
                        </option>
                      </select>
                    </div>

                    {/* REQUESTER */}

                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Requester *
                      </label>

                      <input
                        type="text"
                        value={newRequest.requester}
                        onChange={(event) =>
                          setNewRequest((current) => ({
                            ...current,
                            requester: event.target.value,
                          }))
                        }
                        placeholder="Requester name/team"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* DEPARTMENT */}

                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Department *
                      </label>

                      <input
                        type="text"
                        value={newRequest.department}
                        onChange={(event) =>
                          setNewRequest((current) => ({
                            ...current,
                            department: event.target.value,
                          }))
                        }
                        placeholder="Operations"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* WAREHOUSE */}

                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Warehouse
                      </label>

                      <select
                        value={newRequest.warehouse}
                        onChange={(event) =>
                          setNewRequest((current) => ({
                            ...current,
                            warehouse: event.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      >
                        <option value="Hyderabad Central">
                          Hyderabad Central
                        </option>

                        <option value="Bengaluru Warehouse">
                          Bengaluru Warehouse
                        </option>

                        <option value="Chennai Warehouse">
                          Chennai Warehouse
                        </option>

                        <option value="Mumbai Warehouse">
                          Mumbai Warehouse
                        </option>
                      </select>
                    </div>

                    {/* SUPPLIER */}

                    <div>
                      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Preferred Supplier *
                      </label>

                      <input
                        type="text"
                        value={newRequest.supplier}
                        onChange={(event) =>
                          setNewRequest((current) => ({
                            ...current,
                            supplier: event.target.value,
                          }))
                        }
                        placeholder="Supplier name"
                        className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                  </div>

                  {/* SUMMARY */}

                  <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                          Request Summary
                        </p>

                        <p className="mt-1 text-xs text-blue-800">
                          New requests are created as Draft.
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wide text-blue-500">
                          Estimated Value
                        </p>

                        <p className="mt-1 text-lg font-bold text-blue-700">
                          {formatCurrency(
                            newRequest.estimatedValue
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* MODAL FOOTER */}

                <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-4">

                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleCreateRequest}
                    className="rounded-lg bg-[#12213a] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#1c3152]"
                  >
                    Create Request
                  </button>

                </div>

              </div>
            </div>
          )}

          {/* REQUEST DETAILS MODAL */}

          {selectedRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

              <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

                {/* HEADER */}

                <div className="flex items-start justify-between border-b px-6 py-5">

                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                      Purchase Request
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-gray-900">
                      {selectedRequest.requestNumber}
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Created on {selectedRequest.date}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRequest(null)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                  >
                    ×
                  </button>

                </div>

                {/* DETAILS */}

                <div className="p-6">

                  <div className="mb-5 flex items-center justify-between">

                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {selectedRequest.product}
                      </p>

                      <p className="mt-1 text-[10px] text-gray-400">
                        SKU: {selectedRequest.sku}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${getStatusClass(
                        selectedRequest.status
                      )}`}
                    >
                      {selectedRequest.status}
                    </span>

                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-[9px] uppercase tracking-wide text-gray-400">
                        Quantity
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-900">
                        {selectedRequest.quantity}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-[9px] uppercase tracking-wide text-gray-400">
                        Estimated Value
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-900">
                        {formatCurrency(
                          selectedRequest.estimatedValue
                        )}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-[9px] uppercase tracking-wide text-gray-400">
                        Priority
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-900">
                        {selectedRequest.priority}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-[9px] uppercase tracking-wide text-gray-400">
                        Warehouse
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-900">
                        {selectedRequest.warehouse}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-[9px] uppercase tracking-wide text-gray-400">
                        Requester
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-900">
                        {selectedRequest.requester}
                      </p>

                      <p className="mt-1 text-[10px] text-gray-400">
                        {selectedRequest.department}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-[9px] uppercase tracking-wide text-gray-400">
                        Supplier
                      </p>

                      <p className="mt-1 text-sm font-bold text-gray-900">
                        {selectedRequest.supplier}
                      </p>
                    </div>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap justify-end gap-2 border-t bg-gray-50 px-6 py-4">

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedRequest(null)
                    }
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>

                  {selectedRequest.status ===
                    "Draft" && (
                    <button
                      type="button"
                      onClick={() => {
                        handleSubmit(
                          selectedRequest.id
                        );
                        setSelectedRequest(null);
                      }}
                      className="rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700"
                    >
                      Submit for Approval
                    </button>
                  )}

                  {selectedRequest.status ===
                    "Pending Approval" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          handleReject(
                            selectedRequest.id
                          )
                        }
                        className="rounded-lg border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleApprove(
                            selectedRequest.id
                          )
                        }
                        className="rounded-lg bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
                      >
                        Approve
                      </button>
                    </>
                  )}

                  {selectedRequest.status ===
                    "Approved" && (
                    <button
                      type="button"
                      onClick={() =>
                        handleConvert(
                          selectedRequest.id
                        )
                      }
                      className="rounded-lg bg-[#12213a] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#1c3152]"
                    >
                      Convert to Purchase Order
                    </button>
                  )}

                </div>

              </div>

            </div>
          )}

        </div>
      </div>
    </PageLayout>
  );
}