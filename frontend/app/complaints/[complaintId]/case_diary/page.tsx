'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  createCaseDiary,
  getCaseByComplaint,
  loadDiaryEntriesForComplaint,
  type CreateDiaryPayload,
  type DiaryEntry,
} from "@/lib/api/caseDiary";

const emptyForm = {
  action_type: "",
  description: "",
  location: "",
  occurred_at: "",
  officer_id: "",
};

export default function CaseDiaryPage() {
  const params = useParams<{ complaintId: string }>();
  const complaintId = params?.complaintId ?? "";

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [hasCase, setHasCase] = useState(true);

  const loadDiary = async () => {
    if (!complaintId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { entries: diaryEntries, hasCase: caseExists } = await loadDiaryEntriesForComplaint(complaintId);
      setHasCase(caseExists);
      const sortedEntries = [...diaryEntries].sort((a, b) => {
        const aTime = a.occurred_at || a.created_at || "";
        const bTime = b.occurred_at || b.created_at || "";
        return bTime.localeCompare(aTime);
      });
      setEntries(sortedEntries);
    } catch (err) {
      console.error(err);
      setError("Unable to load the case diary right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDiary();
  }, [complaintId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!complaintId) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const caseRecord = await getCaseByComplaint(complaintId);
      if (!caseRecord) {
        setHasCase(false);
        setSubmitting(false);
        return;
      }

      const payload: CreateDiaryPayload = {
        case_id: caseRecord.case_id,
        officer_id: form.officer_id,
        action_type: form.action_type,
        description: form.description,
        location: form.location || undefined,
        occurred_at: form.occurred_at || undefined,
      };

      await createCaseDiary(payload);
      setForm(emptyForm);
      await loadDiary();
    } catch (err) {
      console.error(err);
      setError("Unable to create the diary entry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Case Diary</h1>
        <p className="mt-2 text-base text-slate-600">
          Review and add investigation diary entries for complaint {complaintId}.
        </p>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Add diary entry</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Action type"
            value={form.action_type}
            onChange={(event) => setForm((prev) => ({ ...prev, action_type: event.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Officer ID"
            value={form.officer_id}
            onChange={(event) => setForm((prev) => ({ ...prev, officer_id: event.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Location"
            value={form.location}
            onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            type="datetime-local"
            value={form.occurred_at}
            onChange={(event) => setForm((prev) => ({ ...prev, occurred_at: event.target.value }))}
          />
          <textarea
            className="md:col-span-2 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder="Description"
            rows={4}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Create diary entry"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Diary entries</h2>

        {loading ? (
          <p className="mt-4 text-sm text-slate-600">Loading diary entries...</p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : !hasCase ? (
          <p className="mt-4 text-sm text-slate-600">No case exists for this complaint yet.</p>
        ) : entries.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">No diary entries found for this case.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {entries.map((entry) => (
              <div key={entry.diary_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{entry.action_type || "Action"}</p>
                  <p className="text-xs text-slate-500">
                    {entry.occurred_at ? new Date(entry.occurred_at).toLocaleString() : "—"}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-700">{entry.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>Location: {entry.location || "—"}</span>
                  <span>Created: {entry.created_at ? new Date(entry.created_at).toLocaleString() : "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}