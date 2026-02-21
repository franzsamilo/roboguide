"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { RegistryItem } from "@/lib/schemas";
import { ArrowUpRight, Cpu, Radio, Zap } from "lucide-react";

export default function RegistryCard({ item }: { item: RegistryItem }) {
  const Icon = item.category === "mcu" ? Cpu : item.category === "sensor" ? Radio : Zap;

  return (
    <Link href={`/wiki/${item.slug}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="technical-card group overflow-hidden border-slate-200 hover:border-blue-500 transition-colors"
      >
        <div className="relative h-40 bg-slate-50 border-b border-inherit overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ 
            backgroundImage: "radial-gradient(circle at center, #334155 1px, transparent 1px)",
            backgroundSize: "10px 10px"
          }} />
          
          {item.image ? (
            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-4 mix-blend-multiply" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Icon className="h-12 w-12 text-slate-200 group-hover:text-blue-100 transition-colors" />
            </div>
          )}

          <div className="absolute top-2 right-2">
            <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest">
              {item.category}
            </span>
            <span className="text-[10px] font-mono text-slate-400">ID: {item.slug.slice(0, 8)}</span>
          </div>
          
          <h3 className="text-sm font-bold font-sans text-slate-800 mb-2 truncate">
            {item.name}
          </h3>

          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200">
                {tag.toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Technical Corner Accent */}
        <div className="absolute bottom-0 right-0 w-4 h-4 overflow-hidden pointer-events-none">
          <div className="absolute bottom-[-10px] right-[-10px] w-5 h-5 border-[1px] border-blue-500 rotate-45 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </motion.div>
    </Link>
  );
}
