"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

type ReceiptStatus =
  | "Draft"
  | "Partially Received"
  | "Received";

type ReceiptItem = {
  id: number;
  sku: string;
  product: string;
  orderedQty: number;
  previouslyReceived: number;
  receivedQty: number;
  unit: string;
  batch: string;
  expiry: string;
};

type PurchaseOrder = {
  id: string;
  supplier: string;
  date: string;
  warehouse: string;
  total: number;
};

const purchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-2026-0187",
    supplier: "TechSource Distributors Pvt Ltd",
    date: "22 Aug 2026",
    warehouse: "Hyderabad Central",
    total: 248500,
  },
  {
    id: "PO-2026-0188",
    supplier: "Metro Electronics India",
    date: "21 Aug 2026",
    warehouse: "Hyderabad Central",
    total: 184200,
  },
  {
    id: "PO-2026-0189",
    supplier: "Prime Office Supplies",
    date: "20 Aug 2026",
    warehouse: "Bangalore Hub",
    total: 92750,
  },
];

const initialItems: ReceiptItem[] = [
  {
    id: 1,
    sku: "KB-WL-001",
    product: "Wireless Keyboard",
    orderedQty: 250,
    previouslyReceived: 0,
    receivedQty: 250,
    unit: "Units",
    batch: "BATCH-0826-A",
    expiry: "",
  },
  {
    id: 2,
    sku: "MIC-USB-002",
    product: "USB Microphone",
    orderedQty: 100,
    previouslyReceived: 0,
    receivedQty: 80,
    unit: "Units",
    batch: "BATCH-0826-B",
    expiry: "",
  },
  {
    id: 3,
    sku: "MON-24-004",
    product: '24-inch Monitor',
    orderedQty: 120,
    previouslyReceived: 0,
    receivedQty: 120,
    unit: "Units",
    batch: "BATCH-0826-C",
    expiry: "",
  },
  {
    id: 4,
    sku: "MSE-WL-005",
    product: "Wireless Mouse",
    orderedQty: 150,
    previouslyReceived: 25,
    receivedQty: 50,
    unit: "Units",
    batch: "BATCH-0826-D",
    expiry: "",
  },
];

