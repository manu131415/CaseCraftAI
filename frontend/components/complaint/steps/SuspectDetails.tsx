"use client";

import { ChangeEvent, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { SuspectEntry } from "../types";
import { uploadPhotoToCloudinary } from "@/lib/api/complaints";
import { useLanguage } from "@/app/providers/LanguageProvider";

interface Props {
  suspects: SuspectEntry[];
  setSuspects: (suspects: SuspectEntry[]) => void;
}

export default function SuspectDetails({
  suspects,
  setSuspects,
}: Props) {
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [uploadingPhotoIndex, setUploadingPhotoIndex] = useState<number | null>(null);

  function handleFieldChange(
    index: number,
    field: keyof SuspectEntry,
    value: string | boolean
  ) {
    const updated = suspects.map((suspect, i) =>
      i === index ? { ...suspect, [field]: value } : suspect
    );

    setSuspects(updated);
  }

  async function handlePhotoUpload(
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadingPhotoIndex(index);
    try {
      const cloudinaryUrl = await uploadPhotoToCloudinary(file);
      const updated = suspects.map((suspect, i) =>
        i === index
          ? {
              ...suspect,
              photoUrl: cloudinaryUrl,
              photoName: file.name,
            }
          : suspect
      );

      setSuspects(updated);
    } catch (err) {
      console.error("Photo upload failed:", err);
      alert(t("photoUploadFailed", "complaints"));
    } finally {
      setUploadingPhotoIndex(null);
    }
  }

  function removeSuspect(index: number) {
    setSuspects(suspects.filter((_, i) => i !== index));
  }

  function addSuspect() {
    setSuspects([
      ...suspects,
      {
        fullName: "",
        alias: "",
        fatherName: "",
        age: "",
        dob: "",
        gender: "",

        permanentAddress: "",
        presentAddress: "",

        identificationMarks: "",

        faceShape: "",
        complexion: "",
        eyeColor: "",
        eyeStructure: "",
        hairType: "",
        hairColor: "",

        unknownIdentity: false,

        photoUrl: "",
        photoName: "",
      },
    ]);
  }

  const { t } = useLanguage();
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-end justify-between">

        <div>

          <p className="text-base font-medium text-blue-600">
            {t("step4", "complaints")}
          </p>

          <h2 className="text-2xl font-semibold mt-1">
            {t("suspectDetails", "complaints")}
          </h2>

          <p className="text-slate-500 mt-2">
            {t("suspectDetailsDescription", "complaints")}
          </p>

        </div>

        <button
          type="button"
          onClick={addSuspect}
          className="rounded-full bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          + {t("addSuspect", "complaints")}
        </button>

      </div>

      {suspects.map((suspect, index) => (

        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
        >

          <div className="flex justify-between items-center">

            <h3 className="text-lg font-semibold">
              {t("suspect", "complaints")} {index + 1}
            </h3>

            {suspects.length > 1 && (

              <button
                type="button"
                onClick={() => removeSuspect(index)}
                className="text-red-600 hover:text-red-800"
              >
                {t("remove", "common")}
              </button>

            )}

          </div>

          {/* Unknown Identity */}

          <div className="mt-5 flex items-center gap-3">

            <input
              type="checkbox"
              checked={suspect.unknownIdentity}
              onChange={(e) =>
                handleFieldChange(
                  index,
                  "unknownIdentity",
                  e.target.checked
                )
              }
            />

            <label className="font-medium">
              {t("identityUnknown", "complaints")}
            </label>

          </div>

          {/* Personal Details */}

          <div className="grid md:grid-cols-2 gap-5 mt-6">

            <div>

              <label className="font-medium">
                {t("fullName", "complaints")}
              </label>

              <input
                disabled={suspect.unknownIdentity}
                value={suspect.fullName}
                onChange={(e) =>
                  handleFieldChange(
                    index,
                    "fullName",
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border p-3"
                placeholder={t("fullName", "complaints")}
              />

            </div>

            <div>

              <label className="font-medium">
                {t("alias", "complaints")}
              </label>

              <input
                disabled={suspect.unknownIdentity}
                value={suspect.alias}
                onChange={(e) =>
                  handleFieldChange(
                    index,
                    "alias",
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border p-3"
                placeholder={t("aliasNickname", "complaints")}
              />

            </div>

            <div>

              <label className="font-medium">
                {t("fathersName", "complaints")}
              </label>

              <input
                disabled={suspect.unknownIdentity}
                value={suspect.fatherName}
                onChange={(e) =>
                  handleFieldChange(
                    index,
                    "fatherName",
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border p-3"
                placeholder={t("fathersName", "complaints")}
              />

            </div>

            <div>

              <label className="font-medium">
                {t("approximateAge", "complaints")}
              </label>

              <input
                type="number"
                min={0}
                max={120}
                value={suspect.age}
                onChange={(e) =>
                  handleFieldChange(
                    index,
                    "age",
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border p-3"
                placeholder={t("age", "common")}
              />

            </div>

            <div>

              <label className="font-medium">
                {t("dateOfBirth", "complaints")}
              </label>

              <input
                type="date"
                disabled={suspect.unknownIdentity}
                value={suspect.dob}
                onChange={(e) =>
                  handleFieldChange(
                    index,
                    "dob",
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border p-3"
              />

            </div>

            <div>

              <label className="font-medium">
                {t("gender", "common")}
              </label>

              <select
                value={suspect.gender}
                onChange={(e) =>
                  handleFieldChange(
                    index,
                    "gender",
                    e.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">{t("selectGender", "complaints")}</option>
                <option>{t("male", "common")}</option>
                <option>{t("female", "common")}</option>
                <option>{t("transgender", "common")}</option>
                <option>{t("other", "common")}</option>
                <option>{t("unknown", "common")}</option>
              </select>

            </div>

          </div>
                    {/* Permanent Address */}

          <div className="mt-6">

            <label className="font-medium">
              {t("permanentAddress", "complaints")}
            </label>

            <textarea
              rows={3}
              disabled={suspect.unknownIdentity}
              value={suspect.permanentAddress}
              onChange={(e) =>
                handleFieldChange(
                  index,
                  "permanentAddress",
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-xl border p-3"
              placeholder={t("permanentAddress", "complaints")}
            />

          </div>

          {/* Present Address */}

          <div className="mt-5">

            <label className="font-medium">
              {t("presentAddress", "complaints")}
            </label>

            <textarea
              rows={3}
              disabled={suspect.unknownIdentity}
              value={suspect.presentAddress}
              onChange={(e) =>
                handleFieldChange(
                  index,
                  "presentAddress",
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-xl border p-3"
              placeholder={t("currentAddress", "complaints")}
            />

          </div>

          {/* Identification Marks */}

          <div className="mt-5">

            <label className="font-medium">
              {t("identificationMarks", "complaints")}
            </label>

            <textarea
              rows={4}
              value={suspect.identificationMarks}
              onChange={(e) =>
                handleFieldChange(
                  index,
                  "identificationMarks",
                  e.target.value
                )
              }
              className="mt-2 w-full rounded-xl border p-3"
              placeholder={t("identificationMarksPlaceholder", "complaints")}
            />

          </div>

          {/* Physical Appearance */}

          <div className="grid md:grid-cols-2 gap-5 mt-6">

            <div>

              <label className="font-medium">
                {t("faceShape", "complaints")}
              </label>

              <select
                value={suspect.faceShape}
                onChange={(e) =>
                  handleFieldChange(index, "faceShape", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">{t("select", "common")}</option>
                <option>{t("oval","complaints")}</option>
                <option>{t("round","complaints")}</option>
                <option>{t("square","complaints")}</option>
                <option>{t("rectangle","complaints")}</option>
                <option>{t("diamond","complaints")}</option>
                <option>{t("heart","complaints")}</option>
                <option>{t("unknown","common")}</option>
              </select>

            </div>

            <div>

              <label className="font-medium">
                {t("complexion", "complaints")}
              </label>

              <select
                value={suspect.complexion}
                onChange={(e) =>
                  handleFieldChange(index, "complexion", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">{t("select", "common")}</option>
                <option>{t("fair","complaints")}</option>
                <option>{t("wheatish","complaints")}</option>
                <option>{t("brown","complaints")}</option>
                <option>{t("dark","complaints")}</option>
                <option>{t("unknown","common")}</option>
              </select>

            </div>

            <div>

              <label className="font-medium">
                {t("eyeColor", "complaints")}
              </label>

              <select
                value={suspect.eyeColor}
                onChange={(e) =>
                  handleFieldChange(index, "eyeColor", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">{t("select", "common")}</option>
                <option>{t("black","complaints")}</option>
                <option>{t("brown","complaints")}</option>
                <option>{t("blue","complaints")}</option>
                <option>{t("green","complaints")}</option>
                <option>{t("grey","complaints")}</option>
                <option>{t("unknown","common")}</option>
              </select>

            </div>

            <div>

              <label className="font-medium">
                {t("eyeStructure", "complaints")}
              </label>

              <select
                value={suspect.eyeStructure}
                onChange={(e) =>
                  handleFieldChange(index, "eyeStructure", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">{t("select", "common")}</option>
                <option>{t("normal","complaints")}</option>
                <option>{t("large","complaints")}</option>
                <option>{t("small","complaints")}</option>
                <option>{t("round","complaints")}</option>
                <option>{t("almond","complaints")}</option>
                <option>{t("deepSet","complaints")}</option>
                <option>{t("unknown","common")}</option>
              </select>

            </div>

            <div>

              <label className="font-medium">
                {t("hairType", "complaints")}
              </label>

              <select
                value={suspect.hairType}
                onChange={(e) =>
                  handleFieldChange(index, "hairType", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">{t("select", "common")}</option>
                <option>{t("straight","complaints")}</option>
                <option>{t("curly","complaints")}</option>
                <option>{t("wavy","complaints")}</option>
                <option>{t("bald","complaints")}</option>
                <option>{t("unknown","common")}</option>
              </select>

            </div>

            <div>

              <label className="font-medium">
                {t("hairColor", "complaints")}
              </label>

              <select
                value={suspect.hairColor}
                onChange={(e) =>
                  handleFieldChange(index, "hairColor", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">{t("select", "common")}</option>
                <option>{t("black","complaints")}</option>
                <option>{t("brown","complaints")}</option>
                <option>{t("grey","complaints")}</option>
                <option>{t("white","complaints")}</option>
                <option>{t("dyed","complaints")}</option>
                <option>{t("unknown","common")}</option>
              </select>

            </div>

          </div>

          {/* Photo Upload */}

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="font-semibold">
                  {t("suspectPhoto", "complaints")}
                </p>

                <p className="text-sm text-slate-500">
                  {t("uploadPhotographDescription", "complaints")}
                </p>

              </div>

              <button
                type="button"
                onClick={() => fileInputRefs.current[index]?.click()}
                disabled={uploadingPhotoIndex === index}
                className="flex items-center gap-2 rounded-full border px-4 py-2 hover:bg-slate-50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Camera size={18} />
                {uploadingPhotoIndex === index ? t("uploading","common") : t("uploadPhoto","complaints")}
              </button>

            </div>

            <input
              ref={(el) => {
                fileInputRefs.current[index] = el;
              }}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handlePhotoUpload(index, e)}
              disabled={uploadingPhotoIndex === index}
            />

            {suspect.photoUrl && (

              <div className="mt-5 flex items-center gap-4">

                <img
                  src={suspect.photoUrl}
                  alt={t("suspect", "complaints")}
                  className="h-24 w-24 rounded-xl object-cover"
                />

                <span>{suspect.photoName}</span>

              </div>

            )}

          </div>

        </div>

      ))}

    </div>

  );

}