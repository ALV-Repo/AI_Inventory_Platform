"use client";

import { useMemo, useState } from "react";

type TransferStatus =
  | "Pending Approval"
  | "Approved"
  | "Dispatched"
  | "Received"
  | "Rejected";

type Transfer = {
  id: string;
  product: string;
  sku: string;
  fromWarehouse: string;
  toWarehouse: string;
  quantity: number;
  reason: string;
  requestedBy: string;
  createdAt: string;
  status: TransferStatus;
};

const initialTransfers: Transfer[] = [
  {
    id: "TR-1001",
    product: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
    fromWarehouse: "Main Store",
    toWarehouse: "Warehouse A",
    quantity: 6,
    reason: "Stock balancing",
    requestedBy: "Admin User",
    createdAt: "20 Aug 2026",
    status: "Pending Approval",
  },
  {
    id: "TR-1002",
    product: "Bluetooth Speaker",
    sku: "ELC-BT-600",
    fromWarehouse: "Main Store",
    toWarehouse: "Warehouse B",
    quantity: 4,
    reason: "Low stock replenishment",
    requestedBy: "Admin User",
    createdAt: "19 Aug 2026",
    status: "Approved",
  },
  {
    id: "TR-1003",
    product: "Football Size 5",
    sku: "SPT-BL-900",
    fromWarehouse: "Warehouse A",
    toWarehouse: "Main Store",
    quantity: 5,
    reason: "Demand requirement",
    requestedBy: "Admin User",
    createdAt: "18 Aug 2026",
    status: "Dispatched",
  },
];

const products = [
  {
    name: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
  },
  {
    name: "Bluetooth Speaker",
    sku: "ELC-BT-600",
  },
  {
    name: "Football Size 5",
    sku: "SPT-BL-900",
  },
  {
    name: "Christmas Tree 4ft",
    sku: "SEA-XM-500",
  },
  {
    name: "Fashion Doll Set",
    sku: "TOY-DL-410",
  },
  {
    name: "Ceramic Planter",
    sku: "HOM-PL-810",
  },
  {
    name: "Wireless Keyboard",
    sku: "ELC-KB-120",
  },
  {
    name: "USB Microphone",
    sku: "ELC-MC-500",
  },
  {
    name: "Gaming Mouse",
    sku: "ELC-MS-180",
  },
];

const warehouses = [
  "Main Store",
  "Warehouse A",
  "Warehouse B",
];

