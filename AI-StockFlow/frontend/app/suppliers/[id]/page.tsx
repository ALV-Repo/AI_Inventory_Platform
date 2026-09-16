"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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

type PurchaseOrder = {
  id?: string | number;
  number?: string;
  poNumber?: string;
  supplier?: string;
  supplierName?: string;
  vendor?: string;
  vendorName?: string;
  supplierCode?: string;
  date?: string;
  orderDate?: string;
  items?: number;
  amount?: number;
  total?: number;
  totalAmount?: number;
  grandTotal?: number;
  value?: number;
  status?: string;
  warehouse?: string;
  [key: string]: unknown;
};

type LedgerEntry = {
  id: string;
  date: string;
  reference: string;
  type: "Purchase" | "Payment" | "Return" | "Adjustment";
  debit: number;
  credit: number;
  balance: number;
};

const seedSuppliers: Supplier[] = [
  {
    id: 1,
    name: "Tech Supplies India",
    code: "SUP-001",
    contact: "Rahul Mehta",
    email: "rahul@techsupplies.in",
    phone: "+91 98765 43210",
    gstin: "29AAAAA0000A1Z5",
    pan: "AAAAA0000A",
    paymentTerms: "Net 30",
    leadTime: "7",
    priceList: "Electronics Wholesale",
    category: "Electronics",
    location: "Bengaluru",
    rating: 4.8,
    totalOrders: 24,
    totalValue: 845000,
    outstanding: 42000,
    status: "Active",
    tier: "Strategic",
    lastOrder: "21 Aug 2026",
    creditLimit: 250000,
    currency: "INR",
    website: "https://example.com",
    notes: "Primary electronics supplier.",
    contacts: [
      {
        name: "Rahul Mehta",
        role: "Account Manager",
        email: "rahul@techsupplies.in",
        phone: "+91 98765 43210",
      },
    ],
    addresses: [
      {
        label: "Head Office",
        address: "12 Electronic City",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560100",
      },
    ],
    bank: {
      bankName: "HDFC Bank",
      accountName: "Tech Supplies India",
      accountNumber: "XXXXXX4582",
      ifsc: "HDFC0001234",
    },
    products: ["Laptops", "Monitors", "Keyboards", "Networking"],
    onTimeRate: 96,
    qualityRate: 98,
    createdAt: "2026-01-12",
  },
  {
    id: 2,
    name: "Digital World",
    code: "SUP-002",
    contact: "Priya Sharma",
    email: "priya@digitalworld.in",
    phone: "+91 99887 66554",
    gstin: "36BBBBB1111B2Z6",
    pan: "BBBBB1111B",
    paymentTerms: "Net 30",
    leadTime: "10",
    priceList: "Standard Electronics",
    category: "Electronics",
    location: "Hyderabad",
    rating: 4.5,
    totalOrders: 18,
    totalValue: 628000,
    outstanding: 28000,
    status: "Active",
    tier: "Preferred",
    lastOrder: "20 Aug 2026",
    creditLimit: 200000,
    currency: "INR",
    contacts: [{ name: "Priya Sharma", role: "Sales Manager", email: "priya@digitalworld.in", phone: "+91 99887 66554" }],
    addresses: [{ label: "Warehouse", address: "44 HITEC City Road", city: "Hyderabad", state: "Telangana", pincode: "500081" }],
    products: ["Cameras", "Headsets", "Accessories"],
    onTimeRate: 93,
    qualityRate: 95,
    createdAt: "2026-02-04",
  },
  {
    id: 3,
    name: "Office Mart",
    code: "SUP-003",
    contact: "Arjun Rao",
    email: "arjun@officemart.in",
    phone: "+91 91234 56789",
    gstin: "33CCCCC2222C3Z7",
    pan: "CCCCC2222C",
    paymentTerms: "Net 45",
    leadTime: "5",
    priceList: "Office Supplies Rate Card",
    category: "Office Supplies",
    location: "Chennai",
    rating: 4.2,
    totalOrders: 15,
    totalValue: 412000,
    outstanding: 12500,
    status: "Active",
    tier: "Standard",
    lastOrder: "19 Aug 2026",
    creditLimit: 120000,
    currency: "INR",
    contacts: [{ name: "Arjun Rao", role: "Sales Executive", email: "arjun@officemart.in", phone: "+91 91234 56789" }],
    addresses: [{ label: "Branch", address: "18 Mount Road", city: "Chennai", state: "Tamil Nadu", pincode: "600002" }],
    products: ["Paper", "Stationery", "Printer Supplies"],
    onTimeRate: 91,
    qualityRate: 94,
    createdAt: "2026-02-18",
  },
  {
    id: 4,
    name: "Industrial Solutions",
    code: "SUP-004",
    contact: "Sneha Reddy",
    email: "sneha@industrial.in",
    phone: "+91 90909 80808",
    gstin: "27DDDDD3333D4Z8",
    pan: "DDDDD3333D",
    paymentTerms: "Net 60",
    leadTime: "14",
    priceList: "Industrial Contract",
    category: "Industrial",
    location: "Pune",
    rating: 4.0,
    totalOrders: 11,
    totalValue: 385000,
    outstanding: 35000,
    status: "On Hold",
    tier: "Standard",
    lastOrder: "18 Aug 2026",
    creditLimit: 100000,
    currency: "INR",
    notes: "Review supplier performance before reactivation.",
    contacts: [{ name: "Sneha Reddy", role: "Key Account Manager", email: "sneha@industrial.in", phone: "+91 90909 80808" }],
    addresses: [{ label: "Plant", address: "MIDC Industrial Area", city: "Pune", state: "Maharashtra", pincode: "411019" }],
    products: ["Equipment", "Components", "Safety Gear"],
    onTimeRate: 84,
    qualityRate: 89,
    createdAt: "2026-03-02",
  },
  {
    id: 5,
    name: "Metro Electronics",
    code: "SUP-005",
    contact: "Vikram Singh",
    email: "vikram@metroelectronics.in",
    phone: "+91 90123 45678",
    gstin: "27EEEEE4444E5Z9",
    pan: "EEEEE4444E",
    paymentTerms: "Net 30",
    leadTime: "8",
    priceList: "Metro Dealer Price",
    category: "Electronics",
    location: "Mumbai",
    rating: 4.7,
    totalOrders: 21,
    totalValue: 725000,
    outstanding: 18500,
    status: "Active",
    tier: "Preferred",
    lastOrder: "16 Aug 2026",
    creditLimit: 180000,
    currency: "INR",
    contacts: [{ name: "Vikram Singh", role: "Business Manager", email: "vikram@metroelectronics.in", phone: "+91 90123 45678" }],
    addresses: [{ label: "Distribution Hub", address: "7 Andheri East", city: "Mumbai", state: "Maharashtra", pincode: "400069" }],
    products: ["Earbuds", "Gaming Headsets", "Mice", "Keyboards"],
    onTimeRate: 95,
    qualityRate: 97,
    createdAt: "2026-03-11",
  },
  {
    id: 6,
    name: "Home Essentials",
    code: "SUP-006",
    contact: "Kavya Nair",
    email: "kavya@homeessentials.in",
    phone: "+91 93456 78901",
    gstin: "32FFFFF5555F6Z0",
    pan: "FFFFF5555F",
    paymentTerms: "Immediate",
    leadTime: "6",
    priceList: "Home Essentials Wholesale",
    category: "Home",
    location: "Kochi",
    rating: 4.3,
    totalOrders: 13,
    totalValue: 298000,
    outstanding: 9000,
    status: "Active",
    tier: "Standard",
    lastOrder: "14 Aug 2026",
    creditLimit: 90000,
    currency: "INR",
    contacts: [{ name: "Kavya Nair", role: "Owner", email: "kavya@homeessentials.in", phone: "+91 93456 78901" }],
    addresses: [{ label: "Office", address: "21 MG Road", city: "Kochi", state: "Kerala", pincode: "682016" }],
    products: ["Home Appliances", "Storage", "Cleaning Supplies"],
    onTimeRate: 90,
    qualityRate: 93,
    createdAt: "2026-04-05",
  },
];

