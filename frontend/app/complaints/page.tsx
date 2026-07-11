'use client';

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ComplaintList from "@/components/complaint/ComplaintList";

export default function ComplaintsPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(
        `http://localhost:8000/api/cases/search?q=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      setResults(data);
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
          <ComplaintList />
        </main>

      </div>
    </div>
  );
}