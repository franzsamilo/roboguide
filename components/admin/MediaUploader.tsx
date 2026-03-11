"use client";

import { useCallback, useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, Film, AlertCircle, Loader2, Link2 } from "lucide-react";
import { uploadFileViaApi } from "@/lib/uploadApi";
import { FILE_LIMITS } from "@/lib/schemas";
import { isYouTubeUrl, getYouTubeVideoId, isVideoUrl, getYouTubeThumbnailUrl } from "@/lib/media-utils";

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
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    setUrls(existingUrls);
  }, [existingUrls]);

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

        uploadFileViaApi(fs.file, basePath, (progress) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === fs.id ? { ...f, progress } : f))
          );
        })
          .then((downloadURL) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fs.id ? { ...f, status: "done", downloadURL, progress: 100 } : f
              )
            );
            setUrls((prev) => {
              const next = [...prev, downloadURL];
              queueMicrotask(() => onChangeRef.current(next));
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
    [files, urls, maxFiles, basePath]
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
      queueMicrotask(() => onChangeRef.current(next));
      return next;
    });
  };

  const addUrl = () => {
    const raw = urlInput.trim();
    setUrlError(null);
    if (!raw) return;
    if (!/^https?:\/\//i.test(raw)) {
      setUrlError("URL must start with http:// or https://");
      return;
    }
    const total = files.length + urls.length;
    if (total >= maxFiles) {
      setUrlError(`Maximum ${maxFiles} items allowed`);
      return;
    }
    if (urls.includes(raw)) {
      setUrlError("URL already added");
      return;
    }
    const next = [...urls, raw];
    setUrls(next);
    queueMicrotask(() => onChangeRef.current(next));
    setUrlInput("");
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

      {/* Or paste URL */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="url"
              placeholder="Or paste URL (image, video, YouTube)"
              value={urlInput}
              onChange={(e) => { setUrlInput(e.target.value); setUrlError(null); }}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            type="button"
            onClick={addUrl}
            disabled={!urlInput.trim() || urls.length + files.length >= maxFiles}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-xs uppercase"
          >
            Add
          </button>
        </div>
        {/* Live preview when pasting a YouTube URL (before clicking Add) */}
        {urlInput.trim().match(/^https?:\/\//i) && (() => {
          const vid = getYouTubeVideoId(urlInput.trim());
          return vid ? (
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
              <img src={getYouTubeThumbnailUrl(vid)} alt="YouTube preview" className="w-20 h-14 object-cover rounded shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700">YouTube video detected</p>
                <p className="text-[10px] text-slate-500 truncate">Click Add to include this video</p>
              </div>
            </div>
          ) : null;
        })()}
      </div>
      {urlError && <p className="text-xs text-red-500">{urlError}</p>}

      {/* Existing URLs */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {urls.map((url) => {
            const videoId = isYouTubeUrl(url) ? getYouTubeVideoId(url) : null;
            const isVideo = isVideoUrl(url);
            return (
              <div key={url} className="relative group technical-card overflow-hidden bg-white">
                <div className="aspect-video w-full">
                  {videoId ? (
                    <>
                      <img src={getYouTubeThumbnailUrl(videoId)} alt="YouTube" className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-medium rounded">YouTube</span>
                    </>
                  ) : isVideo ? (
                    <video src={url} muted preload="metadata" className="w-full h-full object-cover" playsInline />
                  ) : (
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
                <button
                  onClick={() => removeUrl(url)}
                  className="absolute top-1 right-1 p-1.5 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            );
          })}
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
              <ImageIcon className="h-4 w-4 text-slate-400 shrink-0" />
            ) : (
              <Film className="h-4 w-4 text-slate-400 shrink-0" />
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
            {f.status === "uploading" && <Loader2 className="h-4 w-4 text-blue-500 animate-spin shrink-0" />}
            {f.status === "error" && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
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
