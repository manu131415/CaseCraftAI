'use client';

import { Bell, Search, UserCircle2 } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import { Suspense } from "react";

function NavbarContent() {
  const { t } = useLanguage();

  return (
    <header className="relative z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-blue-600">
          {t("nav.operationsCenter")}
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          {t("nav.dailyCaseOverview")}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500">
          <Search className="h-4 w-4" />

          <input
            type="text"
            className="w-40 border-none bg-transparent outline-none placeholder:text-slate-400"
            placeholder={t("nav.search")}
            aria-label={t("nav.search")}
          />
        </label>

        <button
          type="button"
          aria-label={t("nav.notifications")}
          title={t("nav.notifications")}
          className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"
        >
          <Bell className="h-5 w-5" />
        </button>

        <LanguageSwitcher />

        <div className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm text-white">
          <UserCircle2 className="h-5 w-5" />
          {t("nav.currentUser")}
        </div>
      </div>
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
          <div className="space-y-2">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="h-10 w-44 animate-pulse rounded-full bg-slate-200" />
        </header>
      }
    >
      <NavbarContent />
    </Suspense>
  );
}

