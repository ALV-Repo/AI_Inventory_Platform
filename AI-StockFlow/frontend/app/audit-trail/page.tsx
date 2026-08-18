"use client";

import { useMemo, useState } from "react";

type AuditLog = {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  module: string;
  description: string;
  status: "Success" | "Warning" | "Failed";
  ip: string;
};

const auditLogs: AuditLog[] = [
  {
    id: "AUD-1001",
    timestamp: "18/08/2026 15:12",
    user: "Rahul Kumar",
    role: "Admin",
    action: "Updated",
    module: "Inventory",
    description: "Updated stock quantity for Hot Wheels Track Set",
    status: "Success",
    ip: "192.168.1.101",
  },
  {
    id: "AUD-1002",
    timestamp: "18/08/2026 14:58",
    user: "Vikram Singh",
    role: "Manager",
    action: "Created",
    module: "Sales",
    description: "Created new point of sale transaction",
    status: "Success",
    ip: "192.168.1.102",
  },
  {
    id: "AUD-1003",
    timestamp: "18/08/2026 14:42",
    user: "Sneha Patel",
    role: "Manager",
    action: "Updated",
    module: "Purchase Orders",
    description: "Updated purchase order PO-2026-018",
    status: "Success",
    ip: "192.168.1.103",
  },
  {
    id: "AUD-1004",
    timestamp: "18/08/2026 14:30",
    user: "Ananya Rao",
    role: "Staff",
    action: "Viewed",
    module: "Customers",
    description: "Viewed customer purchase history",
    status: "Success",
    ip: "192.168.1.104",
  },
  {
    id: "AUD-1005",
    timestamp: "18/08/2026 13:55",
    user: "Arjun Mehta",
    role: "Admin",
    action: "Updated",
    module: "Finance",
    description: "Updated financial transaction TXN-1005",
    status: "Success",
    ip: "192.168.1.105",
  },
  {
    id: "AUD-1006",
    timestamp: "18/08/2026 13:28",
    user: "Priya Reddy",
    role: "Staff",
    action: "Created",
    module: "Customers",
    description: "Created new customer record",
    status: "Success",
    ip: "192.168.1.106",
  },
  {
    id: "AUD-1007",
    timestamp: "18/08/2026 12:46",
    user: "Rahul Kumar",
    role: "Admin",
    action: "Deleted",
    module: "Inventory",
    description: "Removed discontinued product from inventory",
    status: "Warning",
    ip: "192.168.1.101",
  },
  {
    id: "AUD-1008",
    timestamp: "18/08/2026 12:15",
    user: "Vikram Singh",
    role: "Manager",
    action: "Approved",
    module: "Purchase Orders",
    description: "Approved purchase order PO-2026-017",
    status: "Success",
    ip: "192.168.1.102",
  },
  {
    id: "AUD-1009",
    timestamp: "18/08/2026 11:52",
    user: "Sneha Patel",
    role: "Manager",
    action: "Exported",
    module: "Reports",
    description: "Exported monthly sales report",
    status: "Success",
    ip: "192.168.1.103",
  },
  {
    id: "AUD-1010",
    timestamp: "18/08/2026 11:24",
    user: "Unknown User",
    role: "Unknown",
    action: "Login",
    module: "Authentication",
    description: "Failed login attempt",
    status: "Failed",
    ip: "192.168.1.120",
  },
];

