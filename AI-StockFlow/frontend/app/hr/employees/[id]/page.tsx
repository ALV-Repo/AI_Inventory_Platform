"use client";

import { use, useState } from "react";
import Link from "next/link";

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
  employmentType: string;
  experience: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
};

const employeeData: Record<string, Employee> = {
  "1": {
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
    employmentType: "Full Time",
    experience: "4 Years",
    gender: "Male",
    dateOfBirth: "12 May 1998",
    address: "Madhapur, Hyderabad, Telangana",
    emergencyContact: "+91 99887 66554",
  },

  "2": {
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
    employmentType: "Full Time",
    experience: "2 Years",
    gender: "Female",
    dateOfBirth: "18 August 2000",
    address: "Whitefield, Bengaluru, Karnataka",
    emergencyContact: "+91 98765 11111",
  },

  "3": {
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
    employmentType: "Full Time",
    experience: "5 Years",
    gender: "Male",
    dateOfBirth: "24 February 1997",
    address: "Anna Nagar, Chennai, Tamil Nadu",
    emergencyContact: "+91 90000 12345",
  },

  "4": {
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
    employmentType: "Full Time",
    experience: "6 Years",
    gender: "Female",
    dateOfBirth: "09 January 1995",
    address: "Hinjewadi, Pune, Maharashtra",
    emergencyContact: "+91 91234 44444",
  },

  "5": {
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
    employmentType: "Full Time",
    experience: "7 Years",
    gender: "Male",
    dateOfBirth: "21 July 1993",
    address: "Andheri, Mumbai, Maharashtra",
    emergencyContact: "+91 98765 77777",
  },
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
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
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

export default function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

   const initialEmployee = employeeData[id] || employeeData["1"];

const [employee, setEmployee] = useState(initialEmployee);
const [showEdit, setShowEdit] = useState(false);

const [editName, setEditName] = useState(employee.name);
const [editDepartment, setEditDepartment] = useState(employee.department);
const [editDesignation, setEditDesignation] = useState(employee.designation);
const [editEmail, setEditEmail] = useState(employee.email);
const [editPhone, setEditPhone] = useState(employee.phone);

const handleSaveEmployee = () => {
  setEmployee({
    ...employee,
    name: editName,
    department: editDepartment,
    designation: editDesignation,
    email: editEmail,
    phone: editPhone,
  });

  setShowEdit(false);
};

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mx-auto max-w-7xl">

        {/* Back */}
        <div className="mb-5">
          <Link
            href="/hr/employees"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to Employees
          </Link>
        </div>

        {/* Employee Header */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                {getInitials(employee.name)}
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {employee.name}
                  </h1>

                  <StatusBadge status={employee.status} />
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {employee.id} • {employee.department} •{" "}
                  {employee.location}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {employee.designation}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEdit(true)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Edit Employee
              </button>

              <button
                onClick={() =>
                  alert("Employee document download will be connected here.")
                }
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Download Profile
              </button>
            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Monthly Salary
            </p>

            <p className="mt-2 text-2xl font-bold text-blue-600">
              {formatCurrency(employee.salary)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Current monthly salary
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Experience
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {employee.experience}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Professional experience
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Employment
            </p>

            <p className="mt-2 text-2xl font-bold text-emerald-600">
              {employee.employmentType}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Current employment type
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Joining Date
            </p>

            <p className="mt-2 text-xl font-bold text-slate-900">
              {employee.joinDate}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Date joined company
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <div className="flex gap-1 overflow-x-auto">

            <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">
              Overview
            </button>

            <Link
              href="/hr/attendance"
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Attendance
            </Link>

            <Link
              href="/hr/leave"
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Leave History
            </Link>

            <Link
              href="/hr/payslips"
              className="rounded-lg px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Payroll
            </Link>

          </div>
        </div>

        {/* Main Content */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">

          {/* Personal Information */}
          <section className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="mb-5">
              <h2 className="text-lg font-bold text-slate-900">
                Employee Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Personal and employment details.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <InfoCard
                label="Full Name"
                value={employee.name}
              />

              <InfoCard
                label="Employee ID"
                value={employee.id}
              />

              <InfoCard
                label="Department"
                value={employee.department}
              />

              <InfoCard
                label="Designation"
                value={employee.designation}
              />

              <InfoCard
                label="Email"
                value={employee.email}
              />

              <InfoCard
                label="Phone"
                value={employee.phone}
              />

              <InfoCard
                label="Location"
                value={employee.location}
              />

              <InfoCard
                label="Joining Date"
                value={employee.joinDate}
              />

              <InfoCard
                label="Employment Type"
                value={employee.employmentType}
              />

              <InfoCard
                label="Reporting Manager"
                value={employee.manager}
              />

            </div>
          </section>

          {/* Employment Summary */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-lg font-bold text-slate-900">
              Employment Summary
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current employee status.
            </p>

            <div className="mt-5 space-y-4">

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-sm text-slate-500">
                  Status
                </span>

                <StatusBadge status={employee.status} />
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-sm text-slate-500">
                  Department
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {employee.department}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-sm text-slate-500">
                  Experience
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {employee.experience}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-sm text-slate-500">
                  Employment
                </span>

                <span className="text-sm font-semibold text-slate-900">
                  {employee.employmentType}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  Monthly Salary
                </span>

                <span className="text-sm font-bold text-emerald-600">
                  {formatCurrency(employee.salary)}
                </span>
              </div>

            </div>
          </section>
        </div>

        {/* Personal Details */}
        <section className="mt-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Personal Details
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Additional employee information.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

            <InfoCard
              label="Gender"
              value={employee.gender}
            />

            <InfoCard
              label="Date of Birth"
              value={employee.dateOfBirth}
            />

            <InfoCard
              label="Emergency Contact"
              value={employee.emergencyContact}
            />

            <InfoCard
              label="Work Location"
              value={employee.location}
            />

          </div>

          <div className="mt-4">
            <InfoCard
              label="Address"
              value={employee.address}
            />
          </div>
        </section>

        {/* HR Actions */}
        <section className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-6">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>
              <h2 className="text-base font-bold text-blue-900">
                HR Employee Management
              </h2>

              <p className="mt-1 text-sm text-blue-700">
                Manage employee records, leave, attendance and payroll
                information from this profile.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">

              <Link
                href="/hr/leave"
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100"
              >
                Manage Leave
              </Link>

              <Link
                href="/hr/payslips"
                className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm hover:bg-blue-100"
              >
                View Payroll
              </Link>

              <Link
                href="/hr/attendance"
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                View Attendance
              </Link>

            </div>
          </div>
        </section>

        {/* Footer Note */}
        <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <p className="text-xs text-slate-500">
            Employee profile • {employee.id} • AI StockFlow HR
          </p>
        </div>

        {/* Edit Employee Modal */}
        {showEdit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">

              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Edit Employee
                </h2>

                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="rounded-lg px-3 py-1 text-slate-500 hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Name
                  </label>

                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Department
                  </label>

                  <input
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Designation
                  </label>

                  <input
                    value={editDesignation}
                    onChange={(e) => setEditDesignation(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Email
                  </label>

                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Phone
                  </label>

                  <input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>

              </div>

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveEmployee}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Save Changes
                </button>

              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}