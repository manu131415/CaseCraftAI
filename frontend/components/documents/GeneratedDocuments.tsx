"use client";

interface Props {
  documents: any[];
  api: string;
}

export default function GeneratedDocuments({
  documents,
  api,
}: Props) {
  return (
    <div className="mb-10 rounded-2xl border border-slate-700 bg-slate-900 p-6">

      <div className="mb-5 flex items-center justify-between">

        <h2 className="text-xl font-bold text-white">
          Generated Documents
        </h2>

        <span className="rounded-full bg-cyan-700 px-3 py-1 text-sm text-white">
          {documents.length}
        </span>

      </div>

      {documents.length === 0 ? (
        <p className="text-gray-400">
          No generated documents yet.
        </p>
      ) : (
        <div className="space-y-4">

          {documents.map((doc) => (
            <div
              key={doc.document_id}
              className="flex items-center justify-between rounded-xl bg-slate-800 p-4"
            >
              <div>

                <h3 className="font-semibold text-white">
                  {doc.title}
                </h3>

                <p className="text-sm text-gray-400">
                  {doc.document_type}
                </p>

              </div>

              <div className="flex gap-3">

                <button
                  className="rounded bg-cyan-600 px-4 py-2 text-white"
                  onClick={() =>
                    window.open(
                      `${api}/api/documents/download/${doc.document_id}`,
                      "_blank"
                    )
                  }
                >
                  Download
                </button>

              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}