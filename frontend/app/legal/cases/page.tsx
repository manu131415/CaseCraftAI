"use client";

import { useState } from "react";
import Navbar from "@/components/layout/shared/Navbar";
import Sidebar from "@/components/layout/legal/Sidebar";
import CaseList from "@/components/case/legal/CaseList";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function CasesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8">

          {/* Header */}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              {t("title", "cases")}
            </h1>

            <p className="mt-2 text-slate-600">
              {t("subtitle", "cases")}
            </p>
          </div>

          {/* Filter Toolbar */}

          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              {/* Search */}

              <input
                type="text"
                placeholder={t("searchPlaceholder", "cases")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              {/* Status */}

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">{t("status", "cases")}</option>

                <option>{t("caseCreated", "cases")}</option>
                <option>{t("firRegistered", "cases")}</option>
                <option>{t("underInvestigation", "cases")}</option>
                <option>{t("evidenceCollection", "cases")}</option>
                <option>{t("chargeSheetFiled", "cases")}</option>
                <option>{t("trial", "cases")}</option>
                <option>{t("closed", "cases")}</option>
              </select>

              {/* Priority */}

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">{t("priority", "cases")}</option>

                <option>{t("common.high")}</option>
                <option>{t("common.medium")}</option>
                <option>{t("common.low")}</option>
              </select>

              {/* Clear */}

              <button
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPriority("");
                }}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 hover:bg-slate-100"
              >
                {t("clearFilters", "cases")}
              </button>

            </div>

          </div>

          {/* Case Table */}

          <CaseList
            search={search}
            status={status}
            priority={priority}
          />

        </main>
      </div>
    </div>
  );
}