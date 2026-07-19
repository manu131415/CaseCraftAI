"use client";

import { ComplaintData } from "../types";

interface Props {
  form: ComplaintData;
  setForm: React.Dispatch<React.SetStateAction<ComplaintData>>;
}

export default function ComplaintDetails({
  form,
  setForm,
}: Props) {
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  return (
    <div className="space-y-6">

      <h2 className="text-xl font-semibold">
        Complaint Details
      </h2>

      {/* Complaint Title */}

      <div>
        <label className="font-medium">
          Complaint Title *
        </label>

        <input
          type="text"
          name="complaintTitle"
          value={form.complaintTitle}
          onChange={handleChange}
          placeholder="Short summary of complaint"
          className="w-full border rounded-lg p-3 mt-2"
        />
      </div>

      {/* Crime Category */}

      <div className="grid grid-cols-2 gap-6">

        <div>
          <label className="font-medium">
            Crime Category *
          </label>

          <select
            name="crimeCategory"
            value={form.crimeCategory}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          >
            <option value="">Select Category</option>

            <option>Theft</option>
            <option>Robbery</option>
            <option>Burglary</option>
            <option>Assault</option>
            <option>Murder</option>
            <option>Kidnapping</option>
            <option>Cyber Crime</option>
            <option>Fraud</option>
            <option>Domestic Violence</option>
            <option>Accident</option>
            <option>Missing Person</option>
            <option>Other</option>

          </select>
        </div>

        <div>

          <label className="font-medium">
            Crime Subcategory *
          </label>

          <input
            type="text"
            name="crimeSubcategory"
            value={form.crimeSubcategory}
            onChange={handleChange}
            placeholder="Enter subcategory"
            className="w-full border rounded-lg p-3 mt-2"
          />

        </div>

      </div>

      {/* Priority + Complaint Mode */}

      <div className="grid grid-cols-2 gap-6">

        <div>

          <label className="font-medium">
            Priority
          </label>

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
            <option>Critical</option>
          </select>

        </div>

        <div>

          <label className="font-medium">
            Complaint Mode
          </label>

          <select
            name="complaintMode"
            value={form.complaintMode}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          >
            <option>Walk-In</option>
            <option>Phone Call</option>
            <option>Online Portal</option>
            <option>Email</option>
            <option>Police Referral</option>
            <option>Other</option>
          </select>

        </div>

      </div>

      {/* Date & Time */}

      <div className="grid grid-cols-2 gap-6">

        <div>

          <label className="font-medium">
            Incident Date *
          </label>

          <input
            type="date"
            name="incidentDate"
            value={form.incidentDate}
            onChange={handleChange}
            className="border rounded-lg p-3 w-full mt-2"
          />

        </div>

        <div>

          <label className="font-medium">
            Incident Time
          </label>

          <input
            type="time"
            name="incidentTime"
            value={form.incidentTime}
            onChange={handleChange}
            className="border rounded-lg p-3 w-full mt-2"
          />

        </div>

      </div>

      {/* Location */}

      <div>

        <label className="font-medium">
          Incident Location *
        </label>

        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Exact address"
          className="w-full border rounded-lg p-3 mt-2"
        />

      </div>

      <div>

        <label className="font-medium">
          Landmark / Nearby Place
        </label>

        <input
          type="text"
          name="landmark"
          value={form.landmark}
          onChange={handleChange}
          placeholder="Nearest landmark"
          className="w-full border rounded-lg p-3 mt-2"
        />

      </div>

      {/* Emergency */}

      <div>

        <label className="font-medium">
          Emergency
        </label>

        <select
          name="emergency"
          value={form.emergency}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 mt-2"
        >
          <option>No</option>
          <option>Yes</option>
        </select>

      </div>

      {/* Description */}

      <div>

        <label className="font-medium">
          Detailed Complaint *
        </label>

        <textarea
          rows={7}
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the incident in detail..."
          className="w-full border rounded-lg p-3 mt-2"
        />

      </div>

      {/* Officer Notes */}

      <div>

        <label className="font-medium">
          Officer Notes
        </label>

        <textarea
          rows={4}
          name="officerNotes"
          value={form.officerNotes}
          onChange={handleChange}
          placeholder="Internal police notes..."
          className="w-full border rounded-lg p-3 mt-2"
        />

      </div>

    </div>
  );
}