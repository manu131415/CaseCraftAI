"use client";

import { ComplaintData } from "../types";
import { useLanguage } from "@/app/providers/LanguageProvider";

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

  const { t } = useLanguage();
  return (
    <div className="space-y-6">

      <h2 className="text-xl font-semibold">
        {t("complaintDetails", "complaints")}
      </h2>

      {/* Complaint Title */}

      <div>
        <label className="font-medium">
          {t("complaintTitle", "complaints")} *
        </label>

        <input
          type="text"
          name="complaintTitle"
          value={form.complaintTitle}
          onChange={handleChange}
          placeholder={t("shortSummaryOfComplaint", "complaints")}
          className="w-full border rounded-lg p-3 mt-2"
        />
      </div>

      {/* Crime Category */}

      <div className="grid grid-cols-2 gap-6">

        <div>
          <label className="font-medium">
            {t("crimeCategory", "complaints")} *
          </label>

          <select
            name="crimeCategory"
            value={form.crimeCategory}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          >
            <option value="">{t("selectCategory", "complaints")}</option>

            <option>{t("theft", "complaints")}</option>
            <option>{t("robbery", "complaints")}</option>
            <option>{t("burglary", "complaints")}</option>
            <option>{t("assault", "complaints")}</option>
            <option>{t("murder", "complaints")}</option>
            <option>{t("kidnapping", "complaints")}</option>
            <option>{t("cyberCrime", "complaints")}</option>
            <option>{t("fraud", "complaints")}</option>
            <option>{t("domesticViolence", "complaints")}</option>
            <option>{t("accident", "complaints")}</option>
            <option>{t("missingPerson", "complaints")}</option>
            <option>{t("other", "common")}</option>

          </select>
        </div>

        <div>

          <label className="font-medium">
            {t("crimeSubcategory", "complaints")} *
          </label>

          <input
            type="text"
            name="crimeSubcategory"
            value={form.crimeSubcategory}
            onChange={handleChange}
            placeholder={t("enterSubcategory", "complaints")}
            className="w-full border rounded-lg p-3 mt-2"
          />

        </div>

      </div>

      {/* Priority + Complaint Mode */}

      <div className="grid grid-cols-2 gap-6">

        <div>

          <label className="font-medium">
            {t("priority", "cases")}
          </label>

          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          >
            <option>{t("low", "common")}</option>
            <option>{t("medium", "common")}</option>
            <option>{t("high", "common")}</option>
            <option>{t("critical", "complaints")}</option>
          </select>

        </div>

        <div>

          <label className="font-medium">
            {t("complaintMode", "complaints")}
          </label>

          <select
            name="complaintMode"
            value={form.complaintMode}
            onChange={handleChange}
            className="w-full border rounded-lg p-3 mt-2"
          >
            <option>{t("walkIn", "complaints")}</option>
            <option>{t("phoneCall", "complaints")}</option>
            <option>{t("onlinePortal", "complaints")}</option>
            <option>{t("email", "common")}</option>
            <option>{t("policeReferral", "complaints")}</option>
            <option>{t("other", "common")}</option>
          </select>

        </div>

      </div>

      {/* Date & Time */}

      <div className="grid grid-cols-2 gap-6">

        <div>

          <label className="font-medium">
            {t("incidentDate", "complaints")} *
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
            {t("incidentTime", "complaints")}
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
          {t("incidentLocation", "complaints")} *
        </label>

        <input
          type="text"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder={t("exactAddress", "complaints")}
          className="w-full border rounded-lg p-3 mt-2"
        />

      </div>

      <div>

        <label className="font-medium">
          {t("landmarkNearbyPlace", "complaints")}
        </label>

        <input
          type="text"
          name="landmark"
          value={form.landmark}
          onChange={handleChange}
          placeholder={t("nearestLandmark", "complaints")}
          className="w-full border rounded-lg p-3 mt-2"
        />

      </div>

      {/* Emergency */}

      <div>

        <label className="font-medium">
          {t("emergency", "complaints")}
        </label>

        <select
          name="emergency"
          value={form.emergency}
          onChange={handleChange}
          className="w-full border rounded-lg p-3 mt-2"
        >
          <option>{t("no", "common")}</option>
          <option>{t("yes", "common")}</option>
        </select>

      </div>

      {/* Description */}

      <div>

        <label className="font-medium">
          {t("detailedComplaint", "complaints")} *
        </label>

        <textarea
          rows={7}
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder={t("describeIncident", "complaints")}
          className="w-full border rounded-lg p-3 mt-2"
        />

      </div>

      {/* Officer Notes */}

      <div>

        <label className="font-medium">
          {t("officerNotes", "complaints")}
        </label>

        <textarea
          rows={4}
          name="officerNotes"
          value={form.officerNotes}
          onChange={handleChange}
          placeholder={t("internalPoliceNotes", "complaints")}
          className="w-full border rounded-lg p-3 mt-2"
        />

      </div>

    </div>
  );
}