"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

/* =========================================================
   TYPES
========================================================= */

type NavItem = {
  label: string;
  href: string;
};

type Product = {
  name: string;
  sku: string;
  status: string;
  stock: number;
  capital: string;
  action: string;
};

type ReorderItem = {
  name: string;
  sku: string;
  available: number;
  selling: string;
  supplierTakes: string;
  reorderPoint: string;
  progress: number;
};

/* =========================================================
   NAVIGATION DATA
========================================================= */

const operateItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Point of sale",
    href: "/sales",
  },
  {
    label: "Inventory",
    href: "/inventory",
  },
  {
    label: "Purchase orders",
    href: "/purchase-orders",
  },
  {
    label: "Customers",
    href: "/customers",
  },
];

const intelligenceItems: NavItem[] = [
  {
    label: "Copilot",
    href: "/copilot",
  },
  {
    label: "Demand forecast",
    href: "/demand-forecast",
  },
  {
    label: "Dead stock",
    href: "/dead-stock",
  },
  {
    label: "Price review",
    href: "/price-review",
  },
];

const recordsItems: NavItem[] = [
  {
    label: "Reports",
    href: "/reports",
  },
  {
    label: "GST filing",
    href: "/gst-filling",
  },
  {
    label: "Audit trail",
    href: "/reports",
  },
];

const managementItems: NavItem[] = [
  {
    label: "Warehouse",
    href: "/warehouse",
  },
  {
    label: "Finance",
    href: "/finance",
  },
  {
    label: "HR",
    href: "/hr",
  },
  {
    label: "Settings",
    href: "/settings",
  },
];

/* =========================================================
   SIDEBAR SECTION
========================================================= */

