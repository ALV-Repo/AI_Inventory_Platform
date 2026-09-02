"use client";

import React, { useMemo, useState } from "react";

type ReturnStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Completed";

type ReturnItem = {
  id: number;
  sku: string;
  product: string;
  receivedQty: number;
  returnQty: number;
  unitPrice: number;
  reason: string;
};

type GRNRecord = {
  id: string;
  po: string;
  supplier: string;
  date: string;
  warehouse: string;
};

const grnRecords: GRNRecord[] = [
  {
    id: "GRN-2026-0042",
    po: "PO-2026-0187",
    supplier: "TechSource Distributors Pvt Ltd",
    date: "22 Aug 2026",
    warehouse: "Hyderabad Central",
  },
  {
    id: "GRN-2026-0041",
    po: "PO-2026-0186",
    supplier: "Metro Electronics India",
    date: "21 Aug 2026",
    warehouse: "Bengaluru Warehouse",
  },
  {
    id: "GRN-2026-0040",
    po: "PO-2026-0185",
    supplier: "Prime Office Supplies",
    date: "20 Aug 2026",
    warehouse: "Mumbai Distribution Hub",
  },
];

const initialItems: ReturnItem[] = [
  {
    id: 1,
    sku: "KB-WL-001",
    product: "Wireless Keyboard",
    receivedQty: 250,
    returnQty: 5,
    unitPrice: 1800,
    reason: "Damaged",
  },
  {
    id: 2,
    sku: "MIC-USB-002",
    product: "USB Microphone",
    receivedQty: 80,
    returnQty: 3,
    unitPrice: 3200,
    reason: "Defective",
  },
  {
    id: 3,
    sku: "MON-24-004",
    product: '24-inch Monitor',
    receivedQty: 120,
    returnQty: 0,
    unitPrice: 14500,
    reason: "Select reason",
  },
  {
    id: 4,
    sku: "MSE-WL-005",
    product: "Wireless Mouse",
    receivedQty: 50,
    returnQty: 2,
    unitPrice: 950,
    reason: "Wrong Item",
  },
];

const returnReasons = [
  "Select reason",
  "Damaged",
  "Defective",
  "Wrong Item",
  "Excess Quantity",
  "Quality Issue",
  "Expired",
  "Other",
];

