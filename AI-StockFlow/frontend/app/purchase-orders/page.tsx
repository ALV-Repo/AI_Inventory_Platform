"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import PageLayout from "../../components/layout/PageLayout";

type POStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Sent"
  | "Partially Received"
  | "Received"
  | "Cancelled";

type PaymentStatus = "Paid" | "Unpaid";
type PaymentMode = "Cash" | "Card" | "UPI" | "Bank Transfer" | "Credit";
type NoteType = "Credit Note" | "Debit Note";
type NoteStatus = "Draft" | "Issued" | "Applied" | "Cancelled";

type PurchaseOrderItem = {
  id: string;
  product: string;
  sku: string;
  ordered: number;
  received: number;
  unitPrice: number;
  total: number;
  taxRate?: number;
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
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  status: POStatus;
  notes: string;
  items: PurchaseOrderItem[];
  approvalDate?: string;
  sentDate?: string;
  receivedDate?: string;
  receiptHistory?: ReceiptRecord[];
};

type ReceiptLine = {
  itemId: string;
  product: string;
  sku: string;
  quantity: number;
  rejected: number;
  batchNumber?: string;
  serialNumbers?: string;
  expiryDate?: string;
};

type ReceiptRecord = {
  id: string;
  receiptNumber: string;
  date: string;
  user: string;
  warehouse: string;
  lines: ReceiptLine[];
  notes: string;
};

type PurchaseOrderNote = {
  id: string;
  number: string;
  type: NoteType;
  purchaseOrderId: string;
  supplier: string;
  amount: number;
  reason: string;
  date: string;
  status: NoteStatus;
};

type NewPOItem = {
  id: string;
  product: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
};

type NewPOForm = {
  supplier: string;
  supplierGST: string;
  warehouse: string;
  requester: string;
  expectedDate: string;
  paymentTerms: string;
  paymentStatus: PaymentStatus;
  paymentMode: PaymentMode;
  notes: string;
  items: NewPOItem[];
};

type InventoryProduct = {
  id?: string;
  sku?: string;
  name?: string;
  product?: string;
  stock?: number;
  quantity?: number;
  onHand?: number;
  available?: number;
  reserved?: number;
  warehouse?: string;
};

const PO_KEY = "stockflow-purchase-orders";
const NOTES_KEY = "stockflow-purchase-order-notes";
const LEDGER_KEY = "inventory-stock-ledger";
const INVENTORY_KEY = "inventory-products";
const RECEIPTS_KEY = "stockflow-purchase-receipts";

const warehouses = [
  "Hyderabad Central",
  "Bengaluru Warehouse",
  "Mumbai Distribution Hub",
  "Delhi Store Center",
  "Pune Distribution Center",
  "Chennai Warehouse",
];

