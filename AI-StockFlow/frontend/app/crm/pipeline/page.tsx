"use client";

import { useMemo, useState } from "react";

type Stage = "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";

type Opportunity = {
  id: string;
  lead: string;
  company: string;
  stage: Stage;
  value: number;
  expectedClose: string;
  owner: string;
};

const initialOpportunities: Opportunity[] = [
  {
    id: "OPP-001",
    lead: "Rahul Mehta",
    company: "Apex Retail Solutions",
    stage: "New",
    value: 85000,
    expectedClose: "2026-09-20",
    owner: "Admin User",
  },
  {
    id: "OPP-002",
    lead: "Priya Shah",
    company: "Green Valley Stores",
    stage: "Contacted",
    value: 65000,
    expectedClose: "2026-09-25",
    owner: "Sales Team",
  },
  {
    id: "OPP-003",
    lead: "Arjun Rao",
    company: "Metro Office Supplies",
    stage: "Qualified",
    value: 120000,
    expectedClose: "2026-09-30",
    owner: "Admin User",
  },
  {
    id: "OPP-004",
    lead: "Sneha Patel",
    company: "Sunrise Electronics",
    stage: "Proposal",
    value: 95000,
    expectedClose: "2026-10-05",
    owner: "Sales Team",
  },
];

const stages: Stage[] = [
  "New",
  "Contacted",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

const formatCurrency = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

export default function CRMPipelinePage() {
  const [opportunities, setOpportunities] =
    useState<Opportunity[]>(initialOpportunities);
  const [stageFilter, setStageFilter] = useState<"All" | Stage>("All");
  const [search, setSearch] = useState("");

  const [draggedOpportunity, setDraggedOpportunity] =
  useState<string | null>(null);

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter((opportunity) => {
      const matchesSearch =
        opportunity.lead.toLowerCase().includes(search.toLowerCase()) ||
        opportunity.company.toLowerCase().includes(search.toLowerCase());

      const matchesStage =
        stageFilter === "All" || opportunity.stage === stageFilter;

      return matchesSearch && matchesStage;
    });
  }, [opportunities, search, stageFilter]);

  const pipelineValue = opportunities
    .filter((item) => item.stage !== "Lost")
    .reduce((sum, item) => sum + item.value, 0);

  const wonValue = opportunities
    .filter((item) => item.stage === "Won")
    .reduce((sum, item) => sum + item.value, 0);

  const closedOpportunities = opportunities.filter(
    (item) => item.stage === "Won" || item.stage === "Lost"
  );

  const conversionRate =
    closedOpportunities.length > 0
      ? (opportunities.filter((item) => item.stage === "Won").length /
          closedOpportunities.length) *
        100
      : 0;

  function updateStage(id: string, stage: Stage) {
    setOpportunities((current) =>
      current.map((opportunity) =>
        opportunity.id === id ? { ...opportunity, stage } : opportunity
      )
    );
  }

  function handleDragStart(id: string) {
  setDraggedOpportunity(id);
}

function handleDrop(stage: Stage) {
  if (!draggedOpportunity) return;

  updateStage(draggedOpportunity, stage);
  setDraggedOpportunity(null);
}

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            CRM Sales Pipeline
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage opportunities, pipeline stages and conversion performance.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-500">
              Total Opportunities
            </p>
            <p className="mt-2 text-2xl font-bold">
              {opportunities.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-500">
              Pipeline Value
            </p>
            <p className="mt-2 text-2xl font-bold">
              {formatCurrency(pipelineValue)}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-500">
              Won Value
            </p>
            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatCurrency(wonValue)}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-xs font-medium uppercase text-slate-500">
              Conversion Rate
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-600">
              {conversionRate.toFixed(1)}%
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-xl border bg-white p-4">
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search lead or company..."
              className="rounded-lg border px-3 py-2 text-sm"
            />

            <select
              value={stageFilter}
              onChange={(e) =>
                setStageFilter(e.target.value as "All" | Stage)
              }
              className="rounded-lg border px-3 py-2 text-sm"
            >
              <option value="All">All Stages</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-7">
          {stages.map((stage) => {
            const stageItems = opportunities.filter(
              (item) => item.stage === stage
            );

            const value = stageItems.reduce(
              (sum, item) => sum + item.value,
              0
            );

            return (
              <div
  key={stage}
  onDragOver={(e) => e.preventDefault()}
  onDrop={() => handleDrop(stage)}
  className="min-h-[220px] rounded-xl border bg-white p-4"
>
                <p className="text-xs font-semibold text-slate-500">
                  {stage}
                </p>
                <div className="mt-4 space-y-3">
  {stageItems.map((opportunity) => (
    <div
      key={opportunity.id}
      draggable
      onDragStart={() => handleDragStart(opportunity.id)}
      className="cursor-grab rounded-lg border bg-slate-50 p-3 shadow-sm hover:shadow-md"
    >
      <p className="font-semibold text-slate-900">
        {opportunity.lead}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {opportunity.company}
      </p>

      <p className="mt-2 text-sm font-semibold">
        {formatCurrency(opportunity.value)}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Close: {opportunity.expectedClose}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Owner: {opportunity.owner}
      </p>
    </div>
  ))}
</div>
                <p className="mt-2 text-xl font-bold">
                  {stageItems.length}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {formatCurrency(value)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="border-b p-4">
            <h2 className="font-semibold text-slate-900">
              Opportunity Pipeline
            </h2>
            <p className="text-xs text-slate-500">
              Track stage, opportunity value and expected close date.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-3">Lead</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Stage</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Expected Close</th>
                  <th className="px-4 py-3">Owner</th>
                </tr>
              </thead>

              <tbody>
                {filteredOpportunities.map((opportunity) => (
                  <tr key={opportunity.id} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-semibold">
                        {opportunity.lead}
                      </div>
                      <div className="text-xs text-slate-400">
                        {opportunity.id}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {opportunity.company}
                    </td>

                    <td className="px-4 py-3">
                      <select
                        value={opportunity.stage}
                        onChange={(e) =>
                          updateStage(
                            opportunity.id,
                            e.target.value as Stage
                          )
                        }
                        className="rounded border px-2 py-1 text-xs"
                      >
                        {stages.map((stage) => (
                          <option key={stage} value={stage}>
                            {stage}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3 font-semibold">
                      {formatCurrency(opportunity.value)}
                    </td>

                    <td className="px-4 py-3">
                      {opportunity.expectedClose}
                    </td>

                    <td className="px-4 py-3">
                      {opportunity.owner}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t p-3 text-xs text-slate-500">
            Showing {filteredOpportunities.length} of{" "}
            {opportunities.length} opportunities
          </div>
        </div>
      </div>
    </main>
  );
}