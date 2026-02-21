"use client";

import { motion } from "framer-motion";

export const PinoutIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path
      d="M4 8H6M4 12H6M4 16H6M18 8H20M18 12H20M18 16H20M8 6V18H16V6H8Z"
      stroke={active ? "#3B82F6" : "#64748B"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ stroke: active ? "#3B82F6" : "#64748B" }}
    />
  </svg>
);

export const SensorIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.path
      d="M3 12C3 12 5 12 6 10C7 8 8 16 9 14C10 12 12 12 12 12M12 12C12 12 14 12 15 14C16 16 17 8 18 10C19 12 21 12 21 12"
      stroke={active ? "#3B82F6" : "#64748B"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{
        pathLength: active ? [0, 1] : 1,
        stroke: active ? "#3B82F6" : "#64748B"
      }}
      transition={{ duration: 2, repeat: active ? Infinity : 0 }}
    />
  </svg>
);

export const PowerIcon = ({ active }: { active?: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.rect
      x="6" y="7" width="12" height="10" rx="2"
      stroke={active ? "#3B82F6" : "#64748B"}
      strokeWidth="2"
      animate={{ stroke: active ? "#3B82F6" : "#64748B" }}
    />
    <motion.path
      d="M20 10V14M6 12H18"
      stroke={active ? "#3B82F6" : "#64748B"}
      strokeWidth="2"
      animate={{
        opacity: active ? [0.3, 1, 0.3] : 1,
        stroke: active ? "#3B82F6" : "#64748B"
      }}
      transition={{ duration: 1, repeat: Infinity }}
    />
  </svg>
);

export const VoltageIcon = ({ active, value = 0 }: { active?: boolean, value?: number }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="16" rx="2" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="2" />
    <motion.circle cx="12" cy="12" r="6" stroke={active ? "#3B82F6" : "#64748B"} strokeWidth="1" />
    <motion.line
      x1="12" y1="12" x2="16" y2="8"
      stroke={active ? "#3B82F6" : "#64748B"}
      strokeWidth="2"
      animate={{
        rotate: active ? [0, 90, 45, 120, 0] : 0,
        stroke: active ? "#3B82F6" : "#64748B"
      }}
      style={{ originX: "12px", originY: "12px" }}
      transition={{ duration: 4, repeat: active ? Infinity : 0 }}
    />
  </svg>
);
