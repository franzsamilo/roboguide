"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Filter, Tag, Cpu, Zap, Radio, Monitor, Cog, Package, Wifi, CircleDot } from "lucide-react";
import type { Category } from "@/lib/schemas";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu, Radio, Zap, Wifi, Monitor, Cog, Package, CircuitBoard: CircleDot,
};

export default function AdaptiveSidebar({
  categories,
  activeCategory,
  onCategoryChange,
}: {
  categories: Category[];
  activeCategory: string | null;
  onCategoryChange: (id: string | null) => void;
}) {
  const totalCount = categories.reduce((sum, c) => sum + c.count, 0);

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="card-flat p-5">
        <div className="flex items-center gap-2 mb-5">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">Filter by Category</span>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange(null)}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-all ${
              activeCategory === null
                ? "bg-blue-600 text-white font-medium"
                : "hover:bg-gray-50 text-gray-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>All Components</span>
            </div>
            <span className={`text-xs ${activeCategory === null ? "text-blue-200" : "text-gray-400"}`}>
              {totalCount}
            </span>
          </button>

          <AnimatePresence mode="popLayout">
            {categories.map((cat) => {
              const IconComponent = ICON_MAP[cat.icon || ""] || Package;
              return (
                <motion.button
                  layout
                  key={cat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => onCategoryChange(cat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-center justify-between transition-all ${
                    activeCategory === cat.id
                      ? "bg-blue-600 text-white font-medium"
                      : "hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span>{cat.name}</span>
                  </div>
                  <span className={`text-xs ${activeCategory === cat.id ? "text-blue-200" : "text-gray-400"}`}>
                    {cat.count}
                  </span>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
