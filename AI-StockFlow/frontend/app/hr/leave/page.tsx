"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PageLayout from "../../../components/layout/PageLayout";
import { api, fmtDate } from "../../../lib/api";

type LeaveRequest = {
  id: number;
  employee_id: number;
  leave_type: string;
  from_date: string;
  to_date: string;
  days: number;
  reason?: string;
  status: string;
  approved_by?: number;
  created_at: string;
};

const statusColor = (s: string) => ({
  pending: "bg-yellow-50 text-yellow-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-700",
}[s.toLowerCase()] ?? "bg-gray-100 text-gray-700");

export default function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await api.hrm.leaveRequests({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setRequests(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: number, action: "approve" | "reject") {
    try {
      setActionLoading(id);
      if (action === "approve") await api.hrm.approveLeave(id);
      else await api.hrm.rejectLeave(id);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setActionLoading(null);
    }
  }

  const summary = {
    pending: requests.filter(r => r.status === "pending").length,
    approved: requests.filter(r => r.status === "approved").length,
    rejected: requests.filter(r => r.status === "rejected").length,
  };

  return (
    <PageLayout>
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="mt-1 text-sm text-gray-500">Approve and manage employee leave requests</p>
        </div>

        {/* Sub-nav */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {[
            { label: "Employees", href: "/hr" },
            { label: "Attendance", href: "/hr/attendance" },
            { label: "Leave", href: "/hr/leave" },
            { label: "Payslips", href: "/hr/payslips" },
          ].map(({ label, href }) => (
            <Link key={href} href={href} className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${href === "/hr/leave" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"}`}>
              {label}
            </Link>
          ))}
        </div>

        {error && <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {[
            { label: "Pending Approval", value: summary.pending, color: "text-yellow-600" },
            { label: "Approved", value: summary.approved, color: "text-green-600" },
            { label: "Rejected", value: summary.rejected, color: "text-red-600" },
          ].map(c => (
            <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-gray-500">{c.label}</p>
              <p className={`mt-2 text-2xl font-bold ${c.color}`}>{loading ? "..." : c.value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="mb-5 flex gap-2">
          {["all", "pending", "approved", "rejected"].map(s => (
            <button key={s} onClick={() => { setStatusFilter(s); load(); }}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition ${statusFilter === s ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
              <p className="text-sm text-gray-500">Loading leave requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">🏖️</p>
              <p className="text-gray-500 text-sm">No leave requests found</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {["Employee", "Leave Type", "From", "To", "Days", "Reason", "Status", "Actions"].map(h => (
                    <th key={h} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-mono text-gray-600">EMP-{r.employee_id}</td>
                    <td className="px-5 py-4 text-sm text-gray-900 capitalize">{r.leave_type}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{fmtDate(r.from_date)}</td>
                    <td className="px-5 py-4 text-sm text-gray-600">{fmtDate(r.to_date)}</td>
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{r.days}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 max-w-[160px] truncate">{r.reason ?? "-"}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {r.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(r.id, "approve")}
                            disabled={actionLoading === r.id}
                            className="rounded-lg bg-green-600 px-3 py-1 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {actionLoading === r.id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => handleAction(r.id, "reject")}
                            disabled={actionLoading === r.id}
                            className="rounded-lg bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      )}
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
