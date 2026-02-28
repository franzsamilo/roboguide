"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import MediaGallery from "@/components/registry/MediaGallery";
import { motion } from "framer-motion";
import { ArrowLeft, Code, ExternalLink, Copy, Check, Eye, User, Tag } from "lucide-react";
import { getProjectById, incrementProjectViewCount } from "@/lib/firebase/projectService";
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

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
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
          <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
            {/* Header */}
            <header>
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                {project.status === "featured" && (
                  <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-mono font-bold uppercase">Featured</span>
                )}
                <span className="text-[10px] font-mono text-slate-400">
                  {project.viewCount || 0} views
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase mb-4">{project.title}</h1>
              <p className="text-slate-600 text-lg leading-relaxed font-sans max-w-3xl">{project.description}</p>

              <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
                {project.authorName && (
                  <div className="flex items-center gap-2 font-mono text-xs">
                    <User className="h-4 w-4" /> {project.authorName}
                  </div>
                )}
              </div>

              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono px-2 py-1 bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </header>

            {/* Cover Image */}
            {project.coverImage && (
              <div className="technical-card overflow-hidden">
                <img src={project.coverImage} alt={project.title} className="w-full object-cover max-h-[500px]" />
              </div>
            )}

            {/* Content */}
            {project.content && (
              <section>
                <h2 className="text-2xl font-bold tracking-tight uppercase mb-6">Project Details</h2>
                <div className="technical-card p-8">
                  <div className="prose prose-sm max-w-none font-sans whitespace-pre-wrap text-slate-700 leading-relaxed">
                    {project.content}
                  </div>
                </div>
              </section>
            )}

            {/* Media Gallery */}
            {project.mediaUrls && project.mediaUrls.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold tracking-tight uppercase mb-6">Media Gallery</h2>
                <MediaGallery urls={project.mediaUrls} />
              </section>
            )}

            {/* Parts List */}
            {project.parts && project.parts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold tracking-tight uppercase mb-6">Parts List</h2>
                <div className="technical-card overflow-hidden">
                  <div className="bg-slate-900 px-4 py-2 flex items-center justify-between">
                    <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest font-bold">Bill of Materials</span>
                    <span className="text-[10px] font-mono text-blue-400">{project.parts.length} ITEMS</span>
                  </div>
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-2 font-mono text-[10px] text-slate-500 uppercase">Component</th>
                        <th className="px-4 py-2 font-mono text-[10px] text-slate-500 uppercase text-center">Qty</th>
                        <th className="px-4 py-2 font-mono text-[10px] text-slate-500 uppercase">Notes</th>
                        <th className="px-4 py-2 font-mono text-[10px] text-slate-500 uppercase w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {project.parts.map((part, i) => (
                        <tr key={i} className="spec-row">
                          <td className="px-4 py-3 font-mono text-xs font-bold">{part.name}</td>
                          <td className="px-4 py-3 font-mono text-xs text-center">{part.quantity}x</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{part.notes || "—"}</td>
                          <td className="px-4 py-3">
                            {part.registrySlug && (
                              <Link href={`/wiki/${part.registrySlug}`} className="text-blue-600 hover:underline">
                                <ExternalLink className="h-3 w-3" />
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
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold tracking-tight uppercase">Source Code</h2>
                  <button
                    onClick={copyCode}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 font-mono text-[10px] font-bold uppercase hover:bg-slate-50 transition-all"
                  >
                    {codeCopied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    {codeCopied ? "Copied!" : "Copy Code"}
                  </button>
                </div>
                <div className="technical-card overflow-hidden">
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
    </div>
  );
}
