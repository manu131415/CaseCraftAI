"use client";

import { useLanguage } from "@/app/providers/LanguageProvider";
import { FileDown } from "lucide-react";

interface Props {
  documents: any[];
  api: string;
}

export default function GeneratedDocuments({
  documents,
  api,
}: Props) {
  const { t } = useLanguage();
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">
          {t("generatedDocuments", "documents")}
        </h2>

        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700 border border-indigo-200">
          {documents.length}
        </span>
      </div>

      {documents.length === 0 ? (
        <p className="text-xs text-slate-500">
          {t("noGeneratedDocuments", "documents")}
        </p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.document_id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 p-4 transition-all hover:bg-slate-50"
            >
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-500 mt-0.5">
                  {doc.document_type}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                  onClick={() =>
                    window.open(
                      `${api}/api/documents/download/${doc.document_id}`,
                      "_blank"
                    )
                  }
                >
                  <FileDown size={15} />
                  {t("download", "common")}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}