export default function TransferWorkflowPage() {
  const [transfers, setTransfers] =
    useState<Transfer[]>(initialTransfers);

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [selectedTransfer, setSelectedTransfer] =
    useState<Transfer | null>(null);

  const [statusFilter, setStatusFilter] =
    useState<"All" | TransferStatus>("All");

  const [search, setSearch] = useState("");

  const [product, setProduct] = useState(products[0].name);
  const [fromWarehouse, setFromWarehouse] =
    useState("Main Store");
  const [toWarehouse, setToWarehouse] =
    useState("Warehouse A");
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] =
    useState("Stock balancing");

  const filteredTransfers = useMemo(() => {
    return transfers.filter((transfer) => {
      const matchesStatus =
        statusFilter === "All" ||
        transfer.status === statusFilter;

      const searchText = search.toLowerCase();

      const matchesSearch =
        transfer.id.toLowerCase().includes(searchText) ||
        transfer.product.toLowerCase().includes(searchText) ||
        transfer.sku.toLowerCase().includes(searchText);

      return matchesStatus && matchesSearch;
    });
  }, [transfers, statusFilter, search]);

  const pendingCount = transfers.filter(
    (t) => t.status === "Pending Approval"
  ).length;

  const approvedCount = transfers.filter(
    (t) => t.status === "Approved"
  ).length;

  const dispatchedCount = transfers.filter(
    (t) => t.status === "Dispatched"
  ).length;

  const receivedCount = transfers.filter(
    (t) => t.status === "Received"
  ).length;

  const getProductSku = (productName: string) => {
    return (
      products.find((p) => p.name === productName)?.sku || ""
    );
  };

  const createTransfer = () => {
  if (fromWarehouse === toWarehouse) {
    alert("From and To warehouse cannot be the same.");
    return;
  }

  if (quantity <= 0) {
    alert("Quantity must be greater than 0.");
    return;
  }

    const newTransfer: Transfer = {
      id: `TR-${1000 + transfers.length + 1}`,
      product,
      sku: getProductSku(product),
      fromWarehouse,
      toWarehouse,
      quantity,
      reason,
      requestedBy: "Admin User",
      createdAt: new Date().toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),
      status: "Pending Approval",
    };

    setTransfers((prev) => [
      newTransfer,
      ...prev,
    ]);

    setShowCreateForm(false);

    setQuantity(1);
    setReason("Stock balancing");

    alert(
      `Transfer ${newTransfer.id} created successfully.`
    );
  };

  const updateTransferStatus = (
    id: string,
    newStatus: TransferStatus
  ) => {
    setTransfers((prev) =>
      prev.map((transfer) =>
        transfer.id === id
          ? {
              ...transfer,
              status: newStatus,
            }
          : transfer
      )
    );

    setSelectedTransfer((prev) =>
      prev
        ? {
            ...prev,
            status: newStatus,
          }
        : null
    );
  };
    return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-1 text-sm text-blue-600">
              Inventory / Transfers
            </div>

            <h1 className="text-3xl font-bold text-gray-900">
              Transfer Stock
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Create, approve, dispatch and receive stock transfers
              between warehouses.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-[#12213a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#1c3154]"
          >
            + Create Transfer
          </button>
        </div>

        {/* SUMMARY CARDS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Pending Approval
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {pendingCount}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Waiting for approval
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Approved
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {approvedCount}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Ready for dispatch
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Dispatched
            </p>

            <p className="mt-2 text-3xl font-bold text-purple-600">
              {dispatchedCount}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              In transit
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Received
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {receivedCount}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Completed transfers
            </p>
          </div>

        </div>

        {/* WORKFLOW */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Transfer Workflow
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Track every transfer through its complete lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

            {/* STEP 1 */}
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-bold text-orange-600">
                1
              </div>

              <h3 className="font-semibold text-gray-900">
                Create
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Create a request to move stock.
              </p>

              <div className="mt-3 text-xs font-medium text-orange-600">
                Request initiated
              </div>
            </div>

            {/* STEP 2 */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                2
              </div>

              <h3 className="font-semibold text-gray-900">
                Approve
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Manager reviews and approves the request.
              </p>

              <div className="mt-3 text-xs font-medium text-blue-600">
                Approval required
              </div>
            </div>

            {/* STEP 3 */}
            <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-sm font-bold text-purple-600">
                3
              </div>

              <h3 className="font-semibold text-gray-900">
                Dispatch
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Source warehouse dispatches the stock.
              </p>

              <div className="mt-3 text-xs font-medium text-purple-600">
                Stock in transit
              </div>
            </div>

            {/* STEP 4 */}
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-600">
                4
              </div>

              <h3 className="font-semibold text-gray-900">
                Receive
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Destination warehouse confirms receipt.
              </p>

              <div className="mt-3 text-xs font-medium text-green-600">
                Transfer completed
              </div>
            </div>

          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Transfer Requests
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Search and manage stock transfer requests.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

            {/* SEARCH */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search transfer ID, product or SKU..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500"
              />
            </div>

            {/* STATUS */}
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-gray-500">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "All" | TransferStatus
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">
                  All Statuses
                </option>

                <option value="Pending Approval">
                  Pending Approval
                </option>

                <option value="Approved">
                  Approved
                </option>

                <option value="Dispatched">
                  Dispatched
                </option>

                <option value="Received">
                  Received
                </option>

                <option value="Rejected">
                  Rejected
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* TRANSFER TABLE */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                Transfer List
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Showing {filteredTransfers.length} of{" "}
                {transfers.length} transfers
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left">

              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Transfer
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    From
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    To
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Qty
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Date
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredTransfers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-12 text-center text-sm text-gray-500"
                    >
                      No transfer requests found.
                    </td>
                  </tr>
                ) : (
                  filteredTransfers.map((transfer) => (
                    <tr
                      key={transfer.id}
                      className="transition hover:bg-gray-50"
                    >

                      {/* TRANSFER ID */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900">
                          {transfer.id}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {transfer.requestedBy}
                        </div>
                      </td>

                      {/* PRODUCT */}
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900">
                          {transfer.product}
                        </div>

                        <div className="mt-1 text-xs text-gray-400">
                          {transfer.sku}
                        </div>
                      </td>

                      {/* FROM */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {transfer.fromWarehouse}
                      </td>

                      {/* TO */}
                      <td className="px-5 py-4 text-sm text-gray-700">
                        {transfer.toWarehouse}
                      </td>

                      {/* QUANTITY */}
                      <td className="px-5 py-4">
                        <span className="font-semibold text-gray-900">
                          {transfer.quantity}
                        </span>
                      </td>

                      {/* DATE */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        {transfer.createdAt}
                      </td>

                      {/* STATUS */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            transfer.status ===
                            "Pending Approval"
                              ? "bg-orange-100 text-orange-700"
                              : transfer.status ===
                                "Approved"
                              ? "bg-blue-100 text-blue-700"
                              : transfer.status ===
                                "Dispatched"
                              ? "bg-purple-100 text-purple-700"
                              : transfer.status ===
                                "Received"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {transfer.status}
                        </span>
                      </td>

                      {/* ACTION */}
                      <td className="px-5 py-4">

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedTransfer(transfer)
                          }
                          className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Manage
                        </button>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>
        </div>

        {/* CREATE FORM MODAL */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Create Stock Transfer
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Create a new transfer request.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </button>

              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">

                {/* PRODUCT */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product
                  </label>

                  <select
                    value={product}
                    onChange={(e) =>
                      setProduct(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    {products.map((item) => (
                      <option
                        key={item.sku}
                        value={item.name}
                      >
                        {item.name} — {item.sku}
                      </option>
                    ))}
                  </select>
                </div>

                {/* FROM */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    From Warehouse
                  </label>

                  <select
                    value={fromWarehouse}
                    onChange={(e) =>
                      setFromWarehouse(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    {warehouses.map((warehouse) => (
                      <option
                        key={warehouse}
                        value={warehouse}
                      >
                        {warehouse}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TO */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    To Warehouse
                  </label>

                  <select
                    value={toWarehouse}
                    onChange={(e) =>
                      setToWarehouse(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    {warehouses.map((warehouse) => (
                      <option
                        key={warehouse}
                        value={warehouse}
                      >
                        {warehouse}
                      </option>
                    ))}
                  </select>
                </div>

                {/* QUANTITY */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          1,
                          Number(e.target.value)
                        )
                      )
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* REASON */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Reason
                  </label>

                  <select
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Stock balancing">
                      Stock balancing
                    </option>

                    <option value="Low stock replenishment">
                      Low stock replenishment
                    </option>

                    <option value="Demand requirement">
                      Demand requirement
                    </option>

                    <option value="Warehouse redistribution">
                      Warehouse redistribution
                    </option>
                  </select>
                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={createTransfer}
                  className="rounded-lg bg-[#12213a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3154]"
                >
                  Create Transfer
                </button>

              </div>

            </div>

          </div>
        )}

                {/* MANAGE TRANSFER MODAL */}

        {selectedTransfer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

              {/* MODAL HEADER */}

              <div className="flex items-start justify-between border-b border-gray-200 px-6 py-5">

                <div>

                  <div className="flex items-center gap-2">

                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedTransfer.id}
                    </h2>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedTransfer.status ===
                        "Pending Approval"
                          ? "bg-orange-100 text-orange-700"
                          : selectedTransfer.status ===
                            "Approved"
                          ? "bg-blue-100 text-blue-700"
                          : selectedTransfer.status ===
                            "Dispatched"
                          ? "bg-purple-100 text-purple-700"
                          : selectedTransfer.status ===
                            "Received"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {selectedTransfer.status}
                    </span>

                  </div>

                  <p className="mt-1 text-sm text-gray-500">
                    Manage transfer workflow
                  </p>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedTransfer(null)
                  }
                  className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </button>

              </div>

              {/* TRANSFER DETAILS */}

              <div className="p-6">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs text-gray-400">
                      Product
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedTransfer.product}
                    </p>

                    <p className="mt-1 font-mono text-xs text-gray-500">
                      {selectedTransfer.sku}
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs text-gray-400">
                      Quantity
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {selectedTransfer.quantity}
                    </p>

                    <p className="text-xs text-gray-500">
                      units
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs text-gray-400">
                      From Warehouse
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedTransfer.fromWarehouse}
                    </p>

                  </div>

                  <div className="rounded-xl bg-gray-50 p-4">

                    <p className="text-xs text-gray-400">
                      To Warehouse
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-900">
                      {selectedTransfer.toWarehouse}
                    </p>

                  </div>

                </div>

                {/* REASON */}

                <div className="mt-4 rounded-xl border border-gray-200 p-4">

                  <p className="text-xs text-gray-400">
                    Transfer Reason
                  </p>

                  <p className="mt-1 text-sm font-medium text-gray-800">
                    {selectedTransfer.reason}
                  </p>

                </div>

                {/* WORKFLOW TIMELINE */}

                <div className="mt-6">

                  <h3 className="mb-4 text-sm font-semibold text-gray-900">
                    Transfer Progress
                  </h3>

                  <div className="space-y-4">

                    {/* CREATED */}

                    <div className="flex gap-3">

                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                        ✓
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-gray-900">
                          Transfer Created
                        </p>

                        <p className="mt-1 text-[11px] text-gray-500">
                          Request created by{" "}
                          {selectedTransfer.requestedBy}
                          {" "}on{" "}
                          {selectedTransfer.createdAt}
                        </p>

                      </div>

                    </div>

                    {/* APPROVED */}

                    <div className="flex gap-3">

                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          selectedTransfer.status ===
                            "Pending Approval" ||
                          selectedTransfer.status ===
                            "Rejected"
                            ? "bg-gray-100 text-gray-400"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {selectedTransfer.status ===
                          "Pending Approval" ||
                        selectedTransfer.status ===
                          "Rejected"
                          ? "2"
                          : "✓"}
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-gray-900">
                          Approval
                        </p>

                        <p className="mt-1 text-[11px] text-gray-500">
                          Transfer must be approved before dispatch.
                        </p>

                      </div>

                    </div>

                    {/* DISPATCHED */}

                    <div className="flex gap-3">

                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          selectedTransfer.status ===
                            "Dispatched" ||
                          selectedTransfer.status ===
                            "Received"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {selectedTransfer.status ===
                            "Dispatched" ||
                        selectedTransfer.status ===
                            "Received"
                          ? "✓"
                          : "3"}
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-gray-900">
                          Dispatch
                        </p>

                        <p className="mt-1 text-[11px] text-gray-500">
                          Stock leaves the source warehouse.
                        </p>

                      </div>

                    </div>

                    {/* RECEIVED */}

                    <div className="flex gap-3">

                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          selectedTransfer.status ===
                          "Received"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {selectedTransfer.status ===
                        "Received"
                          ? "✓"
                          : "4"}
                      </div>

                      <div>

                        <p className="text-xs font-semibold text-gray-900">
                          Receive Confirmation
                        </p>

                        <p className="mt-1 text-[11px] text-gray-500">
                          Destination warehouse confirms the stock.
                        </p>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="border-t border-gray-200 px-6 py-4">

                <div className="flex flex-wrap justify-end gap-3">

                  {/* CLOSE */}

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedTransfer(null)
                    }
                    className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Close
                  </button>

                  {/* PENDING APPROVAL */}

                  {selectedTransfer.status ===
                    "Pending Approval" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          updateTransferStatus(
                            selectedTransfer.id,
                            "Rejected"
                          )
                        }
                        className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          updateTransferStatus(
                            selectedTransfer.id,
                            "Approved"
                          )
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Approve Transfer
                      </button>
                    </>
                  )}

                  {/* APPROVED */}

                  {selectedTransfer.status ===
                    "Approved" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateTransferStatus(
                          selectedTransfer.id,
                          "Dispatched"
                        )
                      }
                      className="rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
                    >
                      Dispatch Stock
                    </button>
                  )}

                  {/* DISPATCHED */}

                  {selectedTransfer.status ===
                    "Dispatched" && (
                    <button
                      type="button"
                      onClick={() =>
                        updateTransferStatus(
                          selectedTransfer.id,
                          "Received"
                        )
                      }
                      className="rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                    >
                      Confirm Received
                    </button>
                  )}

                  {/* RECEIVED */}

                  {selectedTransfer.status ===
                    "Received" && (
                    <span className="flex items-center rounded-lg bg-green-50 px-4 py-2.5 text-sm font-semibold text-green-700">
                      ✓ Transfer Completed
                    </span>
                  )}

                  {/* REJECTED */}

                  {selectedTransfer.status ===
                    "Rejected" && (
                    <span className="flex items-center rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700">
                      Transfer Rejected
                    </span>
                  )}

                </div>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}