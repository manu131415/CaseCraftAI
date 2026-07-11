'use client';

export default function LegalSectionsPage({
  params,
}: {
  params: { complaintId: string };
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Legal Sections - {params.complaintId}</h1>
      <p className="text-slate-600 mt-2">Legal sections will be displayed here.</p>
    </div>
  );
}
