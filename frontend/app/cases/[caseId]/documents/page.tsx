"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import ComplaintHeader from "@/components/documents/ComplaintHeader";
import GeneratedDocuments from "@/components/documents/GeneratedDocuments";
import DocumentCard from "@/components/documents/DocumentCard";
import { documentList } from "@/components/documents/documentList";

interface GeneratedDocument {
  document_id: string;
  case_id: string;
  document_type: string;
  title: string;
  status: string;
  file_path: string;
  generated_at: string;
}

export default function DocumentsPage() {
  const { caseId } = useParams();

  const API = process.env.NEXT_PUBLIC_API_URL!;

  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDocument[]>([]);
  const [loadingDoc, setLoadingDoc] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(
        `${API}/api/documents/case/${caseId}`
      );

      if (!res.ok) throw new Error("Failed to fetch documents");

      const data = await res.json();

      setGeneratedDocs(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (caseId) {
      fetchDocuments();
    }
  }, [caseId]);

  const generateDocument = async (documentType: string) => {
    try {
      setLoadingDoc(documentType);

      const res = await fetch(
        `${API}/api/documents/generate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            case_id: caseId,
            document_type: documentType,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Generation failed");
      }

      await fetchDocuments();

      alert("Document generated successfully.");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoadingDoc(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] p-8">

      <ComplaintHeader caseId={caseId as string} />

      <GeneratedDocuments
        documents={generatedDocs}
        api={API}
      />

      <h2 className="mb-6 mt-8 text-2xl font-semibold text-white">
        Available Templates
      </h2>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

        {documentList.map((doc) => {

          const existing = generatedDocs.find(
            (d) => d.document_type === doc.type
          );

          return (
            <DocumentCard
              key={doc.type}
              title={doc.title}
              description={doc.description}
              status={existing ? "Draft" : "Not Generated"}

              onGenerate={() =>
                generateDocument(doc.type)
              }

              onView={() => {
                if (!existing) return;

                window.open(
                  `${API}/api/documents/download/${existing.document_id}`,
                  "_blank"
                );
              }}

              onEdit={() => {
                alert("Editor coming next");
              }}

              onPrint={() => {
                if (!existing) return;

                window.open(
                  `${API}/api/documents/download/${existing.document_id}`,
                  "_blank"
                );
              }}
            />
          );
        })}
      </div>

      {loadingDoc && (
        <div className="fixed bottom-6 right-6 rounded-xl bg-cyan-600 px-5 py-3 text-white shadow-xl">
          Generating {loadingDoc.replaceAll("_", " ")}...
        </div>
      )}
    </div>
  );
}