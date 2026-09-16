"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import PageLayout from "../../../components/layout/PageLayout";

type Warehouse = {
  id: number;
  name: string;
  code: string;
  location: string;
  manager: string;
  capacity: number;
  used: number;
  products: number;
  status: "Active" | "Inactive";
  address?: string;
  phone?: string;
  email?: string;
  type?: "Distribution" | "Retail" | "Storage" | "Transit";
};

const initialWarehouses: Warehouse[] = [
  {
    id: 1,
    name: "Main Store",
    code: "WH-MAIN",
    location: "Hyderabad",
    manager: "Admin User",
    capacity: 10000,
    used: 7200,
    products: 128,
    status: "Active",
  },
  {
    id: 2,
    name: "Warehouse A",
    code: "WH-A",
    location: "Vijayawada",
    manager: "Rahul",
    capacity: 8000,
    used: 5100,
    products: 84,
    status: "Active",
  },
  {
    id: 3,
    name: "Warehouse B",
    code: "WH-B",
    location: "Visakhapatnam",
    manager: "Priya",
    capacity: 6000,
    used: 2900,
    products: 61,
    status: "Active",
  },
  {
    id: 4,
    name: "Old Storage",
    code: "WH-OLD",
    location: "Guntur",
    manager: "Admin User",
    capacity: 4000,
    used: 0,
    products: 0,
    status: "Inactive",
  },
];

