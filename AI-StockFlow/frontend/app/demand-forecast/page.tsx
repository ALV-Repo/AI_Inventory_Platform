"use client";

import { useMemo, useState } from "react";

type ForecastItem = {
  id: number;
  product: string;
  sku: string;
  currentStock: number;
  avgDailySales: number;
  forecast7Days: number;
  forecast30Days: number;
  reorderPoint: number;
  confidence: number;
  trend: "Increasing" | "Stable" | "Decreasing";
};

const forecastData: ForecastItem[] = [
  {
    id: 1,
    product: "Wireless Headphones",
    sku: "WH-1001",
    currentStock: 85,
    avgDailySales: 12,
    forecast7Days: 92,
    forecast30Days: 365,
    reorderPoint: 60,
    confidence: 94,
    trend: "Increasing",
  },
  {
    id: 2,
    product: "Bluetooth Speaker",
    sku: "BS-1002",
    currentStock: 120,
    avgDailySales: 9,
    forecast7Days: 63,
    forecast30Days: 270,
    reorderPoint: 50,
    confidence: 91,
    trend: "Stable",
  },
  {
    id: 3,
    product: "Gaming Keyboard",
    sku: "GK-1003",
    currentStock: 42,
    avgDailySales: 8,
    forecast7Days: 56,
    forecast30Days: 240,
    reorderPoint: 45,
    confidence: 96,
    trend: "Increasing",
  },
  {
    id: 4,
    product: "Wireless Mouse",
    sku: "WM-1004",
    currentStock: 75,
    avgDailySales: 7,
    forecast7Days: 49,
    forecast30Days: 210,
    reorderPoint: 40,
    confidence: 89,
    trend: "Stable",
  },
  {
    id: 5,
    product: "USB-C Hub",
    sku: "UC-1005",
    currentStock: 28,
    avgDailySales: 6,
    forecast7Days: 42,
    forecast30Days: 180,
    reorderPoint: 35,
    confidence: 87,
    trend: "Increasing",
  },
  {
    id: 6,
    product: "Power Bank",
    sku: "PB-1006",
    currentStock: 95,
    avgDailySales: 5,
    forecast7Days: 35,
    forecast30Days: 150,
    reorderPoint: 30,
    confidence: 93,
    trend: "Decreasing",
  },
];

