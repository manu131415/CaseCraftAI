"use client";

import { ChangeEvent, useRef } from "react";
import { Camera } from "lucide-react";
import { VictimEntry } from "../types";

interface Props {
  victims: VictimEntry[];
  setVictims: (victims: VictimEntry[]) => void;
}

export default function VictimDetails({
  victims,
  setVictims,
}: Props) {
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function handleFieldChange(
    index: number,
    field: keyof VictimEntry,
    value: string
  ) {
    const updated = victims.map((victim, i) =>
      i === index ? { ...victim, [field]: value } : victim
    );

    setVictims(updated);
  }

  function handlePhotoUpload(
    index: number,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const updated = victims.map((victim, i) =>
        i === index
          ? {
              ...victim,
              photoUrl: reader.result as string,
              photoName: file.name,
            }
          : victim
      );

      setVictims(updated);
    };

    reader.readAsDataURL(file);
  }

  function removeVictim(index: number) {
    setVictims(victims.filter((_, i) => i !== index));
  }

  function addVictim() {
    setVictims([
      ...victims,
      {
        fullName: "",
        age: "",
        gender: "",
        phone: "",
        address: "",
        injuries: "",
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
            Step 3
          </p>

          <h2 className="mt-1 text-2xl font-semibold">
            Victim Details
          </h2>

          <p className="mt-2 text-slate-500">
            Add all victims involved in the incident.
          </p>
        </div>

        <button
          type="button"
          onClick={addVictim}
          className="rounded-full bg-blue-600 px-5 py-2 text-white font-medium hover:bg-blue-700"
        >
          + Add Victim
        </button>

      </div>

      {victims.map((victim, index) => (

        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
        >

          <div className="flex justify-between items-center">

            <h3 className="text-lg font-semibold">
              Victim {index + 1}
            </h3>

            {victims.length > 1 && (

              <button
                type="button"
                onClick={() => removeVictim(index)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>

            )}

          </div>

          <div className="grid md:grid-cols-2 gap-5 mt-6">

            <div>

              <label className="font-medium">
                Full Name *
              </label>

              <input
                value={victim.fullName}
                onChange={(e) =>
                  handleFieldChange(index, "fullName", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
                placeholder="Enter full name"
              />

            </div>

            <div>

              <label className="font-medium">
                Age
              </label>

              <input
                type="number"
                min={0}
                max={120}
                value={victim.age}
                onChange={(e) =>
                  handleFieldChange(index, "age", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
                placeholder="Age"
              />

            </div>

            <div>

              <label className="font-medium">
                Gender
              </label>

              <select
                value={victim.gender}
                onChange={(e) =>
                  handleFieldChange(index, "gender", e.target.value)
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

            <div>

              <label className="font-medium">
                Phone Number
              </label>

              <input
                value={victim.phone}
                onChange={(e) =>
                  handleFieldChange(index, "phone", e.target.value)
                }
                className="mt-2 w-full rounded-xl border p-3"
                placeholder="Phone Number"
              />

            </div>

          </div>

          <div className="mt-5">

            <label className="font-medium">
              Address
            </label>

            <textarea
              rows={3}
              value={victim.address}
              onChange={(e) =>
                handleFieldChange(index, "address", e.target.value)
              }
              className="mt-2 w-full rounded-xl border p-3"
              placeholder="Residential Address"
            />

          </div>

          <div className="mt-5">

            <label className="font-medium">
              Injury Details
            </label>

            <textarea
              rows={4}
              value={victim.injuries}
              onChange={(e) =>
                handleFieldChange(index, "injuries", e.target.value)
              }
              className="mt-2 w-full rounded-xl border p-3"
              placeholder="Describe injuries sustained"
            />

          </div>

          <div className="mt-6 rounded-2xl border border-dashed p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="font-semibold">
                  Victim Photo
                </p>

                <p className="text-sm text-slate-500">
                  Optional
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  fileInputRefs.current[index]?.click()
                }
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

            {victim.photoUrl && (

              <div className="mt-5 flex items-center gap-4">

                <img
                  src={victim.photoUrl}
                  alt="Victim"
                  className="h-24 w-24 rounded-xl object-cover"
                />

                <span>{victim.photoName}</span>

              </div>

            )}

          </div>

        </div>

      ))}

    </div>
  );
}