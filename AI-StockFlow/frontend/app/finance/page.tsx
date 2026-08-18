"use client";

import { useMemo, useState } from "react";

type Transaction = {
  id: string;
  date: string;
  description: string;
  category: string;
  type: "Income" | "Expense";
  amount: number;
  status: "Completed" | "Pending";
};

const transactions: Transaction[] = [
  {
    id: "TXN-1001",
    date: "15/08/2026",
    description: "Customer Payment - Wireless Headphones",
    category: "Sales",
    type: "Income",
    amount: 125000,
    status: "Completed",
  },
  {
    id: "TXN-1002",
    date: "14/08/2026",
    description: "Supplier Payment - Tech Supplies India",
    category: "Purchases",
    type: "Expense",
    amount: 87500,
    status: "Completed",
  },
  {
    id: "TXN-1003",
    date: "13/08/2026",
    description: "Customer Payment - Gaming Keyboard",
    category: "Sales",
    type: "Income",
    amount: 156000,
    status: "Completed",
  },
  {
    id: "TXN-1004",
    date: "12/08/2026",
    description: "Warehouse Operating Expense",
    category: "Operations",
    type: "Expense",
    amount: 32500,
    status: "Completed",
  },
  {
    id: "TXN-1005",
    date: "11/08/2026",
    description: "Customer Payment - Bluetooth Speaker",
    category: "Sales",
    type: "Income",
    amount: 98500,
    status: "Pending",
  },
  {
    id: "TXN-1006",
    date: "10/08/2026",
    description: "Employee Payroll",
    category: "HR",
    type: "Expense",
    amount: 72500,
    status: "Completed",
  },
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function FinancePage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");

  const totalIncome = transactions
    .filter((item) => item.type === "Income")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = transactions
    .filter((item) => item.type === "Expense")
    .reduce((sum, item) => sum + item.amount, 0);

  const netProfit = totalIncome - totalExpense;

  const pendingAmount = transactions
    .filter((item) => item.status === "Pending")
    .reduce((sum, item) => sum + item.amount, 0);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.id.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        typeFilter === "All Types" || item.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [search, typeFilter]);

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
            Finance
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Monitor revenue, expenses, cash flow and financial performance
          </p>
        </div>

        <button
          onClick={() => window.location.reload()}
          style={{
            border: "1px solid #cbd5e1",
            background: "#fff",
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
            <p style={labelStyle}>Total Revenue</p>
            <h2 style={valueStyle}>{formatCurrency(totalIncome)}</h2>
            <span style={{ color: "#16a34a", fontSize: 12 }}>
              ↑ 12.4% this month
            </span>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Total Expenses</p>
            <h2 style={valueStyle}>{formatCurrency(totalExpense)}</h2>
            <span style={{ color: "#f97316", fontSize: 12 }}>
              Operating expenses
            </span>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Net Profit</p>
            <h2 style={valueStyle}>{formatCurrency(netProfit)}</h2>
            <span style={{ color: "#16a34a", fontSize: 12 }}>
              Healthy margin
            </span>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>Pending Payments</p>
            <h2 style={valueStyle}>{formatCurrency(pendingAmount)}</h2>
            <span style={{ color: "#f97316", fontSize: 12 }}>
              Awaiting settlement
            </span>
          </div>
        </div>

        {/* Financial Overview */}
        <section style={sectionStyle}>
          <div
            style={{
              padding: "18px 18px 14px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>
              Financial Overview
            </h3>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: 12,
                color: "#64748b",
              }}
            >
              Revenue and expense performance
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
              <p style={labelStyle}>Revenue</p>

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
                    width: "82%",
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
                <span>{formatCurrency(totalIncome)}</span>
                <span>82%</span>
              </div>
            </div>

            <div>
              <p style={labelStyle}>Expenses</p>

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
                    width: "46%",
                    height: "100%",
                    background: "#f97316",
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
                <span>{formatCurrency(totalExpense)}</span>
                <span>46%</span>
              </div>
            </div>
          </div>
        </section>

        {/* Search */}
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
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transaction, category or ID..."
              style={inputStyle}
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={inputStyle}
            >
              <option>All Types</option>
              <option>Income</option>
              <option>Expense</option>
            </select>
          </div>
        </section>

        {/* Transactions */}
        <section style={{ ...sectionStyle, marginTop: 16 }}>
          <div
            style={{
              padding: "18px 18px 14px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <h3 style={{ margin: 0, fontSize: 16 }}>
              Recent Transactions
            </h3>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: 12,
                color: "#64748b",
              }}
            >
              Latest financial activity
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
                <tr style={{ background: "#f8fafc" }}>
                  <th style={thStyle}>Transaction</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Category</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Amount</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>
                      <strong>{item.description}</strong>
                      <div
                        style={{
                          color: "#64748b",
                          fontSize: 11,
                          marginTop: 3,
                        }}
                      >
                        {item.id}
                      </div>
                    </td>

                    <td style={tdStyle}>{item.date}</td>

                    <td style={tdStyle}>{item.category}</td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          color:
                            item.type === "Income"
                              ? "#16a34a"
                              : "#dc2626",
                          fontWeight: 600,
                        }}
                      >
                        {item.type}
                      </span>
                    </td>

                    <td style={{ ...tdStyle, fontWeight: 700 }}>
                      {formatCurrency(item.amount)}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          padding: "5px 9px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background:
                            item.status === "Completed"
                              ? "#dcfce7"
                              : "#ffedd5",
                          color:
                            item.status === "Completed"
                              ? "#15803d"
                              : "#c2410c",
                        }}
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTransactions.length === 0 && (
              <div
                style={{
                  padding: 45,
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                No transactions found.
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
            Showing {filteredTransactions.length} of{" "}
            {transactions.length} transactions
          </div>
        </section>

        {/* Finance Insights */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 14,
            marginTop: 16,
          }}
        >
          <div style={insightStyle}>
            <p style={labelStyle}>Profitability</p>
            <h3 style={{ margin: "7px 0", fontSize: 22 }}>
              {((netProfit / totalIncome) * 100).toFixed(1)}%
            </h3>
            <p style={smallText}>
              Current net profit margin
            </p>
          </div>

          <div style={insightStyle}>
            <p style={labelStyle}>Cash Flow</p>
            <h3 style={{ margin: "7px 0", fontSize: 22 }}>
              {formatCurrency(netProfit)}
            </h3>
            <p style={smallText}>
              Positive operating cash flow
            </p>
          </div>

          <div style={insightStyle}>
            <p style={labelStyle}>Pending Collection</p>
            <h3 style={{ margin: "7px 0", fontSize: 22 }}>
              {formatCurrency(pendingAmount)}
            </h3>
            <p style={smallText}>
              Payments requiring attention
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