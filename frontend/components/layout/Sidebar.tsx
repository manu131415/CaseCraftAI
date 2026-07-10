"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Complaint Register", href: "/complaint", icon: FileText },
  { name: "AI Insights", href: "/", icon: Sparkles },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-950 px-6 py-8 text-slate-100 lg:flex">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-300">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <p className="text-lg font-semibold">CaseCraftAI</p>
          <p className="text-sm text-slate-400">Case Operations Hub</p>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <p className="text-sm font-semibold text-white">Secure by design</p>
        <p className="mt-2 text-sm text-slate-400">
          All complaint files are protected with layered verification and audit logs.
        </p>
      </div>
    </aside>
  );
}
