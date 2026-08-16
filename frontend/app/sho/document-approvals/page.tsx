'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Download,
  RotateCcw,
  Hash,
  FolderCheck,
  MessageSquare,
  User,
  Calendar,
  Layers,
  ShieldCheck
} from "lucide-react";
import Sidebar from "@/components/layout/sho/Sidebar";
import Navbar from "@/components/layout/shared/Navbar";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface CaseRecord {
  case_id?: string;
  id?: string;
  case_number?: string;
  complaint_number?: string;
  title?: string;
  assigned_officer_id?: string;
  created_at?: string;
  status?: string;
}

interface DocumentItem {
  document_id: string;
  case_id: string;
  document_type: string;
  title?: string;
  status: string;
  generated_by?: string;
  created_at?: string;
  document_metadata?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function DocumentApprovalsPage() {
  const { language } = useLanguage();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  
  const [loadingCases, setLoadingCases] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  
  const [commentsMap, setCommentsMap] = useState<{ [docId: string]: string }>({});
  const [submittingDocId, setSubmittingDocId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCases = async () => {
      setLoadingCases(true);
      try {
        const res = await axios.get(`${API_BASE}/api/cases`, { validateStatus: (s) => s < 500 });
        const list: CaseRecord[] = Array.isArray(res.data) ? res.data : res.data?.cases || [];
        
        // Sort cases newest first (created_at descending)
        const sortedCases = [...list].sort((a, b) => {
          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeB - timeA;
        });

        setCases(sortedCases);
        if (sortedCases.length > 0) setSelectedCase(sortedCases[0]);
      } catch (err) {
        console.error("Failed to load cases", err);
      } finally {
        setLoadingCases(false);
      }
    };
    void fetchCases();
  }, []);

  const fetchCaseDocuments = async (caseId: string) => {
    setLoadingDocs(true);
    try {
      const res = await axios.get(`${API_BASE}/api/documents/case/${encodeURIComponent(caseId)}`);
      const docList: DocumentItem[] = res.data?.documents || [];
      
      // Sort documents newest first (created_at descending)
      const sortedDocs = [...docList].sort((a, b) => {
        const timeA = new Date(a.created_at || 0).getTime();
        const timeB = new Date(b.created_at || 0).getTime();
        return timeB - timeA;
      });

      setDocuments(sortedDocs);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    const cid = selectedCase?.case_id || selectedCase?.id;
    if (cid) {
      void fetchCaseDocuments(cid);
    }
  }, [selectedCase]);

  const handleUpdateStatus = async (docId: string, status: "Approved" | "Changes Requested" | "Rejected") => {
    setSubmittingDocId(docId);
    const comment = commentsMap[docId] || "";
    try {
      await axios.patch(`${API_BASE}/api/documents/${docId}/status`, {
        status,
        comments: comment.trim() || undefined,
      });

      const cid = selectedCase?.case_id || selectedCase?.id;
      if (cid) await fetchCaseDocuments(cid);
    } catch (err) {
      console.error("Error updating document status:", err);
      alert("Failed to update status in database.");
    } finally {
      setSubmittingDocId(null);
    }
  };

