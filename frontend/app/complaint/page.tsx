import ComplaintWizard from "@/components/complaint/ComplaintWizard";

export default function ComplaintPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_60%)] px-4 py-8 sm:px-6 lg:px-8">
      <ComplaintWizard />
    </div>
  );
}