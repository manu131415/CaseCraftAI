"use client";

import { ComplaintData } from "../types";

interface Props {
  form: ComplaintData;
}

export default function ReviewSubmission({ form }: Props) {
  const fields = [
    { label: "Complaint type", value: form.complaintType || "Not provided" },
    { label: "Category", value: form.category || "Not provided" },
    { label: "Priority", value: form.priority || "Not provided" },
    { label: "Location", value: form.location || "Not provided" },
    { label: "Complainant", value: form.complainantName || "Not provided" },
    { label: "Victim", value: form.victimName || "Not provided" },
    { label: "Suspect", value: form.suspectName || "Not provided" },
  ];

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-blue-600">Final review</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Review and confirm submission</h2>
        <p className="mt-2 text-sm text-slate-500">
          Check the complaint details before submitting them to the registry.
        </p>
      </div>

      <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-sm font-medium text-slate-500">{field.label}</p>
            <p className="mt-1 font-semibold text-slate-900">{field.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
        <p className="font-semibold">Submission preview</p>
        <p className="mt-2">
          Your complaint will be saved with the current incident summary, attached evidence, and investigator notes.
        </p>
      </div>
    </div>
  );
}
