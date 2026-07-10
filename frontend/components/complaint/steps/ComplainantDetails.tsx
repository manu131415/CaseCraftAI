"use client";

import { ComplaintData } from "../types";

interface Props {
  form: ComplaintData;
  setForm: React.Dispatch<React.SetStateAction<ComplaintData>>;
}

export default function ComplainantDetails({ form, setForm }: Props) {
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-blue-600">Step 5</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Complainant details</h2>
        <p className="mt-2 text-sm text-slate-500">
          Capture the complainant’s identity and statement for the official record.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <input
            name="complainantName"
            value={form.complainantName}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
            placeholder="Enter complainant name"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Contact number</label>
          <input
            name="complainantContact"
            value={form.complainantContact}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
            placeholder="Phone or email"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Relationship to incident</label>
        <select
          name="complainantRelationship"
          value={form.complainantRelationship}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
        >
          <option value="">Select relationship</option>
          <option value="Victim">Victim</option>
          <option value="Witness">Witness</option>
          <option value="Relative">Relative</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Statement</label>
        <textarea
          rows={5}
          name="complainantStatement"
          value={form.complainantStatement}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          placeholder="Describe the complainant’s account"
        />
      </div>
    </div>
  );
}
