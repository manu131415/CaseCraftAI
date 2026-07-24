'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { useLanguage } from "@/app/providers/LanguageProvider";
import {
  createCaseDiary,
  getCaseByComplaint,
  loadDiaryEntriesForComplaint,
  uploadToCloudinary,
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

        // Try to upload to Cloudinary if configured
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
            // Fall back to local URL
            fileUrl = URL.createObjectURL(file);
          }
        } else {
          // No Cloudinary config, use local URL
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
    <div className="space-y-6 p-6">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{t("caseDiary", "cases")}</h1>
        <p className="mt-2 text-base text-slate-600">
          {t("caseDiaryDescription", "complaints")} {complaintId}.
        </p>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">{t("addDiaryEntry", "complaints")}</h2>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder={t("actionTypePlaceholder", "complaints")}
            value={form.action_type}
            onChange={(event) => setForm((prev) => ({ ...prev, action_type: event.target.value }))}
            required
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder={t("officerIdOptional", "complaints")}
            value={form.officer_id}
            onChange={(event) => setForm((prev) => ({ ...prev, officer_id: event.target.value }))}
          />
          <input
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            placeholder={t("locationOptional", "complaints")}
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
            placeholder={t("description", "cases")}
            rows={4}
            value={form.description}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            required
          />
          
          {/* File upload section */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">{t("attachmentsPhotosFiles", "complaints")}</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer hover:bg-slate-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">{t("clickToUpload", "complaints")}</span> {t("orDragDrop", "complaints")}
                  </p>
                  <p className="text-xs text-slate-500">{t("supportedFiles", "complaints")}</p>
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
          </div>

          {/* Display uploaded attachments */}
          {attachments.length > 0 && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-slate-700 mb-2">{t("uploadedFiles", "complaints")} ({attachments.length})</p>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {attachment.file_type === 'photo' ? (
                        <svg className="w-5 h-5 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                        </svg>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{attachment.filename}</p>
                        <p className="text-xs text-slate-500">{attachment.file_type}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="ml-2 text-red-600 hover:text-red-700 text-sm"
                    >
                      {t("delete", "common")}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="md:col-span-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting || uploadingFiles}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? t("saving", "complaints") : uploadingFiles ? t("uploading", "complaints") : t("createDiaryEntry", "complaints")}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">{t("diaryEntries", "complaints")}</h2>

        {loading ? (
          <p className="mt-4 text-sm text-slate-600">{t("loadingDiaryEntries", "complaints")}</p>
        ) : error ? (
          <p className="mt-4 text-sm text-red-600">{error}</p>
        ) : !hasCase ? (
          <p className="mt-4 text-sm text-slate-600">{t("noCaseExists", "complaints")}</p>
        ) : entries.length === 0 ? (
          <p className="mt-4 text-sm text-slate-600">{t("noDiaryEntries", "complaints")}</p>
        ) : (
          <div className="mt-4 space-y-3">
            {entries.map((entry) => (
              <div key={entry.diary_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">{entry.action_type || t("action", "complaints")}</p>
                  <p className="text-xs text-slate-500">
                    {entry.occurred_at ? new Date(entry.occurred_at).toLocaleString() : t("notAvailable", "complaints")}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-700">{entry.description}</p>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                  <span>{t("location", "cases")}: {entry.location || t("notAvailable", "complaints")}</span>
                  <span>{t("officer", "complaints")}: {entry.officer_id || t("notAvailable", "complaints")}</span>
                  <span>{t("created", "complaints")}: {entry.created_at ? new Date(entry.created_at).toLocaleString() : t("notAvailable", "complaints")}</span>
                </div>
                
                {/* Display attachments if any */}
                {entry.attachments && entry.attachments.length > 0 && (
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <p className="text-xs font-semibold text-slate-700 mb-2">{t("attachments", "complaints")} ({entry.attachments.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.attachments.map((attachment, idx) => (
                        <a
                          key={idx}
                          href={attachment.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs text-blue-700 hover:bg-blue-100"
                        >
                          {attachment.file_type === 'photo' ? (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.657 6.243A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H7a1 1 0 01-1-1v-6z" />
                            </svg>
                          )}
                          {attachment.filename}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}