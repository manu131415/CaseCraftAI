"use client";

import { FileDown, FileText } from "lucide-react";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface DocumentCardProps {
  title: string;
  description: string;
  onGenerate: () => void;
}

export default function DocumentCard({
  title,
  description,
  onGenerate,
}: DocumentCardProps) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-700 border border-indigo-100 shrink-0">
          <FileText size={22} />
        </div>

        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            {title}
          </h3>

          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      <button
        onClick={onGenerate}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-900 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-indigo-950 shadow-xs cursor-pointer"
      >
        <FileDown size={16} />
        {t("generateDownload", "documents")}
      </button>
    </div>
  );
}