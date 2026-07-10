interface Props {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export default function NavigationButtons({ currentStep, totalSteps, onBack, onNext, onSubmit }: Props) {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
      <button
        type="button"
        onClick={onBack}
        disabled={currentStep === 1}
        className="rounded-full border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-50"
      >
        Back
      </button>

      {currentStep === totalSteps ? (
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-full bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Submit complaint
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          className="rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
        >
          Continue
        </button>
      )}
    </div>
  );
}
