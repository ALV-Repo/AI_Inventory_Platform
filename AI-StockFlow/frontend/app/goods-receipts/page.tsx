"use client";

import React, { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type ReceiptStatus =
  | "Draft"
  | "Pending QC"
  | "Partially Received"
  | "Received"
  | "Rejected";

type QCStatus = "Not Inspected" | "Passed" | "Failed" | "Partial";

type ReceiptItem = {
  id: number;
  sku: string;
  product: string;
  orderedQty: number;
  previouslyReceived: number;
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  unit: string;
  batch: string;
  expiry: string;
  serialNumbers: string;
  qcStatus: QCStatus;
  unitCost: number;
  rejectionReason: string;
};

type PurchaseOrder = {
  id: string;
  supplier: string;
  date: string;
  warehouse: string;
  total: number;
};

type GoodsReceipt = {
  id: string;
  grnNumber: string;
  purchaseOrder: string;
  supplier: string;
  warehouse: string;
  receiptDate: string;
  deliveryNote: string;
  invoiceNumber: string;
  status: ReceiptStatus;
  qcStatus: QCStatus;
  submittedAt: string;
  createdBy: string;
  items: ReceiptItem[];
  totalOrdered: number;
  totalPreviouslyReceived: number;
  totalCurrentReceived: number;
  totalAccepted: number;
  totalRejected: number;
  totalRemaining: number;
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
    acceptedQty: 250,
    rejectedQty: 0,
    unit: "Units",
    batch: "BATCH-0826-A",
    expiry: "",
    serialNumbers: "",
    qcStatus: "Passed",
    unitCost: 850,
    rejectionReason: "",
  },
  {
    id: 2,
    sku: "MIC-USB-002",
    product: "USB Microphone",
    orderedQty: 100,
    previouslyReceived: 0,
    receivedQty: 80,
    acceptedQty: 80,
    rejectedQty: 0,
    unit: "Units",
    batch: "BATCH-0826-B",
    expiry: "",
    serialNumbers: "",
    qcStatus: "Passed",
    unitCost: 1450,
    rejectionReason: "",
  },
  {
    id: 3,
    sku: "MON-24-004",
    product: "24-inch Monitor",
    orderedQty: 120,
    previouslyReceived: 0,
    receivedQty: 120,
    acceptedQty: 120,
    rejectedQty: 0,
    unit: "Units",
    batch: "BATCH-0826-C",
    expiry: "",
    serialNumbers: "",
    qcStatus: "Passed",
    unitCost: 9200,
    rejectionReason: "",
  },
  {
    id: 4,
    sku: "MSE-WL-005",
    product: "Wireless Mouse",
    orderedQty: 150,
    previouslyReceived: 25,
    receivedQty: 50,
    acceptedQty: 50,
    rejectedQty: 0,
    unit: "Units",
    batch: "BATCH-0826-D",
    expiry: "",
    serialNumbers: "",
    qcStatus: "Passed",
    unitCost: 650,
    rejectionReason: "",
  },
];

const defaultHistory: GoodsReceipt[] = [];

const statusClasses: Record<ReceiptStatus, string> = {
  Draft: "bg-gray-100 text-gray-700",
  "Pending QC": "bg-purple-50 text-purple-700",
  "Partially Received": "bg-amber-50 text-amber-700",
  Received: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
};

const qcClasses: Record<QCStatus, string> = {
  "Not Inspected": "bg-gray-100 text-gray-600",
  Passed: "bg-green-50 text-green-700",
  Failed: "bg-red-50 text-red-700",
  Partial: "bg-amber-50 text-amber-700",
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const readJSON = <T,>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key: string, value: unknown) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

const toSafeNumber = (value: unknown, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const normalizeReceiptItem = (
  item: Partial<ReceiptItem>,
  index: number,
): ReceiptItem => {
  const orderedQty = Math.max(0, toSafeNumber(item.orderedQty));
  const previouslyReceived = Math.max(0, toSafeNumber(item.previouslyReceived));
  const receivedQty = Math.max(0, toSafeNumber(item.receivedQty));
  const rawRejected = Math.max(0, toSafeNumber(item.rejectedQty));
  const rawAccepted = Math.max(0, toSafeNumber(item.acceptedQty));

  // Repair old/localStorage records where received > 0 but accepted/rejected
  // were saved as 0 or no longer add up to the received quantity.
  const rejectedQty = Math.min(rawRejected, receivedQty);
  const acceptedQty =
    rawAccepted + rejectedQty === receivedQty
      ? rawAccepted
      : Math.max(0, receivedQty - rejectedQty);

  return {
    id: Number(item.id) || index + 1,
    sku: String(item.sku ?? ""),
    product: String(item.product ?? ""),
    orderedQty,
    previouslyReceived,
    receivedQty,
    acceptedQty,
    rejectedQty,
    unit: String(item.unit ?? "Units"),
    batch: String(item.batch ?? ""),
    expiry: String(item.expiry ?? ""),
    serialNumbers: String(item.serialNumbers ?? ""),
    qcStatus:
      item.qcStatus === "Passed" ||
      item.qcStatus === "Failed" ||
      item.qcStatus === "Partial" ||
      item.qcStatus === "Not Inspected"
        ? item.qcStatus
        : "Not Inspected",
    unitCost: Math.max(0, toSafeNumber(item.unitCost)),
    rejectionReason: String(item.rejectionReason ?? ""),
  };
};

const normalizeReceiptItems = (items: unknown): ReceiptItem[] => {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) =>
    normalizeReceiptItem(
      item && typeof item === "object"
        ? (item as Partial<ReceiptItem>)
        : {},
      index,
    ),
  );
};

