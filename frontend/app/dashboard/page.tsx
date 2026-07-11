import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import DashboardCard from "@/components/dashboard/DashboardCard";
import RecentComplaint from "@/components/dashboard/RecentComplaint";
import ActivityFeed from "@/components/dashboard/ActivityFeed";

export const dynamic = 'force-dynamic';

const stats = [
  { title: "Today’s complaints", value: "124", subtitle: "+18% vs yesterday", accent: "bg-blue-600" },
  { title: "Pending review", value: "36", subtitle: "6 require escalation", accent: "bg-amber-500" },
  { title: "Closed cases", value: "88", subtitle: "12 cleared today", accent: "bg-emerald-500" },
  { title: "High risk", value: "12", subtitle: "2 flagged for urgent action", accent: "bg-rose-500" },
];

export default function Dashboard() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1">
        <Navbar />

        <div className="space-y-6 p-6 lg:p-8">
          <section className="rounded-[32px] bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-8 text-white shadow-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">CaseCraftAI</p>
                <h1 className="mt-2 text-3xl font-semibold">Command center for complaint operations</h1>
                <p className="mt-3 max-w-2xl text-sm text-blue-50/90">
                  Monitor incoming complaints, review flagged evidence, and keep your field team aligned from one place.
                </p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm backdrop-blur">
                <p className="font-semibold">Live sync</p>
                <p className="mt-1 text-blue-50">12 new entries in the last hour</p>
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
        </div>
      </main>
    </div>
  );
}