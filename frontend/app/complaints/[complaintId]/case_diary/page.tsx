'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"; // 1. Added useRouter
import axios from "axios";
import { useLanguage } from "@/app/providers/LanguageProvider";
import IOSidebar from "@/components/layout/io/Sidebar";
import Navbar from "@/components/layout/shared/Navbar";
import {
  createCaseDiary,
  getCaseByComplaint,
  loadDiaryEntriesForComplaint,
  type CreateDiaryPayload,
  type DiaryEntry,
  type Attachment,
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
  const router = useRouter(); // 2. Initialized router

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [hasCase, setHasCase] = useState(true);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const { t } = useLanguage();

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
      setError(t("unableToLoadCaseDiary", "complaints"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDiary();
  }, [complaintId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!complaintId) return;

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
        officer_id: form.officer_id || undefined,
        action_type: form.action_type,
        description: form.description,
        location: form.location || undefined,
        occurred_at: form.occurred_at || undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      await createCaseDiary(payload);
      setForm(emptyForm);
      setAttachments([]);
      await loadDiary();
    } catch (err: any) {
      console.error(err);
      const message = err?.response?.data?.detail || err?.message || t("unableToCreateDiaryEntry", "complaints");
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setUploadingFiles(true);
    setError(null);

    try {
      const newAttachments: Attachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        let fileUrl = '';

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        if (cloudName) {
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'unsigned_preset');
            formData.append('folder', 'casecraft/diary');

            const uploadRes = await axios.post(
              `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
              formData
            );
            fileUrl = uploadRes.data.secure_url;
          } catch (uploadErr) {
            console.error('Cloudinary upload failed:', uploadErr);
            fileUrl = URL.createObjectURL(file);
          }
        } else {
          fileUrl = URL.createObjectURL(file);
        }

        newAttachments.push({
          filename: file.name,
          file_url: fileUrl,
          file_type: file.type.startsWith('image/') ? 'photo' : 'file',
          uploaded_at: new Date().toISOString(),
        });
      }

      setAttachments((prev) => [...prev, ...newAttachments]);
      event.target.value = '';
    } catch (err) {
      console.error('Error handling files:', err);
      setError(t("failedToUploadFiles", "complaints"));
    } finally {
      setUploadingFiles(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <IOSidebar />

        <main className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
          {/* Header Banner */}
          <div className="mb-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{t("caseDiary", "cases") || "Case Diary Operations"}</h1>
              <p className="text-xs text-slate-500">
                {t("caseDiaryDescription", "complaints") || "Manage investigation logs for Complaint"} #{complaintId}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-xs bg-slate-100 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-medium">
                Total Entries: <span className="font-bold text-indigo-600">{entries.length}</span>
              </div>
              <button 
                type="button"
                onClick={() => router.push("/cases")} 
                className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition"
              >
                ⬅️ {t("backToCases", "complaints") || "Back to Cases"}
              </button>
            </div>
          </div>

          {/* TWO-COLUMN GRID CONTAINER */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
            
            {/* LEFT COLUMN: Entry Creation Form (5 Cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  ✍️ {t("addDiaryEntry", "complaints") || "New Diary Entry"}
                </h2>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                <form className="space-y-3" onSubmit={handleSubmit}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Action Type *</label>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="e.g., Witness Statement, Site Inspection"
                      value={form.action_type}
                      onChange={(event) => setForm((prev) => ({ ...prev, action_type: event.target.value }))}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Officer ID</label>
                      <input
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="e.g., IO-9021"
                        value={form.officer_id}
                        onChange={(event) => setForm((prev) => ({ ...prev, officer_id: event.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                      <input
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="e.g., Sector 14"
                        value={form.location}
                        onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Occurred At Date & Time</label>
                    <input
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      type="datetime-local"
                      value={form.occurred_at}
                      onChange={(event) => setForm((prev) => ({ ...prev, occurred_at: event.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
                    <textarea
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Detailed activity description..."
                      rows={3}
                      value={form.description}
                      onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
                      required
                    />
                  </div>

                  {/* Attachment Box */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Attachments</label>
                    <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer hover:bg-slate-50 transition">
                      <div className="flex flex-col items-center justify-center pt-2 pb-2">
                        <svg className="w-6 h-6 text-slate-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <p className="text-xs text-slate-600">
                          <span className="font-semibold">Click to upload</span> or drag & drop
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*,.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        disabled={uploadingFiles}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Uploaded File List */}
                  {attachments.length > 0 && (
                    <div className="space-y-1">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between bg-slate-50 rounded p-2 text-xs border border-slate-200">
                          <span className="truncate max-w-[200px] text-slate-700">{attachment.filename}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="text-red-500 font-bold hover:text-red-700"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {error && (
                    <div className="rounded-lg bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting || uploadingFiles}
                    className="w-full mt-2 rounded-lg bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-all"
                  >
                    {submitting ? "Saving Entry..." : uploadingFiles ? "Uploading Files..." : "➕ Create Diary Entry"}
                  </button>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: Chronological Timeline Feed (7 Cols) */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  📋 {t("diaryEntries", "complaints") || "Previous Entries Feed"}
                </h2>
                <span className="text-xs text-slate-400">Newest First</span>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {loading ? (
                  <div className="text-center py-12 text-xs text-slate-500">Loading case entries...</div>
                ) : !hasCase ? (
                  <div className="text-center py-12 text-xs text-slate-500">No active case found for this complaint.</div>
                ) : entries.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    No entries logged yet. Fill out the form on the left to record the first entry.
                  </div>
                ) : (
                  entries.map((entry) => (
                    <div
                      key={entry.diary_id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:bg-slate-50 hover:shadow-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
                        <span className="font-bold text-xs text-blue-900 bg-blue-100 px-2.5 py-0.5 rounded-full">
                          {entry.action_type || "General Note"}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          🕒 {entry.occurred_at ? new Date(entry.occurred_at).toLocaleString() : "Date N/A"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {entry.description}
                      </p>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex flex-wrap gap-4 text-[11px] text-slate-500">
                        <span>📍 Location: <strong className="text-slate-700">{entry.location || "N/A"}</strong></span>
                        <span>👮 Officer: <strong className="text-slate-700">{entry.officer_id || "N/A"}</strong></span>
                      </div>

                      {/* Attached Documents */}
                      {entry.attachments && entry.attachments.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-slate-200">
                          <p className="text-[11px] font-semibold text-slate-600 mb-1.5">
                            Attached Files ({entry.attachments.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {entry.attachments.map((att, idx) => (
                              <a
                                key={idx}
                                href={att.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-md bg-white border border-slate-300 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition shadow-xs"
                              >
                                📄 {att.filename}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}