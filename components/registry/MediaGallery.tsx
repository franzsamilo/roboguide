"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Maximize2, X } from "lucide-react";
import { isYouTubeUrl, getYouTubeVideoId, isVideoUrl, getYouTubeThumbnailUrl } from "@/lib/media-utils";

function MediaThumbnail({ url, index }: { url: string; index: number }) {
  const videoId = isYouTubeUrl(url) ? getYouTubeVideoId(url) : null;
  const isVideo = isVideoUrl(url);
  const isImage = !videoId && !isVideo;

  if (videoId) {
    return (
      <img
        src={getYouTubeThumbnailUrl(videoId)}
        alt={`YouTube thumbnail ${index}`}
        className="w-full h-full object-cover p-2 mix-blend-multiply"
      />
    );
  }
  if (isVideo) {
    return (
      <video
        src={url}
        muted
        preload="metadata"
        className="w-full h-full object-cover p-2"
        playsInline
      />
    );
  }
  return (
    <img src={url} alt={`Hardware view ${index}`} className="w-full h-full object-cover p-2 mix-blend-multiply" />
  );
}

function LightboxContent({ url }: { url: string }) {
  const videoId = isYouTubeUrl(url) ? getYouTubeVideoId(url) : null;
  const isVideo = isVideoUrl(url);
  const isImage = !videoId && !isVideo;

  if (videoId) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full aspect-video max-w-4xl technical-card bg-black"
      />
    );
  }
  if (isVideo) {
    return (
      <video
        src={url}
        controls
        autoPlay
        playsInline
        className="max-w-full max-h-full object-contain technical-card p-4 bg-white"
      />
    );
  }
  return (
    <img
      src={url}
      alt="Media"
      className="max-w-full max-h-full object-contain technical-card p-4 bg-white"
    />
  );
}

export default function MediaGallery({ urls }: { urls: string[] }) {
  const [selected, setSelected] = useState<string | null>(null);

  if (!urls.length) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {urls.map((url, i) => (
          <motion.div
            key={url}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelected(url)}
            className="shrink-0 w-48 h-32 technical-card cursor-pointer group relative bg-white"
          >
            <MediaThumbnail url={url} index={i} />
            <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center">
              <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-8"
          onClick={() => setSelected(null)}
        >
          <button className="absolute top-8 right-8 text-white hover:text-blue-400">
            <X className="h-8 w-8" />
          </button>
          <div onClick={(e) => e.stopPropagation()}>
            <LightboxContent url={selected} />
          </div>
        </motion.div>
      )}
    </>
  );
}
