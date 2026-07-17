"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  caseId: string;
}

interface CaseData {
  case: {
    case_number: string;
    title: string;
    police_station: string;
    current_stage: string;
  };
  officer: {
    name: string;
    rank: string;
  } | null;
}

export default function ComplaintHeader({ caseId }: Props) {
  const router = useRouter();

  const API = process.env.NEXT_PUBLIC_API_URL!;

  const [caseData, setCaseData] = useState<CaseData | null>(null);

  useEffect(() => {
    async function fetchCase() {
      try {
        const res = await fetch(
          `${API}/api/documents/cases/${caseId}`
        );

        const data = await res.json();

        setCaseData(data);
      } catch (err) {
        console.error(err);
      }
    }

    if (caseId) {
      fetchCase();
    }
  }, [caseId]);

  return (
    <div className="mb-8 rounded-2xl border border-slate-700 bg-slate-900 p-6">

      <button
        onClick={() => router.back()}
        className="mb-5 flex items-center gap-2 text-cyan-400"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <h1 className="text-3xl font-bold text-white">
        {caseData?.case.case_number ?? caseId}
      </h1>

      <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-4">

        <Info
          title="Title"
          value={caseData?.case.title ?? "-"}
        />

        <Info
          title="Stage"
          value={caseData?.case.current_stage ?? "-"}
        />

        <Info
          title="Officer"
          value={
            caseData?.officer
              ? `${caseData.officer.rank} ${caseData.officer.name}`
              : "-"
          }
        />

        <Info
          title="Police Station"
          value={caseData?.case.police_station ?? "-"}
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

      <p className="font-semibold text-white">
        {value}
      </p>
    </div>
  );
}