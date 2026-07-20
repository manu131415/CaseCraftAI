"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { ComplaintData } from "../types";
import { uploadPhotoToCloudinary } from "@/lib/api/complaints";

interface Props {
  form: ComplaintData;
  setForm: React.Dispatch<React.SetStateAction<ComplaintData>>;
}

export default function ComplainantDetails({
  form,
  setForm,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

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

  async function handlePhotoUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadingPhoto(true);
    try {
      const cloudinaryUrl = await uploadPhotoToCloudinary(file);
      setForm({
        ...form,
        complainantPhotoUrl: cloudinaryUrl,
        complainantPhotoName: file.name,
      });
    } catch (err) {
      console.error("Photo upload failed:", err);
      alert("Failed to upload photo. Please try again.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div>

        <p className="text-base font-medium text-blue-600">
          Step 2
        </p>

        <h2 className="mt-1 text-2xl font-semibold">
          Complainant Details
        </h2>

        <p className="mt-2 text-slate-500">
          Record the details of the person filing this complaint.
        </p>

      </div>

      {/* Name */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="font-medium">
            Full Name *
          </label>

          <input
            name="complainantName"
            value={form.complainantName}
            onChange={handleChange}
            placeholder="Full Name"
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

        <div>

          <label className="font-medium">
            Father's / Spouse's Name
          </label>

          <input
            name="complainantFatherName"
            value={form.complainantFatherName}
            onChange={handleChange}
            placeholder="Father's / Spouse's Name"
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

      </div>

      {/* Age + Gender */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="font-medium">
            Age
          </label>

          <input
            type="number"
            min={0}
            max={120}
            name="complainantAge"
            value={form.complainantAge}
            onChange={handleChange}
            placeholder="Age"
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

        <div>

          <label className="font-medium">
            Gender
          </label>

          <select
            name="complainantGender"
            value={form.complainantGender}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border p-3"
          >
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Transgender</option>
            <option>Other</option>
          </select>

        </div>

      </div>

      {/* Mobile + Email */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="font-medium">
            Mobile Number *
          </label>

          <input
            name="complainantPhone"
            value={form.complainantPhone}
            onChange={handleChange}
            placeholder="Mobile Number"
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

        <div>

          <label className="font-medium">
            Email
          </label>

          <input
            type="email"
            name="complainantEmail"
            value={form.complainantEmail}
            onChange={handleChange}
            placeholder="Email Address"
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

      </div>
            {/* Address */}

      <div>

        <label className="font-medium">
          Residential Address *
        </label>

        <textarea
          rows={3}
          name="complainantAddress"
          value={form.complainantAddress}
          onChange={handleChange}
          placeholder="Complete Residential Address"
          className="mt-2 w-full rounded-xl border p-3"
        />

      </div>

      {/* Aadhaar + Relationship */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="font-medium">
            Aadhaar / Government ID
          </label>

          <input
            name="complainantAadhaar"
            value={form.complainantAadhaar}
            onChange={handleChange}
            placeholder="Optional"
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

        <div>

          <label className="font-medium">
            Relationship to Incident
          </label>

          <select
            name="complainantRelationship"
            value={form.complainantRelationship}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border p-3"
          >
            <option value="">Select Relationship</option>
            <option>Victim</option>
            <option>Witness</option>
            <option>Relative of Victim</option>
            <option>Neighbour</option>
            <option>Friend</option>
            <option>Employer</option>
            <option>Employee</option>
            <option>Public Informant</option>
            <option>Other</option>
          </select>

        </div>

      </div>

      {/* Photo Upload */}

      <div className="rounded-2xl border border-dashed border-slate-300 p-5">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="font-semibold">
              Complainant Photograph
            </h3>

            <p className="text-sm text-slate-500">
              Upload a photograph if available.
            </p>

          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Camera size={18} />
            {uploadingPhoto ? "Uploading..." : "Upload Photo"}
          </button>

        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
          disabled={uploadingPhoto}
        />

        {form.complainantPhotoUrl && (

          <div className="mt-5 flex items-center gap-4">

            <img
              src={form.complainantPhotoUrl}
              alt="Complainant"
              className="h-24 w-24 rounded-xl object-cover border"
            />

            <div>

              <p className="font-medium">
                {form.complainantPhotoName}
              </p>

              <p className="text-sm text-slate-500">
                Photo uploaded to Cloudinary
              </p>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}