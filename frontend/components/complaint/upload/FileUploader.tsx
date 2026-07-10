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

import {
  ComplaintData,
  AttachmentMeta,
} from "../types";

interface UploadedFile {
  id: number;
  file: File;
}

interface Props {
  form: ComplaintData;
  setForm: React.Dispatch<
    React.SetStateAction<ComplaintData>
  >;
  onExtractComplete?: () => void;
}

export default function FileUploader({
  form,
  setForm,
  onExtractComplete,
}: Props) {

  const [files, setFiles] = useState<UploadedFile[]>([]);

  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {

    const uploaded = acceptedFiles.map((file) => ({
      id: Date.now() + Math.random(),
      file,
    }));

    setFiles((prev) => [...prev, ...uploaded]);

  }, []);

  const {

    getRootProps,

    getInputProps,

    isDragActive,

  } = useDropzone({

    onDrop,

    multiple: true,

    accept: {

      "application/pdf": [".pdf"],

      "image/*": [],

      "audio/*": [],

      "video/*": [],

      "application/msword": [".doc"],

      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],

      "text/plain": [".txt"],

    },

  });

  function removeFile(id: number) {

    setFiles((prev) =>
      prev.filter((f) => f.id !== id)
    );

  }

  function getIcon(type: string) {

    if (type.startsWith("image"))
      return <ImageIcon className="text-blue-600" />;

    if (type.startsWith("audio"))
      return <Music className="text-green-600" />;

    if (type.startsWith("video"))
      return <Video className="text-red-600" />;

    return <FileText className="text-orange-500" />;
  }

  async function extractDocuments() {
  if (files.length === 0) {
    alert("Please upload at least one document.");
    return;
  }

  setLoading(true);

  try {
    const attachments: AttachmentMeta[] = [];

    // This will contain the merged extraction from all uploaded files
    const mergedExtraction: Partial<ComplaintData> = {
      complainants: [],
      victims: [],
      suspects: [],
    };

    for (const item of files) {
      const formData = new FormData();

      formData.append("file", item.file);

      const response = await axios.post(
        "http://localhost:8000/api/complaints/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const extraction = response.data.extraction ?? {};

      attachments.push({
        id: String(item.id),
        fileName: item.file.name,
        fileType: item.file.type,
        documentUrl: response.data.cloudinaryUrl,
        extractedText: extraction.description ?? "",
        summary: extraction.aiSummary ?? "",
      });

      // ---------- Merge simple fields ----------

      if (!mergedExtraction.complaintType)
        mergedExtraction.complaintType = extraction.complaintType;

      if (!mergedExtraction.category)
        mergedExtraction.category = extraction.category;

      if (!mergedExtraction.priority)
        mergedExtraction.priority = extraction.priority;

      if (!mergedExtraction.incidentDate)
        mergedExtraction.incidentDate = extraction.incidentDate;

      if (!mergedExtraction.incidentTime)
        mergedExtraction.incidentTime = extraction.incidentTime;

      if (!mergedExtraction.location)
        mergedExtraction.location = extraction.location;

      if (!mergedExtraction.description)
        mergedExtraction.description = extraction.description;

      if (!mergedExtraction.aiSummary)
        mergedExtraction.aiSummary = extraction.aiSummary;

      if (!mergedExtraction.officerNotes)
        mergedExtraction.officerNotes = extraction.officerNotes;

      // ---------- Merge Arrays ----------

      if (extraction.complainants?.length) {
        mergedExtraction.complainants = [
          ...(mergedExtraction.complainants || []),
          ...extraction.complainants,
        ];
      }

      if (extraction.victims?.length) {
        mergedExtraction.victims = [
          ...(mergedExtraction.victims || []),
          ...extraction.victims,
        ];
      }

      if (extraction.suspects?.length) {
        mergedExtraction.suspects = [
          ...(mergedExtraction.suspects || []),
          ...extraction.suspects,
        ];
      }

      console.log("Extraction", extraction);

      console.log("Raw AI", response.data.raw_ai);
    }

    setForm((prev) => ({
      ...prev,

      ...mergedExtraction,

      complainants:
        mergedExtraction.complainants?.length
          ? mergedExtraction.complainants
          : prev.complainants,

      victims:
        mergedExtraction.victims?.length
          ? mergedExtraction.victims
          : prev.victims,

      suspects:
        mergedExtraction.suspects?.length
          ? mergedExtraction.suspects
          : prev.suspects,

      attachments: [
        ...prev.attachments,
        ...attachments,
      ],
    }));

    setFiles([]);

    alert("AI Extraction Completed");

    if (onExtractComplete) {
      onExtractComplete();
    }
  } catch (error) {
    console.error(error);

    alert("Document extraction failed.");
  } finally {
    setLoading(false);
  }
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