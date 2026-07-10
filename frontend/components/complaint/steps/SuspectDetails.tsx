"use client";

import { ComplaintData } from "../types";

interface Props {
  form: ComplaintData;
  setForm: React.Dispatch<React.SetStateAction<ComplaintData>>;
}

export default function SuspectDetails({ form, setForm }: Props) {
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-sm font-medium text-blue-600">Step 4</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">Suspect details</h2>
        <p className="mt-2 text-sm text-slate-500">
          Record known suspect information and current status for investigators.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-slate-700">Suspect type</label>
          <select
            name="suspectType"
            value={form.suspectType}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          >
            <option value="">Select type</option>
            <option value="Individual">Individual</option>
            <option value="Group">Group</option>
            <option value="Unknown">Unknown</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input
            name="suspectName"
            value={form.suspectName}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
            placeholder="Suspect name"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Contact details</label>
        <input
          name="suspectContact"
          value={form.suspectContact}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          placeholder="Phone, email, or residence"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          rows={4}
          name="suspectDescription"
          value={form.suspectDescription}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          placeholder="Add identifying remarks"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-slate-700">Status</label>
        <select
          name="suspectStatus"
          value={form.suspectStatus}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
        >
          <option value="">Select status</option>
          <option value="At large">At large</option>
          <option value="Arrested">Arrested</option>
          <option value="Under investigation">Under investigation</option>
        </select>
      </div>
    </div>
  );
}
