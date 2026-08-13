"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/app/providers/LanguageProvider";
import {
  User,
  MapPin,
  Calendar,
  ShieldAlert,
  FolderKanban,
  FileText,
} from "lucide-react";

interface ComplaintSummary {
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

export default function ComplaintList({
  initialComplaints,
  search = "",
  crimeCategory = "",
  crimeSubcategory = "",
  status = "",
  caseStatus = "",
  onSelect,
  selectedId,
  compact = false,
}: {
  initialComplaints?: ComplaintSummary[];
  search?: string;
  crimeCategory?: string;
  crimeSubcategory?: string;
  status?: string;
  caseStatus?: string;
  /** If provided, rows call this instead of navigating (two-pane mode) */
  onSelect?: (complaintId: string) => void;
  /** Currently selected complaint id, used to highlight the active row */
  selectedId?: string | null;
  /** Compact card-list view for narrow panes, instead of the full table */
  compact?: boolean;
}) {
  const [complaints, setComplaints] = useState<ComplaintSummary[]>(initialComplaints || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseComplaintIds, setCaseComplaintIds] = useState<Set<string>>(new Set());
  const pathname = usePathname();
  const { t } = useLanguage();
  const isCaseCreationAllowed = !!pathname && (pathname.includes("/sho") || pathname.includes("/io") || pathname.includes("/dashboard") || pathname.includes("/complaints"));
  
  useEffect(() => {
    
    async function loadData() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

        if (!initialComplaints) {
          const response = await axios.get(`${API_BASE}/api/complaints`);
          setComplaints(response.data.complaints || []);
        }

        // fetch cases to detect which complaints already have cases
        try {
          const casesRes = await axios.get(`${API_BASE}/api/cases`);
          const cases = casesRes.data.cases || [];
          const ids = new Set<string>();
          for (const c of cases) {
            if (c.complaint_id) ids.add(String(c.complaint_id));
          }
          setCaseComplaintIds(ids);
        } catch (e) {
          // non-fatal
          console.warn("Could not load cases to detect linked complaints", e);
        }
      } catch (err: any) {
        console.error("Failed to load complaints:", err);
        const msg = err?.response?.data?.detail || err?.message || String(err);
        setError(`${t("unableToLoadComplaints", "complaints")}: ${msg}`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
  if (initialComplaints) {
    setComplaints(initialComplaints);
  }
}, [initialComplaints]);

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">{t("loadingComplaints", "complaints")}</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">{error}</div>;
  }

  if (!complaints.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">{t("noComplaintsRegistered", "complaints")}</h2>
        <p className="mt-2 text-slate-600">{t("noComplaintsDescription", "complaints")}</p>
      </div>
    );
  }

  const filteredComplaints = complaints.filter((complaint) => {
  const hasCase = caseComplaintIds.has(complaint.complaint_id);

  const matchesSearch =
    search === "" ||
    complaint.complaint_number
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||
    complaint.complainant_name
      ?.toLowerCase()
      .includes(search.toLowerCase()) ||
    complaint.description
      ?.toLowerCase()
      .includes(search.toLowerCase());

  const matchesCategory =
    crimeCategory === "" ||
    complaint.crime_category === crimeCategory;

  const matchesSubcategory =
    crimeSubcategory === "" ||
    complaint.crime_subcategory === crimeSubcategory;

  const matchesStatus =
    status === "" ||
    complaint.status === status;

  const matchesCase =
    caseStatus === "" ||
    (caseStatus === "Created" && hasCase) ||
    (caseStatus === "Not Created" && !hasCase);

  return (
    matchesSearch &&
    matchesCategory &&
    matchesSubcategory &&
    matchesStatus &&
    matchesCase
  );
});

