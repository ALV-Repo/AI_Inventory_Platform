"use client";

import { useMemo, useState } from "react";

type LeaveStatus = "Pending" | "Approved" | "Rejected";

type LeaveRequest = {
  id: string;
  employee: string;
  department: string;
  leaveType: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
};

const initialRequests: LeaveRequest[] = [
  {
    id: "LR-2026-001",
    employee: "Rahul Sharma",
    department: "Engineering",
    leaveType: "Casual Leave",
    from: "22 Aug 2026",
    to: "23 Aug 2026",
    days: 2,
    reason: "Personal work",
    status: "Pending",
  },
  {
    id: "LR-2026-002",
    employee: "Priya Sharma",
    department: "IT",
    leaveType: "Sick Leave",
    from: "20 Aug 2026",
    to: "20 Aug 2026",
    days: 1,
    reason: "Not feeling well",
    status: "Pending",
  },
  {
    id: "LR-2026-003",
    employee: "Arjun Rao",
    department: "Sales",
    leaveType: "Annual Leave",
    from: "18 Aug 2026",
    to: "20 Aug 2026",
    days: 3,
    reason: "Family vacation",
    status: "Approved",
  },
  {
    id: "LR-2026-004",
    employee: "Sneha Reddy",
    department: "Warehouse",
    leaveType: "Casual Leave",
    from: "15 Aug 2026",
    to: "16 Aug 2026",
    days: 2,
    reason: "Personal work",
    status: "Rejected",
  },
];

const leaveBalances = [
  {
    name: "Annual Leave",
    used: 6,
    total: 24,
    color: "bg-blue-600",
  },
  {
    name: "Casual Leave",
    used: 4,
    total: 12,
    color: "bg-emerald-500",
  },
  {
    name: "Sick Leave",
    used: 1,
    total: 10,
    color: "bg-purple-500",
  },
];

function StatusBadge({ status }: { status: LeaveStatus }) {
  const styles = {
    Pending: "bg-amber-100 text-amber-700",
    Approved: "bg-emerald-100 text-emerald-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function LeaveBalanceCard({
  name,
  used,
  total,
  color,
}: {
  name: string;
  used: number;
  total: number;
  color: string;
}) {
  const remaining = total - used;
  const percentage = Math.round((remaining / total) * 100);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-800">{name}</p>

          <p className="mt-1 text-xs text-slate-500">
            {remaining} days remaining
          </p>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold text-slate-900">
            {remaining}
          </p>

          <p className="text-xs text-slate-400">
            of {total} days
          </p>
        </div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {used} days used
      </p>
    </div>
  );
}

