"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Search, Plus, X, Cpu } from "lucide-react";

type LightItem = { id?: string; slug: string; name: string; category?: string; image?: string };

type Props = {
  items: LightItem[];
  onPick: (item: LightItem) => void;
  excludeSlugs?: string[];
  placeholder?: string;
};

export default function PartPicker({ items, onPick, excludeSlugs = [], placeholder = "Search components..." }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = items.filter((i) => !excludeSlugs.includes(i.slug));
    if (!q) return pool.slice(0, 12);
    return pool
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.slug.toLowerCase().includes(q) ||
          (i.category && i.category.toLowerCase().includes(q))
      )
      .slice(0, 20);
  }, [items, query, excludeSlugs]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="form-input pl-10"
          aria-label="Search components from wiki"
        />
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
          {results.map((item) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => {
                onPick(item);
                setQuery("");
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-blue-50 border-b border-slate-100 last:border-0 text-left transition-colors"
            >
              <div className="w-8 h-8 rounded bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                {item.image ? (
                  <img src={item.image} alt="" className="max-w-full max-h-full object-contain p-0.5" />
                ) : (
                  <Cpu className="h-4 w-4 text-slate-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500 truncate">{item.slug}{item.category ? ` · ${item.category}` : ""}</p>
              </div>
              <Plus className="h-4 w-4 text-blue-500 shrink-0" />
            </button>
          ))}
        </div>
      )}
      {open && results.length === 0 && query.trim() && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg px-3 py-3 text-sm text-gray-500">
          No matches. You can still add this part manually below.
        </div>
      )}
    </div>
  );
}
