"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { ComplaintData } from "../types";
import { uploadPhotoToCloudinary } from "@/lib/api/complaints";
import { useLanguage } from "@/app/providers/LanguageProvider";

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
  const { t } = useLanguage();

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
    const { t } = useLanguage();

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
      alert(t("photoUploadFailed", "complaints"));
    } finally {
      setUploadingPhoto(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div>

        <p className="text-base font-medium text-blue-600">
          {t("step2", "complaints")}
        </p>

        <h2 className="mt-1 text-2xl font-semibold">
          {t("complainantDetails", "complaints")}
        </h2>

        <p className="mt-2 text-slate-500">
          {t("complainantDetailsDescription", "complaints")}
        </p>

      </div>

      {/* Name */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="font-medium">
            {t("fullName", "complaints")} *
          </label>

          <input
            name="complainantName"
            value={form.complainantName}
            onChange={handleChange}
            placeholder={t("fullName", "complaints")}
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

        <div>

          <label className="font-medium">
            {t("fatherOrSpouseName", "complaints")}
          </label>

          <input
            name="complainantFatherName"
            value={form.complainantFatherName}
            onChange={handleChange}
            placeholder={t("fatherOrSpouseName", "complaints")}
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

      </div>

      {/* Age + Gender */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="font-medium">
            {t("age", "common")}
          </label>

          <input
            type="number"
            min={0}
            max={120}
            name="complainantAge"
            value={form.complainantAge}
            onChange={handleChange}
            placeholder={t("age", "common")}
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

        <div>

          <label className="font-medium">
            {t("gender", "common")}
          </label>

          <select
            name="complainantGender"
            value={form.complainantGender}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border p-3"
          >
            <option value="">{t("selectGender", "complaints")}</option>
            <option>{t("male", "common")}</option>
            <option>{t("female", "common")}</option>
            <option>{t("transgender", "common")}</option>
            <option>{t("other", "common")}</option>
          </select>

        </div>

      </div>

      {/* Mobile + Email */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="font-medium">
            {t("mobileNumber", "complaints")} *
          </label>

          <input
            name="complainantPhone"
            value={form.complainantPhone}
            onChange={handleChange}
            placeholder={t("mobileNumber", "complaints")}
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

        <div>

          <label className="font-medium">
            {t("email", "common")}
          </label>

          <input
            type="email"
            name="complainantEmail"
            value={form.complainantEmail}
            onChange={handleChange}
            placeholder={t("emailAddress", "complaints")}
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

      </div>
            {/* Address */}

      <div>

        <label className="font-medium">
          {t("residentialAddress", "complaints")} *
        </label>

        <textarea
          rows={3}
          name="complainantAddress"
          value={form.complainantAddress}
          onChange={handleChange}
          placeholder={t("completeResidentialAddress", "complaints")}
          className="mt-2 w-full rounded-xl border p-3"
        />

      </div>

      {/* Aadhaar + Relationship */}

      <div className="grid md:grid-cols-2 gap-5">

        <div>

          <label className="font-medium">
            {t("aadhaar", "complaints")}
          </label>

          <input
            name="complainantAadhaar"
            value={form.complainantAadhaar}
            onChange={handleChange}
            placeholder={t("optional", "common")}
            className="mt-2 w-full rounded-xl border p-3"
          />

        </div>

        <div>

          <label className="font-medium">
            {t("relationshipToIncident", "complaints")}
          </label>

          <select
            name="complainantRelationship"
            value={form.complainantRelationship}
            onChange={handleChange}
            className="mt-2 w-full rounded-xl border p-3"
          >
            <option value="">{t("selectRelationship", "complaints")}</option>
            <option>{t("victim", "complaints")}</option>
            <option>{t("witness", "complaints")}</option>
            <option>{t("relativeOfVictim", "complaints")}</option>
            <option>{t("neighbour", "complaints")}</option>
            <option>{t("friend", "common")}</option>
            <option>{t("employer", "complaints")}</option>
            <option>{t("employee", "complaints")}</option>
            <option>{t("publicInformant", "complaints")}</option>
            <option>{t("other", "common")}</option>
          </select>

        </div>

      </div>

      {/* Photo Upload */}

      <div className="rounded-2xl border border-dashed border-slate-300 p-5">

        <div className="flex items-center justify-between">

          <div>

            <h3 className="font-semibold">
              {t("complainantPhotograph", "complaints")}
            </h3>

            <p className="text-sm text-slate-500">
              {t("uploadPhotographDescription", "complaints")}
            </p>

          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingPhoto}
            className="flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Camera size={18} />
            {uploadingPhoto ? t("uploading", "common") : t("uploadPhoto", "complaints")}
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
                {t("photoUploaded", "complaints")}
              </p>

            </div>

          </div>

        )}

      </div>

    </div>

  );

}