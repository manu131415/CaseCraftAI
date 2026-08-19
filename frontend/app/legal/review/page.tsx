"use client";

import { useState, useEffect, useCallback } from "react";
import Navbar from "@/components/layout/shared/Navbar";
import Sidebar from "@/components/layout/legal/Sidebar";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { Scale } from "lucide-react";

export interface CrossReference {
  act: string;
  section: string;
  subject?: string;
  summary_of_comparison?: string;
}

export interface SelectedSection {
  id: string;
  title: string;
  reason?: string;
  act_code: string;
  category?: string;
  similarity?: number;
  section_text?: string;
  section_number: string;
  cross_references?: CrossReference[];
}

export interface SelectedJudgment {
  id?: string;
  case_title?: string;
  case_date?: string;
  court?: string;
  crime_type?: string;
  bail_outcome?: string;
  reason?: string;
  summary?: string;
  judgment_reason?: string;
  similarity?: number;
  ipc_sections?: string;
}

export interface DraftContent {
  selected_sections?: SelectedSection[];
  selected_judgments?: SelectedJudgment[];
  [key: string]: any;
}

export interface FirDraft {
  id: string;
  complaint_id: string;
  crime_category: string | null;
  summary: string | null;
  draft_content: DraftContent;
  status: "draft" | "under_review" | "approved" | string;
  officer_notes: string | null;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function LegalReviewPage() {
  const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
  const { t } = useLanguage();
  const [drafts, setDrafts] = useState<FirDraft[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<FirDraft | null>(null);
  const [officerNotes, setOfficerNotes] = useState<string>("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper function to safely format status strings without crashing
  const formatStatus = (status?: string) => {
    if (!status) return "DRAFT";
    return status.replace(/_/g, " ");
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "under_review":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  // Fetch FIR drafts from backend
  const fetchDrafts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`${BACKEND_URL}/api/fir-drafts`);
      if (!response.ok) throw new Error("Failed to fetch FIR drafts");

      const data: FirDraft[] = await response.json();
      setDrafts(data);
      if (data.length > 0 && !selectedDraft) {
        setSelectedDraft(data[0]);
        setOfficerNotes(data[0].officer_notes || "");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred while loading data.");
    } finally {
      setIsLoading(false);
    }
  }, [selectedDraft]);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleSelectDraft = (draft: FirDraft) => {
    setSelectedDraft(draft);
    setOfficerNotes(draft.officer_notes || "");
    setExpandedSectionId(null);
  };

  // PATCH /api/fir-drafts/{draft_id} - Save Notes
  const handleSaveNotes = async () => {
    if (!selectedDraft) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/fir-drafts/${selectedDraft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          officer_notes: officerNotes,
        }),
      });

      if (!res.ok) throw new Error("Failed to update officer notes");
      const resData = await res.json();

      // Safely merge response to prevent missing properties from wiping local state
      const updatedItem: FirDraft = {
        ...selectedDraft,
        ...(typeof resData === "object" && resData !== null ? resData : {}),
        officer_notes: officerNotes,
        updated_at: new Date().toISOString(),
      };

      setDrafts((prev) => prev.map((d) => (d.id === updatedItem.id ? updatedItem : d)));
      setSelectedDraft(updatedItem);
    } catch (err: any) {
      alert(err.message || "Failed to update notes");
    } finally {
      setIsSubmitting(false);
    }
  };

  // PATCH /api/fir-drafts/{draft_id} - Approve FIR
  const handleApprove = async () => {
    if (!selectedDraft) return;
    setIsSubmitting(true);
    const timestamp = new Date().toISOString();
    
    try {
      const res = await fetch(`${BACKEND_URL}/api/fir-drafts/${selectedDraft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          officer_notes: officerNotes,
          approved_by: "Legal Advisor",
        }),
      });

      if (!res.ok) throw new Error("Failed to approve FIR draft");
      const resData = await res.json();

      // Safely merge response so status is guaranteed to be present
      const updatedItem: FirDraft = {
        ...selectedDraft,
        ...(typeof resData === "object" && resData !== null ? resData : {}),
        status: "approved",
        officer_notes: officerNotes,
        approved_by: resData?.approved_by || selectedDraft.approved_by || "Legal Advisor",
        approved_at: resData?.approved_at || timestamp,
        updated_at: timestamp,
      };

      setDrafts((prev) => prev.map((d) => (d.id === updatedItem.id ? updatedItem : d)));
      setSelectedDraft(updatedItem);
    } catch (err: any) {
      alert(err.message || "Failed to approve draft");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDrafts = drafts.filter((d) => {
    const matchesSearch =
      d.complaint_id?.toLowerCase().includes(search.toLowerCase()) ||
      d.crime_category?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? d.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const selectedSections = selectedDraft?.draft_content?.selected_sections || [];
  const selectedJudgments = selectedDraft?.draft_content?.selected_judgments || [];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
          {/* Header */}
          <div className="mb-6 flex-shrink-0">
  <div className="flex items-center gap-3">
    {/* Symbol / Icon container */}
    <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
      <Scale className="w-6 h-6" />
    </div>

    <div>
      <h1 className="text-3xl font-bold text-slate-800">
        {t("legalReview", "cases")}
      </h1>
      <p className="mt-1 text-slate-600">
        {t("legalReviewSubtitle", "cases")}
      </p>
    </div>
  </div>
</div>

          {/* Two-Pane Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
            
            {/* LEFT PANE: Case / Draft List */}
            <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              {/* Search & Filters */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3 flex-shrink-0">
                <input
                  type="text"
                  placeholder={t("searchPlaceholder", "cases")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex gap-2">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
                  >
                    <option value="">All Statuses</option>
                    <option value="draft">Draft</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                  </select>
                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter("");
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    {t("clearFilters", "cases")}
                  </button>
                </div>
              </div>

              {/* Scrollable List */}
              <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                {isLoading ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    Loading FIR drafts...
                  </div>
                ) : errorMessage ? (
                  <div className="p-6 text-center text-rose-500 text-sm">
                    {errorMessage}
                  </div>
                ) : filteredDrafts.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-sm">
                    No FIR drafts found.
                  </div>
                ) : (
                  filteredDrafts.map((draft) => {
                    const isSelected = selectedDraft?.id === draft.id;
                    const sectionsCount = draft.draft_content?.selected_sections?.length || 0;
                    return (
                      <div
                        key={draft.id}
                        onClick={() => handleSelectDraft(draft)}
                        className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 ${
                          isSelected ? "bg-indigo-50/60 border-l-4 border-indigo-600" : ""
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800 text-sm">
                            {draft.complaint_id}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase ${getStatusBadge(
                              draft.status
                            )}`}
                          >
                            {formatStatus(draft.status)}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-indigo-600 mb-1">
                          {draft.crime_category || "Uncategorized"}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2 mb-2">
                          {draft.summary || "No summary provided."}
                        </p>
                        <div className="text-[11px] text-slate-400">
                          {sectionsCount} {sectionsCount === 1 ? "Section" : "Sections"} attached
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* RIGHT PANE: Selected Draft Details & Action Form */}
            <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              {selectedDraft ? (
                <div className="flex flex-col h-full overflow-y-auto p-6 space-y-6">
                  
                  {/* Draft Header */}
                  <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-slate-800">
                          {selectedDraft.complaint_id}
                        </h2>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold uppercase ${getStatusBadge(
                            selectedDraft.status
                          )}`}
                        >
                          {formatStatus(selectedDraft.status)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">
                        Category: <strong className="text-slate-800">{selectedDraft.crime_category || "N/A"}</strong>
                      </p>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      <div>Created: {selectedDraft.created_at ? new Date(selectedDraft.created_at).toLocaleString() : "N/A"}</div>
                      <div className="font-mono mt-0.5">ID: {selectedDraft.id}</div>
                    </div>
                  </div>

                  {/* Incident Summary */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Case / Incident Summary
                    </h3>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-700 leading-relaxed">
                      {selectedDraft.summary || "No summary available."}
                    </div>
                  </div>

                  {/* Selected Legal Sections */}
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                      Applied Legal Sections ({selectedSections.length})
                    </h3>

                    {selectedSections.length === 0 ? (
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 italic text-center">
                        No specific legal sections attached to this draft.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedSections.map((sec) => {
                          const isExpanded = expandedSectionId === sec.id;
                          return (
                            <div
                              key={sec.id}
                              className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-xs"
                            >
                              <div className="p-3 bg-slate-50 flex items-start justify-between gap-3 border-b border-slate-100">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="bg-indigo-600 text-white font-bold text-xs px-2 py-0.5 rounded">
                                      {sec.act_code} Sec {sec.section_number}
                                    </span>
                                    <h4 className="font-semibold text-slate-800 text-sm">
                                      {sec.title}
                                    </h4>
                                  </div>
                                  {sec.category && (
                                    <span className="text-[11px] text-slate-500 font-medium block">
                                      {sec.category}
                                    </span>
                                  )}
                                </div>
                                {sec.similarity && (
                                  <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">
                                    {(sec.similarity * 100).toFixed(0)}% Match
                                  </span>
                                )}
                              </div>

                              <div className="p-4 text-xs space-y-3">
                                {sec.reason && (
                                  <div>
                                    <span className="font-semibold text-slate-700 block mb-0.5">
                                      Reason for Inclusion:
                                    </span>
                                    <p className="text-slate-600 bg-amber-50/60 p-2.5 rounded border border-amber-200/60">
                                      {sec.reason}
                                    </p>
                                  </div>
                                )}

                                {sec.section_text && (
                                  <div>
                                    <button
                                      onClick={() => setExpandedSectionId(isExpanded ? null : sec.id)}
                                      className="text-indigo-600 font-semibold text-xs hover:underline inline-flex items-center gap-1"
                                    >
                                      {isExpanded ? "Hide Full Section Text" : "View Full Section Text"}
                                    </button>
                                    {isExpanded && (
                                      <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded text-xs whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto max-h-60 overflow-y-auto">
                                        {sec.section_text}
                                      </pre>
                                    )}
                                  </div>
                                )}

                                {sec.cross_references && sec.cross_references.length > 0 && (
                                  <div className="pt-2 border-t border-slate-100">
                                    <span className="font-semibold text-slate-700 block mb-1">
                                      Cross References:
                                    </span>
                                    <div className="space-y-1.5">
                                      {sec.cross_references.map((cr, idx) => (
                                        <div
                                          key={idx}
                                          className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-200 text-[11px]"
                                        >
                                          <span className="font-medium text-slate-800">
                                            {cr.act} Section {cr.section}: {cr.subject}
                                          </span>
                                          <span className="text-slate-500 italic">
                                            {cr.summary_of_comparison}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Selected Landmark Judgments */}
                  {/* Selected Landmark Judgments */}
<div>
  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
    Landmark Judgments ({selectedJudgments.length})
  </h3>
  {selectedJudgments.length === 0 ? (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 italic text-center">
      No landmark judgments attached.
    </div>
  ) : (
    <div className="space-y-3">
      {selectedJudgments.map((j, idx) => (
        <div key={j.id || idx} className="p-3 border border-slate-200 rounded-lg bg-white space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-sm">
              {j.case_title || "Untitled Case"}
            </span>
            {j.case_date && (
              <span className="text-[11px] text-slate-500 font-mono">
                {j.case_date}
              </span>
            )}
          </div>
          
          {j.court && (
            <div className="text-indigo-600 font-medium text-[11px]">
              {j.court}
            </div>
          )}

          {j.reason && (
            <p className="text-slate-600 bg-amber-50/60 p-2 rounded border border-amber-200/60 mt-1">
              <strong>Relevance:</strong> {j.reason}
            </p>
          )}

          {j.judgment_reason && (
            <p className="text-slate-500 italic mt-1">
              {j.judgment_reason}
            </p>
          )}
        </div>
      ))}
    </div>
  )}
</div>

                  {/* Legal Officer Notes Form */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Officer Legal Notes & Recommendations
                    </label>
                    <textarea
                      rows={4}
                      value={officerNotes}
                      onChange={(e) => setOfficerNotes(e.target.value)}
                      placeholder="Add legal opinions, required edits, or compliance notes for the IO..."
                      className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Approval Information metadata */}
                  {selectedDraft.status === "approved" && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 space-y-1">
                      <div><strong>Approved By:</strong> {selectedDraft.approved_by || "Legal Advisor"}</div>
                      <div><strong>Approved At:</strong> {selectedDraft.approved_at ? new Date(selectedDraft.approved_at).toLocaleString() : "N/A"}</div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 mt-auto">
                    <button
                      onClick={handleSaveNotes}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-sm font-medium border border-slate-300 rounded-lg text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? "Saving..." : "Save Notes"}
                    </button>
                    <button
                      onClick={handleApprove}
                      disabled={isSubmitting || selectedDraft.status === "approved"}
                      className={`px-5 py-2 text-sm font-medium rounded-lg text-white transition-colors ${
                        selectedDraft.status === "approved"
                          ? "bg-emerald-400 cursor-not-allowed"
                          : "bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
                      }`}
                    >
                      {selectedDraft.status === "approved" ? "Approved" : isSubmitting ? "Approving..." : "Approve FIR Draft"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400">
                  <p className="text-sm">Select an FIR draft from the left pane to review details.</p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}