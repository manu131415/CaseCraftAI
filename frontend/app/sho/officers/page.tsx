'use client';

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  Shield,
  Building2,
  BadgeCheck,
  User,
  Filter,
  X,
  Users,
  RefreshCw
} from "lucide-react";
import Sidebar from "@/components/layout/sho/Sidebar";
import Navbar from "@/components/layout/shared/Navbar";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface Officer {
  officer_id: string;
  badge_number: string;
  name: string;
  rank: string;
  station: string;
}

export default function OfficersPage() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useLanguage();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRank, setSelectedRank] = useState("ALL");
  const [selectedStation, setSelectedStation] = useState("ALL");

  const fetchOfficers = () => {
    setLoading(true);
    setError(null);
    fetch("/api/officers")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load officers");
        return res.json();
      })
      .then((data) => {
        setOfficers(data.officers ?? []);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOfficers();
  }, []);

  // Extract unique Ranks and Stations for dropdown filters
  const uniqueRanks = useMemo(() => {
    const set = new Set(officers.map((o) => o.rank).filter(Boolean));
    return Array.from(set).sort();
  }, [officers]);

  const uniqueStations = useMemo(() => {
    const set = new Set(officers.map((o) => o.station).filter(Boolean));
    return Array.from(set).sort();
  }, [officers]);

  // Combined Search & Filter logic
  const filteredOfficers = useMemo(() => {
    return officers.filter((officer) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        officer.name.toLowerCase().includes(q) ||
        officer.officer_id.toLowerCase().includes(q) ||
        officer.badge_number.toLowerCase().includes(q) ||
        officer.rank.toLowerCase().includes(q) ||
        officer.station.toLowerCase().includes(q);

      const matchesRank =
        selectedRank === "ALL" || officer.rank === selectedRank;

      const matchesStation =
        selectedStation === "ALL" || officer.station === selectedStation;

      return matchesSearch && matchesRank && matchesStation;
    });
  }, [officers, searchQuery, selectedRank, selectedStation]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedRank("ALL");
    setSelectedStation("ALL");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedRank !== "ALL" || selectedStation !== "ALL";

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <Navbar eyebrow={t("operationsCenter", "common")} title={t("officers", "common")} />

      <div className="flex flex-1 min-w-0">
        <aside className="sticky top-0 h-screen self-start shrink-0">
          <Sidebar />
        </aside>

        <main className="flex-1 min-w-0 p-6 lg:p-8 space-y-6">
          {/* Header Banner & Stats */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-6 border border-slate-200 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-indigo-600">
                <Users className="h-6 w-6" />
                <h1 className="text-2xl font-bold text-slate-900">
                  {t("officers", "common") || "Officers Directory"}
                </h1>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {t("officersSubtitle", "common") || "View and filter all police officers registered in the jurisdiction."}
              </p>
            </div>

            {/* Quick Summary Badges */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-50 px-4 py-2 border border-indigo-100 text-center">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Total Officers</p>
                <p className="text-lg font-bold text-indigo-900">{officers.length}</p>
              </div>
              <div className="rounded-xl bg-slate-50 px-4 py-2 border border-slate-200 text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stations</p>
                <p className="text-lg font-bold text-slate-800">{uniqueStations.length}</p>
              </div>
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Universal Search Field */}
              <div className="relative md:col-span-5">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Name, Officer ID, Badge No, Rank, or Station..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Rank Filter */}
              <div className="relative md:col-span-3">
                <div className="flex items-center gap-1.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Shield className="h-3.5 w-3.5" />
                </div>
                <select
                  value={selectedRank}
                  onChange={(e) => setSelectedRank(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2.5 text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="ALL">All Ranks ({uniqueRanks.length})</option>
                  {uniqueRanks.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </div>

              {/* Station Filter */}
              <div className="relative md:col-span-3">
                <div className="flex items-center gap-1.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <select
                  value={selectedStation}
                  onChange={(e) => setSelectedStation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2.5 text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
                >
                  <option value="ALL">All Police Stations ({uniqueStations.length})</option>
                  {uniqueStations.map((station) => (
                    <option key={station} value={station}>
                      {station}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              <div className="md:col-span-1 flex items-center justify-end">
                {hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-amber-50 border border-amber-200 py-2.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition"
                    title="Reset Filters"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reset
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={fetchOfficers}
                    className="w-full inline-flex items-center justify-center rounded-xl bg-slate-100 border border-slate-200 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition"
                    title="Refresh Data"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Status Summary Bar */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <p>
                Showing <span className="font-bold text-slate-900">{filteredOfficers.length}</span> of{" "}
                <span className="font-bold text-slate-900">{officers.length}</span> officers
              </p>
              {hasActiveFilters && (
                <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                  <Filter className="h-3 w-3" /> Filters Applied
                </span>
              )}
            </div>
          </div>

          {/* Officers Table Container — Stretches to full width */}
          <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            {loading && (
              <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
                <span>{t("loadingOfficers", "common") || "Loading officers..."}</span>
              </div>
            )}

            {error && (
              <div className="p-6 text-xs text-red-600 bg-red-50 border-b border-red-100 flex items-center gap-2">
                <X className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {!loading && !error && filteredOfficers.length === 0 && (
              <div className="p-12 text-center text-xs text-slate-400 space-y-2">
                <User className="h-8 w-8 mx-auto text-slate-300" />
                <p className="font-medium text-slate-600">
                  {t("noOfficersFound", "common") || "No officers found matching your criteria."}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-indigo-600 underline font-semibold hover:text-indigo-800"
                  >
                    Clear search and filters
                  </button>
                )}
              </div>
            )}

            {!loading && !error && filteredOfficers.length > 0 && (
              <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-5 py-3.5">Officer ID</th>
                      <th className="px-5 py-3.5">Badge No.</th>
                      <th className="px-5 py-3.5">Officer Name</th>
                      <th className="px-5 py-3.5">Rank</th>
                      <th className="px-5 py-3.5">Assigned Station</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredOfficers.map((officer) => (
                      <tr
                        key={officer.officer_id}
                        className="hover:bg-slate-50/80 transition"
                      >
                        {/* Officer ID */}
                        <td className="px-5 py-3.5 font-mono text-[11px] font-semibold text-indigo-600">
                          {officer.officer_id}
                        </td>

                        {/* Badge Number */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200">
                            <BadgeCheck className="h-3 w-3 text-slate-400" />
                            {officer.badge_number}
                          </span>
                        </td>

                        {/* Name */}
                        <td className="px-5 py-3.5 font-semibold text-slate-900">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px]">
                              {officer.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span>{officer.name}</span>
                          </div>
                        </td>

                        {/* Rank */}
                        <td className="px-5 py-3.5">
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700 border border-indigo-100">
                            <Shield className="h-3 w-3 text-indigo-500" />
                            {officer.rank}
                          </span>
                        </td>

                        {/* Station */}
                        <td className="px-5 py-3.5 text-slate-700 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{officer.station}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}