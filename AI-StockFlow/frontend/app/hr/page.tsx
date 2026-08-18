"use client";

import { useMemo, useState } from "react";

type Employee = {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  status: "Active" | "On Leave" | "Inactive";
  attendance: number;
  performance: number;
};

const employees: Employee[] = [
  {
    id: "EMP-1001",
    name: "Aarav Sharma",
    role: "Sales Executive",
    department: "Sales",
    location: "Hyderabad",
    status: "Active",
    attendance: 96,
    performance: 91,
  },
  {
    id: "EMP-1002",
    name: "Priya Reddy",
    role: "HR Manager",
    department: "Human Resources",
    location: "Hyderabad",
    status: "Active",
    attendance: 94,
    performance: 95,
  },
  {
    id: "EMP-1003",
    name: "Rahul Kumar",
    role: "Warehouse Executive",
    department: "Operations",
    location: "Bengaluru",
    status: "On Leave",
    attendance: 88,
    performance: 84,
  },
  {
    id: "EMP-1004",
    name: "Sneha Patel",
    role: "Finance Analyst",
    department: "Finance",
    location: "Mumbai",
    status: "Active",
    attendance: 97,
    performance: 93,
  },
  {
    id: "EMP-1005",
    name: "Vikram Singh",
    role: "Inventory Manager",
    department: "Operations",
    location: "Delhi",
    status: "Active",
    attendance: 92,
    performance: 89,
  },
  {
    id: "EMP-1006",
    name: "Ananya Rao",
    role: "Customer Support",
    department: "Support",
    location: "Chennai",
    status: "On Leave",
    attendance: 90,
    performance: 87,
  },
];

export default function HRPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        employee.name.toLowerCase().includes(searchText) ||
        employee.id.toLowerCase().includes(searchText) ||
        employee.role.toLowerCase().includes(searchText);

      const matchesDepartment =
        department === "All Departments" ||
        employee.department === department;

      const matchesStatus =
        status === "All Status" || employee.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [search, department, status]);

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const employeesOnLeave = employees.filter(
    (employee) => employee.status === "On Leave"
  ).length;

  const averageAttendance =
    employees.reduce((sum, employee) => sum + employee.attendance, 0) /
    employees.length;

  const averagePerformance =
    employees.reduce((sum, employee) => sum + employee.performance, 0) /
    employees.length;

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
              Human Resources
            </h1>

            <p
              style={{
                marginTop: "7px",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Manage employees, attendance and workforce performance
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
            title="Total Employees"
            value={employees.length}
            subtitle="Registered employees"
            valueColor="#2563eb"
          />

          <KpiCard
            title="Active Employees"
            value={activeEmployees}
            subtitle="Currently working"
            valueColor="#16a34a"
          />

          <KpiCard
            title="On Leave"
            value={employeesOnLeave}
            subtitle="Employees on leave"
            valueColor="#f97316"
          />

          <KpiCard
            title="Avg. Attendance"
            value={`${averageAttendance.toFixed(1)}%`}
            subtitle="Current workforce"
            valueColor="#7c3aed"
          />
        </div>

        {/* Search and Filters */}
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
            placeholder="Search employee, ID or role..."
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
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            style={{
              width: "180px",
              height: "40px",
              border: "1px solid #cbd5e1",
              borderRadius: "7px",
              padding: "0 10px",
              background: "#ffffff",
            }}
          >
            <option>All Departments</option>
            <option>Sales</option>
            <option>Human Resources</option>
            <option>Operations</option>
            <option>Finance</option>
            <option>Support</option>
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              width: "150px",
              height: "40px",
              border: "1px solid #cbd5e1",
              borderRadius: "7px",
              padding: "0 10px",
              background: "#ffffff",
            }}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>On Leave</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Employee Table */}
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
              Employee Directory
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                fontSize: "13px",
                color: "#64748b",
              }}
            >
              Workforce overview and employee performance
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
                  <th style={thStyle}>Employee</th>
                  <th style={thStyle}>Role</th>
                  <th style={thStyle}>Department</th>
                  <th style={thStyle}>Location</th>
                  <th style={thStyle}>Attendance</th>
                  <th style={thStyle}>Performance</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.id}>
                    <td style={tdStyle}>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#111827",
                        }}
                      >
                        {employee.name}
                      </div>

                      <div
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          marginTop: "3px",
                        }}
                      >
                        {employee.id}
                      </div>
                    </td>

                    <td style={tdStyle}>{employee.role}</td>

                    <td style={tdStyle}>{employee.department}</td>

                    <td style={tdStyle}>{employee.location}</td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            width: "70px",
                            height: "6px",
                            background: "#e2e8f0",
                            borderRadius: "10px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${employee.attendance}%`,
                              height: "100%",
                              background: "#2563eb",
                              borderRadius: "10px",
                            }}
                          />
                        </div>

                        <span>{employee.attendance}%</span>
                      </div>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          fontWeight: 600,
                          color:
                            employee.performance >= 90
                              ? "#16a34a"
                              : employee.performance >= 80
                                ? "#ca8a04"
                                : "#dc2626",
                        }}
                      >
                        {employee.performance}%
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <StatusBadge status={employee.status} />
                    </td>

                    <td style={tdStyle}>
                      <button
                        onClick={() =>
                          alert(
                            `${employee.name}\n\nRole: ${employee.role}\nDepartment: ${employee.department}\nAttendance: ${employee.attendance}%\nPerformance: ${employee.performance}%`
                          )
                        }
                        style={{
                          border: "none",
                          background: "transparent",
                          color: "#2563eb",
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        View
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
            Showing {filteredEmployees.length} of {employees.length} employees
          </div>
        </section>

        {/* HR Insights */}
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
            HR Insights
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "14px",
            }}
          >
            <InsightCard
              title="Workforce Performance"
              value={`${averagePerformance.toFixed(1)}%`}
              description="Average performance score across the current workforce."
            />

            <InsightCard
              title="Attendance Health"
              value={`${averageAttendance.toFixed(1)}%`}
              description="Average employee attendance is currently healthy."
            />

            <InsightCard
              title="Leave Monitoring"
              value={`${employeesOnLeave} employees`}
              description="Employees are currently marked as being on leave."
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

function StatusBadge({
  status,
}: {
  status: Employee["status"];
}) {
  const styles = {
    Active: {
      background: "#dcfce7",
      color: "#16a34a",
    },
    "On Leave": {
      background: "#ffedd5",
      color: "#ea580c",
    },
    Inactive: {
      background: "#e2e8f0",
      color: "#64748b",
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