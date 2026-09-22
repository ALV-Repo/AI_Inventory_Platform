"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, fmtDate } from "../../../lib/api";

type Employee = {
  id: number;
  employee_code: string;
  full_name: string;
  email?: string;
  phone?: string;
  department?: string;
  designation?: string;
  joining_date: string;
  basic_salary: number;
  status: string;
};

const statusColor = (s: string) =>
  s === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.hrm.employees();
      setEmployees(data as Employee[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load employees.");
    } finally {
      setLoading(false);
    }
  }

  const departments = ["All", ...Array.from(new Set(employees.map(e => e.department ?? "").filter(Boolean)))];

  const filtered = useMemo(() => employees.filter(e => {
    const matchSearch = e.full_name.toLowerCase().includes(search.toLowerCase()) ||
      e.employee_code.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === "All" || e.department === deptFilter;
    return matchSearch && matchDept;
  }), [employees, search, deptFilter]);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
            <p className="mt-1 text-sm text-gray-500">All employee records</p>
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Total Employees", value: employees.length },
            { label: "Active", value: employees.filter(e => e.status === "active").length, color: "text-green-600" },
            { label: "Departments", value: departments.length - 1 },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-2xl font-bold ${c.color ?? "text-gray-900"}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-5 flex gap-3">
          <input type="text" placeholder="Search by name or code..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none">
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

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
                  {["Code", "Name", "Department", "Designation", "Joined", "Salary", "Status"].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="py-12 text-center text-sm text-gray-400">No employees found</td></tr>
                ) : filtered.map(e => (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-mono text-sm text-blue-600">{e.employee_code}</td>
                    <td className="px-5 py-4">
                      <Link href={`/hr/employees/${e.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-600">{e.full_name}</Link>
                      {e.email && <p className="text-xs text-gray-400">{e.email}</p>}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{e.department ?? "-"}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{e.designation ?? "-"}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{fmtDate(e.joining_date)}</td>
                    <td className="px-5 py-4 text-sm text-gray-900">₹{Number(e.basic_salary).toLocaleString("en-IN")}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(e.status)}`}>{e.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
