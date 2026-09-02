"use client";

import { useMemo, useState } from "react";

type ReturnStatus = "Draft" | "Pending Approval" | "Approved" | "Completed";

type SalesReturn = {
  id: string;
  invoice: string;
  customer: string;
  date: string;
  items: number;
  amount: number;
  reason: string;
  status: ReturnStatus;
};

const initialReturns: SalesReturn[] = [
  {
    id: "SR-2026-001",
    invoice: "INV-2026-041",
    customer: "Apex Retail Solutions",
    date: "21 Aug 2026",
    items: 2,
    amount: 8500,
    reason: "Damaged item",
    status: "Pending Approval",
  },
  {
    id: "SR-2026-002",
    invoice: "INV-2026-038",
    customer: "Green Valley Stores",
    date: "20 Aug 2026",
    items: 1,
    amount: 3200,
    reason: "Wrong item",
    status: "Approved",
  },
  {
    id: "SR-2026-003",
    invoice: "INV-2026-032",
    customer: "Metro Office Supplies",
    date: "19 Aug 2026",
    items: 3,
    amount: 12400,
    reason: "Customer return",
    status: "Completed",
  },
  {
    id: "SR-2026-004",
    invoice: "INV-2026-027",
    customer: "Sunrise Electronics",
    date: "18 Aug 2026",
    items: 1,
    amount: 4800,
    reason: "Defective product",
    status: "Draft",
  },
  {
    id: "SR-2026-005",
    invoice: "INV-2026-021",
    customer: "City Mart",
    date: "17 Aug 2026",
    items: 2,
    amount: 5600,
    reason: "Damaged packaging",
    status: "Completed",
  },
];

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function SalesReturnsPage() {
  const [returns, setReturns] = useState<SalesReturn[]>(initialReturns);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | ReturnStatus>(
    "All"
  );
  const [showForm, setShowForm] = useState(false);

  const filteredReturns = useMemo(() => {
    return returns.filter((item) => {
      const matchesSearch =
        item.id.toLowerCase().includes(search.toLowerCase()) ||
        item.invoice.toLowerCase().includes(search.toLowerCase()) ||
        item.customer.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [returns, search, statusFilter]);

  const totalValue = returns.reduce((sum, item) => sum + item.amount, 0);
  const pendingCount = returns.filter(
    (item) => item.status === "Pending Approval"
  ).length;
  const approvedCount = returns.filter(
    (item) => item.status === "Approved"
  ).length;
  const completedCount = returns.filter(
    (item) => item.status === "Completed"
  ).length;

  const updateStatus = (id: string, status: ReturnStatus) => {
    setReturns((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status } : item
      )
    );
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f6f8fb",
        padding: "28px 34px",
        color: "#12213a",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
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
            Sales Returns
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "#6b7890",
              fontSize: 13,
            }}
          >
            Manage customer returns, approvals and invoice adjustments.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          style={{
            background: "#10213d",
            color: "#fff",
            border: "none",
            borderRadius: 7,
            padding: "12px 18px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          + New Sales Return
        </button>
      </div>

      {/* KPI CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <KpiCard
          title="TOTAL RETURNS"
          value={returns.length}
          subtitle="All sales returns"
        />

        <KpiCard
          title="PENDING APPROVAL"
          value={pendingCount}
          subtitle="Waiting for approval"
          valueColor="#f59e0b"
        />

        <KpiCard
          title="COMPLETED"
          value={completedCount}
          subtitle="Successfully processed"
          valueColor="#059669"
        />

        <KpiCard
          title="TOTAL RETURN VALUE"
          value={formatCurrency(totalValue)}
          subtitle="Combined return value"
          valueColor="#2563eb"
        />
      </div>

      {/* STATUS TABS */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e1e6ee",
          borderRadius: 8,
          padding: 8,
          display: "flex",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {(
          [
            "All",
            "Draft",
            "Pending Approval",
            "Approved",
            "Completed",
          ] as const
        ).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            style={{
              border: "none",
              borderRadius: 6,
              padding: "9px 15px",
              cursor: "pointer",
              background:
                statusFilter === status ? "#10213d" : "transparent",
              color:
                statusFilter === status ? "#fff" : "#536177",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* SEARCH */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e1e6ee",
          borderRadius: 8,
          padding: 12,
          marginBottom: 18,
          display: "flex",
          gap: 10,
        }}
      >
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search return number, invoice or customer..."
          style={{
            flex: 1,
            border: "1px solid #d7dde7",
            borderRadius: 6,
            padding: "11px 13px",
            outline: "none",
            fontSize: 13,
          }}
        />

        <button
          onClick={() => {
            setSearch("");
            setStatusFilter("All");
          }}
          style={{
            background: "#fff",
            border: "1px solid #cfd6e2",
            borderRadius: 6,
            padding: "0 18px",
            cursor: "pointer",
            color: "#34435b",
          }}
        >
          Clear
        </button>
      </div>

      {/* TABLE */}
      <section
        style={{
          background: "#fff",
          border: "1px solid #e1e6ee",
          borderRadius: 9,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "18px 18px 14px",
            borderBottom: "1px solid #e8ecf2",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 17,
            }}
          >
            Sales Return List
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#7b8799",
              fontSize: 12,
            }}
          >
            Showing {filteredReturns.length} of {returns.length} returns
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#fafbfd",
                  color: "#66738a",
                  textAlign: "left",
                }}
              >
                <th style={thStyle}>RETURN</th>
                <th style={thStyle}>CUSTOMER</th>
                <th style={thStyle}>INVOICE</th>
                <th style={thStyle}>DATE</th>
                <th style={thStyle}>ITEMS</th>
                <th style={thStyle}>AMOUNT</th>
                <th style={thStyle}>REASON</th>
                <th style={thStyle}>STATUS</th>
                <th style={thStyle}>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {filteredReturns.map((item) => (
                <tr key={item.id}>
                  <td style={tdStyle}>
                    <strong>{item.id}</strong>
                    <div style={subText}>Sales return</div>
                  </td>

                  <td style={tdStyle}>{item.customer}</td>

                  <td style={tdStyle}>{item.invoice}</td>

                  <td style={tdStyle}>{item.date}</td>

                  <td style={tdStyle}>{item.items}</td>

                  <td style={tdStyle}>
                    <strong>{formatCurrency(item.amount)}</strong>
                  </td>

                  <td style={tdStyle}>{item.reason}</td>

                  <td style={tdStyle}>
                    <StatusBadge status={item.status} />
                  </td>

                  <td style={tdStyle}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button style={smallButton}>View</button>

                      {item.status === "Pending Approval" && (
                        <button
                          onClick={() =>
                            updateStatus(item.id, "Approved")
                          }
                          style={{
                            ...smallButton,
                            background: "#059669",
                            color: "#fff",
                            borderColor: "#059669",
                          }}
                        >
                          Approve
                        </button>
                      )}

                      {item.status === "Approved" && (
                        <button
                          onClick={() =>
                            updateStatus(item.id, "Completed")
                          }
                          style={{
                            ...smallButton,
                            background: "#2563eb",
                            color: "#fff",
                            borderColor: "#2563eb",
                          }}
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReturns.length === 0 && (
          <div
            style={{
              padding: 50,
              textAlign: "center",
              color: "#738096",
            }}
          >
            No sales returns found.
          </div>
        )}
      </section>

      {/* BOTTOM SUMMARY */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginTop: 16,
        }}
      >
        <SummaryCard
          title="PENDING RETURNS"
          value={pendingCount}
          text="Returns awaiting approval"
        />

        <SummaryCard
          title="APPROVED RETURNS"
          value={approvedCount}
          text="Ready for processing"
        />

        <SummaryCard
          title="RETURN VALUE"
          value={formatCurrency(totalValue)}
          text="Total value of sales returns"
        />
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <NewReturnModal
          onClose={() => setShowForm(false)}
          onCreate={(newReturn) => {
            setReturns((current) => [newReturn, ...current]);
            setShowForm(false);
          }}
        />
      )}
    </main>
  );
}

function KpiCard({
  title,
  value,
  subtitle,
  valueColor = "#12213a",
}: {
  title: string;
  value: string | number;
  subtitle: string;
  valueColor?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e1e6ee",
        borderRadius: 9,
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#7b8799",
          fontWeight: 700,
          letterSpacing: "0.08em",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 24,
          fontWeight: 700,
          color: valueColor,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 5,
          fontSize: 11,
          color: "#8a95a7",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  text,
}: {
  title: string;
  value: string | number;
  text: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e1e6ee",
        borderRadius: 9,
        padding: "17px 20px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#7b8799",
          fontWeight: 700,
          letterSpacing: "0.06em",
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 7,
          fontSize: 20,
          fontWeight: 700,
          color: "#12213a",
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 11,
          color: "#8994a6",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReturnStatus }) {
  const styles: Record<
    ReturnStatus,
    {
      background: string;
      color: string;
    }
  > = {
    Draft: {
      background: "#f1f3f6",
      color: "#5d6878",
    },
    "Pending Approval": {
      background: "#fff3cd",
      color: "#a16207",
    },
    Approved: {
      background: "#d1fae5",
      color: "#047857",
    },
    Completed: {
      background: "#dbeafe",
      color: "#1d4ed8",
    },
  };

  const current = styles[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "5px 9px",
        background: current.background,
        color: current.color,
        fontSize: 10,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function NewReturnModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (item: SalesReturn) => void;
}) {
  const [invoice, setInvoice] = useState("");
  const [customer, setCustomer] = useState("");
  const [items, setItems] = useState("1");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("Customer return");

  const handleCreate = () => {
    if (!invoice.trim() || !customer.trim() || !amount.trim()) {
      return;
    }

    const newReturn: SalesReturn = {
      id: `SR-2026-${String(Date.now()).slice(-3)}`,
      invoice: invoice.trim(),
      customer: customer.trim(),
      date: "21 Aug 2026",
      items: Number(items) || 1,
      amount: Number(amount) || 0,
      reason,
      status: "Draft",
    };

    onCreate(newReturn);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(10, 20, 35, 0.45)",
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
          borderRadius: 10,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {/* MODAL HEADER */}
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #e5e9ef",
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
              }}
            >
              New Sales Return
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#7b8799",
                fontSize: 11,
              }}
            >
              Create a return request linked to a sales invoice.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 20,
              color: "#7b8799",
              cursor: "pointer",
            }}
          >
            ×
          </button>
        </div>

        {/* MODAL BODY */}
        <div
          style={{
            padding: 20,
            display: "grid",
            gap: 15,
          }}
        >
          <FormField label="Invoice Number">
            <input
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              placeholder="e.g. INV-2026-045"
              style={inputStyle}
            />
          </FormField>

          <FormField label="Customer">
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              placeholder="Customer name"
              style={inputStyle}
            />
          </FormField>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <FormField label="Number of Items">
              <input
                type="number"
                min="1"
                value={items}
                onChange={(e) => setItems(e.target.value)}
                style={inputStyle}
              />
            </FormField>

            <FormField label="Return Amount">
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="₹0"
                style={inputStyle}
              />
            </FormField>
          </div>

          <FormField label="Return Reason">
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={inputStyle}
            >
              <option>Customer return</option>
              <option>Damaged item</option>
              <option>Wrong item</option>
              <option>Defective product</option>
              <option>Damaged packaging</option>
              <option>Other</option>
            </select>
          </FormField>
        </div>

        {/* MODAL FOOTER */}
        <div
          style={{
            padding: "15px 20px",
            borderTop: "1px solid #e5e9ef",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "10px 16px",
              borderRadius: 6,
              border: "1px solid #cfd6e2",
              background: "#fff",
              cursor: "pointer",
              color: "#34435b",
            }}
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            style={{
              padding: "10px 17px",
              borderRadius: 6,
              border: "none",
              background: "#10213d",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Create Return
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: "grid",
        gap: 6,
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#536177",
        }}
      >
        {label}
      </span>

      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d7dde7",
  borderRadius: 6,
  padding: "10px 12px",
  fontSize: 13,
  color: "#12213a",
  background: "#fff",
  outline: "none",
};

const thStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid #e8ecf2",
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.05em",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px",
  borderBottom: "1px solid #edf0f4",
  color: "#334155",
  whiteSpace: "nowrap",
};

const subText: React.CSSProperties = {
  marginTop: 3,
  fontSize: 10,
  color: "#8a95a7",
};

const smallButton: React.CSSProperties = {
  border: "1px solid #cfd6e2",
  background: "#fff",
  color: "#34435b",
  borderRadius: 5,
  padding: "6px 9px",
  fontSize: 10,
  fontWeight: 600,
  cursor: "pointer",
};