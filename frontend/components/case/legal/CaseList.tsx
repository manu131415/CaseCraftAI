"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Inbox,
  Loader2,
  AlertTriangle,
  Search,
  Clock,
  CircleAlert,
  CheckCircle2,
  FileText,
  Calendar,
  Shield,
  Tag,
  Activity,
  AlignLeft,
  Lock,
} from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface CaseSummary {
  case_id: string;
  case_number?: string;
  complaint_id?: string;
  complaint_number?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  created_at?: string;
  fir_no?: string;
  fir_year?: string;
  district?: string;
  police_station?: string;
  current_stage?: string;
}

type TFunc = ReturnType<typeof useLanguage>["t"];

function StatusBadge({ status, t }: { status: string; t: TFunc }) {
  const statusClass =
    status === "Closed"
      ? "bg-emerald-100 text-emerald-700"
      : status === "Under Investigation"
      ? "bg-amber-100 text-amber-700"
      : status === "FIR Registered"
      ? "bg-indigo-100 text-indigo-700"
      : "bg-slate-100 text-slate-700";

  const Icon = status === "Closed" ? CheckCircle2 : Clock;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {t(status, "cases")}
    </span>
  );
}

function PriorityBadge({ priority, t }: { priority: string; t: TFunc }) {
  const priorityClass =
    priority === "High" || priority === "Urgent"
      ? "bg-red-100 text-red-700"
      : priority === "Medium"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-green-100 text-green-700";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${priorityClass}`}
    >
      {(priority === "High" || priority === "Urgent") && <CircleAlert className="h-3.5 w-3.5" />}
      {t(priority.toLowerCase(), "common")}
    </span>
  );
}

