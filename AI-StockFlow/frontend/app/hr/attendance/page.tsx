"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, fmtDate } from "../../../lib/api";

type AttendanceRecord = {
  id: number;
  employee_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  status: string;
  source: string;
};

const statusColor = (s: string) => ({
  present: "bg-green-50 text-green-700",
  absent: "bg-red-50 text-red-700",
  half_day: "bg-yellow-50 text-yellow-700",
  leave: "bg-blue-50 text-blue-700",
  holiday: "bg-purple-50 text-purple-700",
}[s.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => { load(); }, [dateFrom, dateTo]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.hrm.attendance({ date_from: dateFrom, date_to: dateTo });
      setRecords(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load attendance.");
    } finally {
      setLoading(false);
    }
  }

  const summary = {
    present: records.filter(r => r.status === "present").length,
    absent: records.filter(r => r.status === "absent").length,
    half_day: records.filter(r => r.status === "half_day").length,
    leave: records.filter(r => r.status === "leave").length,
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500">Daily attendance records</p>
        </div>

        {/* Sub-nav */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            { label: "Employees", href: "/hr" },
            { label: "Attendance", href: "/hr/attendance" },
            { label: "Leave", href: "/hr/leave" },
            { label: "Payslips", href: "/hr/payslips" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${href === "/hr/attendance" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {label}
            </Link>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Date filters */}
        <div className="mb-5 flex gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-500">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <button onClick={load} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">Refresh</button>
        </div>

        {/* Summary */}
        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            { label: "Present", value: summary.present, color: "text-green-600" },
            { label: "Absent", value: summary.absent, color: "text-red-600" },
            { label: "Half Day", value: summary.half_day, color: "text-yellow-600" },
            { label: "On Leave", value: summary.leave, color: "text-blue-600" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-2xl font-bold ${c.color}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading attendance...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-gray-500 text-sm">No attendance records for this period</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Employee ID", "Date", "Check In", "Check Out", "Status", "Source"].map(h => (
                    <th key={h} className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">EMP-{r.employee_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{fmtDate(r.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.check_in ? new Date(r.check_in).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{r.check_out ? new Date(r.check_out).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(r.status)}`}>
                        {r.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{r.source}</td>
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
