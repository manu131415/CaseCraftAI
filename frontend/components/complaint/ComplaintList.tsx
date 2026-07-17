"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import {
  User,
  MapPin,
  Calendar,
  ShieldAlert,
  FolderKanban,
} from "lucide-react";

interface ComplaintSummary {
  complaint_id: string;
  complaint_number: string;
  complainant_name?: string;
  phone?: string;
  email?: string;
  crime_category?: string;
  crime_subcategory?: string;
  location?: string;
  description?: string;
  status?: string;
  created_at?: string;
  incident_datetime?: string;
}

export default function ComplaintList({ initialComplaints }: { initialComplaints?: ComplaintSummary[] }) {
  const [complaints, setComplaints] = useState<ComplaintSummary[]>(initialComplaints || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [caseComplaintIds, setCaseComplaintIds] = useState<Set<string>>(new Set());

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
        setError(`Unable to load complaints: ${msg}`);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">Loading complaints...</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">{error}</div>;
  }

  if (!complaints.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">No complaints registered yet</h2>
        <p className="mt-2 text-slate-600">Submit a complaint from the registration page and it will appear here.</p>
      </div>
    );
  }

 return (
  <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-100">
        <tr className="text-left text-sm font-semibold text-slate-700">
          <th className="px-6 py-4">Complaint No.</th>
          <th className="px-6 py-4">Crime Category</th>
          <th className="px-6 py-4">Crime Subcategory</th>
          <th className="px-6 py-4">Complainant</th>
          <th className="px-6 py-4">Location</th>
          <th className="px-6 py-4">Status</th>
          <th className="px-6 py-4">Case</th>
          <th className="px-6 py-4">Date</th>
          <th className="px-6 py-4">Actions</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-slate-200">
        {complaints.map((complaint) => {
          const status = complaint.status || "Pending";

          const statusClasses =
            status.toLowerCase() === "closed"
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
                {complaint.complaint_number}
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
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
                >
                  {status}
                </span>
              </td>

              <td className="px-6 py-4">
                {hasCase ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Created
                  </span>
                ) : (
                  <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                    Not Created
                  </span>
                )}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                {complaint.created_at
                  ? new Date(complaint.created_at).toLocaleDateString()
                  : "-"}
              </td>

              <td className="px-6 py-4">
                <Link
                  href={`/complaints/${complaint.complaint_id}`}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                >
                  View
                </Link>

                {hasCase && (
                  <Link
                    href="/cases"
                    className="ml-2 rounded-lg border border-emerald-600 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
                  >
                    Case
                  </Link>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);
}
