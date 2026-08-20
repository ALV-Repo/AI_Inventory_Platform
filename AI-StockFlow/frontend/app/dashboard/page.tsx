"use client";

import { useState } from "react";
import LogoutButton from "../../components/LogoutButton";
import PageLayout from "../../components/layout/PageLayout";

const summaryCards = [
  {
    title: "REVENUE TODAY",
    value: "₹0",
    subtitle: "0 orders",
  },
  {
    title: "REVENUE 30 DAYS",
    value: "₹9,69,006",
    subtitle: "▼ 41.8% vs previous period",
  },
  {
    title: "GROSS MARGIN",
    value: "35.7%",
    subtitle: "₹3,45,782 profit",
  },
  {
    title: "STOCK VALUE",
    value: "₹5,09,853",
    subtitle: "20 SKUs",
  },
  {
    title: "NEEDS REORDER",
    value: "4",
    subtitle: "0 already out of stock",
  },
];

const reorderItems = [
  {
    name: "Hot Wheels Track Set",
    code: "TOY-HW-002",
    available: "1",
    selling: "4.521/day",
    supplier: "9 days",
    order: "178.32",
    value: "₹1,28,390",
    progress: 52,
  },
  {
    name: "Bluetooth Speaker",
    code: "ELC-BT-600",
    available: "2",
    selling: "2.144/day",
    supplier: "9 days",
    order: "84.62",
    value: "₹90,852",
    progress: 35,
  },
  {
    name: "Football Size 5",
    code: "SPT-BL-900",
    available: "4",
    selling: "1.82/day",
    supplier: "7 days",
    order: "55.00",
    value: "₹45,200",
    progress: 25,
  },
];

const deadStock = [
  {
    product: "Christmas Tree 4ft",
    code: "SEA-XM-960",
    status: "Not moving",
    onHand: 81,
    capital: "₹1,01,250",
  },
  {
    product: "Fashion Doll Set",
    code: "TOY-DL-410",
    status: "Not moving",
    onHand: 56,
    capital: "₹21,280",
  },
  {
    product: "Ceramic Planter",
    code: "HOM-PL-810",
    status: "Not moving",
    onHand: 53,
    capital: "₹13,780",
  },
];

