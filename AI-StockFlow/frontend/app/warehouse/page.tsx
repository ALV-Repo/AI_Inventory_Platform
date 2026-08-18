"use client";

import { useMemo, useState } from "react";

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
  const [statusFilter, setStatusFilter] = useState("All Status");

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

  const utilization = Math.round((totalUsed / totalCapacity) * 100);

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((warehouse) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        warehouse.name.toLowerCase().includes(searchText) ||
        warehouse.location.toLowerCase().includes(searchText) ||
        warehouse.manager.toLowerCase().includes(searchText) ||
        warehouse.id.toLowerCase().includes(searchText);

      const matchesStatus =
        statusFilter === "All Status" ||
        warehouse.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "28px 38px",
        color: "#0f172a",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 26,
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            Warehouse
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Manage warehouses, storage capacity and inventory locations
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            borderRadius: 7,
            padding: "9px 18px",
            cursor: "pointer",
            fontWeight: 600,
            color: "#334155",
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <div style={cardStyle}>
            <p style={labelStyle}>Total Warehouses</p>

            <h2 style={valueStyle}>
              {warehouses.length}
            </h2>

            <span style={smallGreen}>
              Registered locations
            </span>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Operational</p>

            <h2 style={valueStyle}>
              {operationalWarehouses}
            </h2>

            <span style={smallGreen}>
              Currently active
            </span>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Total Products</p>

            <h2 style={valueStyle}>
              {formatNumber(totalProducts)}
            </h2>

            <span style={smallBlue}>
              Products across warehouses
            </span>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Capacity Utilization</p>

            <h2 style={valueStyle}>
              {utilization}%
            </h2>

            <span style={smallOrange}>
              Current storage usage
            </span>
          </div>
        </div>

        {/* Capacity Overview */}
        <section style={sectionStyle}>
          <div
            style={{
              padding: "18px 18px 14px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 16,
              }}
            >
              Storage Capacity Overview
            </h3>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: 12,
                color: "#64748b",
              }}
            >
              Warehouse storage utilization
            </p>
          </div>

          <div
            style={{
              padding: 20,
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p style={labelStyle}>
                  Used Capacity
                </p>

                <strong style={{ fontSize: 14 }}>
                  {formatNumber(totalUsed)}
                </strong>
              </div>

              <div
                style={{
                  height: 12,
                  background: "#e2e8f0",
                  borderRadius: 10,
                  overflow: "hidden",
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    width: `${utilization}%`,
                    height: "100%",
                    background: "#2563eb",
                    borderRadius: 10,
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                <span>
                  {formatNumber(totalUsed)} units
                </span>

                <span>
                  {utilization}%
                </span>
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p style={labelStyle}>
                  Available Capacity
                </p>

                <strong style={{ fontSize: 14 }}>
                  {formatNumber(totalCapacity - totalUsed)}
                </strong>
              </div>

              <div
                style={{
                  height: 12,
                  background: "#e2e8f0",
                  borderRadius: 10,
                  overflow: "hidden",
                  marginTop: 12,
                }}
              >
                <div
                  style={{
                    width: `${100 - utilization}%`,
                    height: "100%",
                    background: "#16a34a",
                    borderRadius: 10,
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 8,
                  fontSize: 12,
                  color: "#64748b",
                }}
              >
                <span>
                  {formatNumber(totalCapacity - totalUsed)} units
                </span>

                <span>
                  {100 - utilization}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section
          style={{
            ...sectionStyle,
            padding: 12,
            marginTop: 16,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 160px",
              gap: 10,
            }}
          >
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search warehouse, location, manager or ID..."
              style={inputStyle}
            />

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              style={inputStyle}
            >
              <option>All Status</option>
              <option>Operational</option>
              <option>Maintenance</option>
            </select>
          </div>
        </section>

        {/* Warehouse Table */}
        <section
          style={{
            ...sectionStyle,
            marginTop: 16,
          }}
        >
          <div
            style={{
              padding: "18px 18px 14px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 16,
              }}
            >
              Warehouse Directory
            </h3>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: 12,
                color: "#64748b",
              }}
            >
              Overview of warehouse locations and capacity
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: 13,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                  }}
                >
                  <th style={thStyle}>
                    Warehouse
                  </th>

                  <th style={thStyle}>
                    Location
                  </th>

                  <th style={thStyle}>
                    Manager
                  </th>

                  <th style={thStyle}>
                    Products
                  </th>

                  <th style={thStyle}>
                    Capacity
                  </th>

                  <th style={thStyle}>
                    Utilization
                  </th>

                  <th style={thStyle}>
                    Status
                  </th>

                  <th style={thStyle}>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredWarehouses.map((warehouse) => {
                  const warehouseUtilization = Math.round(
                    (warehouse.used / warehouse.capacity) *
                      100
                  );

                  return (
                    <tr key={warehouse.id}>
                      <td style={tdStyle}>
                        <strong>
                          {warehouse.name}
                        </strong>

                        <div
                          style={{
                            color: "#64748b",
                            fontSize: 11,
                            marginTop: 3,
                          }}
                        >
                          {warehouse.id}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        {warehouse.location}
                      </td>

                      <td style={tdStyle}>
                        {warehouse.manager}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 600,
                        }}
                      >
                        {formatNumber(
                          warehouse.products
                        )}
                      </td>

                      <td style={tdStyle}>
                        {formatNumber(
                          warehouse.used
                        )}{" "}
                        /{" "}
                        {formatNumber(
                          warehouse.capacity
                        )}
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              width: 65,
                              height: 7,
                              background: "#e2e8f0",
                              borderRadius: 10,
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${warehouseUtilization}%`,
                                height: "100%",
                                background:
                                  warehouseUtilization >=
                                  85
                                    ? "#f97316"
                                    : "#2563eb",
                                borderRadius: 10,
                              }}
                            />
                          </div>

                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            {warehouseUtilization}%
                          </span>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "5px 9px",
                            borderRadius: 20,
                            fontSize: 11,
                            fontWeight: 600,
                            background:
                              warehouse.status ===
                              "Operational"
                                ? "#dcfce7"
                                : "#ffedd5",
                            color:
                              warehouse.status ===
                              "Operational"
                                ? "#15803d"
                                : "#c2410c",
                          }}
                        >
                          {warehouse.status}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <button
                          onClick={() =>
                            alert(
                              `${warehouse.name} selected`
                            )
                          }
                          style={{
                            border: "none",
                            background:
                              "transparent",
                            color: "#2563eb",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
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
              <div
                style={{
                  padding: 45,
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                No warehouses found.
              </div>
            )}
          </div>

          <div
            style={{
              padding: "12px 18px",
              borderTop: "1px solid #e2e8f0",
              color: "#64748b",
              fontSize: 12,
            }}
          >
            Showing {filteredWarehouses.length} of{" "}
            {warehouses.length} warehouses
          </div>
        </section>

        {/* Warehouse Insights */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(3, 1fr)",
            gap: 14,
            marginTop: 16,
          }}
        >
          <div style={insightStyle}>
            <p style={labelStyle}>
              Storage Health
            </p>

            <h3
              style={{
                margin: "7px 0",
                fontSize: 22,
              }}
            >
              {utilization}%
            </h3>

            <p style={smallText}>
              Overall warehouse capacity utilization
            </p>
          </div>

          <div style={insightStyle}>
            <p style={labelStyle}>
              Available Space
            </p>

            <h3
              style={{
                margin: "7px 0",
                fontSize: 22,
              }}
            >
              {formatNumber(
                totalCapacity - totalUsed
              )}
            </h3>

            <p style={smallText}>
              Units of remaining storage capacity
            </p>
          </div>

          <div style={insightStyle}>
            <p style={labelStyle}>
              Maintenance
            </p>

            <h3
              style={{
                margin: "7px 0",
                fontSize: 22,
              }}
            >
              {
                warehouses.filter(
                  (warehouse) =>
                    warehouse.status ===
                    "Maintenance"
                ).length
              }
            </h3>

            <p style={smallText}>
              Warehouse requiring attention
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  padding: "18px 16px",
};

const sectionStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  overflow: "hidden" as const,
};

const insightStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 9,
  padding: 18,
};

const labelStyle = {
  margin: 0,
  color: "#64748b",
  fontSize: 12,
};

const valueStyle = {
  margin: "8px 0",
  fontSize: 22,
  fontWeight: 700,
};

const smallGreen = {
  color: "#16a34a",
  fontSize: 12,
};

const smallBlue = {
  color: "#2563eb",
  fontSize: 12,
};

const smallOrange = {
  color: "#f97316",
  fontSize: 12,
};

const smallText = {
  margin: 0,
  color: "#64748b",
  fontSize: 12,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 7,
  background: "#ffffff",
  fontSize: 13,
  outline: "none",
};

const thStyle = {
  textAlign: "left" as const,
  padding: "12px 16px",
  borderBottom: "1px solid #e2e8f0",
  color: "#64748b",
  fontSize: 11,
  fontWeight: 600,
};

const tdStyle = {
  padding: "13px 16px",
  borderBottom: "1px solid #e2e8f0",
  verticalAlign: "middle" as const,
};