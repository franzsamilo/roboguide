"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { RegistryItem } from "@/lib/schemas";
import { Cpu, Radio, Zap, ArrowRight } from "lucide-react";

export default function RegistryCard({ item }: { item: RegistryItem }) {
  const Icon = item.category === "mcu" ? Cpu : item.category === "sensor" ? Radio : Zap;

  return (
    <Link href={`/wiki/${item.slug}`}>
      <div className="card overflow-hidden h-full group">
        <div className="h-44 bg-gray-50 flex items-center justify-center p-6 border-b border-gray-100 relative overflow-hidden">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <Icon className="h-14 w-14 text-gray-200 group-hover:text-blue-100 transition-colors" />
          )}
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="badge badge-blue text-xs">{item.category}</span>
          </div>

          <h3 className="text-base font-semibold text-gray-900 mb-1.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {item.name}
          </h3>

          {item.description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {item.tags.slice(0, 3).map(tag => (
              <span key={tag} className="badge text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
