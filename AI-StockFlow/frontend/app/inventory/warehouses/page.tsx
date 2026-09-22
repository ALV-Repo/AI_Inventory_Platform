"use client";

import { useMemo, useState } from "react";

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

      return matchesSearch && matchesStatus;
    });
  }, [warehouses, search, statusFilter]);

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
    };

    setWarehouses((previous) => [
      newWarehouse,
      ...previous,
    ]);

    setName("");
    setCode("");
    setLocation("");
    setManager("");
    setCapacity(1000);
    setShowCreateForm(false);

    alert("Warehouse created successfully.");
  };

  const toggleWarehouseStatus = (id: number) => {
    setWarehouses((previous) =>
      previous.map((warehouse) =>
        warehouse.id === id
          ? {
              ...warehouse,
              status:
                warehouse.status === "Active"
                  ? "Inactive"
                  : "Active",
            }
          : warehouse
      )
    );

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

  const capacityPercentage = (warehouse: Warehouse) => {
    if (warehouse.capacity === 0) return 0;

    return Math.round(
      (warehouse.used / warehouse.capacity) * 100
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
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

          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            className="rounded-lg bg-[#12213a] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1c3154]"
          >
            + Add Warehouse
          </button>
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
              {Math.round(
                (usedCapacity / totalCapacity) * 100
              )}
              %
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Across all warehouses
            </p>
          </div>

        </div>

        {/* SEARCH + FILTER */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="grid gap-4 md:grid-cols-2">

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
                    Manager
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Capacity
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Products
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
                        {warehouse.products}
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

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedWarehouse(warehouse)
                          }
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          Manage
                        </button>

                      </td>

                    </tr>
                  );
                })}

                {filteredWarehouses.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
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

                <div className="md:col-span-2">
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
                      Products
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {selectedWarehouse.products}
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
  );
}