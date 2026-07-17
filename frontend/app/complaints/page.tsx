'use client';

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ComplaintList from "@/components/complaint/ComplaintList";

export default function ComplaintsPage() {
  const [search, setSearch] = useState("");

  const [crimeCategory, setCrimeCategory] = useState("");
  const [crimeSubcategory, setCrimeSubcategory] = useState("");
  const [status, setStatus] = useState("");
  const [caseStatus, setCaseStatus] = useState("");

  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!search.trim()) {
      setResults(null);
      return;
    }

    setLoading(true);

    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        "http://localhost:8000";

      const response = await fetch(
        `${API_BASE}/api/complaints/search?q=${encodeURIComponent(search)}`
      );

      const data = await response.json();

      setResults(data.complaints ?? data);
    } catch (err) {
      console.error(err);
      alert("Search failed.");
    }

    setLoading(false);
  };

  const clearFilters = () => {
    setSearch("");
    setCrimeCategory("");
    setCrimeSubcategory("");
    setStatus("");
    setCaseStatus("");
    setResults(null);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8">
          {/* Header */}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Complaints
            </h1>

            <p className="mt-2 text-slate-600">
              View and manage all registered complaints.
            </p>
          </div>

          {/* Filter Toolbar */}

          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">

              {/* Search */}

              <input
                type="text"
                placeholder="Search complaint..."
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
                <option value="">Crime Category</option>
                <option>Cyber Crimes</option>
                <option>Property Crimes</option>
                <option>Crimes Against Women</option>
                <option>Financial Crimes</option>
                <option>Traffic Offences</option>
              </select>

              {/* Crime Subcategory */}

              <select
                value={crimeSubcategory}
                onChange={(e) => setCrimeSubcategory(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Subcategory</option>
              </select>

              {/* Status */}

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Status</option>
                <option>Pending</option>
                <option>Under Investigation</option>
                <option>Closed</option>
                <option>Rejected</option>
              </select>

              {/* Case */}

              <select
                value={caseStatus}
                onChange={(e) => setCaseStatus(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Case</option>
                <option>Created</option>
                <option>Not Created</option>
              </select>
            </div>

            {/* Buttons */}

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleSearch}
                disabled={loading}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-white hover:bg-indigo-700"
              >
                {loading ? "Searching..." : "Search"}
              </button>

              <button
                onClick={clearFilters}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 hover:bg-slate-100"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Complaint Table */}

          <ComplaintList
            initialComplaints={Array.isArray(results) ? results : undefined}
            search={search}
            crimeCategory={crimeCategory}
            crimeSubcategory={crimeSubcategory}
            status={status}
            caseStatus={caseStatus}
          />
        </main>
      </div>
    </div>
  );
}