"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const operateItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Point of sale", href: "/sales" },
  { label: "Inventory", href: "/inventory" },
  { label: "Purchase orders", href: "/purchase-orders" },
  { label: "Customers", href: "/customers" },
];

const intelligenceItems = [
  { label: "Copilot", href: "/copilot" },
  { label: "Demand forecast", href: "/demand-forecast" },
  { label: "Dead stock", href: "/dead-stock" },
  { label: "Price review", href: "/price-review" },
];

const recordsItems = [
  { label: "Reports", href: "/reports" },
  { label: "GST filing", href: "/gst-filing" },
  { label: "Audit trail", href: "/audit-trail" },
];

const managementItems = [
  { label: "Warehouse", href: "/warehouse" },
  { label: "Finance", href: "/finance" },
  { label: "HR", href: "/hr" },
  { label: "Settings", href: "/settings" },
];

type NavItem = {
  label: string;
  href: string;
};

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
              pathname.startsWith(item.href + "/"));

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

export default function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-44 flex-col bg-[#12213a] text-white">
      {/* Brand */}
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

      {/* Navigation */}
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

      {/* Bottom */}
      <div className="border-t border-white/10 p-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-xs">
          ⚡
        </div>
      </div>
    </aside>
  );
}