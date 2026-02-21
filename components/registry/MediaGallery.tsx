"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { Maximize2, X } from "lucide-react";

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
            className="flex-shrink-0 w-48 h-32 technical-card cursor-pointer group relative bg-white"
          >
            <img src={url} alt={`Hardware view ${i}`} className="w-full h-full object-cover p-2 mix-blend-multiply" />
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
          <motion.img
            layoutId={selected}
            src={selected}
            className="max-w-full max-h-full object-contain technical-card p-4 bg-white"
          />
        </motion.div>
      )}
    </>
  );
}