export default function PurchaseReturnsPage() {
  const [selectedGRN, setSelectedGRN] =
    useState(grnRecords[0].id);

  const [supplier, setSupplier] =
    useState(grnRecords[0].supplier);

  const [warehouse, setWarehouse] =
    useState(grnRecords[0].warehouse);

  const [returnDate, setReturnDate] =
    useState("2026-08-22");

  const [returnReference, setReturnReference] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  const [status, setStatus] =
    useState<ReturnStatus>("Draft");

  const [items, setItems] =
    useState<ReturnItem[]>(initialItems);

  const [showConfirm, setShowConfirm] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [showAddItem, setShowAddItem] =
    useState(false);

  const [newProduct, setNewProduct] =
    useState("");

  const [newSku, setNewSku] =
    useState("");

  const [newReceivedQty, setNewReceivedQty] =
    useState("");

  const [newUnitPrice, setNewUnitPrice] =
    useState("");

  const selectedGRNRecord = useMemo(
    () =>
      grnRecords.find(
        (grn) =>
          grn.id === selectedGRN
      ),
    [selectedGRN]
  );

  const totalReceived = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + item.receivedQty,
        0
      ),
    [items]
  );

  const totalReturnQty = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum + item.returnQty,
        0
      ),
    [items]
  );

  const totalReturnValue = useMemo(
    () =>
      items.reduce(
        (sum, item) =>
          sum +
          item.returnQty *
            item.unitPrice,
        0
      ),
    [items]
  );

  const returnPercentage =
    totalReceived > 0
      ? Math.round(
          (totalReturnQty /
            totalReceived) *
            100
        )
      : 0;

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

  const updateReturnQuantity = (
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
          returnQty:
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

  const updateReason = (
    id: number,
    value: string
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              reason: value,
            }
          : item
      )
    );

    setStatus("Draft");
    setMessage("");
  };

  const updateUnitPrice = (
    id: number,
    value: string
  ) => {
    const price =
      Number(value);

    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              unitPrice:
                Number.isNaN(price)
                  ? 0
                  : Math.max(
                      0,
                      price
                    ),
            }
          : item
      )
    );

    setStatus("Draft");
  };

  const handleGRNChange = (
    grnId: string
  ) => {
    const grn =
      grnRecords.find(
        (item) =>
          item.id === grnId
      );

    setSelectedGRN(grnId);

    if (grn) {
      setSupplier(
        grn.supplier
      );

      setWarehouse(
        grn.warehouse
      );
    }

    setMessage("");
  };

  const setAllReturnQuantity = () => {
    setItems((current) =>
      current.map((item) => ({
        ...item,
        returnQty:
          item.receivedQty,
      }))
    );

    setStatus("Draft");

    setMessage(
      "All received quantities have been selected for return."
    );
  };

  const clearReturnQuantity = () => {
    setItems((current) =>
      current.map((item) => ({
        ...item,
        returnQty: 0,
      }))
    );

    setStatus("Draft");

    setMessage(
      "Return quantities cleared."
    );
  };

  const addItem = () => {
    const received =
      Number(newReceivedQty);

    const price =
      Number(newUnitPrice);

    if (
      !newProduct.trim() ||
      !newSku.trim() ||
      !received ||
      received <= 0 ||
      !price ||
      price <= 0
    ) {
      setMessage(
        "Enter product, SKU, received quantity and valid unit price."
      );

      return;
    }

    const newItem: ReturnItem = {
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
      receivedQty: received,
      returnQty: 0,
      unitPrice: price,
      reason: "Select reason",
    };

    setItems((current) => [
      ...current,
      newItem,
    ]);

    setNewProduct("");
    setNewSku("");
    setNewReceivedQty("");
    setNewUnitPrice("");
    setShowAddItem(false);

    setMessage(
      "Item added to the purchase return."
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
      "Item removed from the return."
    );
  };

  const validateReturn = () => {
    if (!selectedGRN) {
      setMessage(
        "Please select a GRN."
      );

      return false;
    }

    if (!returnDate) {
      setMessage(
        "Please select the return date."
      );

      return false;
    }

    if (items.length === 0) {
      setMessage(
        "Add at least one item."
      );

      return false;
    }

    if (totalReturnQty <= 0) {
      setMessage(
        "Enter at least one return quantity."
      );

      return false;
    }

    const invalidQuantity =
      items.some(
        (item) =>
          item.returnQty >
          item.receivedQty
      );

    if (invalidQuantity) {
      setMessage(
        "Return quantity cannot exceed received quantity."
      );

      return false;
    }

    const missingReason =
      items.some(
        (item) =>
          item.returnQty > 0 &&
          item.reason ===
            "Select reason"
      );

    if (missingReason) {
      setMessage(
        "Please select a return reason for every returned item."
      );

      return false;
    }

    return true;
  };

  const openConfirmation = () => {
    setMessage("");

    if (!validateReturn()) {
      return;
    }

    setShowConfirm(true);
  };

  const saveDraft = () => {
    setStatus("Draft");

    setMessage(
      "Purchase return saved as draft."
    );
  };

  const submitReturn = () => {
    setShowConfirm(false);

    setStatus(
      "Pending Approval"
    );

    setMessage(
      "Purchase return submitted successfully and is pending approval."
    );
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">

      <div className="mx-auto max-w-7xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#12213a] text-sm font-bold text-white">
                RTN
              </div>

              <div>

                <h1 className="text-2xl font-bold text-[#12213a] md:text-3xl">
                  Purchase Return
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Create a supplier return linked
                  to a goods receipt.
                </p>

              </div>

            </div>

          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
              status === "Pending Approval"
                ? "bg-amber-50 text-amber-600"
                : status === "Approved"
                ? "bg-blue-50 text-blue-600"
                : status === "Completed"
                ? "bg-green-50 text-green-600"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            ● {status}
          </span>

        </div>

        {/* SUMMARY CARDS */}

        <div className="mb-6 grid gap-4 md:grid-cols-4">

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Received Units
            </p>

            <p className="mt-2 text-2xl font-bold text-[#12213a]">
              {totalReceived}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              From selected GRN
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Return Units
            </p>

            <p className="mt-2 text-2xl font-bold text-red-500">
              {totalReturnQty}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Units being returned
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Return Value
            </p>

            <p className="mt-2 text-2xl font-bold text-purple-600">
              {formatCurrency(
                totalReturnValue
              )}
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Estimated supplier credit
            </p>

          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Return Ratio
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-500">
              {returnPercentage}%
            </p>

            <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">

              <div
                className="h-full rounded-full bg-orange-500 transition-all"
                style={{
                  width: `${Math.min(
                    100,
                    returnPercentage
                  )}%`,
                }}
              />

            </div>

          </div>

        </div>

        {/* RETURN INFORMATION */}

        <section className="mb-6 rounded-2xl border bg-white shadow-sm">

          <div className="border-b px-6 py-5">

            <h2 className="text-lg font-semibold text-[#12213a]">
              Return Information
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Link this return to an existing
              goods receipt.
            </p>

          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2 lg:grid-cols-4">

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Goods Receipt
              </label>

              <select
                value={selectedGRN}
                onChange={(event) =>
                  handleGRNChange(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {grnRecords.map(
                  (grn) => (
                    <option
                      key={grn.id}
                      value={grn.id}
                    >
                      {grn.id} —{" "}
                      {grn.supplier}
                    </option>
                  )
                )}
              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Purchase Order
              </label>

              <input
                value={
                  selectedGRNRecord?.po ||
                  ""
                }
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-700"
              />

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
                Return Date
              </label>

              <input
                type="date"
                value={returnDate}
                onChange={(event) =>
                  setReturnDate(
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
                Return Reference
              </label>

              <input
                value={
                  returnReference
                }
                onChange={(event) =>
                  setReturnReference(
                    event.target.value
                  )
                }
                placeholder="RET-XXXX"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

            <div className="lg:col-span-2">

              <label className="mb-2 block text-sm font-medium text-gray-700">
                Remarks
              </label>

              <input
                value={remarks}
                onChange={(event) =>
                  setRemarks(
                    event.target.value
                  )
                }
                placeholder="Enter reason or additional remarks"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

            </div>

          </div>

        </section>

        {/* RETURN ITEMS */}

        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">

          <div className="flex flex-col gap-4 border-b px-6 py-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="text-lg font-semibold text-[#12213a]">
                Return Items
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Select the quantities that need to
                be returned to the supplier.
              </p>

            </div>

            <div className="flex flex-wrap gap-2">

              <button
                type="button"
                onClick={
                  setAllReturnQuantity
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Return All
              </button>

              <button
                type="button"
                onClick={
                  clearReturnQuantity
                }
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Clear Returns
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowAddItem(
                    true
                  )
                }
                className="rounded-lg bg-[#12213a] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1c3152]"
              >
                + Add Item
              </button>

            </div>

          </div>

          <div className="border-b border-red-100 bg-red-50 px-6 py-4">

            <div className="flex gap-3">

              <div className="text-lg">
                ↩
              </div>

              <div>

                <p className="text-sm font-semibold text-red-800">
                  Supplier return
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  Return quantities cannot exceed the
                  quantity received against the selected
                  GRN. Returned stock will be removed
                  from available inventory after approval.
                </p>

              </div>

            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left">

              <thead className="border-b bg-gray-50">

                <tr>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Product
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Received
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Return Qty
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Unit Price
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Return Value
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Reason
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y">

                {items.map(
                  (item) => {

                    const invalid =
                      item.returnQty >
                      item.receivedQty;

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
                            {item.receivedQty}
                          </span>

                          <span className="ml-1 text-xs text-gray-400">
                            Units
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <input
                            type="number"
                            min="0"
                            value={
                              item.returnQty
                            }
                            onChange={(event) =>
                              updateReturnQuantity(
                                item.id,
                                event.target
                                  .value
                              )
                            }
                            className={`w-28 rounded-lg border px-3 py-2 text-sm font-semibold outline-none focus:ring-2 ${
                              invalid
                                ? "border-red-300 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-100"
                                : "border-gray-300 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                          />

                          {invalid && (
                            <p className="mt-1 text-[10px] font-medium text-red-600">
                              Exceeds received
                            </p>
                          )}

                        </td>

                        <td className="px-5 py-4">

                          <input
                            type="number"
                            min="0"
                            value={
                              item.unitPrice
                            }
                            onChange={(event) =>
                              updateUnitPrice(
                                item.id,
                                event.target
                                  .value
                              )
                            }
                            className="w-28 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                          />

                        </td>

                        <td className="px-5 py-4">

                          <span className="font-semibold text-purple-600">
                            {formatCurrency(
                              item.returnQty *
                                item.unitPrice
                            )}
                          </span>

                        </td>

                        <td className="px-5 py-4">

                          <select
                            value={
                              item.reason
                            }
                            onChange={(event) =>
                              updateReason(
                                item.id,
                                event.target
                                  .value
                              )
                            }
                            className="w-36 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
                          >
                            {returnReasons.map(
                              (reason) => (
                                <option
                                  key={
                                    reason
                                  }
                                  value={
                                    reason
                                  }
                                >
                                  {reason}
                                </option>
                              )
                            )}
                          </select>

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

          {/* TABLE TOTAL */}

          <div className="grid gap-4 border-t bg-gray-50 px-6 py-5 md:grid-cols-3">

            <div>

              <p className="text-xs text-gray-500">
                Total Received
              </p>

              <p className="mt-1 text-lg font-bold text-gray-800">
                {totalReceived}
              </p>

            </div>

            <div>

              <p className="text-xs text-gray-500">
                Total Return
              </p>

              <p className="mt-1 text-lg font-bold text-red-500">
                {totalReturnQty}
              </p>

            </div>

            <div>

              <p className="text-xs text-gray-500">
                Estimated Credit
              </p>

              <p className="mt-1 text-lg font-bold text-purple-600">
                {formatCurrency(
                  totalReturnValue
                )}
              </p>

            </div>

          </div>

        </section>

        {/* SUBMIT AREA */}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <h2 className="font-semibold text-[#12213a]">
                Submit Purchase Return
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Submit the return for approval before
                stock is adjusted.
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
                className="rounded-lg bg-[#12213a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3152]"
              >
                Submit Return
              </button>

            </div>

          </div>

        </section>

      </div>

              {/* ADD ITEM MODAL */}

        {showAddItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b px-6 py-5">

                <div>
                  <h2 className="text-lg font-bold text-[#12213a]">
                    Add Return Item
                  </h2>

                  <p className="mt-1 text-xs text-gray-500">
                    Add another product received in this GRN.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </button>

              </div>

              <div className="grid gap-4 p-6 md:grid-cols-2">

                <div className="md:col-span-2">

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Product Name
                  </label>

                  <input
                    value={newProduct}
                    onChange={(event) =>
                      setNewProduct(event.target.value)
                    }
                    placeholder="Example: Bluetooth Speaker"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    SKU
                  </label>

                  <input
                    value={newSku}
                    onChange={(event) =>
                      setNewSku(event.target.value)
                    }
                    placeholder="SKU-001"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Received Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={newReceivedQty}
                    onChange={(event) =>
                      setNewReceivedQty(event.target.value)
                    }
                    placeholder="100"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Unit Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={newUnitPrice}
                    onChange={(event) =>
                      setNewUnitPrice(event.target.value)
                    }
                    placeholder="2500"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                </div>

              </div>

              <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-lg bg-[#12213a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3152]"
                >
                  + Add Item
                </button>

              </div>

            </div>

          </div>
        )}

        {/* CONFIRMATION MODAL */}

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-xl">
                    ↩
                  </div>

                  <div>

                    <h2 className="text-lg font-bold text-[#12213a]">
                      Confirm Purchase Return
                    </h2>

                    <p className="mt-1 text-xs text-gray-500">
                      Review the return details before submitting.
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </button>

              </div>

              <div className="space-y-5 p-6">

                {/* RETURN SUMMARY */}

                <div className="rounded-xl bg-gray-50 p-4">

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        GRN
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#12213a]">
                        {selectedGRN}
                      </p>

                    </div>

                    <div>

                      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                        Purchase Order
                      </p>

                      <p className="mt-1 text-sm font-bold text-[#12213a]">
                        {selectedGRNRecord?.po}
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

                  </div>

                </div>

                {/* TOTALS */}

                <div className="grid grid-cols-3 gap-3">

                  <div className="rounded-lg border p-3 text-center">

                    <p className="text-[10px] font-semibold uppercase text-gray-400">
                      Items
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#12213a]">
                      {
                        items.filter(
                          (item) => item.returnQty > 0
                        ).length
                      }
                    </p>

                  </div>

                  <div className="rounded-lg border border-red-100 bg-red-50 p-3 text-center">

                    <p className="text-[10px] font-semibold uppercase text-red-500">
                      Return Units
                    </p>

                    <p className="mt-1 text-xl font-bold text-red-600">
                      {totalReturnQty}
                    </p>

                  </div>

                  <div className="rounded-lg border border-purple-100 bg-purple-50 p-3 text-center">

                    <p className="text-[10px] font-semibold uppercase text-purple-500">
                      Return Value
                    </p>

                    <p className="mt-1 text-xl font-bold text-purple-600">
                      {formatCurrency(totalReturnValue)}
                    </p>

                  </div>

                </div>

                {/* ITEMS TO RETURN */}

                <div>

                  <p className="mb-3 text-sm font-semibold text-gray-700">
                    Items being returned
                  </p>

                  <div className="max-h-48 space-y-2 overflow-y-auto">

                    {items
                      .filter(
                        (item) => item.returnQty > 0
                      )
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border bg-white px-3 py-2.5"
                        >

                          <div>

                            <p className="text-sm font-semibold text-gray-800">
                              {item.product}
                            </p>

                            <p className="text-[11px] text-gray-400">
                              {item.sku} • {item.reason}
                            </p>

                          </div>

                          <div className="text-right">

                            <p className="text-sm font-bold text-red-600">
                              {item.returnQty} units
                            </p>

                            <p className="text-[11px] text-gray-400">
                              {formatCurrency(
                                item.returnQty * item.unitPrice
                              )}
                            </p>

                          </div>

                        </div>
                      ))}

                  </div>

                </div>

                {/* WARNING */}

                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                  <div className="flex gap-3">

                    <div className="text-lg">
                      ⚠️
                    </div>

                    <div>

                      <p className="text-sm font-semibold text-amber-800">
                        Approval required
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-700">
                        This return will be sent for approval.
                        Inventory will not be reduced until the
                        return is approved and processed.
                      </p>

                    </div>

                  </div>

                </div>

                {remarks && (
                  <div className="rounded-lg border bg-gray-50 p-3">

                    <p className="text-[11px] font-semibold uppercase text-gray-400">
                      Remarks
                    </p>

                    <p className="mt-1 text-sm text-gray-700">
                      {remarks}
                    </p>

                  </div>
                )}

              </div>

              {/* CONFIRM ACTIONS */}

              <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">

                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                >
                  Go Back
                </button>

                <button
                  type="button"
                  onClick={submitReturn}
                  className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
                >
                  ↩ Confirm & Submit
                </button>

              </div>

            </div>

          </div>
        )}

      </main>
  );
}