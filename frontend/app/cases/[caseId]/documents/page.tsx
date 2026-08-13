"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import ComplaintHeader from "@/components/documents/ComplaintHeader";
import DocumentCard from "@/components/documents/DocumentCard";
import { documentList } from "@/components/documents/documentList";
import { useLanguage } from "@/app/providers/LanguageProvider";
import Sidebar from "@/components/layout/io/Sidebar";
import Navbar from "@/components/layout/shared/Navbar";

export default function DocumentsPage() {
  const { caseId } = useParams();
  const { t, language } = useLanguage();

  const API = process.env.NEXT_PUBLIC_API_URL!;

  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);

  const generateDocument = async (documentType: string) => {
    try {
      setLoadingDoc(documentType);

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

        console.log("Backend Error:", err);

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
    } catch (err: any) {
      console.error(err);
      alert(err.message || t("failedToGenerate", "cases"));
    } finally {
      setLoadingDoc(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            
            <ComplaintHeader caseId={caseId as string} />

            <h2 className="mb-4 text-xl font-bold text-slate-900">
              {t("availableTemplates", "cases")}
            </h2>

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

            {loadingDoc && (
              <div className="fixed bottom-6 right-6 rounded-xl bg-indigo-900 px-5 py-3 text-xs font-semibold text-white shadow-lg border border-indigo-700 animate-bounce">
                {t("generating", "cases")} {loadingDoc.replaceAll("_", " ")}...
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}