"use client";

import { FileText, Eye, Pencil, Printer } from "lucide-react";

interface DocumentCardProps {
  title: string;
  description: string;
  status: "Not Generated" | "Draft" | "Final";
  onGenerate: () => void;
  onView?: () => void;
  onEdit?: () => void;
  onPrint?: () => void;
}

export default function DocumentCard({
  title,
  description,
  status,
  onGenerate,
  onView,
  onEdit,
  onPrint,
}: DocumentCardProps) {
  return (
    <div className="rounded-2xl border border-gray-700 bg-[#121827] p-6 shadow-md">
      <div className="flex items-center gap-3">
        <FileText className="text-cyan-400" size={28} />
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>

      <div className="mt-4">
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            status === "Final"
              ? "bg-green-500/20 text-green-400"
              : status === "Draft"
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          {status}
        </span>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {status === "Not Generated" ? (
          <button
            onClick={onGenerate}
            className="rounded-lg bg-cyan-600 px-4 py-2 text-white hover:bg-cyan-700"
          >
            Generate
          </button>
        ) : (
          <>
            <button
              onClick={onView}
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-white"
            >
              <Eye size={16} />
              View
            </button>

            <button
              onClick={onEdit}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white"
            >
              <Pencil size={16} />
              Edit
            </button>

            <button
              onClick={onPrint}
              className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-white"
            >
              <Printer size={16} />
              Print
            </button>
          </>
        )}
      </div>
    </div>
  );
}