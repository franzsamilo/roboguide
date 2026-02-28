"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/ui/Navbar";
import AdaptiveSidebar from "@/components/wiki/AdaptiveSidebar";
import RegistryCard from "@/components/wiki/RegistryCard";
import { Search, Radar, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RegistryItem, Category } from "@/lib/schemas";
import { getRegistryItems, getCategoriesWithCounts } from "@/lib/firebase/registryService";
import { CardSkeleton } from "@/components/ui/Skeletons";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

export default function WikiPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [itemsResult, categoriesResult] = await Promise.all([
        getRegistryItems({ category: activeCategory, searchQuery: search }),
        getCategoriesWithCounts(),
      ]);
      setItems(itemsResult.items);
      setCategories(categoriesResult);
    } catch (err: any) {
      console.error("Failed to fetch registry data:", err);
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCategory]);

  // Client-side search filtering for responsiveness
  const filteredItems = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.tags.some((t) => t.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q))
    );
  }, [items, search]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter mb-2 font-sans uppercase">Hardware Registry</h1>
              <p className="text-slate-500 font-mono text-sm tracking-wide">
                SYSTEM_ACCESS: READ_ONLY // {filteredItems.length} DATABASE_ENTRIES
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="PROXIMITY_SEARCH [TAGS/NAME]..."
                className="block w-full pl-10 pr-12 py-3 border border-technical-border bg-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <Radar className={`h-4 w-4 ${search ? "text-blue-500 animate-pulse" : "text-slate-300"}`} />
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-12">
          <AdaptiveSidebar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <div className="flex-grow">
            {error ? (
              <ErrorState message={error} onRetry={fetchData} />
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredItems.length > 0 ? (
                  <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map((item) => (
                      <motion.div
                        key={item.slug}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <RegistryCard item={item} />
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <EmptyState
                    title="NO_RECORDS_FOUND_FOR_QUERY"
                    message={search ? `No results for "${search}". Try different keywords or clear filters.` : "No components registered yet. Be the first to contribute!"}
                    actionLabel={search ? undefined : "Submit a Component"}
                    actionHref={search ? undefined : "/submit"}
                  />
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
