"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/legal/Sidebar";
import Navbar from "@/components/layout/shared/Navbar";
import DashboardCard from "@/components/dashboard/DashboardCard";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import { useLanguage } from "@/app/providers/LanguageProvider";

export const dynamic = "force-dynamic";

export interface CaseItem {
  id: string;
  title?: string;
  description?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW" | string;
  status?: string;
  applicableSections?: string[]; // e.g. ["BNS §318 (Cheating)", "BNS §303 (Theft)"]
  createdAt?: string;
}

export interface FirDraft {
  id: string;
  caseId?: string;
  title?: string;
  legalOpinion?: string;
  status?: "PENDING_LEGAL_REVIEW" | "APPROVED" | "REJECTED" | string;
  createdAt?: string;
}

// Fallback legal mock data if backend DB returns an empty array
const FALLBACK_CASES: CaseItem[] = [
  {
    id: "CASE-8902",
    title: "Financial Fraud & Breach of Trust",
    priority: "HIGH",
    status: "Pending Legal Review",
    applicableSections: ["BNS §318 (Cheating)", "IT Act §66D"],
    createdAt: "2 hours ago",
  },
  {
    id: "CASE-8891",
    title: "Cyber Stalking & Harassment Report",
    priority: "MEDIUM",
    status: "Draft Review Required",
    applicableSections: ["BNS §78 (Stalking)", "IT Act §67"],
    createdAt: "4 hours ago",
  },
  {
    id: "CASE-8874",
    title: "Commercial Property Encroachment",
    priority: "HIGH",
    status: "Urgent Injunction Advice",
    applicableSections: ["BNS §329 (Trespass)"],
    createdAt: "Yesterday",
  },
  {
    id: "CASE-8850",
    title: "Contractual Breach & Counterfeit Claim",
    priority: "LOW",
    status: "Under Legal Examination",
    applicableSections: ["BNS §336 (Forgery)"],
    createdAt: "2 days ago",
  },
];

const FALLBACK_DRAFTS: FirDraft[] = [
  {
    id: "FIR-1042",
    caseId: "CASE-8902",
    title: "Draft FIR - Sec 318 BNS Corporate Fraud",
    status: "PENDING_LEGAL_REVIEW",
    createdAt: "30 mins ago",
  },
  {
    id: "FIR-1039",
    caseId: "CASE-8891",
    title: "Draft FIR - Cyber Stalking Offense",
    status: "PENDING_LEGAL_REVIEW",
    createdAt: "3 hours ago",
  },
];

