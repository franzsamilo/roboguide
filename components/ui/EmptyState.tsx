"use client";

import { motion } from "framer-motion";
import { ServerCrash } from "lucide-react";
import Link from "next/link";

export default function EmptyState({
  title = "NO_RECORDS_FOUND",
  message = "There are no items matching your criteria.",
  actionLabel,
  actionHref,
  icon: Icon = ServerCrash,
}: {
  title?: string;
  message?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="technical-card p-16 text-center border-dashed border-slate-300"
    >
      <Icon className="h-12 w-12 text-slate-200 mx-auto mb-4" />
      <p className="font-mono text-sm text-slate-400 uppercase mb-2">{title}</p>
      <p className="text-sm text-slate-500 font-sans max-w-md mx-auto mb-6">{message}</p>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
        >
          {actionLabel}
        </Link>
      )}
    </motion.div>
  );
}
