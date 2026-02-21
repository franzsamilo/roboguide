"use client";

import { motion } from "framer-motion";

export default function TraceLineSVG() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
      <svg width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="none">
        <motion.path
          d="M0 500 L200 500 L250 450 L750 450 L800 500 L1000 500"
          stroke="var(--trace-glow)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        />
        <motion.circle
          cx="250" cy="450" r="3"
          fill="var(--trace-glow)"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle
          cx="750" cy="450" r="3"
          fill="var(--trace-glow)"
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, delay: 1, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}
