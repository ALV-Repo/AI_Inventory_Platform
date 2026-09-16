"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type QuotationStatus = "Draft" | "Sent" | "Accepted" | "Expired" | "Converted" | "Rejected";

type QuotationLine = {
  id: string;
  sku: string;
  product: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  amount: number;
};

type Quotation = {
  id: string;
  customer: string;
  phone: string;
  email: string;
  company: string;
  date: string;
  validUntil: string;
  items: number;
  amount: number;
  subtotal: number;
  discount: number;
  tax: number;
  status: QuotationStatus;
  currency: string;
  paymentTerms: string;
  deliveryTerms: string;
  warehouse: string;
  salesperson: string;
  notes: string;
  lines: QuotationLine[];
  createdAt: string;
  convertedOrderId?: string;
};

type Product = {
  sku: string;
  name: string;
  price: number;
  taxRate: number;
  description: string;
};

const products: Product[] = [
  { sku: "SKU-KB-001", name: "Wireless Keyboard", price: 1200, taxRate: 18, description: "Wireless ergonomic keyboard" },
  { sku: "SKU-MIC-001", name: "USB Microphone", price: 2400, taxRate: 18, description: "USB condenser microphone" },
  { sku: "SKU-MOU-001", name: "Gaming Mouse", price: 1500, taxRate: 18, description: "Precision gaming mouse" },
  { sku: "SKU-SPK-001", name: "Bluetooth Speaker", price: 3200, taxRate: 18, description: "Portable Bluetooth speaker" },
  { sku: "SKU-HW-001", name: "Hot Wheels Track Set", price: 4200, taxRate: 12, description: "Hot Wheels track set" },
  { sku: "SKU-HEAD-001", name: "Gaming Headset", price: 3800, taxRate: 18, description: "Noise-isolating gaming headset" },
  { sku: "SKU-PB-001", name: "Power Bank", price: 1800, taxRate: 18, description: "20,000 mAh power bank" },
];

const initialQuotations: Quotation[] = [
  {
    id: "QT-2026-001",
    customer: "Apex Retail Solutions",
    phone: "+91 98765 43210",
    email: "procurement@apexretail.in",
    company: "Apex Retail Solutions",
    date: "21 Aug 2026",
    validUntil: "28 Aug 2026",
    items: 4,
    amount: 68500,
    subtotal: 62000,
    discount: 2000,
    tax: 8500,
    status: "Sent",
    currency: "INR",
    paymentTerms: "Net 30",
    deliveryTerms: "7 working days",
    warehouse: "Hyderabad Central",
    salesperson: "Sales Team",
    notes: "Commercial quotation for retail rollout.",
    lines: [
      { id: "1", sku: "SKU-KB-001", product: "Wireless Keyboard", description: "Wireless ergonomic keyboard", quantity: 20, unitPrice: 1200, discount: 0, taxRate: 18, amount: 28320 },
    ],
    createdAt: "2026-08-21T10:00:00",
  },
  {
    id: "QT-2026-002",
    customer: "Green Valley Stores",
    phone: "+91 91234 56789",
    email: "buying@greenvalley.in",
    company: "Green Valley Stores",
    date: "20 Aug 2026",
    validUntil: "27 Aug 2026",
    items: 2,
    amount: 32000,
    subtotal: 27119,
    discount: 0,
    tax: 4881,
    status: "Accepted",
    currency: "INR",
    paymentTerms: "Net 30",
    deliveryTerms: "5 working days",
    warehouse: "Bengaluru Warehouse",
    salesperson: "Sales Team",
    notes: "Customer accepted the commercial terms.",
    lines: [
      { id: "2", sku: "SKU-MOU-001", product: "Gaming Mouse", description: "Precision gaming mouse", quantity: 10, unitPrice: 1500, discount: 0, taxRate: 18, amount: 17700 },
      { id: "3", sku: "SKU-KB-001", product: "Wireless Keyboard", description: "Wireless ergonomic keyboard", quantity: 8, unitPrice: 1200, discount: 0, taxRate: 18, amount: 11328 },
    ],
    createdAt: "2026-08-20T11:30:00",
  },
  {
    id: "QT-2026-003",
    customer: "Metro Office Supplies",
    phone: "+91 99887 66554",
    email: "purchase@metrooffice.in",
    company: "Metro Office Supplies",
    date: "19 Aug 2026",
    validUntil: "26 Aug 2026",
    items: 6,
    amount: 84500,
    subtotal: 71610,
    discount: 0,
    tax: 12890,
    status: "Draft",
    currency: "INR",
    paymentTerms: "Net 45",
    deliveryTerms: "10 working days",
    warehouse: "Mumbai Distribution Hub",
    salesperson: "Sales Team",
    notes: "",
    lines: [],
    createdAt: "2026-08-19T09:15:00",
  },
  {
    id: "QT-2026-004",
    customer: "Sunrise Electronics",
    phone: "+91 90123 45678",
    email: "orders@sunrise.in",
    company: "Sunrise Electronics",
    date: "17 Aug 2026",
    validUntil: "24 Aug 2026",
    items: 3,
    amount: 45800,
    subtotal: 38814,
    discount: 0,
    tax: 6986,
    status: "Converted",
    currency: "INR",
    paymentTerms: "Net 30",
    deliveryTerms: "7 working days",
    warehouse: "Hyderabad Central",
    salesperson: "Sales Team",
    notes: "Converted to sales order.",
    lines: [],
    createdAt: "2026-08-17T13:00:00",
    convertedOrderId: "SO-2026-041",
  },
  {
    id: "QT-2026-005",
    customer: "City Mart",
    phone: "+91 93456 78901",
    email: "purchase@citymart.in",
    company: "City Mart",
    date: "15 Aug 2026",
    validUntil: "22 Aug 2026",
    items: 5,
    amount: 27500,
    subtotal: 24554,
    discount: 0,
    tax: 2946,
    status: "Expired",
    currency: "INR",
    paymentTerms: "Immediate",
    deliveryTerms: "3 working days",
    warehouse: "Pune Warehouse",
    salesperson: "Sales Team",
    notes: "",
    lines: [],
    createdAt: "2026-08-15T08:00:00",
  },
];

