"use client";

import { motion } from "framer-motion";
import { Specifications } from "@/lib/schemas";

export default function SpecsTable({ specs }: { specs: Specifications }) {
  return (
    <div className="technical-card overflow-hidden border-slate-200">
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
        <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">Technical Specifications</span>
        <span className="text-[10px] font-mono text-blue-400">STATUS: VALID</span>
      </div>
      <table className="w-full text-left border-collapse">
        <tbody className="divide-y divide-slate-100">
          {Object.entries(specs).map(([key, value], index) => (
            <motion.tr
              key={key}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="spec-row group"
            >
              <td className="px-4 py-3 font-mono text-[11px] text-slate-500 uppercase bg-slate-50/50 w-1/3 border-r border-slate-100">
                {key}
              </td>
              <td className="px-4 py-3 font-mono text-xs font-bold text-slate-800">
                {value}
                <motion.div 
                  className="h-[2px] bg-blue-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
