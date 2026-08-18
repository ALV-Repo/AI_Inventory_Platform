"use client";

import { useMemo, useState } from "react";

type PriceStatus = "Pending" | "Approved" | "Rejected";

type PriceItem = {
  id: number;
  product: string;
  sku: string;
  currentPrice: number;
  suggestedPrice: number;
  change: number;
  margin: number;
  status: PriceStatus;
};

const initialData: PriceItem[] = [
  {
    id: 1,
    product: "Wireless Headphones",
    sku: "WH-1001",
    currentPrice: 2499,
    suggestedPrice: 2699,
    change: 8.0,
    margin: 32.5,
    status: "Pending",
  },
  {
    id: 2,
    product: "Bluetooth Speaker",
    sku: "BS-1002",
    currentPrice: 1899,
    suggestedPrice: 1799,
    change: -5.3,
    margin: 28.4,
    status: "Pending",
  },
  {
    id: 3,
    product: "Gaming Keyboard",
    sku: "GK-1003",
    currentPrice: 3499,
    suggestedPrice: 3799,
    change: 8.6,
    margin: 36.2,
    status: "Approved",
  },
  {
    id: 4,
    product: "Wireless Mouse",
    sku: "WM-1004",
    currentPrice: 1299,
    suggestedPrice: 1399,
    change: 7.7,
    margin: 34.1,
    status: "Pending",
  },
  {
    id: 5,
    product: "USB-C Hub",
    sku: "UC-1005",
    currentPrice: 999,
    suggestedPrice: 899,
    change: -10.0,
    margin: 24.8,
    status: "Rejected",
  },
  {
    id: 6,
    product: "Power Bank",
    sku: "PB-1006",
    currentPrice: 1599,
    suggestedPrice: 1699,
    change: 6.3,
    margin: 31.7,
    status: "Approved",
  },
];

function formatCurrency(value: number) {
  return `₹${value.toLocaleString("en-IN")}`;
}

function StatusBadge({ status }: { status: PriceStatus }) {
  const styles: Record<PriceStatus, React.CSSProperties> = {
    Pending: {
      background: "#fff7ed",
      color: "#ea580c",
      border: "1px solid #fed7aa",
    },
    Approved: {
      background: "#ecfdf5",
      color: "#059669",
      border: "1px solid #a7f3d0",
    },
    Rejected: {
      background: "#fef2f2",
      color: "#dc2626",
      border: "1px solid #fecaca",
    },
  };

  return (
    <span
      style={{
        ...styles[status],
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        display: "inline-block",
      }}
    >
      {status}
    </span>
  );
}

