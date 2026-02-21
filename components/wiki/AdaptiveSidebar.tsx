"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Filter, Tag, Cpu, Zap, Radio } from "lucide-react";

interface Category {
  id: string;
  name: string;
  count: number;
}

export default function AdaptiveSidebar({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}: { 
  categories: Category[], 
  activeCategory: string | null,
  onCategoryChange: (id: string | null) => void
}) {
  return (
    <aside className="w-full md:w-64 flex-shrink-0">
      <div className="technical-card p-6 border-slate-200">
        <div className="flex items-center gap-2 mb-6 text-slate-400">
          <Filter className="h-4 w-4" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">Registry Filters</span>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full text-left px-3 py-2 font-mono text-xs flex items-center justify-between transition-all ${
              activeCategory === null ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <Tag className="h-3 w-3" />
              <span>ALL COMPONENTS</span>
            </div>
          </button>

          <AnimatePresence mode="popLayout">
            {categories.map((cat) => (
              <motion.button
                layout
                key={cat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => onCategoryChange(cat.id)}
                className={`w-full text-left px-3 py-2 font-mono text-xs flex items-center justify-between transition-all ${
                  activeCategory === cat.id ? "bg-blue-600 text-white" : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                <div className="flex items-center gap-2">
                  {cat.id === "mcu" && <Cpu className="h-3 w-3" />}
                  {cat.id === "sensor" && <Radio className="h-3 w-3" />}
                  {cat.id === "power" && <Zap className="h-3 w-3" />}
                  <span>{cat.name.toUpperCase()}</span>
                </div>
                <span className="opacity-50">[{cat.count}]</span>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="text-[10px] text-slate-400 font-mono mb-4 uppercase tracking-[0.2em]">System Status</div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-green-500">
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            FIREBASE_LIVE: 104.2ms
          </div>
        </div>
      </div>
    </aside>
  );
}
