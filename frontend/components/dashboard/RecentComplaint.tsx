import { useLanguage } from "@/app/providers/LanguageProvider";

export default function RecentComplaint() {
  const { t } = useLanguage();

  const complaints = [
    { id: "CC-1024", title: t("fraudulentLoanApplication", "dashboard"), status: t("pendingReview", "dashboard"), risk: t("high", "common") },
    { id: "CC-1018", title: t("missingPropertyReport", "dashboard"), status: t("escalated", "dashboard"), risk: t("medium", "common") },
    { id: "CC-1007", title: t("cyberHarassmentComplaint", "dashboard"), status: t("resolved", "dashboard"), risk: t("low", "common") },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{t("registry", "dashboard")}</p>
          <h3 className="text-lg font-semibold text-slate-900">{t("complainttitle", "dashboard")}</h3>
        </div>
        <button className="text-sm font-medium text-blue-600">{t("viewAll", "common")}</button>
      </div>

      <div className="mt-6 space-y-3">
        {complaints.map((complaint) => (
          <div key={complaint.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
            <div>
              <p className="font-medium text-slate-900">{complaint.title}</p>
              <p className="text-sm text-slate-500">{complaint.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-slate-700">{complaint.status}</p>
              <p className="text-sm text-slate-500">{complaint.risk}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