export default function PriceReviewPage() {
  const [items, setItems] = useState<PriceItem[]>(initialData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | PriceStatus>("All");

  const filteredItems = useMemo(() => {
    const query = search.toLowerCase().trim();

    return items.filter((item) => {
      const matchesSearch =
        !query ||
        item.product.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [items, search, statusFilter]);

  const pendingCount = items.filter((item) => item.status === "Pending").length;
  const approvedCount = items.filter(
    (item) => item.status === "Approved"
  ).length;
  const rejectedCount = items.filter(
    (item) => item.status === "Rejected"
  ).length;

  const approveItem = (id: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "Approved" } : item
      )
    );
  };

  const rejectItem = (id: number) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: "Rejected" } : item
      )
    );
  };

  const resetData = () => {
    setItems(initialData);
    setSearch("");
    setStatusFilter("All");
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "32px",
      }}
    >
      <div
        style={{
          maxWidth: 1150,
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 28,
            gap: 20,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Price Review
            </h1>

            <p
              style={{
                marginTop: 7,
                color: "#64748b",
                fontSize: 14,
              }}
            >
              Review AI-powered pricing recommendations for your products
            </p>
          </div>

          <button
            onClick={resetData}
            style={{
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#334155",
              padding: "10px 16px",
              borderRadius: 7,
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Refresh
          </button>
        </div>

        {/* Summary cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <SummaryCard
            title="Total Recommendations"
            value={items.length.toString()}
            subtitle="AI pricing suggestions"
          />

          <SummaryCard
            title="Pending Review"
            value={pendingCount.toString()}
            subtitle="Awaiting action"
            valueColor="#ea580c"
          />

          <SummaryCard
            title="Approved"
            value={approvedCount.toString()}
            subtitle="Approved prices"
            valueColor="#16a34a"
          />

          <SummaryCard
            title="Rejected"
            value={rejectedCount.toString()}
            subtitle="Rejected prices"
            valueColor="#dc2626"
          />
        </div>

        {/* Filter */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: 14,
            marginBottom: 18,
            display: "flex",
            gap: 10,
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or SKU..."
            style={{
              flex: 1,
              height: 40,
              border: "1px solid #cbd5e1",
              borderRadius: 7,
              padding: "0 12px",
              outline: "none",
              fontSize: 14,
            }}
          />

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "All" | PriceStatus)
            }
            style={{
              height: 40,
              minWidth: 150,
              border: "1px solid #cbd5e1",
              borderRadius: 7,
              padding: "0 12px",
              background: "#ffffff",
              fontSize: 14,
            }}
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Main table */}
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 18px 14px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 17,
                color: "#0f172a",
              }}
            >
              Pricing Recommendations
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: 13,
                color: "#64748b",
              }}
            >
              AI-generated price recommendations based on inventory and sales
              performance.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 900,
              }}
            >
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  <Th>Product</Th>
                  <Th>Current Price</Th>
                  <Th>Suggested Price</Th>
                  <Th>Change</Th>
                  <Th>Margin</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </tr>
              </thead>

              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id}>
                    <Td>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        {item.product}
                      </div>

                      <div
                        style={{
                          marginTop: 3,
                          fontSize: 12,
                          color: "#64748b",
                        }}
                      >
                        SKU: {item.sku}
                      </div>
                    </Td>

                    <Td>{formatCurrency(item.currentPrice)}</Td>

                    <Td>
                      <strong>{formatCurrency(item.suggestedPrice)}</strong>
                    </Td>

                    <Td>
                      <span
                        style={{
                          color: item.change >= 0 ? "#16a34a" : "#dc2626",
                          fontWeight: 600,
                        }}
                      >
                        {item.change >= 0 ? "+" : ""}
                        {item.change.toFixed(1)}%
                      </span>
                    </Td>

                    <Td>{item.margin.toFixed(1)}%</Td>

                    <Td>
                      <StatusBadge status={item.status} />
                    </Td>

                    <Td>
                      <div
                        style={{
                          display: "flex",
                          gap: 7,
                        }}
                      >
                        {item.status === "Pending" && (
                          <>
                            <button
                              onClick={() => approveItem(item.id)}
                              style={{
                                border: "1px solid #bbf7d0",
                                background: "#f0fdf4",
                                color: "#15803d",
                                padding: "6px 9px",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              Approve
                            </button>

                            <button
                              onClick={() => rejectItem(item.id)}
                              style={{
                                border: "1px solid #fecaca",
                                background: "#fef2f2",
                                color: "#dc2626",
                                padding: "6px 9px",
                                borderRadius: 6,
                                cursor: "pointer",
                                fontSize: 12,
                                fontWeight: 600,
                              }}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {item.status === "Approved" && (
                          <span
                            style={{
                              fontSize: 12,
                              color: "#16a34a",
                              fontWeight: 600,
                            }}
                          >
                            Approved
                          </span>
                        )}

                        {item.status === "Rejected" && (
                          <span
                            style={{
                              fontSize: 12,
                              color: "#dc2626",
                              fontWeight: 600,
                            }}
                          >
                            Rejected
                          </span>
                        )}
                      </div>
                    </Td>
                  </tr>
                ))}

                {filteredItems.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: 50,
                        textAlign: "center",
                        color: "#64748b",
                      }}
                    >
                      No pricing recommendations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "12px 18px",
              borderTop: "1px solid #e2e8f0",
              color: "#64748b",
              fontSize: 12,
            }}
          >
            Showing {filteredItems.length} of {items.length} recommendations
          </div>
        </section>

        {/* Information section */}
        <section
          style={{
            marginTop: 18,
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            padding: 18,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              color: "#0f172a",
            }}
          >
            How Price Review Works
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
              marginTop: 16,
            }}
          >
            <InfoCard
              number="01"
              title="AI Analysis"
              text="The system analyses inventory, sales and product performance."
            />

            <InfoCard
              number="02"
              title="Price Suggestion"
              text="A recommended selling price is generated for review."
            />

            <InfoCard
              number="03"
              title="Business Decision"
              text="Reviewers can approve or reject the recommendation."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  valueColor = "#0f172a",
}: {
  title: string;
  value: string;
  subtitle: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: 17,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#64748b",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 25,
          fontWeight: 700,
          color: valueColor,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          color: "#94a3b8",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "12px 14px",
        fontSize: 11,
        fontWeight: 700,
        color: "#64748b",
        borderBottom: "1px solid #e2e8f0",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return (
    <td
      style={{
        padding: "14px",
        fontSize: 13,
        color: "#334155",
        borderBottom: "1px solid #f1f5f9",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}

function InfoCard({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: "#eff6ff",
          color: "#2563eb",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {number}
      </div>

      <div>
        <div
          style={{
            fontWeight: 600,
            fontSize: 13,
            color: "#0f172a",
          }}
        >
          {title}
        </div>

        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            lineHeight: 1.5,
            color: "#64748b",
          }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}