interface DashboardCardProps {
  title: string;
  value: string;
  subtitle: string;
  accent: string;
}

export default function DashboardCard({ title, value, subtitle, accent }: DashboardCardProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className={`mb-4 h-2 w-16 rounded-full ${accent}`} />
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
