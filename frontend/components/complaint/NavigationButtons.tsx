"use client";

import { useLanguage } from "@/app/providers/LanguageProvider";

interface Props {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  onSaveDraft?: () => void;
}

export default function NavigationButtons({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  onSaveDraft,
}: Props) {
  const { t } = useLanguage();

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        disabled={currentStep === 1}
        className="rounded-full border border-slate-300 px-5 py-3 text-base font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {t("navigation.back", "complaints")}
      </button>

      <div className="flex gap-3">
        {onSaveDraft && (
          <button
            type="button"
            onClick={onSaveDraft}
            className="rounded-full border border-orange-400 bg-orange-50 px-5 py-3 text-base font-medium text-orange-700 transition hover:bg-orange-100"
          >
            {t("navigation.saveDraft", "complaints")}
          </button>
        )}

        {currentStep === totalSteps ? (
          <button
            type="button"
            onClick={onSubmit}
            className="rounded-full bg-blue-600 px-5 py-3 text-base font-medium text-white transition hover:bg-blue-700"
          >
            {t("navigation.submitComplaint", "complaints")}
          </button>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="rounded-full bg-slate-900 px-5 py-3 text-base font-medium text-white transition hover:bg-slate-700"
          >
            {t("navigation.continue", "complaints")}
          </button>
        )}
      </div>
    </div>
  );
}