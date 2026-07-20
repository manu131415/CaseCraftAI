"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { CheckCircle2, AlertCircle } from "lucide-react";
import Navbar from "@/components/layout/shared/Navbar";
import Sidebar from "@/components/layout/io/Sidebar";

export default function SubmitDraftPage() {
  const router = useRouter();
  const params = useParams();
  const complaintId = params?.complaintId as string;

  const [complaint, setComplaint] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!complaintId) return;
    
    const fetchComplaint = async () => {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
        const response = await axios.get(`${API_BASE}/api/complaints/${complaintId}`);
        
        if (response.data.is_draft === false) {
          setError("This complaint is already submitted.");
          setLoading(false);
          return;
        }
        
        setComplaint(response.data);
        setLoading(false);
      } catch (err: any) {
        console.error("Failed to fetch complaint:", err);
        setError(err?.response?.data?.detail || "Failed to load complaint");
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [complaintId]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

      // Prepare payload matching the backend schema
      const payload = {
        complaint: {
          complaintTitle: complaint.complaint_title || complaint.complaintTitle || "",
          crimeCategory: complaint.crime_category || complaint.crimeCategory || "",
          crimeSubcategory: complaint.crime_subcategory || complaint.crimeSubcategory || "",
          priority: complaint.priority || "Medium",
          complaintMode: complaint.complaint_mode || complaint.complaintMode || "In-Person",
          incidentDate: complaint.incident_date || complaint.incidentDate || "",
          incidentTime: complaint.incident_time || complaint.incidentTime || "",
          location: complaint.location || "",
          landmark: complaint.landmark || "",
          emergency: complaint.emergency || "No",
          description: complaint.description || "",
          aiSummary: complaint.ai_summary || complaint.aiSummary || "",
          officerNotes: complaint.officer_notes || complaint.officerNotes || "",
          complainantName: complaint.complainant_name || complaint.complainantName || "",
          complainantFatherName: complaint.complainant_father_name || complaint.complainantFatherName || "",
          complainantAge: complaint.complainant_age || complaint.complainantAge || "",
          complainantGender: complaint.complainant_gender || complaint.complainantGender || "",
          complainantPhone: complaint.phone || complaint.complainantPhone || "",
          complainantEmail: complaint.email || complaint.complainantEmail || "",
          complainantAddress: complaint.complainant_address || complaint.complainantAddress || "",
          complainantAadhaar: complaint.complainant_aadhaar || complaint.complainantAadhaar || "",
          complainantRelationship: complaint.complainant_relationship || complaint.complainantRelationship || "",
          complainantOccupation: complaint.complainant_occupation || complaint.complainantOccupation || "",
          complainantNationality: complaint.complainant_nationality || complaint.complainantNationality || "",
          complainantPhotoUrl: complaint.complainant_photo_url || complaint.complainantPhotoUrl || "",
          complainantPhotoName: complaint.complainant_photo_name || complaint.complainantPhotoName || "",
        },
        victims: complaint.victims || [],
        suspects: complaint.suspects || [],
        attachments: complaint.attachments || [],
      };

      const response = await axios.post(
        `${API_BASE}/api/complaints/submit-draft/${complaintId}`,
        payload
      );

      setSuccess(true);
      setTimeout(() => {
        router.push("/complaints");
      }, 2000);
    } catch (err: any) {
      console.error("Failed to submit draft:", err);
      setError(err?.response?.data?.detail || "Failed to submit draft");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600"></div>
              <p className="mt-4 text-slate-600">Loading complaint...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="mx-auto max-w-2xl">
              <div className="rounded-lg border border-red-200 bg-red-50 p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <h2 className="font-semibold text-red-900">Error</h2>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.back()}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white font-medium hover:bg-red-700"
                >
                  Go Back
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="mx-auto max-w-2xl">
              <div className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-green-900">Draft Submitted Successfully!</h2>
                <p className="mt-2 text-green-700">Your complaint has been submitted and is ready for investigation.</p>
                <p className="mt-1 text-sm text-green-600">Redirecting to complaints list...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-8">
            <div className="text-center py-12">
              <p className="text-slate-600">Complaint not found</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-4xl">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900">Submit Draft Complaint</h1>
              <p className="mt-2 text-slate-600">
                Review and submit the draft complaint #{complaint.complaint_number}
              </p>
            </div>

            {/* Complaint Summary */}
            <div className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-semibold text-slate-900">Complaint Details</h2>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Title</label>
                  <p className="mt-1 text-slate-900">{complaint.complaint_title || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Crime Category</label>
                  <p className="mt-1 text-slate-900">{complaint.crime_category || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Complainant</label>
                  <p className="mt-1 text-slate-900">{complaint.complainant_name || "-"}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Location</label>
                  <p className="mt-1 text-slate-900">{complaint.location || "-"}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Description</label>
                  <p className="mt-1 text-slate-900">{complaint.description || "-"}</p>
                </div>
              </div>

              {/* Victims Summary */}
              {complaint.victims && complaint.victims.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-900">Victims ({complaint.victims.length})</h3>
                  <ul className="mt-2 space-y-1">
                    {complaint.victims.map((victim: any, idx: number) => (
                      <li key={idx} className="text-sm text-slate-600">
                        • {victim.fullName || "Unknown"} ({victim.age || "N/A"})
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suspects Summary */}
              {complaint.suspects && complaint.suspects.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <h3 className="font-semibold text-slate-900">Suspects ({complaint.suspects.length})</h3>
                  <ul className="mt-2 space-y-1">
                    {complaint.suspects.map((suspect: any, idx: number) => (
                      <li key={idx} className="text-sm text-slate-600">
                        • {suspect.fullName || "Unknown"} {suspect.alias ? `(${suspect.alias})` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => router.back()}
                className="rounded-lg border border-slate-300 px-6 py-3 text-slate-700 font-medium hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
