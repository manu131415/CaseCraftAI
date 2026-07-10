"use client";

import { PersonEntry } from "../types";

interface Props {
  victims: PersonEntry[];
  setVictims: (victims: PersonEntry[]) => void;
}

export default function VictimDetails({ victims, setVictims }: Props) {
  function handleFieldChange(index: number, field: keyof PersonEntry, value: string) {
    const updated = victims.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    );
    setVictims(updated);
  }

  function removeVictim(index: number) {
    setVictims(victims.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-base font-medium text-blue-600">Step 3</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Victim details</h2>
          <p className="mt-2 text-base text-slate-500">
            Add one or more victims and include any protective notes.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setVictims([...victims, { type: "", name: "", contact: "", statement: "" }])}
          className="rounded-full border border-blue-600 bg-blue-600 px-4 py-2 text-base font-semibold text-white transition hover:bg-blue-700"
        >
          Add another victim
        </button>
      </div>

      <div className="space-y-6">
        {victims.map((victim, index) => (
          <div key={index} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-base font-semibold text-slate-900">Victim {index + 1}</p>
              {victims.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVictim(index)}
                  className="text-base font-medium text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-4">
              <div>
                <label className="text-base font-medium text-slate-700">Victim type</label>
                <select
                  value={victim.type || ""}
                  onChange={(e) => handleFieldChange(index, "type", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0"
                >
                  <option value="">Select type</option>
                  <option value="Individual">Individual</option>
                  <option value="Organization">Organization</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
              <div>
                <label className="text-base font-medium text-slate-700">Name</label>
                <input
                  value={victim.name}
                  onChange={(e) => handleFieldChange(index, "name", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0"
                  placeholder="Victim name"
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mt-4">
              <div>
                <label className="text-base font-medium text-slate-700">Contact details</label>
                <input
                  value={victim.contact}
                  onChange={(e) => handleFieldChange(index, "contact", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0"
                  placeholder="Phone, email, or address"
                />
              </div>
              <div>
                <label className="text-base font-medium text-slate-700">Statement</label>
                <textarea
                  rows={4}
                  value={victim.statement}
                  onChange={(e) => handleFieldChange(index, "statement", e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none ring-0"
                  placeholder="Record victim account"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
