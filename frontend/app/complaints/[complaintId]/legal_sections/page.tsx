'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from "@/app/providers/LanguageProvider";
import Sidebar from "@/components/layout/io/Sidebar";
import Navbar from "@/components/layout/shared/Navbar";

interface CrossReference {
  act: string;
  section: string;
  subject: string | null;
  summary_of_comparison: string | null;
}

interface LegalSection {
  id: string;
  act_code: string;
  section_number: string;
  title: string;
  section_text: string;
  category: string;
  similarity: number;
  reason: string;
  cross_references: CrossReference[];
}

interface LandmarkJudgment {
  id: string;
  case_title: string;
  court: string;
  case_date: string;
  ipc_sections: string;
  crime_type: string;
  summary: string;
  judgment_reason: string;
  bail_outcome: string;
  similarity: number;
  reason: string;
}

interface AnalysisResult {
  complaint_id: string;
  case_summary: string;
  sections: LegalSection[];
  judgments: LandmarkJudgment[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

function SimilarityBadge({ score }: { score: number }) {
  const { t } = useLanguage();
  const pct = Math.round(score * 100);
  const tone =
    pct >= 75 ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
    : pct >= 50 ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
    : 'bg-slate-100 text-slate-600 ring-slate-500/20';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${tone}`}>
      {pct}% {t("match", "complaints") || "match"}
    </span>
  );
}

function ActBadge({ act }: { act: string }) {
  const isNewAct = ['BNS', 'BNSS', 'BSA'].includes(act);
  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 text-[11px] font-bold tracking-wide ${
        isNewAct ? 'bg-indigo-900 text-white' : 'bg-slate-200 text-slate-700'
      }`}
    >
      {act}
    </span>
  );
}

