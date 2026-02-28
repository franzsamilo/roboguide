"use client";

import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorState({
  title = "SYSTEM_ERROR",
  message = "Something went wrong. Please try again.",
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="technical-card p-12 text-center border-red-200"
    >
      <AlertTriangle className="h-12 w-12 text-red-300 mx-auto mb-4" />
      <p className="font-mono text-sm text-red-500 uppercase mb-2">{title}</p>
      <p className="text-sm text-slate-500 font-sans mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 border border-red-200 text-red-600 font-mono text-xs font-bold uppercase hover:bg-red-50 transition-all"
        >
          <RefreshCw className="h-4 w-4" /> Retry
        </button>
      )}
    </motion.div>
  );
}
