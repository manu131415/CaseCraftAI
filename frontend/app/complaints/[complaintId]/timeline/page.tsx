'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadDiaryEntriesForComplaint, getCaseByComplaint, type DiaryEntry } from "@/lib/api/caseDiary";
import axios from "axios";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function TimelinePage() {
  const params = useParams<{ complaintId: string }>();
  const complaintId = params?.complaintId ?? "";

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCase, setHasCase] = useState(true);
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

        // fetch complaint to get registration timestamp
        let complaintCreatedAt: string | undefined = undefined;
        try {
          const cre = await axios.get(`${API_BASE}/api/complaints/${encodeURIComponent(complaintId)}`);
          const cdata = cre.data.complaint || cre.data || null;
          complaintCreatedAt = cdata?.created_at || cdata?.createdAt || undefined;
        } catch (e) {
          // ignore
        }

        const caseRecord = await getCaseByComplaint(complaintId);

        const allEntries: DiaryEntry[] = [];

        // registration event
        allEntries.push({
          diary_id: `reg-${complaintId}`,
          case_id: caseRecord?.case_id || "",
          officer_id: "",
          action_type: "Complaint registered",
          description: `Complaint ${complaintId} was registered`,
          occurred_at: complaintCreatedAt || null,
        });

        if (caseRecord) {
          setHasCase(true);
          allEntries.push({
            diary_id: `case-${caseRecord.case_id}`,
            case_id: caseRecord.case_id,
            officer_id: "",
            action_type: "Case created",
            description: `Case ${caseRecord.case_number || caseRecord.case_id} was created for this complaint`,
            occurred_at: caseRecord.created_at || caseRecord.createdAt || null,
          });

          // load diary entries for the case
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

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{t("investigationTimeline","complaints")}</h1>
        <p className="mt-2 text-base text-slate-600">
          {t("followInvestigation","complaints")} {complaintId}.
        </p>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-600">{t("loadingTimeline","complaints")}</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !hasCase ? (
          <p className="text-sm text-slate-600">{t("noCaseExists","complaints")}</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-slate-600">{t("noTimelineEntries","complaints")}</p>
        ) : (
          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={entry.diary_id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="mt-1 h-3 w-3 rounded-full bg-blue-600" />
                  {index < entries.length - 1 && <div className="mt-1 h-full w-px bg-slate-200" />}
                </div>
                <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{entry.action_type || t("action","complaints")}</p>
                    <p className="text-xs text-slate-500">
                      {entry.occurred_at ? new Date(entry.occurred_at).toLocaleString() : "—"}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{entry.description}</p>
                  <p className="mt-3 text-xs text-slate-500">{t("location","cases")}: {entry.location || "—"}</p>
                  
                  {/* Display attachments if any */}
                  {entry.attachments && entry.attachments.length > 0 && (
                    <div className="mt-3 border-t border-slate-200 pt-3">
                      <p className="text-xs font-semibold text-slate-700 mb-2">{t("attachments","complaints")} ({entry.attachments.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.attachments.map((attachment, idx) => {
                          const isImage = attachment.file_type === 'photo' || (attachment.file_url && /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment.file_url));
                          
                          return (
                            <a
                              key={idx}
                              href={attachment.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                            >
                              {isImage ? (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                                </svg>
                              ) : (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.657 6.243A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6z" />
                                </svg>
                              )}
                              {attachment.filename}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