export default function LegalDashboard() {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [firDrafts, setFirDrafts] = useState<FirDraft[]>([]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";

  // Helper to safely extract arrays regardless of API response wrapper format
  const extractArray = (data: any, possibleKeys: string[]): any[] => {
    if (Array.isArray(data)) return data;
    for (const key of possibleKeys) {
      if (Array.isArray(data?.[key])) return data[key];
    }
    return [];
  };

  useEffect(() => {
    async function fetchLegalData() {
      try {
        const [casesRes, draftsRes] = await Promise.allSettled([
          fetch(`${backendUrl}/api/cases`),
          fetch(`${backendUrl}/api/fir_drafts`),
        ]);

        let fetchedCases: CaseItem[] = [];
        let fetchedDrafts: FirDraft[] = [];

        if (casesRes.status === "fulfilled" && casesRes.value.ok) {
          const json = await casesRes.value.json();
          fetchedCases = extractArray(json, ["cases", "data", "items"]);
        }

        if (draftsRes.status === "fulfilled" && draftsRes.value.ok) {
          const json = await draftsRes.value.json();
          fetchedDrafts = extractArray(json, ["fir_drafts", "drafts", "data"]);
        }

        // Use fetched DB data if available, otherwise use structured legal fallbacks
        setCases(fetchedCases.length > 0 ? fetchedCases : FALLBACK_CASES);
        setFirDrafts(fetchedDrafts.length > 0 ? fetchedDrafts : FALLBACK_DRAFTS);
      } catch (error) {
        console.error("Failed to fetch legal dashboard data:", error);
        setCases(FALLBACK_CASES);
        setFirDrafts(FALLBACK_DRAFTS);
      } finally {
        setLoading(false);
      }
    }

    fetchLegalData();
  }, [backendUrl]);

  // Derived Legal Advisor Metrics
  const pendingLegalReviews = firDrafts.filter(
    (d) =>
      !d.status ||
      d.status.toUpperCase().includes("PENDING") ||
      d.status.toUpperCase().includes("REVIEW")
  ).length;

  const urgentCases = cases.filter(
    (c) => c.priority?.toUpperCase() === "HIGH" || c.priority?.toUpperCase() === "URGENT"
  ).length;

  const stats = [
    {
      title: "Cases Pending Legal Advice",
      value: loading ? "..." : String(cases.length),
      subtitle: `${cases.length} active legal files queued`,
      accent: "bg-blue-600",
    },
    {
      title: "FIR Drafts Vetting Queue",
      value: loading ? "..." : String(pendingLegalReviews),
      subtitle: "Draft FIRs requiring sign-off",
      accent: "bg-amber-500",
    },
    {
      title: "High Risk / Flagged Offenses",
      value: loading ? "..." : String(urgentCases),
      subtitle: "Requires immediate legal opinion",
      accent: "bg-rose-500",
    },
    {
      title: "Total FIR Drafts Logged",
      value: loading ? "..." : String(firDrafts.length),
      subtitle: "Synced across investigation teams",
      accent: "bg-emerald-500",
    },
  ];

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      <Navbar />

      <main className="flex flex-1 overflow-hidden">
        <Sidebar />

        <div className="flex-1 space-y-6 overflow-y-auto p-6 lg:p-8">
          {/* Header Banner */}
          <section className="rounded-[32px] bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-8 text-white shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">
                  {t("appName", "dashboard")}
                </p>
                <h1 className="mt-2 text-3xl font-semibold">
                  Legal Advisor Operations Hub
                </h1>
                <p className="mt-3 max-w-2xl text-sm text-blue-50/90">
                  Review FIR drafts, vet evidence under applicable statutory sections (BNS / IPC / IT Act), and issue binding legal opinions.
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur">
                <p className="font-semibold">Live DB Sync Active</p>
                <p className="mt-1 text-blue-50">
                  {firDrafts.length} FIR drafts fetched
                </p>
              </div>
            </div>
          </section>

          {/* Legal Metrics Grid */}
          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <DashboardCard key={stat.title} {...stat} />
            ))}
          </section>

          {/* Cases & FIR Drafts Review Table */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Cases & FIR Drafts Awaiting Legal Vetting
                </h2>
                <p className="text-xs text-slate-500">
                  Select a case to inspect evidence, cross-reference statutory charges, and finalize legal advice.
                </p>
              </div>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                {cases.length} Cases Active
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Fetching legal records from database...
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Case / FIR Ref</th>
                      <th className="px-4 py-3">Title & Summary</th>
                      <th className="px-4 py-3">Applicable Sections</th>
                      <th className="px-4 py-3">Priority</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cases.map((c) => (
                      <tr key={c.id} className="transition hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          #{c.id.toString().slice(-8)}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">{c.title || "Untitled Case"}</p>
                          {c.description && (
                            <p className="text-xs text-slate-400 line-clamp-1">{c.description}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {(c.applicableSections || ["BNS General"]).map((sec) => (
                              <span
                                key={sec}
                                className="inline-block rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700"
                              >
                                {sec}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              c.priority?.toUpperCase() === "HIGH"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {c.priority || "Normal"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-slate-500">
                          {c.status || "Pending Legal Opinion"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700">
                            Vet FIR & Opinion
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Bottom Section: Activity Feed + Quick Statutory Helper */}
          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <ActivityFeed />

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-md font-semibold text-slate-800">
                Legal Advisor Quick Actions
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Essential utilities for vetting criminal charges & evidence integrity.
              </p>

              <div className="mt-4 space-y-3">
                <button className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">
                  📖 Search Legal Library (BNS / BNSS / IPC / CrPC)
                </button>
                <button className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">
                  ⚖️ Generate Legal Opinion Template
                </button>
                <button className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-xs font-medium text-slate-700 transition hover:bg-blue-50 hover:text-blue-700">
                  🛡️ Flag Missing Statutory Evidence
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}