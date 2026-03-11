"use client";

import { cn } from "@/lib/utils";

/** X-inspired icon with ROBOGUIDE flair: circuit/tech aesthetic */
export function RoboIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-sm",
        className
      )}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-[55%] h-[55%]"
        aria-hidden
      >
        {/* X shape - bold strokes with circuit node at center */}
        <path
          d="M5 5l5.5 5.5M19 19l-5.5-5.5M19 5l-5.5 5.5M5 19l5.5-5.5"
          stroke="url(#robo-x-gradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Center node - circuit board feel */}
        <circle
          cx="12"
          cy="12"
          r="2"
          fill="url(#robo-x-gradient)"
        />
        <defs>
          <linearGradient id="robo-x-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
