'use client';

import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import ComplaintList from "@/components/complaint/ComplaintList";

export default function ComplaintsPage() {
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