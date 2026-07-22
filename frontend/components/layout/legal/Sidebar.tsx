"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpenIcon,
  FileText,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { Suspense } from "react";

const navigationItems = [
  // {
  //   href: "/",
  //   key: "overview",
  //   namespace: "common",
  //   icon: LayoutDashboard,
  // },
  {
    href: "/dashboard/legal",
    key: "dashboard",
    namespace: "common",
    icon: Sparkles,
  },
  {
    href: "/legal/cases",
    key: "caseList",
    namespace: "common",
    icon: ShieldCheck,
  },
  {
    href: "/legal/legal-library",
    key: "Legal Library",
    namespace: "common",   
    icon: BookOpenIcon,
  },
  
] as const;

function SidebarContent() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-950 px-6 py-8 text-slate-100 lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start lg:overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/20 text-blue-300">
          <ShieldCheck className="h-6 w-6" />
        </div>

        <div>
          <p className="text-lg font-semibold">
            {t("appName")}
          </p>

          <p className="text-base text-slate-400">
            {t("appSubtitle")}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-10 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard/legal" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              {t(item.key, item.namespace)}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Card */}
      <div className="mt-auto rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        <p className="text-sm font-semibold text-white">
          {t("secureTitle")}
        </p>

        <p className="mt-2 text-sm text-slate-400">
          {t("secureDescription")}
        </p>
      </div>
    </aside>
  );
}

export default function Sidebar() {
  return (
    <Suspense
      fallback={
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-950 px-6 py-8 text-slate-100 lg:sticky lg:top-0 lg:flex lg:h-screen lg:self-start lg:overflow-y-auto">
          <div className="space-y-4">
            <div className="h-12 w-40 animate-pulse rounded bg-slate-800" />

            <div className="space-y-3">
              <div className="h-12 rounded-xl bg-slate-800 animate-pulse" />
              <div className="h-12 rounded-xl bg-slate-800 animate-pulse" />
              <div className="h-12 rounded-xl bg-slate-800 animate-pulse" />
              <div className="h-12 rounded-xl bg-slate-800 animate-pulse" />
              <div className="h-12 rounded-xl bg-slate-800 animate-pulse" />
              <div className="h-12 rounded-xl bg-slate-800 animate-pulse" />
            </div>
          </div>
        </aside>
      }
    >
      <SidebarContent />
    </Suspense>
  );
}
