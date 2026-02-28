"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import { Search, FolderOpen, Star, Eye, ArrowUpRight, Code, Calendar } from "lucide-react";
import { getProjects } from "@/lib/firebase/projectService";
import { CardSkeleton } from "@/components/ui/Skeletons";
import EmptyState from "@/components/ui/EmptyState";
import ErrorState from "@/components/ui/ErrorState";
import type { Project } from "@/lib/schemas";
import Link from "next/link";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProjects();
      setProjects(result.projects);
    } catch (err: any) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = search
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())) ||
          p.description.toLowerCase().includes(search.toLowerCase())
      )
    : projects;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tighter mb-2 font-sans uppercase">Project Showcase</h1>
              <p className="text-slate-500 font-mono text-sm tracking-wide">
                COMMUNITY_BUILDS // {filtered.length} PROJECTS_INDEXED
              </p>
            </div>
            <div className="flex gap-4">
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="block w-full pl-10 py-3 border border-technical-border bg-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Link
                href="/submit?type=project"
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors whitespace-nowrap"
              >
                Share Project
              </Link>
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
            {filtered.map((project) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="technical-card group overflow-hidden border-slate-200 hover:border-blue-500 transition-colors h-full"
                >
                  <div className="relative h-48 bg-slate-50 border-b border-inherit overflow-hidden">
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: "radial-gradient(circle at center, #334155 1px, transparent 1px)",
                      backgroundSize: "10px 10px",
                    }} />
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FolderOpen className="h-12 w-12 text-slate-200 group-hover:text-blue-100 transition-colors" />
                      </div>
                    )}
                    {project.status === "featured" && (
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-[9px] font-mono font-bold uppercase">
                        <Star className="h-3 w-3" /> Featured
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <ArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="text-sm font-bold font-sans text-slate-800 truncate">{project.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex flex-wrap gap-1">
                        {project.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[9px] font-mono px-1.5 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                        {project.parts?.length > 0 && <span>{project.parts.length} parts</span>}
                        {project.code && <Code className="h-3 w-3" />}
                      </div>
                    </div>
                    {project.authorName && (
                      <p className="text-[10px] font-mono text-slate-400 pt-1">by {project.authorName}</p>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="NO_PROJECTS_FOUND"
            message={search ? `No projects match "${search}".` : "No projects shared yet. Be the first to showcase your build!"}
            actionLabel="Share Your Project"
            actionHref="/submit?type=project"
            icon={FolderOpen}
          />
        )}
      </main>
    </div>
  );
}