export default function WarehousePage() {
  const [warehouses, setWarehouses] =
    useState<Warehouse[]>(initialWarehouses);

  const [refreshKey, setRefreshKey] = useState(0);

  const [inventoryProducts, setInventoryProducts] =
  useState<
    Array<{
      id: number;
      name: string;
      sku: string;
      warehouse: string;
      storageLocation: string;
      onHand: number;
      reserved: number;
    }>
  >([]);

  useEffect(() => {
  try {
    const storedProducts =
      localStorage.getItem("inventory-products");

    if (!storedProducts) {
      return;
    }

    const products = JSON.parse(storedProducts);

    if (!Array.isArray(products)) {
      return;
    }

    const mappedProducts = products.map((item) => ({
      id: Number(item.id ?? 0),
      name: item.name ?? item.product_name ?? "",
      sku: item.sku ?? item.code ?? "",
      warehouse:
        item.warehouse ??
        item.warehouse_name ??
        "Main Store",
        storageLocation:
  item.storageLocation ??
  item.storage_location ??
  item.location ??
  "Not assigned",
      onHand: Number(
        item.onHand ??
          item.on_hand ??
          item.quantity ??
          0
      ),
      reserved: Number(item.reserved ?? 0),
    }));

    setInventoryProducts(mappedProducts);
  } catch {
    setInventoryProducts([]);
  }
}, [refreshKey]);

useEffect(() => {
  try {
    const storedWarehouses =
      localStorage.getItem("inventory-warehouses");

    if (!storedWarehouses) {
      return;
    }

    const savedWarehouses =
      JSON.parse(storedWarehouses);

    if (Array.isArray(savedWarehouses)) {
      setWarehouses(savedWarehouses);
    }
  } catch {
    // Keep initial warehouses if saved data is invalid.
  }
}, [refreshKey]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"All" | "Active" | "Inactive">("All");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] =
    useState<Warehouse | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [manager, setManager] = useState("");
  const [capacity, setCapacity] = useState(1000);
  const [warehouseType, setWarehouseType] =
    useState<Warehouse["type"]>("Distribution");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [locationFilter, setLocationFilter] = useState("All Locations");
  const [typeFilter, setTypeFilter] = useState("All Types");

  const locations = useMemo(
    () => [
      "All Locations",
      ...Array.from(new Set(warehouses.map((warehouse) => warehouse.location))).sort(),
    ],
    [warehouses]
  );

  const warehouseTypes = useMemo(
    () => [
      "All Types",
      ...Array.from(
        new Set(
          warehouses
            .map((warehouse) => warehouse.type)
            .filter(Boolean) as string[]
        )
      ).sort(),
    ],
    [warehouses]
  );

  const filteredWarehouses = useMemo(() => {
    const value = search.trim().toLowerCase();

    return warehouses.filter((warehouse) => {
      const matchesSearch =
        !value ||
        warehouse.name.toLowerCase().includes(value) ||
        warehouse.code.toLowerCase().includes(value) ||
        warehouse.location.toLowerCase().includes(value) ||
        warehouse.manager.toLowerCase().includes(value);

      const matchesStatus =
        statusFilter === "All" ||
        warehouse.status === statusFilter;

      const matchesLocation =
        locationFilter === "All Locations" ||
        warehouse.location === locationFilter;

      const matchesType =
        typeFilter === "All Types" ||
        warehouse.type === typeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLocation &&
        matchesType
      );
    });
  }, [warehouses, search, statusFilter, locationFilter, typeFilter]);

  const warehouseStock = useMemo(() => {
  return warehouses.map((warehouse) => {
    const products = inventoryProducts.filter(
      (product) =>
        product.warehouse.trim().toLowerCase() ===
        warehouse.name.trim().toLowerCase()
    );

    const onHand = products.reduce(
      (total, product) => total + product.onHand,
      0
    );

    const reserved = products.reduce(
      (total, product) => total + product.reserved,
      0
    );

    return {
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      productCount: products.length,
      onHand,
      reserved,
      available: Math.max(onHand - reserved, 0),
    };
  });
}, [warehouses, inventoryProducts]);

  const activeCount = warehouses.filter(
    (warehouse) => warehouse.status === "Active"
  ).length;

  const inactiveCount = warehouses.filter(
    (warehouse) => warehouse.status === "Inactive"
  ).length;

  const totalCapacity = warehouses.reduce(
    (total, warehouse) => total + warehouse.capacity,
    0
  );

  const usedCapacity = warehouses.reduce(
    (total, warehouse) => total + warehouse.used,
    0
  );

  const createWarehouse = () => {
    if (!name.trim() || !code.trim() || !location.trim()) {
      alert("Please fill in all required fields.");
      return;
    }

    if (capacity <= 0) {
  alert("Capacity must be greater than 0.");
  return;
}

const duplicateCode = warehouses.some(
  (warehouse) =>
    warehouse.code.trim().toLowerCase() ===
    code.trim().toLowerCase()
);

if (duplicateCode) {
  alert("Warehouse code already exists.");
  return;
}

const duplicateName = warehouses.some(
  (warehouse) =>
    warehouse.name.trim().toLowerCase() ===
    name.trim().toLowerCase()
);

if (duplicateName) {
  alert("Warehouse name already exists.");
  return;
}

const newWarehouse: Warehouse = {
      id: Date.now(),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      location: location.trim(),
      manager: manager.trim() || "Admin User",
      capacity,
      used: 0,
      products: 0,
      status: "Active",
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      type: warehouseType,
    };

    setWarehouses((previous) => {
  const updatedWarehouses = [
    newWarehouse,
    ...previous,
  ];

  localStorage.setItem(
    "inventory-warehouses",
    JSON.stringify(updatedWarehouses)
  );

  return updatedWarehouses;
});

    setName("");
    setCode("");
    setLocation("");
    setManager("");
    setCapacity(1000);
    setWarehouseType("Distribution");
    setAddress("");
    setPhone("");
    setEmail("");
    setShowCreateForm(false);

    alert("Warehouse created successfully.");
  };

const toggleWarehouseStatus = (id: number) => {
  setWarehouses((previous) => {
    const updatedWarehouses: Warehouse[] = previous.map((warehouse) =>
      warehouse.id === id
        ? {
            ...warehouse,
            status:
              warehouse.status === "Active"
                ? "Inactive"
                : "Active",
          }
        : warehouse
    );

    localStorage.setItem(
      "inventory-warehouses",
      JSON.stringify(updatedWarehouses)
    );

    try {
      const savedAuditLogs = localStorage.getItem("audit-logs");
      const auditLogs = savedAuditLogs ? JSON.parse(savedAuditLogs) : [];
      const target = warehouses.find((warehouse) => warehouse.id === id);
      const nextStatus = target?.status === "Active" ? "Inactive" : "Active";

      localStorage.setItem(
        "audit-logs",
        JSON.stringify([
          {
            id: `AUD-WH-${Date.now()}`,
            timestamp: new Date().toLocaleString("en-IN"),
            user: "Admin User",
            role: "Admin",
            action: nextStatus === "Active" ? "Activated" : "Deactivated",
            module: "Warehouse",
            description: `${target?.name ?? "Warehouse"} status changed to ${nextStatus}`,
            status: "Success",
            ip: "Local",
          },
          ...auditLogs,
        ])
      );
    } catch {
      // Audit persistence is best-effort in frontend mode.
    }

    return updatedWarehouses;
  });

  setSelectedWarehouse((previous) =>
    previous && previous.id === id
      ? {
          ...previous,
          status:
            previous.status === "Active"
              ? "Inactive"
              : "Active",
        }
      : previous
  );
};

