"use client";

import { useMemo, useState } from "react";

type PayslipStatus = "Paid" | "Processing" | "Pending";

type Payslip = {
  id: string;
  month: string;
  year: number;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  payDate: string;
  status: PayslipStatus;
  basic: number;
  hra: number;
  specialAllowance: number;
  conveyance: number;
  medical: number;
  bonus: number;
  pf: number;
  professionalTax: number;
  tds: number;
  otherDeductions: number;
};

const payslips: Payslip[] = [
  {
    id: "PS-2026-08",
    month: "August",
    year: 2026,
    employeeId: "EMP-001",
    employeeName: "Rahul Sharma",
    department: "Engineering",
    designation: "Senior Software Engineer",
    payDate: "31 Aug 2026",
    status: "Processing",
    basic: 50000,
    hra: 20000,
    specialAllowance: 12000,
    conveyance: 3000,
    medical: 2500,
    bonus: 5000,
    pf: 6000,
    professionalTax: 200,
    tds: 4500,
    otherDeductions: 500,
  },
  {
    id: "PS-2026-07",
    month: "July",
    year: 2026,
    employeeId: "EMP-001",
    employeeName: "Rahul Sharma",
    department: "Engineering",
    designation: "Senior Software Engineer",
    payDate: "31 Jul 2026",
    status: "Paid",
    basic: 50000,
    hra: 20000,
    specialAllowance: 12000,
    conveyance: 3000,
    medical: 2500,
    bonus: 3000,
    pf: 6000,
    professionalTax: 200,
    tds: 4200,
    otherDeductions: 500,
  },
  {
    id: "PS-2026-06",
    month: "June",
    year: 2026,
    employeeId: "EMP-001",
    employeeName: "Rahul Sharma",
    department: "Engineering",
    designation: "Senior Software Engineer",
    payDate: "30 Jun 2026",
    status: "Paid",
    basic: 50000,
    hra: 20000,
    specialAllowance: 12000,
    conveyance: 3000,
    medical: 2500,
    bonus: 2500,
    pf: 6000,
    professionalTax: 200,
    tds: 4000,
    otherDeductions: 500,
  },
  {
    id: "PS-2026-05",
    month: "May",
    year: 2026,
    employeeId: "EMP-001",
    employeeName: "Rahul Sharma",
    department: "Engineering",
    designation: "Senior Software Engineer",
    payDate: "31 May 2026",
    status: "Paid",
    basic: 50000,
    hra: 20000,
    specialAllowance: 12000,
    conveyance: 3000,
    medical: 2500,
    bonus: 2000,
    pf: 6000,
    professionalTax: 200,
    tds: 3900,
    otherDeductions: 500,
  },
  {
    id: "PS-2026-04",
    month: "April",
    year: 2026,
    employeeId: "EMP-001",
    employeeName: "Rahul Sharma",
    department: "Engineering",
    designation: "Senior Software Engineer",
    payDate: "30 Apr 2026",
    status: "Paid",
    basic: 50000,
    hra: 20000,
    specialAllowance: 12000,
    conveyance: 3000,
    medical: 2500,
    bonus: 1500,
    pf: 6000,
    professionalTax: 200,
    tds: 3800,
    otherDeductions: 500,
  },
];

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const getEarnings = (payslip: Payslip) =>
  payslip.basic +
  payslip.hra +
  payslip.specialAllowance +
  payslip.conveyance +
  payslip.medical +
  payslip.bonus;

const getDeductions = (payslip: Payslip) =>
  payslip.pf +
  payslip.professionalTax +
  payslip.tds +
  payslip.otherDeductions;

const getNetSalary = (payslip: Payslip) =>
  getEarnings(payslip) - getDeductions(payslip);