const money = (value: number) =>
  `₹${Math.round(Number(value) || 0).toLocaleString("en-IN")}`;

const parseNumber = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

const normaliseSupplier = (raw: Partial<Supplier>): Supplier => {
  const base = seedSuppliers[0];
  return {
    ...base,
    ...raw,
    id: parseNumber(raw.id) || base.id,
    name: String(raw.name || base.name),
    code: String(raw.code || base.code),
    contact: String(raw.contact || base.contact),
    email: String(raw.email || base.email),
    phone: String(raw.phone || base.phone),
    rating: parseNumber(raw.rating),
    totalOrders: parseNumber(raw.totalOrders),
    totalValue: parseNumber(raw.totalValue),
    outstanding: parseNumber(raw.outstanding),
    creditLimit: parseNumber(raw.creditLimit),
    contacts: Array.isArray(raw.contacts) ? raw.contacts : base.contacts,
    addresses: Array.isArray(raw.addresses) ? raw.addresses : base.addresses,
    products: Array.isArray(raw.products) ? raw.products : [],
    onTimeRate: parseNumber(raw.onTimeRate),
    qualityRate: parseNumber(raw.qualityRate),
  };
};

export default function SupplierDetailPage() {
  const params = useParams();
  const router = useRouter();

  const id = Number(params.id);
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "orders" | "ledger" | "activity">("overview");
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [showEdit, setShowEdit] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAddress, setShowAddress] = useState(false);

  const [editForm, setEditForm] = useState({
    gstin: "",
    pan: "",
    paymentTerms: "Net 30",
    leadTime: "7",
    priceList: "",
    creditLimit: "0",
    tier: "Standard" as SupplierTier,
    status: "Active" as SupplierStatus,
    website: "",
    notes: "",
  });

  const [contactForm, setContactForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
  });

  const [addressForm, setAddressForm] = useState({
    label: "Branch",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("stockflow-suppliers");
      const parsed = saved ? JSON.parse(saved) : null;
      const list: Supplier[] = Array.isArray(parsed) && parsed.length
        ? parsed.map((x: Partial<Supplier>) => normaliseSupplier(x))
        : seedSuppliers;

      const found = list.find((x) => x.id === id) || null;
      setSupplier(found);

      const poSaved =
        localStorage.getItem("stockflow-purchase-orders") ||
        localStorage.getItem("purchase-orders") ||
        localStorage.getItem("purchaseOrders");

      if (poSaved) {
        const parsedPO = JSON.parse(poSaved);
        if (Array.isArray(parsedPO)) setPurchaseOrders(parsedPO as PurchaseOrder[]);
      }

      const ledgerSaved = localStorage.getItem("stockflow-supplier-ledger");
      if (ledgerSaved) {
        const parsedLedger = JSON.parse(ledgerSaved);
        if (Array.isArray(parsedLedger)) setLedger(parsedLedger as LedgerEntry[]);
      }
    } catch {
      const fallback = seedSuppliers.find((x) => x.id === id) || null;
      setSupplier(fallback);
    } finally {
      setLoaded(true);
    }
  }, [id]);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(""), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const supplierOrders = useMemo(() => {
    if (!supplier) return [];

    return purchaseOrders.filter((po) => {
      const values = [
        po.supplier,
        po.supplierName,
        po.vendor,
        po.vendorName,
        po.supplierCode,
      ].map((v) => String(v || "").toLowerCase());

      return values.some(
        (value) =>
          value === supplier.name.toLowerCase() ||
          value === supplier.code.toLowerCase() ||
          value.includes(supplier.name.toLowerCase())
      );
    });
  }, [purchaseOrders, supplier]);

  const orderMetrics = useMemo(() => {
    const total = supplierOrders.reduce((sum, po) => {
      const value = [po.total, po.totalAmount, po.grandTotal, po.amount, po.value]
        .map(parseNumber)
        .find((n) => n > 0) || 0;
      return sum + value;
    }, 0);

    const received = supplierOrders.filter((po) =>
      String(po.status || "").toLowerCase().includes("received")
    ).length;

    const pending = supplierOrders.filter((po) =>
      ["pending", "approval", "approved", "sent", "processing"].some((x) =>
        String(po.status || "").toLowerCase().includes(x)
      )
    ).length;

    return { total, received, pending };
  }, [supplierOrders]);

  const creditUtilisation = useMemo(() => {
    if (!supplier || supplier.creditLimit <= 0) return 0;
    return Math.min(100, (supplier.outstanding / supplier.creditLimit) * 100);
  }, [supplier]);

  const effectiveMetrics = useMemo(() => {
    if (!supplier) {
      return {
        rating: 0,
        onTime: 0,
        quality: 0,
        fill: 0,
        price: 0,
      };
    }

    return {
      rating: supplier.rating,
      onTime: supplier.onTimeRate,
      quality: supplier.qualityRate,
      fill: Math.round((supplier.onTimeRate + supplier.qualityRate) / 2),
      price: Math.max(0, Math.min(100, 100 - Math.abs(supplier.onTimeRate - supplier.qualityRate))),
    };
  }, [supplier]);

  useEffect(() => {
    if (!supplier || !loaded) return;

    setEditForm({
      gstin: supplier.gstin || "",
      pan: supplier.pan || "",
      paymentTerms: supplier.paymentTerms || "Net 30",
      leadTime: supplier.leadTime || "7",
      priceList: supplier.priceList || "",
      creditLimit: String(supplier.creditLimit || 0),
      tier: supplier.tier,
      status: supplier.status,
      website: supplier.website || "",
      notes: supplier.notes || "",
    });
  }, [supplier, loaded]);

  const openEdit = () => {
    if (!supplier) return;
    setEditForm({
      gstin: supplier.gstin || "",
      pan: supplier.pan || "",
      paymentTerms: supplier.paymentTerms || "Net 30",
      leadTime: supplier.leadTime || "7",
      priceList: supplier.priceList || "",
      creditLimit: String(supplier.creditLimit || 0),
      tier: supplier.tier,
      status: supplier.status,
      website: supplier.website || "",
      notes: supplier.notes || "",
    });
    setShowEdit(true);
  };

  const saveEdit = () => {
    if (!supplier) return;

    const updated: Supplier = {
      ...supplier,
      gstin: editForm.gstin.trim().toUpperCase(),
      pan: editForm.pan.trim().toUpperCase(),
      paymentTerms: editForm.paymentTerms,
      leadTime: String(Math.max(0, parseNumber(editForm.leadTime))),
      priceList: editForm.priceList.trim(),
      creditLimit: Math.max(0, parseNumber(editForm.creditLimit)),
      tier: editForm.tier,
      status: editForm.status,
      website: editForm.website.trim(),
      notes: editForm.notes.trim(),
    };

    try {
      const saved = localStorage.getItem("stockflow-suppliers");
      const parsed = saved ? JSON.parse(saved) : [];
      const list: Supplier[] = Array.isArray(parsed) ? parsed : seedSuppliers;
      const next = list.map((item) => item.id === updated.id ? updated : item);
      localStorage.setItem("stockflow-suppliers", JSON.stringify(next));
    } catch {
      localStorage.setItem("stockflow-suppliers", JSON.stringify(
        seedSuppliers.map((item) => item.id === updated.id ? updated : item)
      ));
    }

    setSupplier(updated);
    setShowEdit(false);
    setMessage("Supplier master updated successfully.");
  };

  const addContact = () => {
    if (!supplier) return;
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.phone.trim()) {
      setMessage("Name, email and phone are required.");
      return;
    }

    const updated = {
      ...supplier,
      contacts: [...supplier.contacts, {
        name: contactForm.name.trim(),
        role: contactForm.role.trim() || "Supplier Contact",
        email: contactForm.email.trim(),
        phone: contactForm.phone.trim(),
      }],
    };

    persistSupplier(updated);
    setSupplier(updated);
    setContactForm({ name: "", role: "", email: "", phone: "" });
    setShowContact(false);
    setMessage("Supplier contact added.");
  };

  const addAddress = () => {
    if (!supplier) return;
    if (!addressForm.city.trim() || !addressForm.pincode.trim()) {
      setMessage("City and pincode are required.");
      return;
    }

    const updated = {
      ...supplier,
      addresses: [...supplier.addresses, {
        label: addressForm.label.trim() || "Branch",
        address: addressForm.address.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
      }],
    };

    persistSupplier(updated);
    setSupplier(updated);
    setAddressForm({ label: "Branch", address: "", city: "", state: "", pincode: "" });
    setShowAddress(false);
    setMessage("Supplier address added.");
  };

  const persistSupplier = (updated: Supplier) => {
    try {
      const saved = localStorage.getItem("stockflow-suppliers");
      const parsed = saved ? JSON.parse(saved) : [];
      const list: Supplier[] = Array.isArray(parsed) && parsed.length ? parsed : seedSuppliers;
      localStorage.setItem(
        "stockflow-suppliers",
        JSON.stringify(list.map((item) => item.id === updated.id ? updated : item))
      );
    } catch {
      localStorage.setItem(
        "stockflow-suppliers",
        JSON.stringify(seedSuppliers.map((item) => item.id === updated.id ? updated : item))
      );
    }
  };

  const createPurchaseOrder = () => {
    router.push(`/purchase-orders?supplier=${encodeURIComponent(supplier?.code || "")}`);
  };

  const seedLedger = useMemo<LedgerEntry[]>(() => {
    if (!supplier) return [];

    const opening = Math.max(0, supplier.outstanding - 42000);
    return [
      {
        id: `${supplier.code}-opening`,
        date: "01 Aug 2026",
        reference: "OPENING-BAL",
        type: "Adjustment",
        debit: opening,
        credit: 0,
        balance: opening,
      },
      {
        id: `${supplier.code}-po`,
        date: supplier.lastOrder,
        reference: supplierOrders[0]?.number || "PO-2026-001",
        type: "Purchase",
        debit: Math.min(orderMetrics.total || supplier.totalValue, supplier.outstanding + 42000),
        credit: 0,
        balance: supplier.outstanding + 42000,
      },
      {
        id: `${supplier.code}-payment`,
        date: "18 Aug 2026",
        reference: `PAY-${supplier.code.replace("SUP-", "")}-018`,
        type: "Payment",
        debit: 0,
        credit: 42000,
        balance: supplier.outstanding,
      },
    ];
  }, [supplier, supplierOrders, orderMetrics.total]);

  const displayedLedger = ledger.length ? ledger : seedLedger;

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc]">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-semibold text-slate-600 shadow-sm">
          Loading supplier profile...
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fc] p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-xl text-red-500">!</div>
          <h1 className="mt-4 text-xl font-bold text-slate-900">Supplier not found</h1>
          <p className="mt-2 text-sm text-slate-500">The requested supplier record is not available in the supplier master.</p>
          <Link href="/suppliers" className="mt-5 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
            Back to Suppliers
          </Link>
        </div>
      </div>
    );
  }

  const statusClass =
    supplier.status === "Active"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : supplier.status === "On Hold"
        ? "bg-amber-50 text-amber-700 border-amber-100"
        : "bg-slate-100 text-slate-600 border-slate-200";

  const metricCards = [
    ["Supplier Rating", `★ ${supplier.rating || "—"}`, "Overall supplier score", "text-violet-600"],
    ["Purchase Orders", supplier.totalOrders.toString(), `${orderMetrics.pending} active workflow records`, "text-slate-900"],
    ["Purchase Value", money(supplier.totalValue), "Lifetime recorded purchasing", "text-indigo-600"],
    ["Outstanding", money(supplier.outstanding), `Credit used ${creditUtilisation.toFixed(0)}%`, supplier.outstanding > supplier.creditLimit && supplier.creditLimit > 0 ? "text-red-600" : "text-amber-600"],
    ["Linked PO Value", money(orderMetrics.total), `${orderMetrics.received} received`, "text-blue-600"],
  ];

  const progress = (label: string, value: number, textClass = "text-indigo-600") => (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">{label}</span>
        <span className={`font-bold ${textClass}`}>{Math.round(value)}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${textClass.replace("text-", "bg-")}`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f6f8fc] px-4 py-5 text-slate-900 md:px-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs">
          <Link href="/suppliers" className="font-semibold text-indigo-600 hover:text-indigo-800">← Supplier Directory</Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-400">{supplier.code}</span>
        </div>

        {message && (
          <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700">
            {message}
          </div>
        )}

        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_24px_rgba(15,23,42,0.05)] md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xl font-bold text-white shadow-sm">
                {supplier.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{supplier.name}</h1>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${statusClass}`}>{supplier.status}</span>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">{supplier.tier}</span>
                </div>
                <p className="mt-1 text-sm text-slate-500">{supplier.code} • {supplier.category} • {supplier.location}</p>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-400">
                  <span>GSTIN: {supplier.gstin || "Not added"}</span>
                  <span>•</span>
                  <span>Last order: {supplier.lastOrder}</span>
                  <span>•</span>
                  <span>Added: {supplier.createdAt}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button onClick={openEdit} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                Edit Supplier
              </button>
              <button onClick={createPurchaseOrder} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                + Purchase Order
              </button>
            </div>
          </div>
        </header>

        <section className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metricCards.map(([label, value, sub, color]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">{label}</p>
              <p className={`mt-2 text-2xl font-bold ${color}`}>{value}</p>
              <p className="mt-1 text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </section>

        <div className="mb-5 flex overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          {[
            ["overview", "Overview"],
            ["orders", "Purchase Orders"],
            ["ledger", "Supplier Ledger"],
            ["activity", "Contacts & Addresses"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setActiveTab(value as typeof activeTab)}
              className={`whitespace-nowrap rounded-xl px-5 py-2.5 text-xs font-bold transition ${
                activeTab === value ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold">Supplier Profile</h2>
                    <p className="mt-1 text-xs text-slate-500">Identity, tax registration and commercial master data.</p>
                  </div>
                  <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">MASTER DATA</span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {[
                    ["Supplier Name", supplier.name],
                    ["Supplier Code", supplier.code],
                    ["Category", supplier.category],
                    ["GSTIN", supplier.gstin || "Not provided"],
                    ["PAN", supplier.pan || "Not provided"],
                    ["Location", supplier.location],
                    ["Payment Terms", supplier.paymentTerms || "Not set"],
                    ["Lead Time", `${supplier.leadTime || "—"} days`],
                    ["Price List", supplier.priceList || "Not assigned"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                      <p className="mt-1.5 break-words text-sm font-semibold text-slate-800">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold">Performance Scorecard</h2>
                <p className="mt-1 text-xs text-slate-500">Operational indicators stored in supplier master.</p>
                <div className="mt-6 space-y-5">
                  {progress("Overall rating", (effectiveMetrics.rating / 5) * 100, "text-violet-600")}
                  {progress("On-time delivery", effectiveMetrics.onTime, "text-emerald-600")}
                  {progress("Quality acceptance", effectiveMetrics.quality, "text-indigo-600")}
                  {progress("Fill rate", effectiveMetrics.fill, "text-blue-600")}
                  {progress("Price stability", effectiveMetrics.price, "text-cyan-600")}
                </div>
              </section>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold">Credit Control</h2>
                <p className="mt-1 text-xs text-slate-500">Outstanding exposure against configured credit limit.</p>
                <div className="mt-5">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-bold text-amber-600">{money(supplier.outstanding)}</p>
                      <p className="mt-1 text-xs text-slate-400">Outstanding</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-700">{money(supplier.creditLimit)}</p>
                      <p className="mt-1 text-xs text-slate-400">Credit limit</p>
                    </div>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${creditUtilisation > 90 ? "bg-red-500" : creditUtilisation > 70 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${creditUtilisation}%` }} />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-400">{creditUtilisation.toFixed(1)}% of credit limit utilised</p>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold">Products / Services</h2>
                <p className="mt-1 text-xs text-slate-500">Mapped supplier catalogue.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {supplier.products.length ? supplier.products.map((product) => (
                    <span key={product} className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">{product}</span>
                  )) : (
                    <span className="text-xs text-slate-400">No product mapping added.</span>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold">Primary Contact</h2>
                <p className="mt-1 text-xs text-slate-500">Main commercial contact.</p>
                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <p className="font-semibold text-slate-800">{supplier.contact}</p>
                  <p>{supplier.email}</p>
                  <p>{supplier.phone}</p>
                  {supplier.website && <p className="break-all text-indigo-600">{supplier.website}</p>}
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold">Procurement Snapshot</h2>
                  <p className="mt-1 text-xs text-slate-500">Current purchasing relationship and workflow activity.</p>
                </div>
                <Link href="/purchase-orders" className="text-xs font-bold text-indigo-600 hover:text-indigo-800">Open Purchase Orders →</Link>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ["Master Orders", supplier.totalOrders],
                  ["Linked PO Records", supplierOrders.length],
                  ["Linked PO Value", money(orderMetrics.total)],
                  ["Received POs", orderMetrics.received],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                    <p className="mt-1 text-lg font-bold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </section>

            {supplier.notes && (
              <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Internal Notes</p>
                <p className="mt-2 text-sm font-medium text-amber-900">{supplier.notes}</p>
              </section>
            )}
          </div>
        )}

        {activeTab === "orders" && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-base font-bold">Purchase Order History</h2>
                <p className="mt-1 text-xs text-slate-500">Purchase orders linked to {supplier.name}.</p>
              </div>
              <button onClick={createPurchaseOrder} className="rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white">+ New PO</button>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-5 md:grid-cols-4">
              {[
                ["Linked Orders", supplierOrders.length],
                ["Linked Value", money(orderMetrics.total)],
                ["Received", orderMetrics.received],
                ["Active", orderMetrics.pending],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-lg font-bold text-slate-800">{value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    {["PO Number", "Date", "Warehouse", "Items", "Amount", "Status"].map((h) => (
                      <th key={h} className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(supplierOrders.length ? supplierOrders : [
                    { number: "PO-2026-001", date: supplier.lastOrder, items: 3, amount: 84000, status: "Pending Approval" },
                    { number: "PO-2026-002", date: "12 Aug 2026", items: 4, amount: 48000, status: "Approved" },
                    { number: "PO-2026-003", date: "02 Aug 2026", items: 5, amount: 32000, status: "Received" },
                  ] as PurchaseOrder[]).map((order, index) => {
                    const amount = [order.total, order.totalAmount, order.grandTotal, order.amount, order.value]
                      .map(parseNumber).find((n) => n > 0) || 0;
                    const number = order.number || order.poNumber || `PO-${index + 1}`;

                    return (
                      <tr key={`${number}-${index}`} className="border-b border-slate-100 hover:bg-slate-50/70">
                        <td className="px-5 py-4 text-xs font-bold text-indigo-600">{number}</td>
                        <td className="px-5 py-4 text-xs text-slate-600">{order.date || order.orderDate || "—"}</td>
                        <td className="px-5 py-4 text-xs text-slate-600">{order.warehouse || "—"}</td>
                        <td className="px-5 py-4 text-xs text-slate-600">{order.items ?? "—"}</td>
                        <td className="px-5 py-4 text-xs font-bold text-slate-800">{money(amount)}</td>
                        <td className="px-5 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            String(order.status || "").toLowerCase().includes("received")
                              ? "bg-emerald-50 text-emerald-700"
                              : String(order.status || "").toLowerCase().includes("approved")
                                ? "bg-blue-50 text-blue-700"
                                : "bg-amber-50 text-amber-700"
                          }`}>
                            {order.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "ledger" && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5">
              <h2 className="text-base font-bold">Supplier Ledger</h2>
              <p className="mt-1 text-xs text-slate-500">Debit, credit and running balance for the supplier relationship.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 border-b border-slate-100 p-5 md:grid-cols-4">
              <div className="rounded-xl bg-red-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-red-400">Total Debit</p><p className="mt-1 text-lg font-bold text-red-600">{money(displayedLedger.reduce((s, x) => s + x.debit, 0))}</p></div>
              <div className="rounded-xl bg-emerald-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500">Total Credit</p><p className="mt-1 text-lg font-bold text-emerald-600">{money(displayedLedger.reduce((s, x) => s + x.credit, 0))}</p></div>
              <div className="rounded-xl bg-amber-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-amber-500">Current Due</p><p className="mt-1 text-lg font-bold text-amber-600">{money(supplier.outstanding)}</p></div>
              <div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Entries</p><p className="mt-1 text-lg font-bold text-slate-800">{displayedLedger.length}</p></div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left">
                <thead className="bg-slate-50">
                  <tr className="border-b border-slate-200">
                    {["Date", "Reference", "Type", "Debit", "Credit", "Balance"].map((h) => (
                      <th key={h} className={`px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${["Debit", "Credit", "Balance"].includes(h) ? "text-right" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {displayedLedger.map((entry) => (
                    <tr key={entry.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                      <td className="px-5 py-4 text-xs text-slate-600">{entry.date}</td>
                      <td className="px-5 py-4 text-xs font-bold text-indigo-600">{entry.reference}</td>
                      <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">{entry.type}</span></td>
                      <td className="px-5 py-4 text-right text-xs font-semibold text-red-600">{entry.debit ? money(entry.debit) : "—"}</td>
                      <td className="px-5 py-4 text-right text-xs font-semibold text-emerald-600">{entry.credit ? money(entry.credit) : "—"}</td>
                      <td className="px-5 py-4 text-right text-xs font-bold text-slate-800">{money(entry.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "activity" && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold">Contacts</h2>
                  <p className="mt-1 text-xs text-slate-500">Supplier relationship contacts.</p>
                </div>
                <button onClick={() => setShowContact(true)} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">+ Contact</button>
              </div>

              <div className="mt-5 space-y-3">
                {supplier.contacts.map((contact, index) => (
                  <div key={`${contact.email}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <p className="font-bold text-slate-800">{contact.name}</p>
                    <p className="mt-1 text-xs text-indigo-600">{contact.role}</p>
                    <div className="mt-3 space-y-1 text-xs text-slate-500">
                      <p>{contact.email}</p>
                      <p>{contact.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold">Addresses</h2>
                  <p className="mt-1 text-xs text-slate-500">Supplier office, warehouse and delivery locations.</p>
                </div>
                <button onClick={() => setShowAddress(true)} className="rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white">+ Address</button>
              </div>

              <div className="mt-5 space-y-3">
                {supplier.addresses.map((address, index) => (
                  <div key={`${address.label}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800">{address.label}</p>
                      {index === 0 && <span className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-600">PRIMARY</span>}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {address.address && <>{address.address}<br /></>}
                      {address.city}{address.state ? `, ${address.state}` : ""} {address.pincode}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
              <h2 className="text-base font-bold">Banking & Commercial Controls</h2>
              <p className="mt-1 text-xs text-slate-500">Supplier payment and settlement configuration.</p>
              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Bank</p><p className="mt-1 text-sm font-bold text-slate-700">{supplier.bank?.bankName || "Not provided"}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Account</p><p className="mt-1 text-sm font-bold text-slate-700">{supplier.bank?.accountName || "Not provided"}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Account Number</p><p className="mt-1 text-sm font-bold text-slate-700">{supplier.bank?.accountNumber || "Not provided"}</p></div>
                <div className="rounded-xl bg-slate-50 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">IFSC</p><p className="mt-1 text-sm font-bold text-slate-700">{supplier.bank?.ifsc || "Not provided"}</p></div>
              </div>
            </section>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3 text-xs text-slate-400">
          <Link href="/suppliers" className="hover:text-indigo-600">Supplier Directory</Link>
          <span>•</span>
          <Link href="/purchase-orders" className="hover:text-indigo-600">Purchase Orders</Link>
          <span>•</span>
          <Link href="/purchase-requests" className="hover:text-indigo-600">Purchase Requests</Link>
          <span>•</span>
          <Link href="/purchase-returns" className="hover:text-indigo-600">Purchase Returns</Link>
        </div>
      </div>

      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div><h2 className="text-lg font-bold">Edit Supplier</h2><p className="mt-1 text-xs text-slate-500">Update commercial, tax and operational controls.</p></div>
              <button onClick={() => setShowEdit(false)} className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100">×</button>
            </div>

            <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
              {[
                ["GSTIN", "gstin", "29AAAAA0000A1Z5"],
                ["PAN", "pan", "AAAAA0000A"],
                ["Lead Time (Days)", "leadTime", "7"],
                ["Credit Limit", "creditLimit", "100000"],
                ["Price List", "priceList", "Rate card"],
                ["Website", "website", "https://..."],
              ].map(([label, key, placeholder]) => (
                <div key={key}>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</label>
                  <input
                    type={key === "leadTime" || key === "creditLimit" ? "number" : "text"}
                    value={editForm[key as keyof typeof editForm]}
                    placeholder={placeholder}
                    onChange={(e) => setEditForm((current) => ({ ...current, [key]: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50"
                  />
                </div>
              ))}

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Payment Terms</label>
                <select value={editForm.paymentTerms} onChange={(e) => setEditForm((x) => ({ ...x, paymentTerms: e.target.value }))} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm">
                  {["Immediate", "Net 15", "Net 30", "Net 45", "Net 60", "Net 90"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Tier</label>
                <select value={editForm.tier} onChange={(e) => setEditForm((x) => ({ ...x, tier: e.target.value as SupplierTier }))} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm">
                  {["Strategic", "Preferred", "Standard", "New"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm((x) => ({ ...x, status: e.target.value as SupplierStatus }))} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm">
                  {["Active", "On Hold", "Inactive"].map((x) => <option key={x}>{x}</option>)}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">Internal Notes</label>
                <textarea value={editForm.notes} onChange={(e) => setEditForm((x) => ({ ...x, notes: e.target.value }))} rows={4} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400" />
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowEdit(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={saveEdit} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {showContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div><h2 className="text-lg font-bold">Add Contact</h2><p className="mt-1 text-xs text-slate-500">Add a supplier relationship contact.</p></div>
              <button onClick={() => setShowContact(false)} className="text-xl text-slate-400">×</button>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {[
                ["Name", "name", "Rahul Mehta"],
                ["Role", "role", "Account Manager"],
                ["Email", "email", "name@supplier.com"],
                ["Phone", "phone", "+91 XXXXX XXXXX"],
              ].map(([label, key, placeholder]) => (
                <div key={key}>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</label>
                  <input value={contactForm[key as keyof typeof contactForm]} onChange={(e) => setContactForm((x) => ({ ...x, [key]: e.target.value }))} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowContact(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={addContact} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Add Contact</button>
            </div>
          </div>
        </div>
      )}

      {showAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div><h2 className="text-lg font-bold">Add Address</h2><p className="mt-1 text-xs text-slate-500">Add a supplier operating location.</p></div>
              <button onClick={() => setShowAddress(false)} className="text-xl text-slate-400">×</button>
            </div>
            <div className="grid gap-4 p-6 md:grid-cols-2">
              {[
                ["Label", "label", "Branch"],
                ["Address", "address", "Street / building"],
                ["City", "city", "Hyderabad"],
                ["State", "state", "Telangana"],
                ["Pincode", "pincode", "500001"],
              ].map(([label, key, placeholder]) => (
                <div key={key} className={key === "address" ? "md:col-span-2" : ""}>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</label>
                  <input value={addressForm[key as keyof typeof addressForm]} onChange={(e) => setAddressForm((x) => ({ ...x, [key]: e.target.value }))} placeholder={placeholder} className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400" />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
              <button onClick={() => setShowAddress(false)} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600">Cancel</button>
              <button onClick={addAddress} className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Add Address</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
