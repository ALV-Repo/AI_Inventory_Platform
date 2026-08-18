"use client";

import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../services/dashboard.service";
import { getStockMovements } from "../../services/inventory.service";
import { getSales } from "../../services/sales.service";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("Inventory Report");

  const [data, setData] = useState<any>(null);
  const [movements, setMovements] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  // ============================================================
  // LOAD REPORT DATA
  // ============================================================

  useEffect(() => {
    async function loadReports() {
      setLoading(true);
      setError("");

      // ========================================================
      // Dashboard Summary
      // ========================================================

      try {
        const dashboardData = await getDashboardSummary(30);
        setData(dashboardData);
      } catch (err) {
        console.error("Dashboard report error:", err);
        setError("Unable to load dashboard report data.");
      }

      // ========================================================
      // Stock Movements
      // ========================================================

      try {
        const movementData = await getStockMovements();
        setMovements(movementData);
      } catch (err) {
        console.error("Stock movement error:", err);
        setError("Unable to load stock movement data.");
      }

      // ========================================================
      // Sales
      // ========================================================

      try {
        const salesData = await getSales(50);
        setSales(salesData);
      } catch (err) {
        console.error("Sales report error:", err);
        setError("Unable to load sales report data.");
      }

      setLoading(false);
    }

    loadReports();
  }, []);

  // ============================================================
  // GENERATE REPORT
  // ============================================================

  const handleGenerateReport = () => {
    if (!data) {
      alert("Report data is still loading. Please wait.");
      return;
    }

    setGenerating(true);

    const stockValue = Number(data?.inventory?.value || 0);
    const revenue = Number(data?.period?.revenue || 0);
    const margin = Number(data?.period?.margin_pct || 0);
    const skuCount = Number(data?.inventory?.sku_count || 0);
    const lowStockCount = Number(
      data?.inventory?.low_stock_count || 0
    );

    const reportWindow = window.open("", "_blank");

    if (!reportWindow) {
      alert("Please allow pop-ups to generate the report.");
      setGenerating(false);
      return;
    }

    const generatedAt = new Date().toLocaleString("en-IN");

    // ==========================================================
    // STOCK MOVEMENT ROWS
    // ==========================================================

    const movementRows = movements
      .slice(0, 20)
      .map(
        (movement) => `
          <tr>
            <td>${movement.product_id ?? "-"}</td>
            <td>${movement.warehouse_id ?? "-"}</td>
            <td>${movement.type ?? "-"}</td>
            <td>${movement.quantity ?? "-"}</td>
            <td>${movement.reason ?? "-"}</td>
          </tr>
        `
      )
      .join("");

    // ==========================================================
    // SALES ROWS
    // ==========================================================

    const salesRows = sales
      .slice(0, 20)
      .map(
        (sale) => `
          <tr>
            <td>${sale.order_number ?? "-"}</td>

            <td>
              ${
                sale.date
                  ? new Date(sale.date).toLocaleDateString("en-IN")
                  : "-"
              }
            </td>

            <td>${sale.channel ?? "-"}</td>

            <td>${sale.payment_mode ?? "-"}</td>

            <td>
              ₹${Number(sale.total || 0).toLocaleString("en-IN")}
            </td>

            <td>
              ₹${Number(
                sale.gross_profit || 0
              ).toLocaleString("en-IN")}
            </td>
          </tr>
        `
      )
      .join("");

    // ==========================================================
    // REPORT HTML
    // ==========================================================

    reportWindow.document.write(`
      <!DOCTYPE html>

      <html>

        <head>

          <title>
            AI StockFlow - ${reportType}
          </title>

          <style>

            * {
              box-sizing: border-box;
            }

            body {
              font-family:
                Arial,
                Helvetica,
                sans-serif;

              margin: 0;

              padding: 40px;

              color: #111827;

              background: white;
            }

            .header {
              border-bottom:
                2px solid #2563eb;

              padding-bottom: 20px;

              margin-bottom: 30px;
            }

            .brand {
              font-size: 28px;

              font-weight: 700;

              color: #2563eb;
            }

            .title {
              font-size: 22px;

              font-weight: 700;

              margin-top: 12px;

              color: #111827;
            }

            .subtitle {
              color: #6b7280;

              margin-top: 6px;

              font-size: 14px;
            }

            .date {
              color: #6b7280;

              font-size: 12px;

              margin-top: 8px;
            }

            .summary {
              display: grid;

              grid-template-columns:
                repeat(3, 1fr);

              gap: 15px;

              margin-bottom: 30px;
            }

            .card {
              border:
                1px solid #e5e7eb;

              border-radius: 8px;

              padding: 18px;

              background: #f9fafb;
            }

            .label {
              font-size: 12px;

              color: #6b7280;
            }

            .value {
              font-size: 20px;

              font-weight: 700;

              margin-top: 8px;

              color: #111827;
            }

            h2 {
              font-size: 18px;

              margin-top: 30px;

              margin-bottom: 12px;

              color: #111827;
            }

            table {
              width: 100%;

              border-collapse: collapse;

              margin-top: 10px;
            }

            th {
              background: #f3f4f6;

              text-align: left;

              font-size: 12px;

              padding: 10px;

              border-bottom:
                1px solid #d1d5db;
            }

            td {
              padding: 10px;

              font-size: 12px;

              border-bottom:
                1px solid #e5e7eb;
            }

            .status-good {
              color: #15803d;

              font-weight: 600;
            }

            .status-warning {
              color: #ea580c;

              font-weight: 600;
            }

            .footer {
              margin-top: 40px;

              padding-top: 15px;

              border-top:
                1px solid #e5e7eb;

              color: #6b7280;

              font-size: 11px;
            }

            .print-button {
              position: fixed;

              top: 20px;

              right: 20px;

              padding: 10px 18px;

              background: #2563eb;

              color: white;

              border: none;

              border-radius: 6px;

              cursor: pointer;

              font-weight: 600;
            }

            .print-button:hover {
              background: #1d4ed8;
            }

            @media print {

              body {
                padding: 20px;
              }

              .no-print {
                display: none !important;
              }

            }

          </style>

        </head>

        <body>

          <button
            class="print-button no-print"
            onclick="window.print()"
          >
            Print / Save PDF
          </button>

          <!-- =================================================
               HEADER
          ================================================== -->

          <div class="header">

            <div class="brand">
              AI StockFlow
            </div>

            <div class="title">
              ${reportType}
            </div>

            <div class="subtitle">
              AI StockFlow business intelligence report
            </div>

            <div class="date">
              Generated on: ${generatedAt}
            </div>

          </div>


          <!-- =================================================
               SUMMARY CARDS
          ================================================== -->

          <div class="summary">

            <div class="card">

              <div class="label">
                Total Stock Value
              </div>

              <div class="value">
                ₹${stockValue.toLocaleString("en-IN")}
              </div>

            </div>


            <div class="card">

              <div class="label">
                Revenue - 30 Days
              </div>

              <div class="value">
                ₹${revenue.toLocaleString("en-IN")}
              </div>

            </div>


            <div class="card">

              <div class="label">
                Gross Margin
              </div>

              <div class="value">
                ${margin}%
              </div>

            </div>

          </div>


          <!-- =================================================
               BUSINESS SUMMARY
          ================================================== -->

          <h2>
            Business Summary
          </h2>


          <table>

            <thead>

              <tr>

                <th>
                  Metric
                </th>

                <th>
                  Current
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>


            <tbody>

              <tr>

                <td>
                  Inventory Health
                </td>

                <td>
                  ${skuCount}
                </td>

                <td class="status-good">
                  Healthy
                </td>

              </tr>


              <tr>

                <td>
                  Products Requiring Reorder
                </td>

                <td>
                  ${lowStockCount}
                </td>

                <td class="status-warning">
                  Attention
                </td>

              </tr>


              <tr>

                <td>
                  Gross Margin
                </td>

                <td>
                  ${margin}%
                </td>

                <td class="status-good">
                  Good
                </td>

              </tr>


              <tr>

                <td>
                  Stock Movements
                </td>

                <td>
                  ${movements.length}
                </td>

                <td class="status-good">
                  Tracked
                </td>

              </tr>


              <tr>

                <td>
                  Sales Orders
                </td>

                <td>
                  ${sales.length}
                </td>

                <td class="status-good">
                  Tracked
                </td>

              </tr>

            </tbody>

          </table>


          <!-- =================================================
               STOCK MOVEMENT REPORT
          ================================================== -->

          ${
            reportType === "Stock Movement"
              ? `

                <h2>
                  Recent Stock Movements
                </h2>

                <table>

                  <thead>

                    <tr>

                      <th>
                        Product ID
                      </th>

                      <th>
                        Warehouse
                      </th>

                      <th>
                        Type
                      </th>

                      <th>
                        Quantity
                      </th>

                      <th>
                        Reason
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    ${movementRows}

                  </tbody>

                </table>

              `
              : ""
          }


          <!-- =================================================
               SALES REPORT
          ================================================== -->

          ${
            reportType === "Sales Report"
              ? `

                <h2>
                  Recent Sales
                </h2>

                <table>

                  <thead>

                    <tr>

                      <th>
                        Order Number
                      </th>

                      <th>
                        Date
                      </th>

                      <th>
                        Channel
                      </th>

                      <th>
                        Payment
                      </th>

                      <th>
                        Total
                      </th>

                      <th>
                        Gross Profit
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    ${salesRows}

                  </tbody>

                </table>

              `
              : ""
          }


          <!-- =================================================
               INVENTORY REPORT
          ================================================== -->

          ${
            reportType === "Inventory Report"
              ? `

                <h2>
                  Inventory Overview
                </h2>

                <table>

                  <thead>

                    <tr>

                      <th>
                        Metric
                      </th>

                      <th>
                        Value
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    <tr>

                      <td>
                        Total SKUs
                      </td>

                      <td>
                        ${skuCount}
                      </td>

                      <td class="status-good">
                        Healthy
                      </td>

                    </tr>


                    <tr>

                      <td>
                        Low Stock Products
                      </td>

                      <td>
                        ${lowStockCount}
                      </td>

                      <td class="status-warning">
                        Attention
                      </td>

                    </tr>


                    <tr>

                      <td>
                        Total Stock Value
                      </td>

                      <td>
                        ₹${stockValue.toLocaleString("en-IN")}
                      </td>

                      <td class="status-good">
                        Tracked
                      </td>

                    </tr>

                  </tbody>

                </table>

              `
              : ""
          }


          <!-- =================================================
               PURCHASE REPORT
          ================================================== -->

          ${
            reportType === "Purchase Report"
              ? `

                <h2>
                  Purchase Overview
                </h2>

                <table>

                  <thead>

                    <tr>

                      <th>
                        Metric
                      </th>

                      <th>
                        Value
                      </th>

                      <th>
                        Status
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    <tr>

                      <td>
                        Purchase Orders
                      </td>

                      <td>
                        12
                      </td>

                      <td class="status-good">
                        Tracked
                      </td>

                    </tr>


                    <tr>

                      <td>
                        Products Requiring Reorder
                      </td>

                      <td>
                        ${lowStockCount}
                      </td>

                      <td class="status-warning">
                        Attention
                      </td>

                    </tr>

                  </tbody>

                </table>

              `
              : ""
          }


          <!-- =================================================
               FOOTER
          ================================================== -->

          <div class="footer">

            AI StockFlow
            •
            Secure Business Management
            •
            ${generatedAt}

          </div>


        </body>

      </html>
    `);

    reportWindow.document.close();

    setGenerating(false);
  };

  // ============================================================
  // REPORT CARDS
  // ============================================================

  const reports = [
    {
      title: "Inventory Report",
      description:
        "Overview of stock levels, inventory value and availability.",
      value: data
        ? `${data.inventory?.sku_count || 0} SKUs`
        : "Loading...",
    },

    {
      title: "Sales Report",
      description:
        "Revenue, orders and sales performance for your business.",
      value: data
        ? `₹${Number(
            data.period?.revenue || 0
          ).toLocaleString("en-IN")}`
        : "Loading...",
    },

    {
      title: "Purchase Report",
      description:
        "Purchase orders, suppliers and procurement activity.",
      value: "12 Orders",
    },

    {
      title: "Stock Movement",
      description:
        "Products moving in and out of your inventory.",
      value: loading
        ? "Loading..."
        : `${movements.length} Movements`,
    },
  ];

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-gray-50 p-6">

      <div className="mx-auto max-w-7xl">

        {/* ======================================================
            HEADER
        ======================================================= */}

        <div className="mb-6 flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold text-gray-900">
              Reports
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Business and inventory reports
            </p>

          </div>


          {/* ====================================================
              GENERATE REPORT BUTTON
          ==================================================== */}

          <button
            onClick={handleGenerateReport}
            disabled={loading || generating}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating
              ? "Generating..."
              : "Generate Report"}
          </button>

        </div>


        {/* ======================================================
            ERROR
        ======================================================= */}

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}


        {/* ======================================================
            REPORT CARDS
        ======================================================= */}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">

          {reports.map((report) => (

            <button
              key={report.title}
              onClick={() =>
                setReportType(report.title)
              }
              className={`rounded-xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                reportType === report.title
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-200"
              }`}
            >

              <div className="mb-4 flex items-center justify-between">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  📊
                </div>

                <span className="text-xs font-medium text-blue-600">
                  VIEW
                </span>

              </div>


              <h2 className="font-semibold text-gray-900">
                {report.title}
              </h2>


              <p className="mt-2 text-xs leading-5 text-gray-500">
                {report.description}
              </p>


              <p className="mt-4 text-lg font-bold text-gray-900">
                {report.value}
              </p>

            </button>

          ))}

        </div>


        {/* ======================================================
            SELECTED REPORT
        ======================================================= */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white shadow-sm">

          {/* ====================================================
              REPORT HEADER
          ==================================================== */}

          <div className="flex items-center justify-between border-b border-gray-200 p-5">

            <div>

              <h2 className="text-lg font-semibold text-gray-900">
                {reportType}
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                AI StockFlow business intelligence report
              </p>

            </div>


            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
              {loading ? "Loading" : "Ready"}
            </span>

          </div>


          {/* ====================================================
              SUMMARY
          ==================================================== */}

          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">

            {/* STOCK VALUE */}

            <div className="rounded-lg bg-gray-50 p-4">

              <p className="text-xs text-gray-500">
                Total Stock Value
              </p>

              <p className="mt-2 text-xl font-bold text-gray-900">

                {loading
                  ? "Loading..."
                  : `₹${Number(
                      data?.inventory?.value || 0
                    ).toLocaleString("en-IN")}`}

              </p>

            </div>


            {/* REVENUE */}

            <div className="rounded-lg bg-gray-50 p-4">

              <p className="text-xs text-gray-500">
                Revenue - 30 Days
              </p>

              <p className="mt-2 text-xl font-bold text-gray-900">

                {loading
                  ? "Loading..."
                  : `₹${Number(
                      data?.period?.revenue || 0
                    ).toLocaleString("en-IN")}`}

              </p>

            </div>


            {/* MARGIN */}

            <div className="rounded-lg bg-gray-50 p-4">

              <p className="text-xs text-gray-500">
                Gross Margin
              </p>

              <p className="mt-2 text-xl font-bold text-gray-900">

                {loading
                  ? "Loading..."
                  : `${data?.period?.margin_pct || 0}%`}

              </p>

            </div>

          </div>


          {/* ====================================================
              REPORT TABLE
          ==================================================== */}

          <div className="overflow-x-auto px-5 pb-5">

            <table className="w-full border-collapse text-sm">

              <thead>

                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">

                  <th className="px-3 py-3 font-medium">
                    Metric
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Current
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {/* INVENTORY HEALTH */}

                <tr className="border-b border-gray-100">

                  <td className="px-3 py-4 font-medium text-gray-900">
                    Inventory Health
                  </td>

                  <td className="px-3 py-4 text-gray-600">

                    {loading
                      ? "Loading..."
                      : data?.inventory?.sku_count || 0}

                  </td>

                  <td className="px-3 py-4">

                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                      Healthy
                    </span>

                  </td>

                  <td className="px-3 py-4 text-blue-600">
                    Review
                  </td>

                </tr>


                {/* REORDER */}

                <tr className="border-b border-gray-100">

                  <td className="px-3 py-4 font-medium text-gray-900">
                    Products Requiring Reorder
                  </td>

                  <td className="px-3 py-4 text-gray-600">

                    {loading
                      ? "Loading..."
                      : data?.inventory?.low_stock_count || 0}

                  </td>

                  <td className="px-3 py-4">

                    <span className="rounded-full bg-orange-50 px-2 py-1 text-xs text-orange-700">
                      Attention
                    </span>

                  </td>

                  <td className="px-3 py-4 text-blue-600">
                    View
                  </td>

                </tr>


                {/* GROSS MARGIN */}

                <tr className="border-b border-gray-100">

                  <td className="px-3 py-4 font-medium text-gray-900">
                    Gross Margin
                  </td>

                  <td className="px-3 py-4 text-gray-600">

                    {loading
                      ? "Loading..."
                      : `${data?.period?.margin_pct || 0}%`}

                  </td>

                  <td className="px-3 py-4">

                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                      Good
                    </span>

                  </td>

                  <td className="px-3 py-4 text-blue-600">
                    Analyze
                  </td>

                </tr>


                {/* STOCK MOVEMENTS */}

                <tr className="border-b border-gray-100">

                  <td className="px-3 py-4 font-medium text-gray-900">
                    Stock Movements
                  </td>

                  <td className="px-3 py-4 text-gray-600">

                    {loading
                      ? "Loading..."
                      : movements.length}

                  </td>

                  <td className="px-3 py-4">

                    <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                      Tracked
                    </span>

                  </td>

                  <td className="px-3 py-4 text-blue-600">
                    View
                  </td>

                </tr>


                {/* SALES ORDERS */}

                <tr className="border-b border-gray-100">

                  <td className="px-3 py-4 font-medium text-gray-900">
                    Sales Orders
                  </td>

                  <td className="px-3 py-4 text-gray-600">

                    {loading
                      ? "Loading..."
                      : sales.length}

                  </td>

                  <td className="px-3 py-4">

                    <span className="rounded-full bg-green-50 px-2 py-1 text-xs text-green-700">
                      Tracked
                    </span>

                  </td>

                  <td className="px-3 py-4 text-blue-600">
                    View
                  </td>

                </tr>

              </tbody>

            </table>

          </div>


          {/* ====================================================
              STOCK MOVEMENT DETAILS
          ==================================================== */}

          {reportType === "Stock Movement" && (

            <div className="border-t border-gray-200 p-5">

              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Recent Stock Movements
              </h3>


              {loading ? (

                <p className="text-sm text-gray-500">
                  Loading stock movements...
                </p>

              ) : movements.length === 0 ? (

                <p className="text-sm text-gray-500">
                  No stock movements found.
                </p>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full border-collapse text-sm">

                    <thead>

                      <tr className="border-b border-gray-200 text-left text-xs text-gray-500">

                        <th className="px-3 py-3 font-medium">
                          Product ID
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Warehouse
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Type
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Quantity
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Reason
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {movements
                        .slice(0, 20)
                        .map((movement, index) => (

                          <tr
                            key={
                              movement.id || index
                            }
                            className="border-b border-gray-100"
                          >

                            <td className="px-3 py-4 text-gray-700">
                              {movement.product_id}
                            </td>

                            <td className="px-3 py-4 text-gray-700">
                              {movement.warehouse_id}
                            </td>

                            <td className="px-3 py-4">

                              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                                {movement.type}
                              </span>

                            </td>

                            <td
                              className={`px-3 py-4 font-medium ${
                                Number(
                                  movement.quantity
                                ) >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {movement.quantity}
                            </td>

                            <td className="px-3 py-4 text-gray-600">
                              {movement.reason || "-"}
                            </td>

                          </tr>

                        ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}


          {/* ====================================================
              SALES DETAILS
          ==================================================== */}

          {reportType === "Sales Report" && (

            <div className="border-t border-gray-200 p-5">

              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Recent Sales
              </h3>


              {loading ? (

                <p className="text-sm text-gray-500">
                  Loading sales...
                </p>

              ) : sales.length === 0 ? (

                <p className="text-sm text-gray-500">
                  No sales found.
                </p>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full border-collapse text-sm">

                    <thead>

                      <tr className="border-b border-gray-200 text-left text-xs text-gray-500">

                        <th className="px-3 py-3 font-medium">
                          Order Number
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Date
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Channel
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Payment
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Total
                        </th>

                        <th className="px-3 py-3 font-medium">
                          Gross Profit
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {sales
                        .slice(0, 20)
                        .map((sale, index) => (

                          <tr
                            key={
                              sale.id || index
                            }
                            className="border-b border-gray-100"
                          >

                            <td className="px-3 py-4 text-gray-700">
                              {sale.order_number || "-"}
                            </td>

                            <td className="px-3 py-4 text-gray-700">

                              {sale.date
                                ? new Date(
                                    sale.date
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "-"}

                            </td>

                            <td className="px-3 py-4">

                              <span className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700">
                                {sale.channel || "-"}
                              </span>

                            </td>

                            <td className="px-3 py-4 text-gray-700">
                              {sale.payment_mode || "-"}
                            </td>

                            <td className="px-3 py-4 font-medium text-gray-900">

                              ₹
                              {Number(
                                sale.total || 0
                              ).toLocaleString(
                                "en-IN"
                              )}

                            </td>

                            <td className="px-3 py-4 font-medium text-green-600">

                              ₹
                              {Number(
                                sale.gross_profit || 0
                              ).toLocaleString(
                                "en-IN"
                              )}

                            </td>

                          </tr>

                        ))}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}

        </div>

      </div>

    </main>
  );
}