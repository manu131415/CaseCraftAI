'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { loadDiaryEntriesForComplaint, getCaseByComplaint, type DiaryEntry } from "@/lib/api/caseDiary";
import axios from "axios";
import { useLanguage } from "@/app/providers/LanguageProvider";
import IOSidebar from "@/components/layout/io/Sidebar";
import Navbar from "@/components/layout/shared/Navbar";

export default function TimelinePage() {
  const params = useParams<{ complaintId: string }>();
  const complaintId = params?.complaintId ?? "";
  const router = useRouter();

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCase, setHasCase] = useState(true);
  const [caseDetails, setCaseDetails] = useState<any>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const loadEntries = async () => {
      if (!complaintId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

        let complaintCreatedAt: string | undefined = undefined;
        try {
          const cre = await axios.get(`${API_BASE}/api/complaints/${encodeURIComponent(complaintId)}`);
          const cdata = cre.data.complaint || cre.data || null;
          complaintCreatedAt = cdata?.created_at || cdata?.createdAt || undefined;
        } catch (e) {
          // ignore
        }

        const caseRecord = await getCaseByComplaint(complaintId);
        setCaseDetails(caseRecord);

        const allEntries: DiaryEntry[] = [];

        // Registration Event
        allEntries.push({
          diary_id: `reg-${complaintId}`,
          case_id: caseRecord?.case_id || "",
          officer_id: "System",
          action_type: "Complaint Registered",
          description: `Complaint #${complaintId} was officially registered in the system.`,
          occurred_at: complaintCreatedAt || null,
        });

        if (caseRecord) {
          setHasCase(true);
          allEntries.push({
            diary_id: `case-${caseRecord.case_id}`,
            case_id: caseRecord.case_id,
            officer_id: "System",
            action_type: "Case Formalized",
            description: `Case ${caseRecord.case_number || caseRecord.case_id} was generated for this complaint.`,
            occurred_at: caseRecord.created_at || caseRecord.createdAt || null,
          });

          const { entries: diaryEntries } = await loadDiaryEntriesForComplaint(complaintId);
          allEntries.push(...(diaryEntries || []));
        } else {
          setHasCase(false);
        }

        const sortedEntries = [...allEntries].sort((a, b) => {
          const aTime = a.occurred_at || a.created_at || "";
          const bTime = b.occurred_at || b.created_at || "";
          return aTime.localeCompare(bTime);
        });

        setEntries(sortedEntries as DiaryEntry[]);
      } catch (err) {
        console.error(err);
        setError(t("unableToLoadTimeline", "complaints"));
      } finally {
        setLoading(false);
      }
    };

    void loadEntries();
  }, [complaintId]);

  // Helper function for visual icons and badges
  const getEventBadge = (actionType?: string) => {
    const type = (actionType || "").toLowerCase();
    if (type.includes("registered") || type.includes("created")) {
      return { icon: "📌", color: "bg-blue-100 text-blue-800 border-blue-200", dot: "bg-blue-600" };
    }
    if (type.includes("inspection") || type.includes("site")) {
      return { icon: "🔍", color: "bg-amber-100 text-amber-800 border-amber-200", dot: "bg-amber-500" };
    }
    if (type.includes("statement") || type.includes("witness")) {
      return { icon: "🗣️", color: "bg-purple-100 text-purple-800 border-purple-200", dot: "bg-purple-500" };
    }
    return { icon: "📝", color: "bg-slate-100 text-slate-800 border-slate-200", dot: "bg-slate-500" };
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <IOSidebar />

        <main className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
          {/* Header Bar */}
          <div className="mb-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {t("investigationTimeline", "complaints") || "Investigation Timeline"}
              </h1>
              <p className="text-xs text-slate-500">
                {t("followInvestigation", "complaints") || "Detailed chronological progress for Complaint"} #{complaintId}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.back()}
              className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
            >
              ⬅️ Back
            </button>
          </div>

          {/* Grid Layout: Timeline + Case Summary Card */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
            
            {/* MAIN TIMELINE (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Chronological Event Stream
                </h2>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-medium border border-indigo-100">
                  {entries.length} Events Logged
                </span>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {loading ? (
                  <div className="py-12 text-center text-xs text-slate-500">Loading timeline data...</div>
                ) : error ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600">{error}</div>
                ) : !hasCase ? (
                  <div className="py-12 text-center text-xs text-slate-500">No active case bound to this complaint.</div>
                ) : entries.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">No recorded timeline events.</div>
                ) : (
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {entries.map((entry) => {
                      const style = getEventBadge(entry.action_type);

                      return (
                        <div key={entry.diary_id} className="relative group">
                          {/* Timeline Dot */}
                          <div className={`absolute -left-[23px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-xs ${style.dot}`} />

                          {/* Event Card */}
                          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 transition-all hover:bg-white hover:shadow-md">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2 mb-2">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-md border ${style.color}`}>
                                <span>{style.icon}</span>
                                {entry.action_type || "Activity"}
                              </span>
                              <time className="text-[11px] font-medium text-slate-500">
                                🕒 {entry.occurred_at ? new Date(entry.occurred_at).toLocaleString() : "Date Unknown"}
                              </time>
                            </div>

                            <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                              {entry.description}
                            </p>

                            <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap gap-4 text-[11px] text-slate-500">
                              <span>📍 Location: <strong className="text-slate-700">{entry.location || "N/A"}</strong></span>
                              {entry.officer_id && (
                                <span>👮 Officer: <strong className="text-slate-700">{entry.officer_id}</strong></span>
                              )}
                            </div>

                            {/* Attachments Section */}
                            {entry.attachments && entry.attachments.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-slate-200">
                                <p className="text-[11px] font-semibold text-slate-600 mb-1.5">
                                  Evidence & Attachments ({entry.attachments.length})
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {entry.attachments.map((attachment, idx) => (
                                    <a
                                      key={idx}
                                      href={attachment.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-600 transition shadow-2xs"
                                    >
                                      📄 {attachment.filename}
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SIDE PANEL: Case Metadata & Quick Info (4 cols) */}
            <div className="lg:col-span-4 space-y-4 flex flex-col">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Overview Details
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Complaint ID:</span>
                    <span className="font-mono font-bold text-slate-800">#{complaintId}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Case ID:</span>
                    <span className="font-mono font-bold text-slate-800">
                      {caseDetails?.case_number || caseDetails?.case_id || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Investigation Status:</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      ACTIVE
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Total Milestones:</span>
                    <span className="font-bold text-slate-800">{entries.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-4 shadow-sm flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Quick Action</h4>
                  <p className="text-xs text-slate-300">
                    Need to add official updates or evidence logs to this case timeline?
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/complaints/${complaintId}/case_diary`)}
                  className="mt-4 w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition"
                >
                  ➕ Add New Diary Entry
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}