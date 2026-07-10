"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";

import {
  UploadCloud,
  FileText,
  ImageIcon,
  Music,
  Video,
  Trash2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import { ComplaintData, AttachmentMeta } from "../types";

interface UploadedFile {
  id: number;
  file: File;
  category: string;
}

interface Props {
  form: ComplaintData;
  setForm: React.Dispatch<React.SetStateAction<ComplaintData>>;
}

export default function FileUploader({ form, setForm }: Props) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploaded = acceptedFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      category: "Unknown",
    }));

    setFiles((prev) => [...prev, ...uploaded]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [],
      "audio/*": [],
      "video/*": [],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
  });

  function removeFile(id: number) {
    setFiles(files.filter((file) => file.id !== id));
  }

  async function extractDocuments() {
    if (files.length === 0) {
      alert("Please upload at least one document.");
      return;
    }

    setLoading(true);

    try {
      const results = await Promise.all(
        files.map(async (item) => {
          const formData = new FormData();
          formData.append("file", item.file);
          const response = await axios.post("http://localhost:8000/api/complaints/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const extraction = response.data.extraction || {};
          const summary = extraction?.text || extraction?.transcript || extraction?.message || "";
          return {
            id: item.id.toString(),
            fileName: item.file.name,
            fileType: item.file.type || "document",
            documentUrl: response.data.cloudinaryUrl,
            extractedText: summary,
            summary: summary.slice(0, 220),
          } as AttachmentMeta;
        })
      );

      setForm((prev) => {
        const mergedAttachments = [...(prev.attachments || []), ...results];
        const firstExtraction = results[0] as AttachmentMeta | undefined;
        const extractionDetails = (firstExtraction?.extractedText || "") as string;
        const parsed = results.reduce<Record<string, unknown>>((acc, result) => {
          const value = result.extractedText || "";
          if (typeof value === "string" && value) {
            acc.summary = [acc.summary, value].filter(Boolean).join("\n\n");
          }
          return acc;
        }, {});

        const incidentDescription = extractionDetails || parsed.summary || "";
        const incidentLocation = extractionDetails.match(/location[:\s-]+([^\n]+)/i)?.[1]?.trim() || "";
        const complainantName = extractionDetails.match(/complainant[:\s-]+([^\n]+)/i)?.[1]?.trim() || "";
        const phoneMatch = extractionDetails.match(/(?:phone|contact)[:\s-]+([^\n]+)/i)?.[1]?.trim() || "";
        const accusedName = extractionDetails.match(/accused[:\s-]+([^\n]+)/i)?.[1]?.trim() || "";

        const nextComplainants = prev.complainants?.length ? [...prev.complainants] : [{ name: "", contact: "", relationship: "", statement: "" }];
        if (nextComplainants[0]) {
          nextComplainants[0] = {
            ...nextComplainants[0],
            name: nextComplainants[0].name || complainantName,
            contact: nextComplainants[0].contact || phoneMatch,
            statement: nextComplainants[0].statement || incidentDescription,
          };
        }

        const nextVictims = prev.victims?.length ? [...prev.victims] : [{ type: "", name: "", contact: "", statement: "" }];
        if (nextVictims[0]) {
          nextVictims[0] = {
            ...nextVictims[0],
            name: nextVictims[0].name || accusedName || complainantName,
            contact: nextVictims[0].contact || phoneMatch,
            statement: nextVictims[0].statement || incidentDescription,
          };
        }

        const nextSuspects = prev.suspects?.length ? [...prev.suspects] : [{ type: "", name: "", contact: "", description: "", status: "" }];
        if (nextSuspects[0]) {
          nextSuspects[0] = {
            ...nextSuspects[0],
            name: nextSuspects[0].name || accusedName || "",
            contact: nextSuspects[0].contact || phoneMatch,
            description: nextSuspects[0].description || incidentDescription,
          };
        }

        return {
          ...prev,
          attachments: mergedAttachments,
          description: prev.description || incidentDescription,
          aiSummary: prev.aiSummary || incidentDescription,
          location: prev.location || incidentLocation,
          complainants: nextComplainants,
          victims: nextVictims,
          suspects: nextSuspects,
        };
      });
      setFiles([]);
      alert("AI Extraction Completed");
    } catch (error) {
      console.error(error);
      alert("Extraction failed. Check the backend logs.");
    } finally {
      setLoading(false);
    }
  }

  function getIcon(type: string) {
    if (type.startsWith("image")) return <ImageIcon className="text-blue-600" />;
    if (type.startsWith("audio")) return <Music className="text-green-600" />;
    if (type.startsWith("video")) return <Video className="text-red-600" />;
    return <FileText className="text-orange-500" />;
  }

  return (
    <div className="space-y-8">
      {/* Upload Card */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 transition cursor-pointer
        ${
          isDragActive
            ? "border-blue-600 bg-blue-50"
            : "border-gray-300 hover:border-blue-500 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          <UploadCloud size={60} className="text-blue-600" />

          <h2 className="text-2xl font-semibold mt-4">
            Upload Complaint Documents
          </h2>

          <p className="text-base text-gray-500 mt-2 text-center">
            Drag & Drop PDF, Images, Audio, Video or Documents
          </p>

          <button
            type="button"
            className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg"
          >
            Browse Files
          </button>

          <p className="text-base text-gray-400 mt-3">
            Supports PDF • JPG • PNG • MP3 • MP4 • DOCX
          </p>
        </div>
      </div>

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="border-b px-6 py-4">
            <h3 className="font-semibold text-lg">
              Uploaded Evidence ({files.length})
            </h3>
          </div>

          <div className="divide-y">
            {files.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center px-6 py-4"
              >
                <div className="flex gap-4 items-center">
                  {getIcon(item.file.type)}

                  <div>
                    <p className="font-medium">{item.file.name}</p>

                    <p className="text-base text-gray-500">
                      {(item.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <div className="flex gap-6 items-center">
                  <span className="text-base bg-gray-100 px-3 py-1 rounded-full">
                    {item.category}
                  </span>

                  <button
                    onClick={() => removeFile(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Card */}
      <div className="rounded-xl border bg-indigo-50 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg">
              AI Document Extraction
            </h3>

            <p className="text-gray-600 mt-2">
              Extract complaint details and automatically classify uploaded
              documents into evidence categories.
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex gap-2 items-center">
                <CheckCircle2 className="text-green-600" size={18} />
                OCR Text Extraction
              </div>

              <div className="flex gap-2 items-center">
                <CheckCircle2 className="text-green-600" size={18} />
                Speech-to-Text
              </div>

              <div className="flex gap-2 items-center">
                <CheckCircle2 className="text-green-600" size={18} />
                Entity Recognition
              </div>

              <div className="flex gap-2 items-center">
                <CheckCircle2 className="text-green-600" size={18} />
                Evidence Classification
              </div>
            </div>
          </div>

          <button
            onClick={extractDocuments}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex gap-2 items-center disabled:opacity-50"
          >
            <Sparkles size={20} />

            {loading ? "Extracting..." : "Extract From Documents"}
          </button>
        </div>
      </div>
    </div>
  );
}