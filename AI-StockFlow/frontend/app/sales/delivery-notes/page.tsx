"use client";

import { useEffect, useMemo, useState } from "react";

type DeliveryStatus =
  | "Draft"
  | "Ready"
  | "Dispatched"
  | "Delivered"
  | "Cancelled";

type DeliveryLine = {
  id: string;
  productName: string;
  sku: string;
  orderedQty: number;
  dispatchQty: number;
  uom: string;
};

type DeliveryNote = {
  id: string;
  salesOrderId: string;
  invoiceNumber: string;
  customer: string;
  phone: string;
  destination: string;
  warehouse: string;
  dispatchDate: string;
  expectedDelivery: string;
  carrier: string;
  vehicleNumber: string;
  trackingNumber: string;
  transporter: string;
  status: DeliveryStatus;
  lines: DeliveryLine[];
  notes: string;
  createdAt: string;
  updatedAt: string;
};

type SalesOrder = {
  id: string;
  customer?: string;
  phone?: string;
  date?: string;
  items?: number;
  amount?: number;
  payment?: string;
  status?: string;
  productName?: string;
  sku?: string;
  warehouse?: string;
  orderedQty?: number;
  destination?: string;
  address?: string;
  lines?: Array<{
    id?: string;
    productName?: string;
    product?: string;
    sku?: string;
    quantity?: number;
    qty?: number;
    uom?: string;
  }>;
};

type Invoice = {
  id?: string;
  invoiceNumber: string;
  customer: string;
  phone?: string;
  date?: string;
  amount?: number;
  status?: string;
};

const STORAGE_KEY = "stockflow-delivery-notes";

const DEMO_ORDERS: SalesOrder[] = [
  {
    id: "SO-2026-001",
    customer: "Apex Retail Solutions",
    phone: "+91 98765 43210",
    date: "21 Aug 2026",
    items: 4,
    amount: 68500,
    payment: "Pending",
    status: "Confirmed",
    productName: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
    warehouse: "Main Store",
    orderedQty: 4,
    destination: "Hyderabad",
  },
  {
    id: "SO-2026-002",
    customer: "Green Valley Stores",
    phone: "+91 91234 56789",
    date: "20 Aug 2026",
    items: 2,
    amount: 32000,
    payment: "Paid",
    status: "Completed",
    productName: "Bluetooth Speaker",
    sku: "ELC-BT-600-BLK",
    warehouse: "Main Store",
    orderedQty: 2,
    destination: "Bengaluru",
  },
  {
    id: "SO-2026-003",
    customer: "Metro Office Supplies",
    phone: "+91 99887 66554",
    date: "19 Aug 2026",
    items: 6,
    amount: 84500,
    payment: "Partial",
    status: "Processing",
    productName: "Wireless Keyboard",
    sku: "GAD-KB-100",
    warehouse: "Main Store",
    orderedQty: 6,
    destination: "Hyderabad",
  },
  {
    id: "SO-2026-004",
    customer: "Sunrise Electronics",
    phone: "+91 90123 45678",
    date: "18 Aug 2026",
    items: 3,
    amount: 45800,
    payment: "Paid",
    status: "Completed",
    productName: "Gaming Mouse",
    sku: "GAD-MS-100",
    warehouse: "Main Store",
    orderedQty: 3,
    destination: "Mumbai",
  },
  {
    id: "SO-2026-005",
    customer: "City Mart",
    phone: "+91 93456 78901",
    date: "17 Aug 2026",
    items: 5,
    amount: 27500,
    payment: "Pending",
    status: "Draft",
    productName: "USB Microphone",
    sku: "GAD-MIC-100",
    warehouse: "Main Store",
    orderedQty: 5,
    destination: "Jaipur",
  },
];

const DEMO_INVOICES: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-2026-041",
    customer: "Apex Retail Solutions",
    phone: "+91 98765 43210",
    date: "21 Aug 2026",
    amount: 68500,
    status: "Pending",
  },
  {
    id: "2",
    invoiceNumber: "INV-2026-038",
    customer: "Green Valley Stores",
    phone: "+91 91234 56789",
    date: "20 Aug 2026",
    amount: 32000,
    status: "Paid",
  },
  {
    id: "3",
    invoiceNumber: "INV-2026-032",
    customer: "Metro Office Supplies",
    phone: "+91 99887 66554",
    date: "19 Aug 2026",
    amount: 84500,
    status: "Paid",
  },
  {
    id: "4",
    invoiceNumber: "INV-2026-027",
    customer: "Sunrise Electronics",
    phone: "+91 90123 45678",
    date: "18 Aug 2026",
    amount: 45800,
    status: "Paid",
  },
  {
    id: "5",
    invoiceNumber: "INV-2026-021",
    customer: "City Mart",
    phone: "+91 93456 78901",
    date: "17 Aug 2026",
    amount: 27500,
    status: "Overdue",
  },
];