function TrendBadge({
  trend,
}: {
  trend: ForecastItem["trend"];
}) {
  const styles = {
    Increasing: {
      background: "#ecfdf5",
      color: "#059669",
      border: "1px solid #a7f3d0",
    },
    Stable: {
      background: "#eff6ff",
      color: "#2563eb",
      border: "1px solid #bfdbfe",
    },
    Decreasing: {
      background: "#fff7ed",
      color: "#ea580c",
      border: "1px solid #fed7aa",
    },
  };

  return (
    <span
      style={{
        ...styles[trend],
        padding: "5px 9px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {trend}
    </span>
  );
}

function StockStatus({
  stock,
  reorderPoint,
}: {
  stock: number;
  reorderPoint: number;
}) {
  if (stock <= reorderPoint) {
    return (
      <span
        style={{
          background: "#fef2f2",
          color: "#dc2626",
          border: "1px solid #fecaca",
          padding: "5px 9px",
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 600,
        }}
      >
        Reorder
      </span>
    );
  }

  return (
    <span
      style={{
        background: "#ecfdf5",
        color: "#059669",
        border: "1px solid #a7f3d0",
        padding: "5px 9px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      Healthy
    </span>
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
        padding: 18,
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
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        color: "#64748b",
        fontSize: 11,
        fontWeight: 700,
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
        borderBottom: "1px solid #f1f5f9",
        color: "#334155",
        fontSize: 13,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}

export default function DemandForecastPage() {
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<"7" | "30">("7");

  const filteredData = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return forecastData;
    }

    return forecastData.filter(
      (item) =>
        item.product.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query)
    );
  }, [search]);

  const reorderProducts = forecastData.filter(
    (item) => item.currentStock <= item.reorderPoint
  );

  const increasingProducts = forecastData.filter(
    (item) => item.trend === "Increasing"
  );

  const averageConfidence =
    forecastData.reduce((sum, item) => sum + item.confidence, 0) /
    forecastData.length;

  const totalForecast = forecastData.reduce(
    (sum, item) =>
      sum + (period === "7" ? item.forecast7Days : item.forecast30Days),
    0
  );

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
              Demand Forecast
            </h1>

            <p
              style={{
                marginTop: 7,
                color: "#64748b",
                fontSize: 14,
              }}
            >
              AI-powered demand prediction and inventory planning
            </p>
          </div>

          <button
            onClick={() => {
              setSearch("");
              setPeriod("7");
            }}
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

        {/* Summary Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <SummaryCard
            title="Forecasted Demand"
            value={totalForecast.toString()}
            subtitle={`Next ${period} days`}
          />

          <SummaryCard
            title="Products to Reorder"
            value={reorderProducts.length.toString()}
            subtitle="Stock below reorder point"
            valueColor="#dc2626"
          />

          <SummaryCard
            title="Increasing Demand"
            value={increasingProducts.length.toString()}
            subtitle="Products showing growth"
            valueColor="#059669"
          />

          <SummaryCard
            title="Forecast Confidence"
            value={`${averageConfidence.toFixed(1)}%`}
            subtitle="Average AI confidence"
            valueColor="#2563eb"
          />
        </div>

        {/* Search and period */}
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
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value as "7" | "30")
            }
            style={{
              height: 40,
              minWidth: 160,
              border: "1px solid #cbd5e1",
              borderRadius: 7,
              padding: "0 12px",
              background: "#ffffff",
              fontSize: 14,
            }}
          >
            <option value="7">Next 7 Days</option>
            <option value="30">Next 30 Days</option>
          </select>
        </div>

        {/* Forecast table */}
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
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: 17,
                  color: "#0f172a",
                }}
              >
                Demand Forecast
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                  fontSize: 13,
                  color: "#64748b",
                }}
              >
                AI-generated demand estimates based on sales and inventory
                trends.
              </p>
            </div>

            <span
              style={{
                background: "#ecfdf5",
                color: "#059669",
                border: "1px solid #a7f3d0",
                padding: "6px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              AI Forecast
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 1050,
              }}
            >
              <thead>
                <tr>
                  <Th>Product</Th>
                  <Th>Current Stock</Th>
                  <Th>Avg. Daily Sales</Th>
                  <Th>7 Day Forecast</Th>
                  <Th>30 Day Forecast</Th>
                  <Th>Reorder Point</Th>
                  <Th>Confidence</Th>
                  <Th>Trend</Th>
                  <Th>Status</Th>
                </tr>
              </thead>

              <tbody>
                {filteredData.map((item) => (
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
                          color: "#64748b",
                          fontSize: 12,
                        }}
                      >
                        SKU: {item.sku}
                      </div>
                    </Td>

                    <Td>
                      <strong>{item.currentStock}</strong>
                    </Td>

                    <Td>{item.avgDailySales} units/day</Td>

                    <Td>
                      <strong>{item.forecast7Days}</strong>
                    </Td>

                    <Td>
                      <strong>{item.forecast30Days}</strong>
                    </Td>

                    <Td>{item.reorderPoint}</Td>

                    <Td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 60,
                            height: 6,
                            background: "#e2e8f0",
                            borderRadius: 999,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${item.confidence}%`,
                              height: "100%",
                              background: "#2563eb",
                              borderRadius: 999,
                            }}
                          />
                        </div>

                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                          }}
                        >
                          {item.confidence}%
                        </span>
                      </div>
                    </Td>

                    <Td>
                      <TrendBadge trend={item.trend} />
                    </Td>

                    <Td>
                      <StockStatus
                        stock={item.currentStock}
                        reorderPoint={item.reorderPoint}
                      />
                    </Td>
                  </tr>
                ))}

                {filteredData.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      style={{
                        textAlign: "center",
                        padding: 50,
                        color: "#64748b",
                      }}
                    >
                      No products found.
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
              fontSize: 12,
              color: "#64748b",
            }}
          >
            Showing {filteredData.length} of {forecastData.length} products
          </div>
        </section>

        {/* Insights */}
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
            AI Forecast Insights
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 18,
              marginTop: 16,
            }}
          >
            <Insight
              title="Reorder Alert"
              value={`${reorderProducts.length} products`}
              description="Products are currently below their recommended reorder point."
              type="warning"
            />

            <Insight
              title="Demand Growth"
              value={`${increasingProducts.length} products`}
              description="These products are showing an increasing demand trend."
              type="success"
            />

            <Insight
              title="Forecast Quality"
              value={`${averageConfidence.toFixed(1)}%`}
              description="Average confidence level across the current demand forecasts."
              type="info"
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function Insight({
  title,
  value,
  description,
  type,
}: {
  title: string;
  value: string;
  description: string;
  type: "warning" | "success" | "info";
}) {
  const styles = {
    warning: {
      background: "#fff7ed",
      border: "#fed7aa",
      icon: "#ea580c",
    },
    success: {
      background: "#ecfdf5",
      border: "#a7f3d0",
      icon: "#059669",
    },
    info: {
      background: "#eff6ff",
      border: "#bfdbfe",
      icon: "#2563eb",
    },
  };

  const current = styles[type];

  return (
    <div
      style={{
        background: current.background,
        border: `1px solid ${current.border}`,
        borderRadius: 9,
        padding: 16,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: current.icon,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 7,
          fontSize: 20,
          fontWeight: 700,
          color: "#0f172a",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 5,
          fontSize: 12,
          lineHeight: 1.5,
          color: "#64748b",
        }}
      >
        {description}
      </div>
    </div>
  );
}