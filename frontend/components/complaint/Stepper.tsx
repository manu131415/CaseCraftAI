"use client";

import { useLanguage } from "@/app/providers/LanguageProvider";

interface Props {
  currentStep: number;
}

export default function Stepper({ currentStep }: Props) {
  const { t } = useLanguage();

  const steps = [
    t("steps.complaint", "complaints"),
    t("steps.complainant", "complaints"),
    t("steps.victims", "complaints"),
    t("steps.suspects", "complaints"),
    t("steps.documents", "complaints", "Documents"), // fallback to "Documents" if translation key doesn't exist
    t("steps.review", "complaints"),
  ];

  return (
    <div className="flex justify-between gap-2">
      {steps.map((step, index) => {
        const isCompleted = currentStep > index;
        const isCurrent = currentStep === index + 1;

        return (
          <div
            key={index}
            className="flex flex-1 flex-col items-center"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold transition-all
                ${
                  isCompleted
                    ? "bg-blue-600 text-white"
                    : isCurrent
                    ? "border-2 border-blue-600 bg-blue-100 text-blue-700"
                    : "bg-gray-300 text-gray-700"
                }`}
            >
              {index + 1}
            </div>

            <p
              className={`mt-2 text-center text-sm font-medium ${
                isCompleted || isCurrent
                  ? "text-blue-700"
                  : "text-gray-600"
              }`}
            >
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
}