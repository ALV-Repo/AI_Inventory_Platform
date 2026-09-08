"use client";

import { useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type WarehouseStatus = "Operational" | "Maintenance";

type BinStatus = "Available" | "Partially Occupied" | "Full" | "Blocked";

type Bin = {
  id: string;
  name: string;
  capacity: number;
  used: number;
  status: BinStatus;
};

type Rack = {
  id: string;
  name: string;
  bins: Bin[];
};

type Aisle = {
  id: string;
  name: string;
  racks: Rack[];
};

type Zone = {
  id: string;
  name: string;
  aisles: Aisle[];
};

type Warehouse = {
  id: string;
  name: string;
  location: string;
  manager: string;
  capacity: number;
  used: number;
  products: number;
  status: WarehouseStatus;
  zones: Zone[];
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
    zones: [
      {
        id: "Z-A",
        name: "Zone A - Electronics",
        aisles: [
          {
            id: "A-01",
            name: "Aisle A01",
            racks: [
              {
                id: "R-A01-01",
                name: "Rack A01-01",
                bins: [
                  {
                    id: "BIN-A01-01-01",
                    name: "Bin A01-01-01",
                    capacity: 500,
                    used: 420,
                    status: "Partially Occupied",
                  },
                  {
                    id: "BIN-A01-01-02",
                    name: "Bin A01-01-02",
                    capacity: 500,
                    used: 500,
                    status: "Full",
                  },
                  {
                    id: "BIN-A01-01-03",
                    name: "Bin A01-01-03",
                    capacity: 500,
                    used: 120,
                    status: "Partially Occupied",
                  },
                ],
              },
              {
                id: "R-A01-02",
                name: "Rack A01-02",
                bins: [
                  {
                    id: "BIN-A01-02-01",
                    name: "Bin A01-02-01",
                    capacity: 400,
                    used: 0,
                    status: "Available",
                  },
                  {
                    id: "BIN-A01-02-02",
                    name: "Bin A01-02-02",
                    capacity: 400,
                    used: 280,
                    status: "Partially Occupied",
                  },
                  {
                    id: "BIN-A01-02-03",
                    name: "Bin A01-02-03",
                    capacity: 400,
                    used: 400,
                    status: "Full",
                  },
                ],
              },
            ],
          },
          {
            id: "A-02",
            name: "Aisle A02",
            racks: [
              {
                id: "R-A02-01",
                name: "Rack A02-01",
                bins: [
                  {
                    id: "BIN-A02-01-01",
                    name: "Bin A02-01-01",
                    capacity: 600,
                    used: 350,
                    status: "Partially Occupied",
                  },
                  {
                    id: "BIN-A02-01-02",
                    name: "Bin A02-01-02",
                    capacity: 600,
                    used: 0,
                    status: "Available",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "Z-B",
        name: "Zone B - General Stock",
        aisles: [
          {
            id: "B-01",
            name: "Aisle B01",
            racks: [
              {
                id: "R-B01-01",
                name: "Rack B01-01",
                bins: [
                  {
                    id: "BIN-B01-01-01",
                    name: "Bin B01-01-01",
                    capacity: 700,
                    used: 610,
                    status: "Partially Occupied",
                  },
                  {
                    id: "BIN-B01-01-02",
                    name: "Bin B01-01-02",
                    capacity: 700,
                    used: 700,
                    status: "Full",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
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
    zones: [
      {
        id: "Z-C",
        name: "Zone C - Main Stock",
        aisles: [
          {
            id: "C-01",
            name: "Aisle C01",
            racks: [
              {
                id: "R-C01-01",
                name: "Rack C01-01",
                bins: [
                  {
                    id: "BIN-C01-01-01",
                    name: "Bin C01-01-01",
                    capacity: 500,
                    used: 250,
                    status: "Partially Occupied",
                  },
                  {
                    id: "BIN-C01-01-02",
                    name: "Bin C01-01-02",
                    capacity: 500,
                    used: 0,
                    status: "Available",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
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
    zones: [
      {
        id: "Z-D",
        name: "Zone D - Distribution",
        aisles: [
          {
            id: "D-01",
            name: "Aisle D01",
            racks: [
              {
                id: "R-D01-01",
                name: "Rack D01-01",
                bins: [
                  {
                    id: "BIN-D01-01-01",
                    name: "Bin D01-01-01",
                    capacity: 800,
                    used: 800,
                    status: "Full",
                  },
                  {
                    id: "BIN-D01-01-02",
                    name: "Bin D01-01-02",
                    capacity: 800,
                    used: 650,
                    status: "Partially Occupied",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
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
    zones: [
      {
        id: "Z-E",
        name: "Zone E - Storage",
        aisles: [
          {
            id: "E-01",
            name: "Aisle E01",
            racks: [
              {
                id: "R-E01-01",
                name: "Rack E01-01",
                bins: [
                  {
                    id: "BIN-E01-01-01",
                    name: "Bin E01-01-01",
                    capacity: 500,
                    used: 200,
                    status: "Partially Occupied",
                  },
                  {
                    id: "BIN-E01-01-02",
                    name: "Bin E01-01-02",
                    capacity: 500,
                    used: 0,
                    status: "Available",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
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
    zones: [
      {
        id: "Z-F",
        name: "Zone F - Maintenance",
        aisles: [
          {
            id: "F-01",
            name: "Aisle F01",
            racks: [
              {
                id: "R-F01-01",
                name: "Rack F01-01",
                bins: [
                  {
                    id: "BIN-F01-01-01",
                    name: "Bin F01-01-01",
                    capacity: 400,
                    used: 100,
                    status: "Blocked",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
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
    zones: [
      {
        id: "Z-G",
        name: "Zone G - Distribution",
        aisles: [
          {
            id: "G-01",
            name: "Aisle G01",
            racks: [
              {
                id: "R-G01-01",
                name: "Rack G01-01",
                bins: [
                  {
                    id: "BIN-G01-01-01",
                    name: "Bin G01-01-01",
                    capacity: 600,
                    used: 450,
                    status: "Partially Occupied",
                  },
                  {
                    id: "BIN-G01-01-02",
                    name: "Bin G01-01-02",
                    capacity: 600,
                    used: 0,
                    status: "Available",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

function getBinUtilization(bin: Bin) {
  if (!bin.capacity) return 0;
  return Math.round((bin.used / bin.capacity) * 100);
}

export default function WarehousePage() {
  const [warehouseList, setWarehouseList] =
    useState<Warehouse[]>(warehouses);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedWarehouseId, setSelectedWarehouseId] =
    useState("WH-001");

  const [showAddWarehouse, setShowAddWarehouse] =
    useState(false);

  const [newWarehouse, setNewWarehouse] = useState({
    name: "",
    location: "",
    manager: "",
    capacity: "",
    status: "Operational" as WarehouseStatus,
  });

  const [expandedZones, setExpandedZones] = useState<string[]>([
    "Z-A",
    "Z-B",
  ]);

  const [expandedAisles, setExpandedAisles] = useState<string[]>([
    "A-01",
    "A-02",
    "B-01",
  ]);

  const [selectedBin, setSelectedBin] = useState<Bin | null>(null);

    function handleAddWarehouse(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const name = newWarehouse.name.trim();
    const location = newWarehouse.location.trim();
    const manager = newWarehouse.manager.trim();
    const capacity = Number(newWarehouse.capacity);

    if (!name || !location || !manager || capacity <= 0) {
      alert("Please enter all warehouse details correctly.");
      return;
    }

    const nextNumber =
      warehouseList.length + 1;

    const warehouseId =
      `WH-${String(nextNumber).padStart(3, "0")}`;

    const createdWarehouse: Warehouse = {
      id: warehouseId,
      name,
      location,
      manager,
      capacity,
      used: 0,
      products: 0,
      status: newWarehouse.status,
      zones: [],
    };

    setWarehouseList((current) => [
      ...current,
      createdWarehouse,
    ]);

    setSelectedWarehouseId(warehouseId);

    setNewWarehouse({
      name: "",
      location: "",
      manager: "",
      capacity: "",
      status: "Operational",
    });

    setShowAddWarehouse(false);

    alert(`${name} added successfully.`);
  }

  const totalCapacity = warehouseList.reduce(
    (sum, warehouse) => sum + warehouse.capacity,
    0
  );

  const totalUsed = warehouseList.reduce(
    (sum, warehouse) => sum + warehouse.used,
    0
  );

  const totalProducts = warehouseList.reduce(
    (sum, warehouse) => sum + warehouse.products,
    0
  );

  const operationalWarehouses = warehouseList.filter(
    (warehouse) => warehouse.status === "Operational"
  ).length;

  const maintenanceWarehouses = warehouseList.filter(
    (warehouse) => warehouse.status === "Maintenance"
  ).length;

  const utilization = Math.round(
    (totalUsed / totalCapacity) * 100
  );

  const availableCapacity = totalCapacity - totalUsed;

  const filteredWarehouses = useMemo(() => {
    return warehouseList.filter((warehouse) => {
      const text = search.toLowerCase().trim();

      const matchesSearch =
        !text ||
        warehouse.name.toLowerCase().includes(text) ||
        warehouse.location.toLowerCase().includes(text) ||
        warehouse.manager.toLowerCase().includes(text) ||
        warehouse.id.toLowerCase().includes(text);

      const matchesStatus =
        statusFilter === "All Status" ||
        warehouse.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [warehouseList, search, statusFilter]);

  const selectedWarehouse = warehouseList.find(
      (warehouse) => warehouse.id === selectedWarehouseId
    ) ?? warehouseList[0]

  const allBins = selectedWarehouse.zones.flatMap((zone) =>
    zone.aisles.flatMap((aisle) =>
      aisle.racks.flatMap((rack) => rack.bins)
    )
  );

  const totalBins = allBins.length;

  const availableBins = allBins.filter(
    (bin) => bin.status === "Available"
  ).length;

  const fullBins = allBins.filter(
    (bin) => bin.status === "Full"
  ).length;

  const blockedBins = allBins.filter(
    (bin) => bin.status === "Blocked"
  ).length;

  function toggleZone(zoneId: string) {
    setExpandedZones((current) =>
      current.includes(zoneId)
        ? current.filter((id) => id !== zoneId)
        : [...current, zoneId]
    );
  }

  function toggleAisle(aisleId: string) {
    setExpandedAisles((current) =>
      current.includes(aisleId)
        ? current.filter((id) => id !== aisleId)
        : [...current, aisleId]
    );
  }

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f8fafc] px-6 py-7 text-slate-900">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}

          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Warehouse Management
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Manage warehouse locations, storage capacity and bins
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Refresh
              </button>

              <a
  href="/warehouse/pick-list"
  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
>
  Pick List
</a>

<button
  type="button"
  onClick={() => setShowAddWarehouse(true)}
  className="rounded-md bg-[#10233f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#183557]"
>
  + Add Warehouse
</button>
            </div>
          </div>

          {/* KPI CARDS */}

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <KpiCard
              title="Total Warehouses"
              value={warehouseList.length.toString()}
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
              subtitle={`${formatNumber(availableCapacity)} units available`}
              color="orange"
            />

          </div>

          {/* WAREHOUSE SELECTOR */}

          <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4">

            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">
                  Select Warehouse
                </h2>

                <p className="mt-1 text-[11px] text-slate-500">
                  Select a warehouse to view its location hierarchy and bins.
                </p>
              </div>

              <span className="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-semibold text-blue-700">
                {selectedWarehouse.id}
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-[1fr_180px]">

              <select
                value={selectedWarehouseId}
                onChange={(event) => {
                  setSelectedWarehouseId(event.target.value);
                  setSelectedBin(null);
                }}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none focus:border-blue-500"
              >
                {warehouseList.map((warehouse) => (
                  <option
                    key={warehouse.id}
                    value={warehouse.id}
                  >
                    {warehouse.name} — {warehouse.location}
                  </option>
                ))}
              </select>

              <div className="rounded-md bg-slate-50 px-3 py-2 text-xs">
                <span className="text-slate-400">
                  Manager
                </span>

                <p className="font-semibold text-slate-700">
                  {selectedWarehouse.manager}
                </p>
              </div>

            </div>
          </section>

          {/* SELECTED WAREHOUSE SUMMARY */}

          <section className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <MiniStat
              title="Total Bins"
              value={totalBins.toString()}
              subtitle="Configured storage bins"
            />

            <MiniStat
              title="Available Bins"
              value={availableBins.toString()}
              subtitle="Ready for stock"
              valueClass="text-green-600"
            />

            <MiniStat
              title="Full Bins"
              value={fullBins.toString()}
              subtitle="At maximum capacity"
              valueClass="text-orange-600"
            />

            <MiniStat
              title="Blocked Bins"
              value={blockedBins.toString()}
              subtitle="Unavailable for use"
              valueClass="text-red-600"
            />

          </section>

          {/* LOCATION TREE */}

          <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 px-5 py-4">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-sm font-semibold">
                    Warehouse Location Tree
                  </h2>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Warehouse → Zone → Aisle → Rack → Bin
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setExpandedZones(
                      selectedWarehouse.zones.map(
                        (zone) => zone.id
                      )
                    );

                    setExpandedAisles(
                      selectedWarehouse.zones.flatMap(
                        (zone) =>
                          zone.aisles.map(
                            (aisle) => aisle.id
                          )
                      )
                    );
                  }}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Expand All
                </button>

              </div>
            </div>

            <div className="p-5">

              {/* ROOT WAREHOUSE */}

              <div className="mb-3 flex items-center gap-2 rounded-lg bg-[#10233f] px-4 py-3 text-white">

                <span className="text-sm">▣</span>

                <div>
                  <p className="text-xs font-semibold">
                    {selectedWarehouse.name}
                  </p>

                  <p className="text-[10px] text-slate-300">
                    {selectedWarehouse.location} •{" "}
                    {selectedWarehouse.id}
                  </p>
                </div>

              </div>

              {/* ZONES */}

              <div className="ml-4 border-l border-slate-200 pl-4">

                {selectedWarehouse.zones.map((zone) => {

                  const zoneOpen = expandedZones.includes(
                    zone.id
                  );

                  return (
                    <div
                      key={zone.id}
                      className="mb-3"
                    >

                      <button
                        type="button"
                        onClick={() =>
                          toggleZone(zone.id)
                        }
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-slate-50"
                      >

                        <span className="w-4 text-xs text-slate-500">
                          {zoneOpen ? "▼" : "▶"}
                        </span>

                        <span className="text-sm">
                          ▰
                        </span>

                        <span className="text-xs font-semibold text-slate-700">
                          {zone.name}
                        </span>

                        <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[9px] text-slate-500">
                          {zone.aisles.length} aisles
                        </span>

                      </button>

                      {zoneOpen && (
                        <div className="ml-6 border-l border-slate-200 pl-4">

                          {zone.aisles.map((aisle) => {

                            const aisleOpen =
                              expandedAisles.includes(
                                aisle.id
                              );

                            return (
                              <div
                                key={aisle.id}
                                className="mb-2"
                              >

                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleAisle(
                                      aisle.id
                                    )
                                  }
                                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-slate-50"
                                >

                                  <span className="w-4 text-xs text-slate-500">
                                    {aisleOpen
                                      ? "▼"
                                      : "▶"}
                                  </span>

                                  <span className="text-sm">
                                    ║
                                  </span>

                                  <span className="text-xs font-medium text-slate-700">
                                    {aisle.name}
                                  </span>

                                  <span className="ml-auto text-[9px] text-slate-400">
                                    {aisle.racks.length} racks
                                  </span>

                                </button>

                                {aisleOpen && (
                                  <div className="ml-6 border-l border-slate-200 pl-4">

                                    {aisle.racks.map(
                                      (rack) => (
                                        <div
                                          key={rack.id}
                                          className="mb-2"
                                        >

                                          <div className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2">

                                            <span className="text-xs">
                                              ▤
                                            </span>

                                            <span className="text-xs font-medium text-slate-700">
                                              {rack.name}
                                            </span>

                                            <span className="ml-auto text-[9px] text-slate-400">
                                              {rack.bins.length} bins
                                            </span>

                                          </div>

                                          {/* BIN LIST */}

                                          <div className="mt-1 ml-5 grid gap-1">

                                            {rack.bins.map(
                                              (bin) => {

                                                const percent =
                                                  getBinUtilization(
                                                    bin
                                                  );

                                                return (
                                                  <button
                                                    key={
                                                      bin.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                      setSelectedBin(
                                                        bin
                                                      )
                                                    }
                                                    className={`flex items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
                                                      selectedBin?.id ===
                                                      bin.id
                                                        ? "border-blue-300 bg-blue-50"
                                                        : "border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50"
                                                    }`}
                                                  >

                                                    <span className="text-xs">
                                                      ▫
                                                    </span>

                                                    <div className="min-w-0 flex-1">

                                                      <p className="truncate text-[11px] font-medium text-slate-700">
                                                        {bin.name}
                                                      </p>

                                                      <div className="mt-1 flex items-center gap-2">

                                                        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">

                                                          <div
                                                            className={`h-full ${
                                                              percent >=
                                                              90
                                                                ? "bg-orange-500"
                                                                : percent ===
                                                                    0
                                                                  ? "bg-slate-300"
                                                                  : "bg-blue-500"
                                                            }`}
                                                            style={{
                                                              width: `${percent}%`,
                                                            }}
                                                          />

                                                        </div>

                                                        <span className="text-[9px] text-slate-400">
                                                          {percent}%
                                                        </span>

                                                      </div>

                                                    </div>

                                                    <BinStatusBadge
                                                      status={
                                                        bin.status
                                                      }
                                                    />

                                                  </button>
                                                );
                                              }
                                            )}

                                          </div>

                                        </div>
                                      )
                                    )}

                                  </div>
                                )}

                              </div>
                            );
                          })}

                        </div>
                      )}

                    </div>
                  );
                })}

              </div>

            </div>

          </section>

                    {/* SELECTED BIN DETAILS */}

          {selectedBin && (
            <section className="mb-5 rounded-xl border border-slate-200 bg-white">

              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                <div>
                  <h2 className="text-sm font-semibold">
                    Bin Details
                  </h2>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Detailed storage information for the selected bin.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedBin(null)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>

              </div>

              <div className="grid gap-4 p-5 md:grid-cols-4">

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Bin
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-800">
                    {selectedBin.name}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {selectedBin.id}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Capacity
                  </p>

                  <p className="mt-2 text-xl font-bold text-blue-600">
                    {formatNumber(selectedBin.capacity)}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Maximum units
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Used
                  </p>

                  <p className="mt-2 text-xl font-bold text-orange-600">
                    {formatNumber(selectedBin.used)}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {getBinUtilization(selectedBin)}% occupied
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Status
                  </p>

                  <div className="mt-3">
                    <BinStatusBadge
                      status={selectedBin.status}
                    />
                  </div>
                </div>

              </div>

              {/* BIN CAPACITY */}

              <div className="border-t border-slate-200 px-5 py-4">

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Bin Capacity
                    </p>

                    <p className="mt-1 text-[10px] text-slate-400">
                      Current storage utilization
                    </p>
                  </div>

                  <strong className="text-sm text-slate-800">
                    {getBinUtilization(selectedBin)}%
                  </strong>
                </div>

                <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">

                  <div
                    className={`h-full rounded-full ${
                      getBinUtilization(selectedBin) >= 90
                        ? "bg-orange-500"
                        : getBinUtilization(selectedBin) === 0
                          ? "bg-slate-300"
                          : "bg-blue-600"
                    }`}
                    style={{
                      width: `${getBinUtilization(selectedBin)}%`,
                    }}
                  />

                </div>

                <div className="mt-2 flex justify-between text-[10px] text-slate-400">

                  <span>
                    {formatNumber(selectedBin.used)} units used
                  </span>

                  <span>
                    {formatNumber(
                      selectedBin.capacity - selectedBin.used
                    )}{" "}
                    units available
                  </span>

                </div>

              </div>

              {/* BIN ACTIONS */}

              <div className="flex flex-wrap gap-2 border-t border-slate-200 px-5 py-4">

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      `Stock transfer started for ${selectedBin.name}`
                    )
                  }
                  className="rounded-md bg-[#10233f] px-4 py-2 text-[10px] font-semibold text-white hover:bg-[#183557]"
                >
                  Transfer Stock
                </button>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      `Bin adjustment opened for ${selectedBin.name}`
                    )
                  }
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Adjust Stock
                </button>

                <button
                  type="button"
                  onClick={() =>
                    alert(
                      `Bin ${selectedBin.name} selected for management`
                    )
                  }
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Manage Bin
                </button>

              </div>

            </section>
          )}

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
                Overview of warehouse locations and capacity.
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
                          )}

                          {" / "}

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
                                  warehouseUtilization >= 85
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
                            onClick={() => {
                              setSelectedWarehouseId(
                                warehouse.id
                              );

                              window.scrollTo({
                                top: 0,
                                behavior: "smooth",
                              });
                            }}
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
                {warehouseList.length} warehouses
              </p>

            </div>

          </section>

          {/* INSIGHTS */}

          <section className="mt-5 grid gap-4 md:grid-cols-3">

            <InsightCard
              title="Warehouse Health"
              value={`${operationalWarehouses} of ${warehouseList.length}`}
              description="Warehouses are currently operational."
              tone="green"
            />

            <InsightCard
              title="Available Capacity"
              value={`${formatNumber(
                availableCapacity
              )} units`}
              description="Remaining storage capacity across all warehouses."
              tone="blue"
            />

            <InsightCard
              title="Attention Required"
              value={`${maintenanceWarehouses} warehouse${
                maintenanceWarehouses === 1
                  ? ""
                  : "s"
              }`}
              description="Currently marked for maintenance."
              tone="orange"
            />

          </section>

          {/* WAREHOUSE MANAGEMENT NOTE */}

          <section className="mt-5 rounded-xl border border-blue-100 bg-blue-50/50 p-4">

            <div className="flex gap-3">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs text-blue-700">
                i
              </div>

              <div>

                <p className="text-xs font-semibold text-blue-800">
                  Warehouse location management
                </p>

                <p className="mt-1 text-[10px] leading-5 text-blue-600">
                  Select a warehouse and expand its zones,
                  aisles, racks and bins to review storage
                  availability. Select any bin to inspect its
                  capacity and management actions.
                </p>

              </div>

            </div>

          </section>

                {/* =================================================
          ADD WAREHOUSE MODAL
      ================================================= */}

      {showAddWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">

              <div>
                <h2 className="text-lg font-bold text-[#12213a]">
                  Add Warehouse
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Create a new warehouse location.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddWarehouse(false)}
                className="text-xl text-gray-400 hover:text-gray-700"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleAddWarehouse}
              className="space-y-4 p-5"
            >

              {/* WAREHOUSE NAME */}

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Warehouse Name
                </label>

                <input
                  type="text"
                  value={newWarehouse.name}
                  onChange={(e) =>
                    setNewWarehouse({
                      ...newWarehouse,
                      name: e.target.value,
                    })
                  }
                  placeholder="e.g. Jaipur Distribution Center"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* WAREHOUSE CODE */}

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Warehouse Code
                </label>

                <input
                  type="text"
                  value={`WH-${String(
                    warehouseList.length + 1
                  ).padStart(3, "0")}`}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-600 outline-none"
                />
              </div>

              {/* LOCATION */}

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Location
                </label>

                <input
                  type="text"
                  value={newWarehouse.location}
                  onChange={(e) =>
                    setNewWarehouse({
                      ...newWarehouse,
                      location: e.target.value,
                    })
                  }
                  placeholder="e.g. Jaipur"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* MANAGER */}

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Manager
                </label>

                <input
                  type="text"
                  value={newWarehouse.manager}
                  onChange={(e) =>
                    setNewWarehouse({
                      ...newWarehouse,
                      manager: e.target.value,
                    })
                  }
                  placeholder="Enter manager name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* CAPACITY */}

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Capacity (Units)
                </label>

                <input
                  type="number"
                  min="1"
                  value={newWarehouse.capacity}
                  onChange={(e) =>
                    setNewWarehouse({
                      ...newWarehouse,
                      capacity: e.target.value,
                    })
                  }
                  placeholder="e.g. 10000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  required
                />
              </div>

              {/* STATUS */}

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-700">
                  Status
                </label>

                <select
                  value={newWarehouse.status}
                  onChange={(e) =>
                    setNewWarehouse({
                      ...newWarehouse,
                      status: e.target.value as WarehouseStatus,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                >
                  <option value="Operational">
                    Operational
                  </option>

                  <option value="Maintenance">
                    Maintenance
                  </option>

                  <option value="Blocked">
                    Blocked
                  </option>
                </select>
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-4">

                <button
                  type="button"
                  onClick={() => setShowAddWarehouse(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-[#12213a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1d3055]"
                >
                  Add Warehouse
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

          {/* FOOTER */}

          <div className="mt-5 pb-8 text-center">

            <p className="text-[10px] text-slate-400">
              AI StockFlow • Warehouse & Bin Management
            </p>

          </div>

        </div>
      </main>
    </PageLayout>
  );
}


/* =========================================================
   KPI CARD
   ========================================================= */

type KpiCardProps = {
  title: string;
  value: string;
  subtitle: string;
  color: "green" | "blue" | "orange";
};

function KpiCard({
  title,
  value,
  subtitle,
  color,
}: KpiCardProps) {

  const valueColor = {
    green: "text-green-600",
    blue: "text-blue-600",
    orange: "text-orange-500",
  }[color];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p
        className={`mt-2 text-2xl font-bold tracking-tight ${valueColor}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}


/* =========================================================
   MINI STAT
   ========================================================= */

type MiniStatProps = {
  title: string;
  value: string;
  subtitle: string;
  valueClass?: string;
};

function MiniStat({
  title,
  value,
  subtitle,
  valueClass = "text-slate-800",
}: MiniStatProps) {

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p
        className={`mt-2 text-xl font-bold ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-400">
        {subtitle}
      </p>

    </div>
  );
}


/* =========================================================
   BIN STATUS BADGE
   ========================================================= */

function BinStatusBadge({
  status,
}: {
  status: BinStatus;
}) {

  const styles = {
    Available: "bg-green-100 text-green-700",
    "Partially Occupied":
      "bg-blue-100 text-blue-700",
    Full: "bg-orange-100 text-orange-700",
    Blocked: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[9px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}


/* =========================================================
   INSIGHT CARD
   ========================================================= */

type InsightCardProps = {
  title: string;
  value: string;
  description: string;
  tone: "green" | "blue" | "orange";
};

function InsightCard({
  title,
  value,
  description,
  tone,
}: InsightCardProps) {

  const styles = {
    green: {
      wrapper:
        "border-green-100 bg-green-50/40",
      value: "text-green-700",
    },

    blue: {
      wrapper:
        "border-blue-100 bg-blue-50/40",
      value: "text-blue-700",
    },

    orange: {
      wrapper:
        "border-orange-100 bg-orange-50/40",
      value: "text-orange-600",
    },
  }[tone];

  return (
    <div
      className={`rounded-xl border p-5 ${styles.wrapper}`}
    >

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p
        className={`mt-2 text-xl font-bold ${styles.value}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[11px] leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}