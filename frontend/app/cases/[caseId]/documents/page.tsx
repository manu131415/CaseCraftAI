"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { FileText, RefreshCw } from "lucide-react";

import ComplaintHeader from "@/components/documents/ComplaintHeader";
import DocumentCard from "@/components/documents/DocumentCard";
import { documentList } from "@/components/documents/documentList";
import { useLanguage } from "@/app/providers/LanguageProvider";
import Sidebar from "@/components/layout/io/Sidebar";
import Navbar from "@/components/layout/shared/Navbar";

interface DocumentItem {
  document_id: string;
  document_type: string;
  title: string;
  status: string;
  document_metadata?: string;
  created_at?: string;
}

export default function DocumentsPage() {
  const { caseId } = useParams();
  const { t, language } = useLanguage();

  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);
  const [savedDocs, setSavedDocs] = useState<DocumentItem[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [updatingCase, setUpdatingCase] = useState(false);

  const fetchSavedDocs = async () => {
    if (!caseId) return;
    setLoadingSaved(true);
    try {
      const res = await axios.get(`${API}/api/documents/case/${caseId}`);
      setSavedDocs(res.data?.documents || []);
    } catch (err) {
      console.error("Error loading saved documents:", err);
    } finally {
      setLoadingSaved(false);
    }
  };

  useEffect(() => {
    void fetchSavedDocs();
  }, [caseId]);

  /**
   * PUT /api/cases/{case_id}
   * Updates fields matching PostgreSQL 'cases' schema
   */
  const updateCaseRecord = async (payload: Record<string, any>) => {
    if (!caseId) return;
    setUpdatingCase(true);
    try {
      await axios.put(`${API}/api/cases/${caseId}`, payload);
    } catch (err: any) {
      console.error("Failed to update case record:", err);
    } finally {
      setUpdatingCase(false);
    }
  };

  const generateDocument = async (documentType: string) => {
    try {
      setLoadingDoc(documentType);

      // 1. Generate & download document file
      const res = await fetch(`${API}/api/documents/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          case_id: caseId,
          document_type: documentType,
          language,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(
          typeof err.detail === "string"
            ? err.detail
            : JSON.stringify(err.detail, null, 2)
        );
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${documentType}_${caseId}.docx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      // 2. Map payload specifically to your PostgreSQL 'cases' columns
      const now = new Date();
      const isoDateTime = now.toISOString();
      const formattedDate = now.toISOString().split("T")[0]; // YYYY-MM-DD for DATE columns
      const docCode = Date.now().toString().slice(-6);
      const year = now.getFullYear();

      const caseUpdatePayload: Record<string, any> = {
        updated_at: isoDateTime,
      };

      if (documentType === "chargesheet") {
        caseUpdatePayload.original_chargesheet_no = `CS/${year}/${docCode}`;
        caseUpdatePayload.original_chargesheet_date = formattedDate;
        caseUpdatePayload.current_stage = "Original Chargesheet Filed";
        caseUpdatePayload.status = "Chargesheet Filed";
      } else if (
        documentType === "supplementary_chargesheet" ||
        documentType === "purvani"
      ) {
        caseUpdatePayload.supplementary_chargesheet_no = `SCS/${year}/${docCode}`;
        caseUpdatePayload.current_stage = "Supplementary Chargesheet Filed";
      } else if (documentType === "fir_draft") {
        caseUpdatePayload.current_stage = "FIR Drafted";
      }

      // 3. Update the cases table record in backend DB
      await updateCaseRecord(caseUpdatePayload);

      // 4. Refresh documents list
      void fetchSavedDocs();
    } catch (err: any) {
      console.error(err);
      alert(err.message || t("failedToGenerate", "cases"));
    } finally {
      setLoadingDoc(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
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

        <main className="flex-1 min-w-0 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <ComplaintHeader caseId={caseId as string} />

            {/* Template Selection */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-indigo-600" />
                  {t("availableTemplates", "cases")}
                </h2>
                {updatingCase && (
                  <span className="text-xs text-indigo-600 flex items-center gap-1.5 animate-pulse font-medium">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Syncing DB cases record...
                  </span>
                )}
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {documentList.map((doc) => (
                  <DocumentCard
                    key={doc.type}
                    title={t(doc.title, "documents")}
                    description={t(doc.description, "documents")}
                    onGenerate={() => generateDocument(doc.type)}
                  />
                ))}
              </div>
            </div>

            {/* Generated Documents & SHO Review Status */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-4">
                Generated Documents & SHO Approval Status
              </h2>

              {loadingSaved ? (
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin text-slate-400" />
                  Loading document history...
                </p>
              ) : savedDocs.length === 0 ? (
                <p className="text-xs text-slate-400">No documents generated yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
                        <th className="py-2.5 px-3">Document Title</th>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Review Status</th>
                        <th className="py-2.5 px-3">SHO Feedback / Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {savedDocs.map((doc) => (
                        <tr key={doc.document_id}>
                          <td className="py-3 px-3 font-semibold text-slate-900 flex items-center gap-1.5">
                            <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
                            {doc.title || doc.document_type}
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">
                            {doc.created_at ? new Date(doc.created_at).toLocaleString() : "N/A"}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getStatusBadge(doc.status)}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 max-w-sm text-[11px] text-slate-600 whitespace-pre-wrap">
                            {doc.document_metadata || "No remarks yet."}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {loadingDoc && (
              <div className="fixed bottom-6 right-6 rounded-xl bg-indigo-900 px-5 py-3 text-xs font-semibold text-white shadow-lg border border-indigo-700 animate-bounce flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin text-indigo-300" />
                {t("generating", "cases")} {loadingDoc.replaceAll("_", " ")}...
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}