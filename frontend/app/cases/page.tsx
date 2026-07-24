"use client";

import { useState } from "react";
import Navbar from "@/components/layout/shared/Navbar";
import Sidebar from "@/components/layout/io/Sidebar";
import CaseList from "@/components/case/CaseList";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function CasesPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8">

          {/* Header */}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              {t("cases.title", "cases")}
            </h1>

            <p className="mt-2 text-slate-600">
              {t("cases.subtitle", "cases")}
            </p>
          </div>

          {/* Filter Toolbar */}

          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              {/* Search */}

              <input
                type="text"
                placeholder={t("cases.searchPlaceholder", "cases")}
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
                <option value="">{t("cases.status", "cases")}</option>

                <option>{t("cases.caseCreated", "cases")}</option>
                <option>{t("cases.firRegistered", "cases")}</option>
                <option>{t("cases.underInvestigation", "cases")}</option>
                <option>{t("cases.evidenceCollection", "cases")}</option>
                <option>{t("cases.chargeSheetFiled", "cases")}</option>
                <option>{t("cases.trial", "cases")}</option>
                <option>{t("cases.closed", "cases")}</option>
              </select>

              {/* Priority */}

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">
                  {t("cases.priority", "cases")}
                </option>

                <option>{t("high, common")}</option>
                <option>{t("medium, common")}</option>
                <option>{t("low, common")}</option>
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
                {t("cases.clearFilters", "cases")}
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