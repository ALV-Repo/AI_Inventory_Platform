
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type SupplierStatus = "Active" | "On Hold" | "Inactive";
type SupplierTier = "Strategic" | "Preferred" | "Standard" | "New";

type SupplierContact = {
  name: string;
  role: string;
  email: string;
  phone: string;
};

type SupplierAddress = {
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

type SupplierBank = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  ifsc: string;
};

type Supplier = {
  id: number;
  name: string;
  code: string;
  contact: string;
  email: string;
  phone: string;
  gstin?: string;
  pan?: string;
  paymentTerms?: string;
  leadTime?: string;
  priceList?: string;
  category: string;
  location: string;
  rating: number;
  totalOrders: number;
  totalValue: number;
  outstanding: number;
  status: SupplierStatus;
  tier: SupplierTier;
  lastOrder: string;
  creditLimit: number;
  currency: string;
  website?: string;
  notes?: string;
  contacts: SupplierContact[];
  addresses: SupplierAddress[];
  bank?: SupplierBank;
  products: string[];
  onTimeRate: number;
  qualityRate: number;
  createdAt: string;
};

const initialSuppliers: Supplier[] = [
  {
    id: 1, name: "Tech Supplies India", code: "SUP-001", contact: "Rahul Mehta",
    email: "rahul@techsupplies.in", phone: "+91 98765 43210", gstin: "29AAAAA0000A1Z5",
    pan: "AAAAA0000A", paymentTerms: "Net 30", leadTime: "7", priceList: "Electronics Wholesale",
    category: "Electronics", location: "Bengaluru", rating: 4.8, totalOrders: 24,
    totalValue: 845000, outstanding: 42000, status: "Active", tier: "Strategic",
    lastOrder: "21 Aug 2026", creditLimit: 250000, currency: "INR",
    website: "https://example.com", notes: "Primary electronics supplier.",
    contacts: [{ name: "Rahul Mehta", role: "Account Manager", email: "rahul@techsupplies.in", phone: "+91 98765 43210" }],
    addresses: [{ label: "Head Office", address: "12 Electronic City", city: "Bengaluru", state: "Karnataka", pincode: "560100" }],
    bank: { bankName: "HDFC Bank", accountName: "Tech Supplies India", accountNumber: "XXXXXX4582", ifsc: "HDFC0001234" },
    products: ["Laptops", "Monitors", "Keyboards", "Networking"],
    onTimeRate: 96, qualityRate: 98, createdAt: "2026-01-12",
  },
  {
    id: 2, name: "Digital World", code: "SUP-002", contact: "Priya Sharma",
    email: "priya@digitalworld.in", phone: "+91 99887 66554", gstin: "36BBBBB1111B2Z6",
    pan: "BBBBB1111B", paymentTerms: "Net 30", leadTime: "10", priceList: "Standard Electronics",
    category: "Electronics", location: "Hyderabad", rating: 4.5, totalOrders: 18,
    totalValue: 628000, outstanding: 28000, status: "Active", tier: "Preferred",
    lastOrder: "20 Aug 2026", creditLimit: 200000, currency: "INR",
    contacts: [{ name: "Priya Sharma", role: "Sales Manager", email: "priya@digitalworld.in", phone: "+91 99887 66554" }],
    addresses: [{ label: "Warehouse", address: "44 HITEC City Road", city: "Hyderabad", state: "Telangana", pincode: "500081" }],
    products: ["Cameras", "Headsets", "Accessories"], onTimeRate: 93, qualityRate: 95, createdAt: "2026-02-04",
  },
  {
    id: 3, name: "Office Mart", code: "SUP-003", contact: "Arjun Rao",
    email: "arjun@officemart.in", phone: "+91 91234 56789", gstin: "33CCCCC2222C3Z7",
    pan: "CCCCC2222C", paymentTerms: "Net 45", leadTime: "5", priceList: "Office Supplies Rate Card",
    category: "Office Supplies", location: "Chennai", rating: 4.2, totalOrders: 15,
    totalValue: 412000, outstanding: 12500, status: "Active", tier: "Standard",
    lastOrder: "19 Aug 2026", creditLimit: 120000, currency: "INR",
    contacts: [{ name: "Arjun Rao", role: "Sales Executive", email: "arjun@officemart.in", phone: "+91 91234 56789" }],
    addresses: [{ label: "Branch", address: "18 Mount Road", city: "Chennai", state: "Tamil Nadu", pincode: "600002" }],
    products: ["Paper", "Stationery", "Printer Supplies"], onTimeRate: 91, qualityRate: 94, createdAt: "2026-02-18",
  },
  {
    id: 4, name: "Industrial Solutions", code: "SUP-004", contact: "Sneha Reddy",
    email: "sneha@industrial.in", phone: "+91 90909 80808", gstin: "27DDDDD3333D4Z8",
    pan: "DDDDD3333D", paymentTerms: "Net 60", leadTime: "14", priceList: "Industrial Contract",
    category: "Industrial", location: "Pune", rating: 4.0, totalOrders: 11,
    totalValue: 385000, outstanding: 35000, status: "On Hold", tier: "Standard",
    lastOrder: "18 Aug 2026", creditLimit: 100000, currency: "INR",
    contacts: [{ name: "Sneha Reddy", role: "Key Account Manager", email: "sneha@industrial.in", phone: "+91 90909 80808" }],
    addresses: [{ label: "Plant", address: "MIDC Industrial Area", city: "Pune", state: "Maharashtra", pincode: "411019" }],
    products: ["Equipment", "Components", "Safety Gear"], onTimeRate: 84, qualityRate: 89, createdAt: "2026-03-02",
    notes: "Review supplier performance before reactivation.",
  },
  {
    id: 5, name: "Metro Electronics", code: "SUP-005", contact: "Vikram Singh",
    email: "vikram@metroelectronics.in", phone: "+91 90123 45678", gstin: "27EEEEE4444E5Z9",
    pan: "EEEEE4444E", paymentTerms: "Net 30", leadTime: "8", priceList: "Metro Dealer Price",
    category: "Electronics", location: "Mumbai", rating: 4.7, totalOrders: 21,
    totalValue: 725000, outstanding: 18500, status: "Active", tier: "Preferred",
    lastOrder: "16 Aug 2026", creditLimit: 180000, currency: "INR",
    contacts: [{ name: "Vikram Singh", role: "Business Manager", email: "vikram@metroelectronics.in", phone: "+91 90123 45678" }],
    addresses: [{ label: "Distribution Hub", address: "7 Andheri East", city: "Mumbai", state: "Maharashtra", pincode: "400069" }],
    products: ["Earbuds", "Gaming Headsets", "Mice", "Keyboards"], onTimeRate: 95, qualityRate: 97, createdAt: "2026-03-11",
  },
  {
    id: 6, name: "Home Essentials", code: "SUP-006", contact: "Kavya Nair",
    email: "kavya@homeessentials.in", phone: "+91 93456 78901", gstin: "32FFFFF5555F6Z0",
    pan: "FFFFF5555F", paymentTerms: "Immediate", leadTime: "6", priceList: "Home Essentials Wholesale",
    category: "Home", location: "Kochi", rating: 4.3, totalOrders: 13,
    totalValue: 298000, outstanding: 9000, status: "Active", tier: "Standard",
    lastOrder: "14 Aug 2026", creditLimit: 90000, currency: "INR",
    contacts: [{ name: "Kavya Nair", role: "Owner", email: "kavya@homeessentials.in", phone: "+91 93456 78901" }],
    addresses: [{ label: "Office", address: "21 MG Road", city: "Kochi", state: "Kerala", pincode: "682016" }],
    products: ["Home Appliances", "Storage", "Cleaning Supplies"], onTimeRate: 90, qualityRate: 93, createdAt: "2026-04-05",
  },
];

