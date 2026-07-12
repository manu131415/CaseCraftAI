"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

interface ComplaintDetail {
  complaint_id: string;
  complainant_name?: string;
  phone?: string;
  email?: string;
  crime_type?: string;
  location?: string;
  description?: string;
  status?: string;
  created_at?: string;
  incident_datetime?: string;
  notes?: string;
}

export default function ComplaintPage() {
  const params = useParams();
  const router = useRouter();
  const complaintId = ((params as Record<string, string | string[] | undefined>)?.complaintId as string | undefined) ?? "";
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [caseExists, setCaseExists] = useState(false);
  const [caseId, setCaseId] = useState<string | null>(null);

  useEffect(() => {
    if (!complaintId) {
      setLoading(false);
      return;
    }

    async function load() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
        const [cRes, caseRes] = await Promise.allSettled([
          axios.get(`${API_BASE}/api/complaints/${encodeURIComponent(complaintId)}`),
          axios.get(`${API_BASE}/api/cases/by-complaint/${encodeURIComponent(complaintId)}`),
        ]);

        if (cRes.status === "fulfilled") {
          const data = (cRes.value as any).data;
          setComplaint(data.complaint || data || null);
        }

        if (caseRes.status === "fulfilled") {
          const data = (caseRes.value as any).data;
          setCaseExists(true);
          setCaseId(data.case_id || null);
        } else {
          setCaseExists(false);
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.detail || err?.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [complaintId]);

  async function handleCreateCase() {
    if (!complaintId) return;
    setCreating(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
      const payload = {
        complaint_id: complaintId,
        title: `Case for complaint ${complaintId}`,
        description: complaint?.description || undefined,
      };

      const res = await axios.post(`${API_BASE}/api/cases`, payload);
      const data = res.data?.data;
      if (data?.case_id) {
        // navigate to cases dashboard
        router.push(`/cases`);
      } else {
        // fallback
        setError("Case created but no id returned.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.detail || err?.message || String(err));
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Loading complaint...</div>;
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>;
  if (!complaint) return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Complaint not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Complaint {complaint.complaint_id}</h1>
          <p className="mt-1 text-sm text-slate-500">{complaint.status || "Pending"}</p>
        </div>
        <div className="text-right text-sm text-slate-500">{complaint.created_at ? new Date(complaint.created_at).toLocaleString() : "No date"}</div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-slate-700">Complainant</p>
            <p className="mt-1 text-sm text-slate-600">{complaint.complainant_name || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Contact</p>
            <p className="mt-1 text-sm text-slate-600">{complaint.phone || "-"} {complaint.email ? `• ${complaint.email}` : ""}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Crime type</p>
            <p className="mt-1 text-sm text-slate-600">{complaint.crime_type || "Not provided"}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Location</p>
            <p className="mt-1 text-sm text-slate-600">{complaint.location || "Not provided"}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">Incident date/time</p>
          <p className="mt-1 text-sm text-slate-600">{complaint.incident_datetime ? new Date(complaint.incident_datetime).toLocaleString() : "Not provided"}</p>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">Description</p>
          <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{complaint.description || "Not provided"}</p>
        </div>

        {complaint.notes && (
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700">Notes</p>
            <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{complaint.notes}</p>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <Link href="/complaints" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium">Back to list</Link>

          <a href={`/complaints/${complaint.complaint_id}/legal_sections`} className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">View legal sections</a>

          {caseExists ? (
            <Link href="/cases" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium">View case</Link>
          ) : (
            <button disabled={creating} onClick={handleCreateCase} className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
              {creating ? "Creating..." : "Create case"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