const deleteWarehouse = (id: number) => {
  const warehouse = warehouses.find(
    (item) => item.id === id
  );

  if (!warehouse) {
    return;
  }

  const linkedProducts = inventoryProducts.filter(
    (product) =>
      product.warehouse.trim().toLowerCase() ===
      warehouse.name.trim().toLowerCase()
  );

  if (linkedProducts.length > 0) {
    alert(
      `Cannot delete "${warehouse.name}" because ${linkedProducts.length} inventory product record(s) are linked to it. Deactivate it instead.`
    );
    return;
  }

  const confirmed = window.confirm(
    `Are you sure you want to delete "${warehouse.name}"?`
  );

  if (!confirmed) {
    return;
  }

  setWarehouses((previous) => {
    const updatedWarehouses = previous.filter(
      (item) => item.id !== id
    );

    localStorage.setItem(
      "inventory-warehouses",
      JSON.stringify(updatedWarehouses)
    );

    return updatedWarehouses;
  });

  setSelectedWarehouse(null);

  alert("Warehouse deleted successfully.");
};

  const totalOnHand = warehouseStock.reduce(
    (sum, stock) => sum + stock.onHand,
    0
  );
  const totalReserved = warehouseStock.reduce(
    (sum, stock) => sum + stock.reserved,
    0
  );
  const totalAvailable = warehouseStock.reduce(
    (sum, stock) => sum + stock.available,
    0
  );

  const capacityPercentage = (warehouse: Warehouse) => {
    if (warehouse.capacity === 0) return 0;

    return Math.round(
      (warehouse.used / warehouse.capacity) * 100
    );
  };

  return (
    <PageLayout>
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* HEADER */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-2 text-sm font-medium text-blue-600">
              Inventory / Warehouse
            </div>

            <h1 className="text-3xl font-bold tracking-tight">
              Warehouse Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage warehouses, storage capacity and inventory locations.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
              className="rounded-xl border border-blue-200 bg-white px-4 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="rounded-xl bg-[#12213a] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#1c3154]"
            >
              + Add Warehouse
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total Warehouses
            </p>

            <p className="mt-2 text-3xl font-bold">
              {warehouses.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Registered locations
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Active
            </p>

            <p className="mt-2 text-3xl font-bold text-green-600">
              {activeCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Operational warehouses
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Inactive
            </p>

            <p className="mt-2 text-3xl font-bold text-orange-500">
              {inactiveCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Currently disabled
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Capacity Usage
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {totalCapacity > 0
                ? Math.round((usedCapacity / totalCapacity) * 100)
                : 0}
              %
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Across all warehouses
            </p>
          </div>

        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
              Total On Hand
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalOnHand.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-500">Across all warehouses</p>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-600">
              Reserved
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalReserved.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-500">Allocated inventory</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
              Available
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalAvailable.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-500">On hand less reserved</p>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Search
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search warehouse, code, location..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "All"
                      | "Active"
                      | "Inactive"
                  )
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Location
              </label>
              <select
                value={locationFilter}
                onChange={(event) => setLocationFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                {locations.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
                Warehouse Type
              </label>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                {warehouseTypes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("All");
                setLocationFilter("All Locations");
                setTypeFilter("All Types");
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Clear Filters
            </button>
          </div>
        </section>

        {/* WAREHOUSE LIST */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-bold">
              Warehouse List
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Showing {filteredWarehouses.length} of{" "}
              {warehouses.length} warehouses.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">

              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Warehouse
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Type
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Manager
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Capacity
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Products
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
  On Hand
</th>

<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
  Reserved
</th>

<th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
  Available
</th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredWarehouses.map((warehouse) => {
                  const percentage =
                    capacityPercentage(warehouse);

                  return (
                    <tr
                      key={warehouse.id}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >

                      <td className="px-6 py-5">

                        <p className="font-semibold text-slate-900">
                          {warehouse.name}
                        </p>

                        <p className="mt-1 font-mono text-xs text-slate-400">
                          {warehouse.code}
                        </p>

                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">
                        {warehouse.location}
                      </td>
                      <td className="px-6 py-5">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                          {warehouse.type ?? "Storage"}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-700">
                        {warehouse.manager}
                      </td>

                      <td className="px-6 py-5">

                        <div className="mb-2 flex justify-between text-xs">
                          <span className="text-slate-500">
                            {warehouse.used.toLocaleString()} /
                            {" "}
                            {warehouse.capacity.toLocaleString()}
                          </span>

                          <span className="font-semibold text-slate-700">
                            {percentage}%
                          </span>
                        </div>

                        <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full rounded-full ${
                              percentage >= 90
                                ? "bg-red-500"
                                : percentage >= 70
                                ? "bg-orange-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${Math.min(
                                percentage,
                                100
                              )}%`,
                            }}
                          />
                        </div>

                      </td>

                      <td className="px-6 py-5 text-sm font-semibold">
  {warehouseStock.find(
    (stock) => stock.warehouseId === warehouse.id
  )?.productCount ?? 0}
</td>

                      <td className="px-6 py-5 text-sm font-semibold">
  {warehouseStock.find(
    (stock) => stock.warehouseId === warehouse.id
  )?.onHand ?? 0}
</td>

<td className="px-6 py-5 text-sm font-semibold">
  {warehouseStock.find(
    (stock) => stock.warehouseId === warehouse.id
  )?.reserved ?? 0}
</td>

<td className="px-6 py-5 text-sm font-semibold">
  {warehouseStock.find(
    (stock) => stock.warehouseId === warehouse.id
  )?.available ?? 0}
</td>

                      <td className="px-6 py-5">

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            warehouse.status === "Active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {warehouse.status}
                        </span>

                      </td>

                     <td className="px-6 py-5">
  <div className="flex items-center gap-2">
    <button
      type="button"
      onClick={() =>
        setSelectedWarehouse(warehouse)
      }
      className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
    >
      Manage
    </button>

    <button
      type="button"
      onClick={() => deleteWarehouse(warehouse.id)}
      className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
    >
      Delete
    </button>
  </div>
</td>

                    </tr>
                  );
                })}

                {filteredWarehouses.length === 0 && (
                  <tr>
                    <td
                      colSpan={11}
                      className="px-6 py-12 text-center"
                    >
                      <p className="font-semibold text-slate-700">
                        No warehouses found
                      </p>

                      <p className="mt-1 text-sm text-slate-400">
                        Try a different search or status filter.
                      </p>
                    </td>
                  </tr>
                )}

              </tbody>
            </table>
          </div>

        </section>

        {/* CREATE WAREHOUSE MODAL */}
        {showCreateForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">

              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold">
                    Add Warehouse
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Create a new warehouse location.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                  className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
                >
                  ✕
                </button>

              </div>

              <div className="grid gap-5 p-6 md:grid-cols-2">

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Warehouse Name *
                  </label>

                  <input
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Example: Warehouse C"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Warehouse Code *
                  </label>

                  <input
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value)
                    }
                    placeholder="Example: WH-C"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm uppercase outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Location *
                  </label>

                  <input
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    placeholder="Example: Hyderabad"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Manager
                  </label>

                  <input
                    value={manager}
                    onChange={(event) =>
                      setManager(event.target.value)
                    }
                    placeholder="Example: Rahul"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Warehouse Type
                  </label>
                  <select
                    value={warehouseType}
                    onChange={(event) =>
                      setWarehouseType(event.target.value as Warehouse["type"])
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                  >
                    <option value="Distribution">Distribution</option>
                    <option value="Retail">Retail</option>
                    <option value="Storage">Storage</option>
                    <option value="Transit">Transit</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Storage Capacity *
                  </label>

                  <input
                    type="number"
                    min={1}
                    value={capacity}
                    onChange={(event) =>
                      setCapacity(
                        Math.max(
                          1,
                          Number(event.target.value)
                        )
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium">
                    Address
                  </label>
                  <input
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Full warehouse address"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Phone
                  </label>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="warehouse@company.com"
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreateForm(false)
                  }
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={createWarehouse}
                  className="rounded-lg bg-[#12213a] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#1c3154]"
                >
                  Create Warehouse
                </button>

              </div>

            </div>
          </div>
        )}

        {/* MANAGE WAREHOUSE MODAL */}
        {selectedWarehouse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

            <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">

              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">

                <div>
                  <h2 className="text-xl font-bold">
                    {selectedWarehouse.name}
                  </h2>

                  <p className="mt-1 font-mono text-xs text-slate-400">
                    {selectedWarehouse.code}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedWarehouse(null)
                  }
                  className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
                >
                  ✕
                </button>

              </div>

              <div className="space-y-4 p-6">

                <div className="grid grid-cols-2 gap-4">

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Location
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedWarehouse.location}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Manager
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedWarehouse.manager}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Type
                    </p>

                    <p className="mt-1 font-semibold">
                      {selectedWarehouse.type ?? "Storage"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Contact
                    </p>

                    <p className="mt-1 break-words text-sm font-semibold">
                      {selectedWarehouse.phone || "Not provided"}
                    </p>
                    <p className="mt-1 break-words text-xs text-slate-500">
                      {selectedWarehouse.email || "No email"}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
  <p className="text-xs text-slate-400">
    Products
  </p>

  <p className="mt-1 text-2xl font-bold">
    {warehouseStock.find(
      (stock) =>
        stock.warehouseId === selectedWarehouse.id
    )?.productCount ?? 0}
  </p>
</div>

                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Capacity
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {capacityPercentage(
                        selectedWarehouse
                      )}
                      %
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-4">
  <p className="text-xs text-slate-400">
    On Hand
  </p>

  <p className="mt-1 text-2xl font-bold">
    {warehouseStock.find(
      (stock) =>
        stock.warehouseId === selectedWarehouse.id
    )?.onHand ?? 0}
  </p>
</div>

<div className="rounded-lg bg-slate-50 p-4">
  <p className="text-xs text-slate-400">
    Reserved
  </p>

  <p className="mt-1 text-2xl font-bold">
    {warehouseStock.find(
      (stock) =>
        stock.warehouseId === selectedWarehouse.id
    )?.reserved ?? 0}
  </p>
</div>

<div className="rounded-lg bg-slate-50 p-4">
  <p className="text-xs text-slate-400">
    Available
  </p>

  <p className="mt-1 text-2xl font-bold">
    {warehouseStock.find(
      (stock) =>
        stock.warehouseId === selectedWarehouse.id
    )?.available ?? 0}
  </p>
</div>

                </div>

                <div className="rounded-lg border border-slate-200 p-4">
  <p className="text-sm font-semibold text-slate-900">
    Product Stock
  </p>

  <div className="mt-3 max-h-48 overflow-y-auto">
    {inventoryProducts.filter(
      (product) =>
        product.warehouse.trim().toLowerCase() ===
        selectedWarehouse.name.trim().toLowerCase()
    ).length === 0 ? (
      <p className="py-4 text-center text-sm text-slate-400">
        No products in this warehouse.
      </p>
    ) : (
      <div className="space-y-2">
        {inventoryProducts
          .filter(
            (product) =>
              product.warehouse.trim().toLowerCase() ===
              selectedWarehouse.name.trim().toLowerCase()
          )
          .map((product) => (
            <div
              key={product.id}
              className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0">
  <p className="truncate text-sm font-medium text-slate-800">
    {product.name}
  </p>

  <p className="font-mono text-xs text-slate-400">
    {product.sku}
  </p>

  <p className="mt-1 text-xs text-slate-500">
    Location:{" "}
    {(
      product as typeof product & {
        storageLocation?: string;
      }
    ).storageLocation ?? "Not assigned"}
  </p>
</div>

              <div className="ml-4 text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {product.onHand}
                </p>

                <p className="text-xs text-slate-400">
                  Available
                </p>
              </div>
            </div>
          ))}
      </div>
    )}
  </div>
</div>

                <div className="rounded-lg border border-slate-200 p-4">

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Warehouse Status
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        selectedWarehouse.status ===
                        "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {selectedWarehouse.status}
                    </span>
                  </div>

                </div>

              </div>

              <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">

                <button
                  type="button"
                  onClick={() =>
                    setSelectedWarehouse(null)
                  }
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toggleWarehouseStatus(
                      selectedWarehouse.id
                    )
                  }
                  className={`rounded-lg px-5 py-2.5 text-sm font-semibold text-white ${
                    selectedWarehouse.status === "Active"
                      ? "bg-orange-500 hover:bg-orange-600"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {selectedWarehouse.status === "Active"
                    ? "Deactivate"
                    : "Activate"}
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
      </main>
    </PageLayout>
  );
}