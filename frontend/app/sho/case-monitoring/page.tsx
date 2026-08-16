'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Activity,
  Clock,
  ChevronRight,
  User,
  Hash,
  Filter,
  ShieldAlert,
  MapPin,
  Paperclip,
  FolderKanban,
  CheckCircle2,
  Calendar,
  Tag,
  FileText,
  BadgeAlert
} from "lucide-react";
import Sidebar from "@/components/layout/sho/Sidebar";
import Navbar from "@/components/layout/shared/Navbar";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface CaseRecord {
  case_id?: string;
  id?: string;
  case_number?: string;
  complaint_id?: string;
  complaint_number?: string;
  title?: string;
  status?: string;
  priority?: string;
  category?: string;
  assigned_officer_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface TimelineEntry {
  diary_id: string;
  case_id: string;
  officer_id?: string;
  action_type: string;
  description: string;
  location?: string;
  occurred_at?: string;
  created_at?: string;
  attachments?: Array<{ filename: string; file_url: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const safeGet = async (url: string) => {
  try {
    const res = await axios.get(url, { validateStatus: (s) => s < 500 });
    if (res.status === 404) return null;
    return res.data;
  } catch {
    return null;
  }
};

export default function CaseMonitoringPage() {
  const { t } = useLanguage();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  useEffect(() => {
    const fetchCases = async () => {
      setLoadingCases(true);
      try {
        const data = await safeGet(`${API_BASE}/api/cases`);
        const caseList: CaseRecord[] = Array.isArray(data) ? data : data?.cases || [];
        
        // Sort initial fetched cases by created_at (newest first)
        caseList.sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeB - timeA;
        });

        setCases(caseList);
        if (caseList.length > 0) setSelectedCase(caseList[0]);
      } catch (err) {
        console.error("Error fetching cases:", err);
      } finally {
        setLoadingCases(false);
      }
    };
    void fetchCases();
  }, []);

  useEffect(() => {
    if (!selectedCase) return;

    const loadCaseTimeline = async () => {
      setLoadingTimeline(true);
      const caseId = selectedCase.case_id || selectedCase.id || "";
      const complaintId = selectedCase.complaint_id || selectedCase.complaint_number || "";
      const idsToTry = Array.from(new Set([caseId, complaintId].filter(Boolean)));
      
      const allEntries: TimelineEntry[] = [];

      if (complaintId) {
        allEntries.push({
          diary_id: `reg-${complaintId}`,
          case_id: caseId,
          officer_id: "System",
          action_type: "Complaint Registered",
          description: `Complaint #${complaintId} was registered in system.`,
          occurred_at: selectedCase.created_at || new Date().toISOString(),
        });
      }

      for (const searchId of idsToTry) {
        const diaryData = await safeGet(`${API_BASE}/api/case-diary/case/${encodeURIComponent(searchId)}`);
        const diaryEntries = diaryData?.diary_entries || (Array.isArray(diaryData) ? diaryData : []);

        if (Array.isArray(diaryEntries) && diaryEntries.length > 0) {
          const existingIds = new Set(allEntries.map((e) => e.diary_id));
          diaryEntries.forEach((entry: TimelineEntry) => {
            if (!existingIds.has(entry.diary_id)) {
              allEntries.push(entry);
            }
          });
          break;
        }
      }

      // Sort timeline entries (newest first)
      const sorted = allEntries.sort((a, b) => {
        const timeA = new Date(a.occurred_at || a.created_at || 0).getTime();
        const timeB = new Date(b.occurred_at || b.created_at || 0).getTime();
        return timeB - timeA;
      });

      setTimeline(sorted);
      setLoadingTimeline(false);
    };

    void loadCaseTimeline();
  }, [selectedCase]);

  // Filter and sort cases (newest first)
  const filteredCases = cases
    .filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const caseNum = (c.case_number || c.case_id || "").toLowerCase();
      const compNum = (c.complaint_number || c.complaint_id || "").toLowerCase();
      const title = (c.title || "").toLowerCase();
      
      const matchesQuery = !q || caseNum.includes(q) || compNum.includes(q) || title.includes(q);
      const matchesPriority = priorityFilter === "ALL" || (c.priority || "").toUpperCase() === priorityFilter.toUpperCase();
      return matchesQuery && matchesPriority;
    })
    .sort((a, b) => {
      const timeA = new Date(a.created_at || 0).getTime();
      const timeB = new Date(b.created_at || 0).getTime();
      return timeB - timeA;
    });

  const getPriorityBadge = (priority?: string) => {
    switch (priority?.toUpperCase()) {
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

  const getLeftBorderClass = (priority?: string) => {
    switch (priority?.toUpperCase()) {
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
          {/* Header Search & Filter */}
          <div className="mb-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search case title, complaint number, or case ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          {/* Two-Pane Layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
            {/* Left Pane: Detailed Case Cards */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FolderKanban className="h-4 w-4 text-blue-600" />
                  <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Station Active Cases</h2>
                </div>
                <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-bold border border-blue-100">
                  {filteredCases.length} Loaded
                </span>
              </div>

              <div className="p-3 overflow-y-auto flex-1 space-y-3">
                {loadingCases ? (
                  <div className="py-12 text-center text-xs text-slate-400">Loading station cases...</div>
                ) : filteredCases.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">No matching cases found.</div>
                ) : (
                  filteredCases.map((c) => {
                    const activeId = c.case_id || c.id;
                    const selectedId = selectedCase?.case_id || selectedCase?.id;
                    const isSelected = activeId === selectedId;

                    return (
                      <div
                        key={activeId}
                        onClick={() => setSelectedCase(c)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all shadow-2xs ${getLeftBorderClass(c.priority)} ${
                          isSelected
                            ? "bg-blue-50/70 border-blue-400 ring-1 ring-blue-500"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                        }`}
                      >
                        {/* 1. Title at Top */}
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs font-bold text-slate-900 leading-snug">
                            {c.title || `Case #${c.case_number || activeId}`}
                          </h3>
                          <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "text-blue-600 translate-x-0.5" : "text-slate-300"}`} />
                        </div>

                        {/* 2. Badges Row */}
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 text-[10px] uppercase rounded-md border ${getPriorityBadge(c.priority)}`}>
                            {c.priority || "NORMAL"}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 rounded-md border border-emerald-200 uppercase">
                            {c.status || "ACTIVE"}
                          </span>
                          {c.category && (
                            <span className="px-2 py-0.5 text-[10px] font-medium text-slate-600 bg-slate-100 rounded-md border border-slate-200 flex items-center gap-1">
                              <Tag className="h-2.5 w-2.5 text-slate-400" />
                              {c.category}
                            </span>
                          )}
                        </div>

                        {/* 3. Detailed Data Grid */}
                        <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Hash className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="font-mono font-medium">Ref: #{c.case_number || activeId}</span>
                          </div>

                          <div className="flex items-center gap-1 text-slate-600">
                            <User className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">IO: <strong>{c.assigned_officer_id || "Unassigned"}</strong></span>
                          </div>

                          {c.complaint_number && (
                            <div className="flex items-center gap-1 text-slate-500 col-span-2">
                              <FileText className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>Complaint: <strong className="font-mono text-slate-700">#{c.complaint_number}</strong></span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 text-slate-400 col-span-2 text-[10px]">
                            <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                            <span>Registered: {c.created_at ? new Date(c.created_at).toLocaleDateString() : "N/A"}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Pane: Live Case Timeline */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
              {selectedCase ? (
                <>
                  <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-start gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1 mb-1">
                        <Activity className="h-3.5 w-3.5" /> Selected Case Timeline
                      </span>
                      <h2 className="text-base font-bold text-slate-900">
                        {selectedCase.title || `Case #${selectedCase.case_number || selectedCase.case_id}`}
                      </h2>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3 text-slate-400" /> ID: {selectedCase.case_number || selectedCase.case_id}
                        </span>
                        {selectedCase.complaint_number && (
                          <span>• Complaint: #{selectedCase.complaint_number}</span>
                        )}
                        <span>• Officer: {selectedCase.assigned_officer_id || "Unassigned"}</span>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs font-mono bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md font-bold border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {selectedCase.status || "ACTIVE"}
                    </span>
                  </div>

                  <div className="p-6 overflow-y-auto flex-1">
                    {loadingTimeline ? (
                      <div className="py-12 text-center text-xs text-slate-400">Loading timeline events from DB...</div>
                    ) : timeline.length === 0 ? (
                      <div className="py-12 text-center text-xs text-slate-400">No diary timeline entries found for this case.</div>
                    ) : (
                      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {timeline.map((entry) => (
                          <div key={entry.diary_id} className="relative group">
                            <div className="absolute -left-[23px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-2xs bg-blue-600" />
                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition hover:bg-white hover:shadow-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2 mb-2">
                                <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-md border border-blue-200">
                                  {entry.action_type || "Activity"}
                                </span>
                                <time className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                                  <Clock className="h-3 w-3 text-slate-400" />
                                  {entry.occurred_at ? new Date(entry.occurred_at).toLocaleString() : "N/A"}
                                </time>
                              </div>

                              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                                {entry.description}
                              </p>

                              <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap gap-4 text-[11px] text-slate-500">
                                {entry.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-slate-400" /> <strong>{entry.location}</strong>
                                  </span>
                                )}
                                {entry.officer_id && (
                                  <span className="flex items-center gap-1">
                                    <User className="h-3 w-3 text-slate-400" /> <strong>{entry.officer_id}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs p-6">
                  <Activity className="h-8 w-8 text-slate-300 mb-2" />
                  Select a case from the left list to load live DB timeline.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}