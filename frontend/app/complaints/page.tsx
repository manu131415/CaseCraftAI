'use client';

import { useState } from "react";
import Navbar from "@/components/layout/io/Navbar";
import Sidebar from "@/components/layout/io/Sidebar";
import ComplaintList from "@/components/complaint/ComplaintList";

export default function ComplaintsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
      const response = await fetch(`${API_BASE}/api/complaints/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      // prefer { complaints: [...] } or raw array
      setResults(data.complaints ?? data);
    } catch (err) {
      console.error(err);
      alert("Search failed.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">

        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Complaints</h1>
              <p className="text-slate-600 mt-2">All registered complaints are listed here.</p>
            </div>
          </div>
          <div className="mb-6 flex items-center gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search complaints by keyword or id" className="w-full max-w-lg rounded-md border border-slate-200 bg-white px-3 py-2 text-sm" />
            <button onClick={handleSearch} disabled={loading} className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">{loading ? 'Searching...' : 'Search'}</button>
            <button onClick={() => { setQuery(''); setResults(null); }} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">Clear</button>
          </div>
          <ComplaintList initialComplaints={Array.isArray(results) ? results : undefined} />
        </main>

      </div>
    </div>
  );
}