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
  joiningDate: string;
  email: string;
  phone: string;
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
    joiningDate: "12 Jan 2024",
    email: "aarav.sharma@aistockflow.com",
    phone: "+91 98765 43210",
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
    joiningDate: "08 Mar 2023",
    email: "priya.reddy@aistockflow.com",
    phone: "+91 99887 66554",
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
    joiningDate: "21 Jul 2024",
    email: "rahul.kumar@aistockflow.com",
    phone: "+91 91234 56789",
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
    joiningDate: "15 Feb 2024",
    email: "sneha.patel@aistockflow.com",
    phone: "+91 93456 78901",
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
    joiningDate: "03 Nov 2023",
    email: "vikram.singh@aistockflow.com",
    phone: "+91 97654 32109",
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
    joiningDate: "18 May 2024",
    email: "ananya.rao@aistockflow.com",
    phone: "+91 94567 89012",
  },
];

export default function HRPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] =
    useState("All Departments");
  const [status, setStatus] =
    useState("All Status");

  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const searchText = search.toLowerCase().trim();

      const matchesSearch =
        employee.name.toLowerCase().includes(searchText) ||
        employee.id.toLowerCase().includes(searchText) ||
        employee.role.toLowerCase().includes(searchText) ||
        employee.location.toLowerCase().includes(searchText);

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

  const inactiveEmployees = employees.filter(
    (employee) => employee.status === "Inactive"
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

  const highPerformers = employees.filter(
    (employee) => employee.performance >= 90
  ).length;

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

          {/* SECONDARY SUMMARY */}
          <div className="mb-5 grid grid-cols-1 gap-3 md:grid-cols-3">

            <SummaryCard
              title="Average Performance"
              value={`${averagePerformance.toFixed(1)}%`}
              description="Average workforce performance"
              color="text-blue-600"
            />

            <SummaryCard
              title="High Performers"
              value={highPerformers.toString()}
              description="Employees scoring 90% or above"
              color="text-green-600"
            />

            <SummaryCard
              title="Inactive Employees"
              value={inactiveEmployees.toString()}
              description="Currently inactive employees"
              color="text-slate-600"
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
                placeholder="Search employee, ID, role or location..."
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

            <div className="mt-2 flex justify-end">

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setDepartment("All Departments");
                  setStatus("All Status");
                }}
                className="text-[11px] font-semibold text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>

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

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                            {employee.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)}
                          </div>

                          <div>

                            <p className="font-semibold text-slate-800">
                              {employee.name}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {employee.id}
                            </p>

                          </div>

                        </div>

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
                              className={`h-full rounded-full ${
                                employee.attendance >= 90
                                  ? "bg-green-500"
                                  : "bg-orange-500"
                              }`}
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
                            setSelectedEmployee(employee)
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

            <div className="grid gap-3 md:grid-cols-4">

              <InsightCard
                title="Workforce Performance"
                value={`${averagePerformance.toFixed(1)}%`}
                description="Average performance score across the current workforce."
                tone="blue"
              />

              <InsightCard
                title="Attendance Health"
                value={`${averageAttendance.toFixed(1)}%`}
                description="Average employee attendance is currently healthy."
                tone="green"
              />

              <InsightCard
                title="Leave Monitoring"
                value={`${employeesOnLeave} employees`}
                description="Employees are currently marked as being on leave."
                tone="orange"
              />

              <InsightCard
                title="High Performers"
                value={`${highPerformers} employees`}
                description="Employees currently achieving 90% or higher."
                tone="purple"
              />

            </div>

          </section>

          {/* FOOTER */}
          <div className="py-8 text-center text-[10px] text-slate-400">
            AI StockFlow • Human Resources
          </div>

        </div>
      </main>

      {/* EMPLOYEE DETAIL MODAL */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-700">
                  {selectedEmployee.name
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)}
                </div>

                <div>
                  <h2 className="text-lg font-bold">
                    {selectedEmployee.name}
                  </h2>

                  <p className="text-xs text-slate-500">
                    {selectedEmployee.id}
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                ×
              </button>

            </div>

            {/* MODAL BODY */}
            <div className="p-5">

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                <DetailItem
                  label="Role"
                  value={selectedEmployee.role}
                />

                <DetailItem
                  label="Department"
                  value={selectedEmployee.department}
                />

                <DetailItem
                  label="Location"
                  value={selectedEmployee.location}
                />

                <DetailItem
                  label="Joining Date"
                  value={selectedEmployee.joiningDate}
                />

                <DetailItem
                  label="Email"
                  value={selectedEmployee.email}
                />

                <DetailItem
                  label="Phone"
                  value={selectedEmployee.phone}
                />

              </div>

              {/* ATTENDANCE */}
              <div className="mt-5 rounded-lg border border-slate-200 p-4">

                <div className="flex items-center justify-between">

                  <span className="text-xs font-medium text-slate-500">
                    Attendance
                  </span>

                  <strong className="text-sm text-slate-900">
                    {selectedEmployee.attendance}%
                  </strong>

                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">

                  <div
                    className={`h-full rounded-full ${
                      selectedEmployee.attendance >= 90
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }`}
                    style={{
                      width: `${selectedEmployee.attendance}%`,
                    }}
                  />

                </div>

              </div>

              {/* PERFORMANCE */}
              <div className="mt-3 rounded-lg border border-slate-200 p-4">

                <div className="flex items-center justify-between">

                  <span className="text-xs font-medium text-slate-500">
                    Performance
                  </span>

                  <strong
                    className={`text-sm ${
                      selectedEmployee.performance >= 90
                        ? "text-green-600"
                        : selectedEmployee.performance >= 80
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedEmployee.performance}%
                  </strong>

                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">

                  <div
                    className={`h-full rounded-full ${
                      selectedEmployee.performance >= 90
                        ? "bg-green-500"
                        : selectedEmployee.performance >= 80
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{
                      width: `${selectedEmployee.performance}%`,
                    }}
                  />

                </div>

              </div>

              {/* STATUS */}
              <div className="mt-4 flex items-center justify-between">

                <span className="text-xs font-medium text-slate-500">
                  Current Status
                </span>

                <StatusBadge
                  status={selectedEmployee.status}
                />

              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="flex justify-end border-t border-slate-200 p-4">

              <button
                type="button"
                onClick={() => setSelectedEmployee(null)}
                className="rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>

            </div>

          </div>

        </div>
      )}

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

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
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
   SUMMARY CARD
