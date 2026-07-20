'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { loadDiaryEntriesForComplaint, getCaseByComplaint, type DiaryEntry } from "@/lib/api/caseDiary";
import axios from "axios";

export default function TimelinePage() {
  const params = useParams<{ complaintId: string }>();
  const complaintId = params?.complaintId ?? "";

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasCase, setHasCase] = useState(true);

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
        setError("Unable to load the investigation timeline right now.");
      } finally {
        setLoading(false);
      }
    };

    void loadEntries();
  }, [complaintId]);

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Investigation Timeline</h1>
        <p className="mt-2 text-base text-slate-600">
          Follow the investigation progress for complaint {complaintId}.
        </p>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-600">Loading timeline...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : !hasCase ? (
          <p className="text-sm text-slate-600">No case exists for this complaint yet.</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-slate-600">No timeline entries found for this case.</p>
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
                    <p className="text-sm font-semibold text-slate-900">{entry.action_type || "Action"}</p>
                    <p className="text-xs text-slate-500">
                      {entry.occurred_at ? new Date(entry.occurred_at).toLocaleString() : "—"}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{entry.description}</p>
                  <p className="mt-3 text-xs text-slate-500">Location: {entry.location || "—"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
