"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  RotateCcw,
  Briefcase,
  UserCheck,
  Hash,
  Calendar,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Phone,
  BadgeCheck,
  FileText,
  ChevronRight,
  Shield,
  Tag,
  User
} from "lucide-react";
import Navbar from "@/components/layout/shared/Navbar";
import Sidebar from "@/components/layout/sho/Sidebar";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface AssignedOfficer {
  officer_id: string;
  name: string;
  rank: string;
  badge_number: string;
  phone?: string;
  email?: string;
  assigned_date?: string;
}

interface CaseRecord {
  case_id?: string;
  id?: string;
  case_number?: string;
  complaint_number?: string;
  complaint_id?: string;
  title?: string;
  status?: string;
  priority?: string;
  category?: string;
  description?: string;
  incident_location?: string;
  applicable_sections?: string[];
  assigned_officer?: AssignedOfficer;
  assigned_officer_id?: string;
  created_at?: string;
  updated_at?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function CasesPage() {
  const { t } = useLanguage();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  useEffect(() => {
    const fetchCases = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/cases`, { validateStatus: (s) => s < 500 });
        const list: CaseRecord[] = Array.isArray(res.data) ? res.data : res.data?.cases || [];
        setCases(list);
        if (list.length > 0) setSelectedCase(list[0]);
      } catch (err) {
        console.error("Failed to fetch cases:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchCases();
  }, []);

  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const q = search.toLowerCase().trim();
      const caseNum = (c.case_number || c.case_id || c.id || "").toLowerCase();
      const compNum = (c.complaint_number || c.complaint_id || "").toLowerCase();
      const title = (c.title || "").toLowerCase();

      const matchesSearch = !q || caseNum.includes(q) || compNum.includes(q) || title.includes(q);
      const matchesStatus = !status || (c.status || "").toLowerCase() === status.toLowerCase();
      const matchesPriority = !priority || (c.priority || "").toLowerCase() === priority.toLowerCase();

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [cases, search, status, priority]);

  // Keep selected case in sync with filtered results
  useEffect(() => {
    if (filteredCases.length > 0) {
      const currentId = selectedCase?.case_id || selectedCase?.id || selectedCase?.case_number;
      const exists = filteredCases.some(
        (c) => (c.case_id || c.id || c.case_number) === currentId
      );
      if (!exists) {
        setSelectedCase(filteredCases[0]);
      }
    } else {
      setSelectedCase(null);
    }
  }, [filteredCases, selectedCase]);

  const getPriorityBadge = (p?: string) => {
    switch (p?.toUpperCase()) {
      case "URGENT":
        return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
      case "HIGH":
        return "bg-amber-100 text-amber-800 border-amber-300 font-semibold";
      case "MEDIUM":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getPriorityBorder = (p?: string) => {
    switch (p?.toUpperCase()) {
      case "URGENT":
        return "border-l-4 border-l-rose-500";
      case "HIGH":
        return "border-l-4 border-l-amber-500";
      case "MEDIUM":
        return "border-l-4 border-l-blue-500";
      default:
        return "border-l-4 border-l-slate-400";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
          {/* Header & Filter Toolbar */}
          <div className="mb-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  {t("title", "cases")}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">{t("subtitle", "cases")}</p>
              </div>
              <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-bold border border-blue-100">
                {filteredCases.length} Cases Listed
              </span>
            </div>

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder", "cases")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("status", "cases")} (All)</option>
                <option value="Open">{t("caseCreated", "cases")}</option>
                <option value="FIR Registered">{t("firRegistered", "cases")}</option>
                <option value="Under Investigation">{t("underInvestigation", "cases")}</option>
                <option value="Evidence Collection">{t("evidenceCollection", "cases")}</option>
                <option value="Charge Sheet Filed">{t("chargeSheetFiled", "cases")}</option>
                <option value="Trial">{t("trial", "cases")}</option>
                <option value="Closed">{t("closed", "cases")}</option>
              </select>

              {/* Priority Filter */}
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("priority", "cases")} (All)</option>
                <option value="Urgent">{t("urgent", "common") || "Urgent"}</option>
                <option value="High">{t("high", "common")}</option>
                <option value="Medium">{t("medium", "common")}</option>
                <option value="Low">{t("low", "common")}</option>
              </select>

              {/* Clear */}
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPriority("");
                }}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {t("clearFilters", "cases")}
              </button>
            </div>
          </div>

          {/* Two-Panel Layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">
            {/* Left Panel: Cases Cards List */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
              <div className="p-3.5 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-blue-600" /> Active Case Registry
                </span>
              </div>

              <div className="p-3 overflow-y-auto flex-1 space-y-2.5">
                {loading ? (
                  <div className="py-12 text-center text-xs text-slate-400">Loading cases...</div>
                ) : filteredCases.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">No matching cases found.</div>
                ) : (
                  filteredCases.map((c) => {
                    const activeId = c.case_id || c.id || c.case_number;
                    const selectedId = selectedCase?.case_id || selectedCase?.id || selectedCase?.case_number;
                    const isSelected = activeId === selectedId;

                    return (
                      <div
                        key={activeId}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedCase(c)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelectedCase(c);
                          }
                        }}
                        className={`cursor-pointer rounded-xl border p-3.5 transition-all shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 ${getPriorityBorder(c.priority)} ${
                          isSelected
                            ? "bg-blue-50/70 border-blue-400 ring-1 ring-blue-500"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-bold text-slate-900 leading-snug">
                            {c.title || `Case #${c.case_number || activeId}`}
                          </h3>
                          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-blue-600 translate-x-0.5" : "text-slate-300"}`} />
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 text-[10px] uppercase rounded-md border ${getPriorityBadge(c.priority)}`}>
                            {c.priority || "NORMAL"}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200 uppercase">
                            {c.status || "Open"}
                          </span>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                          <div className="flex items-center gap-1 font-mono font-medium text-slate-700">
                            <Hash className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>Case: #{c.case_number || activeId}</span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-600 truncate">
                            <User className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">IO: <strong>{c.assigned_officer?.name || c.assigned_officer_id || "OFF001"}</strong></span>
                          </div>
                          {(c.complaint_number || c.complaint_id) && (
                            <div className="flex items-center gap-1 col-span-2 text-slate-500 text-[10px]">
                              <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>Complaint: <strong className="font-mono text-slate-700">#{c.complaint_number || c.complaint_id}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Panel: Case Details & Assigned Officer */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col overflow-hidden">
              {selectedCase ? (
                <>
                  {/* Selected Header */}
                  <div className="p-4 border-b border-slate-200 bg-slate-50/60 flex flex-wrap justify-between items-start gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1 mb-1">
                        <Briefcase className="h-3.5 w-3.5" /> Selected Case File
                      </span>
                      <h2 className="text-base font-bold text-slate-900 leading-snug">
                        {selectedCase.title || `Case #${selectedCase.case_number || selectedCase.case_id}`}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                        <span className="font-mono font-semibold text-slate-700 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          <Hash className="h-3 w-3 text-slate-400" /> Case ID: #{selectedCase.case_number || selectedCase.case_id || selectedCase.id}
                        </span>
                        {(selectedCase.complaint_number || selectedCase.complaint_id) && (
                          <span className="font-mono text-slate-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                            <FileText className="h-3 w-3 text-slate-400" /> CMP: #{selectedCase.complaint_number || selectedCase.complaint_id}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getPriorityBadge(selectedCase.priority)}`}>
                        {selectedCase.priority || "NORMAL"}
                      </span>
                      <span className="px-2.5 py-1 text-xs font-bold uppercase text-emerald-800 bg-emerald-100 rounded-lg border border-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        {selectedCase.status || "Open"}
                      </span>
                    </div>
                  </div>

                  {/* Scrollable Details Body */}
                  <div className="p-5 overflow-y-auto flex-1 space-y-5">
                    {/* Section 1: Assigned Officer Details Card */}
                    <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/60 via-slate-50/50 to-white p-4 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-blue-100 pb-2.5 mb-3">
                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                          <UserCheck className="h-4 w-4 text-blue-600" /> Assigned Investigating Officer
                        </h4>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                          <BadgeCheck className="h-3 w-3 text-blue-600" /> Primary Lead
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-start gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                            {(selectedCase.assigned_officer?.name || selectedCase.assigned_officer_id || "IO").substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{selectedCase.assigned_officer?.name || "Officer " + (selectedCase.assigned_officer_id || "OFF001")}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{selectedCase.assigned_officer?.rank || "Inspector of Police / IO"}</p>
                          </div>
                        </div>

                        <div className="space-y-1.5 text-[11px] text-slate-600 border-l sm:border-slate-200 sm:pl-3">
                          <div className="flex items-center gap-1.5">
                            <Shield className="h-3.5 w-3.5 text-slate-400" />
                            <span>Badge / ID: <strong className="font-mono text-slate-800">{selectedCase.assigned_officer?.badge_number || selectedCase.assigned_officer_id || "OFF001"}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>Contact: <strong className="text-slate-800">{selectedCase.assigned_officer?.phone || "N/A"}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Case Overview Information */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4 shadow-2xs">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                        <AlertCircle className="h-4 w-4 text-slate-500" /> Core Incident & File Details
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">Category / Offense Type</span>
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Tag className="h-3.5 w-3.5 text-slate-400" /> {selectedCase.category || "Criminal Investigation"}
                          </span>
                        </div>

                        <div>
                          <span className="text-[11px] text-slate-400 block mb-0.5">Registration Date</span>
                          <span className="font-semibold text-slate-800 flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            {selectedCase.created_at ? new Date(selectedCase.created_at).toLocaleString() : "N/A"}
                          </span>
                        </div>

                        {selectedCase.incident_location && (
                          <div className="sm:col-span-2">
                            <span className="text-[11px] text-slate-400 block mb-0.5">Incident Location</span>
                            <span className="font-semibold text-slate-800 flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" /> {selectedCase.incident_location}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Description / Summary */}
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-medium text-slate-400 block mb-1">Case Summary / Brief</span>
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                          {selectedCase.description || "Investigation opened as per formal station complaint registration. Formal inquiry and evidence collection in progress."}
                        </p>
                      </div>

                      {/* Applicable Legal Sections */}
                      {selectedCase.applicable_sections && selectedCase.applicable_sections.length > 0 && (
                        <div className="pt-2 border-t border-slate-100">
                          <span className="text-[11px] font-medium text-slate-400 block mb-1.5">Applied IPC / BNS Sections</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedCase.applicable_sections.map((sec, idx) => (
                              <span key={idx} className="px-2.5 py-1 text-xs font-mono font-semibold bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                                {sec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs p-6">
                  <Briefcase className="h-10 w-10 text-slate-300 mb-2" />
                  Select a case from the left list to view complete case information & officer details.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}