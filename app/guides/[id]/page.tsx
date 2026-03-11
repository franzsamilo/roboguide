"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import MediaGallery from "@/components/registry/MediaGallery";
import { motion } from "framer-motion";
import { ArrowLeft, User, MapPin, ExternalLink } from "lucide-react";
import { getGuideById } from "@/lib/firebase/guideService";
import { getRegistryItemBySlug } from "@/lib/firebase/registryService";
import { DetailSkeleton } from "@/components/ui/Skeletons";
import ErrorState from "@/components/ui/ErrorState";
import type { Guide } from "@/lib/schemas";
import Link from "next/link";

export default function GuideDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [componentName, setComponentName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getGuideById(id as string);
        if (!data) {
          setError("Guide not found.");
          return;
        }
        if (data.status !== "published") {
          setError("This guide is not published.");
          return;
        }
        setGuide(data);
        if (data.registrySlug) {
          const item = await getRegistryItemBySlug(data.registrySlug);
          setComponentName(item?.name || null);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load guide");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.push("/guides")}
          className="flex items-center gap-2 mb-8 font-mono text-xs text-slate-500 hover:text-blue-500 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Guides
        </button>

        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <ErrorState title="Guide Not Found" message={error} />
        ) : guide ? (
          <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            {/* Header */}
            <header className="pb-8 border-b-2 border-slate-200">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <Link
                  href={`/wiki/${guide.registrySlug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 hover:border-blue-300 font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {componentName || guide.registrySlug}
                </Link>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">{guide.title}</h1>
              {guide.excerpt && (
                <p className="text-slate-600 text-lg leading-relaxed max-w-3xl mb-4">{guide.excerpt}</p>
              )}

              {/* Author credit - prominent */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                {guide.authorName && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg">
                    <User className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-gray-800">by {guide.authorName}</span>
                  </div>
                )}
                {guide.hyperlocalTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {guide.hyperlocalTags.map((tag) => (
                      <span
                        key={tag}
                        className="badge badge-blue text-xs flex items-center gap-1"
                      >
                        <MapPin className="h-3 w-3" /> {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </header>

            {/* Content */}
            <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Content</h2>
              </div>
              <div className="p-8">
                <div className="prose prose-sm max-w-none font-sans whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {guide.content}
                </div>
              </div>
            </section>

            {/* Media Gallery */}
            {guide.mediaUrls && guide.mediaUrls.length > 0 && (
              <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Media</h2>
                </div>
                <div className="p-6">
                  <MediaGallery urls={guide.mediaUrls} />
                </div>
              </section>
            )}

            {/* Footer - author credit again */}
            <div className="pt-8 border-t-2 border-slate-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <Link
                  href={`/wiki/${guide.registrySlug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 hover:bg-blue-100 font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  {componentName ? `View ${componentName}` : `View ${guide.registrySlug}`} →
                </Link>
                {guide.authorName && (
                  <p className="text-sm text-gray-500">
                    Guide by <span className="font-medium text-gray-700">{guide.authorName}</span>
                  </p>
                )}
              </div>
            </div>
          </motion.article>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