export default function LeaveManagementPage() {
  const [requests, setRequests] =
    useState<LeaveRequest[]>(initialRequests);

  const [activeTab, setActiveTab] = useState<
    "Overview" | "My Leave" | "Manager Approval"
  >("Overview");

  const [showForm, setShowForm] = useState(false);

  const [employee, setEmployee] = useState("Rahul Sharma");
  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reason, setReason] = useState("");

  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "Pending"),
    [requests]
  );

  const approvedRequests = useMemo(
    () =>
      requests.filter(
        (request) => request.status === "Approved"
      ),
    [requests]
  );

  const rejectedRequests = useMemo(
    () =>
      requests.filter(
        (request) => request.status === "Rejected"
      ),
    [requests]
  );

  const totalApprovedDays = approvedRequests.reduce(
    (sum, request) => sum + request.days,
    0
  );

  const calculateDays = () => {
    if (!fromDate || !toDate) return 1;

    const start = new Date(fromDate);
    const end = new Date(toDate);

    const difference =
      end.getTime() - start.getTime();

    if (difference < 0) return 0;

    return (
      Math.floor(
        difference / (1000 * 60 * 60 * 24)
      ) + 1
    );
  };

  const submitLeaveRequest = () => {
    if (!fromDate || !toDate || !reason.trim()) {
      alert("Please fill all leave request fields.");
      return;
    }

    const days = calculateDays();

    if (days <= 0) {
      alert("Please select a valid date range.");
      return;
    }

    const newRequest: LeaveRequest = {
      id: `LR-2026-${String(requests.length + 1).padStart(
        3,
        "0"
      )}`,
      employee,
      department:
        employee === "Rahul Sharma"
          ? "Engineering"
          : "IT",
      leaveType,
      from: new Date(fromDate).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),
      to: new Date(toDate).toLocaleDateString(
        "en-GB",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      ),
      days,
      reason,
      status: "Pending",
    };

    setRequests((current) => [
      newRequest,
      ...current,
    ]);

    setFromDate("");
    setToDate("");
    setReason("");
    setShowForm(false);
    setActiveTab("My Leave");

    alert("Leave request submitted successfully.");
  };

  const updateRequestStatus = (
    id: string,
    status: "Approved" | "Rejected"
  ) => {
    setRequests((current) =>
      current.map((request) =>
        request.id === id
          ? { ...request, status }
          : request
      )
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-6">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Leave Management
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage employee leave balances, requests and approvals.
            </p>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            + New Leave Request
          </button>
        </div>

        {/* Summary Cards */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Annual Leave
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              18
            </p>

            <p className="mt-1 text-xs text-slate-500">
              of 24 days available
            </p>

            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-blue-600"
                style={{ width: "75%" }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Casual Leave
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              8
            </p>

            <p className="mt-1 text-xs text-slate-500">
              of 12 days available
            </p>

            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-emerald-500"
                style={{ width: "67%" }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Sick Leave
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              9
            </p>

            <p className="mt-1 text-xs text-slate-500">
              of 10 days available
            </p>

            <div className="mt-4 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-purple-500"
                style={{ width: "90%" }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Pending Approval
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-500">
              {pendingRequests.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              requests waiting for review
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <div className="flex flex-wrap gap-1">

            {(
              [
                "Overview",
                "My Leave",
                "Manager Approval",
              ] as const
            ).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-lg px-5 py-2.5 text-sm font-semibold ${
                  activeTab === tab
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab}

                {tab === "Manager Approval" &&
                  pendingRequests.length > 0 && (
                    <span
                      className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                        activeTab === tab
                          ? "bg-white text-slate-900"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {pendingRequests.length}
                    </span>
                  )}
              </button>
            ))}
          </div>
        </div>

        {/* New Leave Request Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">

            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    New Leave Request
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Submit a leave request for manager approval.
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(false)}
                  className="text-xl text-slate-400 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* Employee */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Employee
                  </label>

                  <select
                    value={employee}
                    onChange={(e) =>
                      setEmployee(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option>Rahul Sharma</option>
                    <option>Priya Sharma</option>
                    <option>Arjun Rao</option>
                    <option>Sneha Reddy</option>
                  </select>
                </div>

                {/* Leave Type */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Leave Type
                  </label>

                  <select
                    value={leaveType}
                    onChange={(e) =>
                      setLeaveType(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    <option>Casual Leave</option>
                    <option>Annual Leave</option>
                    <option>Sick Leave</option>
                    <option>Emergency Leave</option>
                  </select>
                </div>

                {/* From */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    From Date
                  </label>

                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) =>
                      setFromDate(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* To */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    To Date
                  </label>

                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) =>
                      setToDate(e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* Reason */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Reason
                  </label>

                  <textarea
                    value={reason}
                    onChange={(e) =>
                      setReason(e.target.value)
                    }
                    rows={4}
                    placeholder="Enter reason for leave..."
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Days */}
              {fromDate && toDate && (
                <div className="mt-4 rounded-lg bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">
                    Requested leave duration
                  </p>

                  <p className="mt-1 text-xl font-bold text-blue-900">
                    {calculateDays()}{" "}
                    {calculateDays() === 1
                      ? "day"
                      : "days"}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">

                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={submitLeaveRequest}
                  className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Submit Request
                </button>

              </div>
            </div>
          </div>
        )}

        {/* Overview */}
        {activeTab === "Overview" && (
          <>
            <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">

              {/* Leave Balance */}
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">

                <h2 className="text-lg font-bold text-slate-900">
                  Leave Balance
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Current year leave availability.
                </p>

                <div className="mt-5 space-y-4">
                  {leaveBalances.map((balance) => (
                    <LeaveBalanceCard
                      key={balance.name}
                      {...balance}
                    />
                  ))}
                </div>
              </section>

              {/* Recent Requests */}
              <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Recent Leave Requests
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Latest employee leave activity.
                    </p>
                  </div>

                  <button
                    onClick={() =>
                      setActiveTab("My Leave")
                    }
                    className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                  >
                    View all
                  </button>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[700px] text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                        <th className="pb-3">Employee</th>
                        <th className="pb-3">Leave Type</th>
                        <th className="pb-3">Dates</th>
                        <th className="pb-3">Days</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {requests.map((request) => (
                        <tr
                          key={request.id}
                          className="border-b border-slate-100 last:border-0"
                        >
                          <td className="py-4">
                            <p className="text-sm font-semibold text-slate-900">
                              {request.employee}
                            </p>

                            <p className="text-xs text-slate-400">
                              {request.department}
                            </p>
                          </td>

                          <td className="py-4 text-sm text-slate-700">
                            {request.leaveType}
                          </td>

                          <td className="py-4 text-sm text-slate-700">
                            {request.from}
                            <br />
                            <span className="text-xs text-slate-400">
                              to {request.to}
                            </span>
                          </td>

                          <td className="py-4 text-sm font-semibold text-slate-900">
                            {request.days}
                          </td>

                          <td className="py-4">
                            <StatusBadge
                              status={request.status}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            {/* Bottom Stats */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Approved Requests
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-600">
                  {approvedRequests.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {totalApprovedDays} total approved days
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Pending Requests
                </p>

                <p className="mt-2 text-2xl font-bold text-orange-500">
                  {pendingRequests.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Waiting for manager approval
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Rejected Requests
                </p>

                <p className="mt-2 text-2xl font-bold text-red-500">
                  {rejectedRequests.length}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Requests that were rejected
                </p>
              </div>

            </div>
          </>
        )}

                {/* My Leave */}
        {activeTab === "My Leave" && (
          <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    My Leave Requests
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    View your submitted leave requests and their approval status.
                  </p>
                </div>

                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  + New Leave Request
                </button>
              </div>
            </div>

            <div className="overflow-x-auto p-6">
              <table className="w-full min-w-[900px] text-left">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="pb-4">Request</th>
                    <th className="pb-4">Leave Type</th>
                    <th className="pb-4">Dates</th>
                    <th className="pb-4">Days</th>
                    <th className="pb-4">Reason</th>
                    <th className="pb-4">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="py-4">
                        <p className="text-sm font-semibold text-slate-900">
                          {request.id}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {request.employee}
                        </p>
                      </td>

                      <td className="py-4">
                        <span className="text-sm font-medium text-slate-700">
                          {request.leaveType}
                        </span>
                      </td>

                      <td className="py-4">
                        <p className="text-sm text-slate-700">
                          {request.from}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          to {request.to}
                        </p>
                      </td>

                      <td className="py-4">
                        <span className="font-semibold text-slate-900">
                          {request.days}
                        </span>
                      </td>

                      <td className="max-w-[220px] py-4">
                        <p className="truncate text-sm text-slate-600">
                          {request.reason}
                        </p>
                      </td>

                      <td className="py-4">
                        <StatusBadge status={request.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Manager Approval */}
        {activeTab === "Manager Approval" && (
          <section className="mt-6">

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 p-6">
                <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Manager Approval
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Review employee leave requests and approve or reject them.
                    </p>
                  </div>

                  <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {pendingRequests.length} Pending
                  </span>
                </div>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="p-12 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
                    ✓
                  </div>

                  <h3 className="mt-4 text-base font-bold text-slate-900">
                    No pending requests
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    All leave requests have been reviewed.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 p-6">

                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-xl border border-amber-200 bg-amber-50/40 p-5"
                    >

                      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">

                        {/* Request information */}
                        <div className="flex-1">

                          <div className="flex flex-wrap items-center gap-3">

                            <p className="text-sm font-bold text-slate-900">
                              {request.id}
                            </p>

                            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              Pending Approval
                            </span>
                          </div>

                          <div className="mt-3">

                            <p className="text-base font-semibold text-slate-900">
                              {request.employee}
                            </p>

                            <p className="mt-1 text-sm text-slate-500">
                              {request.department}
                            </p>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400">
                                Leave Type
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {request.leaveType}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400">
                                From
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {request.from}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400">
                                To
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {request.to}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-400">
                                Duration
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-800">
                                {request.days}{" "}
                                {request.days === 1 ? "day" : "days"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 rounded-lg bg-white p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                              Reason
                            </p>

                            <p className="mt-1 text-sm text-slate-700">
                              {request.reason}
                            </p>
                          </div>
                        </div>

                        {/* Approval Actions */}
                        <div className="flex shrink-0 gap-3 lg:flex-col">

                          <button
                            onClick={() =>
                              updateRequestStatus(
                                request.id,
                                "Rejected"
                              )
                            }
                            className="rounded-lg border border-red-300 bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </button>

                          <button
                            onClick={() =>
                              updateRequestStatus(
                                request.id,
                                "Approved"
                              )
                            }
                            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approval Information */}
            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">

              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-600">
                  Pending
                </p>

                <p className="mt-2 text-2xl font-bold text-amber-700">
                  {pendingRequests.length}
                </p>

                <p className="mt-1 text-xs text-amber-600">
                  Requests waiting for manager review
                </p>
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">
                  Approved
                </p>

                <p className="mt-2 text-2xl font-bold text-emerald-700">
                  {approvedRequests.length}
                </p>

                <p className="mt-1 text-xs text-emerald-600">
                  Requests approved successfully
                </p>
              </div>

              <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="text-xs font-medium uppercase tracking-wide text-red-600">
                  Rejected
                </p>

                <p className="mt-2 text-2xl font-bold text-red-700">
                  {rejectedRequests.length}
                </p>

                <p className="mt-1 text-xs text-red-600">
                  Requests rejected by manager
                </p>
              </div>

            </div>
          </section>
        )}

        {/* Leave Management Information */}
        <section className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              i
            </div>

            <div>
              <h3 className="text-sm font-bold text-blue-900">
                Leave Management
              </h3>

              <p className="mt-1 text-sm leading-6 text-blue-700">
                Employees can submit leave requests for manager approval.
                Managers can review pending requests and approve or reject
                them. Leave balances are displayed based on the current
                year allocation.
              </p>
            </div>

          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 text-center">

          <p className="text-xs text-slate-400">
            AI StockFlow • HR Leave Management
          </p>

        </footer>

      </div>
    </main>
  );
}