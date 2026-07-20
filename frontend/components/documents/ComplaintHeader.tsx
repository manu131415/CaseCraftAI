"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  caseId: string;
}

export default function ComplaintHeader({ caseId }: Props) {
  const router = useRouter();

  return (
    <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-900 p-6">
      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h1 className="text-3xl font-bold text-white">
        Document Generation
      </h1>

      <p className="mt-2 text-gray-400">
        Generate official investigation documents for this case.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Info
          title="Case ID"
          value={caseId}
        />

        <Info
          title="Status"
          value="Ready for Document Generation"
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