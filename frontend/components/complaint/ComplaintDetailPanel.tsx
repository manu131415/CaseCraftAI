"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { X, User, MapPin, Calendar, Phone, Mail, FileText, ShieldAlert } from "lucide-react";

interface ComplaintDetail {
  complaint_id: string;
  complaint_number: string;
  complaint_title?: string;
  complainant_name?: string;
  phone?: string;
  email?: string;
  crime_category?: string;
  crime_subcategory?: string;
  location?: string;
  description?: string;
  status?: string;
  is_draft?: boolean;
  attachments_count?: number;
  created_at?: string;
  incident_datetime?: string;
}

export default function ComplaintDetailPanel({
  complaintId,
  onClose,
}: {
  complaintId: string | null;
  onClose?: () => void;
}) {
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!complaintId) {
      setComplaint(null);
      return;
    }

    let cancelled = false;

    async function loadComplaint() {
      setLoading(true);
      setError(null);

      try {
        const API_BASE =
          process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

        // NOTE: adjust this endpoint/response shape if your API differs
        const response = await axios.get(
          `${API_BASE}/api/complaints/${complaintId}`
        );

        if (!cancelled) {
          setComplaint(response.data.complaint ?? response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          const msg = err?.response?.data?.detail || err?.message || String(err);
          setError(`${t("unableToLoadComplaints", "complaints")}: ${msg}`);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadComplaint();

    return () => {
      cancelled = true;
    };
  }, [complaintId]);

  if (!complaintId) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
          <FileText className="h-8 w-8 text-indigo-400" />
        </div>
        <p className="mt-4 text-base font-semibold text-slate-600">
          {t("selectComplaintPrompt", "complaints") || "No complaint selected"}
        </p>
        <p className="mt-1 max-w-xs text-sm text-slate-400">
          {t("selectComplaintHint", "complaints") ||
            "Click a complaint from the list to view its details here"}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {t("loadingComplaints", "complaints")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (!complaint) return null;

  const status = complaint.status || "Pending";
  const isDraft = complaint.is_draft === true;

  const statusClasses = isDraft
    ? "bg-orange-100 text-orange-700"
    : status.toLowerCase() === "closed"
    ? "bg-emerald-100 text-emerald-700"
    : status.toLowerCase() === "rejected"
    ? "bg-rose-100 text-rose-700"
    : "bg-indigo-100 text-indigo-700";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-200 p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
            <ShieldAlert className="h-5 w-5 text-indigo-500" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {complaint.complaint_title ||
                complaint.crime_category ||
                t("complaintList", "common")}
            </h2>
            <span
              className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
            >
              {isDraft ? t("draft", "complaints") : t(status, "complaints")}
            </span>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                {t("complainant", "complaints")}
              </p>
              <p className="text-sm text-slate-800">
                {complaint.complainant_name || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                {t("location", "complaints")}
              </p>
              <p className="text-sm text-slate-800">
                {complaint.location || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Phone
              </p>
              <p className="text-sm text-slate-800">
                {complaint.phone || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                Email
              </p>
              <p className="text-sm text-slate-800">
                {complaint.email || "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                {t("date", "common")}
              </p>
              <p className="text-sm text-slate-800">
                {complaint.created_at
                  ? new Date(complaint.created_at).toLocaleDateString()
                  : "-"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">
                {t("crimeCategory", "complaints")}
              </p>
              <p className="text-sm text-slate-800">
                {complaint.crime_category || "-"}
                {complaint.crime_subcategory
                  ? ` / ${complaint.crime_subcategory}`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        {complaint.description && (
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">
              Description
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {complaint.description}
            </p>
          </div>
        )}

        <div className="flex gap-3 border-t border-slate-200 pt-4">
          <Link
            href={`/complaints/${complaint.complaint_id}`}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            {t("view", "common")} full page
          </Link>

          {isDraft && (
            <Link
              href={`/complaints/${complaint.complaint_id}/submit`}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
            >
              {t("submit", "common")}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}