============================================================ */

function SummaryCard({
  title,
  value,
  description,
  color,
}: {
  title: string;
  value: string;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p
        className={`mt-2 text-xl font-bold ${color}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-5 text-slate-500">
        {description}
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
   DETAIL ITEM
============================================================ */

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">

      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-semibold text-slate-800">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   INSIGHT CARD
============================================================ */

function InsightCard({
  title,
  value,
  description,
  tone,
}: {
  title: string;
  value: string;
  description: string;
  tone: "blue" | "green" | "orange" | "purple";
}) {
  const styles = {
    blue: {
      wrapper: "border-blue-100 bg-blue-50/40",
      value: "text-blue-700",
    },
    green: {
      wrapper: "border-green-100 bg-green-50/40",
      value: "text-green-700",
    },
    orange: {
      wrapper: "border-orange-100 bg-orange-50/40",
      value: "text-orange-600",
    },
    purple: {
      wrapper: "border-purple-100 bg-purple-50/40",
      value: "text-purple-700",
    },
  }[tone];

  return (
    <div
      className={`rounded-lg border p-4 ${styles.wrapper}`}
    >

      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p
        className={`mt-2 text-xl font-bold ${styles.value}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] leading-5 text-slate-500">
        {description}
      </p>

    </div>
  );
}