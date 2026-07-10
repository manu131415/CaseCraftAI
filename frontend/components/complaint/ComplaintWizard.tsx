"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Stepper from "./Stepper";
import FileUploader from "./upload/FileUploader";
import ComplaintDetails from "./steps/ComplaintDetails";
import VictimDetails from "./steps/VictimDetails";
import SuspectDetails from "./steps/SuspectDetails";
import ComplainantDetails from "./steps/ComplainantDetails";
import ReviewSubmission from "./steps/ReviewSubmission";
import NavigationButtons from "./NavigationButtons";
import { ComplaintData } from "./types";

const initialForm: ComplaintData = {
  complaintType: "",
  category: "",
  priority: "Medium",
  incidentDate: "",
  incidentTime: "",
  location: "",
  description: "",
  aiSummary: "",
  officerNotes: "",
  complainantName: "",
  complainantContact: "",
  complainantRelationship: "",
  complainantStatement: "",
  victimType: "",
  victimName: "",
  victimContact: "",
  victimStatement: "",
  suspectType: "",
  suspectName: "",
  suspectContact: "",
  suspectDescription: "",
  suspectStatus: "",
};

export default function ComplaintWizard() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<ComplaintData>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = 6;

  function handleNext() {
    if (step < totalSteps) setStep(step + 1);
  }

  function handleBack() {
    if (step > 1) setStep(step - 1);
  }

  function handleSubmit() {
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center rounded-[32px] border border-emerald-200 bg-white p-10 text-center shadow-xl">
        <div className="rounded-full bg-emerald-100 p-4 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="mt-6 text-3xl font-semibold text-slate-900">Complaint registered successfully</h1>
        <p className="mt-3 max-w-xl text-sm text-slate-600">
          The complaint has been saved to the registry and is ready for review by the assigned team.
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setStep(1);
            setForm(initialForm);
          }}
          className="mt-8 rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Register another complaint
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-8 lg:p-10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">Complaint register</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Register a new complaint</h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            Follow the guided steps below to capture evidence, complainant information, and case notes in one place.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Step {step} of {totalSteps}
        </div>
      </div>

      <div className="mt-8">
        <Stepper currentStep={step} />
      </div>

      <div className="mt-10">
        {step === 1 && <FileUploader />}
        {step === 2 && <ComplaintDetails form={form} setForm={setForm} />}
        {step === 3 && <VictimDetails form={form} setForm={setForm} />}
        {step === 4 && <SuspectDetails form={form} setForm={setForm} />}
        {step === 5 && <ComplainantDetails form={form} setForm={setForm} />}
        {step === 6 && <ReviewSubmission form={form} />}
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