export default function GoodsReceiptsPage() {
  const [selectedPO, setSelectedPO] =
    useState(purchaseOrders[0].id);

  const [supplier, setSupplier] =
    useState(purchaseOrders[0].supplier);

  const [warehouse, setWarehouse] =
    useState(purchaseOrders[0].warehouse);

  const [receiptDate, setReceiptDate] =
    useState("2026-08-22");

  const [deliveryNote, setDeliveryNote] =
    useState("");

  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const [items, setItems] =
    useState<ReceiptItem[]>(
      initialItems
    );

  const [status, setStatus] =
    useState<ReceiptStatus>("Draft");

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [message, setMessage] =
    useState("");

    const [grnNumber, setGrnNumber] =
  useState("");

const [submittedAt, setSubmittedAt] =
  useState("");

  const [showAddItem, setShowAddItem] =
    useState(false);

  const [newProduct, setNewProduct] =
    useState("");

  const [newSku, setNewSku] =
    useState("");

  const [newQuantity, setNewQuantity] =
    useState("");

    useEffect(() => {
  const savedGRN = localStorage.getItem(
    "stockflow-last-grn"
  );

  if (!savedGRN) {
    return;
  }

  try {
    const data = JSON.parse(savedGRN);

    if (data.grnNumber) {
      setGrnNumber(data.grnNumber);
    }

    if (data.submittedAt) {
      setSubmittedAt(data.submittedAt);
    }

    if (data.status) {
      setStatus(data.status);
    }

    if (data.items) {
      setItems(data.items);
    }
  } catch {
    localStorage.removeItem(
      "stockflow-last-grn"
    );
  }
}, []);

  const selectedPurchaseOrder =
    useMemo(
      () =>
        purchaseOrders.find(
          (po) =>
            po.id === selectedPO
        ),
      [selectedPO]
    );

  const totalOrdered = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + item.orderedQty,
        0
      ),
    [items]
  );

  const totalPreviouslyReceived =
    useMemo(
      () =>
        items.reduce(
          (sum, item) =>
            sum +
            item.previouslyReceived,
          0
        ),
      [items]
    );

  const totalCurrentReceived =
    useMemo(
      () =>
        items.reduce(
          (sum, item) =>
            sum + item.receivedQty,
          0
        ),
      [items]
    );

  const totalReceivedAfterGRN =
    totalPreviouslyReceived +
    totalCurrentReceived;

  const totalRemaining = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          Math.max(
            0,
            item.orderedQty -
              item.previouslyReceived -
              item.receivedQty
          ),
        0
      ),
    [items]
  );

  const receiptPercentage =
    totalOrdered > 0
      ? Math.round(
          (totalReceivedAfterGRN /
            totalOrdered) *
            100
        )
      : 0;

  const hasPartialReceipt =
    items.some(
      (item) =>
        item.receivedQty > 0 &&
        item.receivedQty <
          item.orderedQty -
            item.previouslyReceived
    );

  const hasOverReceipt =
    items.some(
      (item) =>
        item.receivedQty >
        item.orderedQty -
          item.previouslyReceived
    );

  const formatCurrency = (
    value: number
  ) =>
    new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }
    ).format(value);

  const calculateItemRemaining = (
    item: ReceiptItem
  ) =>
    Math.max(
      0,
      item.orderedQty -
        item.previouslyReceived -
        item.receivedQty
    );

  const calculateItemAvailable = (
    item: ReceiptItem
  ) =>
    Math.max(
      0,
      item.orderedQty -
        item.previouslyReceived
    );

  const updateReceivedQuantity = (
    id: number,
    value: string
  ) => {
    const quantity =
      Number(value);

    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        return {
          ...item,
          receivedQty:
            Number.isNaN(quantity)
              ? 0
              : Math.max(
                  0,
                  quantity
                ),
        };
      })
    );

    setStatus("Draft");
    setMessage("");
  };

  const updateBatch = (
    id: number,
    value: string
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              batch: value,
            }
          : item
      )
    );
  };

  const updateExpiry = (
    id: number,
    value: string
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              expiry: value,
            }
          : item
      )
    );
  };

  const handlePOChange = (
    poId: string
  ) => {
    const po =
      purchaseOrders.find(
        (item) =>
          item.id === poId
      );

    setSelectedPO(poId);

    if (po) {
      setSupplier(
        po.supplier
      );

      setWarehouse(
        po.warehouse
      );
    }

    setMessage("");
  };

  const setAllPendingQuantity =
    () => {
      setItems((current) =>
        current.map((item) => ({
          ...item,
          receivedQty:
            Math.max(
              0,
              item.orderedQty -
                item.previouslyReceived
            ),
        }))
      );

      setStatus("Draft");
      setMessage(
        "All pending quantities have been filled."
      );
    };

  const clearReceivedQuantities =
    () => {
      setItems((current) =>
        current.map((item) => ({
          ...item,
          receivedQty: 0,
        }))
      );

      setStatus("Draft");
      setMessage(
        "Current receipt quantities cleared."
      );
    };

  const addItem = () => {
    const quantity =
      Number(newQuantity);

    if (
      !newProduct.trim() ||
      !newSku.trim() ||
      !quantity ||
      quantity <= 0
    ) {
      setMessage(
        "Enter a product name, SKU and valid quantity."
      );
      return;
    }

    const newItem: ReceiptItem = {
      id:
        Math.max(
          ...items.map(
            (item) => item.id
          ),
          0
        ) + 1,
      sku: newSku.trim(),
      product:
        newProduct.trim(),
      orderedQty: quantity,
      previouslyReceived: 0,
      receivedQty: quantity,
      unit: "Units",
      batch: "",
      expiry: "",
    };

    setItems((current) => [
      ...current,
      newItem,
    ]);

    setNewProduct("");
    setNewSku("");
    setNewQuantity("");
    setShowAddItem(false);
    setMessage(
      "Item added to the GRN."
    );
  };

  const removeItem = (
    id: number
  ) => {
    setItems((current) =>
      current.filter(
        (item) =>
          item.id !== id
      )
    );

    setMessage(
      "Item removed from the GRN."
    );
  };

  const validateGRN = () => {
    if (!selectedPO) {
      setMessage(
        "Please select a purchase order."
      );
      return false;
    }

    if (!receiptDate) {
      setMessage(
        "Please select the receipt date."
      );
      return false;
    }

    if (items.length === 0) {
      setMessage(
        "Add at least one item to the GRN."
      );
      return false;
    }

    if (hasOverReceipt) {
      setMessage(
        "Received quantity cannot exceed the pending quantity."
      );
      return false;
    }

    if (totalCurrentReceived <= 0) {
      setMessage(
        "Enter at least one received quantity."
      );
      return false;
    }

    return true;
  };

  const openConfirmation = () => {
    setMessage("");

    if (!validateGRN()) {
      return;
    }

    setShowConfirm(true);
  };

  const saveGRN = () => {
  setShowConfirm(false);

  const nextStatus: ReceiptStatus =
    totalRemaining === 0
      ? "Received"
      : "Partially Received";

  const generatedGRN =
    `GRN-${new Date().getFullYear()}-${String(
      Date.now()
    ).slice(-6)}`;

  const now =
    new Date().toLocaleString("en-IN");

  setStatus(nextStatus);
  setGrnNumber(generatedGRN);
  setSubmittedAt(now);

  localStorage.setItem(
    "stockflow-last-grn",
    JSON.stringify({
      grnNumber: generatedGRN,
      submittedAt: now,
      status: nextStatus,
      purchaseOrder: selectedPO,
      supplier,
      warehouse,
      receiptDate,
      deliveryNote,
      invoiceNumber,
      items,
      totalOrdered,
      totalPreviouslyReceived,
      totalCurrentReceived,
      totalRemaining,
    })
  );

  setMessage(
    totalRemaining === 0
      ? `GRN ${generatedGRN} submitted successfully. Purchase order is fully received.`
      : `GRN ${generatedGRN} submitted successfully. Purchase order remains partially received.`
  );
};

  const saveDraft = () => {
    setStatus("Draft");

    setMessage(
      "GRN saved as draft."
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#12213a] text-lg font-bold text-white">
                GRN
              </div>

              <div>

                <h1 className="text-2xl font-bold text-[#12213a] md:text-3xl">
                  Goods Receipt Note
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Record received goods against
                  purchase orders with partial
                  receipt support.
                </p>

              </div>

            </div>

          </div>

          <div className="flex items-center gap-3">

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                status === "Received"
                  ? "bg-green-50 text-green-600"
                  : status ===
                    "Partially Received"
                  ? "bg-amber-50 text-amber-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              ● {status}
            </span>

          </div>

        </div>

        {/* SUMMARY CARDS */}

        <div className="mb-6 grid gap-4 md:grid-cols-4">

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Ordered
            </p>

            <p className="mt-2 text-2xl font-bold text-[#12213a]">
              {totalOrdered}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Total units on PO
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Current Receipt
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {totalCurrentReceived}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Units in this GRN
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Remaining
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-500">
              {totalRemaining}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Pending after this receipt
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Receipt Progress
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {Math.min(
                100,
                receiptPercentage
              )}
              %
            </p>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    receiptPercentage
                  )}%`,
                }}
              />

            </div>

          </div>

        </div>

                {/* GRN SUBMISSION DETAILS */}

        {grnNumber && (
          <div className="mb-6 rounded-2xl border bg-white p-6 shadow-sm">

            <div className="mb-4">

              <h2 className="text-lg font-semibold text-[#12213a]">
                GRN Submission Details
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Details of the latest submitted goods receipt.
              </p>

            </div>

            <div className="grid gap-4 md:grid-cols-3">

              <div className="rounded-xl bg-blue-50 p-4">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  GRN Number
                </p>

                <p className="mt-2 text-lg font-bold text-blue-700">
                  {grnNumber}
                </p>

              </div>

              <div className="rounded-xl bg-gray-50 p-4">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Submitted At
                </p>

                <p className="mt-2 text-sm font-semibold text-[#12213a]">
                  {submittedAt || "—"}
                </p>

              </div>

              <div className="rounded-xl bg-green-50 p-4">

                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </p>

                <p className="mt-2 text-lg font-bold text-green-700">
                  {status}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* PO DETAILS */}

        <section className="mb-6 rounded-2xl border bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <h2 className="text-lg font-semibold text-[#12213a]">
              Receipt Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select the purchase order and enter
              delivery details.
            </p>

          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Purchase Order
              </label>

              <select
                value={selectedPO}
                onChange={(event) =>
                  handlePOChange(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {purchaseOrders.map(
                  (po) => (
                    <option
                      key={po.id}
                      value={po.id}
                    >
                      {po.id} —{" "}
                      {po.supplier}
                    </option>
                  )
                )}
              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Supplier
              </label>

              <input
                value={supplier}
                onChange={(event) =>
                  setSupplier(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Warehouse
              </label>

              <input
                value={warehouse}
                onChange={(event) =>
                  setWarehouse(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Receipt Date
              </label>

              <input
                type="date"
                value={receiptDate}
                onChange={(event) =>
                  setReceiptDate(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Delivery Note
              </label>

              <input
                value={deliveryNote}
                onChange={(event) =>
                  setDeliveryNote(
                    event.target.value
                  )
                }
                placeholder="DN-XXXX"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Supplier Invoice
              </label>

              <input
                value={invoiceNumber}
                onChange={(event) =>
                  setInvoiceNumber(
                    event.target.value
                  )
                }
                placeholder="INV-XXXX"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div className="lg:col-span-2">

              {selectedPurchaseOrder && (
                <div className="flex h-full items-center rounded-lg bg-gray-50 px-4 py-3">

                  <div>

                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Selected PO Value
                    </p>

                    <p className="mt-1 text-lg font-bold text-[#12213a]">
                      {formatCurrency(
                        selectedPurchaseOrder.total
                      )}
                    </p>

                  </div>

                  <div className="ml-auto text-right">

                    <p className="text-xs text-gray-400">
                      PO Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      {
                        selectedPurchaseOrder.date
                      }
                    </p>

                  </div>

                </div>
              )}

            </div>

          </div>

        </section>

        {/* ITEMS */}

        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-lg font-semibold text-[#12213a]">
                Goods Received
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the actual quantity received
                for each purchase order item.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={
                  setAllPendingQuantity
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Receive All Pending
              </button>

              <button
                type="button"
                onClick={
                  clearReceivedQuantities
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Clear Current Receipt
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowAddItem(true)
                }
                className="rounded-lg bg-[#12213a] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1c3152]"
              >
                + Add Item
              </button>

            </div>

          </div>

          {/* PARTIAL RECEIPT NOTICE */}

          {hasPartialReceipt && (
            <div className="border-b border-amber-100 bg-amber-50 px-6 py-4">

              <div className="flex gap-3">

                <div className="text-lg">
                  ⚠️
                </div>

                <div>

                  <p className="text-sm font-semibold text-amber-800">
                    Partial receipt detected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-amber-700">
                    Some items are being received
                    in quantities lower than the
                    pending PO quantity. The
                    remaining quantity will stay
                    open for a future GRN.
                  </p>

                </div>

              </div>

            </div>
          )}

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1200px] text-left">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Ordered
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Previously Received
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Pending
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Receive Now
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Batch / Lot
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Expiry
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {items.map(
                  (item) => {
                    const pendingBefore =
                      calculateItemAvailable(
                        item
                      );

                    const remaining =
                      calculateItemRemaining(
                        item
                      );

                    const overReceived =
                      item.receivedQty >
                      pendingBefore;

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50"
                      >

                        <td className="px-5 py-4">

                          <p className="font-semibold text-gray-800">
                            {item.product}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {item.sku}
                          </p>

                        </td>

                        <td className="px-5 py-4">

                          <span className="font-semibold text-gray-700">
                            {item.orderedQty}
                          </span>

                          <span className="ml-1 text-xs text-gray-400">
                            {item.unit}
                          </span>

                        </td>

                        <td className="px-5 py-4 text-sm text-gray-600">
                          {item.previouslyReceived}
                        </td>

                        <td className="px-5 py-4">

                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                              pendingBefore ===
                              0
                                ? "bg-green-50 text-green-600"
                                : "bg-orange-50 text-orange-600"
                            }`}
                          >
                            {pendingBefore}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <div>

                            <input
                              type="number"
                              min="0"
                              value={
                                item.receivedQty
                              }
                              onChange={(
                                event
                              ) =>
                                updateReceivedQuantity(
                                  item.id,
                                  event.target
                                    .value
                                )
                              }
                              className={`w-28 rounded-lg border px-3 py-2 text-sm font-semibold outline-none focus:ring-2 ${
                                overReceived
                                  ? "border-red-300 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-100"
                                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                              }`}
                            />

                            {overReceived && (
                              <p className="mt-1 text-[10px] font-medium text-red-600">
                                Exceeds pending
                                quantity
                              </p>
                            )}

                          </div>

                        </td>

                        <td className="px-5 py-4">

                          <input
                            value={
                              item.batch
                            }
                            onChange={(
                              event
                            ) =>
                              updateBatch(
                                item.id,
                                event.target
                                  .value
                              )
                            }
                            placeholder="Batch / Lot"
                            className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                          />

                        </td>

                        <td className="px-5 py-4">

                          <input
                            type="date"
                            value={
                              item.expiry
                            }
                            onChange={(
                              event
                            ) =>
                              updateExpiry(
                                item.id,
                                event.target
                                  .value
                              )
                            }
                            className="w-36 rounded-lg border border-gray-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                          />

                        </td>

                        <td className="px-5 py-4">

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(
                                item.id
                              )
                            }
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

          {/* TABLE FOOTER */}

          <div className="grid gap-4 border-t bg-gray-50 px-6 py-5 md:grid-cols-4">

            <div>

              <p className="text-xs text-gray-500">
                Total Ordered
              </p>

              <p className="mt-1 text-lg font-bold text-gray-800">
                {totalOrdered}
              </p>

            </div>

            <div>

              <p className="text-xs text-gray-500">
                Previously Received
              </p>

              <p className="mt-1 text-lg font-bold text-gray-800">
                {totalPreviouslyReceived}
              </p>

            </div>

            <div>

              <p className="text-xs text-gray-500">
                Current GRN
              </p>

              <p className="mt-1 text-lg font-bold text-blue-600">
                {totalCurrentReceived}
              </p>

            </div>

            <div>

              <p className="text-xs text-gray-500">
                Remaining
              </p>

              <p className="mt-1 text-lg font-bold text-orange-500">
                {totalRemaining}
              </p>

            </div>

          </div>

        </section>

        {/* ACTION AREA */}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="font-semibold text-[#12213a]">
                Submit Goods Receipt
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Review the quantities and submit
                the GRN to update inventory.
              </p>

              {message && (
                <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                  {message}
                </div>
              )}

            </div>

            <div className="flex flex-wrap gap-3">

              <button
                type="button"
                onClick={
                  saveDraft
                }
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={
                  openConfirmation
                }
                className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                Submit GRN
              </button>

            </div>

          </div>

        </section>

      </div>

      {/* ADD ITEM MODAL */}

      {showAddItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div>

                <h2 className="font-bold text-[#12213a]">
                  Add GRN Item
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Add an additional item to this
                  receipt.
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddItem(
                    false
                  )
                }
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <div className="space-y-4 p-6">

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Product Name
                </label>

                <input
                  value={newProduct}
                  onChange={(event) =>
                    setNewProduct(
                      event.target.value
                    )
                  }
                  placeholder="Enter product name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  SKU
                </label>

                <input
                  value={newSku}
                  onChange={(event) =>
                    setNewSku(
                      event.target.value
                    )
                  }
                  placeholder="SKU-XXXX"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Ordered Quantity
                </label>

                <input
                  type="number"
                  min="1"
                  value={newQuantity}
                  onChange={(event) =>
                    setNewQuantity(
                      event.target.value
                    )
                  }
                  placeholder="Quantity"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                />

              </div>

            </div>

            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  setShowAddItem(
                    false
                  )
                }
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  addItem
                }
                className="rounded-lg bg-[#12213a] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1c3152]"
              >
                Add Item
              </button>

            </div>

          </div>

        </div>
      )}

            {/* CONFIRMATION MODAL */}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b px-6 py-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-xl">
                  ✓
                </div>

                <div>

                  <h2 className="text-lg font-bold text-[#12213a]">
                    Confirm Goods Receipt
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Review the receipt before submitting.
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(false)
                }
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            <div className="space-y-5 p-6">

              {/* PO SUMMARY */}

              <div className="rounded-xl bg-gray-50 p-4">

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Purchase Order
                    </p>

                    <p className="mt-1 text-sm font-bold text-[#12213a]">
                      {selectedPO}
                    </p>

                  </div>

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Supplier
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      {supplier}
                    </p>

                  </div>

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Warehouse
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      {warehouse}
                    </p>

                  </div>

                  <div>

                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                      Receipt Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-gray-700">
                      {receiptDate}
                    </p>

                  </div>

                </div>

              </div>

              {/* RECEIPT SUMMARY */}

              <div className="grid grid-cols-3 gap-3">

                <div className="rounded-lg border p-3 text-center">

                  <p className="text-[10px] font-semibold uppercase text-gray-400">
                    Ordered
                  </p>

                  <p className="mt-1 text-xl font-bold text-[#12213a]">
                    {totalOrdered}
                  </p>

                </div>

                <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-center">

                  <p className="text-[10px] font-semibold uppercase text-blue-500">
                    Receiving
                  </p>

                  <p className="mt-1 text-xl font-bold text-blue-700">
                    {totalCurrentReceived}
                  </p>

                </div>

                <div className="rounded-lg border border-orange-100 bg-orange-50 p-3 text-center">

                  <p className="text-[10px] font-semibold uppercase text-orange-500">
                    Remaining
                  </p>

                  <p className="mt-1 text-xl font-bold text-orange-700">
                    {totalRemaining}
                  </p>

                </div>

              </div>

              {/* PARTIAL RECEIPT */}

              {totalRemaining > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                  <div className="flex gap-3">

                    <div className="text-lg">
                      ⚠️
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-amber-800">
                        Partial receipt
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        {totalRemaining} units will remain
                        pending on the purchase order.
                        You can create another GRN when
                        the remaining goods arrive.
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {totalRemaining === 0 && (
                <div className="rounded-xl border border-green-200 bg-green-50 p-4">

                  <div className="flex gap-3">

                    <div className="text-lg">
                      ✅
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-green-800">
                        Full receipt
                      </p>

                      <p className="mt-1 text-xs leading-5 text-green-700">
                        All pending quantities will be
                        received and the purchase order
                        will be marked as fully received.
                      </p>

                    </div>

                  </div>

                </div>
              )}

              {/* WARNING */}

              <div className="rounded-lg border border-gray-200 bg-white p-4">

                <p className="text-xs leading-5 text-gray-500">
                  By submitting this GRN, the received
                  quantities will be recorded against the
                  selected purchase order and inventory
                  quantities will be updated.
                </p>

              </div>

            </div>

            {/* MODAL ACTIONS */}

            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

              <button
                type="button"
                onClick={() =>
                  setShowConfirm(false)
                }
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
              >
                Go Back
              </button>

              <button
                type="button"
                onClick={
                  saveGRN
                }
                className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
              >
                ✓ Confirm & Submit
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}