"use client";

import { useMemo, useState } from "react";
import PageLayout from "../../components/layout/PageLayout";

type ReportType = "Overview" | "Sales" | "Inventory" | "Warehouse";
type UserRole = "Manager" | "Accountant" | "Cashier";

type SalesData = {
  month: string;
  sales: number;
  revenue: number;
  orders: number;
  units: number;
};

type Product = {
  name: string;
  sku: string;
  units: number;
  revenue: number;
  growth: number;
};

type LowStock = {
  name: string;
  sku: string;
  stock: number;
  reorder: number;
};

const salesData: SalesData[] = [
  { month: "Mar", sales: 145, revenue: 1850000, orders: 120, units: 820 },
  { month: "Apr", sales: 168, revenue: 2140000, orders: 142, units: 910 },
  { month: "May", sales: 182, revenue: 2390000, orders: 156, units: 980 },
  { month: "Jun", sales: 205, revenue: 2650000, orders: 174, units: 1120 },
  { month: "Jul", sales: 228, revenue: 2980000, orders: 192, units: 1260 },
  { month: "Aug", sales: 248, revenue: 3240000, orders: 205, units: 1380 },
];

const topProducts: Product[] = [
  {
    name: "Wireless Keyboard",
    sku: "KB-WL-001",
    units: 1240,
    revenue: 1860000,
    growth: 18,
  },
  {
    name: "USB Microphone",
    sku: "MIC-USB-002",
    units: 980,
    revenue: 1470000,
    growth: 14,
  },
  {
    name: "24-inch Monitor",
    sku: "MON-24-004",
    units: 760,
    revenue: 2280000,
    growth: 22,
  },
  {
    name: "Office Chair",
    sku: "CHA-OFC-003",
    units: 640,
    revenue: 1280000,
    growth: 9,
  },
  {
    name: "Storage Bins",
    sku: "BIN-ST-005",
    units: 520,
    revenue: 780000,
    growth: 7,
  },
];