export default function AuditTrailPage() {
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All Modules");
  const [actionFilter, setActionFilter] = useState("All Actions");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const modules = [
    "All Modules",
    "Inventory",
    "Sales",
    "Purchase Orders",
    "Customers",
    "Finance",
    "Reports",
    "Authentication",
  ];

  const actions = [
    "All Actions",
    "Created",
    "Updated",
    "Deleted",
    "Viewed",
    "Approved",
    "Exported",
    "Login",
  ];

  const statuses = ["All Status", "Success", "Warning", "Failed"];

  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const searchText = search.toLowerCase();

      const matchesSearch =
        log.id.toLowerCase().includes(searchText) ||
        log.user.toLowerCase().includes(searchText) ||
        log.module.toLowerCase().includes(searchText) ||
        log.description.toLowerCase().includes(searchText) ||
        log.ip.toLowerCase().includes(searchText);

      const matchesModule =
        moduleFilter === "All Modules" || log.module === moduleFilter;

      const matchesAction =
        actionFilter === "All Actions" || log.action === actionFilter;

      const matchesStatus =
        statusFilter === "All Status" || log.status === statusFilter;

      return (
        matchesSearch &&
        matchesModule &&
        matchesAction &&
        matchesStatus
      );
    });
  }, [search, moduleFilter, actionFilter, statusFilter]);

  const totalEvents = auditLogs.length;
  const successfulEvents = auditLogs.filter(
    (log) => log.status === "Success"
  ).length;
  const warningEvents = auditLogs.filter(
    (log) => log.status === "Warning"
  ).length;
  const failedEvents = auditLogs.filter(
    (log) => log.status === "Failed"
  ).length;

  const clearFilters = () => {
    setSearch("");
    setModuleFilter("All Modules");
    setActionFilter("All Actions");
    setStatusFilter("All Status");
  };

  const getStatusClass = (status: AuditLog["status"]) => {
    if (status === "Success") {
      return "bg-green-100 text-green-700";
    }

    if (status === "Warning") {
      return "bg-orange-100 text-orange-700";
    }

    return "bg-red-100 text-red-700";
  };

  const getActionClass = (action: string) => {
    if (action === "Deleted") {
      return "text-red-600";
    }

    if (action === "Created" || action === "Approved") {
      return "text-green-600";
    }

    if (action === "Updated") {
      return "text-blue-600";
    }

    return "text-slate-700";
  };

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-6 py-7 text-slate-900">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Audit Trail
            </h1>

            <p className="mt-1 text-xs text-slate-500">
              Track system activity, user actions and important business events.
            </p>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {/* Status Banner */}
        <section className="mb-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />

                <p className="text-sm font-semibold text-slate-800">
                  Audit logging is active
                </p>
              </div>

              <p className="mt-1 text-[11px] text-slate-500">
                All important system activities are being recorded.
              </p>
            </div>

            <span className="rounded-full bg-white px-3 py-1 text-[10px] font-semibold text-green-600 shadow-sm">
              System protected
            </span>
          </div>
        </section>

        {/* Summary Cards */}
        <div className="mb-5 grid grid-cols-4 gap-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Total Events
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalEvents}
            </p>

            <p className="mt-1 text-[10px] text-slate-400">
              Recorded activities
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Successful
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {successfulEvents}
            </p>

            <p className="mt-1 text-[10px] text-green-600">
              Normal activities
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Warnings
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-500">
              {warningEvents}
            </p>

            <p className="mt-1 text-[10px] text-orange-500">
              Needs review
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">
              Failed Events
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {failedEvents}
            </p>

            <p className="mt-1 text-[10px] text-red-500">
              Security attention
            </p>
          </div>
        </div>

        {/* Filters */}
        <section className="mb-5 rounded-lg border border-slate-200 bg-white p-3">
          <div className="grid grid-cols-[1fr_170px_170px_170px_auto] gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user, action, module, event ID or IP..."
              className="rounded-md border border-slate-300 px-3 py-2 text-xs outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
            />

            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none"
            >
              {modules.map((module) => (
                <option key={module}>{module}</option>
              ))}
            </select>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none"
            >
              {actions.map((action) => (
                <option key={action}>{action}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs outline-none"
            >
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>

            <button
              onClick={clearFilters}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </section>

        {/* Audit Log Table */}
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-4">
            <h2 className="text-sm font-semibold">
              Activity Log
            </h2>

            <p className="mt-1 text-[10px] text-slate-400">
              Complete record of recent system activities
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left">
                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Event
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Date & Time
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    User
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Action
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Module
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Description
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-4 py-3 font-semibold text-slate-600">
                    IP Address
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-slate-100 transition hover:bg-slate-50"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {log.id}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                      {log.timestamp}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-800">
                        {log.user}
                      </p>

                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {log.role}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`font-semibold ${getActionClass(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {log.module}
                    </td>

                    <td className="min-w-[260px] px-4 py-3 text-slate-600">
                      {log.description}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getStatusClass(
                          log.status
                        )}`}
                      >
                        {log.status}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[10px] text-slate-500">
                      {log.ip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-700">
                No audit events found
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Try changing your search or filters.
              </p>
            </div>
          )}

          <div className="border-t border-slate-200 px-4 py-3">
            <p className="text-[10px] text-slate-500">
              Showing {filteredLogs.length} of {auditLogs.length} audit events
            </p>
          </div>
        </section>

        {/* Security Insights */}
        <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold">
            Security Insights
          </h2>

          <p className="mt-1 text-[10px] text-slate-400">
            Summary of recent audit activity
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-[10px] text-slate-400">
                Most Active Module
              </p>

              <p className="mt-2 text-base font-semibold">
                Inventory
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Highest number of recorded activities
              </p>
            </div>

            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-[10px] text-slate-400">
                Latest Activity
              </p>

              <p className="mt-2 text-base font-semibold">
                15:12
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Inventory stock updated
              </p>
            </div>

            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-[10px] text-slate-400">
                Security Alerts
              </p>

              <p className="mt-2 text-base font-semibold text-red-600">
                1 failed event
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                Review authentication activity
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}