"use client";

import { useState } from "react";

type Customer = {
  name: string;
  creditLimit: number;
  outstanding: number;
  orderValue: number;
};

const customers: Customer[] = [
  {
    name: "Apex Retail Solutions",
    creditLimit: 100000,
    outstanding: 82000,
    orderValue: 35000,
  },
  {
    name: "Green Valley Stores",
    creditLimit: 75000,
    outstanding: 28000,
    orderValue: 18000,
  },
  {
    name: "Metro Office Supplies",
    creditLimit: 50000,
    outstanding: 47000,
    orderValue: 12000,
  },
];

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function CreditWarningPage() {
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]);
  const [showWarning, setShowWarning] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState(false);

  const availableCredit =
    selectedCustomer.creditLimit - selectedCustomer.outstanding;

  const exceedsLimit =
    selectedCustomer.outstanding + selectedCustomer.orderValue >
    selectedCustomer.creditLimit;

  const handleCheckCredit = () => {
    setOverrideSuccess(false);
    setShowWarning(exceedsLimit);
  };

  const handleOverride = () => {
    setShowWarning(false);
    setOverrideSuccess(true);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f8fb",
        padding: "30px 34px",
        color: "#12213a",
      }}
    >
      {/* HEADER */}
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Credit Warning</h1>

          <p style={subtitleStyle}>
            Review customer credit before confirming a sales order.
          </p>
        </div>
      </div>

      {/* SUCCESS MESSAGE */}
      {overrideSuccess && (
        <div
          style={{
            background: "#ecfdf5",
            border: "1px solid #a7f3d0",
            color: "#047857",
            borderRadius: 8,
            padding: "13px 16px",
            marginBottom: 18,
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Credit override approved. Sales order can proceed.
        </div>
      )}

      {/* CUSTOMER SELECT */}
      <section style={cardStyle}>
        <h2 style={sectionTitle}>Sales Order Credit Check</h2>

        <p style={sectionSubtitle}>
          Select a customer to check available credit before placing an order.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: 20,
          }}
        >
          <div>
            <label style={labelStyle}>Customer</label>

            <select
              value={selectedCustomer.name}
              onChange={(e) => {
                const customer = customers.find(
                  (item) => item.name === e.target.value
                );

                if (customer) {
                  setSelectedCustomer(customer);
                  setOverrideSuccess(false);
                }
              }}
              style={inputStyle}
            >
              {customers.map((customer) => (
                <option key={customer.name} value={customer.name}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Order Value</label>

            <input
              value={formatCurrency(selectedCustomer.orderValue)}
              readOnly
              style={{
                ...inputStyle,
                background: "#f8fafc",
              }}
            />
          </div>
        </div>
      </section>

      {/* CREDIT SUMMARY */}
      <section style={cardStyle}>
        <h2 style={sectionTitle}>Customer Credit Summary</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 14,
            marginTop: 18,
          }}
        >
          <MetricCard
            title="CREDIT LIMIT"
            value={formatCurrency(selectedCustomer.creditLimit)}
          />

          <MetricCard
            title="OUTSTANDING"
            value={formatCurrency(selectedCustomer.outstanding)}
            valueColor="#f59e0b"
          />

          <MetricCard
            title="AVAILABLE CREDIT"
            value={formatCurrency(Math.max(availableCredit, 0))}
            valueColor={availableCredit >= 0 ? "#059669" : "#dc2626"}
          />

          <MetricCard
            title="ORDER VALUE"
            value={formatCurrency(selectedCustomer.orderValue)}
            valueColor="#2563eb"
          />
        </div>

        {/* CREDIT BAR */}
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              color: "#66738a",
              marginBottom: 7,
            }}
          >
            <span>Credit utilization</span>

            <strong>
              {Math.round(
                (selectedCustomer.outstanding /
                  selectedCustomer.creditLimit) *
                  100
              )}
              %
            </strong>
          </div>

          <div
            style={{
              height: 9,
              background: "#e8edf3",
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${Math.min(
                  (selectedCustomer.outstanding /
                    selectedCustomer.creditLimit) *
                    100,
                  100
                )}%`,
                height: "100%",
                background:
                  selectedCustomer.outstanding /
                    selectedCustomer.creditLimit >=
                  0.9
                    ? "#f59e0b"
                    : "#10b981",
                borderRadius: 999,
              }}
            />
          </div>
        </div>

        {/* CHECK BUTTON */}
        <div
          style={{
            marginTop: 22,
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button onClick={handleCheckCredit} style={primaryButton}>
            Check Credit & Continue
          </button>
        </div>
      </section>

      {/* CREDIT STATUS */}
      <section
        style={{
          ...cardStyle,
          borderColor: exceedsLimit ? "#fecaca" : "#bbf7d0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: exceedsLimit ? "#fee2e2" : "#dcfce7",
              color: exceedsLimit ? "#dc2626" : "#059669",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            {exceedsLimit ? "!" : "✓"}
          </div>

          <div>
            <h3
              style={{
                margin: 0,
                fontSize: 15,
              }}
            >
              {exceedsLimit
                ? "Credit limit warning"
                : "Credit available"}
            </h3>

            <p
              style={{
                margin: "5px 0 0",
                color: "#718096",
                fontSize: 12,
              }}
            >
              {exceedsLimit
                ? "This order exceeds the customer's available credit."
                : "This customer has sufficient credit for the order."}
            </p>
          </div>
        </div>
      </section>

      {/* WARNING MODAL */}
      {showWarning && (
        <CreditWarningModal
          customer={selectedCustomer}
          availableCredit={availableCredit}
          onClose={() => setShowWarning(false)}
          onOverride={handleOverride}
        />
      )}
    </main>
  );
}
function MetricCard({
  title,
  value,
  valueColor = "#12213a",
}: {
  title: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: "16px 18px",
        background: "#fff",
      }}
    >
      <div
        style={{
          fontSize: 9,
          fontWeight: 700,
          color: "#7b8798",
          letterSpacing: "0.08em",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 20,
          fontWeight: 700,
          color: valueColor,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function CreditWarningModal({
  customer,
  availableCredit,
  onClose,
  onOverride,
}: {
  customer: Customer;
  availableCredit: number;
  onClose: () => void;
  onOverride: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 14,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: "20px 22px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                color: "#991b1b",
              }}
            >
              Credit Limit Warning
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: 12,
                color: "#718096",
              }}
            >
              Sales order requires credit override.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 22,
              color: "#64748b",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* WARNING */}
        <div
          style={{
            margin: 20,
            padding: 16,
            borderRadius: 10,
            background: "#fef2f2",
            border: "1px solid #fecaca",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#991b1b",
            }}
          >
            Order exceeds available credit
          </div>

          <p
            style={{
              margin: "8px 0 0",
              fontSize: 12,
              lineHeight: 1.6,
              color: "#7f1d1d",
            }}
          >
            The requested sales order cannot be completed within the
            customer's current credit availability.
          </p>
        </div>

        {/* CUSTOMER DETAILS */}
        <div
          style={{
            padding: "0 20px 20px",
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Customer: {customer.name}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <DetailRow
              label="Credit Limit"
              value={formatCurrency(customer.creditLimit)}
            />

            <DetailRow
              label="Outstanding"
              value={formatCurrency(customer.outstanding)}
            />

            <DetailRow
              label="Available Credit"
              value={formatCurrency(Math.max(availableCredit, 0))}
            />

            <DetailRow
              label="Order Value"
              value={formatCurrency(customer.orderValue)}
            />
          </div>

          {/* ACTION INFO */}
          <div
            style={{
              marginTop: 18,
              padding: 13,
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              borderRadius: 8,
              fontSize: 12,
              color: "#9a3412",
              lineHeight: 1.6,
            }}
          >
            <strong>Action required:</strong> Continue only if an authorized
            user approves the credit override.
          </div>
        </div>

        {/* FOOTER */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            padding: "15px 20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "9px 16px",
              borderRadius: 7,
              border: "1px solid #cbd5e1",
              background: "#fff",
              color: "#334155",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Cancel
          </button>

          <button
            onClick={onOverride}
            style={{
              padding: "9px 16px",
              borderRadius: 7,
              border: "none",
              background: "#b91c1c",
              color: "#fff",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Approve Override
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "12px",
        background: "#f8fafc",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#64748b",
          marginBottom: 4,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#1e293b",
        }}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 24,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 25,
  fontWeight: 700,
};

const subtitleStyle: React.CSSProperties = {
  margin: "6px 0 0",
  fontSize: 12,
  color: "#718096",
};

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: 20,
  marginBottom: 18,
};

const sectionTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
};

const sectionSubtitle: React.CSSProperties = {
  margin: "5px 0 0",
  fontSize: 11,
  color: "#718096",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 10,
  fontWeight: 700,
  color: "#64748b",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  border: "1px solid #cbd5e1",
  borderRadius: 7,
  padding: "0 12px",
  fontSize: 12,
  color: "#334155",
  outline: "none",
  boxSizing: "border-box",
};

const primaryButton: React.CSSProperties = {
  background: "#12213a",
  color: "#fff",
  border: "none",
  borderRadius: 7,
  padding: "10px 18px",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};