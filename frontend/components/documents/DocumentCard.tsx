"use client";

import { FileDown, FileText } from "lucide-react";

interface DocumentCardProps {
  title: string;
  description: string;
  onGenerate: () => void;
}

export default function DocumentCard({
  title,
  description,
  onGenerate,
}: DocumentCardProps) {
  return (
    <div className="rounded-2xl border border-gray-700 bg-[#121827] p-6 shadow-md transition hover:border-cyan-500">
      <div className="flex items-center gap-3">
        <FileText className="text-cyan-400" size={30} />

        <div>
          <h2 className="text-lg font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm text-gray-400">
            {description}
          </p>
        </div>
      </div>

      <button
        onClick={onGenerate}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 font-medium text-white transition hover:bg-cyan-700"
      >
        <FileDown size={18} />
        Generate & Download
      </button>
    </div>
  );
}