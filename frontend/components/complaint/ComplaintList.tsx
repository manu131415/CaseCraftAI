"use client";

import { useEffect, useState } from "react";
import axios from "axios";

interface ComplaintSummary {
  complaint_id: string;
  complainant_name?: string;
  phone?: string;
  email?: string;
  crime_type?: string;
  location?: string;
  description?: string;
  status?: string;
  created_at?: string;
  incident_datetime?: string;
}

export default function ComplaintList() {
  const [complaints, setComplaints] = useState<ComplaintSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadComplaints() {
      try {
        const response = await axios.get("http://localhost:8000/api/complaints");
        setComplaints(response.data.complaints || []);
      } catch (err) {
        setError("Unable to load complaints. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    loadComplaints();
  }, []);

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">Loading complaints...</div>;
  }

  if (error) {
    return <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-700 shadow-sm">{error}</div>;
  }

  if (!complaints.length) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">No complaints registered yet</h2>
        <p className="mt-2 text-slate-600">Submit a complaint from the registration page and it will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {complaints.map((complaint) => (
        <div key={complaint.complaint_id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{complaint.complaint_id}</h2>
              <p className="mt-1 text-sm text-slate-500">{complaint.status || "Pending"}</p>
            </div>
            <div className="text-right text-sm text-slate-500">
              {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : "No date"}
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-slate-700">Complainant</p>
              <p className="mt-1 text-sm text-slate-600">{complaint.complainant_name || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Crime type</p>
              <p className="mt-1 text-sm text-slate-600">{complaint.crime_type || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Location</p>
              <p className="mt-1 text-sm text-slate-600">{complaint.location || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Phone</p>
              <p className="mt-1 text-sm text-slate-600">{complaint.phone || "Not provided"}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-slate-700">Description</p>
            <p className="mt-1 text-sm text-slate-600">{complaint.description || "Not provided"}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
