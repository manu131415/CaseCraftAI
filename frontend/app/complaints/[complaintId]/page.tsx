"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/layout/io/Navbar";
import Sidebar from "@/components/layout/io/Sidebar";

interface ComplaintDetail {
  complaint_id: string;
  complaint_number:string,
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
  notes?: string;
  aiSummary?: string;
  officerNotes?: string;
  attachments?: Array<{
    id?: string;
    fileName?: string;
    fileType?: string;
    documentUrl?: string;
    cloudinaryUrl?: string;
    url?: string;
    extractedText?: string;
    summary?: string;
  }>;
  complainants?: Array<any>;
  victims?: Array<any>;
  suspects?: Array<any>;
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

  // debug: log the complaint object returned by the API
  useEffect(() => {
    if (complaint) {
      // eslint-disable-next-line no-console
      console.log("Loaded complaint:", complaint);
    }
  }, [complaint]);

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

  if (loading) return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Loading complaint...</div>
        </main>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
        </main>
      </div>
    </div>
  );

  if (!complaint) return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Complaint not found.</div>
        </main>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">

        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">Complaint {complaint.complaint_number}</h1>
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
                  <p className="text-sm font-medium text-slate-700">Crime category</p>
                  <p className="mt-1 text-sm text-slate-600">{complaint.crime_category || "Not provided"}</p>

                  <p className="text-sm font-medium text-slate-700">Crime sub-category</p>
                  <p className="mt-1 text-sm text-slate-600">{complaint.crime_subcategory || "Not provided"}</p>
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

              {complaint.aiSummary && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700">AI Summary</p>
                  <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{complaint.aiSummary}</p>
                </div>
              )}

              {complaint.officerNotes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700">Officer notes</p>
                  <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{complaint.officerNotes}</p>
                </div>
              )}

              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700">Attachments</p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {complaint.attachments.map((att) => {
                      const url = att.documentUrl || att.cloudinaryUrl || (att as any).url || (att as any).document_url;
                      const isImage = (att.fileType || "").startsWith("image") || (url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url));

                      return (
                        <div key={att.id || att.fileName} className="rounded-xl border bg-white p-3 text-sm shadow-sm">
                          <p className="font-semibold text-slate-900">{att.fileName || "Document"}</p>
                          <p className="text-xs text-slate-500">{att.fileType || "—"}</p>
                          {isImage && url ? (
                            <a href={url} target="_blank" rel="noreferrer">
                              <img src={url} alt={att.fileName || "attachment"} className="mt-2 max-h-40 w-full object-contain" />
                            </a>
                          ) : url ? (
                            <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-indigo-600 hover:underline">Open document</a>
                          ) : att.summary ? (
                            <p className="mt-2 text-slate-600">{att.summary}</p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {complaint.complainants && complaint.complainants.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-slate-700">Complainants</p>
                  <div className="mt-2 space-y-3">
                    {complaint.complainants.map((c: any, idx: number) => (
                      <div key={idx} className="rounded-xl bg-slate-50 p-3">
                        <p className="font-semibold">{c.name || `Complainant ${idx + 1}`}</p>
                        <p className="text-sm text-slate-600">Contact: {c.contact || "—"}</p>
                        {c.statement && <p className="text-sm text-slate-600">Statement: {c.statement}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {complaint.victims && complaint.victims.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-slate-700">Victims</p>
                  <div className="mt-2 space-y-3">
                    {complaint.victims.map((v: any, idx: number) => (
                      <div key={idx} className="rounded-xl bg-slate-50 p-3">
                        <p className="font-semibold">{v.name || `Victim ${idx + 1}`}</p>
                        <p className="text-sm text-slate-600">Type: {v.type || "—"}</p>
                        {v.statement && <p className="text-sm text-slate-600">Statement: {v.statement}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {complaint.suspects && complaint.suspects.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-slate-700">Suspects</p>
                  <div className="mt-2 space-y-3">
                    {complaint.suspects.map((s: any, idx: number) => (
                      <div key={idx} className="rounded-xl bg-slate-50 p-3">
                        <p className="font-semibold">{s.name || `Suspect ${idx + 1}`}</p>
                        <p className="text-sm text-slate-600">Type: {s.type || "—"}</p>
                        <p className="text-sm text-slate-600">Status: {s.status || "—"}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {complaint.notes && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-slate-700">Notes</p>
                  <p className="mt-1 text-sm text-slate-600 whitespace-pre-wrap">{complaint.notes}</p>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Link href="/complaints" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium">Back to list</Link>

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
        </main>

      </div>
    </div>
  );
}
