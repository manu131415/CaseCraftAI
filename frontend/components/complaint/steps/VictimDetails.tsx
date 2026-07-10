"use client";

import { ComplaintData } from "../types";

interface Props {
  form: ComplaintData;
  setForm: React.Dispatch<React.SetStateAction<ComplaintData>>;
}

export default function VictimDetails({ form, setForm }: Props) {
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-blue-600">Step 3</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Victim details</h2>
        <p className="mt-2 text-sm text-slate-500">
          Add victim details if available and include any protective notes.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Victim type</label>
          <select
            name="victimType"
            value={form.victimType}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          >
            <option value="">Select type</option>
            <option value="Individual">Individual</option>
            <option value="Organization">Organization</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input
            name="victimName"
            value={form.victimName}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
            placeholder="Victim name"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Contact details</label>
        <input
          name="victimContact"
          value={form.victimContact}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          placeholder="Phone, email, or address"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Statement</label>
        <textarea
          rows={5}
          name="victimStatement"
          value={form.victimStatement}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          placeholder="Record victim account"
        />
      </div>
    </div>
  );
}
