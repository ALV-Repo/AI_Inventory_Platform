"use client";

import { useMemo, useState } from "react";

type AgingType = "Receivable" | "Payable";

type AgingRecord = {
  id: string;
  party: string;
  invoice: string;
  date: string;
  dueDate: string;
  amount: number;
  paid: number;
  type: AgingType;
};

const initialRecords: AgingRecord[] = [
  {
    id: "AR-001",
    party: "Apex Retail Solutions",
    invoice: "INV-2026-041",
    date: "15/08/2026",
    dueDate: "28/08/2026",
    amount: 68500,
    paid: 0,
    type: "Receivable",
  },
  {
    id: "AR-002",
    party: "Green Valley Stores",
    invoice: "INV-2026-038",
    date: "13/08/2026",
    dueDate: "27/08/2026",
    amount: 56000,
    paid: 56000,
    type: "Receivable",
  },
  {
    id: "AR-003",
    party: "Metro Office Supplies",
    invoice: "INV-2026-039",
    date: "11/08/2026",
    dueDate: "20/08/2026",
    amount: 98500,
    paid: 20000,
    type: "Receivable",
  },
  {
    id: "AP-001",
    party: "Tech Supplies India",
    invoice: "PO-00005",
    date: "14/08/2026",
    dueDate: "29/08/2026",
    amount: 87500,
    paid: 87500,
    type: "Payable",
  },
  {
    id: "AP-002",
    party: "Office Mart Suppliers",
    invoice: "PO-00006",
    date: "12/08/2026",
    dueDate: "25/08/2026",
    amount: 32500,
    paid: 0,
    type: "Payable",
  },
];

function getAgingBucket(dueDate: string): string {
  const [day, month, year] = dueDate.split("/").map(Number);

  const due = new Date(year, month - 1, day);
  const today = new Date();

  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysOverdue = Math.max(
    0,
    Math.floor(
      (today.getTime() - due.getTime()) /
        (1000 * 60 * 60 * 24)
    )
  );

  if (daysOverdue <= 30) return "0–30";
  if (daysOverdue <= 60) return "31–60";
  if (daysOverdue <= 90) return "61–90";

  return "90+";
}

export default function AgingPage() {
  const [records] = useState<AgingRecord[]>(initialRecords);
  const [typeFilter, setTypeFilter] = useState<"All" | AgingType>("All");
  const [search, setSearch] = useState("");

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const matchesType =
        typeFilter === "All" || record.type === typeFilter;

      const query = search.trim().toLowerCase();

      const matchesSearch =
        !query ||
        record.party.toLowerCase().includes(query) ||
        record.invoice.toLowerCase().includes(query);

      return matchesType && matchesSearch;
    });
  }, [records, typeFilter, search]);

  const receivable = records
    .filter((record) => record.type === "Receivable")
    .reduce((sum, record) => sum + record.amount - record.paid, 0);

  const payable = records
    .filter((record) => record.type === "Payable")
    .reduce((sum, record) => sum + record.amount - record.paid, 0);

  const totalOutstanding = receivable + payable;

  const agingBuckets = [
  { label: "0–30 Days", min: 0, max: 30 },
  { label: "31–60 Days", min: 31, max: 60 },
  { label: "61–90 Days", min: 61, max: 90 },
  { label: "90+ Days", min: 91, max: Infinity },
].map((bucket) => ({
  ...bucket,
  receivable: records
    .filter((record) => {
      const outstanding = record.amount - record.paid;
      const days = Number(
        getAgingBucket(record.dueDate).replace("–", "-").split("-")[0]
      );

      return (
        record.type === "Receivable" &&
        outstanding > 0 &&
        (
          (bucket.label === "0–30 Days" && getAgingBucket(record.dueDate) === "0–30") ||
          (bucket.label === "31–60 Days" && getAgingBucket(record.dueDate) === "31–60") ||
          (bucket.label === "61–90 Days" && getAgingBucket(record.dueDate) === "61–90") ||
          (bucket.label === "90+ Days" && getAgingBucket(record.dueDate) === "90+")
        )
      );
    })
    .reduce((sum, record) => sum + record.amount - record.paid, 0),

  payable: records
    .filter((record) => {
      const outstanding = record.amount - record.paid;

      return (
        record.type === "Payable" &&
        outstanding > 0 &&
        (
          (bucket.label === "0–30 Days" && getAgingBucket(record.dueDate) === "0–30") ||
          (bucket.label === "31–60 Days" && getAgingBucket(record.dueDate) === "31–60") ||
          (bucket.label === "61–90 Days" && getAgingBucket(record.dueDate) === "61–90") ||
          (bucket.label === "90+ Days" && getAgingBucket(record.dueDate) === "90+")
        )
      );
    })
    .reduce((sum, record) => sum + record.amount - record.paid, 0),
}));

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Accounts Receivable & Payable Aging
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track outstanding customer and supplier balances by aging
              bucket.
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-500">
              Accounts Receivable
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              ₹{receivable.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Customer outstanding
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-500">
              Accounts Payable
            </p>
            <p className="mt-2 text-2xl font-bold text-red-600">
              ₹{payable.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Supplier outstanding
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase text-slate-500">
              Total Outstanding
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              ₹{totalOutstanding.toLocaleString("en-IN")}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Receivable + payable
            </p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  {agingBuckets.map((bucket) => (
    <div
      key={bucket.label}
      className="rounded-xl border bg-white p-4 shadow-sm"
    >
      <p className="text-xs font-medium uppercase text-slate-500">
        {bucket.label}
      </p>

      <p className="mt-2 text-xl font-bold text-slate-900">
        ₹{(bucket.receivable + bucket.payable).toLocaleString("en-IN")}
      </p>

      <div className="mt-2 flex justify-between text-xs">
        <span className="text-green-600">
          AR ₹{bucket.receivable.toLocaleString("en-IN")}
        </span>

        <span className="text-red-600">
          AP ₹{bucket.payable.toLocaleString("en-IN")}
        </span>
      </div>
    </div>
  ))}
</div>

        <div className="mb-6 rounded-xl border bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              type="text"
              placeholder="Search party or invoice..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border px-4 py-2 text-sm outline-none focus:border-blue-500"
            />

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value as "All" | AgingType)
              }
              className="rounded-lg border px-4 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="All">All Types</option>
              <option value="Receivable">Receivable</option>
              <option value="Payable">Payable</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <div className="border-b px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Outstanding Invoices & Bills
            </h2>
            <p className="text-xs text-slate-500">
              Aging buckets: 0–30, 31–60, 61–90 and 90+ days
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-3">Party</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Type</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Paid</th>
                  <th className="px-5 py-3 text-right">Outstanding</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredRecords.map((record) => {
                  const outstanding = record.amount - record.paid;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {record.party}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {record.invoice}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            record.type === "Receivable"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {record.type}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {record.dueDate}
                      </td>

                      <td className="px-5 py-4 text-right">
                        ₹{record.amount.toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-right text-green-600">
                        ₹{record.paid.toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-right font-semibold">
                        ₹{outstanding.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredRecords.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-slate-500">
              No matching records found.
            </div>
          )}

          <div className="border-t px-5 py-3 text-xs text-slate-500">
            Showing {filteredRecords.length} of {records.length} records
          </div>
        </div>
      </div>
    </div>
  );
}