"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import SpecsTable from "@/components/registry/SpecsTable";
import MediaGallery from "@/components/registry/MediaGallery";
import TraceLineSVG from "@/components/registry/TraceLineSVG";
import { VoltageIcon, PinoutIcon, SensorIcon, PowerIcon } from "@/components/icons/hardware/Icons";
import { motion } from "framer-motion";
import { MapPin, Share2, Printer, ArrowLeft, ExternalLink, FileText, Copy, Check } from "lucide-react";
import { getRegistryItemBySlug, incrementViewCount } from "@/lib/firebase/registryService";
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
        // Track view count
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
      // Fallback for older browsers
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

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative">
        {/* Back Button */}
        <button
          onClick={() => router.push("/wiki")}
          className="flex items-center gap-2 mb-8 font-mono text-xs text-slate-500 hover:text-blue-500 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Registry
        </button>

        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <ErrorState
            title="ITEM_NOT_FOUND"
            message={error}
            onRetry={() => window.location.reload()}
          />
        ) : item ? (
          <>
            <TraceLineSVG />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
              {/* Left Column: Image & Media */}
              <div className="lg:col-span-5 space-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="technical-card p-12 aspect-square flex items-center justify-center bg-white relative"
                >
                  <div className="absolute top-4 left-4 font-mono text-[10px] text-slate-400">REFERENCE_UNIT_A1</div>
                  {item.status === "draft" && (
                    <div className="absolute top-4 right-4 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-mono font-bold">DRAFT</div>
                  )}
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="max-w-full max-h-full object-contain mix-blend-multiply"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="text-slate-200 font-mono text-6xl font-black uppercase">
                      {item.name.slice(0, 2)}
                    </div>
                  )}
                </motion.div>

                {item.mediaUrls && item.mediaUrls.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500">Visual Evidence</h3>
                    <MediaGallery urls={item.mediaUrls} />
                  </div>
                )}
              </div>

              {/* Right Column: Title, Specs, Content */}
              <div className="lg:col-span-7 space-y-12">
                <header>
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="px-2 py-0.5 border border-blue-500 text-blue-600 text-[10px] font-mono font-bold uppercase">
                      {item.category}
                    </span>
                    <span className="text-slate-300 font-mono text-[10px]">VERIFIED_COMPONENT</span>
                    {item.viewCount > 0 && (
                      <span className="text-slate-300 font-mono text-[10px]">{item.viewCount} VIEWS</span>
                    )}
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4">{item.name}</h1>
                  {item.description && (
                    <p className="text-slate-600 text-lg leading-relaxed font-sans max-w-2xl">
                      {item.description}
                    </p>
                  )}

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {item.tags.map((tag) => (
                        <span key={tag} className="text-[10px] font-mono px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <SpecsTable specs={item.specifications} />
                  </div>

                  <div className="space-y-6">
                    <div className="technical-card p-6 flex flex-col gap-4">
                      <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-2">
                        Active State Indicators
                      </h4>
                      <div className="flex justify-between items-center group cursor-default">
                        <div className="flex items-center gap-2">
                          <VoltageIcon active />
                          <span className="text-xs font-mono">SUPPLY_VOLTAGE</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-600">
                          {item.specifications["Voltage"] || item.specifications["Input"] || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center group cursor-default">
                        <div className="flex items-center gap-2">
                          <PinoutIcon active />
                          <span className="text-xs font-mono">ENTRIES</span>
                        </div>
                        <span className="text-xs font-mono font-bold">
                          {Object.keys(item.specifications).length} SPECS
                        </span>
                      </div>
                      <div className="flex justify-between items-center group cursor-default">
                        <div className="flex items-center gap-2">
                          <PowerIcon active />
                          <span className="text-xs font-mono">STATUS</span>
                        </div>
                        <span className={`text-xs font-mono font-bold ${item.status === "published" ? "text-emerald-600" : "text-amber-600"}`}>
                          {item.status?.toUpperCase() || "PUBLISHED"}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={handleShare}
                        className="flex-1 px-4 py-3 border border-technical-border font-mono text-[10px] font-bold uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                      >
                        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Share2 className="h-4 w-4" />}
                        {copied ? "Copied!" : "Share blueprint"}
                      </button>
                      {item.datasheet && (
                        <a
                          href={item.datasheet}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 px-4 py-3 border border-technical-border font-mono text-[10px] font-bold uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                          <FileText className="h-4 w-4" /> Datasheet <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hyperlocal Guides */}
                <section className="pt-12 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold tracking-tight uppercase">Hyperlocal Knowledge</h2>
                    <Link
                      href={`/admin/guides/new?slug=${slug}`}
                      className="text-xs font-mono font-bold text-blue-600 hover:underline"
                    >
                      CONTRIBUTE_LOCAL_GUIDE
                    </Link>
                  </div>

                  {guides.length > 0 ? (
                    <div className="space-y-6">
                      {guides.map((guide) => (
                        <motion.div
                          key={guide.id}
                          whileHover={{ x: 5 }}
                          className="technical-card p-8 group"
                        >
                          <div className="flex flex-wrap gap-2 mb-4">
                            {guide.hyperlocalTags.map((tag) => (
                              <div key={tag} className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 text-white font-mono text-[9px] uppercase tracking-wider">
                                <MapPin className="h-3 w-3 text-blue-400" />
                                {tag}
                              </div>
                            ))}
                          </div>
                          <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors uppercase">
                            {guide.title}
                          </h3>
                          <p className="text-slate-500 text-sm mb-4">{guide.excerpt || guide.content.slice(0, 200)}</p>
                          {guide.mediaUrls && guide.mediaUrls.length > 0 && (
                            <div className="mb-4">
                              <MediaGallery urls={guide.mediaUrls} />
                            </div>
                          )}
                          {guide.authorName && (
                            <p className="text-[10px] font-mono text-slate-400 uppercase">
                              By {guide.authorName}
                            </p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      title="NO_LOCAL_GUIDES"
                      message="No hyperlocal guides yet. Be the first to contribute regional knowledge for this component!"
                      actionLabel="Create Guide"
                      actionHref={`/admin/guides/new?slug=${slug}`}
                    />
                  )}
                </section>

                {/* Related Components */}
                {item.relatedSlugs && item.relatedSlugs.length > 0 && (
                  <section className="pt-12 border-t border-slate-100">
                    <h2 className="text-2xl font-bold tracking-tight uppercase mb-6">Related Components</h2>
                    <div className="flex flex-wrap gap-3">
                      {item.relatedSlugs.map((s) => (
                        <Link
                          key={s}
                          href={`/wiki/${s}`}
                          className="px-4 py-2 border border-slate-200 font-mono text-xs uppercase hover:border-blue-500 hover:text-blue-600 transition-all"
                        >
                          {s}
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
