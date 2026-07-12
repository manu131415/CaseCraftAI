"use client";

import { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { useLanguage } from "@/app/providers/LanguageProvider";
import { Upload, FileText, ImageIcon, Music, Video, Trash2, Cloud } from "lucide-react";

interface DocumentFile {
  id: string;
  file: File;
  cloudinaryUrl?: string;
  uploading?: boolean;
}

interface Props {
  onDocumentsSubmit: (files: DocumentFile[]) => void;
}

export default function DocumentsAndEvidence({ onDocumentsSubmit }: Props) {
  const { t } = useLanguage();
  const [files, setFiles] = useState<DocumentFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadedFilesState, setUploadedFilesState] = useState<DocumentFile[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      id: String(Date.now() + Math.random()),
      file,
    }));
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".jpg", ".jpeg", ".png", ".gif", ".webp"],
      "audio/*": [".mp3", ".wav", ".aac", ".flac"],
      "video/*": [".mp4", ".mov", ".avi", ".mkv"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
      "text/plain": [".txt"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
    },
  });

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function getIcon(type: string) {
    if (type.startsWith("image")) return <ImageIcon className="text-blue-600" />;
    if (type.startsWith("audio")) return <Music className="text-green-600" />;
    if (type.startsWith("video")) return <Video className="text-red-600" />;
    return <FileText className="text-orange-500" />;
  }

  async function uploadToCloudinary() {
    if (files.length === 0) {
      alert(t("documentsEvidence.selectAtLeast", "complaints"));
      return;
    }

    setUploading(true);

    try {
      const uploadedFiles: DocumentFile[] = [];

      for (const fileItem of files) {
        const formData = new FormData();
        formData.append("file", fileItem.file);

        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";
          const response = await axios.post(`${API_BASE}/api/complaints/upload-evidence`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          uploadedFiles.push({
            ...fileItem,
            cloudinaryUrl: response.data.cloudinaryUrl,
            uploading: false,
          });
        } catch (error) {
          console.error(`Error uploading ${fileItem.file.name}:`, error);
          uploadedFiles.push({
            ...fileItem,
            uploading: false,
          });
        }
      }

      onDocumentsSubmit(uploadedFiles);
      // keep a record of uploaded files in this component so they remain visible
      setUploadedFilesState((prev) => [...prev, ...uploadedFiles]);
      setFiles([]);
      alert(t("documentsEvidence.uploadSuccess", "complaints"));
    } catch (error) {
      console.error("Upload error:", error);
      alert(t("documentsEvidence.uploadError", "complaints"));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <p className="text-base font-medium text-blue-600">{t("documentsEvidence.label", "complaints")}</p>
        <h2 className="mt-1 text-2xl font-semibold text-slate-900">{t("documentsEvidence.heading", "complaints")}</h2>
        <p className="mt-2 text-base text-slate-500">
          {t("documentsEvidence.description", "complaints")}
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? "border-blue-600 bg-blue-50"
            : "border-slate-300 bg-slate-50 hover:border-blue-400"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex justify-center">
          <Upload className="h-12 w-12 text-slate-400" />
        </div>
        <p className="mt-3 text-base font-semibold text-slate-900">
          {isDragActive ? t("documentsEvidence.dropFiles", "complaints") : t("documentsEvidence.dragDrop", "complaints")}
        </p>
        <p className="mt-1 text-base text-slate-500">{t("documentsEvidence.orClick", "complaints")}</p>
        <p className="mt-2 text-sm text-slate-400">
          {t("documentsEvidence.supportedFormats", "complaints")}
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-base font-semibold text-slate-800">
            {t("documentsEvidence.selectedFiles", "complaints")} ({files.length})
          </p>
          <div className="space-y-2">
            {files.map((fileItem) => (
              <div
                key={fileItem.id}
                className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  {getIcon(fileItem.file.type)}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">
                      {fileItem.file.name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(fileItem.id)}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {uploadedFilesState.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-base font-semibold text-slate-800">Uploaded evidence</p>
          <div className="space-y-2">
            {uploadedFilesState.map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  {getIcon(item.file.type)}
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{item.file.name}</p>
                    <p className="text-sm text-slate-500">{item.cloudinaryUrl ? "Uploaded" : "Uploaded (no link)"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {item.cloudinaryUrl ? (
                    <a href={item.cloudinaryUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Open</a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-base text-blue-700">
        <div className="flex items-start gap-3">
          <Cloud className="mt-1 h-5 w-5 flex-shrink-0" />
          <div>
            <p className="font-semibold">{t("documentsEvidence.secureCloud", "complaints")}</p>
            <p className="mt-1 text-sm">
              {t("documentsEvidence.secureClouds", "complaints")}
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <button
          onClick={uploadToCloudinary}
          disabled={uploading}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading
            ? `${t("documentsEvidence.uploading", "complaints")}...`
            : `${t("documentsEvidence.uploadButton", "complaints")} ${files.length} ${
                files.length !== 1
                  ? t("documentsEvidence.files", "complaints")
                  : t("documentsEvidence.file", "complaints")
              }`}
        </button>
      )}
    </div>
  );
}
