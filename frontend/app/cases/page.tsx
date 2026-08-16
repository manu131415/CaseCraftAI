'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '@/components/layout/shared/Navbar';
import Sidebar from '@/components/layout/io/Sidebar';
import { useLanguage } from '@/app/providers/LanguageProvider';

interface CaseSummary {
  case_id: string;
  case_number?: string;
  complaint_id?: string;
  complaint_number?: string;
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  created_at?: string;
  district?: string;
  police_station?: string;
  fir_no?: string;
  fir_year?: string;
  court_name?: string;
  current_stage?: string;
}

export default function CasesMasterDetail() {
  const { t } = useLanguage();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  useEffect(() => {
    async function loadCases() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
        const response = await axios.get(`${API_BASE}/api/cases`);
        const caseData: CaseSummary[] = response.data.cases || [];
        setCases(caseData);
        if (caseData.length > 0) {
          setSelectedCaseId(caseData[0].case_id);
        }
      } catch (err: any) {
        setError(err?.response?.data?.detail || err?.message || 'Failed to load cases');
      } finally {
        setLoading(false);
      }
    }
    loadCases();
  }, []);

  const filteredCases = cases.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      item.case_number?.toLowerCase().includes(q) ||
      item.complaint_number?.toLowerCase().includes(q) ||
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === '' || item.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority =
      priorityFilter === '' || item.priority?.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Sort cases in descending order (Newest First)
  const sortedCases = [...filteredCases].sort((a, b) => {
    const timeA = new Date(a.created_at || 0).getTime();
    const timeB = new Date(b.created_at || 0).getTime();
    return timeB - timeA;
  });

  const selectedCase = cases.find((c) => c.case_id === selectedCaseId) || sortedCases[0];

  // Utility badge styling helper
  const getBadgeClasses = (type: 'status' | 'priority', value?: string) => {
    if (type === 'priority') {
      switch (value?.toLowerCase()) {
        case 'high': return 'bg-rose-100 text-rose-700 border-rose-200';
        case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
        default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      }
    }
    switch (value) {
      case 'Closed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Under Investigation': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'FIR Registered': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  // Human-readable titles (Removes cryptic GUIDs for officers)
  const formatCaseTitle = (caseItem: CaseSummary) => {
    if (caseItem.title && !caseItem.title.toLowerCase().includes('case for complaint')) {
      return caseItem.title;
    }
    if (caseItem.fir_no) {
      return `FIR No. ${caseItem.fir_no}/${caseItem.fir_year || '2026'}`;
    }
    if (caseItem.complaint_number) {
      return `Complaint #${caseItem.complaint_number}`;
    }
    return `Case #${caseItem.case_number || caseItem.case_id.slice(0, 8)}`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
          {/* Header & Controls Section */}
          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {t("Case Management Hub") || "Case Management Hub"}
              </h1>
              <p className="text-xs text-slate-500">
                {t("Select a case from the side pane to inspect full records.") || "Select a case from the side pane to inspect full records."}
              </p>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder={t("searchPlaceholder", "cases") || "Search case / complaint / title..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-48 sm:w-64 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              >
                <option value="">All Statuses</option>
                <option value="Under Investigation">Under Investigation</option>
                <option value="FIR Registered">FIR Registered</option>
                <option value="Closed">Closed</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs"
              >
                <option value="">All Priorities</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          {/* TWO PANE LAYOUT CONTAINER */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 overflow-hidden min-h-0">
            
            {/* LEFT PANE: Case List (4 Columns) */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Active Cases ({sortedCases.length})
                </span>
              </div>

              {loading ? (
                <div className="p-6 text-center text-xs text-slate-500">{t("loadingCases", "cases") || "Loading cases..."}</div>
              ) : error ? (
                <div className="p-4 text-xs text-red-600 bg-red-50 m-2 rounded">{error}</div>
              ) : sortedCases.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">No cases found matching filters.</div>
              ) : (
                <div className="divide-y divide-slate-100 overflow-y-auto flex-1">
                  {sortedCases.map((c) => {
                    const isSelected = selectedCase?.case_id === c.case_id;
                    return (
                      <button
                        key={c.case_id}
                        onClick={() => setSelectedCaseId(c.case_id)}
                        className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1.5 border-l-4 ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-600 shadow-inner'
                            : 'hover:bg-slate-50 border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-indigo-950">
                            Case #{c.case_number || c.case_id.slice(0, 8)}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getBadgeClasses('priority', c.priority)}`}>
                            {c.priority || 'Medium'}
                          </span>
                        </div>

                        <div className="font-medium text-sm text-slate-800 line-clamp-1">
                          {formatCaseTitle(c)}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <span>Complaint #{c.complaint_number || '—'}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${getBadgeClasses('status', c.status)}`}>
                            {c.status || 'Open'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT PANE: Selected Case Detail (8 Columns) */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              {selectedCase ? (
                <div className="flex-1 flex flex-col overflow-y-auto p-6 space-y-6">
                  
                  {/* Case Title Banner */}
                  <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900">
                          {formatCaseTitle(selectedCase)}
                        </h2>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getBadgeClasses('status', selectedCase.status)}`}>
                          {selectedCase.status || 'Open'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        System ID: {selectedCase.case_id}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${getBadgeClasses('priority', selectedCase.priority)}`}>
                        {selectedCase.priority || 'Medium'} Priority
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Navigation Bar */}
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-slate-500 self-center mr-2">
                      Officer Actions:
                    </span>
                    {selectedCase.complaint_id && (
                      <>
                        <Link
                          href={`/complaints/${selectedCase.complaint_id}/case_diary`}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                        >
                          📖 Case Diary
                        </Link>
                        <Link
                          href={`/complaints/${selectedCase.complaint_id}/legal_sections`}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                        >
                          ⚖️ Legal Sections
                        </Link>
                        <Link
                          href={`/complaints/${selectedCase.complaint_id}/timeline`}
                          className="px-3 py-1.5 text-xs font-medium rounded-md bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
                        >
                          ⏳ Timeline
                        </Link>
                      </>
                    )}
                    <Link
                      href={`/cases/${selectedCase.case_id}/documents`}
                      className="px-3 py-1.5 text-xs font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
                    >
                      📁 Documents
                    </Link>
                  </div>

                  {/* Metadata Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">Case Number</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedCase.case_number || '—'}</p>
                    </div>

                    <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">Complaint Ref</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedCase.complaint_number || '—'}</p>
                    </div>

                    <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-200">
                      <p className="text-[11px] font-semibold text-slate-500 uppercase">Registered Date</p>
                      <p className="text-sm font-bold text-slate-800 mt-0.5">
                        {selectedCase.created_at ? new Date(selectedCase.created_at).toLocaleDateString() : '—'}
                      </p>
                    </div>
                  </div>

                  {/* Station & Legal Details */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-1">
                      Jurisdiction & Legal Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-500">Police Station:</span>
                        <p className="font-semibold text-slate-800">{selectedCase.police_station || '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">District:</span>
                        <p className="font-semibold text-slate-800">{selectedCase.district || '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Current Stage:</span>
                        <p className="font-semibold text-indigo-700">{selectedCase.current_stage || '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Court Name:</span>
                        <p className="font-semibold text-slate-800">{selectedCase.court_name || '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Case Description */}
                  {selectedCase.description && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b pb-1">
                        Case Description
                      </h3>
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200 whitespace-pre-wrap">
                        {selectedCase.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                  Select a case from the left list to view details
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}