const paymentTerms = [
  "15 days",
  "30 days",
  "45 days",
  "60 days",
  "Advance Payment",
];

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
    paymentStatus: "Unpaid",
    paymentMode: "Credit",
    status: "Approved",
    notes: "Created from approved purchase request PR-2026-001.",
    items: [
      {
        id: "1-1",
        product: "Wireless Keyboard",
        sku: "KB-WL-001",
        ordered: 250,
        received: 0,
        unitPrice: 850,
        total: 212500,
        taxRate: 18,
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
    paymentStatus: "Unpaid",
    paymentMode: "Credit",
    status: "Sent",
    notes: "Purchase order sent to supplier.",
    items: [
      {
        id: "2-1",
        product: "USB Microphone",
        sku: "MIC-USB-002",
        ordered: 150,
        received: 0,
        unitPrice: 1250,
        total: 187500,
        taxRate: 18,
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
    paymentStatus: "Unpaid",
    paymentMode: "Bank Transfer",
    status: "Partially Received",
    notes: "Partial shipment received from supplier.",
    items: [
      {
        id: "3-1",
        product: "24-inch Monitor",
        sku: "MON-24-004",
        ordered: 100,
        received: 40,
        unitPrice: 14200,
        total: 1420000,
        taxRate: 18,
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
    paymentStatus: "Unpaid",
    paymentMode: "Credit",
    status: "Draft",
    notes: "Draft purchase order awaiting approval.",
    items: [
      {
        id: "4-1",
        product: "Office Chair",
        sku: "CHA-OFC-003",
        ordered: 80,
        received: 0,
        unitPrice: 5200,
        total: 416000,
        taxRate: 18,
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
    paymentStatus: "Paid",
    paymentMode: "Bank Transfer",
    status: "Received",
    notes: "All ordered quantities received.",
    receivedDate: "15 Sept 2026",
    items: [
      {
        id: "5-1",
        product: "Storage Bins",
        sku: "BIN-ST-005",
        ordered: 120,
        received: 120,
        unitPrice: 680,
        total: 81600,
        taxRate: 18,
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
    paymentStatus: "Unpaid",
    paymentMode: "Credit",
    status: "Cancelled",
    notes: "Order cancelled after budget review.",
    items: [
      {
        id: "6-1",
        product: "Barcode Scanner",
        sku: "SCAN-BAR-006",
        ordered: 25,
        received: 0,
        unitPrice: 3500,
        total: 87500,
        taxRate: 18,
      },
    ],
  },
];

function money(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function getPOValue(po: PurchaseOrder) {
  return po.items.reduce((sum, item) => sum + item.total, 0);
}

function getOrderedUnits(po: PurchaseOrder) {
  return po.items.reduce((sum, item) => sum + item.ordered, 0);
}

function getReceivedUnits(po: PurchaseOrder) {
  return po.items.reduce((sum, item) => sum + item.received, 0);
}

function getPendingUnits(po: PurchaseOrder) {
  return Math.max(0, getOrderedUnits(po) - getReceivedUnits(po));
}

function getStatusClass(status: POStatus) {
  switch (status) {
    case "Approved":
    case "Received":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "Sent":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Partially Received":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Cancelled":
      return "border-red-200 bg-red-50 text-red-700";
    case "Pending Approval":
      return "border-orange-200 bg-orange-50 text-orange-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function todayLabel() {
  return new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function createItem(): NewPOItem {
  return {
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    product: "",
    sku: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 18,
  };
}

function createDefaultForm(): NewPOForm {
  return {
    supplier: "",
    supplierGST: "",
    warehouse: "Hyderabad Central",
    requester: "",
    expectedDate: "",
    paymentTerms: "30 days",
    paymentStatus: "Unpaid",
    paymentMode: "Credit",
    notes: "",
    items: [createItem()],
  };
}

function safeRead<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    if (!value) return fallback;
    const parsed = JSON.parse(value);
    return parsed as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures in the frontend demo.
  }
}

export default function PurchaseOrdersPage() {
  const searchParams = useSearchParams();

  const draftMode = searchParams.get("draft") === "1";
  const draftProductName = searchParams.get("product_name") ?? "";
  const draftSku = searchParams.get("sku") ?? "";
  const draftQuantity = Math.max(
    1,
    Number(searchParams.get("quantity") ?? 1)
  );

  const [purchaseOrders, setPurchaseOrders] =
    useState<PurchaseOrder[]>(initialPurchaseOrders);
  const [purchaseOrderNotes, setPurchaseOrderNotes] = useState<
    PurchaseOrderNote[]
  >([]);
  const [receiptHistory, setReceiptHistory] = useState<ReceiptRecord[]>([]);
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] =
    useState<"All" | POStatus>("All");
  const [warehouseFilter, setWarehouseFilter] =
    useState("All Warehouses");
  const [supplierFilter, setSupplierFilter] =
    useState("All Suppliers");

  const [selectedPO, setSelectedPO] =
    useState<PurchaseOrder | null>(null);
  const [showCreatePO, setShowCreatePO] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptPO, setReceiptPO] = useState<PurchaseOrder | null>(null);
  const [receiptLines, setReceiptLines] = useState<ReceiptLine[]>([]);
  const [receiptNotes, setReceiptNotes] = useState("");
  const [showReceiptHistory, setShowReceiptHistory] = useState(false);

  const [newPO, setNewPO] = useState<NewPOForm>(createDefaultForm());

  const [newNote, setNewNote] = useState<{
    type: NoteType;
    purchaseOrderId: string;
    amount: number;
    reason: string;
    status: NoteStatus;
  }>({
    type: "Credit Note",
    purchaseOrderId: "",
    amount: 0,
    reason: "",
    status: "Draft",
  });

  useEffect(() => {
    const savedOrders = safeRead<PurchaseOrder[]>(
      PO_KEY,
      initialPurchaseOrders
    );
    const savedNotes = safeRead<PurchaseOrderNote[]>(NOTES_KEY, []);
    const savedReceipts = safeRead<ReceiptRecord[]>(RECEIPTS_KEY, []);

    setPurchaseOrders(Array.isArray(savedOrders) ? savedOrders : initialPurchaseOrders);
    setPurchaseOrderNotes(Array.isArray(savedNotes) ? savedNotes : []);
    setReceiptHistory(Array.isArray(savedReceipts) ? savedReceipts : []);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    safeWrite(PO_KEY, purchaseOrders);
    safeWrite(NOTES_KEY, purchaseOrderNotes);
    safeWrite(RECEIPTS_KEY, receiptHistory);
  }, [loaded, purchaseOrders, purchaseOrderNotes, receiptHistory]);

  useEffect(() => {
    if (!draftMode) return;

    setNewPO((current) => ({
      ...current,
      items: [
        {
          ...current.items[0],
          product: draftProductName,
          sku: draftSku,
          quantity: draftQuantity,
        },
      ],
      notes: "Draft PO created from AI Auto Purchase recommendation.",
    }));
    setShowCreatePO(true);
  }, [draftMode, draftProductName, draftSku, draftQuantity]);

  const suppliers = useMemo(
    () => [
      "All Suppliers",
      ...Array.from(
        new Set(purchaseOrders.map((po) => po.supplier))
      ).sort(),
    ],
    [purchaseOrders]
  );

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

      const matchesWarehouse =
        warehouseFilter === "All Warehouses" ||
        po.warehouse === warehouseFilter;

      const matchesSupplier =
        supplierFilter === "All Suppliers" ||
        po.supplier === supplierFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesWarehouse &&
        matchesSupplier
      );
    });
  }, [
    purchaseOrders,
    search,
    activeStatus,
    warehouseFilter,
    supplierFilter,
  ]);

  const metrics = useMemo(() => {
    const active = purchaseOrders.filter(
      (po) => po.status !== "Cancelled"
    );

    return {
      total: purchaseOrders.length,
      pendingApproval: purchaseOrders.filter(
        (po) => po.status === "Pending Approval"
      ).length,
      approved: purchaseOrders.filter(
        (po) => po.status === "Approved"
      ).length,
      sent: purchaseOrders.filter(
        (po) => po.status === "Sent"
      ).length,
      partial: purchaseOrders.filter(
        (po) => po.status === "Partially Received"
      ).length,
      received: purchaseOrders.filter(
        (po) => po.status === "Received"
      ).length,
      draft: purchaseOrders.filter(
        (po) => po.status === "Draft"
      ).length,
      totalValue: active.reduce(
        (sum, po) => sum + getPOValue(po),
        0
      ),
      outstandingValue: active
        .filter(
          (po) =>
            po.status !== "Received"
        )
        .reduce((sum, po) => sum + getPOValue(po), 0),
      orderedUnits: active.reduce(
        (sum, po) => sum + getOrderedUnits(po),
        0
      ),
      receivedUnits: active.reduce(
        (sum, po) => sum + getReceivedUnits(po),
        0
      ),
    };
  }, [purchaseOrders]);

  const newPOTotal = useMemo(
    () =>
      newPO.items.reduce(
        (sum, item) => sum + item.quantity * item.unitPrice,
        0
      ),
    [newPO.items]
  );

  function updatePOStatus(id: string, status: POStatus) {
    const date = todayLabel();

    setPurchaseOrders((current) =>
      current.map((po) =>
        po.id === id
          ? {
              ...po,
              status,
              approvalDate:
                status === "Approved" ? date : po.approvalDate,
              sentDate: status === "Sent" ? date : po.sentDate,
            }
          : po
      )
    );

    setSelectedPO((current) =>
      current?.id === id
        ? {
            ...current,
            status,
            approvalDate:
              status === "Approved"
                ? date
                : current.approvalDate,
            sentDate:
              status === "Sent"
                ? date
                : current.sentDate,
          }
        : current
    );
  }

  function handleCancelPO(id: string) {
    if (
      !window.confirm(
        "Are you sure you want to cancel this purchase order?"
      )
    ) {
      return;
    }

    updatePOStatus(id, "Cancelled");
  }

  function resetNewPO() {
    setNewPO(createDefaultForm());
  }

  function addPOItem() {
    setNewPO((current) => ({
      ...current,
      items: [...current.items, createItem()],
    }));
  }

  function removePOItem(id: string) {
    setNewPO((current) => ({
      ...current,
      items:
        current.items.length <= 1
          ? current.items
          : current.items.filter((item) => item.id !== id),
    }));
  }

  function updatePOItem(
    id: string,
    patch: Partial<NewPOItem>
  ) {
    setNewPO((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, ...patch } : item
      ),
    }));
  }

  function handleCreatePO() {
    const invalidItem = newPO.items.find(
      (item) =>
        !item.product.trim() ||
        !item.sku.trim() ||
        item.quantity <= 0 ||
        item.unitPrice <= 0
    );

    if (
      !newPO.supplier.trim() ||
      !newPO.requester.trim() ||
      !newPO.expectedDate ||
      invalidItem
    ) {
      window.alert(
        "Please complete supplier, requester, expected date and all order item fields."
      );
      return;
    }

    const existingSKUs = new Set(
      purchaseOrders.flatMap((po) =>
        po.items.map((item) => item.sku.trim().toLowerCase())
      )
    );

    const duplicateItem = newPO.items.find(
      (item, index, array) =>
        array.findIndex(
          (other) =>
            other.sku.trim().toLowerCase() ===
            item.sku.trim().toLowerCase()
        ) !== index
    );

    if (duplicateItem) {
      window.alert(
        `Duplicate SKU ${duplicateItem.sku} exists in this purchase order.`
      );
      return;
    }

    const inventoryProducts = safeRead<InventoryProduct[]>(
      INVENTORY_KEY,
      []
    );

    for (const item of newPO.items) {
      const inventoryProduct = inventoryProducts.find(
        (product) =>
          String(product.sku ?? "")
            .trim()
            .toLowerCase() === item.sku.trim().toLowerCase()
      );

      const moq = Math.max(
        Number((inventoryProduct as { moq?: number } | undefined)?.moq ?? 1),
        1
      );

      if (item.quantity < moq) {
        window.alert(
          `Minimum Order Quantity (MOQ) for ${item.product} is ${moq}.`
        );
        return;
      }
    }

    const nextNumber =
      Math.max(
        0,
        ...purchaseOrders.map((po) => {
          const match = po.number.match(/(\d+)$/);
          return match ? Number(match[1]) : 0;
        })
      ) + 1;

    const newPurchaseOrder: PurchaseOrder = {
      id: `po-${Date.now()}`,
      number: `PO-202609-${String(nextNumber).padStart(5, "0")}`,
      supplier: newPO.supplier.trim(),
      supplierGST:
        newPO.supplierGST.trim() || "GSTIN-PENDING",
      warehouse: newPO.warehouse,
      requester: newPO.requester.trim(),
      orderDate: todayLabel(),
      expectedDate: new Date(
        `${newPO.expectedDate}T00:00:00`
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      paymentTerms: newPO.paymentTerms,
      paymentStatus: newPO.paymentStatus,
      paymentMode: newPO.paymentMode,
      status: "Draft",
      notes:
        newPO.notes.trim() ||
        "Purchase order created manually.",
      items: newPO.items.map((item) => ({
        id: item.id,
        product: item.product.trim(),
        sku: item.sku.trim(),
        ordered: item.quantity,
        received: 0,
        unitPrice: item.unitPrice,
        total: item.quantity * item.unitPrice,
        taxRate: item.taxRate,
      })),
    };

    if (
      newPurchaseOrder.items.some((item) =>
        existingSKUs.has(item.sku.toLowerCase())
      )
    ) {
      // Existing SKUs are valid: POs can contain products already present
      // in Inventory. This branch intentionally does not block creation.
    }

    setPurchaseOrders((current) => [
      newPurchaseOrder,
      ...current,
    ]);
    setShowCreatePO(false);
    resetNewPO();
  }

  function openReceipt(po: PurchaseOrder) {
    const lines: ReceiptLine[] = po.items
      .map((item) => ({
        itemId: item.id,
        product: item.product,
        sku: item.sku,
        quantity: Math.max(0, item.ordered - item.received),
        rejected: 0,
        batchNumber: "",
        serialNumbers: "",
        expiryDate: "",
      }))
      .filter((line) => line.quantity > 0);

    if (lines.length === 0) {
      window.alert("There are no pending quantities to receive.");
      return;
    }

    setReceiptPO(po);
    setReceiptLines(lines);
    setReceiptNotes("");
    setShowReceipt(true);
  }

  function updateReceiptLine(
    itemId: string,
    patch: Partial<ReceiptLine>
  ) {
    setReceiptLines((current) =>
      current.map((line) =>
        line.itemId === itemId
          ? { ...line, ...patch }
          : line
      )
    );
  }

  function appendLedgerEntry(entry: Record<string, unknown>) {
    const existing = safeRead<Record<string, unknown>[]>(
      LEDGER_KEY,
      []
    );

    safeWrite(LEDGER_KEY, [
      {
        ...entry,
        id:
          entry.id ??
          `LEDGER-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        source: "Purchase Orders",
        user: "Current User",
      },
      ...existing,
    ]);
  }

  function receiveInventory(
    po: PurchaseOrder,
    line: ReceiptLine
  ) {
    const accepted = Math.max(
      0,
      Math.floor(Number(line.quantity) || 0)
    );

    if (accepted <= 0) return;

    const products = safeRead<InventoryProduct[]>(
      INVENTORY_KEY,
      []
    );

    if (!Array.isArray(products)) return;

    const index = products.findIndex(
      (product) =>
        String(product.sku ?? "")
          .trim()
          .toLowerCase() === line.sku.trim().toLowerCase()
    );

    if (index < 0) {
      return;
    }

    const product = products[index];
    const before = Number(
      product.onHand ??
        product.stock ??
        product.quantity ??
        0
    );

    const after = before + accepted;

    products[index] = {
      ...product,
      onHand: after,
      stock: after,
      quantity: after,
      available:
        Number(product.available ?? before) + accepted,
      warehouse: po.warehouse,
    };

    safeWrite(INVENTORY_KEY, products);

    appendLedgerEntry({
      product: line.product,
      sku: line.sku,
      warehouse: po.warehouse,
      movementType: "STOCK IN",
      quantity: accepted,
      stockBefore: before,
      stockAfter: after,
      availableBefore: Number(
        product.available ?? before
      ),
      availableAfter:
        Number(product.available ?? before) + accepted,
      reason: "Purchase order goods receipt",
      reference: receiptPO?.number ?? po.number,
    });
  }

  function handleReceiveGoods() {
    if (!receiptPO) return;

    if (
      receiptLines.some(
        (line) =>
          Number(line.quantity) < 0 ||
          Number(line.rejected) < 0 ||
          Number(line.quantity) + Number(line.rejected) >
            Math.max(
              0,
              receiptPO.items.find(
                (item) => item.id === line.itemId
              )?.ordered ?? 0
            )
      )
    ) {
      window.alert(
        "Receipt quantities cannot exceed the outstanding purchase quantity."
      );
      return;
    }

    const acceptedLines = receiptLines.filter(
      (line) => Number(line.quantity) > 0
    );

    if (acceptedLines.length === 0) {
      window.alert("Enter at least one accepted quantity.");
      return;
    }

    const receiptNumber = `GRN-202609-${String(
      receiptHistory.length + 1
    ).padStart(5, "0")}`;

    const receipt: ReceiptRecord = {
      id: `grn-${Date.now()}`,
      receiptNumber,
      date: todayLabel(),
      user: "Current User",
      warehouse: receiptPO.warehouse,
      lines: receiptLines.map((line) => ({
        ...line,
        quantity: Number(line.quantity) || 0,
        rejected: Number(line.rejected) || 0,
      })),
      notes: receiptNotes.trim(),
    };

    setPurchaseOrders((current) =>
      current.map((po) => {
        if (po.id !== receiptPO.id) return po;

        const updatedItems = po.items.map((item) => {
          const receivedLine = receiptLines.find(
            (line) => line.itemId === item.id
          );

          if (!receivedLine) return item;

          const accepted = Math.max(
            0,
            Number(receivedLine.quantity) || 0
          );

          return {
            ...item,
            received: Math.min(
              item.ordered,
              item.received + accepted
            ),
          };
        });

        const ordered = updatedItems.reduce(
          (sum, item) => sum + item.ordered,
          0
        );
        const received = updatedItems.reduce(
          (sum, item) => sum + item.received,
          0
        );

        const nextStatus: POStatus =
          received >= ordered
            ? "Received"
            : "Partially Received";

        return {
          ...po,
          items: updatedItems,
          status: nextStatus,
          receivedDate:
            nextStatus === "Received"
              ? todayLabel()
              : po.receivedDate,
          receiptHistory: [
            ...(po.receiptHistory ?? []),
            receipt,
          ],
        };
      })
    );

    receiptLines.forEach((line) =>
      receiveInventory(receiptPO, line)
    );

    setReceiptHistory((current) => [
      receipt,
      ...current,
    ]);

    const updatedPO = {
      ...receiptPO,
      status:
        receiptLines.reduce(
          (sum, line) => sum + Number(line.quantity || 0),
          0
        ) >= getPendingUnits(receiptPO)
          ? "Received"
          : "Partially Received",
    } as PurchaseOrder;

    setSelectedPO(updatedPO);
    setShowReceipt(false);
    setReceiptPO(null);
    setReceiptLines([]);
    setReceiptNotes("");
  }

  function handleCreateNote() {
    if (
      !newNote.purchaseOrderId ||
      newNote.amount <= 0 ||
      !newNote.reason.trim()
    ) {
      window.alert(
        "Please select a purchase order, enter a valid amount and provide a reason."
      );
      return;
    }

    const selectedOrder = purchaseOrders.find(
      (po) => po.id === newNote.purchaseOrderId
    );

    if (!selectedOrder) {
      window.alert("Selected purchase order was not found.");
      return;
    }

    const nextNumber = purchaseOrderNotes.length + 1;

    const note: PurchaseOrderNote = {
      id: `note-${Date.now()}`,
      number: `${
        newNote.type === "Credit Note" ? "CN" : "DN"
      }-202609-${String(nextNumber).padStart(5, "0")}`,
      type: newNote.type,
      purchaseOrderId: selectedOrder.id,
      supplier: selectedOrder.supplier,
      amount: newNote.amount,
      reason: newNote.reason.trim(),
      date: todayLabel(),
      status: newNote.status,
    };

    setPurchaseOrderNotes((current) => [
      note,
      ...current,
    ]);

    setNewNote({
      type: "Credit Note",
      purchaseOrderId: "",
      amount: 0,
      reason: "",
      status: "Draft",
    });
    setShowNoteForm(false);
  }

  function exportPOs() {
    const headers = [
      "PO Number",
      "Supplier",
      "Supplier GST",
      "Warehouse",
      "Requester",
      "Order Date",
      "Expected Date",
      "Items",
      "Ordered Units",
      "Received Units",
      "Pending Units",
      "Value",
      "Payment Status",
      "Payment Mode",
      "Status",
    ];

    const escape = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = filteredOrders.map((po) => [
      po.number,
      po.supplier,
      po.supplierGST,
      po.warehouse,
      po.requester,
      po.orderDate,
      po.expectedDate,
      po.items.length,
      getOrderedUnits(po),
      getReceivedUnits(po),
      getPendingUnits(po),
      getPOValue(po),
      po.paymentStatus,
      po.paymentMode,
      po.status,
    ]);

    const csv = [
      headers.map(escape).join(","),
      ...rows.map((row) => row.map(escape).join(",")),
    ].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `purchase-orders-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  function clearFilters() {
    setSearch("");
    setActiveStatus("All");
    setWarehouseFilter("All Warehouses");
    setSupplierFilter("All Suppliers");
  }

  return (
    <PageLayout>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-[0_12px_45px_rgba(15,23,42,0.07)]">
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 px-5 py-6 text-white sm:px-7">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-blue-100">
                    Procurement Control Center
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                    Purchase Orders
                  </h1>
                  <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-300">
                    Create, approve, send and receive purchase orders
                    with supplier, payment, receipt and audit visibility.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={exportPOs}
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNoteForm(true)}
                    className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15"
                  >
                    Credit / Debit Note
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreatePO(true)}
                    className="rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-lg transition hover:-translate-y-0.5"
                  >
                    + New Purchase Order
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-slate-100 sm:grid-cols-4">
              <KPI label="Total Orders" value={metrics.total} />
              <KPI
                label="Pending Approval"
                value={metrics.pendingApproval}
                valueClass="text-orange-600"
              />
              <KPI
                label="Active Value"
                value={money(metrics.totalValue)}
                valueClass="text-emerald-600"
              />
              <KPI
                label="Outstanding"
                value={money(metrics.outstandingValue)}
                valueClass="text-blue-600"
              />
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <MiniMetric
              label="Draft"
              value={metrics.draft}
              helper="Awaiting submission"
            />
            <MiniMetric
              label="Approved / Sent"
              value={metrics.approved + metrics.sent}
              helper={`${metrics.approved} approved · ${metrics.sent} sent`}
            />
            <MiniMetric
              label="Receipt Progress"
              value={`${metrics.receivedUnits.toLocaleString("en-IN")} / ${metrics.orderedUnits.toLocaleString("en-IN")}`}
              helper={`${metrics.partial} partial receipts`}
            />
            <MiniMetric
              label="Received"
              value={metrics.received}
              helper="Completed POs"
            />
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
            <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Purchase Order Workspace
                </h2>
                <p className="mt-1 text-[10px] text-slate-400">
                  Filter procurement records by status, supplier and warehouse.
                </p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="w-fit rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-100"
              >
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search PO, supplier, product, SKU..."
                className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs outline-none transition focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />

              <select
                value={warehouseFilter}
                onChange={(event) =>
                  setWarehouseFilter(event.target.value)
                }
                className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 focus:bg-white"
              >
                <option>All Warehouses</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse}>{warehouse}</option>
                ))}
              </select>

              <select
                value={supplierFilter}
                onChange={(event) =>
                  setSupplierFilter(event.target.value)
                }
                className="rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs outline-none focus:border-blue-400 focus:bg-white"
              >
                {suppliers.map((supplier) => (
                  <option key={supplier}>{supplier}</option>
                ))}
              </select>

              <div className="flex items-center gap-2 overflow-x-auto">
                {statusTabs.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setActiveStatus(status)}
                    className={`whitespace-nowrap rounded-xl border px-3 py-2.5 text-[10px] font-bold transition ${
                      activeStatus === status
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
            <div className="flex flex-col gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Purchase Orders
                </h2>
                <p className="mt-1 text-[10px] text-slate-400">
                  Showing {filteredOrders.length} of {purchaseOrders.length} records
                </p>
              </div>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600">
                {purchaseOrderNotes.length} procurement notes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1500px] w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {[
                      "PO Number",
                      "Supplier",
                      "Warehouse",
                      "Dates",
                      "Items",
                      "Receipt Progress",
                      "Value",
                      "Payment",
                      "Status",
                      "Actions",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-4 py-3.5 text-[9px] font-bold uppercase tracking-[0.09em] text-slate-500"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((po) => {
                    const ordered = getOrderedUnits(po);
                    const received = getReceivedUnits(po);
                    const pending = getPendingUnits(po);
                    const progress =
                      ordered > 0
                        ? Math.min(
                            100,
                            Math.round((received / ordered) * 100)
                          )
                        : 0;

                    return (
                      <tr
                        key={po.id}
                        className="border-b border-slate-100 transition hover:bg-blue-50/30"
                      >
                        <td className="px-4 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedPO(po)}
                            className="font-bold text-blue-700 hover:underline"
                          >
                            {po.number}
                          </button>
                          <p className="mt-1 text-[9px] text-slate-400">
                            {po.requester}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-semibold text-slate-800">
                            {po.supplier}
                          </p>
                          <p className="mt-1 font-mono text-[9px] text-slate-400">
                            {po.supplierGST}
                          </p>
                        </td>

                        <td className="px-4 py-4 font-medium text-slate-600">
                          {po.warehouse}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-700">
                            {po.orderDate}
                          </p>
                          <p className="mt-1 text-[9px] text-slate-400">
                            Due {po.expectedDate}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-bold text-slate-700">
                            {po.items.length}
                          </p>
                          <p className="mt-1 text-[9px] text-slate-400">
                            {ordered.toLocaleString("en-IN")} units
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <div className="min-w-[170px]">
                            <div className="flex items-center justify-between text-[9px] font-semibold">
                              <span className="text-slate-500">
                                {received} received
                              </span>
                              <span className="text-blue-600">
                                {progress}%
                              </span>
                            </div>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-blue-600 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="mt-1 text-[9px] text-slate-400">
                              {pending} pending
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4 text-right font-bold text-slate-800">
                          {money(getPOValue(po))}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                              po.paymentStatus === "Paid"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {po.paymentStatus}
                          </span>
                          <p className="mt-1 text-[9px] text-slate-400">
                            {po.paymentMode}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[9px] font-bold ${getStatusClass(
                              po.status
                            )}`}
                          >
                            {po.status}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedPO(po)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-bold text-slate-600 hover:bg-slate-50"
                            >
                              View
                            </button>

                            {po.status === "Draft" && (
                              <button
                                type="button"
                                onClick={() =>
                                  updatePOStatus(
                                    po.id,
                                    "Pending Approval"
                                  )
                                }
                                className="rounded-lg bg-orange-500 px-2.5 py-1.5 text-[9px] font-bold text-white hover:bg-orange-600"
                              >
                                Submit
                              </button>
                            )}

                            {po.status === "Pending Approval" && (
                              <button
                                type="button"
                                onClick={() =>
                                  updatePOStatus(
                                    po.id,
                                    "Approved"
                                  )
                                }
                                className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[9px] font-bold text-white hover:bg-emerald-700"
                              >
                                Approve
                              </button>
                            )}

                            {po.status === "Approved" && (
                              <button
                                type="button"
                                onClick={() =>
                                  updatePOStatus(
                                    po.id,
                                    "Sent"
                                  )
                                }
                                className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-[9px] font-bold text-white hover:bg-blue-700"
                              >
                                Send
                              </button>
                            )}

                            {(po.status === "Sent" ||
                              po.status === "Partially Received") && (
                              <button
                                type="button"
                                onClick={() => openReceipt(po)}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[9px] font-bold text-white hover:bg-emerald-700"
                              >
                                Receive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredOrders.length === 0 && (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-6 py-16 text-center"
                      >
                        <p className="text-sm font-bold text-slate-700">
                          No purchase orders found
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Try changing the search or filters.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Goods Receipt History
                </h2>
                <p className="mt-1 text-[10px] text-slate-400">
                  Receipt records created from purchase order receiving.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowReceiptHistory((value) => !value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-100"
              >
                {showReceiptHistory ? "Hide History" : "View History"}
              </button>
            </div>

            {showReceiptHistory && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase text-slate-500">
                        Receipt
                      </th>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase text-slate-500">
                        Date
                      </th>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase text-slate-500">
                        Warehouse
                      </th>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase text-slate-500">
                        Lines
                      </th>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase text-slate-500">
                        Accepted
                      </th>
                      <th className="px-5 py-3 text-[9px] font-bold uppercase text-slate-500">
                        User
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptHistory.map((receipt) => (
                      <tr
                        key={receipt.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-5 py-3 font-bold text-blue-700">
                          {receipt.receiptNumber}
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {receipt.date}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {receipt.warehouse}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {receipt.lines.length}
                        </td>
                        <td className="px-5 py-3 font-semibold text-emerald-600">
                          {receipt.lines.reduce(
                            (sum, line) =>
                              sum + Number(line.quantity || 0),
                            0
                          )}
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {receipt.user}
                        </td>
                      </tr>
                    ))}
                    {receiptHistory.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-xs text-slate-400"
                        >
                          No goods receipts recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Credit / Debit Notes
                </h2>
                <p className="mt-1 text-[10px] text-slate-400">
                  Supplier financial adjustments linked to purchase orders.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-600">
                {purchaseOrderNotes.length} Notes
              </span>
            </div>

            <div className="overflow-x-auto">
              {purchaseOrderNotes.length > 0 ? (
                <table className="w-full min-w-[900px] text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Number",
                        "Type",
                        "PO",
                        "Supplier",
                        "Amount",
                        "Reason",
                        "Date",
                        "Status",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-5 py-3 text-[9px] font-bold uppercase text-slate-500"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseOrderNotes.map((note) => (
                      <tr
                        key={note.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >
                        <td className="px-5 py-3 font-bold text-blue-700">
                          {note.number}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[9px] font-bold ${
                              note.type === "Credit Note"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            {note.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-700">
                          {purchaseOrders.find(
                            (po) =>
                              po.id === note.purchaseOrderId
                          )?.number ?? note.purchaseOrderId}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {note.supplier}
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-800">
                          {money(note.amount)}
                        </td>
                        <td className="max-w-[240px] px-5 py-3 text-slate-600">
                          {note.reason}
                        </td>
                        <td className="px-5 py-3 text-slate-500">
                          {note.date}
                        </td>
                        <td className="px-5 py-3 text-slate-600">
                          {note.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="px-5 py-10 text-center text-xs text-slate-400">
                  No credit or debit notes yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      {selectedPO && (
        <Modal
          title={selectedPO.number}
          eyebrow="Purchase Order Detail"
          onClose={() => setSelectedPO(null)}
          maxWidth="max-w-5xl"
        >
          <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-5 md:grid-cols-4">
            <Info label="Supplier" value={selectedPO.supplier} />
            <Info label="GSTIN" value={selectedPO.supplierGST} mono />
            <Info label="Warehouse" value={selectedPO.warehouse} />
            <Info label="Requester" value={selectedPO.requester} />
            <Info label="Order Date" value={selectedPO.orderDate} />
            <Info label="Expected" value={selectedPO.expectedDate} />
            <Info label="Payment Terms" value={selectedPO.paymentTerms} />
            <Info label="Payment" value={`${selectedPO.paymentStatus} · ${selectedPO.paymentMode}`} />
          </div>

          <div className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Order Items
                </h3>
                <p className="mt-1 text-[10px] text-slate-400">
                  Ordered, received and outstanding quantities.
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-[9px] font-bold ${getStatusClass(
                  selectedPO.status
                )}`}
              >
                {selectedPO.status}
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Product",
                        "SKU",
                        "Ordered",
                        "Received",
                        "Pending",
                        "Unit Price",
                        "Total",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-[9px] font-bold uppercase text-slate-500"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {selectedPO.items.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {item.product}
                        </td>
                        <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                          {item.sku}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700">
                          {item.ordered}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-600">
                          {item.received}
                        </td>
                        <td className="px-4 py-3 font-semibold text-orange-600">
                          {Math.max(
                            0,
                            item.ordered - item.received
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {money(item.unitPrice)}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {money(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Summary label="Ordered" value={getOrderedUnits(selectedPO)} />
              <Summary label="Received" value={getReceivedUnits(selectedPO)} />
              <Summary label="Pending" value={getPendingUnits(selectedPO)} />
              <Summary label="Order Value" value={money(getPOValue(selectedPO))} />
            </div>

            {selectedPO.notes && (
              <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">
                  Notes
                </p>
                <p className="mt-1.5 text-xs leading-5 text-slate-600">
                  {selectedPO.notes}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
            {selectedPO.status === "Draft" && (
              <ActionButton
                label="Submit for Approval"
                tone="orange"
                onClick={() =>
                  updatePOStatus(
                    selectedPO.id,
                    "Pending Approval"
                  )
                }
              />
            )}

            {selectedPO.status === "Pending Approval" && (
              <ActionButton
                label="Approve PO"
                tone="green"
                onClick={() =>
                  updatePOStatus(
                    selectedPO.id,
                    "Approved"
                  )
                }
              />
            )}

            {selectedPO.status === "Approved" && (
              <ActionButton
                label="Send to Supplier"
                tone="blue"
                onClick={() =>
                  updatePOStatus(selectedPO.id, "Sent")
                }
              />
            )}

            {(selectedPO.status === "Sent" ||
              selectedPO.status === "Partially Received") && (
              <ActionButton
                label="Receive Goods"
                tone="green"
                onClick={() => openReceipt(selectedPO)}
              />
            )}

            {selectedPO.status !== "Received" &&
              selectedPO.status !== "Cancelled" && (
                <button
                  type="button"
                  onClick={() =>
                    handleCancelPO(selectedPO.id)
                  }
                  className="rounded-lg border border-red-200 bg-white px-4 py-2 text-[10px] font-bold text-red-600 hover:bg-red-50"
                >
                  Cancel PO
                </button>
              )}

            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
            >
              Print PO
            </button>

            <button
              type="button"
              onClick={() => setSelectedPO(null)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
          </div>
        </Modal>
      )}

      {showCreatePO && (
        <Modal
          title="Create Purchase Order"
          eyebrow="Procurement"
          onClose={() => {
            setShowCreatePO(false);
            resetNewPO();
          }}
          maxWidth="max-w-4xl"
        >
          <div className="max-h-[72vh] overflow-y-auto p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Supplier *">
                <input
                  value={newPO.supplier}
                  onChange={(event) =>
                    setNewPO((current) => ({
                      ...current,
                      supplier: event.target.value,
                    }))
                  }
                  placeholder="Supplier name"
                  className={inputClass}
                />
              </Field>

              <Field label="Supplier GSTIN">
                <input
                  value={newPO.supplierGST}
                  onChange={(event) =>
                    setNewPO((current) => ({
                      ...current,
                      supplierGST: event.target.value,
                    }))
                  }
                  placeholder="GSTIN"
                  className={inputClass}
                />
              </Field>

              <Field label="Warehouse *">
                <select
                  value={newPO.warehouse}
                  onChange={(event) =>
                    setNewPO((current) => ({
                      ...current,
                      warehouse: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  {warehouses.map((warehouse) => (
                    <option key={warehouse}>{warehouse}</option>
                  ))}
                </select>
              </Field>

              <Field label="Requester *">
                <input
                  value={newPO.requester}
                  onChange={(event) =>
                    setNewPO((current) => ({
                      ...current,
                      requester: event.target.value,
                    }))
                  }
                  placeholder="Team / department"
                  className={inputClass}
                />
              </Field>

              <Field label="Expected Date *">
                <input
                  type="date"
                  value={newPO.expectedDate}
                  onChange={(event) =>
                    setNewPO((current) => ({
                      ...current,
                      expectedDate: event.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </Field>

              <Field label="Payment Terms">
                <select
                  value={newPO.paymentTerms}
                  onChange={(event) =>
                    setNewPO((current) => ({
                      ...current,
                      paymentTerms: event.target.value,
                    }))
                  }
                  className={inputClass}
                >
                  {paymentTerms.map((term) => (
                    <option key={term}>{term}</option>
                  ))}
                </select>
              </Field>

              <Field label="Payment Status">
                <select
                  value={newPO.paymentStatus}
                  onChange={(event) =>
                    setNewPO((current) => ({
                      ...current,
                      paymentStatus:
                        event.target.value as PaymentStatus,
                    }))
                  }
                  className={inputClass}
                >
                  <option>Unpaid</option>
                  <option>Paid</option>
                </select>
              </Field>

              <Field label="Payment Mode">
                <select
                  value={newPO.paymentMode}
                  onChange={(event) =>
                    setNewPO((current) => ({
                      ...current,
                      paymentMode:
                        event.target.value as PaymentMode,
                    }))
                  }
                  className={inputClass}
                >
                  <option>Cash</option>
                  <option>Card</option>
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Credit</option>
                </select>
              </Field>
            </div>

            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Order Items
                  </h3>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Add multiple SKUs to one purchase order.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPOItem}
                  className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-[10px] font-bold text-blue-700 hover:bg-blue-100"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                {newPO.items.map((item, index) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Item {index + 1}
                      </span>
                      {newPO.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePOItem(item.id)}
                          className="text-[9px] font-bold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                      <Field label="Product *">
                        <input
                          value={item.product}
                          onChange={(event) =>
                            updatePOItem(item.id, {
                              product: event.target.value,
                            })
                          }
                          placeholder="Product"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="SKU *">
                        <input
                          value={item.sku}
                          onChange={(event) =>
                            updatePOItem(item.id, {
                              sku: event.target.value,
                            })
                          }
                          placeholder="SKU-001"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Quantity *">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) =>
                            updatePOItem(item.id, {
                              quantity: Math.max(
                                0,
                                Number(event.target.value)
                              ),
                            })
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Unit Price *">
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(event) =>
                            updatePOItem(item.id, {
                              unitPrice: Math.max(
                                0,
                                Number(event.target.value)
                              ),
                            })
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="GST Rate">
                        <select
                          value={item.taxRate}
                          onChange={(event) =>
                            updatePOItem(item.id, {
                              taxRate: Number(
                                event.target.value
                              ),
                            })
                          }
                          className={inputClass}
                        >
                          <option value={0}>0%</option>
                          <option value={5}>5%</option>
                          <option value={12}>12%</option>
                          <option value={18}>18%</option>
                          <option value={28}>28%</option>
                        </select>
                      </Field>
                    </div>

                    <div className="mt-3 flex justify-end">
                      <p className="text-xs font-bold text-slate-700">
                        Line Total:{" "}
                        {money(
                          item.quantity * item.unitPrice
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Field label="Notes">
              <textarea
                value={newPO.notes}
                onChange={(event) =>
                  setNewPO((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                rows={3}
                placeholder="Procurement notes..."
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">
                    Purchase Order Estimate
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {newPO.items.length} line item(s)
                  </p>
                </div>
                <p className="text-xl font-bold text-blue-700">
                  {money(newPOTotal)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
            <button
              type="button"
              onClick={() => {
                setShowCreatePO(false);
                resetNewPO();
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-bold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreatePO}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-[10px] font-bold text-white hover:bg-slate-800"
            >
              Create Purchase Order
            </button>
          </div>
        </Modal>
      )}

      {showReceipt && receiptPO && (
        <Modal
          title={`Receive Goods · ${receiptPO.number}`}
          eyebrow="Goods Receipt Note"
          onClose={() => {
            setShowReceipt(false);
            setReceiptPO(null);
          }}
          maxWidth="max-w-5xl"
        >
          <div className="border-b border-slate-100 bg-emerald-50/50 px-5 py-4">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Info label="Supplier" value={receiptPO.supplier} />
              <Info label="Warehouse" value={receiptPO.warehouse} />
              <Info
                label="Pending Units"
                value={String(getPendingUnits(receiptPO))}
              />
              <Info
                label="Expected"
                value={receiptPO.expectedDate}
              />
            </div>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-5">
            <div className="space-y-3">
              {receiptLines.map((line) => {
                const poItem = receiptPO.items.find(
                  (item) => item.id === line.itemId
                );
                const outstanding = poItem
                  ? Math.max(
                      0,
                      poItem.ordered - poItem.received
                    )
                  : 0;

                return (
                  <div
                    key={line.itemId}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {line.product}
                        </p>
                        <p className="mt-1 font-mono text-[9px] text-slate-400">
                          {line.sku}
                        </p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-bold text-slate-600">
                        Outstanding {outstanding}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                      <Field label="Accepted Qty">
                        <input
                          type="number"
                          min={0}
                          max={outstanding}
                          value={line.quantity}
                          onChange={(event) =>
                            updateReceiptLine(line.itemId, {
                              quantity: Math.min(
                                outstanding,
                                Math.max(
                                  0,
                                  Number(
                                    event.target.value
                                  )
                                )
                              ),
                            })
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Rejected Qty">
                        <input
                          type="number"
                          min={0}
                          max={outstanding}
                          value={line.rejected}
                          onChange={(event) =>
                            updateReceiptLine(line.itemId, {
                              rejected: Math.min(
                                outstanding,
                                Math.max(
                                  0,
                                  Number(
                                    event.target.value
                                  )
                                )
                              ),
                            })
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Batch Number">
                        <input
                          value={line.batchNumber ?? ""}
                          onChange={(event) =>
                            updateReceiptLine(line.itemId, {
                              batchNumber:
                                event.target.value,
                            })
                          }
                          placeholder="Optional batch"
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Expiry Date">
                        <input
                          type="date"
                          value={line.expiryDate ?? ""}
                          onChange={(event) =>
                            updateReceiptLine(line.itemId, {
                              expiryDate:
                                event.target.value,
                            })
                          }
                          className={inputClass}
                        />
                      </Field>

                      <Field label="Serial Numbers">
                        <input
                          value={line.serialNumbers ?? ""}
                          onChange={(event) =>
                            updateReceiptLine(line.itemId, {
                              serialNumbers:
                                event.target.value,
                            })
                          }
                          placeholder="Comma-separated"
                          className={inputClass}
                        />
                      </Field>
                    </div>
                  </div>
                );
              })}
            </div>

            <Field label="Receipt Notes">
              <textarea
                value={receiptNotes}
                onChange={(event) =>
                  setReceiptNotes(event.target.value)
                }
                rows={3}
                placeholder="Condition, supplier invoice, inspection notes..."
                className={`${inputClass} resize-none`}
              />
            </Field>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-[10px] leading-5 text-amber-700">
              Accepted quantities are added to the local Inventory product
              stock and a STOCK IN record is appended to the Stock Ledger.
              Batch/serial values are captured in this frontend receipt
              record; server-side enforcement requires backend integration.
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
            <button
              type="button"
              onClick={() => {
                setShowReceipt(false);
                setReceiptPO(null);
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleReceiveGoods}
              className="rounded-lg bg-emerald-600 px-4 py-2.5 text-[10px] font-bold text-white hover:bg-emerald-700"
            >
              Confirm Goods Receipt
            </button>
          </div>
        </Modal>
      )}

      {showNoteForm && (
        <Modal
          title="Credit / Debit Note"
          eyebrow="Supplier Adjustment"
          onClose={() => setShowNoteForm(false)}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 p-5">
            <Field label="Note Type">
              <select
                value={newNote.type}
                onChange={(event) =>
                  setNewNote((current) => ({
                    ...current,
                    type: event.target.value as NoteType,
                  }))
                }
                className={inputClass}
              >
                <option>Credit Note</option>
                <option>Debit Note</option>
              </select>
            </Field>

            <Field label="Purchase Order">
              <select
                value={newNote.purchaseOrderId}
                onChange={(event) =>
                  setNewNote((current) => ({
                    ...current,
                    purchaseOrderId:
                      event.target.value,
                  }))
                }
                className={inputClass}
              >
                <option value="">Select purchase order</option>
                {purchaseOrders.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.number} — {po.supplier}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Amount">
              <input
                type="number"
                min={0}
                step="0.01"
                value={newNote.amount || ""}
                onChange={(event) =>
                  setNewNote((current) => ({
                    ...current,
                    amount: Math.max(
                      0,
                      Number(event.target.value)
                    ),
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Reason">
              <textarea
                value={newNote.reason}
                onChange={(event) =>
                  setNewNote((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="Reason for supplier adjustment"
              />
            </Field>

            <Field label="Status">
              <select
                value={newNote.status}
                onChange={(event) =>
                  setNewNote((current) => ({
                    ...current,
                    status: event.target.value as NoteStatus,
                  }))
                }
                className={inputClass}
              >
                <option>Draft</option>
                <option>Issued</option>
                <option>Applied</option>
                <option>Cancelled</option>
              </select>
            </Field>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4">
            <button
              type="button"
              onClick={() => setShowNoteForm(false)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-[10px] font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateNote}
              className="rounded-lg bg-slate-900 px-4 py-2.5 text-[10px] font-bold text-white"
            >
              Create Note
            </button>
          </div>
        </Modal>
      )}
    </PageLayout>
  );
}

function KPI({
  label,
  value,
  valueClass = "text-slate-900",
}: {
  label: string;
  value: string | number;
  valueClass?: string;
}) {
  return (
    <div className="p-4 sm:p-5">
      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
        {label}
      </p>
      <p className={`mt-2 text-xl font-bold tracking-tight ${valueClass}`}>
        {typeof value === "number"
          ? value.toLocaleString("en-IN")
          : value}
      </p>
    </div>
  );
}

function MiniMetric({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_6px_22px_rgba(15,23,42,0.04)]">
      <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-bold text-slate-800">
        {typeof value === "number"
          ? value.toLocaleString("en-IN")
          : value}
      </p>
      <p className="mt-1 text-[9px] text-slate-400">{helper}</p>
    </div>
  );
}

function Summary({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[9px] font-bold uppercase text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-800">
        {typeof value === "number"
          ? value.toLocaleString("en-IN")
          : value}
      </p>
    </div>
  );
}

function Info({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
      <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
        {label}
      </p>
      <p
        className={`mt-1.5 break-words text-[11px] font-semibold text-slate-700 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[9px] font-bold uppercase tracking-[0.08em] text-slate-500">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10";

function Modal({
  title,
  eyebrow,
  onClose,
  children,
  maxWidth = "max-w-2xl",
}: {
  title: string;
  eyebrow: string;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={`w-full ${maxWidth} overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.22)]`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30 px-5 py-4">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-blue-600">
              {eyebrow}
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ActionButton({
  label,
  tone,
  onClick,
}: {
  label: string;
  tone: "blue" | "green" | "orange";
  onClick: () => void;
}) {
  const classes = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-emerald-600 hover:bg-emerald-700",
    orange: "bg-orange-500 hover:bg-orange-600",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg px-4 py-2 text-[10px] font-bold text-white ${classes[tone]}`}
    >
      {label}
    </button>
  );
}
