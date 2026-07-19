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

                {victim.photoName && (

                  <p className="mt-3 text-sm text-blue-600">
                    📷 {victim.photoName}
                  </p>

                )}

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

                {suspect.photoName && (

                  <p className="mt-3 text-sm text-blue-600">
                    📷 {suspect.photoName}
                  </p>

                )}

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

            {attachments.map((file) => (

              <div
                key={file.id}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >

                <p className="font-semibold">
                  {file.fileName}
                </p>

                <p className="text-sm text-slate-500">
                  {file.fileType}
                </p>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* Final Summary */}

      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">

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