function NavSection({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  const pathname = usePathname();

  return (
    <div className="mb-5">
      <p className="mb-2 px-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-300">
        {title}
      </p>

      <div className="space-y-1 px-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center rounded-md px-3 py-2 text-xs font-medium transition ${
                isActive
                  ? "bg-white text-slate-900"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <span
                className={`mr-2 h-1 w-1 rounded-full ${
                  isActive ? "bg-teal-600" : "bg-slate-400"
                }`}
              />

              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   SIDEBAR
========================================================= */

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-44 flex-col bg-[#12213a] text-white">
      {/* BRAND */}
      <div className="px-4 py-4">
        <Link href="/dashboard" className="block">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-xs font-bold text-[#12213a]">
              AI
            </div>

            <div>
              <h1 className="text-sm font-bold leading-none">
                AI StockFlow
              </h1>

              <p className="mt-1 text-[7px] font-semibold tracking-[0.2em] text-blue-300">
                I-ROBOX
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 overflow-y-auto px-2 pt-3">
        <NavSection
          title="Operate"
          items={operateItems}
        />

        <NavSection
          title="Intelligence"
          items={intelligenceItems}
        />

        <NavSection
          title="Records"
          items={recordsItems}
        />

        <NavSection
          title="Management"
          items={managementItems}
        />
      </nav>

      {/* BOTTOM */}
      <div className="border-t border-white/10 p-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs">
          ⚡
        </div>
      </div>
    </aside>
  );
}

/* =========================================================
   TOP HEADER
========================================================= */

function DashboardHeader() {
  const [period, setPeriod] = useState("30 days");

  return (
    <div className="mb-3 flex items-start justify-between">
      <div>
        <h1 className="text-[16px] font-bold text-[#142945]">
          Main Store — Bengaluru
        </h1>

        <p className="mt-1 text-[8px] text-slate-500">
          Saturday, 15 August 2026
        </p>
      </div>

      <div className="flex overflow-hidden rounded-md border border-slate-200 bg-white">
        {["7 days", "30 days", "90 days"].map((item) => (
          <button
            key={item}
            onClick={() => setPeriod(item)}
            className={`px-3 py-1.5 text-[8px] ${
              period === item
                ? "bg-slate-100 font-semibold text-slate-800"
                : "text-slate-400"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   STOCK CAPITAL CARD
========================================================= */

function StockCapitalCard() {
  return (
    <div className="mb-2 rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[8px] font-semibold text-[#172a43]">
            Where your stock capital is sitting
          </p>

          <span className="ml-2 text-[7px] text-slate-400">
            AI weighted average cost
          </span>
        </div>

        <p className="text-[12px] font-bold text-[#142945]">
          ₹5,09,853
        </p>
      </div>

      <div className="flex h-4 overflow-hidden rounded-sm">
        <div
          className="flex items-center justify-center bg-[#15937d] text-[7px] font-semibold text-white"
          style={{ width: "73%" }}
        >
          73%
        </div>

        <div
          className="flex items-center justify-center bg-[#cb4635] text-[7px] font-semibold text-white"
          style={{ width: "27%" }}
        >
          27%
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-3 text-[7px] text-slate-500">
        <span>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#15937d]" />
          Selling well ₹3,73,543
        </span>

        <span>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#e7a74c]" />
          Slowing down ₹0
        </span>

        <span>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#9b74dc]" />
          Overstocked ₹0
        </span>

        <span>
          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#cb4635]" />
          Not moving ₹1,36,310
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   KPI CARD
========================================================= */

function KpiCard({
  label,
  value,
  description,
  valueClass = "text-[#142945]",
}: {
  label: string;
  value: string;
  description: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <p className="text-[7px] font-medium uppercase text-slate-500">
        {label}
      </p>

      <p className={`mt-2 text-[13px] font-bold ${valueClass}`}>
        {value}
      </p>

      <p className="mt-1 text-[7px] text-slate-400">
        {description}
      </p>
    </div>
  );
}

/* =========================================================
   KPI SECTION
========================================================= */

function KpiSection() {
  return (
    <div className="mb-2 grid grid-cols-5 gap-2">
      <KpiCard
        label="Revenue today"
        value="₹0"
        description="0 orders"
      />

      <KpiCard
        label="Revenue 30 days"
        value="₹9,69,006"
        description="↓ 41.8% vs previous period"
      />

      <KpiCard
        label="Gross margin"
        value="35.7%"
        description="₹3,45,782 profit"
      />

      <KpiCard
        label="Stock value"
        value="₹5,09,853"
        description="20 SKUs"
      />

      <KpiCard
        label="Needs reorder"
        value="4"
        description="0 already out of stock"
        valueClass="text-orange-500"
      />
    </div>
  );
}

/* =========================================================
   REVENUE CHART
========================================================= */

function RevenueChart() {
  const points = [
    [0, 42],
    [20, 95],
    [40, 108],
    [60, 123],
    [80, 117],
    [100, 143],
    [120, 125],
    [140, 170],
    [160, 100],
    [180, 150],
    [200, 110],
    [220, 118],
    [240, 174],
    [260, 181],
    [280, 132],
    [300, 146],
    [320, 115],
    [340, 129],
    [360, 151],
    [380, 138],
    [400, 167],
    [420, 115],
    [440, 145],
  ];

  const path = points
    .map(
      ([x, y], index) =>
        `${index === 0 ? "M" : "L"} ${x} ${y}`
    )
    .join(" ");

  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-3">
        <h2 className="text-[10px] font-semibold text-[#142945]">
          Revenue and orders
        </h2>

        <p className="mt-1 text-[7px] text-slate-400">
          Daily totals including GST
        </p>
      </div>

      <div className="p-3">
        <div className="relative h-[180px]">
          {/* GRID */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="border-t border-slate-100"
              />
            ))}
          </div>

          {/* CHART */}
          <svg
            viewBox="0 0 440 190"
            className="relative h-full w-full"
            preserveAspectRatio="none"
          >
            <path
              d={path}
              fill="none"
              stroke="#687b94"
              strokeWidth="1.2"
            />

            <circle
              cx="0"
              cy="42"
              r="3"
              fill="#15937d"
            />
          </svg>

          {/* DATES */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[6px] text-slate-400">
            <span>15 Jul</span>
            <span>21 Jul</span>
            <span>27 Jul</span>
            <span>2 Aug</span>
            <span>8 Aug</span>
            <span>13 Aug</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   REORDER QUEUE
========================================================= */

const reorderItems: ReorderItem[] = [
  {
    name: "Hot Wheels Track Set",
    sku: "TOY-HW-002",
    available: 1,
    selling: "4.52/day",
    supplierTakes: "9 days",
    reorderPoint: "43.0",
    progress: 52,
  },
  {
    name: "Bluetooth Speaker",
    sku: "ELEC-BT-600",
    available: 2,
    selling: "2.14/day",
    supplierTakes: "9 days",
    reorderPoint: "22.3",
    progress: 45,
  },
  {
    name: "Football Size 5",
    sku: "SPT-BL-500",
    available: 3,
    selling: "1.45/day",
    supplierTakes: "7 days",
    reorderPoint: "13.5",
    progress: 38,
  },
];

function ReorderQueue() {
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-3">
        <div>
          <h2 className="text-[10px] font-semibold text-[#142945]">
            Reorder queue
          </h2>

          <p className="mt-1 text-[7px] text-slate-400">
            Approve to raise a purchase order
          </p>
        </div>

        <span className="rounded border border-dashed border-blue-400 px-2 py-1 text-[6px] text-blue-500">
          AI DRAFTED
        </span>
      </div>

      <div className="max-h-[235px] overflow-y-auto">
        {reorderItems.map((item) => (
          <div
            key={item.sku}
            className="border-b border-slate-100 p-3 last:border-b-0"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-[9px] font-semibold text-[#142945]">
                  {item.name}
                </h3>

                <p className="mt-1 text-[6px] text-slate-400">
                  {item.sku}
                </p>
              </div>

              <span className="rounded bg-red-50 px-2 py-1 text-[6px] text-red-500">
                {item.available <= 1
                  ? "0.2 days left"
                  : "0.8 days left"}
              </span>
            </div>

            <p className="mt-2 text-[7px] leading-4 text-slate-500">
              {item.available} available, selling {item.selling}.
              Supplier takes {item.supplierTakes}, so the reorder
              point is {item.reorderPoint}.
            </p>

            <div className="mt-2 flex items-center justify-between text-[6px] text-slate-500">
              <span>Order ₹178.32 → ₹1,28,390</span>
              <span>{item.progress}%</span>
            </div>

            <div className="mt-1 h-1 rounded bg-slate-100">
              <div
                className="h-1 rounded bg-[#15937d]"
                style={{
                  width: `${item.progress}%`,
                }}
              />
            </div>

            <div className="mt-2 flex gap-2">
              <button
                onClick={() =>
                  alert(
                    `Purchase order approved for ${item.name}`
                  )
                }
                className="rounded bg-[#12213a] px-3 py-1.5 text-[7px] font-medium text-white"
              >
                Approve order
              </button>

              <button
                onClick={() =>
                  alert(`Skipped ${item.name}`)
                }
                className="rounded border border-slate-200 px-3 py-1.5 text-[7px] text-slate-600"
              >
                Skip
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================================================
   STOCK NOT MOVING
========================================================= */

const stockProducts: Product[] = [
  {
    name: "Christmas Tree 4ft",
    sku: "SEA-XMAS-060",
    status: "Not moving",
    stock: 81,
    capital: "₹1,01,250",
    action: "Clear through discount or bundle; stop reordering.",
  },
  {
    name: "Fashion Doll Set",
    sku: "TOY-DL-410",
    status: "Not moving",
    stock: 56,
    capital: "₹21,280",
    action: "Clear through discount or bundle; stop reordering.",
  },
  {
    name: "Ceramic Planter",
    sku: "HOM-PL-810",
    status: "Not moving",
    stock: 53,
    capital: "₹13,780",
    action: "Clear through discount or bundle; stop reordering.",
  },
];

function StockNotMoving() {
  return (
    <div className="rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-3">
        <div>
          <h2 className="text-[10px] font-semibold text-[#142945]">
            Stock not moving
          </h2>

          <p className="mt-1 text-[7px] text-slate-400">
            ₹1,36,310 tied up · ranked by capital
          </p>
        </div>

        <span className="rounded border border-dashed border-blue-400 px-2 py-1 text-[6px] text-blue-500">
          AI CLASSIFIED
        </span>
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-3 py-2 text-[6px] font-semibold uppercase text-slate-500">
                Product
              </th>

              <th className="px-2 py-2 text-[6px] font-semibold uppercase text-slate-500">
                Status
              </th>

              <th className="px-2 py-2 text-[6px] font-semibold uppercase text-slate-500">
                On hand
              </th>

              <th className="px-2 py-2 text-[6px] font-semibold uppercase text-slate-500">
                Capital
              </th>

              <th className="px-3 py-2 text-[6px] font-semibold uppercase text-slate-500">
                Suggested action
              </th>
            </tr>
          </thead>

          <tbody>
            {stockProducts.map((product) => (
              <tr
                key={product.sku}
                className="border-b border-slate-100 last:border-0"
              >
                <td className="px-3 py-3">
                  <p className="text-[8px] font-semibold text-[#142945]">
                    {product.name}
                  </p>

                  <p className="mt-1 text-[6px] text-slate-400">
                    {product.sku}
                  </p>
                </td>

                <td className="px-2 py-3">
                  <span className="rounded-full bg-red-50 px-2 py-1 text-[6px] text-red-500">
                    {product.status}
                  </span>
                </td>

                <td className="px-2 py-3 text-[8px] text-slate-600">
                  {product.stock}
                </td>

                <td className="px-2 py-3 text-[8px] text-slate-700">
                  {product.capital}
                </td>

                <td className="px-3 py-3 text-[7px] text-slate-500">
                  {product.action}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   BUSINESS HEALTH
========================================================= */

function BusinessHealth() {
  const metrics = [
    {
      label: "Inventory health",
      value: 84,
      width: "84%",
      type: "normal",
    },
    {
      label: "Sales health",
      value: 0,
      width: "4%",
      type: "normal",
    },
    {
      label: "Cash flow",
      value: 88,
      width: "88%",
      type: "normal",
    },
    {
      label: "Supplier score",
      value: 82.3,
      width: "82%",
      type: "normal",
    },
    {
      label: "Customer growth",
      value: 63,
      width: "63%",
      type: "warning",
    },
  ];

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h2 className="text-[10px] font-semibold text-[#142945]">
            Business health
          </h2>

          <p className="mt-1 text-[7px] text-slate-400">
            Weighted across core areas
          </p>
        </div>

        <span className="rounded border border-dashed border-blue-400 px-2 py-1 text-[6px] text-blue-500">
          AI SCORED
        </span>
      </div>

      <div className="flex gap-4">
        {/* SCORE */}
        <div className="flex w-[80px] items-center justify-center">
          <div className="relative flex h-[70px] w-[70px] items-center justify-center rounded-full border-[6px] border-slate-200">
            <div className="absolute left-[-6px] top-[-6px] h-[70px] w-[70px] rounded-full border-[6px] border-red-500 border-b-transparent border-l-transparent rotate-[-35deg]" />

            <div className="text-center">
              <p className="text-[16px] font-bold text-[#142945]">
                61.4
              </p>

              <p className="text-[6px] text-slate-500">
                GRADE C
              </p>
            </div>
          </div>
        </div>

        {/* METRICS */}
        <div className="flex-1 space-y-2">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <div className="mb-1 flex justify-between text-[6px]">
                <span className="text-slate-500">
                  {metric.label}
                </span>

                <span className="font-semibold text-slate-600">
                  {metric.value}
                </span>
              </div>

              <div className="h-1 rounded bg-slate-100">
                <div
                  className={`h-1 rounded ${
                    metric.type === "warning"
                      ? "bg-orange-500"
                      : "bg-[#15937d]"
                  }`}
                  style={{
                    width: metric.width,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-md border border-blue-200 bg-blue-50 p-3">
        <p className="text-[6px] font-semibold uppercase text-blue-700">
          Where to focus
        </p>

        <p className="mt-1 text-[7px] leading-4 text-slate-600">
          Revenue is trending down. Check top categories and
          lapsed customers.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   COPILOT PREVIEW
========================================================= */

function CopilotPreview() {
  const [question, setQuestion] = useState("");

  const suggestedQuestions = [
    "Which products will run out next week?",
    "What is my current inventory value?",
    "Which products are not moving?",
    "Which supplier delivers the fastest?",
  ];

  const askQuestion = (value?: string) => {
    const finalQuestion = value || question;

    if (!finalQuestion.trim()) {
      return;
    }

    alert(
      `AI Copilot will answer:\n\n${finalQuestion}`
    );

    setQuestion("");
  };

  return (
    <div className="mt-2 rounded-md border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 p-3">
        <div>
          <h2 className="text-[10px] font-semibold text-[#142945]">
            Ask about your business
          </h2>

          <p className="mt-1 text-[7px] text-slate-400">
            AI assistants are built only from this store&apos;s
            records
          </p>
        </div>

        <Link
          href="/copilot"
          className="rounded border border-dashed border-blue-400 px-2 py-1 text-[6px] text-blue-500"
        >
          COPILOT
        </Link>
      </div>

      <div className="p-3">
        <div className="rounded-md border border-blue-100 bg-blue-50 p-3">
          <div className="flex gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white">
              AI
            </div>

            <div>
              <p className="text-[8px] font-semibold text-[#142945]">
                AI Copilot
              </p>

              <p className="mt-1 text-[6px] text-slate-500">
                StockFlow business insight
              </p>
            </div>
          </div>

          <p className="mt-3 text-[7px] leading-4 text-slate-600">
            The current inventory value is approximately
            ₹5,09,853 based on the dashboard inventory records.
          </p>
        </div>

        <div className="mt-3">
          <p className="mb-2 text-[6px] font-semibold uppercase text-slate-500">
            Suggested questions
          </p>

          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((item) => (
              <button
                key={item}
                onClick={() => askQuestion(item)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[6px] text-slate-600 hover:bg-slate-50"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                askQuestion();
              }
            }}
            placeholder="Ask me anything about stock, sales, suppliers or revenue..."
            className="h-8 flex-1 rounded-md border border-slate-200 px-3 text-[7px] outline-none focus:border-blue-400"
          />

          <button
            onClick={() => askQuestion()}
            className="rounded-md bg-[#12213a] px-4 text-[7px] font-semibold text-white"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

function QuickActions() {
  const actions = [
    {
      label: "Inventory",
      href: "/inventory",
      description: "Manage stock",
    },
    {
      label: "Purchase orders",
      href: "/purchase-orders",
      description: "Manage suppliers",
    },
    {
      label: "Customers",
      href: "/customers",
      description: "View customers",
    },
    {
      label: "Reports",
      href: "/reports",
      description: "Business reports",
    },
  ];

  return (
    <div className="mt-2 grid grid-cols-4 gap-2">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className="rounded-md border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow"
        >
          <p className="text-[8px] font-semibold text-[#142945]">
            {action.label}
          </p>

          <p className="mt-1 text-[6px] text-slate-400">
            {action.description}
          </p>
        </Link>
      ))}
    </div>
  );
}

/* =========================================================
   MAIN DASHBOARD
========================================================= */

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const currentDate = useMemo(() => {
    return "Saturday, 15 August 2026";
  }, []);

  return (
    <div
      key={refreshKey}
      className="min-h-screen bg-[#f4f6f9] text-[#172a43]"
    >
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="ml-44 min-h-screen">
        <div className="mx-auto max-w-[1100px] px-5 py-5">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-3 flex items-start justify-between">
            <div>
              <h1 className="text-[16px] font-bold text-[#142945]">
                Main Store — Bengaluru
              </h1>

              <p className="mt-1 text-[8px] text-slate-500">
                {currentDate}
              </p>
            </div>

            <button
              onClick={() =>
                setRefreshKey((value) => value + 1)
              }
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[8px] font-medium text-slate-600 shadow-sm hover:bg-slate-50"
            >
              Refresh
            </button>
          </div>

          {/* =================================================
              STOCK CAPITAL
          ================================================= */}

          <StockCapitalCard />

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <KpiSection />

          {/* =================================================
              REVENUE + REORDER
          ================================================= */}

          <div className="grid grid-cols-[1fr_280px] gap-2">

            <RevenueChart />

            <ReorderQueue />

          </div>

          {/* =================================================
              STOCK + BUSINESS HEALTH
          ================================================= */}

          <div className="mt-2 grid grid-cols-[1fr_280px] gap-2">

            <StockNotMoving />

            <BusinessHealth />

          </div>

          {/* =================================================
              COPILOT
          ================================================= */}

          <CopilotPreview />

          {/* =================================================
              QUICK ACCESS
          ================================================= */}

          <QuickActions />

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="py-6 text-center">
            <p className="text-[7px] text-slate-400">
              AI StockFlow • Intelligent Inventory Management
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}