function SectionCard({ section, selected, onToggle }: { section: LegalSection; selected: boolean; onToggle: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();

  return (
    <div className={`rounded-xl border transition-all p-5 shadow-xs ${selected ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <ActBadge act={section.act_code} />
          <h3 className="font-bold text-slate-900 text-sm">
            {t("section","common") || "Section"} {section.section_number} — {section.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <SimilarityBadge score={section.similarity} />
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs cursor-pointer hover:bg-slate-50">
            <input type="checkbox" checked={selected} onChange={onToggle} className="rounded text-indigo-600 focus:ring-indigo-500" />
            {t("select", "common") || "Select"}
          </label>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">{section.reason}</p>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
      >
        {expanded ? (t("hideSectionText", "complaints") || "Hide Full Text") : (t("showSectionText", "complaints") || "Show Full Text")}
      </button>

      {expanded && (
        <p className="mt-2 rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 leading-relaxed font-mono">
          {section.section_text}
        </p>
      )}

      {section.cross_references.length > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {t("correspondsTo", "complaints") || "Corresponds to"}
          </p>
          <div className="flex flex-wrap gap-2">
            {section.cross_references.map((xref, i) => (
              <span
                key={i}
                title={xref.summary_of_comparison ?? undefined}
                className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
              >
                <ActBadge act={xref.act} />
                {t("section","common") || "Section"} {xref.section}
                {xref.subject ? ` · ${xref.subject}` : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function JudgmentCard({ judgment, selected, onToggle }: { judgment: LandmarkJudgment; selected: boolean; onToggle: () => void }) {
  const { t } = useLanguage();
  const outcomeTone =
    judgment.bail_outcome?.toLowerCase().includes('grant')
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : judgment.bail_outcome?.toLowerCase().includes('den') || judgment.bail_outcome?.toLowerCase().includes('reject')
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <div className={`rounded-xl border transition-all p-5 shadow-xs ${selected ? 'border-indigo-600 bg-indigo-50/30 ring-2 ring-indigo-500/20' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">{judgment.case_title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {judgment.court} · {judgment.case_date}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SimilarityBadge score={judgment.similarity} />
          <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-2xs cursor-pointer hover:bg-slate-50">
            <input type="checkbox" checked={selected} onChange={onToggle} className="rounded text-indigo-600 focus:ring-indigo-500" />
            {t("select", "common") || "Select"}
          </label>
        </div>
      </div>

      <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">{judgment.reason}</p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {judgment.ipc_sections && (
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 border border-slate-200">
            {t("ipc","complaints") || "IPC"} {judgment.ipc_sections}
          </span>
        )}
        {judgment.bail_outcome && (
          <span className={`rounded-md px-2 py-0.5 text-xs font-medium border ${outcomeTone}`}>
            {judgment.bail_outcome}
          </span>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
      <div className="h-4 w-1/3 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-full rounded bg-slate-100" />
      <div className="mt-2 h-3 w-2/3 rounded bg-slate-100" />
    </div>
  );
}

export default function LegalSectionsPage({
  params,
}: {
  params: Promise<{ complaintId: string }>;
}) {
  const { complaintId } = use(params);
  const router = useRouter();
  const { t } = useLanguage();

  const [caseSummary, setCaseSummary] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsManualSummary, setNeedsManualSummary] = useState(false);
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);
  const [selectedJudgmentIds, setSelectedJudgmentIds] = useState<string[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const runAnalysis = useCallback(
    async (summaryOverride?: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/api/complaints/${complaintId}/legal-sections/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ case_summary: summaryOverride || null }),
        });

        if (res.status === 422) {
          setNeedsManualSummary(true);
          setLoading(false);
          return;
        }

        if (!res.ok) {
          throw new Error(`Request failed (${res.status})`);
        }

        const data: AnalysisResult = await res.json();
        setResult(data);
        setCaseSummary(data.case_summary);
        setNeedsManualSummary(false);

        setSelectedSectionIds((current) =>
          current.filter((id) => data.sections.some((section) => section.id === id)),
        );
        setSelectedJudgmentIds((current) =>
          current.filter((id) => data.judgments.some((judgment) => judgment.id === id)),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    },
    [complaintId]
  );

  useEffect(() => {
    runAnalysis();
  }, [complaintId]);

  const selectedSections = result?.sections.filter((section) => selectedSectionIds.includes(section.id)) ?? [];
  const selectedJudgments = result?.judgments.filter((judgment) => selectedJudgmentIds.includes(judgment.id)) ?? [];
  const selectedCount = selectedSections.length + selectedJudgments.length;

  async function handleSaveDraft() {
    if (!result) return;
    setSavingDraft(true);
    setError(null);
    try {
      const payload = {
        complaint_id: complaintId,
        crime_category: result.sections[0]?.category || null,
        summary: caseSummary,
        draft_content: {
          selected_sections: selectedSections,
          selected_judgments: selectedJudgments,
        },
      };

      const res = await fetch(`${API_BASE}/api/fir-drafts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || `Request failed (${res.status})`);
      }

      const data = await res.json();
      setDraftId(data.data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save FIR draft');
    } finally {
      setSavingDraft(false);
    }
  }

  async function handleDownloadDraft() {
    if (!draftId) return;
    setDownloadError(null);
    try {
      const res = await fetch(`${API_BASE}/api/fir-drafts/${draftId}/download`);
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.detail || `Request failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `fir_draft_${draftId}.docx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err instanceof Error ? err.message : 'Failed to download DOCX');
    }
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 min-w-0 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">

            {/* Header Banner */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900">
                    {t("legalSectionIntelligence","complaints") || "Legal Section Intelligence"}
                  </h1>
                  <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                    #{complaintId}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Automated section matching and precedent analysis engine.
                </p>
              </div>

              {/* BACK TO CASES BUTTON */}
              <button
                type="button"
                onClick={() => router.push("/cases")}
                className="self-start sm:self-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition shadow-xs"
              >
                ⬅️ {t("backToCases", "complaints") || "Back to Cases"}
              </button>
            </div>

            {/* Case Summary Box */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t("caseSummaryUsed","complaints") || "Case Summary Used For Analysis"}
              </label>
              <textarea
                value={caseSummary}
                onChange={(e) => setCaseSummary(e.target.value)}
                rows={3}
                placeholder={t("caseSummaryPlaceholder","complaints") || "Type or edit case summary..."}
                className="w-full resize-none rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-slate-50/50"
              />
              <div className="mt-3 flex items-center justify-between gap-4">
                {needsManualSummary && (
                  <p className="text-xs text-amber-700 font-medium">
                    {t("noStoredSummary","complaints") || "No stored summary found. Enter one above."}
                  </p>
                )}
                <button
                  onClick={() => runAnalysis(caseSummary)}
                  disabled={loading || !caseSummary.trim()}
                  className="ml-auto rounded-xl bg-indigo-900 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-950 disabled:opacity-50 transition shadow-xs"
                >
                  {loading ? (t("analyzing","complaints") || "Analyzing...") : (t("reanalyze","complaints") || "Re-analyze")}
                </button>
              </div>
            </div>

            {/* Notifications */}
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
                {error}
              </div>
            )}
            {draftId && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-700">
                {t("firDraftSaved","complaints") || "FIR Draft saved successfully!"}
              </div>
            )}
            {downloadError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
                {downloadError}
              </div>
            )}

            {/* Action Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-900">{t("selectedItems","complaints") || "Selected Items"}</p>
                <p className="text-xs text-slate-500">{selectedCount} item{selectedCount === 1 ? '' : 's'} {t("selected","common") || "selected"}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={savingDraft || selectedCount === 0 || !result}
                  className="rounded-xl bg-indigo-900 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-950 disabled:opacity-50 transition shadow-xs"
                >
                  {savingDraft ? (t("savingDraft","complaints") || "Saving...") : (t("saveFirDraft","complaints") || "Save FIR Draft")}
                </button>
                <button
                  onClick={handleDownloadDraft}
                  disabled={!draftId}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs"
                >
                  {t("downloadDocx","complaints") || "Download DOCX"}
                </button>
              </div>
            </div>

            {/* Sections List */}
            <section>
              <h2 className="mb-4 text-base font-bold text-slate-900">
                {t("applicableSections","complaints") || "Applicable Sections"}
              </h2>
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : result && result.sections.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.sections.map((s) => (
                    <SectionCard
                      key={`${s.act_code}-${s.id}`}
                      section={s}
                      selected={selectedSectionIds.includes(s.id)}
                      onToggle={() => {
                        setSelectedSectionIds((prev) =>
                          prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id],
                        );
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  {needsManualSummary ? (t("waitingSummary","complaints") || "Awaiting summary...") : (t("noMatchingSections","complaints") || "No sections found.")}
                </p>
              )}
            </section>

            {/* Judgments List */}
            <section>
              <h2 className="mb-4 text-base font-bold text-slate-900">
                {t("landmarkJudgments","complaints") || "Landmark Judgments"}
              </h2>
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {Array.from({ length: 2 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : result && result.judgments.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {result.judgments.map((j) => (
                    <JudgmentCard
                      key={j.id}
                      judgment={j}
                      selected={selectedJudgmentIds.includes(j.id)}
                      onToggle={() => {
                        setSelectedJudgmentIds((prev) =>
                          prev.includes(j.id) ? prev.filter((id) => id !== j.id) : [...prev, j.id],
                        );
                      }}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  {needsManualSummary ? (t("waitingSummary","complaints") || "Awaiting summary...") : (t("noJudgmentsFound","complaints") || "No judgments found.")}
                </p>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  );
}