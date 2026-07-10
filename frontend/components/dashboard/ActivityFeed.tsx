import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";

const activities = [
  {
    title: "Case 241 reviewed",
    detail: "High priority evidence uploaded and matched with witness statement.",
    time: "10 min ago",
    icon: CheckCircle2,
    color: "text-emerald-600",
  },
  {
    title: "New follow-up required",
    detail: "Pending inspection assigned to field officer for cyber fraud report.",
    time: "42 min ago",
    icon: AlertCircle,
    color: "text-amber-600",
  },
  {
    title: "Complaint triaged",
    detail: "Automated classification flagged two documents for manual review.",
    time: "1 hr ago",
    icon: Clock3,
    color: "text-blue-600",
  },
];

export default function ActivityFeed() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Activity</p>
          <h3 className="text-lg font-semibold text-slate-900">Recent updates</h3>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {activities.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="flex gap-3 rounded-2xl bg-slate-50 p-4">
              <div className={`mt-1 rounded-full bg-white p-2 ${item.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500">{item.detail}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-400">{item.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
