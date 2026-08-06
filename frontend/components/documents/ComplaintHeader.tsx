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
    <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
      >
        <ArrowLeft size={18} />
        {t("back", "common")}
      </button>

      <h1 className="text-3xl font-bold text-white">
        {t("documentGeneration", "documents")}
      </h1>

      <p className="mt-2 text-gray-400">
        {t("documentGenerationDescription", "documents")}
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
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
      <p className="text-sm text-gray-400">{title}</p>
      <p className="font-semibold text-white">{value}</p>
    </div>
  );
}