"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageLayout from "../../../../components/layout/PageLayout";
import { api, fmtDate } from "../../../../lib/api";

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

export default function EmployeeDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [attendance, setAttendance] = useState<unknown[]>([]);
  const [payslips, setPayslips] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "attendance" | "payslips">("overview");

  useEffect(() => { if (id) load(); }, [id]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const [emp, att, pay] = await Promise.all([
        api.hrm.getEmployee(id),
        api.hrm.attendance({ employee_id: id }),
        api.hrm.payslips(id),
      ]);
      setEmployee(emp as Employee);
      setAttendance(att as unknown[]);
      setPayslips(pay as unknown[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load employee.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageLayout>
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/hr/employees" className="text-sm text-blue-600 hover:text-blue-800">← Employees</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-2xl font-bold text-gray-900">{loading ? "Loading..." : employee?.full_name}</h1>
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {!loading && employee && (
          <>
            <div className="mb-6 flex gap-1 rounded-lg border border-gray-200 bg-gray-100 p-1 w-fit">
              {(["overview", "attendance", "payslips"] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`rounded-md px-5 py-2 text-sm font-medium capitalize transition ${tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                  {t}
                </button>
              ))}
            </div>

            {tab === "overview" && (
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Employee Code", employee.employee_code],
                    ["Full Name", employee.full_name],
                    ["Email", employee.email ?? "-"],
                    ["Phone", employee.phone ?? "-"],
                    ["Department", employee.department ?? "-"],
                    ["Designation", employee.designation ?? "-"],
                    ["Joining Date", fmtDate(employee.joining_date)],
                    ["Basic Salary", `₹${Number(employee.basic_salary).toLocaleString("en-IN")}`],
                    ["Status", employee.status],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between border-b pb-3">
                      <span className="text-gray-500">{label}</span>
                      <span className="font-medium text-gray-900 capitalize">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "attendance" && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="font-semibold text-gray-900">Attendance Records</h2>
                </div>
                <table className="w-full text-left">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      {["Date", "Check In", "Check Out", "Status"].map(h => (
                        <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(attendance as Array<Record<string, unknown>>).slice(0, 30).map((a, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-600">{fmtDate(String(a.date))}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{a.check_in ? String(a.check_in).split("T")[1]?.slice(0,5) : "-"}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{a.check_out ? String(a.check_out).split("T")[1]?.slice(0,5) : "-"}</td>
                        <td className="px-6 py-3 text-sm capitalize text-gray-600">{String(a.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {tab === "payslips" && (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-6 py-4">
                  <h2 className="font-semibold text-gray-900">Payslips</h2>
                </div>
                <table className="w-full text-left">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      {["Month/Year", "Basic", "Allowances", "Deductions", "Net Pay", "Status"].map(h => (
                        <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(payslips as Array<Record<string, unknown>>).map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-6 py-3 text-sm text-gray-900">{String(p.month)}/{String(p.year)}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">₹{Number(p.basic).toLocaleString("en-IN")}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">₹{Number(p.allowances).toLocaleString("en-IN")}</td>
                        <td className="px-6 py-3 text-sm text-red-600">₹{Number(p.deductions).toLocaleString("en-IN")}</td>
                        <td className="px-6 py-3 text-sm font-bold text-gray-900">₹{Number(p.net_pay).toLocaleString("en-IN")}</td>
                        <td className="px-6 py-3 text-sm capitalize text-gray-600">{String(p.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </PageLayout>
  );
}
