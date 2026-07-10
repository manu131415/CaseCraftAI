import Link from "next/link";
import { ArrowRight, FileSignature, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";

const features = [
  {
    title: "Complaint intake",
    description: "Capture complaint details, location, and urgency in a guided flow.",
    icon: FileSignature,
  },
  {
    title: "Live operations",
    description: "Track rising cases and high-risk complaints from the dashboard view.",
    icon: LayoutDashboard,
  },
  {
    title: "AI assisted review",
    description: "Use automated extraction to summarize evidence and support investigators.",
    icon: Sparkles,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.18),_transparent_35%),linear-gradient(135deg,_#f8fbff,_#eef4ff)] px-4 py-8 text-slate-800 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <section className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                <ShieldCheck className="h-4 w-4" />
                Secure, guided complaint management
              </div>
              <h1 className="mt-6 text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">
                Streamline case registration and investigation workflows.
              </h1>
              <p className="mt-5 max-w-2xl text-lg text-slate-600">
                CaseCraftAI helps investigators intake complaints quickly, organize evidence, and monitor the most urgent matters from one polished dashboard.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/complaint"
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 font-medium text-white transition hover:bg-blue-700"
                >
                  Register complaint <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-slate-200 bg-white px-5 py-3 font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
                >
                  Open dashboard
                </Link>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Today’s snapshot</p>
                  <p className="mt-2 text-3xl font-semibold">124 cases</p>
                </div>
                <div className="rounded-2xl bg-blue-600/20 p-3 text-blue-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <div className="rounded-2xl bg-slate-900/70 p-4">
                  <p className="text-sm text-slate-400">High priority queue</p>
                  <p className="mt-2 text-xl font-semibold">12 urgent reviews</p>
                </div>
                <div className="rounded-2xl bg-slate-900/70 p-4">
                  <p className="text-sm text-slate-400">AI document extraction</p>
                  <p className="mt-2 text-xl font-semibold">96% auto-classified</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="inline-flex rounded-2xl bg-blue-50 p-3 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-slate-900">{feature.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
