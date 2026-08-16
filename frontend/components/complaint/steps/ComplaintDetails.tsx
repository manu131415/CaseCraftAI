"use client";

import { ComplaintData } from "../types";
import { crimeTypes } from "../info/crimeTypes";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface Props {
  form: ComplaintData;
  setForm: React.Dispatch<React.SetStateAction<ComplaintData>>;
}

export default function ComplaintDetails({ form, setForm }: Props) {
  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    const { name, value } = e.target;

    if (name === "crimeCategory") {
      setForm({
        ...form,
        crimeCategory: value,
        crimeSubcategory: "",
      });
    } else {
      setForm({
        ...form,
        [name]: value,
      });
    }
  }

  const { t } = useLanguage();

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-base font-medium text-blue-600">
          {t("step1", "complaints")}
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
          {t("complaintInformation", "complaints")}
        </h2>
        <p className="mt-2 text-base text-slate-500">
          {t("complaintInformationDescription", "complaints")}
        </p>
      </div>

      {/* Added Complaint Title Field */}
      <div>
        <label className="text-base font-medium text-slate-700">
          {t("complaintTitle", "complaints")}
        </label>
        <input
          type="text"
          name="complaintTitle"
          value={form.complaintTitle}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          placeholder={t("enterComplaintTitle", "complaints")}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-base font-medium text-slate-700">
            {t("category", "complaints")}
          </label>
          <select
            name="crimeCategory"
            value={form.crimeCategory}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          >
            <option value="">{t("selectCategory", "complaints")}</option>

            {Object.keys(crimeTypes).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-base font-medium text-slate-700">
            {t("priority", "cases")}
          </label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          >
            <option value="Low">{t("low", "common")}</option>
            <option value="Medium">{t("medium", "common")}</option>
            <option value="High">{t("high", "common")}</option>
            <option value="Critical">{t("critical", "complaints")}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-base font-medium text-slate-700">
          {t("crimeSubcategory", "complaints")}
        </label>

        <select
          name="crimeSubcategory"
          value={form.crimeSubcategory}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
          disabled={!form.crimeCategory}
        >
          <option value="">{t("selectComplaintType", "complaints")}</option>

          {form.crimeCategory &&
            crimeTypes[
              form.crimeCategory as keyof typeof crimeTypes
            ]?.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="text-base font-medium text-slate-700">
            {t("incidentDate", "complaints")}
          </label>
          <input
            type="date"
            name="incidentDate"
            value={form.incidentDate}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          />
        </div>
        <div>
          <label className="text-base font-medium text-slate-700">
            {t("incidentTime", "complaints")}
          </label>
          <input
            type="time"
            name="incidentTime"
            value={form.incidentTime}
            onChange={handleChange}
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          />
        </div>
      </div>

      <div>
        <label className="text-base font-medium text-slate-700">
          {t("incidentLocation", "complaints")}
        </label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          placeholder={t("enterLocation", "complaints")}
        />
      </div>

      <div>
        <label className="text-base font-medium text-slate-700">
          {t("incidentDescription", "complaints")}
        </label>
        <textarea
          rows={6}
          name="description"
          value={form.description}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          placeholder={t("describeWhatHappened", "complaints")}
        />
      </div>

      <div>
        <label className="text-base font-medium text-slate-700">
          {t("officerNotes", "complaints")}
        </label>
        <textarea
          rows={3}
          name="officerNotes"
          value={form.officerNotes}
          onChange={handleChange}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
          placeholder={t("addInternalNotes", "complaints")}
        />
      </div>
    </div>
  );
}