export default function CaseList({
  initialCases,
  search = "",
  status = "",
  priority = "",
}: {
  initialCases?: CaseSummary[];
  search?: string;
  status?: string;
  priority?: string;
}) {
  const [cases, setCases] = useState<CaseSummary[]>(initialCases || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    async function loadCases() {
      try {
        const API_BASE =
          process.env.NEXT_PUBLIC_API_BASE_URL ??
          "http://localhost:8000";

        if (!initialCases) {
          const response = await axios.get(`${API_BASE}/api/cases`);
          setCases(response.data.cases || []);
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            t("failedToLoad", "cases")
        );
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, [initialCases, t]);

  useEffect(() => {
    if (initialCases) {
      setCases(initialCases);
    }
  }, [initialCases]);

  // Filter and sort cases (Newest First)
  const filteredCases = useMemo(() => {
    const q = search.trim().toLowerCase();

    const filtered = cases.filter((caseItem) => {
      const matchesSearch =
        q === "" ||
        caseItem.case_number?.toLowerCase().includes(q) ||
        caseItem.complaint_number?.toLowerCase().includes(q) ||
        caseItem.title?.toLowerCase().includes(q) ||
        caseItem.description?.toLowerCase().includes(q);

      const matchesStatus =
        status === "" || caseItem.status?.toLowerCase() === status.toLowerCase();

      const matchesPriority =
        priority === "" || caseItem.priority?.toLowerCase() === priority.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });

    return filtered.sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });
  }, [cases, search, status, priority]);

  useEffect(() => {
    if (filteredCases.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !filteredCases.some((c) => c.case_id === selectedId)) {
      setSelectedId(filteredCases[0].case_id);
    }
  }, [filteredCases, selectedId]);

  const selectedCase = filteredCases.find((c) => c.case_id === selectedId) || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-10 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        {t("loadingCases", "cases")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:h-[calc(100vh-260px)] lg:min-h-[520px] lg:flex-row">
      {/* Left pane: scrollable case list */}
      <div className="flex w-full flex-col border-b border-slate-200 lg:h-full lg:w-[380px] lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="shrink-0 border-b border-slate-200 px-5 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            {t("title", "cases")}{" "}
            <span className="font-normal text-slate-400">({filteredCases.length})</span>
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredCases.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-slate-500">
              <Inbox className="h-8 w-8 text-slate-300" />
              <p className="text-sm">{t("noCasesFound", "cases")}</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {filteredCases.map((caseItem) => {
                const isSelected = caseItem.case_id === selectedId;
                const itemStatus = caseItem.status || "Open";
                const itemPriority = caseItem.priority || "Medium";

                return (
                  <li key={caseItem.case_id}>
                    <button
                      onClick={() => setSelectedId(caseItem.case_id)}
                      className={`w-full px-5 py-4 text-left transition-colors ${
                        isSelected
                          ? "border-l-4 border-indigo-600 bg-indigo-50/70"
                          : "border-l-4 border-transparent hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="line-clamp-2 font-semibold leading-snug text-slate-800">
                          {caseItem.title || t("untitledCase", "cases")}
                        </p>
                        <PriorityBadge priority={itemPriority} t={t} />
                      </div>

                      <p className="mt-1.5 truncate text-xs text-slate-500 flex items-center gap-1">
                        <Tag className="h-3 w-3 text-slate-400 shrink-0" />
                        {[
                          caseItem.case_number ? `#${caseItem.case_number}` : null,
                          caseItem.complaint_number,
                        ]
                          .filter(Boolean)
                          .join(" \u00b7 ")}
                      </p>

                      {(caseItem.fir_no || caseItem.police_station || caseItem.district) && (
                        <p className="mt-0.5 truncate text-xs text-slate-500 flex items-center gap-1">
                          <Shield className="h-3 w-3 text-slate-400 shrink-0" />
                          {[
                            caseItem.fir_no
                              ? `${t("firNumber", "cases")} ${caseItem.fir_no}${
                                  caseItem.fir_year ? `/${caseItem.fir_year}` : ""
                                }`
                              : null,
                            caseItem.police_station || caseItem.district,
                          ]
                            .filter(Boolean)
                            .join(" \u00b7 ")}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <StatusBadge status={itemStatus} t={t} />
                        <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {caseItem.created_at
                            ? new Date(caseItem.created_at).toLocaleDateString()
                            : "-"}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Right pane: View-Only case details */}
      <div className="flex-1 overflow-y-auto">
        {!selectedCase ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center text-slate-400">
            <Search className="h-8 w-8 text-slate-300" />
            <p className="text-sm">{t("selectCasePrompt", "cases")}</p>
          </div>
        ) : (
          <div className="p-6 lg:p-8 space-y-6">
            {/* Header & Badges */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {selectedCase.case_number || selectedCase.case_id.slice(0, 8)}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <Lock className="h-3 w-3 text-slate-400" /> View Only
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-bold text-slate-800">
                  {selectedCase.title || "-"}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <PriorityBadge priority={selectedCase.priority || "Medium"} t={t} />
                <StatusBadge status={selectedCase.status || "Open"} t={t} />
              </div>
            </div>

            {/* Read-Only Structured Details Grid */}
            <dl className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-5 sm:grid-cols-2">
              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
                <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Tag className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  {t("complaintNumber", "cases")}
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {selectedCase.complaint_number || "-"}
                </dd>
              </div>

              <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
                <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                  {t("createdDate", "cases")}
                </dt>
                <dd className="mt-1 text-sm font-medium text-slate-800">
                  {selectedCase.created_at
                    ? new Date(selectedCase.created_at).toLocaleDateString()
                    : "-"}
                </dd>
              </div>

              {(selectedCase.fir_no || selectedCase.police_station || selectedCase.district) && (
                <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
                  <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Shield className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    {t("firDetails", "cases")}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">
                    {[
                      selectedCase.fir_no
                        ? `${t("firNumber", "cases")} ${selectedCase.fir_no}${
                            selectedCase.fir_year ? `/${selectedCase.fir_year}` : ""
                          }`
                        : null,
                      selectedCase.police_station,
                      selectedCase.district,
                    ]
                      .filter(Boolean)
                      .join(" \u00b7 ")}
                  </dd>
                </div>
              )}

              {selectedCase.current_stage && (
                <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
                  <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Activity className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    {t("currentStage", "cases")}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800">{selectedCase.current_stage}</dd>
                </div>
              )}

              {selectedCase.description && (
                <div className="sm:col-span-2 bg-white p-3.5 rounded-lg border border-slate-200/80 shadow-xs">
                  <dt className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
                    <AlignLeft className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                    {t("description", "cases")}
                  </dt>
                  <dd className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-200/60">
                    {selectedCase.description}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}