"use client";

import { useParams } from "next/navigation";

export default function DocumentsPage() {
  const params = useParams();
  const complaintId = params.complaintId as string;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">
        Documents - {complaintId}
      </h1>

      <p className="mt-2 text-slate-600">
        Documents will be displayed here.
      </p>
    </div>
  );
}