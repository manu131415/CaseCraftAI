'use client';

import { Bell, ChevronDown, LogOut, Search, UserCircle2 } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";
import LanguageSwitcher from "../LanguageSwitcher";
import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ROLES, SessionUser } from "@/lib/auth";

interface NavbarProps {
  /** Small colored label above the heading, e.g. "Legal Library". Falls back to nav.operationsCenter. */
  eyebrow?: string;
  /** Main heading, e.g. "Search Legal Sections". Falls back to nav.dailyCaseOverview. */
  title?: string;
}

function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setUser(data?.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  if (loading) {
    return <div className="h-10 w-44 animate-pulse rounded-full bg-slate-200" />;
  }

  if (!user) {
    // /api/me failed or session expired — nothing to show, avoid rendering stale label
    return null;
  }

  const roleLabel = ROLES.find((r) => r.value === user.role)?.blurb ?? user.role;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-2 text-sm text-white transition hover:bg-slate-800"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <UserCircle2 className="h-5 w-5" />
        <span>
          {roleLabel} {user.name}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
            {loggingOut ? "Logging out…" : "Logout"}
          </button>
        </div>
      )}
    </div>
  );
}

function NavbarContent({ eyebrow, title }: NavbarProps) {
  const { t } = useLanguage();

  return (
    <header className="relative z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur">
      <div>
        <p className="text-sm font-medium text-blue-600">
          {eyebrow ?? t("nav.operationsCenter")}
        </p>

        <h2 className="text-xl font-semibold text-slate-900">
          {title ?? t("nav.dailyCaseOverview")}
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

        <UserMenu />
      </div>
    </header>
  );
}

export default function Navbar({ eyebrow, title }: NavbarProps) {
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
      <NavbarContent eyebrow={eyebrow} title={title} />
    </Suspense>
  );
}