const normalizeGoodsReceipt = (
  receipt: Partial<GoodsReceipt>,
  index: number,
): GoodsReceipt => {
  const items = normalizeReceiptItems(receipt.items);

  const status: ReceiptStatus =
    receipt.status === "Pending QC" ||
    receipt.status === "Partially Received" ||
    receipt.status === "Received" ||
    receipt.status === "Rejected"
      ? receipt.status
      : "Draft";

  const qcStatus: QCStatus =
    receipt.qcStatus === "Passed" ||
    receipt.qcStatus === "Failed" ||
    receipt.qcStatus === "Partial"
      ? receipt.qcStatus
      : "Not Inspected";

  return {
    id: String(receipt.id ?? receipt.grnNumber ?? `GRN-${index + 1}`),
    grnNumber: String(receipt.grnNumber ?? receipt.id ?? `GRN-${index + 1}`),
    purchaseOrder: String(receipt.purchaseOrder ?? ""),
    supplier: String(receipt.supplier ?? ""),
    warehouse: String(receipt.warehouse ?? ""),
    receiptDate: String(receipt.receiptDate ?? ""),
    deliveryNote: String(receipt.deliveryNote ?? ""),
    invoiceNumber: String(receipt.invoiceNumber ?? ""),
    status,
    qcStatus,
    submittedAt: String(receipt.submittedAt ?? ""),
    createdBy: String(receipt.createdBy ?? "Current User"),
    items,
    totalOrdered: Number(receipt.totalOrdered) || 0,
    totalPreviouslyReceived: Number(receipt.totalPreviouslyReceived) || 0,
    totalCurrentReceived: Number(receipt.totalCurrentReceived) || 0,
    totalAccepted: Number(receipt.totalAccepted) || 0,
    totalRejected: Number(receipt.totalRejected) || 0,
    totalRemaining: Number(receipt.totalRemaining) || 0,
  };
};