const categories = ["All Categories", "Electronics", "Office Supplies", "Industrial", "Home", "Services", "Other"];
const statuses: Array<"All Statuses" | SupplierStatus> = ["All Statuses", "Active", "On Hold", "Inactive"];
const tiers: SupplierTier[] = ["Strategic", "Preferred", "Standard", "New"];

const money = (value: number) => `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

function normalizeSupplier(raw: Partial<Supplier>, fallbackId: number): Supplier {
  return {
    ...initialSuppliers[0],
    ...raw,
    id: Number(raw.id) || fallbackId,
    name: String(raw.name || "Unnamed Supplier"),
    code: String(raw.code || `SUP-${String(fallbackId).padStart(3, "0")}`),
    contact: String(raw.contact || ""),
    email: String(raw.email || ""),
    phone: String(raw.phone || ""),
    gstin: raw.gstin ? String(raw.gstin) : "",
    pan: raw.pan ? String(raw.pan) : "",
    paymentTerms: raw.paymentTerms ? String(raw.paymentTerms) : "Net 30",
    leadTime: raw.leadTime ? String(raw.leadTime) : "",
    priceList: raw.priceList ? String(raw.priceList) : "",
    category: String(raw.category || "Other"),
    location: String(raw.location || ""),
    rating: Number(raw.rating) || 0,
    totalOrders: Number(raw.totalOrders) || 0,
    totalValue: Number(raw.totalValue) || 0,
    outstanding: Number(raw.outstanding) || 0,
    status: raw.status === "On Hold" || raw.status === "Inactive" ? raw.status : "Active",
    tier: raw.tier === "Strategic" || raw.tier === "Preferred" || raw.tier === "Standard" ? raw.tier : "New",
    lastOrder: String(raw.lastOrder || "No orders yet"),
    creditLimit: Number(raw.creditLimit) || 0,
    currency: String(raw.currency || "INR"),
    website: raw.website ? String(raw.website) : "",
    notes: raw.notes ? String(raw.notes) : "",
    contacts: Array.isArray(raw.contacts) ? raw.contacts : [],
    addresses: Array.isArray(raw.addresses) ? raw.addresses : [],
    bank: raw.bank && typeof raw.bank === "object" ? raw.bank : undefined,
    products: Array.isArray(raw.products) ? raw.products : [],
    onTimeRate: Number(raw.onTimeRate) || 0,
    qualityRate: Number(raw.qualityRate) || 0,
    createdAt: String(raw.createdAt || new Date().toISOString().slice(0, 10)),
  };
}

function emptySupplier(): Omit<Supplier, "id" | "rating" | "totalOrders" | "totalValue" | "outstanding" | "lastOrder" | "createdAt" | "contacts" | "addresses" | "products"> {
  return {
    name: "", code: "", contact: "", email: "", phone: "", gstin: "", pan: "",
    paymentTerms: "Net 30", leadTime: "", priceList: "", category: "Electronics",
    location: "", status: "Active", tier: "New", creditLimit: 0, currency: "INR",
    website: "", notes: "", bank: undefined, onTimeRate: 0, qualityRate: 0,
  };
}

export default function SuppliersPage() {
  const [supplierList, setSupplierList] = useState<Supplier[]>(initialSuppliers);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [status, setStatus] = useState("All Statuses");
  const [tier, setTier] = useState("All Tiers");
  const [sortBy, setSortBy] = useState("name");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [viewing, setViewing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptySupplier());
  const [message, setMessage] = useState("");
  const [purchaseOrders, setPurchaseOrders] = useState<unknown[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("stockflow-suppliers");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length) {
          setSupplierList(
            parsed.map((item, index) => normalizeSupplier(item as Partial<Supplier>, index + 1))
          );
        }
      }
      const poSaved =
        localStorage.getItem("stockflow-purchase-orders") ||
        localStorage.getItem("purchase-orders") ||
        localStorage.getItem("purchaseOrders");
      if (poSaved) {
        const parsed = JSON.parse(poSaved);
        if (Array.isArray(parsed)) setPurchaseOrders(parsed);
      }
    } catch {
      // Keep the safe in-memory seed data when browser storage is invalid.
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem("stockflow-suppliers", JSON.stringify(supplierList));
  }, [supplierList, loaded]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const filteredSuppliers = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = supplierList.filter((s) => {
      const text = [s.name, s.code, s.contact, s.email, s.phone, s.gstin, s.location, s.category].join(" ").toLowerCase();
      return (!q || text.includes(q)) &&
        (category === "All Categories" || s.category === category) &&
        (status === "All Statuses" || s.status === status) &&
        (tier === "All Tiers" || s.tier === tier);
    });
    return [...list].sort((a, b) => {
      if (sortBy === "value") return b.totalValue - a.totalValue;
      if (sortBy === "outstanding") return b.outstanding - a.outstanding;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "orders") return b.totalOrders - a.totalOrders;
      return a.name.localeCompare(b.name);
    });
  }, [supplierList, search, category, status, tier, sortBy]);

  const metrics = useMemo(() => {
    const totalValue = supplierList.reduce((n, s) => n + s.totalValue, 0);
    const outstanding = supplierList.reduce((n, s) => n + s.outstanding, 0);
    const active = supplierList.filter((s) => s.status === "Active").length;
    const avgRating = supplierList.length ? supplierList.reduce((n, s) => n + s.rating, 0) / supplierList.length : 0;
    const credit = supplierList.reduce((n, s) => n + s.creditLimit, 0);
    return { totalValue, outstanding, active, avgRating, credit };
  }, [supplierList]);

  const bestRated = useMemo(
    () => [...supplierList].sort((a, b) => b.rating - a.rating)[0],
    [supplierList]
  );
  const highestValue = useMemo(
    () => [...supplierList].sort((a, b) => b.totalValue - a.totalValue)[0],
    [supplierList]
  );
  const attention = useMemo(
    () => supplierList.filter((s) => s.status === "On Hold" || s.status === "Inactive" || s.outstanding > s.creditLimit),
    [supplierList]
  );

  const openCreate = () => {
    setEditing(null);
    setForm(emptySupplier());
    setShowForm(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm({
      ...emptySupplier(),
      ...supplier,
      bank: supplier.bank ? { ...supplier.bank } : undefined,
    });
    setShowForm(true);
    setViewing(null);
  };

  const saveSupplier = () => {
    const required = [form.name, form.code, form.contact, form.email, form.phone, form.location];
    if (required.some((v) => !String(v || "").trim())) {
      setMessage("Please fill all required supplier fields.");
      return;
    }
    const duplicateCode = supplierList.some(
      (s) => s.code.toLowerCase() === form.code.trim().toLowerCase() && s.id !== editing?.id
    );
    if (duplicateCode) {
      setMessage("Supplier code already exists.");
      return;
    }

    if (editing) {
      setSupplierList((current) =>
        current.map((s) => s.id === editing.id ? {
          ...s,
          ...form,
          id: editing.id,
          rating: editing.rating,
          totalOrders: editing.totalOrders,
          totalValue: editing.totalValue,
          outstanding: editing.outstanding,
          lastOrder: editing.lastOrder,
          createdAt: editing.createdAt,
          contacts: editing.contacts,
          addresses: editing.addresses,
          products: editing.products,
          onTimeRate: editing.onTimeRate,
          qualityRate: editing.qualityRate,
        } : s)
      );
      setMessage("Supplier updated successfully.");
    } else {
      const id = supplierList.length ? Math.max(...supplierList.map((s) => s.id)) + 1 : 1;
      const now = new Date().toISOString().slice(0, 10);
      const created: Supplier = {
        ...form,
        id,
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        contact: form.contact.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        location: form.location.trim(),
        rating: 0,
        totalOrders: 0,
        totalValue: 0,
        outstanding: 0,
        lastOrder: "No orders yet",
        createdAt: now,
        contacts: [{ name: form.contact.trim(), role: "Primary Contact", email: form.email.trim(), phone: form.phone.trim() }],
        addresses: [{ label: "Primary", address: "", city: form.location.trim(), state: "", pincode: "" }],
        products: [],
        onTimeRate: 0,
        qualityRate: 0,
      };
      setSupplierList((current) => [created, ...current]);
      setMessage("Supplier created successfully.");
    }
    setShowForm(false);
  };

  const toggleStatus = (supplier: Supplier) => {
    const next: SupplierStatus = supplier.status === "Active" ? "On Hold" : "Active";
    setSupplierList((current) => current.map((s) => s.id === supplier.id ? { ...s, status: next } : s));
    setMessage(`${supplier.name} is now ${next}.`);
  };

  const deleteSelected = () => {
    if (!selectedIds.length) return;
    if (!window.confirm(`Remove ${selectedIds.length} supplier(s) from the directory?`)) return;
    setSupplierList((current) => current.filter((s) => !selectedIds.includes(s.id)));
    setSelectedIds([]);
    setMessage("Selected suppliers removed.");
  };

  const exportCsv = () => {
    const rows = [
      ["Supplier Code", "Supplier Name", "Category", "Tier", "Contact", "Email", "Phone", "GSTIN", "Location", "Payment Terms", "Lead Time", "Rating", "Orders", "Purchase Value", "Outstanding", "Credit Limit", "Status"],
      ...filteredSuppliers.map((s) => [
        s.code, s.name, s.category, s.tier, s.contact, s.email, s.phone, s.gstin || "", s.location,
        s.paymentTerms || "", s.leadTime || "", s.rating, s.totalOrders, s.totalValue, s.outstanding, s.creditLimit, s.status,
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stockflow-suppliers-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage("Supplier CSV exported.");
  };

  const updateForm = (key: keyof typeof form, value: string | number | SupplierStatus | SupplierTier) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const poSummary = useMemo(() => {
    if (!viewing) return { count: 0, value: 0 };
    const match = purchaseOrders.filter((raw) => {
      const po = raw as Record<string, unknown>;
      const values = [
        po.supplier, po.supplierName, po.vendor, po.vendorName, po.supplierCode,
      ].map((v) => String(v || "").toLowerCase());
      return values.some((v) => v === viewing.name.toLowerCase() || v === viewing.code.toLowerCase() || v.includes(viewing.name.toLowerCase()));
    });
    const value = match.reduce<number>((sum, raw) => {
      const po = raw as Record<string, unknown>;
      const candidates: unknown[] = [po.total, po.totalAmount, po.grandTotal, po.amount, po.value];
      const n = candidates
        .map((value) => Number(value))
        .find((value): value is number => Number.isFinite(value) && value > 0) ?? 0;
      return sum + n;
    }, 0);
    return { count: match.length, value };
  }, [purchaseOrders, viewing]);

  const formInput = (label: string, key: keyof typeof form, placeholder = "", type = "text") => (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</label>
      <input
        type={type}
        value={String(form[key] ?? "")}
        onChange={(e) => updateForm(key, e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-4 py-5 text-slate-900 md:px-6">
      <div className="mx-auto max-w-[1500px]">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-600">
              <span className="h-2 w-2 rounded-full bg-indigo-600" /> Procurement / Supplier Management
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Supplier Directory</h1>
            <p className="mt-1 text-sm text-slate-500">Central supplier master, commercial terms, performance and purchasing intelligence.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={exportCsv} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">Export CSV</button>
            <button onClick={openCreate} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800">+ New Supplier</button>
          </div>
        </header>

        {message && (
          <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
            {message}
          </div>
        )}

        <section className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ["Total Suppliers", supplierList.length.toString(), "Supplier master records", "text-slate-900"],
            ["Active Suppliers", metrics.active.toString(), `${Math.round((metrics.active / Math.max(1, supplierList.length)) * 100)}% currently active`, "text-emerald-600"],
            ["Purchase Value", money(metrics.totalValue), "Lifetime recorded purchasing", "text-indigo-600"],
            ["Outstanding", money(metrics.outstanding), `Credit exposure ${money(metrics.credit)}`, "text-amber-600"],
            ["Avg. Rating", `${metrics.avgRating.toFixed(1)} / 5`, "Supplier performance rating", "text-violet-600"],
          ].map(([label, value, sub, color]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</p>
              <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
              <p className="mt-1 text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </section>

        <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_190px_170px_160px_160px_auto]">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search supplier, GSTIN, code, contact..." className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
              {categories.map((x) => <option key={x}>{x}</option>)}
            </select>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
              {statuses.map((x) => <option key={x}>{x}</option>)}
            </select>
            <select value={tier} onChange={(e) => setTier(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
              <option>All Tiers</option>
              {tiers.map((x) => <option key={x}>{x}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400">
              <option value="name">Sort: Name</option><option value="value">Sort: Purchase Value</option><option value="outstanding">Sort: Outstanding</option><option value="rating">Sort: Rating</option><option value="orders">Sort: Orders</option>
            </select>
            <button onClick={() => { setSearch(""); setCategory("All Categories"); setStatus("All Statuses"); setTier("All Tiers"); setSortBy("name"); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Clear</button>
          </div>
        </section>

        {selectedIds.length > 0 && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
            <span className="text-sm font-semibold text-indigo-700">{selectedIds.length} supplier(s) selected</span>
            <button onClick={deleteSelected} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-red-600 shadow-sm">Remove Selected</button>
          </div>
        )}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.05)]">
          <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div><h2 className="text-base font-bold">Supplier Master</h2><p className="mt-0.5 text-xs text-slate-500">Showing {filteredSuppliers.length} of {supplierList.length} suppliers</p></div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">Procurement Control</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-4 py-3"><input type="checkbox" checked={filteredSuppliers.length > 0 && filteredSuppliers.every((s) => selectedIds.includes(s.id))} onChange={(e) => setSelectedIds(e.target.checked ? filteredSuppliers.map((s) => s.id) : [])} /></th>
                  {["Supplier", "Commercial Profile", "Contact", "Location", "Performance", "Purchasing", "Outstanding", "Status", "Actions"].map((h) => <th key={h} className="px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 transition hover:bg-slate-50/80">
                    <td className="px-4 py-4"><input type="checkbox" checked={selectedIds.includes(s.id)} onChange={(e) => setSelectedIds((ids) => e.target.checked ? [...ids, s.id] : ids.filter((id) => id !== s.id))} /></td>
                    <td className="px-4 py-4">
                      <button onClick={() => setViewing(s)} className="text-left">
                        <div className="font-bold text-slate-900 hover:text-indigo-600">{s.name}</div>
                        <div className="mt-1 flex gap-2 text-[10px] text-slate-400"><span>{s.code}</span><span>•</span><span>{s.gstin || "GSTIN not added"}</span></div>
                      </button>
                    </td>
                    <td className="px-4 py-4"><div className="text-xs font-semibold text-slate-700">{s.category}</div><div className="mt-1 text-[10px] text-indigo-600">{s.tier} • {s.paymentTerms || "Terms not set"}</div></td>
                    <td className="px-4 py-4"><div className="text-xs font-semibold text-slate-700">{s.contact}</div><div className="mt-1 text-[11px] text-slate-400">{s.phone}</div><div className="text-[11px] text-slate-400">{s.email}</div></td>
                    <td className="px-4 py-4"><div className="text-xs text-slate-700">{s.location}</div><div className="mt-1 text-[10px] text-slate-400">Lead {s.leadTime || "—"} days</div></td>
                    <td className="px-4 py-4"><div className="font-semibold text-slate-700">★ {s.rating || "—"}</div><div className="mt-1 text-[10px] text-slate-400">OTD {s.onTimeRate || "—"}% • Quality {s.qualityRate || "—"}%</div></td>
                    <td className="px-4 py-4"><div className="text-xs font-bold text-slate-800">{money(s.totalValue)}</div><div className="mt-1 text-[10px] text-slate-400">{s.totalOrders} orders • {s.lastOrder}</div></td>
                    <td className="px-4 py-4"><div className={`text-xs font-bold ${s.outstanding > s.creditLimit && s.creditLimit > 0 ? "text-red-600" : "text-amber-600"}`}>{money(s.outstanding)}</div><div className="mt-1 text-[10px] text-slate-400">Limit {money(s.creditLimit)}</div></td>
                    <td className="px-4 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${s.status === "Active" ? "bg-emerald-50 text-emerald-700" : s.status === "On Hold" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{s.status}</span></td>
                    <td className="px-4 py-4"><div className="flex gap-1.5"><button onClick={() => setViewing(s)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-700 hover:bg-slate-50">View</button><button onClick={() => openEdit(s)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50">Edit</button><button onClick={() => toggleStatus(s)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-bold text-slate-500 hover:bg-slate-50">{s.status === "Active" ? "Hold" : "Activate"}</button></div></td>
                  </tr>
                ))}
                {!filteredSuppliers.length && <tr><td colSpan={10} className="px-5 py-16 text-center"><div className="text-sm font-bold text-slate-700">No suppliers found</div><p className="mt-1 text-xs text-slate-400">Try changing the search or filters.</p></td></tr>}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Rated</p>
            <p className="mt-2 font-bold text-slate-900">{bestRated?.name || "—"}</p>
            <p className="mt-1 text-xs text-emerald-600">★ {bestRated?.rating?.toFixed(1) || "—"} rating • {bestRated?.onTimeRate || 0}% on-time</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Highest Purchase Value</p>
            <p className="mt-2 font-bold text-slate-900">{highestValue?.name || "—"}</p>
            <p className="mt-1 text-xs text-indigo-600">{money(highestValue?.totalValue || 0)} across {highestValue?.totalOrders || 0} orders</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attention Required</p>
            {attention.length ? <><p className="mt-2 font-bold text-slate-900">{attention[0].name}</p><p className="mt-1 text-xs text-amber-600">{attention.length} supplier{attention.length > 1 ? "s" : ""} require review</p></> : <><p className="mt-2 font-bold text-emerald-700">No exceptions</p><p className="mt-1 text-xs text-slate-400">Supplier master is within configured controls.</p></>}
          </div>
        </section>

        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
                <div><h2 className="text-lg font-bold">{editing ? "Edit Supplier" : "Create Supplier"}</h2><p className="text-xs text-slate-500">Maintain commercial, tax and operational supplier master data.</p></div>
                <button onClick={() => setShowForm(false)} className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100">×</button>
              </div>
              <div className="space-y-6 p-6">
                <div><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-600">Identity & Tax</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-3">{formInput("Supplier Name *", "name", "Legal / trading name")}{formInput("Supplier Code *", "code", "SUP-007")}{formInput("GSTIN", "gstin", "22AAAAA0000A1Z5")}{formInput("PAN", "pan", "AAAAA0000A")}{formInput("Primary Contact *", "contact", "Contact person")}{formInput("Email *", "email", "supplier@example.com", "email")}{formInput("Phone *", "phone", "+91 XXXXX XXXXX")}{formInput("Location *", "location", "City / state")}{formInput("Website", "website", "https://...")}</div></div>
                <div><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-600">Commercial Controls</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <div><label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Category</label><select value={form.category} onChange={(e) => updateForm("category", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">{categories.filter((x) => x !== "All Categories").map((x) => <option key={x}>{x}</option>)}</select></div>
                  <div><label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tier</label><select value={form.tier} onChange={(e) => updateForm("tier", e.target.value as SupplierTier)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">{tiers.map((x) => <option key={x}>{x}</option>)}</select></div>
                  <div><label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Payment Terms</label><select value={form.paymentTerms} onChange={(e) => updateForm("paymentTerms", e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm">{["Immediate","Net 15","Net 30","Net 45","Net 60","Net 90"].map((x) => <option key={x}>{x}</option>)}</select></div>
                  {formInput("Lead Time (Days)", "leadTime", "7", "number")}
                  {formInput("Credit Limit", "creditLimit", "100000", "number")}
                  {formInput("Price List", "priceList", "Rate card / price list")}
                  <div><label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Status</label><select value={form.status} onChange={(e) => updateForm("status", e.target.value as SupplierStatus)} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"><option>Active</option><option>On Hold</option><option>Inactive</option></select></div>
                </div></div>
                <div><h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-indigo-600">Banking & Notes</h3><div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {formInput("Bank Name", "bankName" as keyof typeof form, "Use supplier bank details below")}{formInput("Account Name", "accountName" as keyof typeof form, "Account holder")}
                  {formInput("Account Number", "accountNumber" as keyof typeof form, "Account number")}{formInput("IFSC", "ifsc" as keyof typeof form, "IFSC")}
                  <div className="md:col-span-2"><label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">Internal Notes</label><textarea value={form.notes || ""} onChange={(e) => updateForm("notes", e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400" /></div>
                </div></div>
              </div>
              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4"><button onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600">Cancel</button><button onClick={saveSupplier} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">{editing ? "Save Changes" : "Create Supplier"}</button></div>
            </div>
          </div>
        )}

        {viewing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="sticky top-0 z-10 border-b border-slate-100 bg-white px-6 py-5">
                <div className="flex items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-bold">{viewing.name}</h2><span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600">{viewing.tier}</span><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${viewing.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{viewing.status}</span></div><p className="mt-1 text-xs text-slate-500">{viewing.code} • {viewing.category} • {viewing.location}</p></div><div className="flex gap-2"><button onClick={() => openEdit(viewing)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-indigo-600">Edit</button><button onClick={() => setViewing(null)} className="rounded-xl border border-slate-200 px-3 py-2 text-lg text-slate-400">×</button></div></div>
              </div>
              <div className="space-y-5 p-6">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                  {[["Rating", `★ ${viewing.rating || "—"}`], ["Orders", viewing.totalOrders], ["Purchase Value", money(viewing.totalValue)], ["Outstanding", money(viewing.outstanding)], ["PO Records", poSummary.count]].map(([a,b]) => <div key={String(a)} className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{a}</p><p className="mt-1 text-sm font-bold text-slate-800">{b}</p></div>)}
                </div>
                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 p-5"><h3 className="text-sm font-bold">Contact & Tax</h3><div className="mt-4 space-y-2 text-xs text-slate-600"><p><b>Contact:</b> {viewing.contact}</p><p><b>Email:</b> {viewing.email}</p><p><b>Phone:</b> {viewing.phone}</p><p><b>GSTIN:</b> {viewing.gstin || "Not provided"}</p><p><b>PAN:</b> {viewing.pan || "Not provided"}</p><p><b>Website:</b> {viewing.website || "Not provided"}</p></div></div>
                  <div className="rounded-2xl border border-slate-200 p-5"><h3 className="text-sm font-bold">Commercial Terms</h3><div className="mt-4 space-y-2 text-xs text-slate-600"><p><b>Payment:</b> {viewing.paymentTerms || "Not set"}</p><p><b>Lead Time:</b> {viewing.leadTime || "—"} days</p><p><b>Credit Limit:</b> {money(viewing.creditLimit)}</p><p><b>Price List:</b> {viewing.priceList || "Not assigned"}</p><p><b>Last Order:</b> {viewing.lastOrder}</p><p><b>PO Value:</b> {poSummary.value ? money(poSummary.value) : "No linked value found"}</p></div></div>
                  <div className="rounded-2xl border border-slate-200 p-5"><h3 className="text-sm font-bold">Performance</h3><div className="mt-4 space-y-4"><div><div className="mb-1 flex justify-between text-[11px]"><span>On-time delivery</span><b>{viewing.onTimeRate}%</b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, viewing.onTimeRate)}%` }} /></div></div><div><div className="mb-1 flex justify-between text-[11px]"><span>Quality acceptance</span><b>{viewing.qualityRate}%</b></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-indigo-500" style={{ width: `${Math.min(100, viewing.qualityRate)}%` }} /></div></div></div></div>
                </div>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-5"><h3 className="text-sm font-bold">Products / Services Supplied</h3><div className="mt-3 flex flex-wrap gap-2">{viewing.products.length ? viewing.products.map((p) => <span key={p} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-600">{p}</span>) : <span className="text-xs text-slate-400">No product mapping added.</span>}</div></div>
                  <div className="rounded-2xl border border-slate-200 p-5"><h3 className="text-sm font-bold">Primary Address</h3><div className="mt-3 text-xs leading-6 text-slate-600">{viewing.addresses[0] ? <>{viewing.addresses[0].address && <div>{viewing.addresses[0].address}</div>}<div>{viewing.addresses[0].city}{viewing.addresses[0].state ? `, ${viewing.addresses[0].state}` : ""} {viewing.addresses[0].pincode}</div></> : <span>No address added.</span>}</div></div>
                </div>
                <div className="rounded-2xl border border-slate-200 p-5"><h3 className="text-sm font-bold">Banking & Internal Notes</h3><div className="mt-3 grid grid-cols-1 gap-3 text-xs text-slate-600 md:grid-cols-4">{viewing.bank && <><p><b>Bank:</b> {viewing.bank.bankName}</p><p><b>Account:</b> {viewing.bank.accountName}</p><p><b>Number:</b> {viewing.bank.accountNumber}</p><p><b>IFSC:</b> {viewing.bank.ifsc}</p></>}<p className="md:col-span-4"><b>Notes:</b> {viewing.notes || "No internal notes."}</p></div></div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-400">
          <Link href="/purchase-orders" className="hover:text-indigo-600">Purchase Orders →</Link>
          <span>•</span><Link href="/purchase-requests" className="hover:text-indigo-600">Purchase Requests →</Link>
          <span>•</span><Link href="/purchase-returns" className="hover:text-indigo-600">Purchase Returns →</Link>
        </div>
      </div>
    </div>
  );
}
