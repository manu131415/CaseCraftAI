"use client";
import { useLanguage } from "@/app/providers/LanguageProvider";

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

  const { t } = useLanguage();
  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      {/* Header */}

      <div>
        <p className="text-base font-medium text-blue-600">
          {t("finalReview", "complaints")}
        </p>

        <h2 className="mt-1 text-2xl font-semibold text-slate-900">
          {t("reviewConfirmSubmission", "complaints")}
        </h2>

        <p className="mt-2 text-base text-slate-500">
          {t("reviewSubmissionDescription", "complaints")}
        </p>
      </div>

      {/* Complaint Details */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          {t("complaintDetails", "complaints")}
        </h3>

        <div className="grid gap-4 md:grid-cols-2">

          <div>
            <p className="text-sm text-slate-500">
              {t("complaintTitle", "complaints")}
            </p>

            <p className="font-semibold">
              {form.complaintTitle || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("crimeCategory", "complaints")}
            </p>

            <p className="font-semibold">
              {form.crimeCategory || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("crimeSubcategory", "complaints")}
            </p>

            <p className="font-semibold">
              {form.crimeSubcategory || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("priority", "cases")}
            </p>

            <p className="font-semibold">
              {form.priority || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("complaintMode", "complaints")}
            </p>

            <p className="font-semibold">
              {form.complaintMode || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("emergency", "complaints")}
            </p>

            <p className="font-semibold">
              {form.emergency || "No"}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("incidentDate", "complaints")}
            </p>

            <p className="font-semibold">
              {form.incidentDate || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("incidentTime", "complaints")}
            </p>

            <p className="font-semibold">
              {form.incidentTime || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("location", "cases")}
            </p>

            <p className="font-semibold">
              {form.location || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("landmark", "complaints")}
            </p>

            <p className="font-semibold">
              {form.landmark || t("notProvided", "common")}
            </p>
          </div>

        </div>

        <div className="mt-5">

          <p className="text-sm text-slate-500">
            {t("description", "common")}
          </p>

          <p className="mt-1 whitespace-pre-wrap rounded-xl bg-white p-3">
            {form.description || t("notProvided", "common")}
          </p>

        </div>

        <div className="mt-4">

          <p className="text-sm text-slate-500">
            {t("officerNotes", "complaints")}
          </p>

          <p className="mt-1 whitespace-pre-wrap rounded-xl bg-white p-3">
            {form.officerNotes || t("notProvided", "common")}
          </p>

        </div>

      </div>

      {/* Complainant */}

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

        <h3 className="mb-4 text-lg font-semibold text-slate-900">
          {t("complainantDetails", "complaints")}
        </h3>

        <div className="grid gap-4 md:grid-cols-2">

          <div>
            <p className="text-sm text-slate-500">
              {t("fullName", "complaints")}
            </p>

            <p className="font-semibold">
              {form.complainantName || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("fatherOrSpouseName", "complaints")}
            </p>

            <p className="font-semibold">
              {form.complainantFatherName || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("age", "common")}
            </p>

            <p className="font-semibold">
              {form.complainantAge || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("gender", "common")}
            </p>

            <p className="font-semibold">
              {form.complainantGender || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("phone", "common")}
            </p>

            <p className="font-semibold">
              {form.complainantPhone || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("email", "common")}
            </p>

            <p className="font-semibold">
              {form.complainantEmail || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("aadhaar", "complaints")}
            </p>

            <p className="font-semibold">
              {form.complainantAadhaar || t("notProvided", "common")}
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">
              {t("relationshipToIncident", "complaints")}
            </p>

            <p className="font-semibold">
              {form.complainantRelationship || t("notProvided", "common")}
            </p>
          </div>

        </div>

        <div className="mt-5">

          <p className="text-sm text-slate-500">
            {t("address", "common")}
          </p>

          <p className="mt-1 rounded-xl bg-white p-3">
            {form.complainantAddress || t("notProvided", "common")}
          </p>

        </div>

        {complainantPhotoUrl ? (
          <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-700">{t("complainantPhotograph", "complaints")}</p>
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
          {t("victimDetails", "complaints")}
        </h3>

        {victims.length === 0 ? (

          <p className="text-slate-500">
            {t("noVictimDetails", "complaints")}
          </p>

        ) : (

          <div className="space-y-4">

            {victims.map((victim, index) => (

              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >

                <h4 className="mb-3 font-semibold text-slate-900">
                  {t("victim", "complaints")} {index + 1}
                </h4>

                <div className="grid gap-4 md:grid-cols-2">

                  <div>
                    <p className="text-sm text-slate-500">{t("fullName", "complaints")}</p>
                    <p className="font-semibold">
                      {victim.fullName || t("notProvided", "common")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">{t("age", "common")}</p>
                    <p className="font-semibold">
                      {victim.age || t("notProvided", "common")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">{t("gender", "common")}</p>
                    <p className="font-semibold">
                      {victim.gender || t("notProvided", "common")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">{t("phone", "common")}</p>
                    <p className="font-semibold">
                      {victim.phone || t("notProvided", "common")}
                    </p>
                  </div>

                </div>

                <div className="mt-4">

                  <p className="text-sm text-slate-500">
                    {t("address", "common")}
                  </p>

                  <p className="rounded-lg bg-slate-50 p-2">
                    {victim.address || t("notProvided", "common")}
                  </p>

                </div>

                <div className="mt-4">

                  <p className="text-sm text-slate-500">
                    {t("injuries", "complaints")}
                  </p>

                  <p className="rounded-lg bg-slate-50 p-2">
                    {victim.injuries || t("none", "common")}
                  </p>

                </div>

                {(victim.photoUrl || (victim as any).photo_url || (victim as any).photoURL) ? (
                  <div className="mt-4 flex flex-col items-start gap-3">
                    <p className="text-sm text-slate-500">{t("photo", "common")}</p>
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
          {t("suspectDetails", "complaints")}
        </h3>

        {suspects.length === 0 ? (

          <p className="text-slate-500">
            {t("noSuspectDetails", "complaints")}
          </p>

        ) : (

          <div className="space-y-4">

            {suspects.map((suspect, index) => (

              <div
                key={index}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >

                <h4 className="mb-3 font-semibold">
                  {t("suspect", "complaints")} {index + 1}
                </h4>

                <div className="grid gap-4 md:grid-cols-2">

                  <div>
                    <p className="text-sm text-slate-500">
                      {t("fullName", "complaints")}
                    </p>

                    <p className="font-semibold">
                      {suspect.unknownIdentity
                        ? t("unknown", "common")
                        : suspect.fullName || t("notProvided", "common")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      {t("alias", "complaints")}
                    </p>

                    <p className="font-semibold">
                      {suspect.alias || t("none", "common")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      {t("age", "common")}
                    </p>

                    <p className="font-semibold">
                      {suspect.age || t("unknown", "common")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      {t("gender", "common")}
                    </p>

                    <p className="font-semibold">
                      {suspect.gender || t("unknown", "common")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      {t("faceShape", "complaints")}
                    </p>

                    <p className="font-semibold">
                      {suspect.faceShape || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      {t("complexion", "complaints")}
                    </p>

                    <p className="font-semibold">
                      {suspect.complexion || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      {t("eyeColor", "complaints")}
                    </p>

                    <p className="font-semibold">
                      {suspect.eyeColor || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-500">
                      {t("hairType", "complaints")}
                    </p>

                    <p className="font-semibold">
                      {suspect.hairType || "-"}
                    </p>
                  </div>

                </div>

                <div className="mt-4">

                  <p className="text-sm text-slate-500">
                    {t("identificationMarks", "complaints")}
                  </p>

                  <p className="rounded-lg bg-slate-50 p-2">
                    {suspect.identificationMarks || t("none", "common")}
                  </p>

                </div>

                {(suspect.photoUrl || (suspect as any).photo_url || (suspect as any).photoURL) ? (
                  <div className="mt-4 flex flex-col items-start gap-3">
                    <p className="text-sm text-slate-500">{t("photo", "common")}</p>
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
          {t("documentsEvidence.heading", "complaints")}
        </h3>

        {attachments.length === 0 ? (

          <p className="text-slate-500">
            {t("noDocumentsUploaded", "complaints")}
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
                    {file.fileType || t("document", "common")}
                  </p>

                  {isImage && safeUrl ? (
                    <a href={safeUrl} target="_blank" rel="noreferrer noopener" className="mt-3 block">
                      <img src={safeUrl} alt={file.fileName} className="max-h-40 w-full rounded-xl object-contain" />
                    </a>
                  ) : safeUrl ? (
                    <a href={safeUrl} target="_blank" rel="noreferrer noopener" className="mt-3 inline-block text-indigo-600 hover:underline">{t("openFile", "complaints")}</a>
                  ) : null}

                </div>
              );
            })}

          </div>
        )}

        <h3 className="font-semibold text-emerald-800">
          {t("readyForSubmission", "complaints")}
        </h3>

        <p className="mt-2 text-emerald-700">
          {t("readyForSubmissionDescription", "complaints")}
          <strong> {t("submitComplaint", "complaints")} </strong>
        </p>

      </div>

    </div>
  );
}