 if (compact) {
  return (
    <div className="divide-y divide-slate-200 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      {filteredComplaints.length === 0 ? (
        <div className="px-5 py-8 text-center text-sm text-slate-500">
          {t("noComplaintsMatchFilters", "complaints")}
        </div>
      ) : (
        filteredComplaints.map((complaint) => {
          const rowStatus = complaint.status || "Pending";
          const isDraft = complaint.is_draft === true;
          const isSelected = selectedId === complaint.complaint_id;

          const statusClasses = isDraft
            ? "bg-orange-100 text-orange-700"
            : rowStatus.toLowerCase() === "closed"
            ? "bg-emerald-100 text-emerald-700"
            : rowStatus.toLowerCase() === "rejected"
            ? "bg-rose-100 text-rose-700"
            : "bg-indigo-100 text-indigo-700";

          const handleClick = (e: React.MouseEvent) => {
            if (onSelect) {
              e.preventDefault();
              onSelect(complaint.complaint_id);
            }
          };

          const content = (
            <div
              className={`flex w-full flex-col gap-1.5 px-5 py-4 text-left transition-colors ${
                isSelected
                  ? "border-l-4 border-indigo-600 bg-indigo-50"
                  : "border-l-4 border-transparent hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                  {complaint.complaint_title ||
                    complaint.crime_category ||
                    t("complaintList", "common")}
                </span>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses}`}
                >
                  {isDraft ? t("draft", "complaints") : t(rowStatus, "complaints")}
                </span>
              </div>

              <p className="flex items-center gap-2 text-sm text-slate-700">
                <User className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                {complaint.complainant_name || "-"}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {complaint.location || "-"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {complaint.created_at
                    ? new Date(complaint.created_at).toLocaleDateString()
                    : "-"}
                </span>
              </div>
            </div>
          );

          return onSelect ? (
            <button
              key={complaint.complaint_id}
              onClick={handleClick}
              className="block w-full"
            >
              {content}
            </button>
          ) : (
            <Link
              key={complaint.complaint_id}
              href={`/complaints/${complaint.complaint_id}`}
              className="block w-full"
            >
              {content}
            </Link>
          );
        })
      )}
    </div>
  );
}

 return (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table className="min-w-full">
      <thead className="bg-slate-100">
        <tr className="text-left text-sm font-semibold text-slate-700">
          <th className="px-6 py-4">{t("complaintTitle", "complaints") || "Complaint"}</th>
          <th className="px-6 py-4">{t("crimeCategory", "complaints")}</th>
          <th className="px-6 py-4">{t("crimeSubcategory", "complaints")}</th>
          <th className="px-6 py-4">{t("complainant", "complaints")}</th>
          <th className="px-6 py-4">{t("location", "complaints")}</th>
          <th className="px-6 py-4">{t("attachments", "complaints")}</th>
          <th className="px-6 py-4">{t("status", "complaints")}</th>
          <th className="px-6 py-4">{t("status", "complaints")}</th>
          <th className="px-6 py-4">{t("date", "common")}</th>
          <th className="px-6 py-4">{t("actions", "common")}</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-200">
  {filteredComplaints.length === 0 ? (
    <tr>
      <td
        colSpan={9}
        className="px-6 py-8 text-center text-slate-500"
      >
        {t("noComplaintsMatchFilters", "complaints")}
      </td>
    </tr>
  ) : (
    filteredComplaints.map((complaint) => {
      const status = complaint.status || "Pending";
      const isDraft = complaint.is_draft === true;

      const statusClasses = isDraft
        ? "bg-orange-100 text-orange-700"
        : status.toLowerCase() === "closed"
        ? "bg-emerald-100 text-emerald-700"
        : status.toLowerCase() === "rejected"
        ? "bg-rose-100 text-rose-700"
        : "bg-indigo-100 text-indigo-700";

      const hasCase = caseComplaintIds.has(complaint.complaint_id);

      return (
  <tr
    key={complaint.complaint_id}
    className="hover:bg-slate-50 transition-colors"
  >
    <td className="px-6 py-4 font-semibold text-slate-900">
      <span className="flex items-center gap-2">
        <FileText className="h-4 w-4 shrink-0 text-slate-400" />
        {complaint.complaint_title || complaint.crime_category || "-"}
      </span>
    </td>

    <td className="px-6 py-4">
      {complaint.crime_category || "-"}
    </td>

    <td className="px-6 py-4">
      {complaint.crime_subcategory || "-"}
    </td>

    <td className="px-6 py-4">
      {complaint.complainant_name || "-"}
    </td>

    <td className="px-6 py-4">
      {complaint.location || "-"}
    </td>

    <td className="px-6 py-4">
      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
        {complaint.attachments_count || 0} {t("uploaded", "complaints")}
      </span>
    </td>

    <td className="px-6 py-4">
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
      >
        {isDraft ? t("draft", "complaints") : t(status, "complaints")}
      </span>
    </td>

    <td className="px-6 py-4">
      {hasCase ? (
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          {t("created", "complaints")}
        </span>
      ) : (
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          {t("notCreated", "complaints")}
        </span>
      )}
    </td>

    <td className="px-6 py-4 whitespace-nowrap">
      {complaint.created_at
        ? new Date(complaint.created_at).toLocaleDateString()
        : "-"}
    </td>

    <td className="px-6 py-4">
      <div className="flex gap-2">
        <Link
          href={`/complaints/${complaint.complaint_id}`}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t("view", "common")}
        </Link>

        {isDraft && (
          <Link
            href={`/complaints/${complaint.complaint_id}/submit`}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
          >
            {t("submit", "common")}
          </Link>
        )}

        {isCaseCreationAllowed && !hasCase && (
          <button
            onClick={async () => {
              try {
                await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"}/api/cases`, {
                  complaint_id: complaint.complaint_id,
                  complaint_number: complaint.complaint_number,
                  title: complaint.complaint_title || `Case for ${complaint.complaint_number}`,
                  priority: complaint.status || "Medium",
                });
                window.location.reload();
              } catch (err) {
                console.error("Failed to create case", err);
              }
            }}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            {t("createCase", "complaints")}
          </button>
        )}

        {hasCase && (
          <Link
            href="/cases"
            className="rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            {t("case", "complaints")}
          </Link>
        )}
      </div>
    </td>
  </tr>
);
    })
  )}
</tbody>
    </table>
  </div>
);
}