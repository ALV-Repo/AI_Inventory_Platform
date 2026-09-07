"use client";

import { useMemo, useState } from "react";

type ReturnStatus =
  | "Draft"
  | "Pending Approval"
  | "Approved"
  | "Processed"
  | "Completed"
  | "Cancelled";

type SalesReturn = {
  id: string;
  invoice: string;
  customer: string;
  date: string;
  items: number;
  amount: number;
  reason: string;
  status: ReturnStatus;
  stockRestored: boolean;
  ledgerAdjusted: boolean;
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
    stockRestored: false,
    ledgerAdjusted: false,
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
    stockRestored: false,
    ledgerAdjusted: false,
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
    stockRestored: true,
    ledgerAdjusted: true,
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
    stockRestored: false,
    ledgerAdjusted: false,
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
    stockRestored: true,
    ledgerAdjusted: true,
  },
];

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN")}`;

export default function SalesReturnsPage() {
  const [returns, setReturns] =
    useState<SalesReturn[]>(initialReturns);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "All" | ReturnStatus
  >("All");

  const [showForm, setShowForm] = useState(false);

  const [selectedReturn, setSelectedReturn] =
    useState<SalesReturn | null>(null);

  const filteredReturns = useMemo(() => {
    return returns.filter((item) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        item.id.toLowerCase().includes(searchValue) ||
        item.invoice.toLowerCase().includes(searchValue) ||
        item.customer.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "All" ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [returns, search, statusFilter]);

  const totalValue = returns.reduce(
    (sum, item) => sum + item.amount,
    0
  );

  const pendingCount = returns.filter(
    (item) => item.status === "Pending Approval"
  ).length;

  const approvedCount = returns.filter(
    (item) => item.status === "Approved"
  ).length;

  const processedCount = returns.filter(
    (item) => item.status === "Processed"
  ).length;

  const completedCount = returns.filter(
    (item) => item.status === "Completed"
  ).length;

  const updateStatus = (
    id: string,
    status: ReturnStatus
  ) => {
    setReturns((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        if (status === "Completed") {
          return {
            ...item,
            status: "Completed",
            stockRestored: true,
            ledgerAdjusted: true,
          };
        }

        return {
          ...item,
          status,
        };
      })
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
            Manage customer returns, approvals and invoice
            adjustments.
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
          gridTemplateColumns: "repeat(5, 1fr)",
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
          title="APPROVED"
          value={approvedCount}
          subtitle="Ready for processing"
          valueColor="#059669"
        />

        <KpiCard
          title="PROCESSED"
          value={processedCount}
          subtitle="Ready to complete"
          valueColor="#7c3aed"
        />

        <KpiCard
          title="COMPLETED"
          value={completedCount}
          subtitle="Successfully processed"
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
          flexWrap: "wrap",
        }}
      >
        {(
          [
            "All",
            "Draft",
            "Pending Approval",
            "Approved",
            "Processed",
            "Completed",
            "Cancelled",
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
                statusFilter === status
                  ? "#10213d"
                  : "transparent",
              color:
                statusFilter === status
                  ? "#fff"
                  : "#536177",
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
                <th style={thStyle}>STOCK</th>
                <th style={thStyle}>LEDGER</th>
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

                  <td style={tdStyle}>
                    {item.customer}
                  </td>

                  <td style={tdStyle}>
                    {item.invoice}
                  </td>

                  <td style={tdStyle}>
                    {item.date}
                  </td>

                  <td style={tdStyle}>
                    {item.items}
                  </td>

                  <td style={tdStyle}>
                    <strong>
                      {formatCurrency(item.amount)}
                    </strong>
                  </td>

                  <td style={tdStyle}>
                    {item.reason}
                  </td>

                  <td style={tdStyle}>
                    <StatusBadge status={item.status} />
                  </td>

                  <td style={tdStyle}>
                    <TrackingBadge
                      completed={item.stockRestored}
                      label="Stock Restored"
                    />
                  </td>

                  <td style={tdStyle}>
                    <TrackingBadge
                      completed={item.ledgerAdjusted}
                      label="Ledger Adjusted"
                    />
                  </td>

                  <td style={tdStyle}>
                    <div
                      style={{
                        display: "flex",
                        gap: 6,
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        onClick={() =>
                          setSelectedReturn(item)
                        }
                        style={smallButton}
                      >
                        View
                      </button>

                      {item.status === "Pending Approval" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              item.id,
                              "Approved"
                            )
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
                            updateStatus(
                              item.id,
                              "Processed"
                            )
                          }
                          style={{
                            ...smallButton,
                            background: "#2563eb",
                            color: "#fff",
                            borderColor: "#2563eb",
                          }}
                        >
                          Process
                        </button>
                      )}

                      {item.status === "Processed" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              item.id,
                              "Completed"
                            )
                          }
                          style={{
                            ...smallButton,
                            background: "#059669",
                            color: "#fff",
                            borderColor: "#059669",
                          }}
                        >
                          Complete
                        </button>
                      )}

                      {item.status === "Draft" && (
                        <button
                          onClick={() =>
                            updateStatus(
                              item.id,
                              "Pending Approval"
                            )
                          }
                          style={smallButton}
                        >
                          Submit
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

      {/* WORKFLOW INFORMATION */}
      <div
        style={{
          marginTop: 18,
          background: "#fff",
          border: "1px solid #e1e6ee",
          borderRadius: 9,
          padding: 18,
        }}
      >
        <h3
          style={{
            margin: "0 0 12px",
            fontSize: 15,
          }}
        >
          Return Workflow
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
            fontSize: 12,
          }}
        >
          <WorkflowStep label="Draft" />
          <span>→</span>
          <WorkflowStep label="Pending Approval" />
          <span>→</span>
          <WorkflowStep label="Approved" />
          <span>→</span>
          <WorkflowStep label="Processed" />
          <span>→</span>
          <WorkflowStep label="Completed" />
        </div>

        <div
          style={{
            marginTop: 14,
            padding: 12,
            background: "#f8fafc",
            borderRadius: 7,
            color: "#64748b",
            fontSize: 11,
          }}
        >
          When a return reaches Completed status, the system
          records Stock Restored and Ledger Adjusted.
        </div>
      </div>

            {/* CREATE RETURN MODAL */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 620,
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #e5e9f0",
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
                    fontSize: 12,
                    color: "#7b8799",
                  }}
                >
                  Create a return against an existing sales invoice.
                </p>
              </div>

              <button
                onClick={() => setShowForm(false)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 22,
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: 20,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <FormField label="Invoice Number">
                <input
                  defaultValue="INV-2026-043"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Customer">
                <input
                  defaultValue="Apex Retail Solutions"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Return Date">
                <input
                  type="date"
                  defaultValue="2026-09-07"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Product">
                <input
                  defaultValue="Wireless Earbuds"
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Quantity">
                <input
                  type="number"
                  defaultValue={1}
                  min={1}
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Unit Price">
                <input
                  type="number"
                  defaultValue={1450}
                  min={0}
                  style={inputStyle}
                />
              </FormField>

              <FormField label="Return Reason">
                <select
                  defaultValue="Customer return"
                  style={inputStyle}
                >
                  <option>Customer return</option>
                  <option>Damaged item</option>
                  <option>Defective product</option>
                  <option>Wrong item</option>
                  <option>Wrong quantity</option>
                  <option>Other</option>
                </select>
              </FormField>

              <FormField label="GST">
                <input
                  type="number"
                  defaultValue={261}
                  min={0}
                  style={inputStyle}
                />
              </FormField>

              <div style={{ gridColumn: "1 / -1" }}>
                <FormField label="Notes">
                  <textarea
                    defaultValue="Customer requested return."
                    rows={3}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                    }}
                  />
                </FormField>
              </div>
            </div>

            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #e5e9f0",
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "1px solid #cfd6e2",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  const newReturn: SalesReturn = {
                    id: `SR-2026-${String(
                      returns.length + 1
                    ).padStart(3, "0")}`,
                    invoice: "INV-2026-043",
                    customer: "Apex Retail Solutions",
                    date: "07 Sep 2026",
                    items: 1,
                    amount: 1711,
                    reason: "Customer return",
                    status: "Draft",
                    stockRestored: false,
                    ledgerAdjusted: false,
                  };

                  setReturns((current) => [
                    newReturn,
                    ...current,
                  ]);

                  setShowForm(false);
                }}
                style={{
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "1px solid #10213d",
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
      )}

      {/* VIEW RETURN MODAL */}
      {selectedReturn && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 560,
              background: "#fff",
              borderRadius: 10,
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #e5e9f0",
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
                  Return Details
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    fontSize: 12,
                    color: "#7b8799",
                  }}
                >
                  {selectedReturn.id}
                </p>
              </div>

              <button
                onClick={() => setSelectedReturn(null)}
                style={{
                  border: "none",
                  background: "transparent",
                  fontSize: 22,
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                padding: 20,
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <DetailItem
                label="Return Number"
                value={selectedReturn.id}
              />

              <DetailItem
                label="Invoice"
                value={selectedReturn.invoice}
              />

              <DetailItem
                label="Customer"
                value={selectedReturn.customer}
              />

              <DetailItem
                label="Date"
                value={selectedReturn.date}
              />

              <DetailItem
                label="Items"
                value={String(selectedReturn.items)}
              />

              <DetailItem
                label="Amount"
                value={formatCurrency(selectedReturn.amount)}
              />

              <DetailItem
                label="Reason"
                value={selectedReturn.reason}
              />

              <div>
                <div style={detailLabelStyle}>
                  Status
                </div>

                <StatusBadge
                  status={selectedReturn.status}
                />
              </div>

              <div>
                <div style={detailLabelStyle}>
                  Stock Restored
                </div>

                <TrackingBadge
                  completed={selectedReturn.stockRestored}
                  label={
                    selectedReturn.stockRestored
                      ? "Yes"
                      : "No"
                  }
                />
              </div>

              <div>
                <div style={detailLabelStyle}>
                  Ledger Adjusted
                </div>

                <TrackingBadge
                  completed={selectedReturn.ledgerAdjusted}
                  label={
                    selectedReturn.ledgerAdjusted
                      ? "Yes"
                      : "No"
                  }
                />
              </div>
            </div>

            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #e5e9f0",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setSelectedReturn(null)}
                style={{
                  padding: "10px 16px",
                  borderRadius: 6,
                  border: "1px solid #cfd6e2",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

            {/* PAGE END */}
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
  valueColor?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e1e6ee",
        borderRadius: 8,
        padding: 17,
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "#7b8799",
          fontWeight: 700,
          letterSpacing: 0.4,
        }}
      >
        {title}
      </div>

      <div
        style={{
          marginTop: 8,
          fontSize: 23,
          fontWeight: 700,
          color: valueColor || "#12213a",
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
        {subtitle}
      </div>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ReturnStatus;
}) {
  const styles: Record<
    ReturnStatus,
    {
      background: string;
      color: string;
    }
  > = {
    Draft: {
      background: "#f1f5f9",
      color: "#475569",
    },

    "Pending Approval": {
      background: "#fef3c7",
      color: "#92400e",
    },

    Approved: {
      background: "#dcfce7",
      color: "#166534",
    },

    Processed: {
      background: "#ede9fe",
      color: "#6d28d9",
    },

    Completed: {
      background: "#dbeafe",
      color: "#1d4ed8",
    },

    Cancelled: {
      background: "#fee2e2",
      color: "#b91c1c",
    },
  };

  const style = styles[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 9px",
        borderRadius: 999,
        background: style.background,
        color: style.color,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function TrackingBadge({
  completed,
  label,
}: {
  completed: boolean;
  label: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "5px 8px",
        borderRadius: 999,
        background: completed ? "#dcfce7" : "#f1f5f9",
        color: completed ? "#166534" : "#64748b",
        fontSize: 10,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {completed ? "✓ " : "○ "}
      {label}
    </span>
  );
}

function WorkflowStep({
  label,
}: {
  label: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "7px 11px",
        borderRadius: 6,
        background: "#f3f6fa",
        border: "1px solid #dce3ec",
        color: "#42516a",
        fontWeight: 600,
      }}
    >
      {label}
    </span>
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
        display: "flex",
        flexDirection: "column",
        gap: 6,
        fontSize: 12,
        color: "#526077",
        fontWeight: 600,
      }}
    >
      {label}
      {children}
    </label>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <div style={detailLabelStyle}>
        {label}
      </div>

      <div
        style={{
          marginTop: 4,
          fontSize: 13,
          color: "#12213a",
          fontWeight: 600,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const detailLabelStyle: React.CSSProperties = {
  fontSize: 10,
  color: "#8994a6",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: 0.3,
};

const thStyle: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid #e8ecf2",
  fontSize: 10,
  fontWeight: 700,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px",
  borderBottom: "1px solid #edf0f4",
  verticalAlign: "middle",
};

const subText: React.CSSProperties = {
  marginTop: 3,
  color: "#8a95a7",
  fontSize: 10,
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

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d7dde7",
  borderRadius: 6,
  padding: "10px 11px",
  fontSize: 12,
  color: "#12213a",
  outline: "none",
};