"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";

const SECTIONS = [
  { label: "Operate", items: [
    { href: "/",           name: "Dashboard" },
    { href: "/pos",        name: "Point of sale" },
    { href: "/inventory",  name: "Inventory" },
    { href: "/purchase",   name: "Purchase orders" },
    { href: "/customers",  name: "Customers" },
  ]},
  { label: "Intelligence", items: [
    { href: "/copilot",    name: "Copilot" },
    { href: "/forecast",   name: "Demand forecast" },
    { href: "/dead-stock", name: "Dead stock" },
    { href: "/pricing",    name: "Price review" },
  ]},
  { label: "Records", items: [
    { href: "/reports",    name: "Reports" },
    { href: "/gst",        name: "GST filing" },
    { href: "/audit",      name: "Audit trail" },
  ]},
];

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen flex-col gap-6 bg-ink p-5 text-white max-lg:static max-lg:h-auto">
      <div className="flex items-center gap-2.5">
        <div className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-white">
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="#12213A"
               strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 12l9 4 9-4" /><path d="M3 17l9 4 9-4" />
          </svg>
        </div>
        <div>
          <p className="font-display text-[15px] font-bold tracking-tight">AI StockFlow</p>
          <p className="text-[10.5px] uppercase tracking-widest text-[#8FA3C4]">I-ROBOX</p>
        </div>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="mb-2 ml-2.5 text-[10px] font-semibold uppercase tracking-widest text-[#6E86AB]">
            {section.label}
          </p>
          <nav className="flex flex-col gap-0.5">
            {section.items.map((item) => {
              const active = path === item.href;
              return (
                <Link key={item.href} href={item.href}
                      className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13.5px] transition ${
                        active
                          ? "bg-white font-semibold text-ink"
                          : "font-medium text-[#C3D0E4] hover:bg-white/[.07] hover:text-white"
                      }`}>
                  <span className={`h-1.5 w-1.5 flex-none rounded-full ${
                    active ? "bg-good" : "bg-current opacity-50"
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      ))}
    </aside>
  );
}
