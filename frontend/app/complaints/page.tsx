'use client';

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

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

        <main className="flex-1 p-8">

          <h1 className="text-2xl font-semibold">
            Complaint Search
          </h1>

          <div className="mt-6 flex gap-3">

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by case number, title or keyword..."
              className="flex-1 rounded-lg border p-3"
            />

            <button
              onClick={handleSearch}
              className="rounded-lg bg-blue-600 px-6 text-white"
            >
              Search
            </button>

          </div>

          {loading && (
            <p className="mt-6">
              Searching...
            </p>
          )}

          {!loading && results && (
            <div className="mt-8">

              <h2 className="text-xl font-semibold">
                Cases
              </h2>

              <div className="space-y-4 mt-4">

                {results.cases.map((c: any) => (

                  <div
                    key={c.case_id}
                    className="rounded-xl border bg-white p-5 shadow-sm"
                  >
                    <h3 className="font-semibold">
                      {c.case_number}
                    </h3>

                    <p>{c.title}</p>

                    <p className="text-sm text-gray-600">
                      {c.description}
                    </p>

                    <p className="mt-2 text-sm">
                      Status: {c.status}
                    </p>
                  </div>

                ))}

              </div>

              <h2 className="text-xl font-semibold mt-10">
                Documents
              </h2>

              <div className="space-y-4 mt-4">

                {results.documents.map((d: any) => (

                  <div
                    key={d.document_id}
                    className="rounded-xl border bg-white p-5 shadow-sm"
                  >
                    <h3 className="font-semibold">
                      {d.title}
                    </h3>

                    <p>
                      {d.document_type}
                    </p>

                    <p className="text-sm text-gray-600">
                      Version {d.version}
                    </p>
                  </div>

                ))}

              </div>

            </div>
          )}

        </main>

      </div>
    </div>
  );
}