function StatusBadge({ status }: { status: PayslipStatus }) {
  const styles: Record<PayslipStatus, string> = {
    Paid: "bg-emerald-100 text-emerald-700",
    Processing: "bg-amber-100 text-amber-700",
    Pending: "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  description,
  valueClass = "text-slate-950",
}: {
  label: string;
  value: string;
  description: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className={`mt-2 text-2xl font-bold ${valueClass}`}>{value}</p>

      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

export default function PayslipsPage() {
  const [selectedId, setSelectedId] = useState("PS-2026-08");
  const [selectedYear, setSelectedYear] = useState("2026");
  const [search, setSearch] = useState("");
  const [showPayslip, setShowPayslip] = useState(false);
  const [showDownloadMessage, setShowDownloadMessage] = useState(false);

  const filteredPayslips = useMemo(() => {
    const query = search.trim().toLowerCase();

    return payslips.filter((payslip) => {
      const matchesYear =
        selectedYear === "All" || String(payslip.year) === selectedYear;

      const matchesSearch =
        !query ||
        payslip.month.toLowerCase().includes(query) ||
        payslip.employeeName.toLowerCase().includes(query) ||
        payslip.employeeId.toLowerCase().includes(query) ||
        payslip.id.toLowerCase().includes(query);

      return matchesYear && matchesSearch;
    });
  }, [search, selectedYear]);

  const selectedPayslip =
    payslips.find((payslip) => payslip.id === selectedId) ||
    filteredPayslips[0] ||
    payslips[0];

  const totalGross = getEarnings(selectedPayslip);
  const totalDeductions = getDeductions(selectedPayslip);
  const netSalary = getNetSalary(selectedPayslip);

  const yearlyGross = payslips
    .filter((payslip) => payslip.year === 2026)
    .reduce((total, payslip) => total + getEarnings(payslip), 0);

  const yearlyNet = payslips
    .filter((payslip) => payslip.year === 2026)
    .reduce((total, payslip) => total + getNetSalary(payslip), 0);

  const handleSelectPayslip = (id: string) => {
    setSelectedId(id);
    setShowPayslip(false);
  };

  const handleDownload = () => {
    setShowDownloadMessage(true);

    window.setTimeout(() => {
      setShowDownloadMessage(false);
    }, 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-7">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950">
              Payslips
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View employee salary statements, earnings, deductions and
              download payslips.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
              <option value="All">All Years</option>
            </select>

            <button
              onClick={handlePrint}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Print
            </button>
          </div>
        </div>

        {/* Download notification */}
        {showDownloadMessage && (
          <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Payslip download prepared successfully for{" "}
            <strong>
              {selectedPayslip.month} {selectedPayslip.year}
            </strong>
            .
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Current Net Salary"
            value={formatCurrency(netSalary)}
            description={`${selectedPayslip.month} ${selectedPayslip.year}`}
            valueClass="text-blue-600"
          />

          <SummaryCard
            label="Gross Salary"
            value={formatCurrency(totalGross)}
            description="Total monthly earnings"
            valueClass="text-slate-950"
          />

          <SummaryCard
            label="Total Deductions"
            value={formatCurrency(totalDeductions)}
            description="PF, tax and other deductions"
            valueClass="text-orange-600"
          />

          <SummaryCard
            label="Year-to-Date Net"
            value={formatCurrency(yearlyNet)}
            description={`2026 · ${payslips.length} payslips`}
            valueClass="text-emerald-600"
          />
        </div>

        {/* Employee information */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                RS
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  {selectedPayslip.employeeName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {selectedPayslip.employeeId} ·{" "}
                  {selectedPayslip.department}
                </p>

                <p className="text-sm text-slate-500">
                  {selectedPayslip.designation}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 px-5 py-3">
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                Payment Date
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-900">
                {selectedPayslip.payDate}
              </p>
            </div>
          </div>
        </section>

        {/* Search */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search month, employee, payslip number..."
                className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500"
              />
            </div>

            <button
              onClick={() => setSearch("")}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </section>

        {/* Payslip history */}
        <section className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-lg font-semibold text-slate-950">
              Payslip History
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filteredPayslips.length} payslip
              {filteredPayslips.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200">
                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Payslip
                  </th>

                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Employee
                  </th>

                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Pay Date
                  </th>

                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Gross
                  </th>

                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Deductions
                  </th>

                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Net Salary
                  </th>

                  <th className="px-6 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPayslips.map((payslip) => (
                  <tr
                    key={payslip.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-semibold text-slate-900">
                        {payslip.id}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {payslip.month} {payslip.year}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-800">
                        {payslip.employeeName}
                      </p>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {payslip.employeeId}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm text-slate-600">
                      {payslip.payDate}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      {formatCurrency(getEarnings(payslip))}
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-orange-600">
                      {formatCurrency(getDeductions(payslip))}
                    </td>

                    <td className="px-6 py-4 text-sm font-bold text-emerald-600">
                      {formatCurrency(getNetSalary(payslip))}
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={payslip.status} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            handleSelectPayslip(payslip.id)
                          }
                          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          View
                        </button>

                        <button
                          onClick={() => {
                            setSelectedId(payslip.id);
                            handleDownload();
                          }}
                          className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
                        >
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredPayslips.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-12 text-center"
                    >
                      <p className="text-sm font-medium text-slate-700">
                        No payslips found
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Try changing the year or search text.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

                {/* Selected Payslip Preview */}
        <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-6 py-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">
                Payslip Preview
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Detailed salary statement for {selectedPayslip.month}{" "}
                {selectedPayslip.year}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowPayslip(true)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                View Payslip
              </button>

              <button
                onClick={handlePrint}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Print
              </button>

              <button
                onClick={handleDownload}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Download Payslip
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Payslip Header */}
            <div className="rounded-xl border border-slate-200">
              <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
                      AI
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        AI StockFlow
                      </h3>

                      <p className="text-xs text-slate-500">
                        Enterprise Inventory & Operations Platform
                      </p>
                    </div>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Salary Slip
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-950">
                    {selectedPayslip.month} {selectedPayslip.year}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    {selectedPayslip.id}
                  </p>
                </div>
              </div>

              {/* Employee Details */}
              <div className="grid grid-cols-1 gap-4 p-6 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Employee Name
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedPayslip.employeeName}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Employee ID
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedPayslip.employeeId}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Department
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedPayslip.department}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Designation
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedPayslip.designation}
                  </p>
                </div>
              </div>

              {/* Earnings and Deductions */}
              <div className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-2">
                {/* Earnings */}
                <div className="rounded-xl border border-slate-200">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h3 className="text-sm font-semibold text-slate-950">
                      Earnings
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Monthly salary components
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm text-slate-600">
                        Basic Salary
                      </span>

                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(selectedPayslip.basic)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm text-slate-600">HRA</span>

                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(selectedPayslip.hra)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm text-slate-600">
                        Special Allowance
                      </span>

                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(selectedPayslip.specialAllowance)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm text-slate-600">
                        Conveyance Allowance
                      </span>

                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(selectedPayslip.conveyance)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm text-slate-600">
                        Medical Allowance
                      </span>

                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(selectedPayslip.medical)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm text-slate-600">
                        Bonus
                      </span>

                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(selectedPayslip.bonus)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-emerald-50 px-5 py-4">
                      <span className="text-sm font-semibold text-slate-900">
                        Gross Earnings
                      </span>

                      <span className="text-sm font-bold text-emerald-700">
                        {formatCurrency(totalGross)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="rounded-xl border border-slate-200">
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h3 className="text-sm font-semibold text-slate-950">
                      Deductions
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Statutory and other deductions
                    </p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm text-slate-600">
                        Provident Fund
                      </span>

                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(selectedPayslip.pf)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm text-slate-600">
                        Professional Tax
                      </span>

                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(selectedPayslip.professionalTax)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm text-slate-600">
                        TDS
                      </span>

                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(selectedPayslip.tds)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between px-5 py-3">
                      <span className="text-sm text-slate-600">
                        Other Deductions
                      </span>

                      <span className="text-sm font-medium text-slate-900">
                        {formatCurrency(selectedPayslip.otherDeductions)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-orange-50 px-5 py-4">
                      <span className="text-sm font-semibold text-slate-900">
                        Total Deductions
                      </span>

                      <span className="text-sm font-bold text-orange-700">
                        {formatCurrency(totalDeductions)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="mx-6 mb-6 rounded-xl bg-slate-900 p-6 text-white">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-300">
                      Net Salary Payable
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {formatCurrency(netSalary)}
                    </p>

                    <p className="mt-1 text-xs text-slate-300">
                      Gross earnings minus total deductions
                    </p>
                  </div>

                  <div className="rounded-lg bg-white/10 px-5 py-3">
                    <p className="text-[11px] uppercase tracking-wide text-slate-300">
                      Payment Status
                    </p>

                    <div className="mt-2">
                      <StatusBadge status={selectedPayslip.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="grid grid-cols-1 gap-4 border-t border-slate-200 p-6 md:grid-cols-3">
                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Pay Date
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {selectedPayslip.payDate}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Payment Mode
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Bank Transfer
                  </p>
                </div>

                <div>
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Currency
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    INR (₹)
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-200 px-6 py-4">
                <p className="text-center text-[11px] text-slate-400">
                  This is a system-generated payslip. No physical signature is
                  required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Yearly Summary */}
        <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <SummaryCard
            label="Yearly Gross Earnings"
            value={formatCurrency(yearlyGross)}
            description="Total gross earnings in 2026"
            valueClass="text-slate-950"
          />

          <SummaryCard
            label="Yearly Net Salary"
            value={formatCurrency(yearlyNet)}
            description="Total take-home salary in 2026"
            valueClass="text-emerald-600"
          />

          <SummaryCard
            label="Payslips Generated"
            value={String(payslips.length)}
            description="Available salary statements"
            valueClass="text-blue-600"
          />
        </section>

        {/* Information Note */}
        <section className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              i
            </div>

            <div>
              <h3 className="text-sm font-semibold text-blue-900">
                Payslip Information
              </h3>

              <p className="mt-1 text-xs leading-5 text-blue-700">
                Employees can view their monthly salary details, including
                earnings, deductions and net salary. Payslips can also be
                printed or downloaded for personal records.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* View Payslip Modal */}
      {showPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-lg font-bold text-slate-950">
                  Payslip Details
                </h2>

                <p className="text-xs text-slate-500">
                  {selectedPayslip.id}
                </p>
              </div>

              <button
                onClick={() => setShowPayslip(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="rounded-xl border border-slate-200">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        AI StockFlow
                      </h3>

                      <p className="text-xs text-slate-500">
                        Employee Salary Statement
                      </p>
                    </div>

                    <div className="text-left md:text-right">
                      <p className="text-xs text-slate-500">
                        Salary Month
                      </p>

                      <p className="text-sm font-bold text-slate-900">
                        {selectedPayslip.month} {selectedPayslip.year}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-slate-400">
                      Employee
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedPayslip.employeeName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Employee ID
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedPayslip.employeeId}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Department
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedPayslip.department}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400">
                      Pay Date
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedPayslip.payDate}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 border-t border-slate-200 p-5 md:grid-cols-2">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-xs font-semibold text-slate-500">
                      Gross Earnings
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-950">
                      {formatCurrency(totalGross)}
                    </p>
                  </div>

                  <div className="rounded-lg bg-orange-50 p-4">
                    <p className="text-xs font-semibold text-orange-600">
                      Total Deductions
                    </p>

                    <p className="mt-2 text-xl font-bold text-orange-700">
                      {formatCurrency(totalDeductions)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200 bg-emerald-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Net Salary
                  </p>

                  <p className="mt-2 text-3xl font-bold text-emerald-700">
                    {formatCurrency(netSalary)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2">
                <button
                  onClick={() => setShowPayslip(false)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>

                <button
                  onClick={handlePrint}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Print
                </button>

                <button
                  onClick={handleDownload}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}