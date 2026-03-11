"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import MediaGallery from "@/components/registry/MediaGallery";
import { motion } from "framer-motion";
import { ArrowLeft, Code, ExternalLink, Copy, Check, User } from "lucide-react";
import { isYouTubeUrl, getYouTubeVideoId } from "@/lib/media-utils";
import { getProjectById } from "@/lib/firebase/projectService";
import { incrementProjectViewCount } from "@/lib/api/projects";
import { DetailSkeleton } from "@/components/ui/Skeletons";
import ErrorState from "@/components/ui/ErrorState";
import type { Project } from "@/lib/schemas";
import Link from "next/link";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProjectById(id as string);
        if (!data) {
          setError("Project not found.");
          return;
        }
        setProject(data);
        incrementProjectViewCount(id as string).catch(() => {});
      } catch (err: any) {
        setError(err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const copyCode = async () => {
    if (!project?.code) return;
    await navigator.clipboard.writeText(project.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => router.push("/projects")}
          className="flex items-center gap-2 mb-8 font-mono text-xs text-slate-500 hover:text-blue-500 transition-colors uppercase tracking-widest"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </button>

        {loading ? (
          <DetailSkeleton />
        ) : error ? (
          <ErrorState title="PROJECT_NOT_FOUND" message={error} />
        ) : project ? (
          <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10">
            {/* Header */}
            <header className="pb-8 border-b-2 border-slate-200">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                {project.status === "featured" && (
                  <span className="px-3 py-1 bg-amber-500 text-white text-[10px] font-mono font-bold uppercase rounded">Featured</span>
                )}
                <span className="text-xs font-mono text-slate-500 px-3 py-1 bg-slate-100 border border-slate-200 rounded">
                  {project.viewCount || 0} views
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4 text-gray-900">{project.title}</h1>
              <p className="text-slate-600 text-lg leading-relaxed font-sans max-w-3xl">{project.description}</p>

              <div className="flex items-center gap-6 mt-4">
                {project.authorName && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg">
                    <User className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-gray-800">{project.authorName}</span>
                  </div>
                )}
              </div>

              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-3 py-1.5 bg-slate-100 text-slate-600 border border-slate-200 uppercase rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Cover Image / Video */}
            {project.coverImage && (
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                {isYouTubeUrl(project.coverImage) && getYouTubeVideoId(project.coverImage) ? (
                  <div className="aspect-video w-full">
                    <iframe
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(project.coverImage)!}`}
                      title={project.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                ) : (
                  <img src={project.coverImage} alt={project.title} className="w-full object-cover max-h-[500px]" />
                )}
              </div>
            )}

            {/* Content */}
            {project.content && (
              <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Project Details</h2>
                </div>
                <div className="p-8">
                  <div className="prose prose-sm max-w-none font-sans whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {project.content}
                  </div>
                </div>
              </section>
            )}

            {/* Media Gallery */}
            {project.mediaUrls && project.mediaUrls.length > 0 && (
              <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Media Gallery</h2>
                </div>
                <div className="p-6">
                  <MediaGallery urls={project.mediaUrls} />
                </div>
              </section>
            )}

            {/* Parts List */}
            {project.parts && project.parts.length > 0 && (
              <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="overflow-hidden">
                  <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">Bill of Materials</span>
                    <span className="text-[10px] font-mono text-blue-400">{project.parts.length} ITEMS</span>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b-2 border-slate-200 bg-slate-100">
                        <th className="px-4 py-3 font-mono text-xs text-slate-600 uppercase font-bold">Component</th>
                        <th className="px-4 py-3 font-mono text-xs text-slate-600 uppercase font-bold text-center">Qty</th>
                        <th className="px-4 py-3 font-mono text-xs text-slate-600 uppercase font-bold">Notes</th>
                        <th className="px-4 py-3 font-mono text-xs text-slate-600 uppercase font-bold w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {project.parts.map((part, i) => (
                        <tr key={i} className="spec-row">
                          <td className="px-4 py-3 font-mono text-xs font-bold">{part.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-center">{part.quantity}x</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{part.notes || "—"}</td>
                          <td className="px-4 py-3">
                            {part.registrySlug && (
                              <Link href={`/wiki/${part.registrySlug}`} className="inline-flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded font-medium text-xs">
                                <ExternalLink className="h-3 w-3" /> View
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Code Block */}
            {project.code && (
              <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">Source Code</h2>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded font-mono text-[10px] font-bold uppercase hover:bg-slate-100 transition-all"
                  >
                    {codeCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {codeCopied ? "Copied!" : "Copy Code"}
                  </button>
                </div>
                <div className="overflow-hidden">
                  <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                      {project.codeLanguage || "cpp"}
                    </span>
                    <Code className="h-3 w-3 text-blue-400" />
                  </div>
                  <pre className="p-4 bg-slate-950 overflow-x-auto text-sm">
                    <code className="font-mono text-slate-300 leading-relaxed whitespace-pre">
                      {project.code}
                    </code>
                  </pre>
                </div>
              </section>
            )}
          </motion.article>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
