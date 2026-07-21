"use client";

import {
  ComplaintData,
  VictimEntry,
  SuspectEntry,
} from "../types";

interface Attachment {
  id: string;
  fileName: string;
  fileType: string;
  documentUrl?: string;
  cloudinaryUrl?: string;
  url?: string;
  document_url?: string;
}

interface Props {
  form: ComplaintData;
  victims: VictimEntry[];
  suspects: SuspectEntry[];
  attachments: Attachment[];
}

export default function ReviewSubmission({
  form,
  victims,
  suspects,
  attachments,
}: Props) {
  const complainantPhotoUrl =
    form.complainantPhotoUrl ||
    (form as any).complainant_photo_url ||
    (form as any).complainantPhotoURL ||
    (form as any).complainantPhotoUrl ||
    "";
  const complainantPhotoName =
    form.complainantPhotoName ||
    (form as any).complainant_photo_name ||
    (form as any).complainantPhotoName ||
    "";

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* Header */}

      <div>
        <p className="text-base font-medium text-blue-600">
          Final Review
        </p>

        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
          Review & Confirm Submission
        </h2>

        <p className="mt-2 text-base text-slate-500">
          Verify all entered information before registering the complaint.
        </p>
      </div>

      {/* Complaint Details */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Complaint Details
        </h3>

        <div className="grid gap-4 md:grid-cols-2">

          <div>
            <p className="text-sm text-slate-500">
              Complaint Title
            </p>

            <p className="font-semibold">
              {form.complaintTitle || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Crime Category
            </p>

            <p className="font-semibold">
              {form.crimeCategory || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Crime Subcategory
            </p>

            <p className="font-semibold">
              {form.crimeSubcategory || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Priority
            </p>

            <p className="font-semibold">
              {form.priority || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Complaint Mode
            </p>

            <p className="font-semibold">
              {form.complaintMode || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Emergency
            </p>

            <p className="font-semibold">
              {form.emergency || "No"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Incident Date
            </p>

            <p className="font-semibold">
              {form.incidentDate || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Incident Time
            </p>

            <p className="font-semibold">
              {form.incidentTime || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Location
            </p>

            <p className="font-semibold">
              {form.location || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Landmark
            </p>

            <p className="font-semibold">
              {form.landmark || "Not provided"}
            </p>
          </div>

        </div>

        <div className="mt-5">

          <p className="text-sm text-slate-500">
            Description
          </p>

          <p className="mt-1 whitespace-pre-wrap rounded-xl bg-white p-3">
            {form.description || "Not provided"}
          </p>

        </div>

        <div className="mt-4">

          <p className="text-sm text-slate-500">
            Officer Notes
          </p>

          <p className="mt-1 whitespace-pre-wrap rounded-xl bg-white p-3">
            {form.officerNotes || "Not provided"}
          </p>

        </div>

      </div>

      {/* Complainant */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Complainant Details
        </h3>

        <div className="grid gap-4 md:grid-cols-2">

          <div>
            <p className="text-sm text-slate-500">
              Full Name
            </p>

            <p className="font-semibold">
              {form.complainantName || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Father / Spouse Name
            </p>

            <p className="font-semibold">
              {form.complainantFatherName || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Age
            </p>

            <p className="font-semibold">
              {form.complainantAge || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Gender
            </p>

            <p className="font-semibold">
              {form.complainantGender || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Phone
            </p>

            <p className="font-semibold">
              {form.complainantPhone || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Email
            </p>

            <p className="font-semibold">
              {form.complainantEmail || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Aadhaar / Govt ID
            </p>

            <p className="font-semibold">
              {form.complainantAadhaar || "Not provided"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              Relationship
            </p>

            <p className="font-semibold">
              {form.complainantRelationship || "Not provided"}
            </p>
          </div>

        </div>

        <div className="mt-5">

          <p className="text-sm text-slate-500">
            Address
          </p>

          <p className="mt-1 rounded-xl bg-white p-3">
            {form.complainantAddress || "Not provided"}
          </p>

        </div>

        {complainantPhotoUrl ? (
          <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-700">Complainant Photo</p>
            <img
              src={complainantPhotoUrl}
              alt={complainantPhotoName || "Complainant photo"}
              className="mt-3 h-56 w-56 max-w-full rounded-2xl object-cover border"
            />
            {complainantPhotoName ? (
              <p className="mt-2 text-sm text-slate-500">{complainantPhotoName}</p>
            ) : null}
          </div>
        ) : null}

      </div>
            {/* Victims */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Victim Details
        </h3>

        {victims.length === 0 ? (

          <p className="text-slate-500">
            No victim details provided.
          </p>

        ) : (

          <div className="space-y-4">

            {victims.map((victim, index) => (

              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >

                <h4 className="mb-3 font-semibold text-slate-900">
                  Victim {index + 1}
                </h4>

                <div className="grid gap-4 md:grid-cols-2">

                  <div>
                    <p className="text-sm text-slate-500">Full Name</p>
                    <p className="font-semibold">
                      {victim.fullName || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Age</p>
                    <p className="font-semibold">
                      {victim.age || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Gender</p>
                    <p className="font-semibold">
                      {victim.gender || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-semibold">
                      {victim.phone || "Not provided"}
                    </p>
                  </div>

                </div>

                <div className="mt-4">

                  <p className="text-sm text-slate-500">
                    Address
                  </p>

                  <p className="rounded-lg bg-slate-50 p-2">
                    {victim.address || "Not provided"}
                  </p>

                </div>

                <div className="mt-4">

                  <p className="text-sm text-slate-500">
                    Injuries
                  </p>

                  <p className="rounded-lg bg-slate-50 p-2">
                    {victim.injuries || "None"}
                  </p>

                </div>

                {(victim.photoUrl || (victim as any).photo_url || (victim as any).photoURL) ? (
                  <div className="mt-4 flex flex-col items-start gap-3">
                    <p className="text-sm text-slate-500">Photo</p>
                    <img
                      src={victim.photoUrl || (victim as any).photo_url || (victim as any).photoURL}
                      alt={`Victim ${index + 1}`}
                      className="h-52 w-52 min-w-[208px] rounded-2xl object-cover border"
                    />
                    {victim.photoName ? (
                      <p className="text-sm text-slate-500">{victim.photoName}</p>
                    ) : null}
                  </div>
                ) : victim.photoName ? (
                  <p className="mt-3 text-sm text-blue-600">📷 {victim.photoName}</p>
                ) : null}

              </div>

            ))}

          </div>

        )}

      </div>

      {/* Suspects */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          Suspect Details
        </h3>

        {suspects.length === 0 ? (

          <p className="text-slate-500">
            No suspect details provided.
          </p>

        ) : (

          <div className="space-y-4">

            {suspects.map((suspect, index) => (

              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >

                <h4 className="mb-3 font-semibold">
                  Suspect {index + 1}
                </h4>

                <div className="grid gap-4 md:grid-cols-2">

                  <div>
                    <p className="text-sm text-slate-500">
                      Full Name
                    </p>

                    <p className="font-semibold">
                      {suspect.unknownIdentity
                        ? "Unknown"
                        : suspect.fullName || "Not provided"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Alias
                    </p>

                    <p className="font-semibold">
                      {suspect.alias || "None"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Age
                    </p>

                    <p className="font-semibold">
                      {suspect.age || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Gender
                    </p>

                    <p className="font-semibold">
                      {suspect.gender || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Face Shape
                    </p>

                    <p className="font-semibold">
                      {suspect.faceShape || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Complexion
                    </p>

                    <p className="font-semibold">
                      {suspect.complexion || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Eye Color
                    </p>

                    <p className="font-semibold">
                      {suspect.eyeColor || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      Hair Type
                    </p>

                    <p className="font-semibold">
                      {suspect.hairType || "-"}
                    </p>
                  </div>

                </div>

                <div className="mt-4">

                  <p className="text-sm text-slate-500">
                    Identification Marks
                  </p>

                  <p className="rounded-lg bg-slate-50 p-2">
                    {suspect.identificationMarks || "None"}
                  </p>

                </div>

                {(suspect.photoUrl || (suspect as any).photo_url || (suspect as any).photoURL) ? (
                  <div className="mt-4 flex flex-col items-start gap-3">
                    <p className="text-sm text-slate-500">Photo</p>
                    <img
                      src={suspect.photoUrl || (suspect as any).photo_url || (suspect as any).photoURL}
                      alt={`Suspect ${index + 1}`}
                      className="h-52 w-52 min-w-[208px] rounded-2xl object-cover border"
                    />
                    {suspect.photoName ? (
                      <p className="text-sm text-slate-500">{suspect.photoName}</p>
                    ) : null}
                  </div>
                ) : suspect.photoName ? (
                  <p className="mt-3 text-sm text-blue-600">📷 {suspect.photoName}</p>
                ) : null}

              </div>

            ))}

          </div>

        )}

      </div>

      {/* Documents */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <h3 className="mb-4 text-lg font-semibold">
          Documents & Evidence
        </h3>

        {attachments.length === 0 ? (

          <p className="text-slate-500">
            No documents uploaded.
          </p>

        ) : (

          <div className="space-y-3">

            {attachments.map((file) => {
              const url = file.documentUrl || file.cloudinaryUrl || file.url || file.document_url;
              const safeUrl = url ? encodeURI(url) : undefined;
              const isImage = (file.fileType || "").startsWith("image") || (url && /\.(jpg|jpeg|png|gif|webp)$/i.test(url));

              return (
                <div
                  key={file.id}
                  className="rounded-xl border border-slate-200 bg-white p-4"
                >

                  <p className="font-semibold">
                    {file.fileName}
                  </p>

                  <p className="text-sm text-slate-500">
                    {file.fileType || "Document"}
                  </p>

                  {isImage && safeUrl ? (
                    <a href={safeUrl} target="_blank" rel="noreferrer noopener" className="mt-3 block">
                      <img src={safeUrl} alt={file.fileName} className="max-h-40 w-full rounded-xl object-contain" />
                    </a>
                  ) : safeUrl ? (
                    <a href={safeUrl} target="_blank" rel="noreferrer noopener" className="mt-3 inline-block text-indigo-600 hover:underline">Open file</a>
                  ) : null}

                </div>
              );
            })}

          </div>
        )}

        <h3 className="font-semibold text-emerald-800">
          Ready for Submission
        </h3>

        <p className="mt-2 text-emerald-700">
          The complaint, complainant details, victims, suspects,
          and uploaded evidence have been reviewed. Click
          <strong> Submit Complaint </strong>
          to register the complaint in the CrimeGPT system.
        </p>

      </div>

    </div>
  );
}