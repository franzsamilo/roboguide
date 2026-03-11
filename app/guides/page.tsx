"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { motion } from "framer-motion";
import { Search, FileText, MapPin, User } from "lucide-react";
import { isYouTubeUrl, getYouTubeVideoId, getYouTubeThumbnailUrl } from "@/lib/media-utils";
import { getAllGuides } from "@/lib/firebase/guideService";
import { CardSkeleton } from "@/components/ui/Skeletons";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import type { Guide } from "@/lib/schemas";
import Link from "next/link";

export default function GuidesPage() {
  const router = useRouter();
  const [guides, setGuides] = useState<Guide[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getAllGuides({ status: "published" });
      setGuides(result);
    } catch (err: any) {
      setError(err.message || "Failed to load guides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = search
    ? guides.filter(
        (g) =>
          g.title.toLowerCase().includes(search.toLowerCase()) ||
          g.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
          g.content.toLowerCase().includes(search.toLowerCase()) ||
          g.registrySlug.toLowerCase().includes(search.toLowerCase()) ||
          g.hyperlocalTags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
          g.authorName?.toLowerCase().includes(search.toLowerCase())
      )
    : guides;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
                Guides
              </h1>
              <p className="text-gray-500 text-sm">
                {filtered.length} guides from the community
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search guides..."
                className="form-input pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </header>

        {error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((guide) => (
              <motion.div
                key={guide.id}
                whileHover={{ y: -3 }}
                onClick={() => router.push(`/guides/${guide.id}`)}
                className="card overflow-hidden h-full group cursor-pointer"
              >
                <div className="relative h-48 bg-gray-50 border-b border-gray-100 overflow-hidden">
                  {guide.mediaUrls && guide.mediaUrls.length > 0 ? (
                    isYouTubeUrl(guide.mediaUrls[0]) && getYouTubeVideoId(guide.mediaUrls[0]) ? (
                      <img
                        src={getYouTubeThumbnailUrl(getYouTubeVideoId(guide.mediaUrls[0])!)}
                        alt={guide.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <img
                        src={guide.mediaUrls[0]}
                        alt={guide.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    )
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <FileText className="h-12 w-12 text-gray-200" />
                    </div>
                  )}
                </div>
                <div className="p-5 space-y-2">
                  {guide.hyperlocalTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {guide.hyperlocalTags.slice(0, 3).map((tag) => (
                        <span key={tag} className="badge badge-blue text-xs flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {guide.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {guide.excerpt || guide.content.slice(0, 150)}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <Link
                      href={`/wiki/${guide.registrySlug}`}
                      className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {guide.registrySlug}
                    </Link>
                    {guide.authorName && (
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <User className="h-3 w-3" /> {guide.authorName}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Guides Found"
            message={search ? `No guides match "${search}".` : "No guides yet. Admins can create guides from the Admin panel."}
            icon={FileText}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
