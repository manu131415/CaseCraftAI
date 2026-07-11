'use client';

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";

export default function ComplaintsPage() {
  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <h1 className="text-2xl font-semibold">Complaints</h1>
          <p className="text-slate-600 mt-2">Complaints list will be displayed here.</p>
        </main>
      </div>
    </div>
  );
}