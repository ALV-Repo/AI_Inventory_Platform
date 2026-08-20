"use client";

import { useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type Warehouse = {
  id: string;
  name: string;
  location: string;
  manager: string;
  capacity: number;
  used: number;
  products: number;
  status: "Operational" | "Maintenance";
};

const warehouses: Warehouse[] = [
  {
    id: "WH-001",
    name: "Hyderabad Central",
    location: "Hyderabad",
    manager: "Rahul Kumar",
    capacity: 10000,
    used: 7200,
    products: 185,
    status: "Operational",
  },
  {
    id: "WH-002",
    name: "Bengaluru Warehouse",
    location: "Bengaluru",
    manager: "Vikram Singh",
    capacity: 8500,
    used: 6100,
    products: 142,
    status: "Operational",
  },
  {
    id: "WH-003",
    name: "Mumbai Distribution Hub",
    location: "Mumbai",
    manager: "Sneha Patel",
    capacity: 12000,
    used: 9800,
    products: 216,
    status: "Operational",
  },
  {
    id: "WH-004",
    name: "Delhi Storage Center",
    location: "Delhi",
    manager: "Amit Sharma",
    capacity: 7000,
    used: 4200,
    products: 98,
    status: "Operational",
  },
  {
    id: "WH-005",
    name: "Chennai Warehouse",
    location: "Chennai",
    manager: "Ananya Rao",
    capacity: 6500,
    used: 3000,
    products: 76,
    status: "Maintenance",
  },
  {
    id: "WH-006",
    name: "Pune Distribution Center",
    location: "Pune",
    manager: "Arjun Mehta",
    capacity: 9000,
    used: 5400,
    products: 124,
    status: "Operational",
  },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

export default function WarehousePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const totalCapacity = warehouses.reduce(
    (sum, warehouse) => sum + warehouse.capacity,
    0
  );

  const totalUsed = warehouses.reduce(
    (sum, warehouse) => sum + warehouse.used,
    0
  );

  const totalProducts = warehouses.reduce(
    (sum, warehouse) => sum + warehouse.products,
    0
  );

  const operationalWarehouses = warehouses.filter(
    (warehouse) => warehouse.status === "Operational"
  ).length;

  const maintenanceWarehouses = warehouses.filter(
    (warehouse) => warehouse.status === "Maintenance"
  ).length;

  const utilization = Math.round(
    (totalUsed / totalCapacity) * 100
  );

  const availableCapacity = totalCapacity - totalUsed;

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((warehouse) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        warehouse.name.toLowerCase().includes(searchText) ||
        warehouse.location
          .toLowerCase()
          .includes(searchText) ||
        warehouse.manager
          .toLowerCase()
          .includes(searchText) ||
        warehouse.id.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All Status" ||
        warehouse.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f8fafc] px-6 py-7 text-slate-900">

        <div className="mx-auto max-w-6xl">

          {/* HEADER */}
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Warehouse
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Manage warehouses, storage capacity and
                inventory locations
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {/* KPI CARDS */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <KpiCard
              title="Total Warehouses"
              value={warehouses.length.toString()}
              subtitle="Registered locations"
              color="green"
            />

            <KpiCard
              title="Operational"
              value={operationalWarehouses.toString()}
              subtitle="Currently active"
              color="green"
            />

            <KpiCard
              title="Total Products"
              value={formatNumber(totalProducts)}
              subtitle="Products across warehouses"
              color="blue"
            />

            <KpiCard
              title="Capacity Utilization"
              value={`${utilization}%`}
              subtitle="Current storage usage"
              color="orange"
            />

          </div>

          {/* CAPACITY OVERVIEW */}
          <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-semibold">
                Storage Capacity Overview
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Warehouse storage utilization
              </p>
            </div>

            <div className="grid gap-8 p-5 md:grid-cols-2">

              {/* USED */}
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">
                    Used Capacity
                  </p>

                  <strong className="text-sm">
                    {formatNumber(totalUsed)}
                  </strong>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{
                      width: `${utilization}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>
                    {formatNumber(totalUsed)} units
                  </span>

                  <span>{utilization}%</span>
                </div>
              </div>

              {/* AVAILABLE */}
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">
                    Available Capacity
                  </p>

                  <strong className="text-sm">
                    {formatNumber(availableCapacity)}
                  </strong>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-green-600"
                    style={{
                      width: `${100 - utilization}%`,
                    }}
                  />
                </div>

                <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                  <span>
                    {formatNumber(availableCapacity)} units
                  </span>

                  <span>
                    {100 - utilization}%
                  </span>
                </div>
              </div>

            </div>
          </section>

          {/* SEARCH + FILTER */}
          <section className="mb-5 rounded-xl border border-slate-200 bg-white p-3">
            <div className="grid gap-2 md:grid-cols-[1fr_180px]">

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search warehouse, location, manager or ID..."
                className="rounded-md border border-slate-300 px-3 py-2 text-xs outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none"
              >
                <option>All Status</option>
                <option>Operational</option>
                <option>Maintenance</option>
              </select>

            </div>
          </section>

          {/* WAREHOUSE DIRECTORY */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-sm font-semibold">
                Warehouse Directory
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Overview of warehouse locations and capacity
              </p>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full border-collapse text-xs">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Warehouse
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Location
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Manager
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Products
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Capacity
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Utilization
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Status
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Action
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredWarehouses.map((warehouse) => {

                    const warehouseUtilization =
                      Math.round(
                        (warehouse.used /
                          warehouse.capacity) *
                          100
                      );

                    return (
                      <tr
                        key={warehouse.id}
                        className="border-b border-slate-100 transition hover:bg-slate-50"
                      >

                        {/* WAREHOUSE */}
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">
                            {warehouse.name}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {warehouse.id}
                          </p>
                        </td>

                        {/* LOCATION */}
                        <td className="px-4 py-3 text-slate-600">
                          {warehouse.location}
                        </td>

                        {/* MANAGER */}
                        <td className="px-4 py-3 text-slate-600">
                          {warehouse.manager}
                        </td>

                        {/* PRODUCTS */}
                        <td className="px-4 py-3 font-semibold">
                          {formatNumber(
                            warehouse.products
                          )}
                        </td>

                        {/* CAPACITY */}
                        <td className="px-4 py-3 text-slate-600">
                          {formatNumber(
                            warehouse.used
                          )}{" "}
                          /{" "}
                          {formatNumber(
                            warehouse.capacity
                          )}
                        </td>

                        {/* UTILIZATION */}
                        <td className="px-4 py-3">

                          <div className="flex items-center gap-2">

                            <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200">

                              <div
                                className={`h-full rounded-full ${
                                  warehouseUtilization >=
                                  85
                                    ? "bg-orange-500"
                                    : "bg-blue-600"
                                }`}
                                style={{
                                  width: `${warehouseUtilization}%`,
                                }}
                              />

                            </div>

                            <span className="text-[10px] font-semibold">
                              {warehouseUtilization}%
                            </span>

                          </div>

                        </td>

                        {/* STATUS */}
                        <td className="px-4 py-3">

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              warehouse.status ===
                              "Operational"
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {warehouse.status}
                          </span>

                        </td>

                        {/* ACTION */}
                        <td className="px-4 py-3">

                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                `${warehouse.name} selected`
                              )
                            }
                            className="font-semibold text-blue-600 hover:text-blue-800"
                          >
                            View
                          </button>

                        </td>

                      </tr>
                    );
                  })}

                </tbody>

              </table>

              {filteredWarehouses.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No warehouses found.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try changing your search or status filter.
                  </p>
                </div>
              )}

            </div>

            <div className="border-t border-slate-200 px-5 py-3">
              <p className="text-[10px] text-slate-500">
                Showing {filteredWarehouses.length} of{" "}
                {warehouses.length} warehouses
              </p>
            </div>

          </section>

          {/* INSIGHTS */}
          <section className="mt-5 grid gap-3 md:grid-cols-3">

            <InsightCard
              title="Storage Health"
              value={`${utilization}%`}
              description="Overall warehouse capacity utilization"
            />

            <InsightCard
              title="Available Space"
              value={formatNumber(
                availableCapacity
              )}
              description="Units of remaining storage capacity"
            />

            <InsightCard
              title="Maintenance"
              value={maintenanceWarehouses.toString()}
              description="Warehouse requiring attention"
              warning
            />

          </section>

          {/* FOOTER */}
          <div className="py-8 text-center text-[10px] text-slate-400">
            AI StockFlow • Warehouse Management
          </div>

        </div>
      </main>
    </PageLayout>
  );
}

/* ============================================================
   KPI CARD
============================================================ */

function KpiCard({
  title,
  value,
  subtitle,
  color,
}: {
  title: string;
  value: string;
  subtitle: string;
  color: "green" | "blue" | "orange";
}) {
  const colorClass = {
    green: "text-green-600",
    blue: "text-blue-600",
    orange: "text-orange-500",
  }[color];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <p className="text-[10px] uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        {value}
      </h2>

      <p
        className={`mt-1 text-[10px] ${colorClass}`}
      >
        {subtitle}
      </p>

    </div>
  );
}

/* ============================================================
   INSIGHT CARD
============================================================ */

function InsightCard({
  title,
  value,
  description,
  warning = false,
}: {
  title: string;
  value: string;
  description: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

      <p className="text-[10px] uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <h3
        className={`mt-2 text-2xl font-bold ${
          warning
            ? "text-orange-500"
            : "text-slate-900"
        }`}
      >
        {value}
      </h3>

      <p className="mt-1 text-[10px] text-slate-500">
        {description}
      </p>

    </div>
  );
}