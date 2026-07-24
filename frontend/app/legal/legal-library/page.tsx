"use client";

import { useEffect, useRef, useState } from "react";
import { Search, BookOpen, AlertCircle, X, ScrollText, ArrowLeftRight } from "lucide-react";
import Sidebar from "@/components/layout/legal/Sidebar";
import Navbar from "@/components/layout/shared/Navbar";
import { useLanguage } from "@/app/providers/LanguageProvider";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;
const BROWSE_LIMIT = 20;

// ---------------------------------------------------------------------------
// Types — mirror the FastAPI /api/legal-sections/search response
// ---------------------------------------------------------------------------
interface MappingReference {
  act_pair: string;
  old_act: string;
  new_act: string;
  old_section?: string | null;
  new_section: string;
  subject?: string | null;
  summary_of_comparison?: string | null;
}

interface LegalSectionResult {
  id: string;
  act_code?: string | null;
  section_number?: string | null;
  title?: string | null;
  section_text?: string | null;
  category?: string | null;
  similarity?: number;
  mapping?: MappingReference | null;
}

interface SearchResponse {
  query: string;
  results: LegalSectionResult[];
}

interface BrowseResponse {
  legal_sections: LegalSectionResult[];
}

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

// Which side of the cross-reference to surface depends on which act the
// matched section itself belongs to.
function crossReferenceLabel(section: LegalSectionResult): string | null {
  const mapping = section.mapping;
  if (!mapping) return null;
  const isNewAct = mapping.new_act === section.act_code && mapping.new_section === section.section_number;
  const { t } = useLanguage();
  return isNewAct
    ? `${t("previously","dashboard")} ${mapping.old_act} ${t("section","common")} ${mapping.old_section ?? "—"}`
    : `${t("now","dashboard")} ${mapping.new_act} ${t("section","common")} ${mapping.new_section}`;
}

