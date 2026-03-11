"use client";

import { motion } from "framer-motion";
import { Specifications } from "@/lib/schemas";

export default function SpecsTable({ specs }: { specs: Specifications }) {
  return (
    <div className="card-flat overflow-hidden">
      <div className="bg-gray-800 px-4 py-2.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-300">Specifications</span>
        <span className="text-xs text-gray-500">{Object.keys(specs).length} entries</span>
      </div>
      <table className="w-full text-left border-collapse">
        <tbody className="divide-y divide-gray-100">
          {Object.entries(specs).map(([key, value], index) => (
            <motion.tr
              key={key}
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-blue-50/50 transition-colors"
            >
              <td className="px-4 py-3 text-sm text-gray-500 bg-gray-50/50 w-1/3 border-r border-gray-100">
                {key}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-gray-800">
                {value}
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
