import Sidebar from "@/components/layout/io/Sidebar";
import Navbar from "@/components/layout/shared/Navbar";
import DashboardCard from "@/components/dashboard/DashboardCard";
import RecentComplaint from "@/components/dashboard/RecentComplaint";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import CaseListPanel from "@/components/dashboard/CaseListPanel";
import { useLanguage } from "@/app/providers/LanguageProvider";

export const dynamic = 'force-dynamic';

export default function Dashboard() {
  const { t } = useLanguage();

  const stats = [
    {
      title: t("todaysComplaints", "dashboard"),
      value: "124",
      subtitle: t("todaysComplaintsSubtitle", "dashboard"),
      accent: "bg-blue-600",
    },
    {
      title: t("pendingReview", "dashboard"),
      value: "36",
      subtitle: t("pendingReviewSubtitle", "dashboard"),
      accent: "bg-amber-500",
    },
    {
      title: t("closedCases", "dashboard"),
      value: "88",
      subtitle: t("closedCasesSubtitle", "dashboard"),
      accent: "bg-emerald-500",
    },
    {
      title: t("highRisk", "dashboard"),
      value: "12",
      subtitle: t("highRiskSubtitle", "dashboard"),
      accent: "bg-rose-500",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="space-y-6 p-6 lg:p-8">
          <section className="rounded-[32px] bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-8 text-white shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">{t("appName","dashboard")}</p>
                <h1 className="mt-2 text-3xl font-semibold">{t("commandCenter","dashboard")}</h1>
                <p className="mt-3 max-w-2xl text-sm text-blue-50/90">
                  {t("dashboardDescription","dashboard")}
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur">
                <p className="font-semibold">{t("liveSync","dashboard")}</p>
                <p className="mt-1 text-blue-50">{t("newEntriesLastHour","dashboard")}</p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <DashboardCard key={stat.title} {...stat} />
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
            <RecentComplaint />
            <ActivityFeed />
          </section>

          <section>
            <CaseListPanel />
          </section>
        </div>
      </main>
    </div>
  );
}