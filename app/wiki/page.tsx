"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import AdaptiveSidebar from "@/components/wiki/AdaptiveSidebar";
import RegistryCard from "@/components/wiki/RegistryCard";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { RegistryItem, Category } from "@/lib/schemas";
import { getRegistryItems, getCategoriesWithCounts } from "@/lib/firebase/registryService";
import { CardSkeleton } from "@/components/ui/Skeletons";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";

function WikiPageInner() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(initialCategory);
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

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
                Explore Components
              </h1>
              <p className="text-gray-500 text-sm">
                Browse {filteredItems.length} components in our hardware registry
              </p>
            </div>

            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search components, tags..."
                className="form-input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          <AdaptiveSidebar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
          />

          <div className="grow">
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
                        initial={{ opacity: 0, y: 15 }}
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
                    title="No Components Found"
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

      <Footer />
    </div>
  );
}

export default function WikiPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          </main>
          <Footer />
        </div>
      }
    >
      <WikiPageInner />
    </Suspense>
  );
}