const formatCurrency = (value: number) => `₹${Math.round(value || 0).toLocaleString("en-IN")}`;

const todayLabel = () =>
  new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const dateToLabel = (value: string) => {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const labelToInputDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const y = parsed.getFullYear();
  const m = String(parsed.getMonth() + 1).padStart(2, "0");
  const d = String(parsed.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const statusStyles: Record<QuotationStatus, string> = {
  Draft: "bg-slate-100 text-slate-700 border-slate-200",
  Sent: "bg-blue-50 text-blue-700 border-blue-100",
  Accepted: "bg-emerald-50 text-emerald-700 border-emerald-100",
  Expired: "bg-red-50 text-red-700 border-red-100",
  Converted: "bg-violet-50 text-violet-700 border-violet-100",
  Rejected: "bg-rose-50 text-rose-700 border-rose-100",
};

function StatusBadge({ status }: { status: QuotationStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusStyles[status]}`}>
      {status}
    </span>
  );
}

function emptyLine(product?: Product): QuotationLine {
  return {
    id: crypto.randomUUID(),
    sku: product?.sku || "",
    product: product?.name || "",
    description: product?.description || "",
    quantity: 1,
    unitPrice: product?.price || 0,
    discount: 0,
    taxRate: product?.taxRate || 18,
    amount: product?.price || 0,
  };
}

function calculateLine(line: QuotationLine): QuotationLine {
  const gross = Math.max(0, line.quantity) * Math.max(0, line.unitPrice);
  const discountAmount = gross * Math.min(100, Math.max(0, line.discount)) / 100;
  const taxable = Math.max(0, gross - discountAmount);
  const tax = taxable * Math.max(0, line.taxRate) / 100;
  return { ...line, amount: taxable + tax };
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | QuotationStatus>("All");
  const [warehouseFilter, setWarehouseFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [showSuccess, setShowSuccess] = useState("");
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [customer, setCustomer] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [deliveryTerms, setDeliveryTerms] = useState("7 working days");
  const [warehouse, setWarehouse] = useState("Hyderabad Central");
  const [salesperson, setSalesperson] = useState("Sales Team");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<QuotationLine[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("stockflow-quotations");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setQuotations(parsed);
      }
    } catch {
      // Keep seeded data when stored data is invalid.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("stockflow-quotations", JSON.stringify(quotations));
    } catch {
      // Frontend demo persistence is best effort.
    }
  }, [quotations]);

  useEffect(() => {
    if (!showSuccess) return;
    const timer = window.setTimeout(() => setShowSuccess(""), 3500);
    return () => window.clearTimeout(timer);
  }, [showSuccess]);

  const warehouses = useMemo(() => {
    return ["All", ...Array.from(new Set(quotations.map((q) => q.warehouse).filter(Boolean)))];
  }, [quotations]);

  const filteredQuotations = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quotations.filter((quotation) => {
      const matchesSearch =
        !query ||
        quotation.id.toLowerCase().includes(query) ||
        quotation.customer.toLowerCase().includes(query) ||
        quotation.company.toLowerCase().includes(query) ||
        quotation.phone.toLowerCase().includes(query) ||
        quotation.email.toLowerCase().includes(query);

      const matchesStatus = statusFilter === "All" || quotation.status === statusFilter;
      const matchesWarehouse = warehouseFilter === "All" || quotation.warehouse === warehouseFilter;

      return matchesSearch && matchesStatus && matchesWarehouse;
    });
  }, [quotations, search, statusFilter, warehouseFilter]);

  const metrics = useMemo(() => {
    const totalValue = quotations.reduce((sum, q) => sum + q.amount, 0);
    const acceptedValue = quotations
      .filter((q) => q.status === "Accepted")
      .reduce((sum, q) => sum + q.amount, 0);
    const sentValue = quotations
      .filter((q) => q.status === "Sent")
      .reduce((sum, q) => sum + q.amount, 0);
    const convertedValue = quotations
      .filter((q) => q.status === "Converted")
      .reduce((sum, q) => sum + q.amount, 0);

    return {
      total: quotations.length,
      draft: quotations.filter((q) => q.status === "Draft").length,
      sent: quotations.filter((q) => q.status === "Sent").length,
      accepted: quotations.filter((q) => q.status === "Accepted").length,
      expired: quotations.filter((q) => q.status === "Expired").length,
      converted: quotations.filter((q) => q.status === "Converted").length,
      totalValue,
      acceptedValue,
      sentValue,
      convertedValue,
      conversionRate: quotations.length
        ? (quotations.filter((q) => q.status === "Converted").length / quotations.length) * 100
        : 0,
    };
  }, [quotations]);

  const totals = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => {
      const gross = Math.max(0, line.quantity) * Math.max(0, line.unitPrice);
      return sum + gross;
    }, 0);

    const discount = lines.reduce((sum, line) => {
      const gross = Math.max(0, line.quantity) * Math.max(0, line.unitPrice);
      return sum + gross * Math.min(100, Math.max(0, line.discount)) / 100;
    }, 0);

    const tax = lines.reduce((sum, line) => {
      const gross = Math.max(0, line.quantity) * Math.max(0, line.unitPrice);
      const lineDiscount = gross * Math.min(100, Math.max(0, line.discount)) / 100;
      return sum + Math.max(0, gross - lineDiscount) * Math.max(0, line.taxRate) / 100;
    }, 0);

    return { subtotal, discount, tax, grandTotal: subtotal - discount + tax };
  }, [lines]);

  function resetForm() {
    setCustomer("");
    setCompany("");
    setPhone("");
    setEmail("");
    setValidUntil("");
    setPaymentTerms("Net 30");
    setDeliveryTerms("7 working days");
    setWarehouse("Hyderabad Central");
    setSalesperson("Sales Team");
    setNotes("");
    setLines([]);
    setEditingQuotation(null);
  }

  function openCreate() {
    resetForm();
    setShowCreate(true);
  }

  function openEdit(quotation: Quotation) {
    setCustomer(quotation.customer);
    setCompany(quotation.company);
    setPhone(quotation.phone);
    setEmail(quotation.email);
    setValidUntil(labelToInputDate(quotation.validUntil));
    setPaymentTerms(quotation.paymentTerms);
    setDeliveryTerms(quotation.deliveryTerms);
    setWarehouse(quotation.warehouse);
    setSalesperson(quotation.salesperson);
    setNotes(quotation.notes);
    setLines(quotation.lines.map(calculateLine));
    setEditingQuotation(quotation);
    setSelectedQuotation(null);
    setShowCreate(true);
  }

  function addLine() {
    setLines((current) => [...current, emptyLine()]);
  }

  function updateLine(id: string, patch: Partial<QuotationLine>) {
    setLines((current) =>
      current.map((line) => {
        if (line.id !== id) return line;
        return calculateLine({ ...line, ...patch });
      })
    );
  }

  function selectProduct(id: string, productName: string) {
    const product = products.find((p) => p.name === productName);
    updateLine(id, {
      product: product?.name || "",
      sku: product?.sku || "",
      description: product?.description || "",
      unitPrice: product?.price || 0,
      taxRate: product?.taxRate || 18,
    });
  }

  function removeLine(id: string) {
    setLines((current) => current.filter((line) => line.id !== id));
  }

  function createOrUpdateQuotation(status: QuotationStatus = "Draft") {
    if (!customer.trim()) {
      setShowSuccess("Enter a customer name before saving the quotation.");
      return;
    }

    if (!phone.trim() && !email.trim()) {
      setShowSuccess("Add a phone number or email for the customer.");
      return;
    }

    if (!validUntil) {
      setShowSuccess("Select a quotation validity date.");
      return;
    }

    if (!lines.length) {
      setShowSuccess("Add at least one quotation item.");
      return;
    }

    const cleanLines = lines.map(calculateLine);
    const newId = `QT-2026-${String(quotations.length + 1).padStart(3, "0")}`;

    if (editingQuotation) {
      setQuotations((current) =>
        current.map((quotation) =>
          quotation.id === editingQuotation.id
            ? {
                ...quotation,
                customer: customer.trim(),
                company: company.trim() || customer.trim(),
                phone: phone.trim() || "Not provided",
                email: email.trim() || "Not provided",
                validUntil: dateToLabel(validUntil),
                items: cleanLines.reduce((sum, line) => sum + line.quantity, 0),
                amount: totals.grandTotal,
                subtotal: totals.subtotal,
                discount: totals.discount,
                tax: totals.tax,
                status,
                paymentTerms,
                deliveryTerms,
                warehouse,
                salesperson,
                notes: notes.trim(),
                lines: cleanLines,
              }
            : quotation
        )
      );
      setShowSuccess(`${editingQuotation.id} updated successfully.`);
    } else {
      const newQuotation: Quotation = {
        id: newId,
        customer: customer.trim(),
        company: company.trim() || customer.trim(),
        phone: phone.trim() || "Not provided",
        email: email.trim() || "Not provided",
        date: todayLabel(),
        validUntil: dateToLabel(validUntil),
        items: cleanLines.reduce((sum, line) => sum + line.quantity, 0),
        amount: totals.grandTotal,
        subtotal: totals.subtotal,
        discount: totals.discount,
        tax: totals.tax,
        status,
        currency: "INR",
        paymentTerms,
        deliveryTerms,
        warehouse,
        salesperson,
        notes: notes.trim(),
        lines: cleanLines,
        createdAt: new Date().toISOString(),
      };

      setQuotations((current) => [newQuotation, ...current]);
      setShowSuccess(`${newId} created successfully.`);
    }

    setShowCreate(false);
    resetForm();
  }

  function sendQuotation(quotation: Quotation) {
    setQuotations((current) =>
      current.map((item) =>
        item.id === quotation.id ? { ...item, status: "Sent" } : item
      )
    );
    setSelectedQuotation(null);
    setShowSuccess(`${quotation.id} marked as Sent.`);
  }

  function acceptQuotation(quotation: Quotation) {
    setQuotations((current) =>
      current.map((item) =>
        item.id === quotation.id ? { ...item, status: "Accepted" } : item
      )
    );
    setSelectedQuotation(null);
    setShowSuccess(`${quotation.id} marked as Accepted.`);
  }

  function rejectQuotation(quotation: Quotation) {
    setQuotations((current) =>
      current.map((item) =>
        item.id === quotation.id ? { ...item, status: "Rejected" } : item
      )
    );
    setSelectedQuotation(null);
    setShowSuccess(`${quotation.id} marked as Rejected.`);
  }

  function convertToOrder(quotation: Quotation) {
    const orderId = `SO-2026-${String(Date.now()).slice(-4)}`;

    try {
      const saved = localStorage.getItem("stockflow-sales-orders");
      const existing = saved ? JSON.parse(saved) : [];
      const order = {
        id: orderId,
        quotationId: quotation.id,
        customer: quotation.customer,
        phone: quotation.phone,
        email: quotation.email,
        warehouse: quotation.warehouse,
        status: "Draft",
        amount: quotation.amount,
        subtotal: quotation.subtotal,
        discount: quotation.discount,
        tax: quotation.tax,
        items: quotation.items,
        lines: quotation.lines,
        date: todayLabel(),
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(
        "stockflow-sales-orders",
        JSON.stringify([order, ...(Array.isArray(existing) ? existing : [])])
      );
    } catch {
      // Continue UI workflow even if browser storage is unavailable.
    }

    setQuotations((current) =>
      current.map((item) =>
        item.id === quotation.id
          ? { ...item, status: "Converted", convertedOrderId: orderId }
          : item
      )
    );

    setSelectedQuotation(null);
    setShowSuccess(`${quotation.id} converted to ${orderId}.`);
  }

  function duplicateQuotation(quotation: Quotation) {
    const copy: Quotation = {
      ...quotation,
      id: `QT-2026-${String(quotations.length + 1).padStart(3, "0")}`,
      status: "Draft",
      date: todayLabel(),
      validUntil: quotation.validUntil,
      convertedOrderId: undefined,
      createdAt: new Date().toISOString(),
      lines: quotation.lines.map((line) => ({ ...line, id: crypto.randomUUID() })),
    };

    setQuotations((current) => [copy, ...current]);
    setSelectedQuotation(null);
    setShowSuccess(`${copy.id} created as a draft copy.`);
  }

  function exportCSV() {
    const headers = ["Quotation", "Customer", "Phone", "Date", "Valid Until", "Items", "Subtotal", "Discount", "Tax", "Total", "Status", "Warehouse"];
    const rows = filteredQuotations.map((q) => [
      q.id, q.customer, q.phone, q.date, q.validUntil, q.items,
      q.subtotal, q.discount, q.tax, q.amount, q.status, q.warehouse,
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "stockflow-quotations.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
    setShowSuccess("Quotation CSV exported.");
  }

  const statusOptions: Array<"All" | QuotationStatus> = [
    "All", "Draft", "Sent", "Accepted", "Expired", "Converted", "Rejected",
  ];

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-4 py-5 text-slate-900 md:px-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs">
            <span className="font-semibold text-slate-400">Sales</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="font-semibold text-slate-700">Quotations</span>
          </div>
          <div className="flex gap-2">
            <Link href="/sales/orders" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Sales Orders
            </Link>
            <Link href="/customers" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Customers
            </Link>
          </div>
        </div>

        {showSuccess && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs font-semibold text-indigo-700">
            <span>{showSuccess}</span>
            <button onClick={() => setShowSuccess("")} className="text-lg text-indigo-400">×</button>
          </div>
        )}

        <header className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)] md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">Q</div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Quotations</h1>
                  <p className="mt-1 text-xs text-slate-500">Create, track, negotiate and convert customer quotations into sales orders.</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <button onClick={() => setShowExportMenu((x) => !x)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Export
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
                    <button onClick={exportCSV} className="w-full rounded-lg px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50">Export CSV</button>
                  </div>
                )}
              </div>
              <button onClick={openCreate} className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800">
                + New Quotation
              </button>
            </div>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {[
            ["Total Quotations", metrics.total, "All records", "text-slate-900"],
            ["Draft", metrics.draft, "Work in progress", "text-slate-700"],
            ["Sent", metrics.sent, `${formatCurrency(metrics.sentValue)} value`, "text-blue-600"],
            ["Accepted", metrics.accepted, `${formatCurrency(metrics.acceptedValue)} ready`, "text-emerald-600"],
            ["Total Value", formatCurrency(metrics.totalValue), `${metrics.conversionRate.toFixed(0)}% converted`, "text-indigo-600"],
          ].map(([label, value, sub, color]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</p>
              <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
              <p className="mt-1 text-[11px] text-slate-400">{sub}</p>
            </div>
          ))}
        </section>

        <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          {statusOptions.map((status) => {
            const count = status === "All"
              ? quotations.length
              : quotations.filter((q) => q.status === status).length;

            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-xl px-4 py-2.5 text-xs font-bold ${
                  statusFilter === status ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {status}
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] ${statusFilter === status ? "bg-white/15 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px_auto]">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotation, customer, company, phone or email..."
              className="rounded-xl border border-slate-200 px-4 py-3 text-xs outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
            />
            <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs font-medium outline-none">
              {warehouses.map((w) => <option key={w}>{w}</option>)}
            </select>
            <button
              onClick={() => { setSearch(""); setStatusFilter("All"); setWarehouseFilter("All"); }}
              className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-bold">Quotation Register</h2>
              <p className="mt-1 text-[10px] text-slate-400">Showing {filteredQuotations.length} of {quotations.length} quotations.</p>
            </div>
            <div className="flex gap-4 text-[10px] font-semibold text-slate-400">
              <span>Expired: {metrics.expired}</span>
              <span>Converted: {metrics.converted}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  {["Quotation", "Customer", "Date", "Valid Until", "Items", "Total", "Warehouse", "Status", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-indigo-600">{quotation.id}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{quotation.paymentTerms}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-semibold text-slate-800">{quotation.customer}</p>
                      <p className="mt-1 text-[10px] text-slate-400">{quotation.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">{quotation.date}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">{quotation.validUntil}</td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-700">{quotation.items}</td>
                    <td className="px-5 py-4">
                      <p className="text-xs font-bold text-slate-900">{formatCurrency(quotation.amount)}</p>
                      <p className="mt-1 text-[9px] text-slate-400">Tax {formatCurrency(quotation.tax)}</p>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-600">{quotation.warehouse}</td>
                    <td className="px-5 py-4"><StatusBadge status={quotation.status} /></td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        <button onClick={() => setSelectedQuotation(quotation)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-white">View</button>
                        {(quotation.status === "Draft" || quotation.status === "Rejected") && (
                          <button onClick={() => openEdit(quotation)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-white">Edit</button>
                        )}
                        {quotation.status === "Draft" && (
                          <button onClick={() => sendQuotation(quotation)} className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-[10px] font-bold text-white">Send</button>
                        )}
                        {quotation.status === "Accepted" && (
                          <button onClick={() => convertToOrder(quotation)} className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[10px] font-bold text-white">Convert</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!filteredQuotations.length && (
            <div className="py-16 text-center">
              <p className="text-sm font-bold text-slate-700">No quotations found</p>
              <p className="mt-1 text-xs text-slate-400">Change the search or filters and try again.</p>
            </div>
          )}
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            ["Accepted Value", formatCurrency(metrics.acceptedValue), "Ready for conversion", "text-emerald-600"],
            ["Sent Value", formatCurrency(metrics.sentValue), "Awaiting response", "text-blue-600"],
            ["Converted Value", formatCurrency(metrics.convertedValue), "Linked sales orders", "text-violet-600"],
            ["Expired", metrics.expired, "Requires follow-up", "text-red-600"],
          ].map(([label, value, sub, color]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
              <p className={`mt-2 text-xl font-bold ${color}`}>{value}</p>
              <p className="mt-1 text-[10px] text-slate-400">{sub}</p>
            </div>
          ))}
        </section>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[94vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">{editingQuotation ? `Edit ${editingQuotation.id}` : "New Quotation"}</h2>
                <p className="mt-1 text-xs text-slate-500">Build a customer quotation with line-level pricing, discount and GST.</p>
              </div>
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100">×</button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Customer Name", customer, setCustomer, "Customer / contact name"],
                  ["Company", company, setCompany, "Business name"],
                  ["Phone", phone, setPhone, "+91 XXXXX XXXXX"],
                  ["Email", email, setEmail, "customer@company.com"],
                ].map(([label, value, setter, placeholder]) => (
                  <div key={label as string}>
                    <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">{label as string}</label>
                    <input
                      value={value as string}
                      onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)}
                      placeholder={placeholder as string}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Valid Until</label>
                  <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Payment Terms</label>
                  <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs">
                    {["Immediate", "Net 15", "Net 30", "Net 45", "Net 60", "Net 90"].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Delivery Terms</label>
                  <input value={deliveryTerms} onChange={(e) => setDeliveryTerms(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs" />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Warehouse</label>
                  <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs">
                    {["Hyderabad Central", "Bengaluru Warehouse", "Mumbai Distribution Hub", "Pune Warehouse", "Jaipur Warehouse"].map((x) => <option key={x}>{x}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Salesperson</label>
                  <input value={salesperson} onChange={(e) => setSalesperson(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs" />
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                  <div>
                    <h3 className="text-xs font-bold">Quotation Items</h3>
                    <p className="mt-1 text-[10px] text-slate-400">Add multiple products with quantity, price, discount and GST.</p>
                  </div>
                  <button onClick={addLine} className="rounded-xl bg-slate-900 px-3.5 py-2 text-[10px] font-bold text-white">+ Add Item</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] text-left">
                    <thead className="bg-white">
                      <tr className="border-b border-slate-100">
                        {["Product", "SKU", "Qty", "Unit Price", "Discount %", "GST %", "Line Total", ""].map((h) => (
                          <th key={h} className="px-3 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((line) => (
                        <tr key={line.id} className="border-b border-slate-100">
                          <td className="px-3 py-3">
                            <select value={line.product} onChange={(e) => selectProduct(line.id, e.target.value)} className="w-64 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs">
                              <option value="">Select product</option>
                              {products.map((product) => <option key={product.sku} value={product.name}>{product.name}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-3 text-[10px] font-semibold text-slate-500">{line.sku || "—"}</td>
                          <td className="px-3 py-3">
                            <input type="number" min={1} value={line.quantity} onChange={(e) => updateLine(line.id, { quantity: Math.max(1, Number(e.target.value) || 1) })} className="w-20 rounded-lg border border-slate-200 px-2.5 py-2 text-xs" />
                          </td>
                          <td className="px-3 py-3">
                            <input type="number" min={0} value={line.unitPrice} onChange={(e) => updateLine(line.id, { unitPrice: Math.max(0, Number(e.target.value) || 0) })} className="w-28 rounded-lg border border-slate-200 px-2.5 py-2 text-xs" />
                          </td>
                          <td className="px-3 py-3">
                            <input type="number" min={0} max={100} value={line.discount} onChange={(e) => updateLine(line.id, { discount: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} className="w-24 rounded-lg border border-slate-200 px-2.5 py-2 text-xs" />
                          </td>
                          <td className="px-3 py-3">
                            <input type="number" min={0} max={100} value={line.taxRate} onChange={(e) => updateLine(line.id, { taxRate: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })} className="w-20 rounded-lg border border-slate-200 px-2.5 py-2 text-xs" />
                          </td>
                          <td className="px-3 py-3 text-xs font-bold text-slate-800">{formatCurrency(line.amount)}</td>
                          <td className="px-3 py-3">
                            <button onClick={() => removeLine(line.id)} className="rounded-lg px-2 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50">Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {!lines.length && (
                  <div className="py-10 text-center">
                    <p className="text-xs font-semibold text-slate-600">No quotation items yet</p>
                    <button onClick={addLine} className="mt-2 text-xs font-bold text-indigo-600">Add your first item →</button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Notes / Terms</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={6} placeholder="Commercial notes, warranty, delivery conditions..." className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-xs outline-none focus:border-indigo-400" />
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-semibold">{formatCurrency(totals.subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="font-semibold text-red-500">− {formatCurrency(totals.discount)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">GST / Tax</span><span className="font-semibold">{formatCurrency(totals.tax)}</span></div>
                    <div className="my-2 border-t border-slate-200" />
                    <div className="flex justify-between"><span className="font-bold text-slate-800">Grand Total</span><span className="text-xl font-bold text-indigo-600">{formatCurrency(totals.grandTotal)}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-white px-6 py-4">
              <button onClick={() => { setShowCreate(false); resetForm(); }} className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600">Cancel</button>
              <button onClick={() => createOrUpdateQuotation("Draft")} className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-xs font-bold text-slate-700">Save Draft</button>
              <button onClick={() => createOrUpdateQuotation("Sent")} className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white">{editingQuotation ? "Save & Send" : "Create & Send"}</button>
            </div>
          </div>
        </div>
      )}

      {selectedQuotation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold">{selectedQuotation.id}</h2>
                  <StatusBadge status={selectedQuotation.status} />
                </div>
                <p className="mt-1 text-xs text-slate-500">{selectedQuotation.customer} • Created {selectedQuotation.date}</p>
              </div>
              <button onClick={() => setSelectedQuotation(null)} className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100">×</button>
            </div>

            <div className="space-y-5 p-6">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                {[
                  ["Customer", selectedQuotation.company],
                  ["Contact", selectedQuotation.phone],
                  ["Email", selectedQuotation.email],
                  ["Valid Until", selectedQuotation.validUntil],
                  ["Payment", selectedQuotation.paymentTerms],
                  ["Delivery", selectedQuotation.deliveryTerms],
                  ["Warehouse", selectedQuotation.warehouse],
                  ["Salesperson", selectedQuotation.salesperson],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-3.5">
                    <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full min-w-[750px] text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      {["Product", "SKU", "Qty", "Unit Price", "Discount", "GST", "Amount"].map((h) => (
                        <th key={h} className="px-4 py-3 text-[9px] font-bold uppercase tracking-wide text-slate-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedQuotation.lines.length ? selectedQuotation.lines : [{ id: "fallback", sku: "—", product: `${selectedQuotation.items} quoted items`, description: "", quantity: selectedQuotation.items, unitPrice: selectedQuotation.subtotal / Math.max(1, selectedQuotation.items), discount: 0, taxRate: 18, amount: selectedQuotation.amount }]).map((line) => (
                      <tr key={line.id} className="border-t border-slate-100">
                        <td className="px-4 py-3 text-xs font-semibold text-slate-800">{line.product}</td>
                        <td className="px-4 py-3 text-[10px] text-slate-500">{line.sku}</td>
                        <td className="px-4 py-3 text-xs">{line.quantity}</td>
                        <td className="px-4 py-3 text-xs">{formatCurrency(line.unitPrice)}</td>
                        <td className="px-4 py-3 text-xs">{line.discount}%</td>
                        <td className="px-4 py-3 text-xs">{line.taxRate}%</td>
                        <td className="px-4 py-3 text-xs font-bold">{formatCurrency(line.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_320px]">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Notes</p>
                  <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{selectedQuotation.notes || "No additional notes."}</p>
                  {selectedQuotation.convertedOrderId && (
                    <Link href="/sales/orders" className="mt-3 inline-block text-xs font-bold text-violet-600">
                      Open linked order {selectedQuotation.convertedOrderId} →
                    </Link>
                  )}
                </div>

                <div className="rounded-xl bg-slate-50 p-5">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>{formatCurrency(selectedQuotation.subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="text-red-500">− {formatCurrency(selectedQuotation.discount)}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500">Tax</span><span>{formatCurrency(selectedQuotation.tax)}</span></div>
                    <div className="border-t border-slate-200 pt-3" />
                    <div className="flex justify-between"><span className="font-bold">Total</span><span className="text-lg font-bold text-indigo-600">{formatCurrency(selectedQuotation.amount)}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button onClick={() => duplicateQuotation(selectedQuotation)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600">Duplicate</button>
              {(selectedQuotation.status === "Draft" || selectedQuotation.status === "Rejected") && (
                <button onClick={() => openEdit(selectedQuotation)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600">Edit</button>
              )}
              {selectedQuotation.status === "Draft" && (
                <button onClick={() => sendQuotation(selectedQuotation)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">Mark Sent</button>
              )}
              {selectedQuotation.status === "Sent" && (
                <>
                  <button onClick={() => rejectQuotation(selectedQuotation)} className="rounded-xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600">Reject</button>
                  <button onClick={() => acceptQuotation(selectedQuotation)} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white">Accept</button>
                </>
              )}
              {selectedQuotation.status === "Accepted" && (
                <button onClick={() => convertToOrder(selectedQuotation)} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white">Convert to Sales Order</button>
              )}
              <button onClick={() => setSelectedQuotation(null)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
