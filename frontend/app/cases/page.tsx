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

export default function CasesPage() {
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

  return (
    <div className="min-h-screen bg-slate-100 p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Cases</h1>
            <p className="mt-2 text-sm text-slate-600">Manage created cases and jump into legal sections, diary, or timeline.</p>
          </div>
          <Link href="/dashboard" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Back to dashboard</Link>
        </div>

        {loading ? (
          <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">Loading cases...</div>
        ) : error ? (
          <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
        ) : cases.length === 0 ? (
          <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
            No cases yet. Create one from a complaint details page.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {cases.map((caseItem) => (
              <div key={caseItem.case_id} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{caseItem.title || `Case ${caseItem.case_id.slice(0, 8)}`}</h2>
                    <p className="mt-1 text-sm text-slate-500">Complaint: {caseItem.complaint_id || "—"}</p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">{caseItem.status || "Open"}</span>
                </div>

                <p className="mt-4 text-sm text-slate-600">{caseItem.description || "No description provided yet."}</p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Link href={`/complaints/${caseItem.complaint_id}/legal_sections`} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Legal sections</Link>
                  <Link href={`/complaints/${caseItem.complaint_id}/case_diary`} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Case diary</Link>
                  <Link href={`/complaints/${caseItem.complaint_id}/timeline`} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Timeline</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
