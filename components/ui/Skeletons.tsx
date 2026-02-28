"use client";

import { motion } from "framer-motion";

export function CardSkeleton() {
  return (
    <div className="technical-card border-slate-200 overflow-hidden animate-pulse">
      <div className="h-40 bg-slate-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 bg-slate-100 rounded" />
        <div className="h-4 w-3/4 bg-slate-100 rounded" />
        <div className="flex gap-1">
          <div className="h-4 w-12 bg-slate-100 rounded" />
          <div className="h-4 w-16 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-pulse">
      <div className="lg:col-span-5 space-y-8">
        <div className="technical-card aspect-square bg-slate-100" />
        <div className="flex gap-4">
          <div className="w-48 h-32 bg-slate-100 rounded" />
          <div className="w-48 h-32 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="lg:col-span-7 space-y-8">
        <div className="space-y-4">
          <div className="h-4 w-20 bg-slate-100 rounded" />
          <div className="h-10 w-3/4 bg-slate-100 rounded" />
          <div className="h-20 w-full bg-slate-100 rounded" />
        </div>
        <div className="h-48 bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="technical-card overflow-hidden border-slate-200 animate-pulse">
      <div className="bg-slate-900 h-8" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex border-b border-slate-100">
          <div className="w-1/3 px-4 py-3 bg-slate-50/50">
            <div className="h-3 w-16 bg-slate-200 rounded" />
          </div>
          <div className="w-2/3 px-4 py-3">
            <div className="h-3 w-24 bg-slate-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="space-y-4 mb-12">
        <div className="h-8 w-64 bg-slate-100 rounded" />
        <div className="h-4 w-96 bg-slate-50 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
