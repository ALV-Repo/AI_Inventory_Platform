"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../components/layout/PageLayout";
import { api, inr, fmtDate, type Employee } from "../../lib/api";

export default function HRPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    employee_code: "", full_name: "", email: "", phone: "",
    department: "", designation: "", joining_date: "", basic_salary: 0,
  });

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.hrm.employees({ department: deptFilter || undefined });
      setEmployees(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!form.employee_code || !form.full_name || !form.joining_date) return;
    try {
      setSaving(true);
      await api.hrm.createEmployee({ ...form, joining_date: form.joining_date });
      setShowCreate(false);
      setForm({ employee_code: "", full_name: "", email: "", phone: "", department: "", designation: "", joining_date: "", basic_salary: 0 });
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create employee.");
    } finally {
      setSaving(false);
    }
  }

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))] as string[];
  const filtered = employees.filter(e =>
    e.full_name.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_code.toLowerCase().includes(search.toLowerCase()) ||
    (e.department ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Human Resources</h1>
            <p className="mt-1 text-sm text-gray-500">Employees, attendance, leave and payroll</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            + Add Employee
          </button>
        </div>

        {/* Sub-nav */}
        <div className="mb-6 flex gap-2">
          {[
            { label: "Employees", href: "/hr" },
            { label: "Attendance", href: "/hr/attendance" },
            { label: "Leave", href: "/hr/leave" },
            { label: "Payslips", href: "/hr/payslips" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              {label}
            </Link>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: "Total Employees", value: employees.length },
            { label: "Active", value: employees.filter(e => e.status === "active").length },
            { label: "Departments", value: departments.length },
            { label: "Avg Salary", value: employees.length ? inr(employees.reduce((a, e) => a + (e.basic_salary || 0), 0) / employees.length) : "-" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 flex gap-3">
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500"
          />
          <select
            value={deptFilter}
            onChange={e => { setDeptFilter(e.target.value); }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading employees...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Code", "Name", "Department", "Designation", "Joining Date", "Basic Salary", "Status"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400">No employees found</td></tr>
                ) : filtered.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">{emp.employee_code}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{emp.full_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.department ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.designation ?? "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{fmtDate(emp.joining_date)}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{inr(emp.basic_salary)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${emp.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                        {emp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowCreate(false)}>
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Add Employee</h2>
              <div className="space-y-3">
                {[
                  { label: "Employee Code *", key: "employee_code", type: "text" },
                  { label: "Full Name *", key: "full_name", type: "text" },
                  { label: "Email", key: "email", type: "email" },
                  { label: "Phone", key: "phone", type: "tel" },
                  { label: "Department", key: "department", type: "text" },
                  { label: "Designation", key: "designation", type: "text" },
                  { label: "Joining Date *", key: "joining_date", type: "date" },
                  { label: "Basic Salary (₹)", key: "basic_salary", type: "number" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
                    <input
                      type={type}
                      value={String(form[key as keyof typeof form])}
                      onChange={e => setForm(f => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>
                ))}
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowCreate(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={handleCreate} disabled={saving} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Saving..." : "Add Employee"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
