"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import SpecsTable from "@/components/registry/SpecsTable";
import MediaGallery from "@/components/registry/MediaGallery";
import { motion } from "framer-motion";
import { MapPin, Share2, ArrowLeft, ExternalLink, FileText, Copy, Check, Eye, Tag } from "lucide-react";
import { getRegistryItemBySlug } from "@/lib/firebase/registryService";
import { incrementViewCount } from "@/lib/api/registry";
import { getGuidesForItem } from "@/lib/firebase/guideService";
import { DetailSkeleton } from "@/components/ui/Skeletons";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import type { RegistryItem, Guide } from "@/lib/schemas";
import Link from "next/link";

export default function RegistryDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [item, setItem] = useState<RegistryItem | null>(null);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [itemData, guidesData] = await Promise.all([
          getRegistryItemBySlug(slug as string),
          getGuidesForItem(slug as string),
        ]);
        if (!itemData) {
          setError("Component not found in registry.");
          return;
        }
        setItem(itemData);
        setGuides(guidesData);
        if (itemData.id) {
          incrementViewCount(itemData.id).catch(() => {});
        }
      } catch (err: any) {
        console.error("Failed to fetch item:", err);
        setError(err.message || "Failed to load component data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        {/* Back Button */}
        <button
          onClick={() => router.push("/wiki")}
          className="flex items-center gap-2 mb-8 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Components
        </button>

        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <ErrorState
            title="Component Not Found"
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : item ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Image & Media */}
            <div className="lg:col-span-5 space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-flat p-10 aspect-square flex items-center justify-center bg-gray-50 relative"
              >
                {item.status === "draft" && (
                  <div className="absolute top-4 right-4 badge badge-orange text-xs font-semibold">Draft</div>
                )}
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-gray-200 text-7xl font-black">
                    {item.name.slice(0, 2)}
                  </div>
                )}
              </motion.div>

              {item.mediaUrls && item.mediaUrls.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Gallery</h3>
                  <MediaGallery urls={item.mediaUrls} />
                </div>
              )}

              {item.pinout && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Pinout</h3>
                  <div className="technical-card p-4 bg-white">
                    {item.pinout.startsWith("http") ? (
                      item.pinout.match(/\.(jpg|jpeg|png|gif|webp)(\?|$)/i) ? (
                        <img src={item.pinout} alt="Pinout diagram" className="max-w-full h-auto" />
                      ) : (
                        <a href={item.pinout} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                          <ExternalLink className="h-4 w-4" /> View pinout diagram
                        </a>
                      )
                    ) : (
                      <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">{item.pinout}</pre>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Title, Specs, Content */}
            <div className="lg:col-span-7 space-y-8">
              <header>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="badge badge-blue">{item.category}</span>
                  {item.viewCount > 0 && (
                    <span className="badge">
                      <Eye className="h-3 w-3" /> {item.viewCount} views
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight mb-3">{item.name}</h1>
                {item.description && (
                  <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
                    {item.description}
                  </p>
                )}

                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {item.tags.map((tag) => (
                      <span key={tag} className="badge">{tag}</span>
                    ))}
                  </div>
                )}
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <SpecsTable specs={item.specifications} />
                </div>

                <div className="space-y-4">
                  {/* Quick Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleShare}
                      className="flex-1 btn-outline justify-center text-sm"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                      {copied ? "Copied!" : "Share"}
                    </button>
                    {item.datasheet && (
                      <a
                        href={item.datasheet}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 btn-outline justify-center text-sm"
                      >
                        <FileText className="h-4 w-4" /> Datasheet <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Community Guides */}
              <section className="pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Community Guides</h2>
                  <Link
                    href={`/admin/guides/new?slug=${slug}`}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Write a Guide
                  </Link>
                </div>

                {guides.length > 0 ? (
                  <div className="space-y-4">
                    {guides.map((guide) => (
                      <Link key={guide.id} href={`/guides/${guide.id}`}>
                        <motion.div
                          whileHover={{ x: 3 }}
                          className="card-flat p-6 hover:border-blue-200 transition-colors cursor-pointer"
                        >
                          {guide.hyperlocalTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {guide.hyperlocalTags.map((tag) => (
                                <span key={tag} className="badge badge-blue text-xs">
                                  <MapPin className="h-3 w-3" />
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <h3 className="text-base font-semibold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
                            {guide.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-2">
                            {guide.excerpt || guide.content.slice(0, 200)}
                          </p>
                          {guide.mediaUrls && guide.mediaUrls.length > 0 && (
                            <div className="mt-3">
                              <MediaGallery urls={guide.mediaUrls} />
                            </div>
                          )}
                          {guide.authorName && (
                            <p className="text-xs text-gray-500 mt-2 font-medium">by {guide.authorName}</p>
                          )}
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    title="No Guides Yet"
                    message="Be the first to contribute a guide for this component!"
                    actionLabel="Create Guide"
                    actionHref={`/admin/guides/new?slug=${slug}`}
                  />
                )}
              </section>

              {/* Related Components */}
              {item.relatedSlugs && item.relatedSlugs.length > 0 && (
                <section className="pt-8 border-t border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Related Components</h2>
                  <div className="flex flex-wrap gap-2">
                    {item.relatedSlugs.map((s) => (
                      <Link
                        key={s}
                        href={`/wiki/${s}`}
                        className="badge hover:bg-blue-50 hover:text-blue-600 transition-colors text-sm"
                      >
                        {s}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