export default function DashboardPage() {
  const [period, setPeriod] = useState("30 days");

  return (
    <PageLayout>
      <main className="min-h-screen bg-[#f4f6f9] text-[#12213a]">
        <div className="mx-auto max-w-[1500px] p-5">

          {/* HEADER */}
          <header className="mb-5 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-bold">
                Main Store — Bengaluru
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Saturday, 15 August 2026
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex rounded-lg bg-white p-1 shadow-sm">
                {["7 days", "30 days", "90 days"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPeriod(item)}
                    className={`rounded-md px-4 py-2 text-xs font-semibold transition ${
                      period === item
                        ? "bg-[#172844] text-white"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <LogoutButton />
            </div>
          </header>

          {/* STOCK CAPITAL */}
          <section className="mb-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold">
                  Where your stock capital is sitting
                </h2>

                <p className="text-xs text-gray-500">
                  AI weighted average cost
                </p>
              </div>

              <p className="text-xl font-bold">
                ₹5,09,853
              </p>
            </div>

            <div className="flex h-7 overflow-hidden rounded-md">
              <div
                className="flex items-center justify-center bg-[#148574] text-xs font-bold text-white"
                style={{ width: "73%" }}
              >
                73%
              </div>

              <div
                className="flex items-center justify-center bg-[#c44332] text-xs font-bold text-white"
                style={{ width: "27%" }}
              >
                27%
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-5 text-xs text-gray-600">
              <span>
                <b className="text-[#148574]">■</b> Selling well ₹3,73,543
              </span>

              <span>
                <b className="text-[#d18b1f]">■</b> Slowing down ₹0
              </span>

              <span>
                <b className="text-[#7d75a8]">■</b> Overstocked ₹0
              </span>

              <span>
                <b className="text-[#c44332]">■</b> Not moving ₹1,36,310
              </span>
            </div>
          </section>

          {/* SUMMARY CARDS */}
          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {summaryCards.map((card, index) => (
              <div
                key={card.title}
                className={`rounded-xl border bg-white p-4 shadow-sm ${
                  index === 4
                    ? "border-l-4 border-l-orange-400"
                    : "border-gray-200"
                }`}
              >
                <p className="text-[10px] font-semibold tracking-wider text-gray-500">
                  {card.title}
                </p>

                <p
                  className={`mt-2 text-xl font-bold ${
                    index === 4 ? "text-orange-500" : "text-[#12213a]"
                  }`}
                >
                  {card.value}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {card.subtitle}
                </p>
              </div>
            ))}
          </section>

          {/* CHART + REORDER */}
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">

            {/* REVENUE CHART */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-4">
                <h2 className="font-bold">
                  Revenue and orders
                </h2>

                <p className="text-xs text-gray-500">
                  Daily totals including GST
                </p>
              </div>

              <div className="relative h-[310px] p-5">
                <div className="absolute left-10 right-6 top-8 space-y-12">
                  <div className="border-t border-dashed border-gray-200" />
                  <div className="border-t border-dashed border-gray-200" />
                  <div className="border-t border-dashed border-gray-200" />
                  <div className="border-t border-dashed border-gray-200" />
                  <div className="border-t border-dashed border-gray-200" />
                </div>

                <div className="absolute bottom-10 left-10 right-6 flex items-end justify-between">
                  {[
                    70, 48, 43, 55, 25, 48, 8, 18, 72,
                    44, 50, 31, 15, 42, 58, 20, 12, 50, 42,
                  ].map((height, index) => (
                    <div
                      key={index}
                      className="w-1.5 rounded-t bg-[#172844]"
                      style={{ height: `${height * 2.8}px` }}
                    />
                  ))}
                </div>

                <div className="absolute bottom-3 left-10 right-6 flex justify-between text-[10px] text-gray-400">
                  <span>15 Jul</span>
                  <span>21 Jul</span>
                  <span>27 Jul</span>
                  <span>2 Aug</span>
                  <span>8 Aug</span>
                  <span>13 Aug</span>
                </div>

                <div className="absolute left-0 top-6 flex flex-col justify-between text-[10px] text-gray-400">
                  <span>98k</span>
                  <span>74k</span>
                  <span>49k</span>
                  <span>25k</span>
                  <span>0k</span>
                </div>
              </div>
            </div>

            {/* REORDER QUEUE */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <div>
                  <h2 className="font-bold">
                    Reorder queue
                  </h2>

                  <p className="text-xs text-gray-500">
                    Approve to raise a purchase order
                  </p>
                </div>

                <span className="rounded border border-dashed border-blue-500 px-2 py-1 text-[9px] font-bold text-blue-600">
                  AI DRAFTED
                </span>
              </div>

              <div className="max-h-[310px] overflow-y-auto">
                {reorderItems.map((item) => (
                  <div
                    key={item.code}
                    className="border-b border-gray-100 p-4 last:border-0"
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-sm font-bold">
                          {item.name}
                        </h3>

                        <p className="text-[10px] text-gray-400">
                          {item.code}
                        </p>
                      </div>

                      <span className="rounded bg-red-50 px-2 py-1 text-[9px] font-bold text-red-500">
                        0.9 days left
                      </span>
                    </div>

                    <div className="mt-3 rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
                      <b>{item.available}</b> available, selling{" "}
                      <b>{item.selling}</b>. Supplier takes{" "}
                      <b>{item.supplier}</b>, so the reorder point is{" "}
                      <b>22.3</b>.
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-semibold">
                        Order {item.order} · {item.value}
                      </span>

                      <span className="text-[10px] text-gray-400">
                        {item.progress}%
                      </span>
                    </div>

                    <div className="mt-2 h-1.5 rounded-full bg-gray-200">
                      <div
                        className="h-full rounded-full bg-[#148574]"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="rounded-md bg-[#12213a] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1d3557]"
                      >
                        Approve order
                      </button>

                      <button
                        type="button"
                        className="rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold hover:bg-gray-50"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* LOWER SECTION */}
          <section className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.7fr_1fr]">

            {/* DEAD STOCK */}
            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 p-4">
                <div>
                  <h2 className="font-bold">
                    Stock not moving
                  </h2>

                  <p className="text-xs text-gray-500">
                    ₹1,36,310 tied up · ranked by capital
                  </p>
                </div>

                <span className="rounded border border-dashed border-blue-500 px-2 py-1 text-[9px] font-bold text-blue-600">
                  AI CLASSIFIED
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 text-[10px] text-gray-500">
                      <th className="p-4">PRODUCT</th>
                      <th className="p-4">STATUS</th>
                      <th className="p-4">ON HAND</th>
                      <th className="p-4">CAPITAL</th>
                      <th className="p-4">SUGGESTED ACTION</th>
                    </tr>
                  </thead>

                  <tbody>
                    {deadStock.map((item) => (
                      <tr
                        key={item.code}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="p-4">
                          <p className="text-sm font-semibold">
                            {item.product}
                          </p>

                          <p className="text-[10px] text-gray-400">
                            {item.code}
                          </p>
                        </td>

                        <td className="p-4">
                          <span className="rounded bg-red-50 px-2 py-1 text-[9px] font-bold text-red-500">
                            {item.status}
                          </span>
                        </td>

                        <td className="p-4 text-sm">
                          {item.onHand}
                        </td>

                        <td className="p-4 text-sm font-semibold">
                          {item.capital}
                        </td>

                        <td className="p-4 text-xs text-gray-500">
                          Clear through discount or bundle;
                          stop reordering.
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BUSINESS HEALTH */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">
                    Business health
                  </h2>

                  <p className="text-xs text-gray-500">
                    Weighted across five areas
                  </p>
                </div>

                <span className="rounded border border-dashed border-blue-500 px-2 py-1 text-[9px] font-bold text-blue-600">
                  AI SCORED
                </span>
              </div>

              <div className="mt-5 flex items-center gap-5">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-[10px] border-[#c44332] border-l-[#d8dde5]">
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      61.4
                    </p>

                    <p className="text-[10px] text-gray-500">
                      GRADE C
                    </p>
                  </div>
                </div>

                <div className="w-full space-y-4">
                  {[
                    ["Inventory health", 84],
                    ["Sales health", 0],
                    ["Cash flow", 88],
                    ["Supplier score", 82.3],
                    ["Customer growth", 63],
                  ].map(([name, value]) => (
                    <div key={name as string}>
                      <div className="mb-1 flex justify-between text-[10px]">
                        <span>{name}</span>
                        <b>{value}</b>
                      </div>

                      <div className="h-1.5 rounded-full bg-gray-200">
                        <div
                          className="h-full rounded-full bg-[#148574]"
                          style={{
                            width: `${value}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-lg border-l-2 border-blue-500 bg-blue-50 p-3">
                <p className="text-[10px] font-bold text-gray-500">
                  WHERE TO FOCUS
                </p>

                <p className="mt-1 text-xs text-gray-600">
                  Revenue is trending down. Check top categories
                  and lapsed customers.
                </p>
              </div>
            </div>
          </section>

          {/* COPILOT */}
          <section className="mt-4 rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <div>
                <h2 className="font-bold">
                  Ask about your business
                </h2>

                <p className="text-xs text-gray-500">
                  Answers are built only from this store&apos;s records
                </p>
              </div>

              <span className="rounded border border-dashed border-blue-500 px-2 py-1 text-[9px] font-bold text-blue-600">
                COPILOT
              </span>
            </div>

            <div className="p-4">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-600">
                Ask me anything about stock, sales, suppliers,
                or margins. I&apos;ll show the figures behind every
                answer so you can check them.
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  "Which products will run out next week?",
                  "Compare this month with last month",
                  "Which supplier delivers the fastest?",
                  "What is my inventory value?",
                ].map((question) => (
                  <button
                    key={question}
                    type="button"
                    className="rounded-full border border-gray-200 px-3 py-2 text-[10px] text-gray-600 hover:bg-gray-50"
                  >
                    {question}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Type a question..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />

                <button
                  type="button"
                  className="rounded-lg bg-[#12213a] px-6 py-3 text-sm font-semibold text-white hover:bg-[#1d3557]"
                >
                  Ask
                </button>
              </div>
            </div>
          </section>

        </div>
      </main>
    </PageLayout>
  );
}