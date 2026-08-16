'use client';

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/shared/Navbar";
import Sidebar from "@/components/layout/io/Sidebar";
import { ClipboardList } from "lucide-react";
import ComplaintList from "@/components/complaint/ComplaintList";
import ComplaintDetailPanel from "@/components/complaint/ComplaintDetailPanel";
import { useLanguage } from "@/app/providers/LanguageProvider";

export default function ComplaintsPage() {
  const [search, setSearch] = useState("");

  const [crimeCategory, setCrimeCategory] = useState("");
  const [crimeSubcategory, setCrimeSubcategory] = useState("");
  const [status, setStatus] = useState("");
  const [caseStatus, setCaseStatus] = useState("");

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { t } = useLanguage();

  // Helper function to sort array newest first
  const sortNewestFirst = (data: any[]) => {
    if (!Array.isArray(data)) return [];
    return [...data].sort((a, b) => {
      const timeA = new Date(a.createdAt || a.incidentDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.incidentDate || 0).getTime();
      return timeB - timeA; // Descending order
    });
  };

  // Fetch initial complaints sorted newest first on page load
  const fetchInitialComplaints = async () => {
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

      const response = await fetch(`${API_BASE}/api/complaints`);
      if (response.ok) {
        const data = await response.json();
        const list = data.complaints ?? data;
        setResults(sortNewestFirst(list));
      }
    } catch (err) {
      console.error("Failed to load initial complaints:", err);
    }
  };

  useEffect(() => {
    fetchInitialComplaints();
  }, []);

  const handleSearch = async () => {
    if (!search.trim()) {
      fetchInitialComplaints();
      return;
    }

    setLoading(true);

    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

      const response = await fetch(
        `${API_BASE}/api/complaints/search?q=${encodeURIComponent(search)}`
      );

      const data = await response.json();
      const list = data.complaints ?? data;

      // Sort search results descending
      setResults(sortNewestFirst(list));
    } catch (err) {
      console.error(err);
      alert(t("searchFailed", "complaints"));
    }

    setLoading(false);
  };

  const clearFilters = () => {
    setSearch("");
    setCrimeCategory("");
    setCrimeSubcategory("");
    setStatus("");
    setCaseStatus("");
    fetchInitialComplaints();
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <div className="w-64 shrink-0">
          <Sidebar />
        </div>

        {/* Updated main padding to add spacing from Sidebar */}
        <main className="flex-1 min-w-0 py-6 pr-6 pl-8 lg:py-10 lg:pr-10 lg:pl-10">
          {/* Header */}
          <div className="mb-8">
            <h1 className="flex items-center gap-3 text-3xl font-bold text-slate-800">
              <ClipboardList className="h-7 w-7 text-indigo-500 shrink-0" />
              {t("complaintList", "common")}
            </h1>

            <p className="mt-2 text-slate-600">
              {t("View all your Complaints ", "complaints")}
            </p>
          </div>

          {/* Filter Toolbar */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {/* Search */}
              <input
                type="text"
                placeholder={t("Search Complaints...", "complaints")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              {/* Crime Category */}
              <select
                value={crimeCategory}
                onChange={(e) => setCrimeCategory(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">{t("crimeCategory", "complaints")}</option>
                <option>{t("cyberCrimes", "complaints")}</option>
                <option>{t("propertyCrimes", "complaints")}</option>
                <option>{t("crimesAgainstWomen", "complaints")}</option>
                <option>{t("financialCrimes", "complaints")}</option>
                <option>{t("trafficOffences", "complaints")}</option>
              </select>

              {/* Crime Subcategory */}
              <select
                value={crimeSubcategory}
                onChange={(e) => setCrimeSubcategory(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">{t("subcategory", "complaints")}</option>
              </select>

              {/* Status */}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">{t("status", "complaints")}</option>
                <option>{t("pending", "complaints")}</option>
                <option>{t("rejected", "complaints")}</option>
              </select>

              {/* Case */}
              <select
                value={caseStatus}
                onChange={(e) => setCaseStatus(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">{t("case", "complaints")}</option>
                <option>{t("created", "complaints")}</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="mt-5 flex gap-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
              >
                {loading ? t("searching", "complaints") : t("search", "common")}
              </button>

              <button
                onClick={clearFilters}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 hover:bg-slate-100"
              >
                {t("clearFilters", "complaints")}
              </button>
            </div>
          </div>

          {/* Two-pane: complaint list (left) + details (right) */}
          <div className="grid gap-6 lg:grid-cols-[minmax(320px,420px)_1fr] lg:items-start">
            <div className="lg:sticky lg:top-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
              <ComplaintList
                initialComplaints={Array.isArray(results) ? results : undefined}
                search={search}
                crimeCategory={crimeCategory}
                crimeSubcategory={crimeSubcategory}
                status={status}
                caseStatus={caseStatus}
                compact
                onSelect={setSelectedId}
                selectedId={selectedId}
              />
            </div>

            <ComplaintDetailPanel
              complaintId={selectedId}
              onClose={() => setSelectedId(null)}
            />
          </div>
        </main>
      </div>
    </div>
  );
}