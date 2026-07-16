'use client';

export default function DocumentsPage({
  params,
}: {
  params: { complaintId: string };
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Documents - {params.complaintId}</h1>
      <p className="text-slate-600 mt-2">Documents will be displayed here.</p>
    </div>
  );
}