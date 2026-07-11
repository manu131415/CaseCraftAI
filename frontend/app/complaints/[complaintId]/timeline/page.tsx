'use client';

export default function TimelinePage({
  params,
}: {
  params: { complaintId: string };
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Timeline - {params.complaintId}</h1>
      <p className="text-slate-600 mt-2">Timeline will be displayed here.</p>
    </div>
  );
}
