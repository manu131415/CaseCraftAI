"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import CaseList from "@/components/case/CaseList";

export default function CasesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />

      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-8">

          {/* Header */}

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-800">
              Cases
            </h1>

            <p className="mt-2 text-slate-600">
              View and manage all created investigation cases.
            </p>
          </div>

          {/* Filter Toolbar */}

          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              {/* Search */}

              <input
                type="text"
                placeholder="Search case..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />

              {/* Status */}

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Status</option>

                <option>Case Created</option>
                <option>FIR Registered</option>
                <option>Under Investigation</option>
                <option>Evidence Collection</option>
                <option>Charge Sheet Filed</option>
                <option>Trial</option>
                <option>Closed</option>
              </select>

              {/* Priority */}

              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Priority</option>

                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>

              {/* Clear */}

              <button
                onClick={() => {
                  setSearch("");
                  setStatus("");
                  setPriority("");
                }}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2 hover:bg-slate-100"
              >
                Clear Filters
              </button>

            </div>

          </div>

          {/* Case Table */}

          <CaseList
            search={search}
            status={status}
            priority={priority}
          />

        </main>
      </div>
    </div>
  );
}