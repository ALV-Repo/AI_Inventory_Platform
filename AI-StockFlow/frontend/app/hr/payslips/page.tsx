"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, inr } from "../../../lib/api";

type Payslip = {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  working_days: number;
  present_days: number;
  basic: number;
  allowances: number;
  deductions: number;
  net_pay: number;
  status: string;
};

const MONTHS = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const statusColor = (s: string) => ({
  draft: "bg-gray-100 text-gray-700",
  approved: "bg-blue-50 text-blue-700",
  paid: "bg-green-50 text-green-700",
}[s.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);
  const [genForm, setGenForm] = useState({ employee_id: "", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [showGenForm, setShowGenForm] = useState(false);

  useEffect(() => { load(); }, [year]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.hrm.payslips({ year });
      setPayslips(data as Payslip[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load payslips.");
    } finally {
      setLoading(false);
    }
  }

  async function generatePayslip() {
    if (!genForm.employee_id) return;
    try {
      setGenerating(true);
      await api.hrm.generatePayslip(Number(genForm.employee_id), genForm.month, genForm.year);
      setShowGenForm(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to generate payslip.");
    } finally {
      setGenerating(false);
    }
  }

  const totalNetPay = payslips.reduce((a, p) => a + (p.net_pay || 0), 0);

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payslips</h1>
            <p className="mt-1 text-sm text-gray-500">Monthly payroll records</p>
          </div>
          <button onClick={() => setShowGenForm(true)} className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            + Generate Payslip
          </button>
        </div>

        {/* Sub-nav */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            { label: "Employees", href: "/hr" },
            { label: "Attendance", href: "/hr/attendance" },
            { label: "Leave", href: "/hr/leave" },
            { label: "Payslips", href: "/hr/payslips" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${href === "/hr/payslips" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {label}
            </Link>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Year filter + summary */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex gap-2">
            {[2024, 2025, 2026].map(y => (
              <button key={y} onClick={() => setYear(y)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${year === y ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                {y}
              </button>
            ))}
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-3 shadow-sm">
            <p className="text-sm text-gray-500">Total Net Pay ({year})</p>
            <p className="text-xl font-bold text-gray-900">{inr(totalNetPay)}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading payslips...</p>
            </div>
          ) : payslips.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">💰</p>
              <p className="text-gray-500 text-sm">No payslips for {year}</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Employee", "Period", "Working Days", "Present Days", "Basic", "Allowances", "Deductions", "Net Pay", "Status"].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payslips.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-mono text-gray-600">EMP-{p.employee_id}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900">{MONTHS[p.month]} {p.year}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.working_days}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{p.present_days}</td>
                    <td className="px-5 py-4 text-sm text-gray-900">{inr(p.basic)}</td>
                    <td className="px-5 py-4 text-sm text-green-600">{inr(p.allowances)}</td>
                    <td className="px-5 py-4 text-sm text-red-600">-{inr(p.deductions)}</td>
                    <td className="px-5 py-4 text-sm font-bold text-gray-900">{inr(p.net_pay)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColor(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Generate payslip modal */}
        {showGenForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowGenForm(false)}>
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="mb-4 text-xl font-bold text-gray-900">Generate Payslip</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Employee ID</label>
                  <input type="number" placeholder="e.g. 1" value={genForm.employee_id}
                    onChange={e => setGenForm(f => ({ ...f, employee_id: e.target.value }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Month</label>
                  <select value={genForm.month} onChange={e => setGenForm(f => ({ ...f, month: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500">
                    {MONTHS.slice(1).map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Year</label>
                  <input type="number" value={genForm.year}
                    onChange={e => setGenForm(f => ({ ...f, year: Number(e.target.value) }))}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={() => setShowGenForm(false)} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={generatePayslip} disabled={generating} className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                  {generating ? "Generating..." : "Generate"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
