"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function TechGrid() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 15,
        y: (e.clientY / window.innerHeight - 0.5) * 15,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-[-2] opacity-40"
      animate={{
        x: mousePos.x,
        y: mousePos.y,
      }}
      transition={{ type: "spring", damping: 30, stiffness: 50 }}
      style={{
        backgroundImage: "radial-gradient(circle at center, var(--blueprint-grid) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    />
  );
}
