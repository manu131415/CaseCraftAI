"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

import ComplaintHeader from "@/components/documents/ComplaintHeader";
import DocumentCard from "@/components/documents/DocumentCard";
import { documentList } from "@/components/documents/documentList";

export default function DocumentsPage() {
  const { caseId } = useParams();

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
          language: "en",
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
      alert(err.message || "Failed to generate document");
    } finally {
      setLoadingDoc(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] p-8">
      <ComplaintHeader caseId={caseId as string} />

      <h2 className="mb-6 mt-8 text-2xl font-semibold text-white">
        Available Templates
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {documentList.map((doc) => (
          <DocumentCard
            key={doc.type}
            title={doc.title}
            description={doc.description}
            onGenerate={() => generateDocument(doc.type)}
          />
        ))}
      </div>

      {loadingDoc && (
        <div className="fixed bottom-6 right-6 rounded-xl bg-cyan-600 px-5 py-3 text-white shadow-xl">
          Generating {loadingDoc.replaceAll("_", " ")}...
        </div>
      )}
    </div>
  );
}