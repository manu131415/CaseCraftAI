interface OrganizationCardProps {
  name: string;
  type: string;
  summary: string;
}

export default function OrganizationCard({ name, type, summary }: OrganizationCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-semibold text-slate-900">{name}</p>
      <p className="mt-1 text-sm text-blue-600">{type}</p>
      <p className="mt-2 text-sm text-slate-500">{summary}</p>
    </div>
  );
}
