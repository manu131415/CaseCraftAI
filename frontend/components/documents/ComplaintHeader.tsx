"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface Props {
  caseId: string;
}

export default function ComplaintHeader({ caseId }: Props) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition shadow-xs cursor-pointer"
      >
        <ArrowLeft size={16} />
        {t("back", "common")}
      </button>

      <h1 className="text-2xl font-bold text-slate-900">
        {t("documentGeneration", "documents")}
      </h1>

      <p className="mt-1 text-xs text-slate-500">
        {t("documentGenerationDescription", "documents")}
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2 pt-4 border-t border-slate-100">
        <Info
          title={t("caseId", "cases")}
          value={caseId}
        />

        <Info
          title={t("status", "common")}
          value={t("readyForDocumentGeneration", "documents")}
        />
      </div>
    </div>
  );
}

function Info({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{title}</p>
      <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
    </div>
  );
}