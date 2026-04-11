"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Loader2, FileText } from "lucide-react";
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
  label,
}: SingleFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clean up local preview URL on unmount
  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const handleFile = async (file: File) => {
    setError(null);
    if (file.type.startsWith("image/")) {
      if (localPreview) URL.revokeObjectURL(localPreview);
      setLocalPreview(URL.createObjectURL(file));
    }
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

  const isImage = accept === "image" || accept === "image,pdf";
  const isPdf = value.match(/\.pdf(\?|$)/i) || accept === "pdf";
  const previewUrl = localPreview || (value && !isPdf ? value : null);

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      {isImage && previewUrl && (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Preview"
            className="max-h-48 max-w-full rounded-lg border border-slate-200 object-contain bg-slate-50"
          />
          <button
            type="button"
            onClick={() => {
              if (localPreview) URL.revokeObjectURL(localPreview);
              setLocalPreview(null);
              onChange("");
            }}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow hover:bg-red-600"
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          )}
        </div>
      )}

      {isPdf && value && (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm text-blue-600"
        >
          <FileText className="h-4 w-4" />
          View uploaded PDF
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); onChange(""); }}
            className="ml-2 p-0.5 text-slate-400 hover:text-red-500"
            aria-label="Remove PDF"
          >
            <X className="h-3 w-3" />
          </button>
        </a>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) handleFile(f);
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg px-4 py-3 text-center cursor-pointer transition-all ${
          dragOver ? "border-blue-500 bg-blue-50/50" : "border-slate-300 hover:border-slate-400 bg-slate-50/30"
        } ${uploading ? "pointer-events-none opacity-60" : ""}`}
      >
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
        <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <span>{uploading ? "Uploading..." : "Drop file here or click to browse"}</span>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
