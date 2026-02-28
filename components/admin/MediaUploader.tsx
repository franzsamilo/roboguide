"use client";

import { useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Film, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { uploadFile } from "@/lib/firebase/storageService";
import { FILE_LIMITS } from "@/lib/schemas";

interface MediaUploaderProps {
  basePath: string;
  existingUrls?: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

interface FileState {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  downloadURL?: string;
  error?: string;
}

export default function MediaUploader({
  basePath,
  existingUrls = [],
  onChange,
  maxFiles = FILE_LIMITS.maxFilesPerUpload,
}: MediaUploaderProps) {
  const [files, setFiles] = useState<FileState[]>([]);
  const [urls, setUrls] = useState<string[]>(existingUrls);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const isImage = (type: string) => FILE_LIMITS.allowedImageTypes.includes(type);
  const isVideo = (type: string) => FILE_LIMITS.allowedVideoTypes.includes(type);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const total = files.length + urls.length;
      const remaining = maxFiles - total;
      if (remaining <= 0) return;

      const newFiles: FileState[] = Array.from(incoming)
        .slice(0, remaining)
        .filter((f) => isImage(f.type) || isVideo(f.type))
        .map((file) => ({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file,
          preview: URL.createObjectURL(file),
          progress: 0,
          status: "pending" as const,
        }));

      setFiles((prev) => [...prev, ...newFiles]);

      // Start uploading each file
      newFiles.forEach((fs) => {
        setFiles((prev) =>
          prev.map((f) => (f.id === fs.id ? { ...f, status: "uploading" } : f))
        );

        const { promise } = uploadFile(fs.file, basePath, (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === fs.id ? { ...f, progress } : f))
          );
        });

        promise
          .then((downloadURL) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fs.id ? { ...f, status: "done", downloadURL, progress: 100 } : f
              )
            );
            setUrls((prev) => {
              const next = [...prev, downloadURL];
              onChange(next);
              return next;
            });
          })
          .catch((error) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fs.id ? { ...f, status: "error", error: error.message } : f
              )
            );
          });
      });
    },
    [files, urls, maxFiles, basePath, onChange]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  };

  const removeUrl = (url: string) => {
    setUrls((prev) => {
      const next = prev.filter((u) => u !== url);
      onChange(next);
      return next;
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <label className="font-mono text-[10px] font-bold uppercase text-slate-500 block">
        Media Files ({urls.length + files.length}/{maxFiles})
      </label>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
          dragOver
            ? "border-blue-500 bg-blue-50/50"
            : "border-slate-300 hover:border-slate-400 bg-slate-50/50"
        }`}
      >
        <Upload className={`h-8 w-8 mx-auto mb-2 ${dragOver ? "text-blue-500" : "text-slate-300"}`} />
        <p className="font-mono text-xs text-slate-500 uppercase">
          Drop files here or click to browse
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          Images (JPEG, PNG, WebP, GIF up to 5MB) • Videos (MP4, WebM up to 50MB)
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={[...FILE_LIMITS.allowedImageTypes, ...FILE_LIMITS.allowedVideoTypes].join(",")}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {/* Existing URLs */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {urls.map((url) => (
            <div key={url} className="relative group technical-card overflow-hidden bg-white">
              <img src={url} alt="" className="w-full h-24 object-cover" />
              <button
                onClick={() => removeUrl(url)}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      <AnimatePresence>
        {files.filter((f) => f.status !== "done").map((f) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200"
          >
            {isImage(f.file.type) ? (
              <ImageIcon className="h-4 w-4 text-slate-400 flex-shrink-0" />
            ) : (
              <Film className="h-4 w-4 text-slate-400 flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono truncate">{f.file.name}</p>
              <div className="h-1 bg-slate-200 mt-1 rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${f.status === "error" ? "bg-red-500" : "bg-blue-500"}`}
                  initial={{ width: "0%" }}
                  animate={{ width: `${f.progress}%` }}
                />
              </div>
            </div>
            {f.status === "uploading" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />}
            {f.status === "error" && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <button onClick={() => removeFile(f.id)} className="text-red-400 hover:text-red-600">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
