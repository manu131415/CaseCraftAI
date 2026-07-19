"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import Navbar from "@/components/layout/io/Navbar";
import Sidebar from "@/components/layout/io/Sidebar";

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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CaseSummary[] | null>(null);

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

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/cases/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.cases ?? data);
    } catch (e) {
      console.error(e);
      setError("Search failed");
    }
    setLoading(false);
  };

  const display = results ?? cases;

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">

        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">Cases</h1>
                <p className="mt-2 text-sm text-slate-600">Manage created cases and jump into legal sections, diary, or timeline.</p>
              </div>
              <div className="flex items-center gap-3">
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search cases by keyword or id" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" />
                <button onClick={handleSearch} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">Search</button>
                <Link href="/dashboard" className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">Back to dashboard</Link>
              </div>
            </div>

            {loading ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">Loading cases...</div>
            ) : error ? (
              <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
            ) : display.length === 0 ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
                No cases found.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {display.map((caseItem) => (
                  <div key={caseItem.case_id} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-md hover:shadow-lg transition-shadow">
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
                      {caseItem.complaint_id ? (
                        <Link href={`/complaints/${caseItem.complaint_id}/documents`} className="rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Generate docs</Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

      </div>
    </div>
  );
}
