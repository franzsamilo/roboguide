"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { useAuth } from "@/components/auth/AuthProvider";
import { motion } from "framer-motion";
import {
  Eye,
  FolderOpen,
  BookOpen,
  Cpu,
  Star,
  ArrowRight,
  LogOut,
  ExternalLink,
  Heart,
} from "lucide-react";
import Link from "next/link";
import type { ProfileStats } from "@/app/api/profile/stats/route";

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/");
      return;
    }
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/profile/stats");
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user, authLoading, router]);

  if (authLoading || !user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow flex items-center justify-center">
          <div className="animate-pulse text-slate-500">Loading...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-10"
        >
          {/* Profile Header */}
          <header className="pb-8 border-b-2 border-slate-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || "Profile"}
                    className="w-24 h-24 rounded-full border-4 border-slate-200 shadow-md object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full border-4 border-slate-200 bg-slate-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-slate-400">
                      {user.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {user.name || "Contributor"}
                </h1>
                {user.email && (
                  <p className="text-slate-500 mt-1">{user.email}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-4">
                  <Link
                    href="/submit"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Submit Content
                  </Link>
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors text-sm text-slate-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-slate-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          ) : stats ? (
            <>
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Your Impact
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  <StatCard
                    icon={Eye}
                    label="Total Views"
                    value={stats.totalViews.toLocaleString()}
                  />
                  <StatCard
                    icon={Heart}
                    label="Contributions"
                    value={stats.totalContributions.toString()}
                  />
                  <StatCard
                    icon={FolderOpen}
                    label="Projects"
                    value={stats.projectsCount.toString()}
                  />
                  <StatCard
                    icon={BookOpen}
                    label="Guides"
                    value={stats.guidesCount.toString()}
                  />
                  <StatCard
                    icon={Cpu}
                    label="Components"
                    value={stats.componentsCount.toString()}
                  />
                </div>
                {stats.featuredProjects > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-amber-600">
                    <Star className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {stats.featuredProjects} featured project
                      {stats.featuredProjects > 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </section>

              {/* Recent Projects */}
              {stats.recentProjects.length > 0 && (
                <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                      Your Projects
                    </h2>
                    <Link
                      href="/projects"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      View all <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {stats.recentProjects.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/projects/${p.id}`}
                          className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                            <span className="font-medium text-gray-900 group-hover:text-blue-600">
                              {p.title}
                            </span>
                            {p.status === "featured" && (
                              <Star className="h-3.5 w-3.5 text-amber-500" />
                            )}
                          </div>
                          <span className="text-sm text-slate-500">
                            {p.viewCount} views
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Recent Guides */}
              {stats.recentGuides.length > 0 && (
                <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                      Your Guides
                    </h2>
                    <Link
                      href="/guides"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      View all <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {stats.recentGuides.map((g) => (
                      <li key={g.id}>
                        <Link
                          href={`/guides/${g.id}`}
                          className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                            <span className="font-medium text-gray-900 group-hover:text-blue-600">
                              {g.title}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 uppercase">
                            {g.status}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Empty state for new contributors */}
              {stats.totalContributions === 0 && (
                <div className="border border-slate-200 rounded-xl p-8 text-center bg-slate-50">
                  <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Start sharing your work
                  </h3>
                  <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Share a project, write a guide, or add a component to the
                    wiki. Your contributions help the community build better
                    robots.
                  </p>
                  <Link
                    href="/submit"
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Submit Your First Contribution
                  </Link>
                </div>
              )}
            </>
          ) : null}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <Icon className="h-5 w-5 text-blue-500 mb-2" />
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">
        {label}
      </p>
    </div>
  );
}
