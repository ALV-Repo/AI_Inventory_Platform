"use client";

import { useState } from "react";

export default function GSTFilingPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("August 2026");

  const handlePrepareReturn = () => {
    alert(
      `GST return preparation started for ${selectedPeriod}.`
    );
  };

  const handleGenerateReport = () => {
    alert(
      `GST report generated for ${selectedPeriod}.`
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-7xl">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              GST Filing
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage GST returns, tax summaries and filing information.
            </p>
          </div>

          <div className="flex items-center gap-3">

            <select
              value={selectedPeriod}
              onChange={(e) =>
                setSelectedPeriod(e.target.value)
              }
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
            >
              <option>August 2026</option>
              <option>July 2026</option>
              <option>June 2026</option>
              <option>May 2026</option>
            </select>

            <button
              onClick={handlePrepareReturn}
              className="rounded-lg bg-[#12213a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1b3153]"
            >
              Prepare Return
            </button>

          </div>

        </div>


        {/* =====================================================
            STATUS
        ====================================================== */}

        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

            <div>

              <div className="flex items-center gap-2">

                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />

                <h2 className="text-sm font-semibold text-gray-900">
                  GST filing is active
                </h2>

              </div>

              <p className="mt-1 text-xs text-gray-600">
                Current filing period: {selectedPeriod}
              </p>

            </div>

            <div className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-green-700 shadow-sm">
              Ready for preparation
            </div>

          </div>

        </div>


        {/* =====================================================
            SUMMARY CARDS
        ====================================================== */}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            title="Taxable Sales"
            value="₹9,69,006"
            subtitle="Current period"
          />

          <SummaryCard
            title="GST Collected"
            value="₹1,98,670"
            subtitle="Output tax"
          />

          <SummaryCard
            title="Input Tax Credit"
            value="₹76,420"
            subtitle="Available credit"
          />

          <SummaryCard
            title="Tax Payable"
            value="₹1,22,250"
            subtitle="After input credit"
            warning
          />

        </div>


        {/* =====================================================
            GST RETURN SUMMARY
        ====================================================== */}

        <div className="mb-6 grid gap-6 lg:grid-cols-3">

          {/* RETURN DETAILS */}

          <div className="rounded-xl border bg-white shadow-sm lg:col-span-2">

            <div className="border-b px-6 py-5">

              <h2 className="text-sm font-semibold text-gray-900">
                Return Summary
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                GST information for {selectedPeriod}.
              </p>

            </div>

            <div className="p-6">

              <div className="grid gap-4 sm:grid-cols-2">

                <InfoRow
                  label="Business"
                  value="AI StockFlow"
                />

                <InfoRow
                  label="GST Registration"
                  value="Active"
                />

                <InfoRow
                  label="Filing Period"
                  value={selectedPeriod}
                />

                <InfoRow
                  label="Return Type"
                  value="GSTR-1 / GSTR-3B"
                />

                <InfoRow
                  label="Taxable Turnover"
                  value="₹9,69,006"
                />

                <InfoRow
                  label="Total Output GST"
                  value="₹1,98,670"
                />

                <InfoRow
                  label="Input Tax Credit"
                  value="₹76,420"
                />

                <InfoRow
                  label="Net Tax Payable"
                  value="₹1,22,250"
                />

              </div>

            </div>

          </div>


          {/* FILING STATUS */}

          <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b px-6 py-5">

              <h2 className="text-sm font-semibold text-gray-900">
                Filing Status
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Current return progress
              </p>

            </div>

            <div className="space-y-5 p-6">

              <StatusItem
                title="Sales data"
                status="Completed"
              />

              <StatusItem
                title="Tax calculation"
                status="Completed"
              />

              <StatusItem
                title="Input tax credit"
                status="Completed"
              />

              <StatusItem
                title="Return preparation"
                status="Pending"
                pending
              />

              <StatusItem
                title="GST filing"
                status="Not filed"
                pending
              />

            </div>

          </div>

        </div>


        {/* =====================================================
            GST RETURNS TABLE
        ====================================================== */}

        <div className="mb-6 rounded-xl border bg-white shadow-sm">

          <div className="flex flex-col justify-between gap-3 border-b px-6 py-5 md:flex-row md:items-center">

            <div>

              <h2 className="text-sm font-semibold text-gray-900">
                GST Returns
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Filing history and current return status.
              </p>

            </div>

            <button
              onClick={handleGenerateReport}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Generate GST Report
            </button>

          </div>


          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead className="border-b bg-gray-50">

                <tr className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">

                  <th className="px-6 py-4">
                    Period
                  </th>

                  <th className="px-6 py-4">
                    Return
                  </th>

                  <th className="px-6 py-4">
                    Taxable Value
                  </th>

                  <th className="px-6 py-4">
                    GST Amount
                  </th>

                  <th className="px-6 py-4">
                    Due Date
                  </th>

                  <th className="px-6 py-4">
                    Status
                  </th>

                  <th className="px-6 py-4">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                <GSTTableRow
                  period="July 2026"
                  returnType="GSTR-1"
                  taxable="₹8,45,200"
                  gst="₹1,52,136"
                  dueDate="11 Aug 2026"
                  status="Filed"
                />

                <GSTTableRow
                  period="July 2026"
                  returnType="GSTR-3B"
                  taxable="₹8,45,200"
                  gst="₹1,52,136"
                  dueDate="20 Aug 2026"
                  status="Filed"
                />

                <GSTTableRow
                  period="August 2026"
                  returnType="GSTR-1"
                  taxable="₹9,69,006"
                  gst="₹1,98,670"
                  dueDate="11 Sep 2026"
                  status="Pending"
                />

                <GSTTableRow
                  period="August 2026"
                  returnType="GSTR-3B"
                  taxable="₹9,69,006"
                  gst="₹1,98,670"
                  dueDate="20 Sep 2026"
                  status="Pending"
                />

              </tbody>

            </table>

          </div>

        </div>


        {/* =====================================================
            GST BREAKDOWN
        ====================================================== */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* TAX BREAKDOWN */}

          <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b px-6 py-5">

              <h2 className="text-sm font-semibold text-gray-900">
                Tax Breakdown
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                GST collected during the current period.
              </p>

            </div>

            <div className="p-6">

              <div className="space-y-4">

                <TaxRow
                  label="CGST"
                  value="₹99,335"
                />

                <TaxRow
                  label="SGST"
                  value="₹99,335"
                />

                <TaxRow
                  label="IGST"
                  value="₹0"
                />

                <div className="border-t pt-4">

                  <div className="flex items-center justify-between">

                    <span className="text-sm font-semibold text-gray-900">
                      Total GST
                    </span>

                    <span className="text-sm font-bold text-gray-900">
                      ₹1,98,670
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>


          {/* QUICK ACTIONS */}

          <div className="rounded-xl border bg-white shadow-sm">

            <div className="border-b px-6 py-5">

              <h2 className="text-sm font-semibold text-gray-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Common GST operations.
              </p>

            </div>

            <div className="grid gap-3 p-6 sm:grid-cols-2">

              <ActionButton
                title="Prepare GSTR-1"
                description="Prepare outward supply return"
                onClick={handlePrepareReturn}
              />

              <ActionButton
                title="Prepare GSTR-3B"
                description="Prepare summary return"
                onClick={handlePrepareReturn}
              />

              <ActionButton
                title="Generate Report"
                description="Create GST report"
                onClick={handleGenerateReport}
              />

              <ActionButton
                title="Filing History"
                description="View previous filings"
                onClick={() =>
                  alert("Filing history opened.")
                }
              />

            </div>

          </div>

        </div>


        {/* =====================================================
            FOOTER
        ====================================================== */}

        <div className="py-8 text-center text-[10px] text-gray-400">
          AI StockFlow • GST Management
        </div>

      </div>

    </main>
  );
}


