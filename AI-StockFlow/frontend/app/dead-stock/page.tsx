"use client";

import { useMemo, useState } from "react";

type Product = {
  sku: string;
  name: string;
  category: string;
  stock: number;
  dailySales: number;
  daysSinceSale: number;
  value: number;
  status: "Critical" | "Dead Stock" | "At Risk";
};

const products: Product[] = [
  {
    sku: "WH-1001",
    name: "Wireless Headphones",
    category: "Audio",
    stock: 45,
    dailySales: 0,
    daysSinceSale: 78,
    value: 112500,
    status: "Dead Stock",
  },
  {
    sku: "BS-1002",
    name: "Bluetooth Speaker",
    category: "Audio",
    stock: 32,
    dailySales: 0,
    daysSinceSale: 65,
    value: 60800,
    status: "Dead Stock",
  },
  {
    sku: "GK-1003",
    name: "Gaming Keyboard",
    category: "Gaming",
    stock: 18,
    dailySales: 0,
    daysSinceSale: 52,
    value: 62982,
    status: "At Risk",
  },
  {
    sku: "WM-1004",
    name: "Wireless Mouse",
    category: "Accessories",
    stock: 25,
    dailySales: 0,
    daysSinceSale: 47,
    value: 32475,
    status: "At Risk",
  },
  {
    sku: "UC-1005",
    name: "USB-C Hub",
    category: "Accessories",
    stock: 20,
    dailySales: 0,
    daysSinceSale: 91,
    value: 19980,
    status: "Critical",
  },
  {
    sku: "PB-1006",
    name: "Power Bank",
    category: "Power",
    stock: 28,
    dailySales: 0,
    daysSinceSale: 73,
    value: 44772,
    status: "Dead Stock",
  },
];

export default function DeadStockPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Status");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "All Status" || product.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [search, status]);

  const totalValue = products.reduce(
    (sum, product) => sum + product.value,
    0
  );

  const criticalProducts = products.filter(
    (product) => product.status === "Critical"
  ).length;

  const deadProducts = products.filter(
    (product) => product.status === "Dead Stock"
  ).length;

  const atRiskProducts = products.filter(
    (product) => product.status === "At Risk"
  ).length;

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString("en-IN")}`;

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
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "28px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
                fontWeight: 700,
                color: "#111827",
              }}
            >
              Dead Stock
            </h1>

            <p
              style={{
                marginTop: "7px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Identify slow-moving and non-moving inventory
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            style={{
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              borderRadius: "7px",
              padding: "10px 18px",
              cursor: "pointer",
              fontWeight: 600,
              color: "#334155",
            }}
          >
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "14px",
            marginBottom: "22px",
          }}
        >
          <KpiCard
            title="Dead Stock Value"
            value={formatCurrency(totalValue)}
            subtitle="Inventory tied up"
            valueColor="#dc2626"
          />

          <KpiCard
            title="Dead Stock Products"
            value={deadProducts}
            subtitle="No recent movement"
            valueColor="#f97316"
          />

          <KpiCard
            title="Critical Products"
            value={criticalProducts}
            subtitle="Immediate action"
            valueColor="#dc2626"
          />

          <KpiCard
            title="At Risk"
            value={atRiskProducts}
            subtitle="Needs attention"
            valueColor="#ca8a04"
          />
        </div>

        {/* Search / Filter */}
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "14px",
            display: "flex",
            gap: "12px",
            marginBottom: "18px",
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product or SKU..."
            style={{
              flex: 1,
              height: "40px",
              border: "1px solid #cbd5e1",
              borderRadius: "7px",
              padding: "0 12px",
              outline: "none",
              fontSize: "14px",
            }}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: "160px",
              height: "40px",
              border: "1px solid #cbd5e1",
              borderRadius: "7px",
              padding: "0 10px",
              background: "#ffffff",
            }}
          >
            <option>All Status</option>
            <option>Critical</option>
            <option>Dead Stock</option>
            <option>At Risk</option>
          </select>
        </div>

        {/* Main Table */}
        <section
          style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "17px",
                color: "#111827",
              }}
            >
              Dead Stock Analysis
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Products with little or no sales activity
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    textAlign: "left",
                  }}
                >
                  <th style={thStyle}>Product</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Stock</th>
                  <th style={thStyle}>Last Sale</th>
                  <th style={thStyle}>Stock Value</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.sku}>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: "#111827" }}>
                        {product.name}
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          marginTop: "3px",
                        }}
                      >
                        SKU: {product.sku}
                      </div>
                    </td>

                    <td style={tdStyle}>{product.category}</td>

                    <td style={tdStyle}>
                      <strong>{product.stock}</strong> units
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          color:
                            product.daysSinceSale > 75
                              ? "#dc2626"
                              : "#475569",
                        }}
                      >
                        {product.daysSinceSale} days ago
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {formatCurrency(product.value)}
                    </td>

                    <td style={tdStyle}>
                      <StatusBadge status={product.status} />
                    </td>

                    <td style={tdStyle}>
                      <button
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#2563eb",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                        onClick={() =>
                          alert(
                            `${product.name}\nStock: ${product.stock} units\nValue: ${formatCurrency(
                              product.value
                            )}`
                          )
                        }
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "12px 18px",
              borderTop: "1px solid #e2e8f0",
              color: "#64748b",
              fontSize: "12px",
            }}
          >
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </section>

        {/* Insights */}
        <section
          style={{
            marginTop: "18px",
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "17px",
              color: "#111827",
            }}
          >
            Inventory Insights
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
            }}
          >
            <InsightCard
              title="Clearance Opportunity"
              value={`${deadProducts} products`}
              description="Consider promotional pricing to move old inventory."
            />

            <InsightCard
              title="Capital Locked"
              value={formatCurrency(totalValue)}
              description="Inventory value currently tied up in slow-moving stock."
            />

            <InsightCard
              title="Immediate Attention"
              value={`${criticalProducts} product`}
              description="These products have remained unsold for an extended period."
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  valueColor,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  valueColor: string;
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "18px",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: "12px",
          marginBottom: "8px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "22px",
          fontWeight: 700,
          color: valueColor,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: "5px",
          fontSize: "11px",
          color: "#94a3b8",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Product["status"] }) {
  const styles = {
    Critical: {
      background: "#fee2e2",
      color: "#dc2626",
    },
    "Dead Stock": {
      background: "#ffedd5",
      color: "#ea580c",
    },
    "At Risk": {
      background: "#fef3c7",
      color: "#ca8a04",
    },
  };

  const current = styles[status];

  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 600,
        background: current.background,
        color: current.color,
      }}
    >
      {status}
    </span>
  );
}

function InsightCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "16px",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          color: "#64748b",
          marginBottom: "7px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: "19px",
          fontWeight: 700,
          color: "#111827",
          marginBottom: "7px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "#64748b",
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid #e2e8f0",
  color: "#475569",
  fontWeight: 600,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px",
  borderBottom: "1px solid #f1f5f9",
  color: "#475569",
  whiteSpace: "nowrap",
};