export default function LegalLibraryPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [selectedSection, setSelectedSection] = useState<LegalSectionResult | null>(null);
  const [results, setResults] = useState<LegalSectionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debouncedQuery = useDebouncedValue(query, SEARCH_DEBOUNCE_MS);
  const abortRef = useRef<AbortController | null>(null);

  // Default "browse all sections" list, shown before the person has typed
  // a real query. Fetched once on mount — independent of the search effect.
  const [browseResults, setBrowseResults] = useState<LegalSectionResult[]>([]);
  const [browseLoading, setBrowseLoading] = useState(true);
  const [browseError, setBrowseError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadBrowse() {
      try {
        setBrowseLoading(true);
        setBrowseError(null);
        const url = `${API_BASE}/api/legal-sections`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data: BrowseResponse = await res.json();
        setBrowseResults((data.legal_sections ?? []).slice(0, BROWSE_LIMIT));
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setBrowseError(err instanceof Error ? err.message : "Couldn't load sections");
      } finally {
        setBrowseLoading(false);
      }
    }

    loadBrowse();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const trimmed = debouncedQuery.trim();

    abortRef.current?.abort();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setError(null);
      setLoading(false);
      setHasSearched(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;

    async function search() {
      try {
        setLoading(true);
        setError(null);
        const url = `${API_BASE}/api/legal-sections/search?q=${encodeURIComponent(trimmed)}&limit=15`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data: SearchResponse = await res.json();
        setResults(data.results ?? []);
        setHasSearched(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Search failed");
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }

    search();
    return () => controller.abort();
  }, [debouncedQuery]);

  const trimmedQuery = query.trim();
  const showPrompt = trimmedQuery.length < MIN_QUERY_LENGTH;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar eyebrow={t("legalLibrary", "dashboard")} title={t("searchLegalSections", "dashboard")} />

        <main className="flex-1 space-y-6 px-8 py-6">
          <section className="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-700 p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-200">
              CaseCraftAI · {t("legalLibrary", "dashboard")}
            </p>
            <h2 className="mt-1 text-2xl md:text-3xl font-semibold text-white">
              {t("findExactSection", "dashboard")}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-indigo-100">
              {t("legalLibraryDescription", "dashboard")}
            </p>

            <div className="relative mt-6 max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("legalSearchPlaceholder", "dashboard")}
                autoFocus
                className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t("clearSearch", "common")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {!showPrompt && !loading && !error && (
              <p className="mt-3 text-xs text-indigo-200">
                {results.length} {t("result","dashboard")}{results.length === 1 ? "" : "s"} {t("for","common")} &ldquo;{trimmedQuery}&rdquo;
              </p>
            )}
          </section>

          {/* Before a real query, show a browsable list of sections instead of an empty state */}
          {showPrompt && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">{t("browseLegalSections","dashboard")}</h3>
                <p className="text-xs text-slate-400">
                  {t("browseHint","dashboard")}
                </p>
              </div>

              {browseLoading && (
                <div className="grid gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
                      <div className="h-4 w-24 rounded bg-slate-100" />
                      <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-full rounded bg-slate-100" />
                      <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
                    </div>
                  ))}
                </div>
              )}

              {!browseLoading && browseError && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">
                  <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-red-700">{t("couldNotLoadSections","dashboard")}</p>
                    <p className="mt-1 text-sm text-red-500">{browseError}</p>
                  </div>
                </div>
              )}

              {!browseLoading && !browseError && browseResults.length === 0 && (
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
                  <Search className="h-8 w-8 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">{t("startTyping","dashboard")}</p>
                  <p className="text-xs text-slate-400 max-w-sm">
                    {t("browseHint","dashboard")}
                  </p>
                </div>
              )}

              {!browseLoading && !browseError && browseResults.length > 0 && (
                <div className="grid gap-4 pb-10">
                  {browseResults.map((section) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      onClick={() => setSelectedSection(section)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {!showPrompt && loading && (
            <div className="grid gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="h-4 w-24 rounded bg-slate-100" />
                  <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-full rounded bg-slate-100" />
                  <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          )}

          {!showPrompt && !loading && error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-5">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-700">{t("searchFailed","complaints")}</p>
                <p className="mt-1 text-sm text-red-500">{error}</p>
              </div>
            </div>
          )}

          {!showPrompt && !loading && !error && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center">
              <ScrollText className="h-8 w-8 text-slate-300" />
              <p className="text-sm font-medium text-slate-600">{t("noMatchingSections","complaints")}</p>
              <p className="text-xs text-slate-400 max-w-sm">{t("tryDifferentDescription","dashboard")}</p>
            </div>
          )}

          {!showPrompt && !loading && !error && results.length > 0 && (
            <div className="grid gap-4 pb-10">
              {results.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  onClick={() => setSelectedSection(section)}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedSection && (
        <SectionModal section={selectedSection} onClose={() => setSelectedSection(null)} />
      )}
    </div>
  );
}

function SectionCard({
  section,
  onClick,
}: {
  section: LegalSectionResult;
  onClick: () => void;
}) {
  const crossRef = crossReferenceLabel(section);
  const { t } = useLanguage();

  return (
    <article
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md hover:border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {section.act_code && (
                <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                  {section.act_code}
                </span>
              )}
              {section.section_number && (
                <span className="text-xs font-medium text-slate-400">
                  {t("section","common")} {section.section_number}
                </span>
              )}
              {section.category && <span className="text-xs text-slate-400">• {section.category}</span>}
            </div>
            <h3 className="mt-1 text-sm font-semibold text-slate-900">
              {section.title ?? t("untitledSection","dashboard")}
            </h3>
          </div>
        </div>

        {/* similarity is only meaningful for a real search match, not the browse list */}
        {(section.similarity ?? 0) > 0 && (
          <span className="shrink-0 rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-500">
            {Math.round((section.similarity ?? 0) * 100)}% {t("match","complaints")}
          </span>
        )}
      </div>

      {section.section_text && (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
          {section.section_text}
        </p>
      )}

      {crossRef && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2">
          <ArrowLeftRight className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber-700">{crossRef}</p>
            {section.mapping?.subject && (
              <p className="text-xs text-amber-600 mt-0.5">{section.mapping.subject}</p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function SectionModal({
  section,
  onClose,
}: {
  section: LegalSectionResult;
  onClose: () => void;
}) {
  const crossRef = crossReferenceLabel(section);
  const { t } = useLanguage();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8"
      onClick={onClose}
    >
      <div
        className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {section.act_code && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-600">
                    {section.act_code}
                  </span>
                )}
                {section.section_number && (
                  <span className="text-xs font-medium text-slate-400">
                    {t("section","common")} {section.section_number}
                  </span>
                )}
                {section.category && (
                  <span className="text-xs text-slate-400">• {section.category}</span>
                )}
              </div>
              <h3 className="mt-1 text-base font-semibold text-slate-900">
                {section.title ?? t("untitledSection","dashboard")}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("close","common")}
            className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {section.section_text && (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
            {section.section_text}
          </p>
        )}

        {crossRef && (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2">
            <ArrowLeftRight className="h-3.5 w-3.5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-700">{crossRef}</p>
              {section.mapping?.subject && (
                <p className="text-xs text-amber-600 mt-0.5">{section.mapping.subject}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}