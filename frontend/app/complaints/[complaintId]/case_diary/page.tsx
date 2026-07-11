'use client';

export default function CaseDiaryPage({
  params,
}: {
  params: { complaintId: string };
}) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Case Diary - {params.complaintId}</h1>
      <p className="text-slate-600 mt-2">Case diary content will be displayed here.</p>
    </div>
  );
}