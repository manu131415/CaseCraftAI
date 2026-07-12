"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

interface CaseSummary {
  case_id: string;
  complaint_id?: string;
  title?: string;
  status?: string;
  priority?: string;
  description?: string;
  created_at?: string;
}

export default function CaseListPanel() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCases() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
        const response = await axios.get(`${API_BASE}/api/cases`);
        setCases(response.data.cases || []);
      } catch (err: any) {
        console.error(err);
        setError(err?.response?.data?.detail || err?.message || String(err));
      } finally {
        setLoading(false);
      }
    }

    loadCases();
  }, []);

  if (loading) {
    return <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">Loading cases...</div>;
  }

  if (error) {
    return <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>;
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Case dashboard</h2>
          <p className="mt-1 text-sm text-slate-500">Track active cases and jump to legal sections, diary, or timeline.</p>
        </div>
        <Link href="/cases" className="text-sm font-medium text-indigo-600 hover:underline">View all cases</Link>
      </div>

      {cases.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
          No cases created yet. Open a complaint and create a case to populate this view.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {cases.map((caseItem) => (
            <div key={caseItem.case_id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{caseItem.title || `Case ${caseItem.case_id.slice(0, 8)}`}</h3>
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700">{caseItem.status || "Open"}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">Complaint: {caseItem.complaint_id || "—"}</p>
                  <p className="mt-2 text-sm text-slate-600">{caseItem.description || "No description provided yet."}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {caseItem.complaint_id ? (
                    <>
                      <Link href={`/complaints/${caseItem.complaint_id}/legal_sections`} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Legal sections</Link>
                      <Link href={`/complaints/${caseItem.complaint_id}/case_diary`} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Case diary</Link>
                      <Link href={`/complaints/${caseItem.complaint_id}/timeline`} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">Timeline</Link>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
