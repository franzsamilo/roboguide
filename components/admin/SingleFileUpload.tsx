"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, FileText, Image as ImageIcon } from "lucide-react";
import { uploadFileViaApi } from "@/lib/uploadApi";

interface SingleFileUploadProps {
  basePath: string;
  value: string;
  onChange: (url: string) => void;
  accept?: "image" | "pdf" | "image,pdf";
  label?: string;
}

const ACCEPT_MAP = {
  image: "image/jpeg,image/png,image/webp,image/gif",
  pdf: "application/pdf",
  "image,pdf": "image/jpeg,image/png,image/webp,image/gif,application/pdf",
};

export default function SingleFileUpload({
  basePath,
  value,
  onChange,
  accept = "image",
  label = "Upload file",
}: SingleFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const url = await uploadFileViaApi(file, basePath);
      onChange(url);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="flex gap-2 items-center">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_MAP[accept]}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 text-sm"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {value && (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {value.startsWith("http") && (value.includes(".pdf") || accept === "pdf") ? (
              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
            ) : value.match(/\.(jpg|jpeg|png|webp|gif)/i) ? (
              <ImageIcon className="h-4 w-4 text-slate-400 shrink-0" />
            ) : value.includes("youtube") ? null : (
              <ImageIcon className="h-4 w-4 text-slate-400 shrink-0" />
            )}
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 truncate hover:underline"
            >
              {value.split("/").pop() || "View"}
            </a>
            <button
              type="button"
              onClick={() => onChange("")}
              className="p-1 text-slate-400 hover:text-red-500 shrink-0"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      {value && !value.startsWith("http") && (
        <p className="text-xs text-gray-500">Or paste URL below</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