const lowStockItems: LowStock[] = [
  {
    name: "Wireless Mouse",
    sku: "MOUSE-WL-008",
    stock: 12,
    reorder: 50,
  },
  {
    name: "HDMI Cable",
    sku: "HDMI-004",
    stock: 18,
    reorder: 60,
  },
  {
    name: "USB Hub",
    sku: "USB-HUB-009",
    stock: 24,
    reorder: 75,
  },
  {
    name: "Laptop Stand",
    sku: "STAND-012",
    stock: 31,
    reorder: 80,
  },
];

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function ReportsPage() {
  const [reportType, setReportType] =
    useState<ReportType>("Overview");

  const [dateRange, setDateRange] =
    useState("Last 6 Months");

  const [role, setRole] =
    useState<UserRole>("Manager");

  const [message, setMessage] =
    useState("");

  const totalSales = useMemo(
    () =>
      salesData.reduce(
        (total, item) => total + item.sales,
        0
      ),
    []
  );

  const totalRevenue = useMemo(
    () =>
      salesData.reduce(
        (total, item) => total + item.revenue,
        0
      ),
    []
  );

  const totalOrders = useMemo(
    () =>
      salesData.reduce(
        (total, item) => total + item.orders,
        0
      ),
    []
  );

  const totalUnits = useMemo(
    () =>
      salesData.reduce(
        (total, item) => total + item.units,
        0
      ),
    []
  );

  const maxSales = Math.max(
    ...salesData.map((item) => item.sales)
  );

  const paidValue = Math.round(totalRevenue * 0.76);
  const outstanding = Math.round(totalRevenue * 0.24);
  const expenses = Math.round(totalRevenue * 0.41);

  const roleDescription: Record<UserRole, string> = {
    Manager:
      "Overall business performance, sales, inventory and warehouse operations.",
    Accountant:
      "Financial performance, revenue, payments and accounting indicators.",
    Cashier:
      "Daily sales, POS orders, payments and transaction activity.",
  };

  const handleGenerate = () => {
    setMessage(
      `${reportType} report generated for ${role} for ${dateRange}.`
    );
  };

  const handleExport = () => {
    const csv = [
      ["Month", "Sales", "Revenue", "Orders", "Units"],
      ...salesData.map((item) => [
        item.month,
        item.sales,
        item.revenue,
        item.orders,
        item.units,
      ]),
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${role.toLowerCase()}-${reportType.toLowerCase()}-report.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    setMessage(`${role} report exported successfully.`);
  };

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f8fafc] px-4 py-6 text-slate-800 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          {/* HEADER */}
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Reports & Analytics
              </h1>

              <p className="mt-1 text-xs text-slate-500">
                Monitor sales, revenue, inventory and operational performance.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGenerate}
                className="rounded-md bg-[#10233f] px-4 py-2.5 text-[10px] font-semibold text-white hover:bg-[#183557]"
              >
                Generate Report
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* ROLE SELECTOR */}
          <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold">
                  Role-based Report View
                </h2>

                <p className="mt-1 text-[10px] text-slate-500">
                  Preview dashboard widgets according to the selected role.
                </p>
              </div>

              <span className="w-fit rounded-full bg-blue-50 px-3 py-1 text-[9px] font-semibold text-blue-700">
                FR-RPT-02
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  User Role
                </label>

                <select
                  value={role}
                  onChange={(e) =>
                    setRole(e.target.value as UserRole)
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-xs"
                >
                  <option value="Manager">Manager</option>
                  <option value="Accountant">Accountant</option>
                  <option value="Cashier">Cashier</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <div className="rounded-md bg-slate-50 px-4 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                    Current Role
                  </p>

                  <p className="mt-1 text-sm font-bold text-[#10233f]">
                    {role}
                  </p>

                  <p className="mt-1 text-[10px] text-slate-500">
                    {roleDescription[role]}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FILTERS */}
          <section className="mb-5 rounded-xl border border-slate-200 bg-white p-4">
            <div className="grid gap-4 md:grid-cols-3">

              <div>
                <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Report Type
                </label>

                <select
                  value={reportType}
                  onChange={(e) =>
                    setReportType(
                      e.target.value as ReportType
                    )
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-xs"
                >
                  <option value="Overview">
                    Overview Report
                  </option>

                  <option value="Sales">
                    Sales Report
                  </option>

                  <option value="Inventory">
                    Inventory Report
                  </option>

                  <option value="Warehouse">
                    Warehouse Report
                  </option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Date Range
                </label>

                <select
                  value={dateRange}
                  onChange={(e) =>
                    setDateRange(e.target.value)
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-xs"
                >
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                  <option>Last 3 Months</option>
                  <option>Last 6 Months</option>
                  <option>This Year</option>
                </select>
              </div>

              <div className="flex items-end">
                <div className="w-full rounded-md bg-slate-50 px-3 py-2.5">
                  <p className="text-[9px] uppercase text-slate-400">
                    Current Report
                  </p>

                  <p className="mt-1 text-xs font-semibold">
                    {reportType}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* MESSAGE */}
          {message && (
            <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
              <p className="text-[10px] font-medium text-blue-700">
                {message}
              </p>
            </div>
          )}

          {/* ======================================================
              MANAGER
          ====================================================== */}

          {role === "Manager" && (
            <>
              <RoleHeading
                title="Manager Dashboard"
                description="Business-wide operational overview."
              />

              <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiCard
                  title="Total Orders"
                  value={formatNumber(totalOrders)}
                  subtitle="Orders in selected period"
                  valueClass="text-blue-600"
                />

                <KpiCard
                  title="Total Sales"
                  value={formatNumber(totalSales)}
                  subtitle="Completed sales"
                  valueClass="text-green-600"
                />

                <KpiCard
                  title="Revenue"
                  value={formatCurrency(totalRevenue)}
                  subtitle="Total reported revenue"
                  valueClass="text-purple-600"
                />

                <KpiCard
                  title="Inventory Units"
                  value={formatNumber(totalUnits)}
                  subtitle="Units across inventory"
                  valueClass="text-orange-600"
                />
              </section>

              <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MiniCard title="Products" value="5,420" />
                <MiniCard title="Warehouses" value="6" />
                <MiniCard title="Customers" value="824" />
                <MiniCard
                  title="Low Stock"
                  value="37"
                  valueClass="text-red-600"
                />
              </section>

              <SalesTrend
                salesData={salesData}
                maxSales={maxSales}
                dateRange={dateRange}
              />

              <section className="mb-5 grid gap-5 lg:grid-cols-2">
                <TopProducts />
                <LowStockAlerts />
              </section>

              <section className="mb-5 grid gap-5 lg:grid-cols-2">
                <InventoryMovement
                  stockIn={970}
                  stockOut={127}
                />

                <PerformanceSummary />
              </section>
            </>
          )}

          {/* ======================================================
              ACCOUNTANT
          ====================================================== */}

          {role === "Accountant" && (
            <>
              <RoleHeading
                title="Accountant Dashboard"
                description="Financial reporting and payment monitoring."
              />

              <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiCard
                  title="Revenue"
                  value={formatCurrency(totalRevenue)}
                  subtitle="Total reported revenue"
                  valueClass="text-purple-600"
                />

                <KpiCard
                  title="Paid Value"
                  value={formatCurrency(paidValue)}
                  subtitle="Payments received"
                  valueClass="text-green-600"
                />

                <KpiCard
                  title="Outstanding"
                  value={formatCurrency(outstanding)}
                  subtitle="Pending customer value"
                  valueClass="text-orange-600"
                />

                <KpiCard
                  title="Expenses"
                  value={formatCurrency(expenses)}
                  subtitle="Operating expenses"
                  valueClass="text-red-600"
                />
              </section>

              <FinancialSummary
                totalRevenue={totalRevenue}
                paidValue={paidValue}
                outstanding={outstanding}
                expenses={expenses}
              />

              <SalesTrend
                salesData={salesData}
                maxSales={maxSales}
                dateRange={dateRange}
              />

              <section className="mb-5 grid gap-5 lg:grid-cols-2">
                <TopProducts />
                <PerformanceSummary />
              </section>
            </>
          )}

          {/* ======================================================
              CASHIER
          ====================================================== */}

          {role === "Cashier" && (
            <>
              <RoleHeading
                title="Cashier Dashboard"
                description="Daily sales, POS orders and payment activity."
              />

              <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiCard
                  title="Today's Orders"
                  value="42"
                  subtitle="Orders processed today"
                  valueClass="text-blue-600"
                />

                <KpiCard
                  title="Today's Sales"
                  value={formatCurrency(186500)}
                  subtitle="Sales generated today"
                  valueClass="text-green-600"
                />

                <KpiCard
                  title="Paid Orders"
                  value="35"
                  subtitle="Successfully paid orders"
                  valueClass="text-purple-600"
                />

                <KpiCard
                  title="Pending Payments"
                  value="7"
                  subtitle="Awaiting payment"
                  valueClass="text-orange-600"
                />
              </section>

              <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <MiniCard
                  title="POS Transactions"
                  value="58"
                />

                <MiniCard
                  title="Cash Payments"
                  value={formatCurrency(68500)}
                />

                <MiniCard
                  title="Card Payments"
                  value={formatCurrency(91200)}
                />

                <MiniCard
                  title="Refunds"
                  value={formatCurrency(3200)}
                  valueClass="text-red-600"
                />
              </section>

              <section className="mb-5 grid gap-5 lg:grid-cols-2">
                <CashierSummary />
                <PerformanceSummary />
              </section>
            </>
          )}

          {/* SALES REPORT */}
          <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold">
                  Sales Report
                </h2>

                <p className="mt-1 text-[10px] text-slate-500">
                  Monthly sales and revenue performance.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExport}
                className="rounded-md border border-slate-300 px-3 py-2 text-[9px] font-semibold hover:bg-slate-50"
              >
                Export
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <TableHead>Month</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Units</TableHead>
                  </tr>
                </thead>

                <tbody>
                  {salesData.map((item) => (
                    <tr
                      key={item.month}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <TableCell bold>
                        {item.month}
                      </TableCell>

                      <TableCell>
                        {formatNumber(item.sales)}
                      </TableCell>

                      <TableCell bold>
                        {formatCurrency(item.revenue)}
                      </TableCell>

                      <TableCell>
                        {formatNumber(item.orders)}
                      </TableCell>

                      <TableCell>
                        {formatNumber(item.units)}
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* TOP PRODUCTS */}
          {role !== "Cashier" && (
            <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-sm font-semibold">
                  Top Products
                </h2>

                <p className="mt-1 text-[10px] text-slate-500">
                  Best performing products by units and revenue.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[750px]">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Units Sold</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Growth</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {topProducts.map((product) => (
                      <tr
                        key={product.sku}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <TableCell bold>
                          {product.name}
                        </TableCell>

                        <TableCell muted>
                          {product.sku}
                        </TableCell>

                        <TableCell>
                          {formatNumber(product.units)}
                        </TableCell>

                        <TableCell bold>
                          {formatCurrency(product.revenue)}
                        </TableCell>

                        <TableCell>
                          <span className="rounded-full bg-green-100 px-2 py-1 text-[8px] font-semibold text-green-700">
                            +{product.growth}%
                          </span>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* LOW STOCK ALERT */}
          {role === "Manager" && (
            <section className="mb-5 overflow-hidden rounded-xl border border-orange-200 bg-white">
              <div className="flex items-center justify-between border-b border-orange-100 bg-orange-50 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-orange-900">
                    Low Stock Alerts
                  </h2>

                  <p className="mt-1 text-[10px] text-orange-700">
                    Products that require replenishment.
                  </p>
                </div>

                <span className="rounded-full bg-orange-100 px-3 py-1 text-[9px] font-bold text-orange-700">
                  {lowStockItems.length} Alerts
                </span>
              </div>

              <div className="grid gap-3 p-4 md:grid-cols-2 lg:grid-cols-4">
                {lowStockItems.map((item) => (
                  <div
                    key={item.sku}
                    className="rounded-lg border border-orange-100 bg-orange-50/40 p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs font-semibold">
                          {item.name}
                        </p>

                        <p className="mt-1 text-[9px] text-slate-400">
                          {item.sku}
                        </p>
                      </div>

                      <span className="rounded-full bg-red-100 px-2 py-1 text-[8px] font-bold text-red-600">
                        Low
                      </span>
                    </div>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-[9px] uppercase text-slate-400">
                          Current Stock
                        </p>

                        <p className="mt-1 text-lg font-bold text-red-600">
                          {item.stock}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] uppercase text-slate-400">
                          Reorder
                        </p>

                        <p className="mt-1 text-xs font-semibold">
                          {item.reorder}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-red-500"
                        style={{
                          width: `${Math.min(
                            (item.stock / item.reorder) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* INVENTORY MOVEMENTS */}
          {role !== "Cashier" && (
            <section className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="text-sm font-semibold">
                  Inventory Movement
                </h2>

                <p className="mt-1 text-[10px] text-slate-500">
                  Latest inventory activity.
                </p>
              </div>

              <div className="grid grid-cols-2">
                <div className="border-r border-slate-200 p-5">
                  <p className="text-[9px] uppercase text-slate-400">
                    Stock In
                  </p>

                  <p className="mt-2 text-xl font-bold text-green-600">
                    970
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400">
                    Units received
                  </p>
                </div>

                <div className="p-5">
                  <p className="text-[9px] uppercase text-slate-400">
                    Stock Out
                  </p>

                  <p className="mt-2 text-xl font-bold text-orange-600">
                    127
                  </p>

                  <p className="mt-1 text-[9px] text-slate-400">
                    Units dispatched
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* ACTIONS */}
          <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold">
                  Report Actions
                </h2>

                <p className="mt-1 text-[10px] text-slate-500">
                  Generate or export the selected {role.toLowerCase()} report.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="rounded-md bg-[#10233f] px-4 py-2.5 text-[10px] font-semibold text-white"
                >
                  Generate {role}
                </button>

                <button
                  type="button"
                  onClick={handleExport}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-[10px] font-semibold text-slate-700"
                >
                  Download CSV
                </button>
              </div>
            </div>
          </section>

          <div className="pb-8 text-center">
            <p className="text-[10px] text-slate-400">
              AI StockFlow • Reports & Analytics
            </p>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}

/* =========================================================
   ROLE HEADING
========================================================= */

function RoleHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold text-[#10233f]">
        {title}
      </h2>

      <p className="mt-1 text-[10px] text-slate-500">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  title,
  value,
  subtitle,
  valueClass,
}: {
  title: string;
  value: string;
  subtitle: string;
  valueClass: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p
        className={`mt-2 text-xl font-bold sm:text-2xl ${valueClass}`}
      >
        {value}
      </p>

      <p className="mt-1 text-[9px] text-slate-400">
        {subtitle}
      </p>
    </div>
  );
}

/* =========================================================
   MINI CARD
========================================================= */

function MiniCard({
  title,
  value,
  valueClass = "text-slate-800",
}: {
  title: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <p
        className={`mt-2 text-lg font-bold ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   SALES TREND
========================================================= */

function SalesTrend({
  salesData,
  maxSales,
  dateRange,
}: {
  salesData: SalesData[];
  maxSales: number;
  dateRange: string;
}) {
  return (
    <section className="mb-5 rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">
            Sales Trend
          </h2>

          <p className="mt-1 text-[10px] text-slate-500">
            Sales performance over time.
          </p>
        </div>

        <span className="rounded-full bg-blue-50 px-3 py-1 text-[9px] font-semibold text-blue-700">
          {dateRange}
        </span>
      </div>

      <div className="p-5">
        <div className="flex h-64 items-end gap-3 sm:gap-5">
          {salesData.map((item) => {
            const height =
              (item.sales / maxSales) * 100;

            return (
              <div
                key={item.month}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <span className="text-[9px] font-semibold text-slate-500">
                  {item.sales}
                </span>

                <div className="flex h-44 w-full items-end justify-center">
                  <div
                    className="w-full max-w-12 rounded-t-md bg-blue-600 transition-all hover:bg-blue-700"
                    style={{
                      height: `${height}%`,
                    }}
                  />
                </div>

                <span className="text-[9px] font-medium text-slate-400">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TOP PRODUCTS
========================================================= */

function TopProducts() {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold">
          Top Products
        </h2>

        <p className="mt-1 text-[10px] text-slate-500">
          Best selling products.
        </p>
      </div>

      <div className="space-y-4 p-5">
        {topProducts.slice(0, 5).map((product, index) => (
          <div key={product.sku}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-700">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">
                    {product.name}
                  </p>

                  <p className="text-[9px] text-slate-400">
                    {product.sku}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-bold">
                  {formatCurrency(product.revenue)}
                </p>

                <p className="text-[9px] text-green-600">
                  +{product.growth}%
                </p>
              </div>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{
                  width: `${Math.min(
                    (product.units / 1240) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   LOW STOCK
========================================================= */

function LowStockAlerts() {
  return (
    <section className="overflow-hidden rounded-xl border border-orange-200 bg-white">
      <div className="border-b border-orange-100 bg-orange-50 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-orange-900">
              Low Stock Alerts
            </h2>

            <p className="mt-1 text-[10px] text-orange-700">
              Replenishment required.
            </p>
          </div>

          <span className="rounded-full bg-orange-100 px-3 py-1 text-[9px] font-bold text-orange-700">
            Action Required
          </span>
        </div>
      </div>

      <div className="divide-y divide-slate-100">
        {lowStockItems.map((item) => (
          <div
            key={item.sku}
            className="p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold">
                  {item.name}
                </p>

                <p className="mt-1 text-[9px] text-slate-400">
                  {item.sku}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-red-600">
                  {item.stock}
                </p>

                <p className="text-[8px] text-slate-400">
                  / {item.reorder} reorder
                </p>
              </div>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-red-500"
                style={{
                  width: `${Math.min(
                    (item.stock / item.reorder) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* =========================================================
   FINANCIAL SUMMARY
========================================================= */

function FinancialSummary({
  totalRevenue,
  paidValue,
  outstanding,
  expenses,
}: {
  totalRevenue: number;
  paidValue: number;
  outstanding: number;
  expenses: number;
}) {
  return (
    <section className="mb-5 rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold">
          Financial Summary
        </h2>

        <p className="mt-1 text-[10px] text-slate-500">
          Accountant-focused financial indicators.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-px bg-slate-200 lg:grid-cols-4">
        <FinanceItem
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          className="text-purple-600"
        />

        <FinanceItem
          title="Paid"
          value={formatCurrency(paidValue)}
          className="text-green-600"
        />

        <FinanceItem
          title="Outstanding"
          value={formatCurrency(outstanding)}
          className="text-orange-600"
        />

        <FinanceItem
          title="Expenses"
          value={formatCurrency(expenses)}
          className="text-red-600"
        />
      </div>
    </section>
  );
}

function FinanceItem({
  title,
  value,
  className,
}: {
  title: string;
  value: string;
  className: string;
}) {
  return (
    <div className="bg-white p-5">
      <p className="text-[9px] uppercase text-slate-400">
        {title}
      </p>

      <p className={`mt-2 text-lg font-bold ${className}`}>
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PERFORMANCE
========================================================= */

function PerformanceSummary() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold">
          Performance Summary
        </h2>

        <p className="mt-1 text-[10px] text-slate-500">
          Operational performance indicators.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <ProgressRow
          title="Sales Performance"
          value="82%"
          width="82%"
        />

        <ProgressRow
          title="Inventory Availability"
          value="91%"
          width="91%"
        />

        <ProgressRow
          title="Warehouse Efficiency"
          value="87%"
          width="87%"
        />

        <ProgressRow
          title="Order Fulfillment"
          value="94%"
          width="94%"
        />
      </div>
    </div>
  );
}

/* =========================================================
   CASHIER
========================================================= */

function CashierSummary() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold">
          Today's Payment Summary
        </h2>

        <p className="mt-1 text-[10px] text-slate-500">
          POS payment activity.
        </p>
      </div>

      <div className="space-y-5 p-5">
        <ProgressRow
          title="Cash Payments"
          value="38%"
          width="38%"
        />

        <ProgressRow
          title="Card Payments"
          value="50%"
          width="50%"
        />

        <ProgressRow
          title="UPI Payments"
          value="12%"
          width="12%"
        />
      </div>
    </div>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function ProgressRow({
  title,
  value,
  width,
}: {
  title: string;
  value: string;
  width: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-slate-600">
          {title}
        </span>

        <span className="text-[10px] font-bold text-slate-700">
          {value}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width }}
        />
      </div>
    </div>
  );
}

/* =========================================================
   INVENTORY MOVEMENT
========================================================= */

function InventoryMovement({
  stockIn,
  stockOut,
}: {
  stockIn: number;
  stockOut: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold">
          Inventory Movement
        </h2>

        <p className="mt-1 text-[10px] text-slate-500">
          Recent stock movement summary.
        </p>
      </div>

      <div className="grid grid-cols-2">
        <div className="border-r border-slate-200 p-5">
          <p className="text-[9px] uppercase text-slate-400">
            Stock In
          </p>

          <p className="mt-2 text-xl font-bold text-green-600">
            {formatNumber(stockIn)}
          </p>

          <p className="mt-1 text-[9px] text-slate-400">
            Units received
          </p>
        </div>

        <div className="p-5">
          <p className="text-[9px] uppercase text-slate-400">
            Stock Out
          </p>

          <p className="mt-2 text-xl font-bold text-orange-600">
            {formatNumber(stockOut)}
          </p>

          <p className="mt-1 text-[9px] text-slate-400">
            Units dispatched
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   TABLE HELPERS
========================================================= */

function TableHead({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-3 text-left text-[9px] font-semibold text-slate-500">
      {children}
    </th>
  );
}

function TableCell({
  children,
  bold = false,
  muted = false,
}: {
  children: React.ReactNode;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <td
      className={`px-5 py-3 text-xs ${
        bold ? "font-semibold" : ""
      } ${muted ? "text-slate-500" : ""}`}
    >
      {children}
    </td>
  );
}