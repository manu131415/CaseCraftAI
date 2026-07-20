'use client';

import { useEffect, useState } from "react";
import Sidebar from "@/components/layout/sho/Sidebar";
import Navbar from "@/components/layout/shared/Navbar";

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

  useEffect(() => {
    let cancelled = false;

    fetch("/api/officers")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load officers");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setOfficers(data.officers ?? []);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex-1">
        <Navbar eyebrow="Operations Center" title="Officers" />

        <main className="p-6">
          <h1 className="text-2xl font-bold text-slate-900">Officers</h1>
          <p className="mt-1 text-sm text-slate-600">
            View all officers registered in the system.
          </p>

          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {loading && (
              <div className="p-6 text-sm text-slate-500">Loading officers…</div>
            )}

            {error && (
              <div className="p-6 text-sm text-red-600">{error}</div>
            )}

            {!loading && !error && officers.length === 0 && (
              <div className="p-6 text-sm text-slate-500">No officers found.</div>
            )}

            {!loading && !error && officers.length > 0 && (
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Officer ID</th>
                    <th className="px-4 py-3 font-medium">Badge No.</th>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Rank</th>
                    <th className="px-4 py-3 font-medium">Station</th>
                  </tr>
                </thead>
                <tbody>
                  {officers.map((officer) => (
                    <tr
                      key={officer.officer_id}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-3 text-slate-900">{officer.officer_id}</td>
                      <td className="px-4 py-3 text-slate-700">{officer.badge_number}</td>
                      <td className="px-4 py-3 text-slate-700">{officer.name}</td>
                      <td className="px-4 py-3 text-slate-700">{officer.rank}</td>
                      <td className="px-4 py-3 text-slate-700">{officer.station}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}