/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  title,
  value,
  subtitle,
  warning = false,
}: {
  title: string;
  value: string;
  subtitle: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">

      <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
        {title}
      </p>

      <p
        className={`mt-2 text-xl font-bold ${
          warning
            ? "text-orange-600"
            : "text-gray-900"
        }`}
      >
        {value}
      </p>

      <p className="mt-1 text-[10px] text-gray-500">
        {subtitle}
      </p>

    </div>
  );
}


/* ============================================================
   INFO ROW
============================================================ */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border bg-gray-50 p-4">

      <p className="text-[9px] uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-gray-800">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   STATUS ITEM
============================================================ */

function StatusItem({
  title,
  status,
  pending = false,
}: {
  title: string;
  status: string;
  pending?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div
          className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
            pending
              ? "bg-yellow-50 text-yellow-600"
              : "bg-green-50 text-green-600"
          }`}
        >
          {pending ? "!" : "✓"}
        </div>

        <span className="text-xs font-medium text-gray-700">
          {title}
        </span>

      </div>

      <span
        className={`text-[9px] font-semibold ${
          pending
            ? "text-yellow-600"
            : "text-green-600"
        }`}
      >
        {status}
      </span>

    </div>
  );
}


/* ============================================================
   GST TABLE ROW
============================================================ */

function GSTTableRow({
  period,
  returnType,
  taxable,
  gst,
  dueDate,
  status,
}: {
  period: string;
  returnType: string;
  taxable: string;
  gst: string;
  dueDate: string;
  status: string;
}) {
  const filed = status === "Filed";

  return (
    <tr className="border-b last:border-0 hover:bg-gray-50">

      <td className="px-6 py-4 text-xs font-semibold text-gray-900">
        {period}
      </td>

      <td className="px-6 py-4 text-xs text-gray-700">
        {returnType}
      </td>

      <td className="px-6 py-4 text-xs text-gray-700">
        {taxable}
      </td>

      <td className="px-6 py-4 text-xs font-semibold text-gray-900">
        {gst}
      </td>

      <td className="px-6 py-4 text-xs text-gray-500">
        {dueDate}
      </td>

      <td className="px-6 py-4">

        <span
          className={`rounded-full px-3 py-1 text-[9px] font-semibold ${
            filed
              ? "bg-green-50 text-green-700"
              : "bg-yellow-50 text-yellow-700"
          }`}
        >
          {status}
        </span>

      </td>

      <td className="px-6 py-4">

        <button
          onClick={() =>
            alert(
              `${returnType} for ${period}`
            )
          }
          className="text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          View
        </button>

      </td>

    </tr>
  );
}


/* ============================================================
   TAX ROW
============================================================ */

function TaxRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">

      <span className="text-xs text-gray-600">
        {label}
      </span>

      <span className="text-sm font-semibold text-gray-900">
        {value}
      </span>

    </div>
  );
}


/* ============================================================
   ACTION BUTTON
============================================================ */

function ActionButton({
  title,
  description,
  onClick,
}: {
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border bg-gray-50 p-4 text-left transition hover:border-blue-300 hover:bg-blue-50"
    >

      <p className="text-xs font-semibold text-gray-900">
        {title}
      </p>

      <p className="mt-1 text-[9px] text-gray-500">
        {description}
      </p>

    </button>
  );
}