"use client";

import { ChangeEvent, useRef } from "react";
import { Camera } from "lucide-react";
import { SuspectEntry } from "../types";

interface Props {
  suspects: SuspectEntry[];
  setSuspects: (suspects: SuspectEntry[]) => void;
}

export default function SuspectDetails({
  suspects,
  setSuspects,
}: Props) {
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);

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

  function handlePhotoUpload(
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const updated = suspects.map((suspect, i) =>
        i === index
          ? {
              ...suspect,
              photoUrl: reader.result as string,
              photoName: file.name,
            }
          : suspect
      );

      setSuspects(updated);
    };

    reader.readAsDataURL(file);
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

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-end justify-between">

        <div>

          <p className="text-base font-medium text-blue-600">
            Step 4
          </p>

          <h2 className="text-2xl font-semibold mt-1">
            Suspect Details
          </h2>

          <p className="text-slate-500 mt-2">
            Record every suspected individual involved in the incident.
          </p>

        </div>

        <button
          type="button"
          onClick={addSuspect}
          className="rounded-full bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          + Add Suspect
        </button>

      </div>

      {suspects.map((suspect, index) => (

        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
        >

          <div className="flex justify-between items-center">

            <h3 className="text-lg font-semibold">
              Suspect {index + 1}
            </h3>

            {suspects.length > 1 && (

              <button
                type="button"
                onClick={() => removeSuspect(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
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
              Identity Unknown
            </label>

          </div>

          {/* Personal Details */}

          <div className="grid md:grid-cols-2 gap-5 mt-6">

            <div>

              <label className="font-medium">
                Full Name
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
                placeholder="Full Name"
              />

            </div>

            <div>

              <label className="font-medium">
                Alias
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
                placeholder="Alias / Nickname"
              />

            </div>

            <div>

              <label className="font-medium">
                Father's Name
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
                placeholder="Father's Name"
              />

            </div>

            <div>

              <label className="font-medium">
                Approximate Age
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
                placeholder="Age"
              />

            </div>

            <div>

              <label className="font-medium">
                Date of Birth
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
                Gender
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
                <option value="">Select Gender</option>
                <option>Male</option>
                <option>Female</option>
                <option>Transgender</option>
                <option>Other</option>
                <option>Unknown</option>
              </select>

            </div>

          </div>
                    {/* Permanent Address */}

          <div className="mt-6">

            <label className="font-medium">
              Permanent Address
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
              placeholder="Permanent Address"
            />

          </div>

          {/* Present Address */}

          <div className="mt-5">

            <label className="font-medium">
              Present Address
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
              placeholder="Current Address"
            />

          </div>

          {/* Identification Marks */}

          <div className="mt-5">

            <label className="font-medium">
              Identification Marks
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
              placeholder="Scar, tattoo, mole, birthmark, missing finger etc."
            />

          </div>

          {/* Physical Appearance */}

          <div className="grid md:grid-cols-2 gap-5 mt-6">

            <div>

              <label className="font-medium">
                Face Shape
              </label>

              <select
                value={suspect.faceShape}
                onChange={(e) =>
                  handleFieldChange(index, "faceShape", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Select</option>
                <option>Oval</option>
                <option>Round</option>
                <option>Square</option>
                <option>Rectangle</option>
                <option>Diamond</option>
                <option>Heart</option>
                <option>Unknown</option>
              </select>

            </div>

            <div>

              <label className="font-medium">
                Complexion
              </label>

              <select
                value={suspect.complexion}
                onChange={(e) =>
                  handleFieldChange(index, "complexion", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Select</option>
                <option>Fair</option>
                <option>Wheatish</option>
                <option>Brown</option>
                <option>Dark</option>
                <option>Unknown</option>
              </select>

            </div>

            <div>

              <label className="font-medium">
                Eye Color
              </label>

              <select
                value={suspect.eyeColor}
                onChange={(e) =>
                  handleFieldChange(index, "eyeColor", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Select</option>
                <option>Black</option>
                <option>Brown</option>
                <option>Blue</option>
                <option>Green</option>
                <option>Grey</option>
                <option>Unknown</option>
              </select>

            </div>

            <div>

              <label className="font-medium">
                Eye Structure
              </label>

              <select
                value={suspect.eyeStructure}
                onChange={(e) =>
                  handleFieldChange(index, "eyeStructure", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Select</option>
                <option>Normal</option>
                <option>Large</option>
                <option>Small</option>
                <option>Round</option>
                <option>Almond</option>
                <option>Deep Set</option>
                <option>Unknown</option>
              </select>

            </div>

            <div>

              <label className="font-medium">
                Hair Type
              </label>

              <select
                value={suspect.hairType}
                onChange={(e) =>
                  handleFieldChange(index, "hairType", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Select</option>
                <option>Straight</option>
                <option>Curly</option>
                <option>Wavy</option>
                <option>Bald</option>
                <option>Unknown</option>
              </select>

            </div>

            <div>

              <label className="font-medium">
                Hair Color
              </label>

              <select
                value={suspect.hairColor}
                onChange={(e) =>
                  handleFieldChange(index, "hairColor", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
              >
                <option value="">Select</option>
                <option>Black</option>
                <option>Brown</option>
                <option>Grey</option>
                <option>White</option>
                <option>Dyed</option>
                <option>Unknown</option>
              </select>

            </div>

          </div>

          {/* Photo Upload */}

          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="font-semibold">
                  Suspect Photo
                </p>

                <p className="text-sm text-slate-500">
                  Upload photograph if available
                </p>

              </div>

              <button
                type="button"
                onClick={() => fileInputRefs.current[index]?.click()}
                className="flex items-center gap-2 rounded-full border px-4 py-2"
              >
                <Camera size={18} />
                Upload Photo
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
            />

            {suspect.photoUrl && (

              <div className="mt-5 flex items-center gap-4">

                <img
                  src={suspect.photoUrl}
                  alt="Suspect"
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