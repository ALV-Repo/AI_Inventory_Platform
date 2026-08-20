"use client";

import { useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

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
  const [department, setDepartment] =
    useState("All Departments");
  const [status, setStatus] =
    useState("All Status");

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        employee.name
          .toLowerCase()
          .includes(searchText) ||
        employee.id
          .toLowerCase()
          .includes(searchText) ||
        employee.role
          .toLowerCase()
          .includes(searchText);

      const matchesDepartment =
        department === "All Departments" ||
        employee.department === department;

      const matchesStatus =
        status === "All Status" ||
        employee.status === status;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus
      );
    });
  }, [search, department, status]);

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const employeesOnLeave = employees.filter(
    (employee) => employee.status === "On Leave"
  ).length;

  const averageAttendance =
    employees.reduce(
      (sum, employee) => sum + employee.attendance,
      0
    ) / employees.length;

  const averagePerformance =
    employees.reduce(
      (sum, employee) => sum + employee.performance,
      0
    ) / employees.length;

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f8fafc] px-6 py-7 text-slate-900">

        <div className="mx-auto max-w-6xl">

          {/* HEADER */}
          <div className="mb-6 flex items-start justify-between">

            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Human Resources
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Manage employees, attendance and workforce
                performance
              </p>
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>

          </div>

          {/* KPI CARDS */}
          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            <KpiCard
              title="Total Employees"
              value={employees.length}
              subtitle="Registered employees"
              valueColor="text-blue-600"
            />

            <KpiCard
              title="Active Employees"
              value={activeEmployees}
              subtitle="Currently working"
              valueColor="text-green-600"
            />

            <KpiCard
              title="On Leave"
              value={employeesOnLeave}
              subtitle="Employees on leave"
              valueColor="text-orange-500"
            />

            <KpiCard
              title="Avg. Attendance"
              value={`${averageAttendance.toFixed(1)}%`}
              subtitle="Current workforce"
              valueColor="text-purple-600"
            />

          </div>

          {/* SEARCH AND FILTERS */}
          <section className="mb-5 rounded-xl border border-slate-200 bg-white p-3">

            <div className="grid gap-2 md:grid-cols-[1fr_190px_160px]">

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search employee, ID or role..."
                className="rounded-md border border-slate-300 px-3 py-2 text-xs outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
              />

              <select
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none"
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
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>On Leave</option>
                <option>Inactive</option>
              </select>

            </div>

          </section>

          {/* EMPLOYEE DIRECTORY */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

            <div className="border-b border-slate-200 px-5 py-4">

              <h2 className="text-sm font-semibold">
                Employee Directory
              </h2>

              <p className="mt-1 text-[11px] text-slate-500">
                Workforce overview and employee performance
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full border-collapse text-xs">

                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-left">

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Employee
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Role
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Department
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Location
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Attendance
                    </th>

                    <th className="px-4 py-3 font-semibold text-slate-600">
                      Performance
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

                  {filteredEmployees.map((employee) => (

                    <tr
                      key={employee.id}
                      className="border-b border-slate-100 transition hover:bg-slate-50"
                    >

                      {/* EMPLOYEE */}
                      <td className="px-4 py-3">

                        <p className="font-semibold text-slate-800">
                          {employee.name}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {employee.id}
                        </p>

                      </td>

                      {/* ROLE */}
                      <td className="px-4 py-3 text-slate-600">
                        {employee.role}
                      </td>

                      {/* DEPARTMENT */}
                      <td className="px-4 py-3 text-slate-600">
                        {employee.department}
                      </td>

                      {/* LOCATION */}
                      <td className="px-4 py-3 text-slate-600">
                        {employee.location}
                      </td>

                      {/* ATTENDANCE */}
                      <td className="px-4 py-3">

                        <div className="flex items-center gap-2">

                          <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-200">

                            <div
                              className="h-full rounded-full bg-blue-600"
                              style={{
                                width: `${employee.attendance}%`,
                              }}
                            />

                          </div>

                          <span className="text-[10px] font-semibold">
                            {employee.attendance}%
                          </span>

                        </div>

                      </td>

                      {/* PERFORMANCE */}
                      <td className="px-4 py-3">

                        <span
                          className={`font-semibold ${
                            employee.performance >= 90
                              ? "text-green-600"
                              : employee.performance >= 80
                                ? "text-yellow-600"
                                : "text-red-600"
                          }`}
                        >
                          {employee.performance}%
                        </span>

                      </td>

                      {/* STATUS */}
                      <td className="px-4 py-3">

                        <StatusBadge
                          status={employee.status}
                        />

                      </td>

                      {/* ACTION */}
                      <td className="px-4 py-3">

                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              `${employee.name}\n\nRole: ${employee.role}\nDepartment: ${employee.department}\nLocation: ${employee.location}\nAttendance: ${employee.attendance}%\nPerformance: ${employee.performance}%`
                            )
                          }
                          className="font-semibold text-blue-600 hover:text-blue-800"
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

              {filteredEmployees.length === 0 && (
                <div className="px-6 py-12 text-center">

                  <p className="text-sm font-medium text-slate-700">
                    No employees found.
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Try changing your search or filters.
                  </p>

                </div>
              )}

            </div>

            <div className="border-t border-slate-200 px-5 py-3">

              <p className="text-[10px] text-slate-500">
                Showing {filteredEmployees.length} of{" "}
                {employees.length} employees
              </p>

            </div>

          </section>

          {/* HR INSIGHTS */}
          <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">

            <h2 className="mb-4 text-sm font-semibold">
              HR Insights
            </h2>

            <div className="grid gap-3 md:grid-cols-3">

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

          {/* FOOTER */}
          <div className="py-8 text-center text-[10px] text-slate-400">
            AI StockFlow • Human Resources
          </div>

        </div>

      </main>
    </PageLayout>
  );
}

/* ============================================================
   KPI CARD
============================================================ */

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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <p className="text-[10px] uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueColor}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] text-slate-500">
        {subtitle}
      </p>

    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: Employee["status"];
}) {
  const styles = {
    Active: "bg-green-100 text-green-700",
    "On Leave": "bg-orange-100 text-orange-700",
    Inactive: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* ============================================================
   INSIGHT CARD
============================================================ */

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
    <div className="rounded-lg border border-slate-200 p-4">

      <p className="text-[10px] uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}