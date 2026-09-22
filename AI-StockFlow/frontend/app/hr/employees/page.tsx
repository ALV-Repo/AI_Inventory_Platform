"use client";

import { useMemo, useState } from "react";

type Employee = {
  id: string;
  name: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  status: "Active" | "On Leave" | "Inactive";
  salary: number;
  manager: string;
};

const employees: Employee[] = [
  {
    id: "EMP-001",
    name: "Rahul Sharma",
    department: "Engineering",
    designation: "Senior Software Engineer",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    location: "Hyderabad",
    joinDate: "15 Jan 2022",
    status: "Active",
    salary: 92500,
    manager: "Vikram Singh",
  },
  {
    id: "EMP-002",
    name: "Priya Sharma",
    department: "IT",
    designation: "Software Engineer",
    email: "priya.sharma@example.com",
    phone: "+91 91234 56789",
    location: "Bengaluru",
    joinDate: "10 Mar 2023",
    status: "Active",
    salary: 78000,
    manager: "Rahul Sharma",
  },
  {
    id: "EMP-003",
    name: "Arjun Rao",
    department: "Sales",
    designation: "Sales Executive",
    email: "arjun.rao@example.com",
    phone: "+91 99887 66554",
    location: "Chennai",
    joinDate: "22 Jun 2021",
    status: "Active",
    salary: 65000,
    manager: "Sneha Reddy",
  },
  {
    id: "EMP-004",
    name: "Sneha Reddy",
    department: "Warehouse",
    designation: "Warehouse Manager",
    email: "sneha.reddy@example.com",
    phone: "+91 90009 80808",
    location: "Pune",
    joinDate: "18 Aug 2020",
    status: "On Leave",
    salary: 72000,
    manager: "Vikram Singh",
  },
  {
    id: "EMP-005",
    name: "Vikram Singh",
    department: "Finance",
    designation: "Finance Manager",
    email: "vikram.singh@example.com",
    phone: "+91 93456 78901",
    location: "Mumbai",
    joinDate: "05 Feb 2020",
    status: "Active",
    salary: 98000,
    manager: "Admin",
  },
  {
    id: "EMP-006",
    name: "Kavya Nair",
    department: "HR",
    designation: "HR Executive",
    email: "kavya.nair@example.com",
    phone: "+91 93456 78901",
    location: "Kochi",
    joinDate: "12 Sep 2022",
    status: "Active",
    salary: 68000,
    manager: "Vikram Singh",
  },
  {
    id: "EMP-007",
    name: "Amit Kumar",
    department: "Operations",
    designation: "Operations Executive",
    email: "amit.kumar@example.com",
    phone: "+91 98760 12345",
    location: "Delhi",
    joinDate: "08 Nov 2023",
    status: "Active",
    salary: 59000,
    manager: "Sneha Reddy",
  },
  {
    id: "EMP-008",
    name: "Neha Verma",
    department: "Marketing",
    designation: "Marketing Specialist",
    email: "neha.verma@example.com",
    phone: "+91 97654 32109",
    location: "Jaipur",
    joinDate: "14 Apr 2022",
    status: "On Leave",
    salary: 62000,
    manager: "Vikram Singh",
  },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function StatusBadge({
  status,
}: {
  status: Employee["status"];
}) {
  const styles = {
    Active: "bg-emerald-100 text-emerald-700",
    "On Leave": "bg-amber-100 text-amber-700",
    Inactive: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

export default function EmployeesPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [status, setStatus] = useState("All Status");
  const [selectedEmployee, setSelectedEmployee] =
    useState<Employee | null>(null);

  const departments = [
    "All Departments",
    ...Array.from(new Set(employees.map((employee) => employee.department))),
  ];

  const filteredEmployees = useMemo(() => {
    const query = search.toLowerCase().trim();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.name.toLowerCase().includes(query) ||
        employee.id.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.designation.toLowerCase().includes(query);

      const matchesDepartment =
        department === "All Departments" ||
        employee.department === department;

      const matchesStatus =
        status === "All Status" || employee.status === status;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [search, department, status]);

  const totalEmployees = employees.length;

  const activeEmployees = employees.filter(
    (employee) => employee.status === "Active"
  ).length;

  const onLeaveEmployees = employees.filter(
    (employee) => employee.status === "On Leave"
  ).length;

  const departmentsCount = new Set(
    employees.map((employee) => employee.department)
  ).size;

  const clearFilters = () => {
    setSearch("");
    setDepartment("All Departments");
    setStatus("All Status");
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Employees
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage employee information, profiles and HR records.
            </p>
          </div>

          <button
            onClick={() =>
              alert("New Employee form will be connected here.")
            }
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            + New Employee
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total Employees
            </p>

            <p className="mt-2 text-3xl font-bold text-slate-900">
              {totalEmployees}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Registered employees
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Active Employees
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {activeEmployees}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Currently working
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              On Leave
            </p>

            <p className="mt-2 text-3xl font-bold text-amber-600">
              {onLeaveEmployees}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Currently on leave
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Departments
            </p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              {departmentsCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Active departments
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Employee Search & Filters
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Search employees by name, ID, email or designation.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-2">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee, ID, email..."
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>On Leave</option>
              <option>Inactive</option>
            </select>
          </div>

          {(search ||
            department !== "All Departments" ||
            status !== "All Status") && (
            <div className="mt-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* Employee List */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Employee List
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Showing {filteredEmployees.length} of {employees.length}{" "}
                employees
              </p>
            </div>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
              {filteredEmployees.length} Results
            </span>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Employee
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Designation
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
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
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                          {initials(employee.name)}
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {employee.name}
                          </p>

                          <p className="text-xs text-slate-400">
                            {employee.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {employee.department}
                    </td>

                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-700">
                        {employee.designation}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {employee.location}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={employee.status} />
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelectedEmployee(employee)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                      >
                        View Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {initials(employee.name)}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {employee.name}
                      </p>

                      <p className="text-xs text-slate-400">
                        {employee.id}
                      </p>
                    </div>
                  </div>

                  <StatusBadge status={employee.status} />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-slate-400">Department</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {employee.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Designation</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {employee.designation}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Location</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {employee.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400">Join Date</p>
                    <p className="mt-1 font-medium text-slate-700">
                      {employee.joinDate}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEmployee(employee)}
                  className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl">
                🔍
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No employees found
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Try changing your search or filter.
              </p>

              <button
                onClick={clearFilters}
                className="mt-4 text-sm font-medium text-blue-600"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>

        {/* Bottom Summary */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Active Employees
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {activeEmployees}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Employees currently working
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Employees On Leave
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-600">
              {onLeaveEmployees}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Employees currently unavailable
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Average Salary
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {formatCurrency(
                employees.reduce(
                  (total, employee) => total + employee.salary,
                  0
                ) / employees.length
              )}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Average employee salary
            </p>
          </div>
        </div>

        {/* Profile Modal */}
        {selectedEmployee && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 font-bold text-white">
                    {initials(selectedEmployee.name)}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      {selectedEmployee.name}
                    </h2>

                    <p className="text-xs text-slate-500">
                      {selectedEmployee.id} •{" "}
                      {selectedEmployee.department}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedEmployee(null)}
                  className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-400">
                      Employee Status
                    </p>

                    <div className="mt-2">
                      <StatusBadge status={selectedEmployee.status} />
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      alert("Edit Employee form will be connected here.")
                    }
                    className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                  >
                    Edit Employee
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Full Name
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedEmployee.name}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Employee ID
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedEmployee.id}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Department
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedEmployee.department}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Designation
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedEmployee.designation}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Email
                    </p>
                    <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                      {selectedEmployee.email}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Phone
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedEmployee.phone}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Location
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedEmployee.location}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Joining Date
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedEmployee.joinDate}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Reporting Manager
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedEmployee.manager}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs text-slate-400">
                      Monthly Salary
                    </p>

                    <p className="mt-1 text-sm font-semibold text-emerald-600">
                      {formatCurrency(selectedEmployee.salary)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm font-semibold text-blue-900">
                    Employee Profile
                  </p>

                  <p className="mt-1 text-xs leading-5 text-blue-700">
                    Employee information, HR records, leave details and
                    payroll information can be managed from this profile.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