const invoiceByCustomer: Record<string, string> = {
  "Apex Retail Solutions": "INV-2026-041",
  "Green Valley Stores": "INV-2026-038",
  "Metro Office Supplies": "INV-2026-032",
  "Sunrise Electronics": "INV-2026-027",
  "City Mart": "INV-2026-021",
};

const warehouses = [
  "Main Store",
  "Warehouse A",
  "Warehouse B",
  "Hyderabad Central",
  "Bengaluru Warehouse",
];

const carriers = [
  "BlueDart Freight",
  "Delhivery",
  "DTDC",
  "DHL",
  "Swift Logistics",
  "Own Fleet",
];

const statusOptions: Array<"All" | DeliveryStatus> = [
  "All",
  "Draft",
  "Ready",
  "Dispatched",
  "Delivered",
  "Cancelled",
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getOrderLines(order: SalesOrder): DeliveryLine[] {
  if (Array.isArray(order.lines) && order.lines.length > 0) {
    return order.lines.map((line, index) => {
      const quantity = Number(line.quantity ?? line.qty ?? 0);

      return {
        id: line.id ?? `${order.id}-LINE-${index + 1}`,
        productName:
          line.productName ??
          line.product ??
          `Product ${index + 1}`,
        sku: line.sku ?? "SKU-N/A",
        orderedQty: Number.isFinite(quantity) ? quantity : 0,
        dispatchQty: Number.isFinite(quantity) ? quantity : 0,
        uom: line.uom ?? "Units",
      };
    });
  }

  const quantity = Number(order.orderedQty ?? order.items ?? 0);

  return [
    {
      id: `${order.id}-LINE-1`,
      productName: order.productName ?? "Product",
      sku: order.sku ?? "SKU-N/A",
      orderedQty: Number.isFinite(quantity) ? quantity : 0,
      dispatchQty: Number.isFinite(quantity) ? quantity : 0,
      uom: "Units",
    },
  ];
}

function getStatusClass(status: DeliveryStatus) {
  if (status === "Ready") {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "Dispatched") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "Delivered") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Cancelled") {
    return "bg-red-100 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

function initialForm() {
  return {
    salesOrderId: "",
    invoiceNumber: "",
    destination: "",
    warehouse: "Main Store",
    dispatchDate: today(),
    expectedDelivery: "",
    carrier: "Delhivery",
    vehicleNumber: "",
    trackingNumber: "",
    transporter: "",
    notes: "",
  };
}

export default function DeliveryNotesPage() {
  const [orders, setOrders] =
    useState<SalesOrder[]>(DEMO_ORDERS);

  const [invoices, setInvoices] =
    useState<Invoice[]>(DEMO_INVOICES);

  const [deliveryNotes, setDeliveryNotes] =
    useState<DeliveryNote[]>([]);

  // Prevent the initial empty state from overwriting
  // delivery notes already stored in localStorage.
  const [storageLoaded, setStorageLoaded] =
    useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"All" | DeliveryStatus>("All");

  const [selectedNote, setSelectedNote] =
    useState<DeliveryNote | null>(null);

  const [printNoteData, setPrintNoteData] =
    useState<DeliveryNote | null>(null);

  const [showCreate, setShowCreate] =
    useState(false);

  const [form, setForm] =
    useState(initialForm());

  const [formLines, setFormLines] =
    useState<DeliveryLine[]>([]);

  const [message, setMessage] = useState("");

  /*
   * LOAD DATA
   *
   * This runs once when the page mounts.
   */
  useEffect(() => {
    try {
      const storedOrders =
        localStorage.getItem("stockflow-sales-orders") ??
        localStorage.getItem("sales-orders");

      if (storedOrders) {
        const parsed = JSON.parse(storedOrders);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setOrders(parsed);
        }
      }
    } catch {
      setOrders(DEMO_ORDERS);
    }

    try {
      const storedInvoices =
        localStorage.getItem("stockflow-invoices");

      if (storedInvoices) {
        const parsed = JSON.parse(storedInvoices);

        if (Array.isArray(parsed) && parsed.length > 0) {
          setInvoices(parsed);
        }
      }
    } catch {
      setInvoices(DEMO_INVOICES);
    }

    try {
      const storedNotes =
        localStorage.getItem(STORAGE_KEY);

      if (storedNotes) {
        const parsed = JSON.parse(storedNotes);

        if (Array.isArray(parsed)) {
          setDeliveryNotes(parsed);
        }
      }
    } catch {
      setDeliveryNotes([]);
    }

    // Important:
    // Only after localStorage has been read should the
    // save effect be allowed to write data.
    setStorageLoaded(true);
  }, []);

  /*
   * SAVE DATA
   *
   * The storageLoaded guard prevents the initial []
   * state from overwriting existing delivery notes.
   */
  useEffect(() => {
    if (!storageLoaded) {
      return;
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(deliveryNotes)
    );
  }, [deliveryNotes, storageLoaded]);

  const eligibleOrders = useMemo(() => {
    return orders.filter((order) => {
      const status =
        String(order.status ?? "").toLowerCase();

      return (
        status === "confirmed" ||
        status === "processing" ||
        status === "completed"
      );
    });
  }, [orders]);

  const filteredNotes = useMemo(() => {
    const query = search.toLowerCase().trim();

    return deliveryNotes.filter((note) => {
      const matchesSearch =
        !query ||
        note.id.toLowerCase().includes(query) ||
        note.salesOrderId.toLowerCase().includes(query) ||
        note.invoiceNumber.toLowerCase().includes(query) ||
        note.customer.toLowerCase().includes(query) ||
        note.destination.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" ||
        note.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deliveryNotes, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: deliveryNotes.length,
      ready: deliveryNotes.filter(
        (item) => item.status === "Ready"
      ).length,
      dispatched: deliveryNotes.filter(
        (item) => item.status === "Dispatched"
      ).length,
      delivered: deliveryNotes.filter(
        (item) => item.status === "Delivered"
      ).length,
    }),
    [deliveryNotes]
  );

  function updateForm(
    key: keyof ReturnType<typeof initialForm>,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function selectOrder(orderId: string) {
    const order = orders.find(
      (item) => item.id === orderId
    );

    if (!order) return;

    const invoice =
      invoices.find(
        (item) =>
          item.customer.toLowerCase() ===
          String(order.customer ?? "").toLowerCase()
      ) ??
      invoices.find(
        (item) =>
          item.invoiceNumber ===
          invoiceByCustomer[order.customer ?? ""]
      );

    setForm((current) => ({
      ...current,
      salesOrderId: order.id,
      invoiceNumber:
        invoice?.invoiceNumber ??
        invoiceByCustomer[order.customer ?? ""] ??
        "",
      destination:
        order.destination ??
        order.address ??
        "",
      warehouse:
        order.warehouse ??
        "Main Store",
    }));

    setFormLines(getOrderLines(order));
  }

  function openCreate() {
    const firstOrder = eligibleOrders[0];

    if (firstOrder) {
      const invoice =
        invoices.find(
          (item) =>
            item.customer.toLowerCase() ===
            String(firstOrder.customer ?? "").toLowerCase()
        ) ??
        invoices.find(
          (item) =>
            item.invoiceNumber ===
            invoiceByCustomer[firstOrder.customer ?? ""]
        );

      setForm({
        ...initialForm(),
        salesOrderId: firstOrder.id,
        invoiceNumber:
          invoice?.invoiceNumber ??
          invoiceByCustomer[firstOrder.customer ?? ""] ??
          "",
        destination:
          firstOrder.destination ??
          firstOrder.address ??
          "",
        warehouse:
          firstOrder.warehouse ??
          "Main Store",
      });

      setFormLines(getOrderLines(firstOrder));
    } else {
      setForm(initialForm());
      setFormLines([]);
    }

    setMessage("");
    setShowCreate(true);
  }

  function updateDispatchQuantity(
    lineId: string,
    value: string
  ) {
    const quantity = Number(value);

    setFormLines((current) =>
      current.map((line) =>
        line.id === lineId
          ? {
              ...line,
              dispatchQty:
                Number.isFinite(quantity) &&
                quantity >= 0
                  ? Math.min(
                      quantity,
                      line.orderedQty
                    )
                  : 0,
            }
          : line
      )
    );
  }

  function createDeliveryNote() {
    if (!form.salesOrderId) {
      setMessage("Select a Sales Order.");
      return;
    }

    if (!form.invoiceNumber) {
      setMessage("Select the linked Invoice.");
      return;
    }

    if (!form.destination.trim()) {
      setMessage("Enter the delivery destination.");
      return;
    }

    if (formLines.length === 0) {
      setMessage("No products found for this order.");
      return;
    }

    const invalid = formLines.some(
      (line) =>
        line.dispatchQty <= 0 ||
        line.dispatchQty > line.orderedQty
    );

    if (invalid) {
      setMessage(
        "Dispatch quantity must be greater than 0 and cannot exceed ordered quantity."
      );
      return;
    }

    const order = orders.find(
      (item) => item.id === form.salesOrderId
    );

    if (!order) {
      setMessage("Sales Order not found.");
      return;
    }

    const number =
      deliveryNotes.length + 1;

    const note: DeliveryNote = {
      id: `DN-2026-${String(number).padStart(3, "0")}`,
      salesOrderId: form.salesOrderId,
      invoiceNumber: form.invoiceNumber,
      customer:
        order.customer ?? "Customer",
      phone:
        order.phone ?? "Not provided",
      destination:
        form.destination.trim(),
      warehouse: form.warehouse,
      dispatchDate: form.dispatchDate,
      expectedDelivery:
        form.expectedDelivery,
      carrier: form.carrier,
      vehicleNumber:
        form.vehicleNumber.trim(),
      trackingNumber:
        form.trackingNumber.trim(),
      transporter:
        form.transporter.trim(),
      status: "Ready",
      lines: formLines,
      notes: form.notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setDeliveryNotes((current) => [
      note,
      ...current,
    ]);

    setSelectedNote(note);
    setShowCreate(false);

    setMessage(
      `${note.id} created successfully and linked to ${note.salesOrderId} / ${note.invoiceNumber}.`
    );
  }

  function changeStatus(
    noteId: string,
    status: DeliveryStatus
  ) {
    const updatedAt =
      new Date().toISOString();

    setDeliveryNotes((current) =>
      current.map((note) =>
        note.id === noteId
          ? {
              ...note,
              status,
              updatedAt,
            }
          : note
      )
    );

    setSelectedNote((current) =>
      current?.id === noteId
        ? {
            ...current,
            status,
            updatedAt,
          }
        : current
    );

    setMessage(
      `${noteId} marked as ${status}.`
    );
  }

  function cancelNote(note: DeliveryNote) {
    if (note.status === "Delivered") return;

    const confirmed = window.confirm(
      `Cancel ${note.id}?`
    );

    if (!confirmed) return;

    changeStatus(note.id, "Cancelled");
  }

  function printDeliveryNote(note: DeliveryNote) {
    setPrintNoteData(note);

    setTimeout(() => {
      window.print();
    }, 200);
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-6">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">
                Sales Fulfilment
              </p>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Delivery Notes & Challans
              </h1>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                Create delivery documents linked to Sales Orders
                and Invoices with dispatch and transporter details.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreate}
              className="rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800"
            >
              + Create Delivery Note
            </button>
          </div>

          {/* MESSAGE */}
          {message && (
            <div className="mb-5 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs font-medium text-blue-700">
              <span>{message}</span>

              <button
                type="button"
                onClick={() => setMessage("")}
                className="ml-4 text-lg font-bold"
              >
                ×
              </button>
            </div>
          )}

          {/* KPI */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Total Notes
              </p>

              <p className="mt-2 text-2xl font-bold">
                {stats.total}
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Delivery documents
              </p>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Ready
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-700">
                {stats.ready}
              </p>

              <p className="mt-1 text-[10px] text-blue-600">
                Awaiting dispatch
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Dispatched
              </p>

              <p className="mt-2 text-2xl font-bold text-amber-700">
                {stats.dispatched}
              </p>

              <p className="mt-1 text-[10px] text-amber-600">
                In transit
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                Delivered
              </p>

              <p className="mt-2 text-2xl font-bold text-emerald-700">
                {stats.delivered}
              </p>

              <p className="mt-1 text-[10px] text-emerald-600">
                Completed
              </p>
            </div>
          </div>

          {/* FILTER */}
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row">

              <div className="flex-1">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Search
                </label>

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search delivery note, order, invoice, customer..."
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="w-full lg:w-48">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as
                        | "All"
                        | DeliveryStatus
                    )
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  {statusOptions.map((status) => (
                    <option
                      key={status}
                      value={status}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-bold">
                Delivery Register
              </h2>

              <p className="mt-1 text-[10px] text-slate-500">
                Sales Order → Invoice → Delivery Note → Dispatch
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-left">

                <thead className="bg-slate-50">
                  <tr>
                    {[
                      "Delivery Note",
                      "Sales Order",
                      "Invoice",
                      "Customer",
                      "Destination",
                      "Dispatch",
                      "Carrier",
                      "Status",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filteredNotes.map((note) => (
                    <tr
                      key={note.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedNote(note)
                          }
                          className="text-xs font-bold text-blue-700 hover:underline"
                        >
                          {note.id}
                        </button>

                        <p className="mt-1 text-[9px] text-slate-400">
                          {note.lines.reduce(
                            (sum, line) =>
                              sum + line.dispatchQty,
                            0
                          )}{" "}
                          units
                        </p>
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold">
                        {note.salesOrderId}
                      </td>

                      <td className="px-4 py-4 text-xs font-semibold">
                        {note.invoiceNumber}
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-xs font-semibold">
                          {note.customer}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          {note.phone}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-xs">
                          {note.destination}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          {note.warehouse}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-xs font-medium">
                          {formatDate(note.dispatchDate)}
                        </p>

                        {note.expectedDelivery && (
                          <p className="mt-1 text-[9px] text-slate-400">
                            ETA{" "}
                            {formatDate(
                              note.expectedDelivery
                            )}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-xs">
                          {note.carrier || "—"}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          {note.vehicleNumber ||
                            "Vehicle pending"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold ${getStatusClass(
                            note.status
                          )}`}
                        >
                          {note.status}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              setSelectedNote(note)
                            }
                            className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-semibold text-slate-600 hover:bg-slate-50"
                          >
                            View
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              printDeliveryNote(note)
                            }
                            className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-[9px] font-semibold text-white hover:bg-slate-800"
                          >
                            Print
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))}

                  {filteredNotes.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-16 text-center"
                      >
                        <div className="mx-auto max-w-sm">

                          <div className="text-4xl">
                            📦
                          </div>

                          <h3 className="mt-3 text-sm font-bold">
                            No delivery notes found
                          </h3>

                          <p className="mt-1 text-xs text-slate-500">
                            Create a delivery note from a
                            confirmed or processing sales order.
                          </p>

                          <button
                            type="button"
                            onClick={openCreate}
                            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-[10px] font-bold text-white"
                          >
                            Create Delivery Note
                          </button>

                        </div>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">

          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">
                  FR-SAL-08
                </p>

                <h2 className="mt-1 text-lg font-bold">
                  Create Delivery Note / Challan
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-lg text-slate-500 hover:bg-slate-50"
              >
                ×
              </button>

            </div>

            <div className="space-y-6 p-5">

              {/* DOCUMENT LINKING */}
              <section>
                <h3 className="text-sm font-bold">
                  Document Linking
                </h3>

                <p className="mt-1 text-[10px] text-slate-500">
                  Link the delivery document to the originating
                  Sales Order and Invoice.
                </p>

                <div className="mt-4 grid gap-4 md:grid-cols-2">

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Sales Order *
                    </label>

                    <select
                      value={form.salesOrderId}
                      onChange={(e) =>
                        selectOrder(e.target.value)
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        Select sales order
                      </option>

                      {eligibleOrders.map((order) => (
                        <option
                          key={order.id}
                          value={order.id}
                        >
                          {order.id} —{" "}
                          {order.customer}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Invoice *
                    </label>

                    <select
                      value={form.invoiceNumber}
                      onChange={(e) =>
                        updateForm(
                          "invoiceNumber",
                          e.target.value
                        )
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">
                        Select invoice
                      </option>

                      {invoices.map((invoice) => (
                        <option
                          key={invoice.invoiceNumber}
                          value={invoice.invoiceNumber}
                        >
                          {invoice.invoiceNumber} —{" "}
                          {invoice.customer}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              </section>

              {/* DISPATCH */}
              <section>

                <h3 className="text-sm font-bold">
                  Dispatch Information
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Destination *
                    </label>

                    <input
                      value={form.destination}
                      onChange={(e) =>
                        updateForm(
                          "destination",
                          e.target.value
                        )
                      }
                      placeholder="City / delivery address"
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Warehouse
                    </label>

                    <select
                      value={form.warehouse}
                      onChange={(e) =>
                        updateForm(
                          "warehouse",
                          e.target.value
                        )
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
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

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Dispatch Date
                    </label>

                    <input
                      type="date"
                      value={form.dispatchDate}
                      onChange={(e) =>
                        updateForm(
                          "dispatchDate",
                          e.target.value
                        )
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Expected Delivery
                    </label>

                    <input
                      type="date"
                      value={form.expectedDelivery}
                      onChange={(e) =>
                        updateForm(
                          "expectedDelivery",
                          e.target.value
                        )
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Carrier / Courier
                    </label>

                    <select
                      value={form.carrier}
                      onChange={(e) =>
                        updateForm(
                          "carrier",
                          e.target.value
                        )
                      }
                      className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    >
                      {carriers.map((carrier) => (
                        <option
                          key={carrier}
                          value={carrier}
                        >
                          {carrier}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Transporter
                    </label>

                    <input
                      value={form.transporter}
                      onChange={(e) =>
                        updateForm(
                          "transporter",
                          e.target.value
                        )
                      }
                      placeholder="Transporter name"
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Vehicle Number
                    </label>

                    <input
                      value={form.vehicleNumber}
                      onChange={(e) =>
                        updateForm(
                          "vehicleNumber",
                          e.target.value.toUpperCase()
                        )
                      }
                      placeholder="TS09AB1234"
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs uppercase outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Tracking / LR Number
                    </label>

                    <input
                      value={form.trackingNumber}
                      onChange={(e) =>
                        updateForm(
                          "trackingNumber",
                          e.target.value
                        )
                      }
                      placeholder="Tracking reference"
                      className="h-10 w-full rounded-xl border border-slate-200 px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                </div>
              </section>

              {/* ITEMS */}
              <section>

                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold">
                      Dispatch Items
                    </h3>

                    <p className="mt-1 text-[10px] text-slate-500">
                      Confirm the physical quantity being dispatched.
                    </p>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-semibold text-slate-600">
                    {formLines.length} line
                    {formLines.length === 1
                      ? ""
                      : "s"}
                  </span>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">

                  <div className="grid grid-cols-[1fr_100px_120px_100px] gap-3 bg-slate-50 px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    <span>Product</span>
                    <span>Ordered</span>
                    <span>Dispatch</span>
                    <span>UOM</span>
                  </div>

                  <div className="divide-y divide-slate-100">

                    {formLines.map((line) => (
                      <div
                        key={line.id}
                        className="grid grid-cols-[1fr_100px_120px_100px] items-center gap-3 px-4 py-3"
                      >
                        <div>
                          <p className="text-xs font-semibold">
                            {line.productName}
                          </p>

                          <p className="mt-1 text-[9px] text-slate-400">
                            {line.sku}
                          </p>
                        </div>

                        <span className="text-xs font-semibold">
                          {line.orderedQty}
                        </span>

                        <input
                          type="number"
                          min={0}
                          max={line.orderedQty}
                          value={line.dispatchQty}
                          onChange={(e) =>
                            updateDispatchQuantity(
                              line.id,
                              e.target.value
                            )
                          }
                          className="h-9 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        />

                        <span className="text-xs text-slate-500">
                          {line.uom}
                        </span>
                      </div>
                    ))}

                    {formLines.length === 0 && (
                      <div className="px-5 py-8 text-center text-xs text-slate-400">
                        Select a Sales Order to load items.
                      </div>
                    )}

                  </div>
                </div>
              </section>

              {/* NOTES */}
              <section>
                <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                  Dispatch Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    updateForm(
                      "notes",
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Special handling or delivery instructions..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-3 text-xs outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </section>

            </div>

            {/* FOOTER */}
            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-slate-200 bg-white px-5 py-4">

              <button
                type="button"
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createDeliveryNote}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white hover:bg-slate-800"
              >
                Create Delivery Note
              </button>

            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">

          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-blue-600">
                  Delivery Note
                </p>

                <h2 className="mt-1 text-xl font-bold">
                  {selectedNote.id}
                </h2>

                <p className="mt-1 text-[10px] text-slate-500">
                  {selectedNote.salesOrderId} •{" "}
                  {selectedNote.invoiceNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedNote(null)
                }
                className="rounded-lg border border-slate-200 px-3 py-2 text-lg text-slate-500 hover:bg-slate-50"
              >
                ×
              </button>

            </div>

            <div className="space-y-5 p-5">

              {/* STATUS */}
              <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Current Status
                  </p>

                  <span
                    className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold ${getStatusClass(
                      selectedNote.status
                    )}`}
                  >
                    {selectedNote.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">

                  {selectedNote.status === "Draft" && (
                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(
                          selectedNote.id,
                          "Ready"
                        )
                      }
                      className="rounded-lg bg-blue-600 px-3 py-2 text-[10px] font-bold text-white"
                    >
                      Mark Ready
                    </button>
                  )}

                  {selectedNote.status === "Ready" && (
                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(
                          selectedNote.id,
                          "Dispatched"
                        )
                      }
                      className="rounded-lg bg-amber-600 px-3 py-2 text-[10px] font-bold text-white"
                    >
                      Release Dispatch
                    </button>
                  )}

                  {selectedNote.status === "Dispatched" && (
                    <button
                      type="button"
                      onClick={() =>
                        changeStatus(
                          selectedNote.id,
                          "Delivered"
                        )
                      }
                      className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white"
                    >
                      Mark Delivered
                    </button>
                  )}

                  {selectedNote.status !== "Cancelled" &&
                    selectedNote.status !== "Delivered" && (
                      <button
                        type="button"
                        onClick={() =>
                          cancelNote(selectedNote)
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    )}

                  <button
                    type="button"
                    onClick={() =>
                      printDeliveryNote(selectedNote)
                    }
                    className="rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-bold text-white"
                  >
                    Print Challan
                  </button>

                </div>
              </div>

              {/* LINKS */}
              <div className="grid gap-3 sm:grid-cols-3">

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Sales Order
                  </p>

                  <p className="mt-2 text-sm font-bold text-blue-700">
                    {selectedNote.salesOrderId}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Invoice
                  </p>

                  <p className="mt-2 text-sm font-bold">
                    {selectedNote.invoiceNumber}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-200 p-4">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Customer
                  </p>

                  <p className="mt-2 text-sm font-bold">
                    {selectedNote.customer}
                  </p>
                </div>

              </div>

              {/* LOGISTICS */}
              <div className="rounded-xl border border-slate-200 p-4">

                <h3 className="text-sm font-bold">
                  Logistics
                </h3>

                <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">

                  <div>
                    <p className="text-[9px] text-slate-400">
                      Destination
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {selectedNote.destination}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-400">
                      Warehouse
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {selectedNote.warehouse}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-400">
                      Carrier
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {selectedNote.carrier || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-400">
                      Vehicle
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {selectedNote.vehicleNumber || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-400">
                      Dispatch Date
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {formatDate(
                        selectedNote.dispatchDate
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-400">
                      Expected Delivery
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {selectedNote.expectedDelivery
                        ? formatDate(
                            selectedNote.expectedDelivery
                          )
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-400">
                      Tracking / LR
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {selectedNote.trackingNumber || "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[9px] text-slate-400">
                      Transporter
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {selectedNote.transporter || "—"}
                    </p>
                  </div>

                </div>
              </div>

              {/* ITEMS */}
              <div className="overflow-hidden rounded-xl border border-slate-200">

                <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <h3 className="text-sm font-bold">
                    Dispatched Items
                  </h3>
                </div>

                <table className="w-full text-left">

                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Product
                      </th>

                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        SKU
                      </th>

                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Ordered
                      </th>

                      <th className="px-4 py-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                        Dispatched
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {selectedNote.lines.map((line) => (
                      <tr key={line.id}>

                        <td className="px-4 py-3 text-xs font-semibold">
                          {line.productName}
                        </td>

                        <td className="px-4 py-3 text-xs text-slate-500">
                          {line.sku}
                        </td>

                        <td className="px-4 py-3 text-xs">
                          {line.orderedQty}
                        </td>

                        <td className="px-4 py-3 text-xs font-bold">
                          {line.dispatchQty}
                        </td>

                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>

              {selectedNote.notes && (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Remarks
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-600">
                    {selectedNote.notes}
                  </p>

                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE CHALLAN */}
      {printNoteData && (
        <div className="print-document fixed inset-0 z-[100] hidden bg-white p-10 text-slate-900">

          <div className="mx-auto max-w-3xl">

            <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">

              <div>
                <h1 className="text-2xl font-bold">
                  AI StockFlow
                </h1>

                <p className="mt-1 text-xs text-slate-500">
                  Inventory & Business Management Platform
                </p>
              </div>

              <div className="text-right">
                <h2 className="text-xl font-bold">
                  DELIVERY NOTE
                </h2>

                <p className="mt-1 text-xs">
                  {printNoteData.id}
                </p>
              </div>

            </div>

            <div className="mt-6 grid grid-cols-2 gap-6">

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Customer
                </p>

                <p className="mt-2 text-sm font-bold">
                  {printNoteData.customer}
                </p>

                <p className="mt-1 text-xs">
                  {printNoteData.phone}
                </p>

                <p className="mt-1 text-xs">
                  {printNoteData.destination}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Document References
                </p>

                <p className="mt-2 text-xs">
                  Sales Order:{" "}
                  <strong>
                    {printNoteData.salesOrderId}
                  </strong>
                </p>

                <p className="mt-1 text-xs">
                  Invoice:{" "}
                  <strong>
                    {printNoteData.invoiceNumber}
                  </strong>
                </p>

                <p className="mt-1 text-xs">
                  Dispatch Date:{" "}
                  <strong>
                    {formatDate(
                      printNoteData.dispatchDate
                    )}
                  </strong>
                </p>
              </div>

            </div>

            <div className="mt-8 overflow-hidden border border-slate-300">

              <table className="w-full text-left">

                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100">

                    <th className="px-4 py-3 text-xs font-bold">
                      #
                    </th>

                    <th className="px-4 py-3 text-xs font-bold">
                      Product
                    </th>

                    <th className="px-4 py-3 text-xs font-bold">
                      SKU
                    </th>

                    <th className="px-4 py-3 text-right text-xs font-bold">
                      Qty
                    </th>

                    <th className="px-4 py-3 text-xs font-bold">
                      UOM
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {printNoteData.lines.map(
                    (line, index) => (
                      <tr
                        key={line.id}
                        className="border-b border-slate-200"
                      >

                        <td className="px-4 py-3 text-xs">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3 text-xs font-semibold">
                          {line.productName}
                        </td>

                        <td className="px-4 py-3 text-xs">
                          {line.sku}
                        </td>

                        <td className="px-4 py-3 text-right text-xs font-bold">
                          {line.dispatchQty}
                        </td>

                        <td className="px-4 py-3 text-xs">
                          {line.uom}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>
              </table>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-8 text-xs">

              <div>
                <p className="font-bold">
                  Transport Details
                </p>

                <p className="mt-2">
                  Carrier:{" "}
                  {printNoteData.carrier || "—"}
                </p>

                <p className="mt-1">
                  Vehicle:{" "}
                  {printNoteData.vehicleNumber || "—"}
                </p>

                <p className="mt-1">
                  Tracking/LR:{" "}
                  {printNoteData.trackingNumber || "—"}
                </p>
              </div>

              <div>
                <p className="font-bold">
                  Delivery Details
                </p>

                <p className="mt-2">
                  Warehouse:{" "}
                  {printNoteData.warehouse}
                </p>

                <p className="mt-1">
                  Destination:{" "}
                  {printNoteData.destination}
                </p>

                <p className="mt-1">
                  Expected Delivery:{" "}
                  {printNoteData.expectedDelivery
                    ? formatDate(
                        printNoteData.expectedDelivery
                      )
                    : "—"}
                </p>
              </div>

            </div>

            {printNoteData.notes && (
              <div className="mt-8 border-t border-slate-300 pt-4">

                <p className="text-xs font-bold">
                  Remarks
                </p>

                <p className="mt-2 text-xs">
                  {printNoteData.notes}
                </p>

              </div>
            )}

            <div className="mt-16 grid grid-cols-3 gap-8 text-center text-xs">

              <div className="border-t border-slate-400 pt-2">
                Prepared By
              </div>

              <div className="border-t border-slate-400 pt-2">
                Transporter
              </div>

              <div className="border-t border-slate-400 pt-2">
                Customer Received
              </div>

            </div>

            <p className="mt-10 text-center text-[10px] text-slate-400">
              This delivery note is linked to the originating
              Sales Order and Invoice.
            </p>

          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .print-document,
          .print-document * {
            visibility: visible !important;
          }

          .print-document {
            display: block !important;
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            min-height: 100vh !important;
            background: white !important;
          }

          @page {
            size: A4;
            margin: 12mm;
          }
        }
      `}</style>
    </>
  );
}