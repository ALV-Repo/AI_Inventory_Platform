"use client";

import { useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type RequestStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Rejected";

type PurchaseRequest = {
  id: string;
  requestNumber: string;
  requestedBy: string;
  department: string;
  supplier: string;
  item: string;
  quantity: number;
  estimatedAmount: number;
  date: string;
  status: RequestStatus;
  priority: "Low" | "Medium" | "High";
};

const initialRequests: PurchaseRequest[] = [
  {
    id: "1",
    requestNumber: "PR-2026-001",
    requestedBy: "Rahul Kumar",
    department: "Inventory",
    supplier: "Tech Supplies India",
    item: "Wireless Keyboard",
    quantity: 20,
    estimatedAmount: 24000,
    date: "2026-08-21",
    status: "Pending Approval",
    priority: "High",
  },
  {
    id: "2",
    requestNumber: "PR-2026-002",
    requestedBy: "Priya Sharma",
    department: "IT",
    supplier: "Digital World",
    item: "USB Microphone",
    quantity: 10,
    estimatedAmount: 24000,
    date: "2026-08-20",
    status: "Pending Approval",
    priority: "Medium",
  },
  {
    id: "3",
    requestNumber: "PR-2026-003",
    requestedBy: "Arjun Rao",
    department: "Sales",
    supplier: "Office Mart",
    item: "Office Chairs",
    quantity: 8,
    estimatedAmount: 32000,
    date: "2026-08-19",
    status: "Approved",
    priority: "Low",
  },
  {
    id: "4",
    requestNumber: "PR-2026-004",
    requestedBy: "Sneha Reddy",
    department: "Warehouse",
    supplier: "Industrial Solutions",
    item: "Storage Bins",
    quantity: 50,
    estimatedAmount: 18500,
    date: "2026-08-18",
    status: "Draft",
    priority: "Medium",
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

    case "Rejected":
      return "bg-red-100 text-red-700";

    case "Draft":
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getPriorityClass(priority: PurchaseRequest["priority"]) {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-700";

    case "Medium":
      return "bg-amber-100 text-amber-700";

    default:
      return "bg-emerald-100 text-emerald-700";
  }
}

export default function PurchaseRequestsPage() {
  const [requests, setRequests] =
    useState<PurchaseRequest[]>(initialRequests);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All" | RequestStatus>("All");

  const [showForm, setShowForm] = useState(false);

  const [newRequest, setNewRequest] = useState({
    requestedBy: "",
    department: "Inventory",
    supplier: "",
    item: "",
    quantity: 1,
    estimatedAmount: 0,
    priority: "Medium" as PurchaseRequest["priority"],
  });

  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        request.requestNumber
          .toLowerCase()
          .includes(searchText) ||
        request.requestedBy
          .toLowerCase()
          .includes(searchText) ||
        request.supplier
          .toLowerCase()
          .includes(searchText) ||
        request.item
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const pendingCount = requests.filter(
    (request) => request.status === "Pending Approval"
  ).length;

  const approvedCount = requests.filter(
    (request) => request.status === "Approved"
  ).length;

  const draftCount = requests.filter(
    (request) => request.status === "Draft"
  ).length;

  const totalValue = requests.reduce(
    (total, request) =>
      total + request.estimatedAmount,
    0
  );

  const handleCreateRequest = () => {
    if (
      !newRequest.requestedBy ||
      !newRequest.supplier ||
      !newRequest.item ||
      newRequest.quantity <= 0
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const nextNumber =
      String(requests.length + 1).padStart(3, "0");

    const request: PurchaseRequest = {
      id: Date.now().toString(),
      requestNumber: `PR-2026-${nextNumber}`,
      requestedBy: newRequest.requestedBy,
      department: newRequest.department,
      supplier: newRequest.supplier,
      item: newRequest.item,
      quantity: newRequest.quantity,
      estimatedAmount: newRequest.estimatedAmount,
      date: new Date().toISOString().split("T")[0],
      status: "Draft",
      priority: newRequest.priority,
    };

    setRequests((current) => [request, ...current]);

    setNewRequest({
      requestedBy: "",
      department: "Inventory",
      supplier: "",
      item: "",
      quantity: 1,
      estimatedAmount: 0,
      priority: "Medium",
    });

    setShowForm(false);
  };

  const handleSubmitForApproval = (id: string) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "Pending Approval",
            }
          : request
      )
    );
  };

  const handleApprove = (id: string) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "Approved",
            }
          : request
      )
    );
  };

  const handleReject = (id: string) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? {
              ...request,
              status: "Rejected",
            }
          : request
      )
    );
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Purchase Requests
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Create purchase requests and manage approval workflow
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="rounded-lg bg-[#12213a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1c3152]"
            >
              + New Purchase Request
            </button>
          </div>

          {/* SUMMARY */}

          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
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
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Pending Approval
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-600">
                {pendingCount}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Waiting for approval
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
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
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Estimated Value
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-600">
                {formatCurrency(totalValue)}
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Combined request value
              </p>
            </div>

          </div>

          {/* APPROVAL INBOX */}

          <div className="mb-6 rounded-xl border bg-white shadow-sm">

            <div className="border-b px-6 py-4">
              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Approval Inbox
                  </h2>

                  <p className="text-sm text-gray-500">
                    Review and approve purchase requests
                  </p>
                </div>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                  {pendingCount} Pending
                </span>

              </div>
            </div>

            <div className="p-6">

              {pendingCount === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
                  <p className="font-medium text-gray-700">
                    No requests waiting for approval
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    The approval inbox is currently clear.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">

                  {requests
                    .filter(
                      (request) =>
                        request.status ===
                        "Pending Approval"
                    )
                    .map((request) => (
                      <div
                        key={request.id}
                        className="rounded-lg border border-amber-100 bg-amber-50/40 p-4"
                      >

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-gray-900">
                                {request.requestNumber}
                              </span>

                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-medium ${getPriorityClass(
                                  request.priority
                                )}`}
                              >
                                {request.priority} Priority
                              </span>
                            </div>

                            <p className="mt-1 text-sm text-gray-700">
                              {request.item} ×{" "}
                              {request.quantity}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Requested by{" "}
                              {request.requestedBy} ·{" "}
                              {request.department} ·{" "}
                              {request.supplier}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">

                            <span className="mr-2 font-semibold text-gray-900">
                              {formatCurrency(
                                request.estimatedAmount
                              )}
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleReject(
                                  request.id
                                )
                              }
                              className="rounded-lg border border-red-300 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              Reject
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleApprove(
                                  request.id
                                )
                              }
                              className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-medium text-white hover:bg-emerald-700"
                            >
                              Approve
                            </button>

                          </div>

                        </div>

                      </div>
                    ))}

                </div>
              )}

            </div>
          </div>

                    {/* SEARCH + FILTERS */}

          <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">

            <div className="flex flex-col gap-3 md:flex-row">

              <div className="flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search request number, requester, supplier or item..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "All"
                      | RequestStatus
                  )
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">
                  All Statuses
                </option>

                <option value="Draft">
                  Draft
                </option>

                <option value="Pending Approval">
                  Pending Approval
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>

            </div>

          </div>

          {/* REQUEST TABLE */}

          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

            <div className="border-b px-6 py-4">

              <h2 className="text-lg font-semibold text-gray-900">
                Purchase Requests
              </h2>

              <p className="text-sm text-gray-500">
                {filteredRequests.length} request
                {filteredRequests.length === 1
                  ? ""
                  : "s"} found
              </p>

            </div>

            {filteredRequests.length === 0 ? (
              <div className="p-10 text-center">

                <p className="font-medium text-gray-700">
                  No purchase requests found
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Try changing your search or status filter.
                </p>

              </div>
            ) : (
              <div className="overflow-x-auto">

                <table className="min-w-full text-sm">

                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">

                    <tr>

                      <th className="px-6 py-4">
                        Request
                      </th>

                      <th className="px-6 py-4">
                        Requested By
                      </th>

                      <th className="px-6 py-4">
                        Supplier
                      </th>

                      <th className="px-6 py-4">
                        Item
                      </th>

                      <th className="px-6 py-4">
                        Amount
                      </th>

                      <th className="px-6 py-4">
                        Priority
                      </th>

                      <th className="px-6 py-4">
                        Status
                      </th>

                      <th className="px-6 py-4 text-right">
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y">

                    {filteredRequests.map(
                      (request) => (
                        <tr
                          key={request.id}
                          className="hover:bg-gray-50"
                        >

                          <td className="px-6 py-4">

                            <p className="font-semibold text-gray-900">
                              {request.requestNumber}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {request.date}
                            </p>

                          </td>

                          <td className="px-6 py-4">

                            <p className="font-medium text-gray-800">
                              {request.requestedBy}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              {request.department}
                            </p>

                          </td>

                          <td className="px-6 py-4 text-gray-700">
                            {request.supplier}
                          </td>

                          <td className="px-6 py-4">

                            <p className="font-medium text-gray-800">
                              {request.item}
                            </p>

                            <p className="mt-1 text-xs text-gray-500">
                              Qty: {request.quantity}
                            </p>

                          </td>

                          <td className="px-6 py-4 font-semibold text-gray-900">
                            {formatCurrency(
                              request.estimatedAmount
                            )}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-medium ${getPriorityClass(
                                request.priority
                              )}`}
                            >
                              {request.priority}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusClass(
                                request.status
                              )}`}
                            >
                              {request.status}
                            </span>

                          </td>

                          <td className="px-6 py-4">

                            <div className="flex justify-end gap-2">

                              {request.status ===
                                "Draft" && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleSubmitForApproval(
                                      request.id
                                    )
                                  }
                                  className="rounded-lg border border-blue-300 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                                >
                                  Submit
                                </button>
                              )}

                              {request.status ===
                                "Pending Approval" && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleReject(
                                        request.id
                                      )
                                    }
                                    className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                                  >
                                    Reject
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleApprove(
                                        request.id
                                      )
                                    }
                                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
                                  >
                                    Approve
                                  </button>
                                </>
                              )}

                              {request.status ===
                                "Approved" && (
                                <span className="text-xs font-medium text-emerald-600">
                                  Ready for PO
                                </span>
                              )}

                              {request.status ===
                                "Rejected" && (
                                <span className="text-xs font-medium text-red-500">
                                  Rejected
                                </span>
                              )}

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>
            )}

          </div>

          {/* FOOTER SUMMARY */}

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <div className="rounded-xl border bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Draft Requests
                  </p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {draftCount}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                  📝
                </div>

              </div>

              <p className="mt-2 text-xs text-gray-500">
                Requests that have not yet been submitted
              </p>

            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Approval Progress
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {requests.length > 0
                      ? Math.round(
                          (approvedCount /
                            requests.length) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  ✓
                </div>

              </div>

              <p className="mt-2 text-xs text-gray-500">
                Percentage of requests currently approved
              </p>

            </div>

          </div>

        </div>
      </div>

      {/* ================================================== */}
      {/* NEW PURCHASE REQUEST MODAL */}
      {/* ================================================== */}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  New Purchase Request
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create a request for approval
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            {/* FORM */}

            <div className="space-y-5 p-6">

              <div className="grid gap-5 md:grid-cols-2">

                {/* REQUESTED BY */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Requested By *
                  </label>

                  <input
                    type="text"
                    value={
                      newRequest.requestedBy
                    }
                    onChange={(event) =>
                      setNewRequest(
                        (current) => ({
                          ...current,
                          requestedBy:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Enter employee name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* DEPARTMENT */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Department
                  </label>

                  <select
                    value={
                      newRequest.department
                    }
                    onChange={(event) =>
                      setNewRequest(
                        (current) => ({
                          ...current,
                          department:
                            event.target.value,
                        })
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Inventory">
                      Inventory
                    </option>

                    <option value="IT">
                      IT
                    </option>

                    <option value="Sales">
                      Sales
                    </option>

                    <option value="Warehouse">
                      Warehouse
                    </option>

                    <option value="Finance">
                      Finance
                    </option>

                    <option value="HR">
                      HR
                    </option>
                  </select>
                </div>

                {/* SUPPLIER */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Supplier *
                  </label>

                  <input
                    type="text"
                    value={
                      newRequest.supplier
                    }
                    onChange={(event) =>
                      setNewRequest(
                        (current) => ({
                          ...current,
                          supplier:
                            event.target.value,
                        })
                      )
                    }
                    placeholder="Enter supplier name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* ITEM */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Item *
                  </label>

                  <input
                    type="text"
                    value={newRequest.item}
                    onChange={(event) =>
                      setNewRequest(
                        (current) => ({
                          ...current,
                          item: event.target.value,
                        })
                      )
                    }
                    placeholder="Product or item name"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* QUANTITY */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Quantity *
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={
                      newRequest.quantity
                    }
                    onChange={(event) =>
                      setNewRequest(
                        (current) => ({
                          ...current,
                          quantity: Number(
                            event.target.value
                          ),
                        })
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* AMOUNT */}

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Estimated Amount
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      newRequest.estimatedAmount
                    }
                    onChange={(event) =>
                      setNewRequest(
                        (current) => ({
                          ...current,
                          estimatedAmount:
                            Number(
                              event.target.value
                            ),
                        })
                      )
                    }
                    placeholder="₹0"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

              </div>

              {/* PRIORITY */}

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Priority
                </label>

                <div className="flex gap-2">

                  {(
                    [
                      "Low",
                      "Medium",
                      "High",
                    ] as const
                  ).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() =>
                        setNewRequest(
                          (current) => ({
                            ...current,
                            priority,
                          })
                        )
                      }
                      className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                        newRequest.priority ===
                        priority
                          ? priority === "High"
                            ? "border-red-500 bg-red-50 text-red-700"
                            : priority ===
                              "Medium"
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-emerald-500 bg-emerald-50 text-emerald-700"
                          : "border-gray-300 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {priority}
                    </button>
                  ))}

                </div>

              </div>

              {/* INFORMATION */}

              <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">

                <p className="text-sm font-medium text-blue-800">
                  Approval workflow
                </p>

                <p className="mt-1 text-xs leading-5 text-blue-700">
                  New requests are created as drafts.
                  Submit the request when it is ready,
                  then an authorized user can approve or
                  reject it from the approval inbox.
                </p>

              </div>

            </div>

            {/* MODAL FOOTER */}

            <div className="flex flex-col-reverse gap-3 border-t px-6 py-4 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setShowForm(false)
                }
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleCreateRequest
                }
                className="rounded-lg bg-[#12213a] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1c3152]"
              >
                Create Request
              </button>

            </div>

          </div>

        </div>
      )}

    </PageLayout>
  );
}