"use client";

import { useState } from "react";
import axios from "axios";
import { CheckCircle2 } from "lucide-react";

import { useLanguage } from "@/app/providers/LanguageProvider";

import Stepper from "./Stepper";
import ComplaintDetails from "./steps/ComplaintDetails";
import ComplainantDetails from "./steps/ComplainantDetails";
import VictimDetails from "./steps/VictimDetails";
import SuspectDetails from "./steps/SuspectDetails";
import DocumentsAndEvidence from "./steps/DocumentsAndEvidence";
import ReviewSubmission from "./steps/ReviewSubmission";
import NavigationButtons from "./NavigationButtons";

import {
  ComplaintData,
  VictimEntry,
  SuspectEntry,
} from "./types";

const initialForm: ComplaintData = {
  // Complaint
  complaintTitle: "",

  crimeCategory: "",
  crimeSubcategory: "",

  priority: "Medium",
  complaintMode: "Walk-In",

  incidentDate: "",
  incidentTime: "",

  location: "",
  landmark: "",

  emergency: "No",

  description: "",
  officerNotes: "",

  // Complainant
  complainantName: "",
  complainantFatherName: "",

  complainantAge: "",
  complainantGender: "",

  complainantPhone: "",
  complainantEmail: "",

  complainantAddress: "",

  complainantAadhaar: "",

  complainantRelationship: "",

  complainantOccupation: "",
  complainantNationality: "",

  complainantPhotoUrl: "",
  complainantPhotoName: "",
};

export default function ComplaintWizard() {
  const { t } = useLanguage();

  const [step, setStep] = useState(1);

  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] =
    useState<ComplaintData>(initialForm);

  const [victims, setVictims] =
    useState<VictimEntry[]>([
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

  const [suspects, setSuspects] =
    useState<SuspectEntry[]>([
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

  const [attachments, setAttachments] = useState<any[]>([]);

  const totalSteps = 6;

  function handleNext() {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  }

  function handleBack() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  async function handleSubmit() {
    try {
      const API_BASE =
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        "http://localhost:8000";

      await axios.post(
        `${API_BASE}/api/complaints/submit`,
        {
          complaint: form,
          victims,
          suspects,
          attachments,
        }
      );

      setSubmitted(true);

    } catch (err: any) {
      console.error("Complaint submission error:", err);
      const errorMessage = 
        err?.response?.data?.detail || 
        err?.response?.data?.message ||
        err?.message ||
        "Failed to register complaint.";
      alert(`Failed to register complaint: ${errorMessage}`);
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center rounded-[32px] border border-emerald-200 bg-white p-10 text-center shadow-xl">
        <div className="rounded-full bg-emerald-100 p-4 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <h1 className="mt-6 text-3xl font-semibold text-slate-900">
          Complaint Registered Successfully
        </h1>

        <p className="mt-3 max-w-xl text-base text-slate-600">
          The complaint has been saved successfully and is ready for further
          investigation.
        </p>

        <button
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setForm(initialForm);

            setVictims([
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

            setSuspects([
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

            setAttachments([]);
          }}
          className="mt-8 rounded-full bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
        >
          Register Another Complaint
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-full rounded-[32px] border border-slate-200 bg-white p-8 shadow-lg">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <p className="text-blue-600 font-semibold uppercase tracking-[0.25em]">
            Complaint Registration
          </p>

          <h1 className="mt-2 text-3xl font-bold">
            Register New Complaint
          </h1>

          <p className="mt-3 text-slate-600">
            Fill in all the required information regarding the complaint,
            complainant, victims and suspects.
          </p>

        </div>

      </div>

      <div className="mt-8">

        <Stepper currentStep={step} />

      </div>

      <div className="mt-10">

        {step === 1 && (

          <ComplaintDetails
            form={form}
            setForm={setForm}
          />

        )}

        {step === 2 && (

          <ComplainantDetails
            form={form}
            setForm={setForm}
          />

        )}

        {step === 3 && (

          <VictimDetails
            victims={victims}
            setVictims={setVictims}
          />

        )}

        {step === 4 && (

          <SuspectDetails
            suspects={suspects}
            setSuspects={setSuspects}
          />

        )}

        {step === 5 && (

          <DocumentsAndEvidence
            onDocumentsSubmit={(uploadedFiles) => {

              const files = uploadedFiles.map((file) => ({
                id: file.id,
                fileName: file.file.name,
                fileType: file.file.type,
                documentUrl: file.cloudinaryUrl,
              }));

              setAttachments((prev) => [
                ...prev,
                ...files,
              ]);

            }}
          />

        )}

        {step === 6 && (

          <ReviewSubmission
            form={form}
            victims={victims}
            suspects={suspects}
            attachments={attachments}
          />

        )}

      </div>

      <NavigationButtons
        currentStep={step}
        totalSteps={totalSteps}
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />

    </div>
  );
}