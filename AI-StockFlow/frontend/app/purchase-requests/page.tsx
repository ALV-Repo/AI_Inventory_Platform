"use client";

import { useEffect, useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type RequestStatus = "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Converted";
type RequestPriority = "High" | "Medium" | "Low";

type RequestItem = {
  id: string;
  product: string;
  sku: string;
  quantity: number;
  estimatedUnitPrice: number;
  estimatedValue: number;
  uom: string;
  notes?: string;
};

type ApprovalEvent = {
  id: string;
  action: "Created" | "Submitted" | "Approved" | "Rejected" | "Converted" | "Edited";
  actor: string;
  timestamp: string;
  comment?: string;
};

type PurchaseRequest = {
  id: string;
  requestNumber: string;
  items: RequestItem[];
  priority: RequestPriority;
  requester: string;
  department: string;
  warehouse: string;
  supplier: string;
  supplierGSTIN?: string;
  date: string;
  requiredBy: string;
  status: RequestStatus;
  justification: string;
  budgetCode: string;
  estimatedValue: number;
  approvalLimit: number;
  convertedPO?: string;
  approvalHistory: ApprovalEvent[];
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "stockflow-purchase-requests";
const PO_STORAGE_KEY = "stockflow-purchase-orders";

const seedRequests: PurchaseRequest[] = [
  {
    id: "pr-1",
    requestNumber: "PR-2026-001",
    items: [
      { id: "i1", product: "Wireless Keyboard", sku: "KB-WL-001", quantity: 250, estimatedUnitPrice: 850, estimatedValue: 212500, uom: "Nos" },
    ],
    priority: "High", requester: "Inventory Team", department: "Operations",
    warehouse: "Hyderabad Central", supplier: "Tech Supplies India", supplierGSTIN: "36ABCDE1234F1Z5",
    date: "2026-08-25", requiredBy: "2026-09-30", status: "Pending Approval",
    justification: "Replenishment against forecast demand and reorder level.",
    budgetCode: "OPS-INV-2026", estimatedValue: 212500, approvalLimit: 500000,
    createdAt: "2026-08-25T09:00:00.000Z", updatedAt: "2026-08-25T09:30:00.000Z",
    approvalHistory: [
      { id: "a1", action: "Created", actor: "Inventory Team", timestamp: "2026-08-25T09:00:00.000Z" },
      { id: "a2", action: "Submitted", actor: "Inventory Team", timestamp: "2026-08-25T09:30:00.000Z" },
    ],
  },
  {
    id: "pr-2",
    requestNumber: "PR-2026-002",
    items: [
      { id: "i2", product: "USB Microphone", sku: "MIC-USB-002", quantity: 150, estimatedUnitPrice: 1250, estimatedValue: 187500, uom: "Nos" },
    ],
    priority: "High", requester: "Sales Team", department: "Sales",
    warehouse: "Bengaluru Warehouse", supplier: "Digital World", date: "2026-08-24",
    requiredBy: "2026-10-05", status: "Pending Approval",
    justification: "Additional stock required for upcoming sales demand.",
    budgetCode: "SALES-2026", estimatedValue: 187500, approvalLimit: 500000,
    createdAt: "2026-08-24T09:00:00.000Z", updatedAt: "2026-08-24T10:00:00.000Z",
    approvalHistory: [
      { id: "a3", action: "Created", actor: "Sales Team", timestamp: "2026-08-24T09:00:00.000Z" },
      { id: "a4", action: "Submitted", actor: "Sales Team", timestamp: "2026-08-24T10:00:00.000Z" },
    ],
  },
  {
    id: "pr-3",
    requestNumber: "PR-2026-003",
    items: [
      { id: "i3", product: "24-inch Monitor", sku: "MON-24-004", quantity: 100, estimatedUnitPrice: 14200, estimatedValue: 1420000, uom: "Nos" },
    ],
    priority: "Medium", requester: "IT Department", department: "Information Technology",
    warehouse: "Hyderabad Central", supplier: "Office Mart", date: "2026-08-22",
    requiredBy: "2026-10-15", status: "Approved",
    justification: "Workstation refresh and replacement of aging displays.",
    budgetCode: "IT-CAPEX-2026", estimatedValue: 1420000, approvalLimit: 2000000,
    createdAt: "2026-08-22T09:00:00.000Z", updatedAt: "2026-08-23T11:00:00.000Z",
    approvalHistory: [
      { id: "a5", action: "Created", actor: "IT Department", timestamp: "2026-08-22T09:00:00.000Z" },
      { id: "a6", action: "Submitted", actor: "IT Department", timestamp: "2026-08-22T11:00:00.000Z" },
      { id: "a7", action: "Approved", actor: "Procurement Manager", timestamp: "2026-08-23T11:00:00.000Z", comment: "Approved within IT CAPEX budget." },
    ],
  },
  {
    id: "pr-4",
    requestNumber: "PR-2026-004",
    items: [
      { id: "i4", product: "Office Chair", sku: "CHA-OFC-003", quantity: 80, estimatedUnitPrice: 5200, estimatedValue: 416000, uom: "Nos" },
    ],
    priority: "Medium", requester: "Administration", department: "HR & Admin",
    warehouse: "Chennai Warehouse", supplier: "Office Mart", date: "2026-08-20",
    requiredBy: "2026-11-01", status: "Draft",
    justification: "Replacement chairs for office expansion.",
    budgetCode: "ADMIN-2026", estimatedValue: 416000, approvalLimit: 500000,
    createdAt: "2026-08-20T09:00:00.000Z", updatedAt: "2026-08-20T09:00:00.000Z",
    approvalHistory: [{ id: "a8", action: "Created", actor: "Administration", timestamp: "2026-08-20T09:00:00.000Z" }],
  },
  {
    id: "pr-5",
    requestNumber: "PR-2026-005",
    items: [
      { id: "i5", product: "Storage Bins", sku: "BIN-ST-005", quantity: 120, estimatedUnitPrice: 680, estimatedValue: 81600, uom: "Nos" },
    ],
    priority: "Low", requester: "Warehouse Team", department: "Warehouse",
    warehouse: "Hyderabad Central", supplier: "Industrial Solutions", date: "2026-08-18",
    requiredBy: "2026-09-25", status: "Converted",
    justification: "Warehouse organization and storage improvement.",
    budgetCode: "WH-2026", estimatedValue: 81600, approvalLimit: 250000,
    convertedPO: "PO-202608-00001",
    createdAt: "2026-08-18T09:00:00.000Z", updatedAt: "2026-08-19T12:00:00.000Z",
    approvalHistory: [
      { id: "a9", action: "Created", actor: "Warehouse Team", timestamp: "2026-08-18T09:00:00.000Z" },
      { id: "a10", action: "Submitted", actor: "Warehouse Team", timestamp: "2026-08-18T10:00:00.000Z" },
      { id: "a11", action: "Approved", actor: "Procurement Manager", timestamp: "2026-08-19T09:00:00.000Z" },
      { id: "a12", action: "Converted", actor: "Procurement Manager", timestamp: "2026-08-19T12:00:00.000Z" },
    ],
  },
];

const emptyItem = (): RequestItem => ({
  id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  product: "", sku: "", quantity: 1, estimatedUnitPrice: 0, estimatedValue: 0, uom: "Nos",
});

const emptyForm = () => ({
  items: [emptyItem()],
  priority: "Medium" as RequestPriority,
  requester: "",
  department: "",
  warehouse: "Hyderabad Central",
  supplier: "",
  supplierGSTIN: "",
  requiredBy: "",
  justification: "",
  budgetCode: "",
  approvalLimit: 500000,
});

function money(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}
function dateLabel(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}
function statusClass(status: RequestStatus) {
  return status === "Approved" ? "bg-emerald-50 text-emerald-700 border-emerald-100"
    : status === "Pending Approval" ? "bg-amber-50 text-amber-700 border-amber-100"
    : status === "Converted" ? "bg-blue-50 text-blue-700 border-blue-100"
    : status === "Rejected" ? "bg-red-50 text-red-700 border-red-100"
    : "bg-slate-100 text-slate-700 border-slate-200";
}
function priorityClass(priority: RequestPriority) {
  return priority === "High" ? "bg-red-50 text-red-700" : priority === "Medium" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700";
}
function csvEscape(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | RequestStatus>("All");
  const [priorityFilter, setPriorityFilter] = useState<"All" | RequestPriority>("All");
  const [warehouseFilter, setWarehouseFilter] = useState("All");
  const [supplierFilter, setSupplierFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<PurchaseRequest | null>(null);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setRequests(Array.isArray(parsed) ? parsed : seedRequests);
      } else {
        setRequests(seedRequests);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seedRequests));
      }
    } catch {
      setRequests(seedRequests);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  }, [requests, hydrated]);

  const warehouses = useMemo(() => Array.from(new Set(requests.map(r => r.warehouse))), [requests]);
  const suppliers = useMemo(() => Array.from(new Set(requests.map(r => r.supplier).filter(Boolean))), [requests]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter(r => {
      const searchMatch = !q || [r.requestNumber, r.requester, r.department, r.supplier, r.warehouse, r.budgetCode, ...r.items.flatMap(i => [i.product, i.sku])]
        .join(" ").toLowerCase().includes(q);
      return searchMatch &&
        (statusFilter === "All" || r.status === statusFilter) &&
        (priorityFilter === "All" || r.priority === priorityFilter) &&
        (warehouseFilter === "All" || r.warehouse === warehouseFilter) &&
        (supplierFilter === "All" || r.supplier === supplierFilter);
    });
  }, [requests, search, statusFilter, priorityFilter, warehouseFilter, supplierFilter]);

  const metrics = useMemo(() => ({
    total: requests.length,
    draft: requests.filter(r => r.status === "Draft").length,
    pending: requests.filter(r => r.status === "Pending Approval").length,
    approved: requests.filter(r => r.status === "Approved").length,
    converted: requests.filter(r => r.status === "Converted").length,
    rejected: requests.filter(r => r.status === "Rejected").length,
    high: requests.filter(r => r.priority === "High" && r.status !== "Converted" && r.status !== "Rejected").length,
    value: requests.reduce((s, r) => s + r.estimatedValue, 0),
    pendingValue: requests.filter(r => r.status === "Pending Approval").reduce((s, r) => s + r.estimatedValue, 0),
  }), [requests]);

  const resetForm = () => setForm(emptyForm());

  const openCreate = () => {
    setEditingId(null);
    resetForm();
    setShowForm(true);
  };

  const openEdit = (request: PurchaseRequest) => {
    if (!["Draft", "Rejected"].includes(request.status)) {
      alert("Only Draft or Rejected requests can be edited.");
      return;
    }
    setEditingId(request.id);
    setForm({
      items: request.items.map(i => ({ ...i })),
      priority: request.priority, requester: request.requester, department: request.department,
      warehouse: request.warehouse, supplier: request.supplier, supplierGSTIN: request.supplierGSTIN || "",
      requiredBy: request.requiredBy, justification: request.justification, budgetCode: request.budgetCode,
      approvalLimit: request.approvalLimit,
    });
    setSelected(null);
    setShowForm(true);
  };

  const updateItem = (id: string, patch: Partial<RequestItem>) => {
    setForm(current => ({
      ...current,
      items: current.items.map(item => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        next.estimatedValue = Math.max(0, Number(next.quantity) || 0) * Math.max(0, Number(next.estimatedUnitPrice) || 0);
        return next;
      }),
    }));
  };

  const formTotal = form.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.estimatedUnitPrice) || 0), 0);

  const saveRequest = (submit: boolean) => {
    if (!form.requester.trim() || !form.department.trim() || !form.supplier.trim() || !form.justification.trim() || !form.requiredBy) {
      alert("Please complete requester, department, supplier, required-by date and justification.");
      return;
    }
    if (!form.items.length || form.items.some(i => !i.product.trim() || !i.sku.trim() || i.quantity <= 0 || i.estimatedUnitPrice < 0)) {
      alert("Please add valid product lines with quantity and estimated unit price.");
      return;
    }
    const duplicateSKUs = form.items.map(i => i.sku.trim().toLowerCase()).filter((sku, idx, arr) => arr.indexOf(sku) !== idx);
    if (duplicateSKUs.length) {
      alert("Each SKU can appear only once in a purchase request.");
      return;
    }

    const now = new Date().toISOString();
    if (editingId) {
      setRequests(current => current.map(r => r.id === editingId ? {
        ...r, items: form.items, priority: form.priority, requester: form.requester.trim(), department: form.department.trim(),
        warehouse: form.warehouse, supplier: form.supplier.trim(), supplierGSTIN: form.supplierGSTIN.trim(),
        requiredBy: form.requiredBy, justification: form.justification.trim(), budgetCode: form.budgetCode.trim(),
        approvalLimit: form.approvalLimit, estimatedValue: formTotal, updatedAt: now,
        status: submit ? "Pending Approval" : "Draft",
        approvalHistory: [...r.approvalHistory, { id: `a-${Date.now()}`, action: "Edited", actor: form.requester.trim(), timestamp: now, comment: submit ? "Edited and submitted for approval." : "Request updated." },
          ...(submit ? [{ id: `a-${Date.now()}-s`, action: "Submitted" as const, actor: form.requester.trim(), timestamp: now }] : [])],
      } : r));
    } else {
      const year = new Date().getFullYear();
      const maxNo = requests.reduce((max, r) => Math.max(max, Number(r.requestNumber.match(/(\d+)$/)?.[1] || 0)), 0);
      const request: PurchaseRequest = {
        id: `pr-${Date.now()}`, requestNumber: `PR-${year}-${String(maxNo + 1).padStart(3, "0")}`,
        items: form.items.map(i => ({ ...i, estimatedValue: i.quantity * i.estimatedUnitPrice })),
        priority: form.priority, requester: form.requester.trim(), department: form.department.trim(),
        warehouse: form.warehouse, supplier: form.supplier.trim(), supplierGSTIN: form.supplierGSTIN.trim(),
        date: now.slice(0, 10), requiredBy: form.requiredBy, status: submit ? "Pending Approval" : "Draft",
        justification: form.justification.trim(), budgetCode: form.budgetCode.trim(), estimatedValue: formTotal,
        approvalLimit: form.approvalLimit, createdAt: now, updatedAt: now,
        approvalHistory: [
          { id: `a-${Date.now()}`, action: "Created", actor: form.requester.trim(), timestamp: now },
          ...(submit ? [{ id: `a-${Date.now()}-s`, action: "Submitted" as const, actor: form.requester.trim(), timestamp: now }] : []),
        ],
      };
      setRequests(current => [request, ...current]);
    }
    setShowForm(false);
    resetForm();
    alert(submit ? "Purchase Request submitted for approval." : "Purchase Request saved as Draft.");
  };

  const transition = (id: string, status: RequestStatus, action: ApprovalEvent["action"], actor = "Procurement Manager") => {
    const now = new Date().toISOString();
    setRequests(current => current.map(r => r.id === id ? {
      ...r, status, updatedAt: now,
      approvalHistory: [...r.approvalHistory, { id: `a-${Date.now()}`, action, actor, timestamp: now, comment: comment.trim() || undefined }],
    } : r));
    setComment("");
    setSelected(null);
  };

  const convertToPO = (request: PurchaseRequest) => {
    if (request.status !== "Approved") return;
    let orders: any[] = [];
    try {
      const raw = localStorage.getItem(PO_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) orders = parsed;
    } catch { orders = []; }

    const max = orders.reduce((m, po) => Math.max(m, Number(String(po.number || "").match(/PO-\d{6}-(\d+)$/)?.[1] || 0)), 0);
    const poNumber = `PO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(max + 1).padStart(5, "0")}`;
    const createdPO = {
      id: `po-${Date.now()}`, number: poNumber, supplier: request.supplier, supplierGST: request.supplierGSTIN || "GSTIN-PENDING",
      warehouse: request.warehouse, requester: request.requester, orderDate: dateLabel(new Date().toISOString()),
      expectedDate: dateLabel(request.requiredBy), paymentTerms: "30 days", status: "Draft",
      notes: `Created from purchase request ${request.requestNumber}. ${request.justification}`,
      items: request.items.map(item => ({ product: item.product, sku: item.sku, ordered: item.quantity, received: 0, unitPrice: item.estimatedUnitPrice, total: item.estimatedValue })),
      sourcePurchaseRequest: request.requestNumber,
    };
    localStorage.setItem(PO_STORAGE_KEY, JSON.stringify([createdPO, ...orders]));
    const now = new Date().toISOString();
    setRequests(current => current.map(r => r.id === request.id ? {
      ...r, status: "Converted", convertedPO: poNumber, updatedAt: now,
      approvalHistory: [...r.approvalHistory, { id: `a-${Date.now()}`, action: "Converted", actor: "Procurement Manager", timestamp: now, comment: `Converted to ${poNumber}.` }],
    } : r));
    setSelected(null);
    alert(`Purchase Order ${poNumber} created successfully.`);
  };

  const exportCSV = () => {
    const header = ["Request Number","Date","Status","Priority","Product(s)","SKU(s)","Quantity","Estimated Value","Requester","Department","Warehouse","Supplier","Required By","Budget Code","Converted PO"];
    const rows = filtered.map(r => [
      r.requestNumber, r.date, r.status, r.priority, r.items.map(i => i.product).join(" | "),
      r.items.map(i => i.sku).join(" | "), r.items.reduce((s,i)=>s+i.quantity,0), r.estimatedValue,
      r.requester, r.department, r.warehouse, r.supplier, r.requiredBy, r.budgetCode, r.convertedPO || "",
    ]);
    const csv = [header, ...rows].map(row => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `purchase-requests-${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  if (!hydrated) return <PageLayout><div className="min-h-screen bg-slate-50 p-6"><div className="mx-auto max-w-7xl animate-pulse"><div className="h-8 w-64 rounded bg-slate-200" /><div className="mt-6 h-32 rounded-2xl bg-white" /></div></div></PageLayout>;

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#f6f8fb] p-4 md:p-6">
        <div className="mx-auto max-w-[1500px]">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-blue-600">Procurement • Requisition Control</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Purchase Requests</h1>
              <p className="mt-1 text-sm text-slate-500">Create, route, approve and convert internal procurement requirements.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={exportCSV} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">Export CSV</button>
              <button onClick={() => setRequests([...requests])} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">↻ Refresh</button>
              <button onClick={openCreate} className="rounded-xl bg-[#12213a] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#1d3151]">+ Create Request</button>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-white p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div><p className="text-xs font-bold text-blue-900">Procurement Request Control</p><p className="mt-1 text-[11px] text-blue-700">Frontend workflow is active and persisted locally. Backend approval enforcement can be connected later.</p></div>
              <span className="rounded-full bg-white px-3 py-1.5 text-[10px] font-bold text-blue-700 shadow-sm">{metrics.pending} requests awaiting approval</span>
            </div>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Total Requests", metrics.total, "All requisitions", "text-slate-900"],
              ["Pending Approval", metrics.pending, money(metrics.pendingValue), "text-amber-600"],
              ["Approved", metrics.approved, "Ready for PO", "text-emerald-600"],
              ["Converted", metrics.converted, "Linked to PO", "text-blue-600"],
              ["High Priority", metrics.high, "Active high-priority", "text-red-600"],
            ].map(([label,value,sub,color]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p><p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p><p className="mt-1 text-[11px] text-slate-500">{sub}</p></div>)}
          </div>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <div className="grid gap-3 xl:grid-cols-[1fr_150px_150px_180px_180px]">
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search PR, product, SKU, requester, supplier..." className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs"><option>All</option><option>Draft</option><option>Pending Approval</option><option>Approved</option><option>Rejected</option><option>Converted</option></select>
                <select value={priorityFilter} onChange={e=>setPriorityFilter(e.target.value as typeof priorityFilter)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs"><option>All</option><option>High</option><option>Medium</option><option>Low</option></select>
                <select value={warehouseFilter} onChange={e=>setWarehouseFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs"><option>All warehouses</option>{warehouses.map(w=><option key={w}>{w}</option>)}</select>
                <select value={supplierFilter} onChange={e=>setSupplierFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs"><option>All suppliers</option>{suppliers.map(s=><option key={s}>{s}</option>)}</select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1250px] w-full text-left">
                <thead><tr className="border-b bg-slate-50">{["Request","Product / SKU","Qty","Value","Priority","Requester","Warehouse","Supplier","Required By","Status","Actions"].map(h=><th key={h} className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-500">{h}</th>)}</tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(r => <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-4"><p className="text-xs font-bold text-blue-700">{r.requestNumber}</p><p className="mt-1 text-[9px] text-slate-400">{dateLabel(r.date)} • {r.department}</p></td>
                    <td className="px-4 py-4"><p className="max-w-[190px] text-xs font-semibold text-slate-900">{r.items[0]?.product}{r.items.length>1 && ` +${r.items.length-1} more`}</p><p className="mt-1 text-[9px] text-slate-400">{r.items[0]?.sku}</p></td>
                    <td className="px-4 py-4 text-xs font-semibold text-slate-800">{r.items.reduce((s,i)=>s+i.quantity,0)}</td>
                    <td className="px-4 py-4 text-xs font-bold text-slate-900">{money(r.estimatedValue)}</td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${priorityClass(r.priority)}`}>{r.priority}</span></td>
                    <td className="px-4 py-4"><p className="text-[10px] font-semibold text-slate-800">{r.requester}</p><p className="text-[9px] text-slate-400">{r.department}</p></td>
                    <td className="px-4 py-4 text-[10px] text-slate-600">{r.warehouse}</td>
                    <td className="px-4 py-4 text-[10px] font-semibold text-slate-700">{r.supplier}</td>
                    <td className="px-4 py-4 text-[10px] text-slate-600">{dateLabel(r.requiredBy)}</td>
                    <td className="px-4 py-4"><span className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-[9px] font-bold ${statusClass(r.status)}`}>{r.status}</span></td>
                    <td className="px-4 py-4"><div className="flex gap-1.5">
                      <button onClick={()=>setSelected(r)} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-bold text-slate-700">View</button>
                      {(r.status==="Draft"||r.status==="Rejected") && <button onClick={()=>openEdit(r)} className="rounded-lg border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[9px] font-bold text-blue-700">Edit</button>}
                      {r.status==="Draft" && <button onClick={()=>transition(r.id,"Pending Approval","Submitted",r.requester)} className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-[9px] font-bold text-white">Submit</button>}
                      {r.status==="Pending Approval" && <button onClick={()=>setSelected(r)} className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[9px] font-bold text-white">Review</button>}
                      {r.status==="Approved" && <button onClick={()=>convertToPO(r)} className="rounded-lg bg-[#12213a] px-2.5 py-1.5 text-[9px] font-bold text-white">Convert</button>}
                    </div></td>
                  </tr>)}
                </tbody>
              </table>
              {!filtered.length && <div className="px-6 py-16 text-center"><div className="text-3xl">⌕</div><p className="mt-3 text-sm font-bold text-slate-700">No purchase requests found</p><p className="mt-1 text-xs text-slate-400">Try another filter or create a new request.</p></div>}
            </div>
            <div className="flex flex-wrap justify-between gap-3 border-t bg-slate-50 px-5 py-3 text-[10px] text-slate-500"><span>Showing {filtered.length} of {requests.length} requests</span><span>Draft {metrics.draft} • Pending {metrics.pending} • Approved {metrics.approved} • Converted {metrics.converted} • Rejected {metrics.rejected}</span></div>
          </div>
        </div>

        {showForm && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-4"><div><p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Procurement Requisition</p><h2 className="mt-1 text-xl font-bold text-slate-900">{editingId ? "Edit Purchase Request" : "Create Purchase Request"}</h2></div><button onClick={()=>setShowForm(false)} className="h-8 w-8 rounded-lg text-xl text-slate-400 hover:bg-slate-100">×</button></div>
            <div className="max-h-[78vh] overflow-y-auto p-6">
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  ["Requester","requester","Your name / team"],["Department","department","Department"],["Preferred Supplier","supplier","Supplier"],["Supplier GSTIN","supplierGSTIN","Optional GSTIN"],
                  ["Budget / Cost Center","budgetCode","OPS-INV-2026"],
                ].map(([label,key,placeholder])=><div key={key} className="md:col-span-1"><label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}{["requester","department","supplier"].includes(key)?" *":""}</label><input value={(form as any)[key]} onChange={e=>setForm(c=>({...c,[key]:e.target.value}))} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></div>)}
                <div><label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Warehouse *</label><select value={form.warehouse} onChange={e=>setForm(c=>({...c,warehouse:e.target.value}))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs"><option>Hyderabad Central</option><option>Bengaluru Warehouse</option><option>Chennai Warehouse</option><option>Mumbai Warehouse</option></select></div>
                <div><label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Priority</label><select value={form.priority} onChange={e=>setForm(c=>({...c,priority:e.target.value as RequestPriority}))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs"><option>Low</option><option>Medium</option><option>High</option></select></div>
                <div><label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Required By *</label><input type="date" value={form.requiredBy} onChange={e=>setForm(c=>({...c,requiredBy:e.target.value}))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs" /></div>
                <div><label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Approval Limit</label><input type="number" min="0" value={form.approvalLimit} onChange={e=>setForm(c=>({...c,approvalLimit:Number(e.target.value)}))} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs" /></div>
              </div>
              <div className="mt-6 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3"><div><p className="text-xs font-bold text-slate-900">Request Lines</p><p className="text-[10px] text-slate-500">Add one or more products to the requisition.</p></div><button onClick={()=>setForm(c=>({...c,items:[...c.items,emptyItem()]}))} className="rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white">+ Add Line</button></div>
                <div className="overflow-x-auto p-4"><table className="min-w-[850px] w-full"><thead><tr>{["Product *","SKU *","UOM","Quantity *","Est. Unit Price","Line Value",""].map(h=><th key={h} className="px-2 py-2 text-left text-[9px] font-bold uppercase tracking-wide text-slate-400">{h}</th>)}</tr></thead><tbody className="divide-y">
                  {form.items.map(item=><tr key={item.id}><td className="px-2 py-2"><input value={item.product} onChange={e=>updateItem(item.id,{product:e.target.value})} placeholder="Product name" className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs" /></td><td className="px-2 py-2"><input value={item.sku} onChange={e=>updateItem(item.id,{sku:e.target.value})} placeholder="SKU-001" className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs" /></td><td className="px-2 py-2"><select value={item.uom} onChange={e=>updateItem(item.id,{uom:e.target.value})} className="rounded-lg border border-slate-200 px-2 py-2 text-xs"><option>Nos</option><option>Kg</option><option>Box</option><option>Set</option><option>Meter</option></select></td><td className="px-2 py-2"><input type="number" min="1" value={item.quantity} onChange={e=>updateItem(item.id,{quantity:Number(e.target.value)})} className="w-24 rounded-lg border border-slate-200 px-2.5 py-2 text-xs" /></td><td className="px-2 py-2"><input type="number" min="0" value={item.estimatedUnitPrice} onChange={e=>updateItem(item.id,{estimatedUnitPrice:Number(e.target.value)})} className="w-32 rounded-lg border border-slate-200 px-2.5 py-2 text-xs" /></td><td className="px-2 py-2 text-xs font-bold text-slate-800">{money(item.quantity*item.estimatedUnitPrice)}</td><td className="px-2 py-2">{form.items.length>1 && <button onClick={()=>setForm(c=>({...c,items:c.items.filter(i=>i.id!==item.id)}))} className="text-lg text-red-500">×</button>}</td></tr>)}
                </tbody></table></div>
              </div>
              <div className="mt-5"><label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Business Justification *</label><textarea value={form.justification} onChange={e=>setForm(c=>({...c,justification:e.target.value}))} rows={4} placeholder="Explain why this purchase is required, expected usage, urgency or replenishment reason..." className="w-full rounded-xl border border-slate-200 px-3 py-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" /></div>
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-wide text-blue-600">Request Summary</p><p className="mt-1 text-xs text-blue-900">{form.items.length} line(s) • {form.items.reduce((s,i)=>s+i.quantity,0)} total units</p></div><p className="text-xl font-bold text-blue-700">{money(formTotal)}</p></div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t bg-slate-50 px-6 py-4"><button onClick={()=>setShowForm(false)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700">Cancel</button><button onClick={()=>saveRequest(false)} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-800">Save Draft</button><button onClick={()=>saveRequest(true)} className="rounded-xl bg-[#12213a] px-5 py-2.5 text-xs font-bold text-white">Submit for Approval</button></div>
          </div>
        </div>}

        {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b px-6 py-5"><div><p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">Purchase Request</p><h2 className="mt-1 text-xl font-bold text-slate-900">{selected.requestNumber}</h2><p className="mt-1 text-[10px] text-slate-400">Created {dateLabel(selected.date)} • Updated {dateLabel(selected.updatedAt)}</p></div><button onClick={()=>setSelected(null)} className="h-8 w-8 rounded-lg text-xl text-slate-400 hover:bg-slate-100">×</button></div>
            <div className="max-h-[72vh] overflow-y-auto p-6">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-bold text-slate-900">{selected.supplier}</p><p className="text-[10px] text-slate-500">{selected.supplierGSTIN || "GSTIN not supplied"} • {selected.warehouse}</p></div><div className="flex gap-2"><span className={`rounded-full border px-3 py-1.5 text-[9px] font-bold ${statusClass(selected.status)}`}>{selected.status}</span><span className={`rounded-full px-3 py-1.5 text-[9px] font-bold ${priorityClass(selected.priority)}`}>{selected.priority} Priority</span></div></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-4">{[["Requester",selected.requester],["Department",selected.department],["Required By",dateLabel(selected.requiredBy)],["Budget Code",selected.budgetCode||"—"]].map(([a,b])=><div key={a} className="rounded-xl bg-slate-50 p-3"><p className="text-[9px] font-bold uppercase text-slate-400">{a}</p><p className="mt-1 text-xs font-semibold text-slate-800">{b}</p></div>)}</div>
              <div className="mt-5 rounded-xl border border-slate-200"><div className="border-b bg-slate-50 px-4 py-3"><p className="text-xs font-bold">Requested Items</p></div><div className="divide-y">{selected.items.map(i=><div key={i.id} className="flex items-center justify-between gap-3 px-4 py-3"><div><p className="text-xs font-semibold">{i.product}</p><p className="text-[9px] text-slate-400">{i.sku} • {i.uom}</p></div><div className="text-right"><p className="text-xs font-bold">{i.quantity} × {money(i.estimatedUnitPrice)}</p><p className="text-[10px] text-slate-500">{money(i.estimatedValue)}</p></div></div>)}</div><div className="flex justify-between border-t px-4 py-3"><span className="text-xs font-bold">Estimated Total</span><span className="text-sm font-bold text-blue-700">{money(selected.estimatedValue)}</span></div></div>
              <div className="mt-5 rounded-xl border border-slate-200 p-4"><p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">Business Justification</p><p className="mt-2 text-xs leading-5 text-slate-700">{selected.justification}</p></div>
              <div className="mt-5"><p className="mb-3 text-xs font-bold">Approval Timeline</p><div className="space-y-3">{selected.approvalHistory.map(e=><div key={e.id} className="flex gap-3"><div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600"/><div><p className="text-[10px] font-bold text-slate-800">{e.action} <span className="font-normal text-slate-400">by {e.actor}</span></p><p className="text-[9px] text-slate-400">{new Date(e.timestamp).toLocaleString("en-IN")}</p>{e.comment&&<p className="mt-1 text-[10px] text-slate-600">{e.comment}</p>}</div></div>)}</div></div>
              {selected.status==="Pending Approval" && <div className="mt-5"><label className="mb-1.5 block text-[10px] font-bold uppercase text-slate-500">Approval Comment</label><textarea value={comment} onChange={e=>setComment(e.target.value)} rows={2} placeholder="Optional approval/rejection note..." className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs" /></div>}
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t bg-slate-50 px-6 py-4">
              <button onClick={()=>setSelected(null)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700">Close</button>
              {(selected.status==="Draft"||selected.status==="Rejected")&&<button onClick={()=>openEdit(selected)} className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700">Edit</button>}
              {selected.status==="Draft"&&<button onClick={()=>transition(selected.id,"Pending Approval","Submitted",selected.requester)} className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white">Submit</button>}
              {selected.status==="Pending Approval"&&<><button onClick={()=>transition(selected.id,"Rejected","Rejected")} className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-xs font-bold text-red-600">Reject</button><button onClick={()=>transition(selected.id,"Approved","Approved")} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white">Approve</button></>}
              {selected.status==="Approved"&&<button onClick={()=>convertToPO(selected)} className="rounded-xl bg-[#12213a] px-5 py-2.5 text-xs font-bold text-white">Convert to Purchase Order</button>}
              {selected.status==="Converted"&&selected.convertedPO&&<span className="rounded-xl bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700">PO: {selected.convertedPO}</span>}
            </div>
          </div>
        </div>}
      </div>
    </PageLayout>
  );
}
