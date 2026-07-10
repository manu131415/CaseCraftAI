"use client";

import { PersonEntry } from "../types";

interface Props {
  complainants: PersonEntry[];
  setComplainants: (complainants: PersonEntry[]) => void;
}

export default function ComplainantDetails({ complainants, setComplainants }: Props) {
  function handleFieldChange(index: number, field: keyof PersonEntry, value: string) {
    const updated = complainants.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    );
    setComplainants(updated);
  }

  function removeComplainant(index: number) {
    setComplainants(complainants.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-base font-medium text-blue-600">Step 5</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Complainant details</h2>
          <p className="mt-2 text-base text-slate-500">
            Capture one or more complainants and their statements.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setComplainants([...complainants, { name: "", contact: "", relationship: "", statement: "" }])}
          className="rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-base font-semibold text-white transition hover:bg-blue-700"
        >
          Add another complainant
        </button>
      </div>

      <div className="space-y-6">
        {complainants.map((complainant, index) => (
          <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-base font-semibold text-slate-900">Complainant {index + 1}</p>
              {complainants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeComplainant(index)}
                  className="text-base font-medium text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-4">
              <div>
                <label className="text-base font-medium text-slate-700">Full name</label>
                <input
                  value={complainant.name}
                  onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0"
                  placeholder="Enter complainant name"
                />
              </div>
              <div>
                <label className="text-base font-medium text-slate-700">Contact</label>
                <input
                  value={complainant.contact}
                  onChange={(e) => handleFieldChange(index, "contact", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0"
                  placeholder="Phone or email"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-4">
              <div>
                <label className="text-base font-medium text-slate-700">Relationship to incident</label>
                <select
                  value={complainant.relationship || ""}
                  onChange={(e) => handleFieldChange(index, "relationship", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0"
                >
                  <option value="">Select relationship</option>
                  <option value="Victim">Victim</option>
                  <option value="Witness">Witness</option>
                  <option value="Relative">Relative</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-base font-medium text-slate-700">Statement</label>
                <textarea
                  rows={4}
                  value={complainant.statement}
                  onChange={(e) => handleFieldChange(index, "statement", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0"
                  placeholder="Describe the complainant’s account"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