  const handleDownloadDoc = async (doc: DocumentItem) => {
    try {
      setDownloadingId(doc.document_id);
      const res = await axios.post(
        `${API_BASE}/api/documents/generate`,
        { case_id: doc.case_id, document_type: doc.document_type, language: language || "en" },
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doc.document_type}_${doc.case_id}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file:", err);
      alert("Failed to download document file.");
    } finally {
      setDownloadingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "changes requested":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
            {/* Left Pane: Detailed Case Cards */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex justify-between items-center">
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FolderCheck className="h-4 w-4 text-indigo-600" /> Pending Approval Files
                </h2>
                <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold border border-indigo-100">
                  {cases.length} Files
                </span>
              </div>

              <div className="p-3 overflow-y-auto flex-1 space-y-3">
                {loadingCases ? (
                  <div className="py-12 text-center text-xs text-slate-400">Loading cases...</div>
                ) : (
                  cases.map((c) => {
                    const cid = c.case_id || c.id;
                    const selectedId = selectedCase?.case_id || selectedCase?.id;
                    const isSelected = cid === selectedId;

                    return (
                      <div
                        key={cid}
                        onClick={() => setSelectedCase(c)}
                        className={`cursor-pointer rounded-xl border p-4 transition-all shadow-2xs ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-600 border-l-4 border-l-indigo-600"
                            : "border-slate-200 bg-white border-l-4 border-l-slate-300 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        {/* 1. Title Prominent at Top */}
                        <h3 className="text-xs font-bold text-slate-900 leading-snug">
                          {c.title || `Case #${cid}`}
                        </h3>

                        {/* 2. Status & Ref */}
                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1 font-semibold">
                            <Hash className="h-3 w-3 text-slate-400" /> #{c.case_number || cid}
                          </span>
                          <span className="px-2 py-0.5 font-bold uppercase text-indigo-700 bg-indigo-50 rounded-md border border-indigo-100">
                            {c.status || "ACTIVE"}
                          </span>
                        </div>

                        {/* 3. Officer & Date Footer */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3 text-slate-400" /> IO: {c.assigned_officer_id || "OFF001"}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Calendar className="h-3 w-3 text-slate-400" /> {c.created_at ? new Date(c.created_at).toLocaleDateString() : "Recent"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Pane: Document Verification & Feedback */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5" /> Document Verification
                  </span>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedCase?.title || `Case #${selectedCase?.case_id || selectedCase?.id || "None"}`}
                  </h2>
                  <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                    Case ID: #{selectedCase?.case_number || selectedCase?.case_id || selectedCase?.id}
                  </p>
                </div>
              </div>

              <div className="p-4 overflow-y-auto flex-1 space-y-4">
                {loadingDocs ? (
                  <div className="py-12 text-center text-xs text-slate-400">Loading documents for review...</div>
                ) : documents.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    No documents generated for this case yet.
                  </div>
                ) : (
                  documents.map((doc) => (
                    <div key={doc.document_id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 shadow-2xs">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">{doc.title || doc.document_type}</h4>
                            <p className="text-[10px] text-slate-500">
                              Type: {doc.document_type} • Prepared By: {doc.generated_by || "IO Officer"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(doc.status)}`}>
                            {doc.status}
                          </span>
                          <button
                            type="button"
                            disabled={downloadingId === doc.document_id}
                            onClick={() => handleDownloadDoc(doc)}
                            className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 border border-indigo-200 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 transition disabled:opacity-50"
                          >
                            <Download className="h-3 w-3" />
                            {downloadingId === doc.document_id ? "..." : "View"}
                          </button>
                        </div>
                      </div>

                      {/* SHO Feedback Input */}
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 mb-1">
                          <MessageSquare className="h-3 w-3 text-slate-400" />
                          SHO Feedback / Revision Notes
                        </label>
                        <textarea
                          rows={2}
                          value={commentsMap[doc.document_id] ?? doc.document_metadata ?? ""}
                          onChange={(e) => setCommentsMap({ ...commentsMap, [doc.document_id]: e.target.value })}
                          placeholder="Add approval remarks or instructions for IO..."
                          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Action Buttons with Symbols */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60">
                        <button
                          type="button"
                          disabled={submittingDocId === doc.document_id}
                          onClick={() => handleUpdateStatus(doc.document_id, "Changes Requested")}
                          className="inline-flex items-center gap-1 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Request Revisions
                        </button>
                        <button
                          type="button"
                          disabled={submittingDocId === doc.document_id}
                          onClick={() => handleUpdateStatus(doc.document_id, "Rejected")}
                          className="inline-flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition disabled:opacity-50"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={submittingDocId === doc.document_id}
                          onClick={() => handleUpdateStatus(doc.document_id, "Approved")}
                          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}