export default function GoodsReceiptsPage() {
  const [selectedPO, setSelectedPO] = useState(purchaseOrders[0].id);
  const [supplier, setSupplier] = useState(purchaseOrders[0].supplier);
  const [warehouse, setWarehouse] = useState(purchaseOrders[0].warehouse);
  const [receiptDate, setReceiptDate] = useState("2026-08-22");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [items, setItems] = useState<ReceiptItem[]>(initialItems);
  const [status, setStatus] = useState<ReceiptStatus>("Draft");
  const [qcStatus, setQcStatus] = useState<QCStatus>("Not Inspected");
  const [grnNumber, setGrnNumber] = useState("");
  const [submittedAt, setSubmittedAt] = useState("");
  const [createdBy, setCreatedBy] = useState("Current User");
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceipt | null>(null);
  const [history, setHistory] = useState<GoodsReceipt[]>(defaultHistory);
  const [search, setSearch] = useState("");
  const [historyStatus, setHistoryStatus] = useState<"All" | ReceiptStatus>("All");
  const [historyWarehouse, setHistoryWarehouse] = useState("All");
  const [newProduct, setNewProduct] = useState("");
  const [newSku, setNewSku] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [newUnitCost, setNewUnitCost] = useState("0");

  useEffect(() => {
    const savedHistory = readJSON<GoodsReceipt[]>(
      "stockflow-goods-receipts",
      [],
    );
    const savedLast = readJSON<Partial<GoodsReceipt> & { grnNumber?: string }>(
      "stockflow-last-grn",
      {},
    );

    const normalizedHistory = savedHistory.map((receipt, index) =>
      normalizeGoodsReceipt(receipt, index),
    );

    setHistory(normalizedHistory);

    if (savedLast.grnNumber) setGrnNumber(String(savedLast.grnNumber));
    if (savedLast.submittedAt) setSubmittedAt(String(savedLast.submittedAt));
    if (savedLast.status) {
      setStatus(
        savedLast.status === "Pending QC" ||
          savedLast.status === "Partially Received" ||
          savedLast.status === "Received" ||
          savedLast.status === "Rejected"
          ? savedLast.status
          : "Draft",
      );
    }

    if (savedLast.items) {
      setItems(normalizeReceiptItems(savedLast.items));
    }

    if (savedLast.purchaseOrder) {
      setSelectedPO(String(savedLast.purchaseOrder));
    }
    if (savedLast.supplier) setSupplier(String(savedLast.supplier));
    if (savedLast.warehouse) setWarehouse(String(savedLast.warehouse));
    if (savedLast.receiptDate) setReceiptDate(String(savedLast.receiptDate));
    if (savedLast.deliveryNote) setDeliveryNote(String(savedLast.deliveryNote));
    if (savedLast.invoiceNumber) setInvoiceNumber(String(savedLast.invoiceNumber));
  }, []);

  const selectedPurchaseOrder = useMemo(
    () => purchaseOrders.find((po) => po.id === selectedPO),
    [selectedPO],
  );

  const totals = useMemo(() => {
    const totalOrdered = items.reduce(
      (sum, item) => sum + (Number(item.orderedQty) || 0),
      0,
    );

    const totalPreviouslyReceived = items.reduce(
      (sum, item) => sum + (Number(item.previouslyReceived) || 0),
      0,
    );

    const totalCurrentReceived = items.reduce(
      (sum, item) => sum + (Number(item.receivedQty) || 0),
      0,
    );

    const totalAccepted = items.reduce(
      (sum, item) => sum + (Number(item.acceptedQty) || 0),
      0,
    );

    const totalRejected = items.reduce(
      (sum, item) => sum + (Number(item.rejectedQty) || 0),
      0,
    );

    const totalRemaining = items.reduce(
      (sum, item) =>
        sum +
        Math.max(
          0,
          (Number(item.orderedQty) || 0) -
            (Number(item.previouslyReceived) || 0) -
            (Number(item.receivedQty) || 0),
        ),
      0,
    );

    const receiptPercentage =
      totalOrdered > 0
        ? Math.min(
            100,
            Math.round(
              ((totalPreviouslyReceived + totalCurrentReceived) /
                totalOrdered) *
                100,
            ),
          )
        : 0;

    const receiptValue = items.reduce(
      (sum, item) =>
        sum +
        (Number(item.acceptedQty) || 0) * (Number(item.unitCost) || 0),
      0,
    );

    return {
      totalOrdered,
      totalPreviouslyReceived,
      totalCurrentReceived,
      totalAccepted,
      totalRejected,
      totalRemaining,
      receiptPercentage,
      receiptValue,
    };
  }, [items]);

  const hasOverReceipt = items.some(
    (item) =>
      item.receivedQty >
      Math.max(0, item.orderedQty - item.previouslyReceived),
  );

  const hasAcceptanceMismatch = items.some(
    (item) => item.acceptedQty + item.rejectedQty !== item.receivedQty,
  );

  const hasQCFailure = items.some((item) => item.qcStatus === "Failed");

  const historyFiltered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return history.filter((receipt) => {
      const matchesSearch =
        !term ||
        receipt.grnNumber.toLowerCase().includes(term) ||
        receipt.purchaseOrder.toLowerCase().includes(term) ||
        receipt.supplier.toLowerCase().includes(term) ||
        receipt.items.some(
          (item) =>
            item.product.toLowerCase().includes(term) ||
            item.sku.toLowerCase().includes(term),
        );
      const matchesStatus =
        historyStatus === "All" || receipt.status === historyStatus;
      const matchesWarehouse =
        historyWarehouse === "All" || receipt.warehouse === historyWarehouse;
      return matchesSearch && matchesStatus && matchesWarehouse;
    });
  }, [history, search, historyStatus, historyWarehouse]);

  const updateItem = (
    id: number,
    patch: Partial<ReceiptItem>,
  ) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
    setStatus("Draft");
    setMessage("");
  };

  const updateReceivedQuantity = (id: number, value: string) => {
    const quantity = Number(value);
    const safeQuantity = Number.isFinite(quantity) ? Math.max(0, quantity) : 0;
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        const pending = Math.max(
          0,
          item.orderedQty - item.previouslyReceived,
        );
        const rejectedQty = Math.min(
          Math.max(0, toSafeNumber(item.rejectedQty)),
          safeQuantity,
        );
        const acceptedQty = Math.max(0, safeQuantity - rejectedQty);

        return {
          ...item,
          receivedQty: safeQuantity,
          acceptedQty,
          rejectedQty,
        };
      }),
    );
    setStatus("Draft");
    setMessage("");
  };

  const updateRejectedQuantity = (id: number, value: string) => {
    const rejected = Math.max(0, Number(value) || 0);
    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item;
        return {
          ...item,
          rejectedQty: Math.min(rejected, item.receivedQty),
          acceptedQty: Math.max(0, item.receivedQty - Math.min(rejected, item.receivedQty)),
          qcStatus: rejected > 0 ? "Partial" : item.qcStatus,
        };
      }),
    );
    setStatus("Draft");
    setMessage("");
  };

  const handlePOChange = (poId: string) => {
    const po = purchaseOrders.find((item) => item.id === poId);
    setSelectedPO(poId);
    if (po) {
      setSupplier(po.supplier);
      setWarehouse(po.warehouse);
    }
    setItems(initialItems.map((item) => ({ ...item })));
    setGrnNumber("");
    setSubmittedAt("");
    setStatus("Draft");
    setQcStatus("Not Inspected");
    setMessage("");
  };

  const setAllPendingQuantity = () => {
    setItems((current) =>
      current.map((item) => {
        const pending = Math.max(
          0,
          item.orderedQty - item.previouslyReceived,
        );
        return {
          ...item,
          receivedQty: pending,
          acceptedQty: pending,
          rejectedQty: 0,
        };
      }),
    );
    setStatus("Draft");
    setMessage("All pending quantities have been filled.");
  };

  const clearReceivedQuantities = () => {
    setItems((current) =>
      current.map((item) => ({
        ...item,
        receivedQty: 0,
        acceptedQty: 0,
        rejectedQty: 0,
      })),
    );
    setStatus("Draft");
    setMessage("Current receipt quantities cleared.");
  };

  const addItem = () => {
    const quantity = Number(newQuantity);
    if (!newProduct.trim() || !newSku.trim() || quantity <= 0) {
      setMessage("Enter a product name, SKU and valid quantity.");
      return;
    }

    const newItem: ReceiptItem = {
      id: Math.max(...items.map((item) => item.id), 0) + 1,
      sku: newSku.trim(),
      product: newProduct.trim(),
      orderedQty: quantity,
      previouslyReceived: 0,
      receivedQty: quantity,
      acceptedQty: quantity,
      rejectedQty: 0,
      unit: "Units",
      batch: "",
      expiry: "",
      serialNumbers: "",
      qcStatus: "Not Inspected",
      unitCost: Number(newUnitCost) || 0,
      rejectionReason: "",
    };

    setItems((current) => [...current, newItem]);
    setNewProduct("");
    setNewSku("");
    setNewQuantity("");
    setNewUnitCost("0");
    setShowAddItem(false);
    setMessage("Item added to the GRN.");
  };

  const removeItem = (id: number) => {
    setItems((current) => current.filter((item) => item.id !== id));
    setMessage("Item removed from the GRN.");
  };

  const validateGRN = () => {
    if (!selectedPO) {
      setMessage("Please select a purchase order.");
      return false;
    }
    if (!receiptDate) {
      setMessage("Please select the receipt date.");
      return false;
    }
    if (items.length === 0) {
      setMessage("Add at least one item to the GRN.");
      return false;
    }
    if (hasOverReceipt) {
      setMessage("Received quantity cannot exceed the pending PO quantity.");
      return false;
    }
    if (totals.totalCurrentReceived <= 0) {
      setMessage("Enter at least one received quantity.");
      return false;
    }
    if (hasAcceptanceMismatch) {
      setMessage("Accepted + rejected quantity must equal received quantity for every item.");
      return false;
    }
    if (items.some((item) => item.rejectedQty > 0 && !item.rejectionReason.trim())) {
      setMessage("Enter a rejection reason for every rejected quantity.");
      return false;
    }
    if (items.some((item) => item.receivedQty > 0 && !item.batch.trim())) {
      setMessage("Batch / lot is required for received items in this GRN.");
      return false;
    }
    return true;
  };

  const appendLedgerEntries = (
    receipt: GoodsReceipt,
    acceptedItems: ReceiptItem[],
  ) => {
    const ledger = readJSON<Record<string, unknown>[]>(
      "inventory-stock-ledger",
      [],
    );

    const now = new Date().toISOString();
    const entries = acceptedItems
      .filter((item) => item.acceptedQty > 0)
      .map((item, index) => ({
        id: `LEDGER-GRN-${Date.now()}-${index}`,
        transactionId: `TXN-${receipt.grnNumber}-${item.sku}`,
        type: "IN",
        transactionType: "IN",
        referenceId: receipt.grnNumber,
        referenceType: "Goods Receipt",
        product: item.product,
        sku: item.sku,
        warehouse: receipt.warehouse,
        quantityBefore: 0,
        quantityChange: item.acceptedQty,
        quantityAfter: item.acceptedQty,
        availableStock: item.acceptedQty,
        user: receipt.createdBy,
        reason: `Goods received against ${receipt.purchaseOrder}`,
        batch: item.batch,
        expiry: item.expiry,
        timestamp: now,
      }));

    writeJSON("inventory-stock-ledger", [...entries, ...ledger]);
  };

  const updateInventory = (receipt: GoodsReceipt) => {
    const products = readJSON<Record<string, unknown>[]>(
      "inventory-products",
      [],
    );
    if (!products.length) return;

    const updated = products.map((product) => {
      const productSku = String(product.sku ?? product.SKU ?? "");
      const matching = receipt.items.find(
        (item) => item.sku.toLowerCase() === productSku.toLowerCase(),
      );
      if (!matching || matching.acceptedQty <= 0) return product;

      const currentOnHand = Number(
        product.onHand ?? product.stock ?? product.quantity ?? 0,
      );
      const currentAvailable = Number(
        product.available ?? product.availableStock ?? currentOnHand,
      );
      return {
        ...product,
        onHand: currentOnHand + matching.acceptedQty,
        stock: currentOnHand + matching.acceptedQty,
        quantity: currentOnHand + matching.acceptedQty,
        available: currentAvailable + matching.acceptedQty,
        availableStock: currentAvailable + matching.acceptedQty,
        lastGoodsReceipt: receipt.grnNumber,
        lastStockUpdate: receipt.submittedAt,
        warehouse: receipt.warehouse,
      };
    });

    writeJSON("inventory-products", updated);
  };

  const saveDraft = () => {
    const draftId = grnNumber || `DRAFT-${Date.now()}`;
    const now = new Date().toLocaleString("en-IN");
    const draft: GoodsReceipt = {
      id: draftId,
      grnNumber: grnNumber || draftId,
      purchaseOrder: selectedPO,
      supplier,
      warehouse,
      receiptDate,
      deliveryNote,
      invoiceNumber,
      status: "Draft",
      qcStatus,
      submittedAt: submittedAt || now,
      createdBy,
      items,
      totalOrdered: totals.totalOrdered,
      totalPreviouslyReceived: totals.totalPreviouslyReceived,
      totalCurrentReceived: totals.totalCurrentReceived,
      totalAccepted: totals.totalAccepted,
      totalRejected: totals.totalRejected,
      totalRemaining: totals.totalRemaining,
    };

    const next = [
      draft,
      ...history.filter((receipt) => receipt.id !== draft.id),
    ];
    setHistory(next);
    writeJSON("stockflow-goods-receipts", next);
    writeJSON("stockflow-last-grn", draft);
    setGrnNumber(draft.grnNumber);
    setSubmittedAt(draft.submittedAt);
    setMessage("GRN saved as draft.");
  };

  const saveGRN = () => {
    setShowConfirm(false);
    if (!validateGRN()) return;

    const nextStatus: ReceiptStatus =
      totals.totalRemaining === 0 ? "Received" : "Partially Received";
    const generatedGRN =
      grnNumber && !grnNumber.startsWith("DRAFT-")
        ? grnNumber
        : `GRN-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const now = new Date().toLocaleString("en-IN");
    const finalQC: QCStatus = hasQCFailure
      ? "Failed"
      : totals.totalRejected > 0
        ? "Partial"
        : items.every((item) => item.qcStatus === "Passed")
          ? "Passed"
          : "Not Inspected";

    const receipt: GoodsReceipt = {
      id: generatedGRN,
      grnNumber: generatedGRN,
      purchaseOrder: selectedPO,
      supplier,
      warehouse,
      receiptDate,
      deliveryNote,
      invoiceNumber,
      status: nextStatus,
      qcStatus: finalQC,
      submittedAt: now,
      createdBy,
      items: items.map((item) => ({ ...item })),
      totalOrdered: totals.totalOrdered,
      totalPreviouslyReceived: totals.totalPreviouslyReceived,
      totalCurrentReceived: totals.totalCurrentReceived,
      totalAccepted: totals.totalAccepted,
      totalRejected: totals.totalRejected,
      totalRemaining: totals.totalRemaining,
    };

    const next = [
      receipt,
      ...history.filter((entry) => entry.purchaseOrder !== selectedPO || entry.grnNumber !== generatedGRN),
    ];

    setHistory(next);
    setStatus(nextStatus);
    setQcStatus(finalQC);
    setGrnNumber(generatedGRN);
    setSubmittedAt(now);
    writeJSON("stockflow-goods-receipts", next);
    writeJSON("stockflow-last-grn", receipt);

    updateInventory(receipt);
    appendLedgerEntries(receipt, receipt.items);

    setMessage(
      totals.totalRemaining === 0
        ? `GRN ${generatedGRN} submitted and inventory updated. Purchase order is fully received.`
        : `GRN ${generatedGRN} submitted and inventory updated. ${totals.totalRemaining} units remain pending.`,
    );
  };

  const openConfirmation = () => {
    setMessage("");
    if (!validateGRN()) return;
    setShowConfirm(true);
  };

  const exportCSV = () => {
    const rows = historyFiltered.flatMap((receipt) =>
      receipt.items.map((item) => ({
        GRN: receipt.grnNumber,
        PO: receipt.purchaseOrder,
        Supplier: receipt.supplier,
        Warehouse: receipt.warehouse,
        ReceiptDate: receipt.receiptDate,
        Status: receipt.status,
        QCStatus: receipt.qcStatus,
        SKU: item.sku,
        Product: item.product,
        OrderedQty: item.orderedQty,
        PreviouslyReceived: item.previouslyReceived,
        ReceivedQty: item.receivedQty,
        AcceptedQty: item.acceptedQty,
        RejectedQty: item.rejectedQty,
        Batch: item.batch,
        Expiry: item.expiry,
        UnitCost: item.unitCost,
      })),
    );

    if (!rows.length) {
      setMessage("There are no receipt records to export.");
      return;
    }

    const headers = Object.keys(rows[0]);
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) =>
            `"${String(row[header as keyof typeof row] ?? "").replaceAll('"', '""')}"`,
          )
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "goods-receipts.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setGrnNumber("");
    setSubmittedAt("");
    setStatus("Draft");
    setQcStatus("Not Inspected");
    setDeliveryNote("");
    setInvoiceNumber("");
    setItems(initialItems.map((item) => ({ ...item })));
    setMessage("New GRN form is ready.");
  };

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
        <div className="mx-auto max-w-[1500px]">
          <header className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#12213a] text-sm font-black text-white shadow-lg">
                  GRN
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-black tracking-tight text-[#12213a] md:text-3xl">
                      Goods Receipt Notes
                    </h1>
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      Inventory Inbound
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Receive goods against purchase orders, capture QC details,
                    update stock and maintain a receipt audit trail.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHistory((value) => !value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                {showHistory ? "Hide History" : "GRN History"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl bg-[#12213a] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1c3152]"
              >
                + New GRN
              </button>
              <span
                className={`rounded-full px-3 py-2 text-xs font-bold ${statusClasses[status]}`}
              >
                ● {status}
              </span>
            </div>
          </header>

          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["PO Units", totals.totalOrdered, "Total ordered"],
              ["Current Receipt", totals.totalCurrentReceived, "Units in this GRN"],
              ["Accepted", totals.totalAccepted, "Stock eligible"],
              ["Rejected", totals.totalRejected, "QC rejected"],
              ["Pending", totals.totalRemaining, "Open after receipt"],
            ].map(([label, value, sub], index) => (
              <div
                key={String(label)}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  {label}
                </p>
                <p
                  className={`mt-2 text-2xl font-black ${
                    index === 4
                      ? "text-orange-500"
                      : index === 3
                        ? "text-red-500"
                        : index === 2
                          ? "text-green-600"
                          : index === 1
                            ? "text-blue-600"
                            : "text-[#12213a]"
                  }`}
                >
                  {value}
                </p>
                <p className="mt-1 text-xs text-gray-500">{sub}</p>
              </div>
            ))}
          </section>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-black text-[#12213a]">Receipt Overview</h2>
                <p className="mt-1 text-xs text-gray-500">
                  {grnNumber || "Unsaved GRN"} · {selectedPO}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${qcClasses[qcStatus]}`}>
                  QC: {qcStatus}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-bold text-gray-600">
                  Value: {formatCurrency(totals.receiptValue)}
                </span>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${totals.receiptPercentage}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-[11px] font-semibold text-gray-500">
              <span>{totals.receiptPercentage}% PO received after this GRN</span>
              <span>{totals.totalRemaining} units pending</span>
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="font-black text-[#12213a]">Receipt Information</h2>
              <p className="mt-1 text-xs text-gray-500">
                Link the GRN to its source purchase order and delivery documents.
              </p>
            </div>

            <div className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Purchase Order
                </span>
                <select
                  value={selectedPO}
                  onChange={(event) => handlePOChange(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                >
                  {purchaseOrders.map((po) => (
                    <option key={po.id} value={po.id}>
                      {po.id} — {po.supplier}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Supplier
                </span>
                <input
                  value={supplier}
                  onChange={(event) => setSupplier(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Warehouse
                </span>
                <input
                  value={warehouse}
                  onChange={(event) => setWarehouse(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Receipt Date
                </span>
                <input
                  type="date"
                  value={receiptDate}
                  onChange={(event) => setReceiptDate(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Delivery Note
                </span>
                <input
                  value={deliveryNote}
                  onChange={(event) => setDeliveryNote(event.target.value)}
                  placeholder="DN-XXXX"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Supplier Invoice
                </span>
                <input
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  placeholder="INV-XXXX"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-500">
                  Receipt Owner
                </span>
                <input
                  value={createdBy}
                  onChange={(event) => setCreatedBy(event.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                />
              </label>

              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  PO Value
                </p>
                <p className="mt-2 text-lg font-black text-[#12213a]">
                  {formatCurrency(selectedPurchaseOrder?.total ?? 0)}
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  {selectedPurchaseOrder?.date ?? "—"} · {warehouse}
                </p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-100 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-black text-[#12213a]">Goods Received & QC</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Record actual receipt quantities, batch/serial traceability and inspection results.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={setAllPendingQuantity}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Receive All Pending
                </button>
                <button
                  type="button"
                  onClick={clearReceivedQuantities}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddItem(true)}
                  className="rounded-xl bg-[#12213a] px-3 py-2 text-xs font-bold text-white hover:bg-[#1c3152]"
                >
                  + Add Item
                </button>
              </div>
            </div>

            {(hasOverReceipt || hasAcceptanceMismatch) && (
              <div className="border-b border-red-100 bg-red-50 px-6 py-4 text-xs font-semibold text-red-700">
                {hasOverReceipt
                  ? "One or more received quantities exceed the pending PO quantity."
                  : "Accepted and rejected quantities must equal the received quantity."}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1750px] text-left">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    {[
                      "Product",
                      "Ordered",
                      "Previously",
                      "Pending",
                      "Receive Now",
                      "Accepted",
                      "Rejected",
                      "Batch / Lot",
                      "Expiry",
                      "Serial Numbers",
                      "QC",
                      "Unit Cost",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-[10px] font-black uppercase tracking-wider text-gray-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const pendingBefore = Math.max(
                      0,
                      item.orderedQty - item.previouslyReceived,
                    );
                    const remaining = Math.max(
                      0,
                      pendingBefore - item.receivedQty,
                    );
                    const over = item.receivedQty > pendingBefore;
                    return (
                      <tr key={item.id} className="align-top hover:bg-gray-50/70">
                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-800">{item.product}</p>
                          <p className="mt-1 text-[11px] font-semibold text-gray-400">
                            {item.sku}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm font-bold text-gray-700">
                          {item.orderedQty} {item.unit}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {item.previouslyReceived}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${pendingBefore === 0 ? "bg-green-50 text-green-700" : "bg-orange-50 text-orange-700"}`}>
                            {pendingBefore}
                          </span>
                          <p className="mt-1 text-[10px] text-gray-400">
                            {remaining} after
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            value={item.receivedQty}
                            onChange={(event) =>
                              updateReceivedQuantity(item.id, event.target.value)
                            }
                            className={`w-24 rounded-lg border px-2.5 py-2 text-sm font-bold outline-none focus:ring-4 ${
                              over
                                ? "border-red-300 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-50"
                                : "border-gray-200 focus:border-blue-500 focus:ring-blue-50"
                            }`}
                          />
                          {over && (
                            <p className="mt-1 text-[9px] font-bold text-red-600">
                              Exceeds pending
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            max={item.receivedQty}
                            value={item.acceptedQty}
                            onChange={(event) =>
                              updateItem(item.id, {
                                acceptedQty: Math.min(
                                  Math.max(0, Number(event.target.value) || 0),
                                  item.receivedQty,
                                ),
                                rejectedQty: Math.max(
                                  0,
                                  item.receivedQty -
                                    Math.min(
                                      Math.max(0, Number(event.target.value) || 0),
                                      item.receivedQty,
                                    ),
                                ),
                              })
                            }
                            className="w-24 rounded-lg border border-gray-200 px-2.5 py-2 text-sm font-bold text-green-700 outline-none focus:border-green-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            max={item.receivedQty}
                            value={item.rejectedQty}
                            onChange={(event) =>
                              updateRejectedQuantity(item.id, event.target.value)
                            }
                            className="w-24 rounded-lg border border-gray-200 px-2.5 py-2 text-sm font-bold text-red-700 outline-none focus:border-red-500"
                          />
                          {item.rejectedQty > 0 && (
                            <input
                              value={item.rejectionReason}
                              onChange={(event) =>
                                updateItem(item.id, {
                                  rejectionReason: event.target.value,
                                })
                              }
                              placeholder="Reason"
                              className="mt-2 w-28 rounded-lg border border-red-100 bg-red-50 px-2 py-1.5 text-[10px] outline-none"
                            />
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <input
                            value={item.batch}
                            onChange={(event) =>
                              updateItem(item.id, { batch: event.target.value })
                            }
                            placeholder="BATCH / LOT"
                            className="w-32 rounded-lg border border-gray-200 px-2.5 py-2 text-xs outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="date"
                            value={item.expiry}
                            onChange={(event) =>
                              updateItem(item.id, { expiry: event.target.value })
                            }
                            className="w-36 rounded-lg border border-gray-200 px-2.5 py-2 text-xs outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <input
                            value={item.serialNumbers}
                            onChange={(event) =>
                              updateItem(item.id, {
                                serialNumbers: event.target.value,
                              })
                            }
                            placeholder="SN001, SN002..."
                            className="w-40 rounded-lg border border-gray-200 px-2.5 py-2 text-xs outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <select
                            value={item.qcStatus}
                            onChange={(event) =>
                              updateItem(item.id, {
                                qcStatus: event.target.value as QCStatus,
                              })
                            }
                            className={`rounded-lg border-0 px-2.5 py-2 text-[11px] font-bold outline-none ${qcClasses[item.qcStatus]}`}
                          >
                            <option>Not Inspected</option>
                            <option>Passed</option>
                            <option>Partial</option>
                            <option>Failed</option>
                          </select>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            min="0"
                            value={item.unitCost}
                            onChange={(event) =>
                              updateItem(item.id, {
                                unitCost: Math.max(0, Number(event.target.value) || 0),
                              })
                            }
                            className="w-28 rounded-lg border border-gray-200 px-2.5 py-2 text-xs font-semibold outline-none focus:border-blue-500"
                          />
                        </td>
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="rounded-lg px-2.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 border-t border-gray-100 bg-gray-50 px-6 py-5 md:grid-cols-5">
              {[
                ["Ordered", totals.totalOrdered],
                ["Previously", totals.totalPreviouslyReceived],
                ["Current", totals.totalCurrentReceived],
                ["Accepted", totals.totalAccepted],
                ["Rejected", totals.totalRejected],
              ].map(([label, value]) => (
                <div key={String(label)}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    {label}
                  </p>
                  <p className="mt-1 text-lg font-black text-[#12213a]">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-black text-[#12213a]">Post Goods Receipt</h2>
                <p className="mt-1 text-xs text-gray-500">
                  Posting records the GRN, adds accepted quantity to inventory and creates inbound stock-ledger entries.
                </p>
                {message && (
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs font-semibold text-blue-700">
                    {message}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={saveDraft}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={openConfirmation}
                  className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700"
                >
                  ✓ Submit GRN
                </button>
              </div>
            </div>
          </section>

          {showHistory && (
            <section className="mt-6 rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="font-black text-[#12213a]">Goods Receipt History</h2>
                    <p className="mt-1 text-xs text-gray-500">
                      Search posted and draft GRNs stored in the frontend ledger.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={exportCSV}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
                  >
                    Export CSV
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search GRN, PO, supplier, SKU..."
                    className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                  <select
                    value={historyStatus}
                    onChange={(event) =>
                      setHistoryStatus(event.target.value as "All" | ReceiptStatus)
                    }
                    className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="All">All statuses</option>
                    <option>Draft</option>
                    <option>Pending QC</option>
                    <option>Partially Received</option>
                    <option>Received</option>
                    <option>Rejected</option>
                  </select>
                  <select
                    value={historyWarehouse}
                    onChange={(event) => setHistoryWarehouse(event.target.value)}
                    className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option>All</option>
                    {[...new Set(purchaseOrders.map((po) => po.warehouse))].map(
                      (value) => (
                        <option key={value}>{value}</option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      {["GRN", "PO", "Supplier", "Warehouse", "Date", "Units", "QC", "Status", "Action"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="px-5 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {historyFiltered.map((receipt) => (
                      <tr key={receipt.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-sm font-black text-[#12213a]">
                          {receipt.grnNumber}
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-600">
                          {receipt.purchaseOrder}
                        </td>
                        <td className="px-5 py-4 text-xs font-semibold text-gray-700">
                          {receipt.supplier}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-600">
                          {receipt.warehouse}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-600">
                          {receipt.receiptDate}
                        </td>
                        <td className="px-5 py-4 text-sm font-bold text-gray-700">
                          {receipt.totalAccepted}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${qcClasses[receipt.qcStatus]}`}>
                            {receipt.qcStatus}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClasses[receipt.status]}`}>
                            {receipt.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedReceipt(receipt)}
                            className="rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!historyFiltered.length && (
                <div className="px-6 py-12 text-center">
                  <p className="font-bold text-gray-700">No GRNs found</p>
                  <p className="mt-1 text-xs text-gray-400">
                    Submitted and saved GRNs will appear here.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>

        {showAddItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <h2 className="font-black text-[#12213a]">Add GRN Item</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Add an additional line to this receipt.
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

              <div className="space-y-4 p-6">
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-gray-600">Product</span>
                  <input
                    value={newProduct}
                    onChange={(event) => setNewProduct(event.target.value)}
                    placeholder="Product name"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </label>
                <label className="block">
                  <span className="mb-2 block text-xs font-bold text-gray-600">SKU</span>
                  <input
                    value={newSku}
                    onChange={(event) => setNewSku(event.target.value)}
                    placeholder="SKU-XXXX"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-gray-600">Quantity</span>
                    <input
                      type="number"
                      min="1"
                      value={newQuantity}
                      onChange={(event) => setNewQuantity(event.target.value)}
                      placeholder="0"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-xs font-bold text-gray-600">Unit Cost</span>
                    <input
                      type="number"
                      min="0"
                      value={newUnitCost}
                      onChange={(event) => setNewUnitCost(event.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowAddItem(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-xl bg-[#12213a] px-5 py-2 text-sm font-bold text-white"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center gap-3 border-b border-gray-100 px-6 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-xl">
                  ✓
                </div>
                <div>
                  <h2 className="font-black text-[#12213a]">Confirm Goods Receipt</h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Verify stock and QC quantities before posting.
                  </p>
                </div>
              </div>

              <div className="space-y-5 p-6">
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 md:grid-cols-4">
                  {[
                    ["PO", selectedPO],
                    ["Supplier", supplier],
                    ["Accepted", String(totals.totalAccepted)],
                    ["Rejected", String(totals.totalRejected)],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        {label}
                      </p>
                      <p className="mt-1 truncate text-sm font-bold text-[#12213a]">
                        {value}
                      </p>
                    </div>
                  ))}
                </div>

                {totals.totalRemaining > 0 ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm font-black text-amber-800">
                      Partial receipt
                    </p>
                    <p className="mt-1 text-xs leading-5 text-amber-700">
                      {totals.totalRemaining} units will remain pending against the purchase order.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-black text-green-800">
                      Full receipt
                    </p>
                    <p className="mt-1 text-xs leading-5 text-green-700">
                      All pending PO quantities will be received.
                    </p>
                  </div>
                )}

                <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-xs font-semibold leading-5 text-blue-700">
                    On confirmation, accepted quantities are added to the
                    frontend inventory store and an inbound stock-ledger record
                    is created for each received SKU.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700"
                >
                  Go Back
                </button>
                <button
                  type="button"
                  onClick={saveGRN}
                  className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-green-700"
                >
                  ✓ Confirm & Post
                </button>
              </div>
            </div>
          </div>
        )}

        {selectedReceipt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-black text-[#12213a]">
                      {selectedReceipt.grnNumber}
                    </h2>
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClasses[selectedReceipt.status]}`}>
                      {selectedReceipt.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {selectedReceipt.purchaseOrder} · {selectedReceipt.supplier} · {selectedReceipt.warehouse}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>

              <div className="max-h-[65vh] overflow-auto p-6">
                <div className="mb-5 grid gap-3 md:grid-cols-4">
                  {[
                    ["Receipt Date", selectedReceipt.receiptDate],
                    ["Submitted", selectedReceipt.submittedAt],
                    ["Accepted", String(selectedReceipt.totalAccepted)],
                    ["Rejected", String(selectedReceipt.totalRejected)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-gray-50 p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        {label}
                      </p>
                      <p className="mt-2 text-sm font-bold text-[#12213a]">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="bg-gray-50">
                      <tr>
                        {["SKU", "Product", "Received", "Accepted", "Rejected", "Batch", "Expiry", "QC"].map(
                          (heading) => (
                            <th
                              key={heading}
                              className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500"
                            >
                              {heading}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedReceipt.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-xs font-bold">{item.sku}</td>
                          <td className="px-4 py-3 text-xs">{item.product}</td>
                          <td className="px-4 py-3 text-xs font-bold">{item.receivedQty}</td>
                          <td className="px-4 py-3 text-xs font-bold text-green-700">{item.acceptedQty}</td>
                          <td className="px-4 py-3 text-xs font-bold text-red-700">{item.rejectedQty}</td>
                          <td className="px-4 py-3 text-xs">{item.batch || "—"}</td>
                          <td className="px-4 py-3 text-xs">{item.expiry || "—"}</td>
                          <td className="px-4 py-3">
                            <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${qcClasses[item.qcStatus]}`}>
                              {item.qcStatus}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end border-t border-gray-100 bg-gray-50 px-6 py-4">
                <button
                  type="button"
                  onClick={() => setSelectedReceipt(null)}
                  className="rounded-xl bg-[#12213a] px-5 py-2.5 text-sm font-bold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </PageLayout>
  );
}
