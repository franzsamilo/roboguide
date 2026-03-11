"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { motion } from "framer-motion";
import { Search, FolderOpen, Star, Code, ArrowRight } from "lucide-react";
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

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">
                Community Projects
              </h1>
              <p className="text-gray-500 text-sm">
                {filtered.length} projects shared by the community
              </p>
            </div>
            <div className="flex gap-3">
              <div className="relative w-full md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="form-input pl-10"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Link
                href="/submit?type=project"
                className="btn-primary whitespace-nowrap"
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
                  whileHover={{ y: -3 }}
                  className="card overflow-hidden h-full group"
                >
                  <div className="relative h-48 bg-gray-50 border-b border-gray-100 overflow-hidden">
                    {project.coverImage ? (
                      <img
                        src={project.coverImage}
                        alt={project.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <FolderOpen className="h-12 w-12 text-gray-200" />
                      </div>
                    )}
                    {project.status === "featured" && (
                      <div className="absolute top-3 left-3 badge badge-orange text-xs font-semibold">
                        <Star className="h-3 w-3" /> Featured
                      </div>
                    )}
                  </div>
                  <div className="p-5 space-y-2">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="badge text-xs">{tag}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        {project.parts?.length > 0 && <span>{project.parts.length} parts</span>}
                        {project.code && <Code className="h-3 w-3" />}
                      </div>
                    </div>
                    {project.authorName && (
                      <p className="text-xs text-gray-400">by {project.authorName}</p>
                    )}
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Projects Found"
            message={search ? `No projects match "${search}".` : "No projects shared yet. Be the first to showcase your build!"}
            actionLabel="Share Your Project"
            actionHref="/submit?type=project"
            icon={FolderOpen}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
