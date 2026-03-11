"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database, FileText, Trash2, Edit3, Plus, Eye, BookOpen, FolderOpen,
  Cpu, ChevronRight, Users, Activity, UserPlus, UserMinus, Pencil, Send
} from "lucide-react";
import {
  getRegistryItems,
  getCategoriesWithCounts,
} from "@/lib/firebase/registryService";
import { deleteRegistryItem, updateRegistryItem } from "@/lib/api/registry";
import { getAllGuides } from "@/lib/firebase/guideService";
import { deleteGuide } from "@/lib/api/guides";
import { getAllProjects } from "@/lib/firebase/projectService";
import { deleteProject } from "@/lib/api/projects";
import { PageSkeleton } from "@/components/ui/Skeletons";
import EmptyState from "@/components/ui/EmptyState";
import type { RegistryItem, Guide, Category, Project } from "@/lib/schemas";
import Link from "next/link";

type Tab = "components" | "guides" | "projects" | "admins";

export default function AdminPage() {
  const { user, loading: authLoading, isAdmin } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [items, setItems] = useState<RegistryItem[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [admins, setAdmins] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("components");
  const [promoteEmail, setPromoteEmail] = useState("");
  const [adminsLoading, setAdminsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
      return;
    }
    if (!authLoading && user && isAdmin === false) {
      router.push("/");
    }
  }, [user, authLoading, isAdmin, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsResult, guidesResult, catsResult, projectsResult] = await Promise.all([
        getRegistryItems({ status: "all" }),
        getAllGuides(),
        getCategoriesWithCounts(),
        getAllProjects(),
      ]);
      setItems(itemsResult.items);
      setGuides(guidesResult);
      setCategories(catsResult);
      setProjects(projectsResult);
    } catch (err) {
      toast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  const fetchAdmins = async () => {
    if (!user) return;
    setAdminsLoading(true);
    try {
      const res = await fetch("/api/admin/emails", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setAdmins(data.emails ?? []);
      }
    } catch {
      toast("Failed to load admins", "error");
    } finally {
      setAdminsLoading(false);
    }
  };

  const handlePromote = async () => {
    // Normalize: trim, and replace fullwidth/unicode @ with ASCII @
    const raw = (promoteEmail ?? "").trim().replace(/＠/g, "@");
    const email = raw.toLowerCase();
    if (!email || !email.includes("@") || email.length < 5) {
      toast("Enter a valid email (e.g. user@example.com)", "error");
      return;
    }
    try {
      const res = await fetch("/api/admin/emails", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.emails ?? []);
        setPromoteEmail("");
        toast(`Promoted ${email} to admin`, "success");
      } else {
        const msg = data.error || (res.status === 401 ? "You must be signed in as an admin" : "Failed to promote");
        toast(msg, "error");
      }
    } catch {
      toast("Failed to promote", "error");
    }
  };

  const handleDemote = async (email: string) => {
    const confirmed = await confirm({
      title: "Remove Admin",
      message: `Remove ${email} from admins? They will lose access to the admin panel.`,
      confirmLabel: "Remove",
      destructive: true,
    });
    if (!confirmed) return;
    try {
      const res = await fetch(`/api/admin/emails?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAdmins(data.emails ?? []);
        toast(`Removed ${email} from admins`, "success");
      } else {
        toast(data.error || "Failed to remove", "error");
      }
    } catch {
      toast("Failed to remove", "error");
    }
  };

  const handleDeleteItem = async (item: RegistryItem) => {
    const confirmed = await confirm({
      title: "Delete Component",
      message: `This will permanently delete "${item.name}" and all associated data. This action cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed || !item.id) return;

    try {
      await deleteRegistryItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast(`"${item.name}" deleted`, "success");
    } catch (err) {
      toast("Failed to delete item", "error");
    }
  };

  const handleDeleteProject = async (project: Project) => {
    const confirmed = await confirm({
      title: "Delete Project",
      message: `Delete project "${project.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed || !project.id) return;

    try {
      await deleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      toast(`"${project.title}" deleted`, "success");
    } catch (err) {
      toast("Failed to delete project", "error");
    }
  };

  const handleDeleteGuide = async (guide: Guide) => {
    const confirmed = await confirm({
      title: "Delete Guide",
      message: `Delete guide "${guide.title}"? This cannot be undone.`,
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed || !guide.id) return;

    try {
      await deleteGuide(guide.id);
      setGuides((prev) => prev.filter((g) => g.id !== guide.id));
      toast(`"${guide.title}" deleted`, "success");
    } catch (err) {
      toast("Failed to delete guide", "error");
    }
  };

  if (authLoading || !user || isAdmin === null) return null;
  if (isAdmin === false) return null;

  const totalComponents = items.length;
  const totalGuides = guides.length;
  const totalProjects = projects.length;
  const publishedComponents = items.filter((i) => i.status === "published").length;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest">
                  Admin Console Active
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter uppercase font-sans">Admin Terminal</h1>
              <p className="text-slate-500 font-mono text-sm mt-1">ADMIN_ACCESS // {user.name} • {user.email}</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/components/new"
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors"
              >
                <Plus className="h-4 w-4" /> New Component
              </Link>
              <Link
                href="/admin/guides/new"
                className="flex items-center gap-2 px-6 py-3 border border-technical-border font-mono text-xs font-bold uppercase tracking-widest hover:bg-slate-50 transition-all"
              >
                <FileText className="h-4 w-4" /> New Guide
              </Link>
            </div>
          </div>
        </header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Components", value: totalComponents, icon: Database },
            { label: "Published", value: publishedComponents, icon: Eye },
            { label: "Guides", value: totalGuides, icon: BookOpen },
            { label: "Projects", value: totalProjects, icon: FolderOpen },
            { label: "Categories", value: categories.filter((c) => c.count > 0).length, icon: Activity },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="technical-card p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-5 w-5 text-slate-400" />
                <span className="text-2xl font-bold font-mono">{value}</span>
              </div>
              <p className="font-mono text-[10px] uppercase text-slate-500 tracking-widest">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-8 flex-wrap gap-1">
          {(
            [
              ["components", "Components", Database, totalComponents],
              ["guides", "Guides", BookOpen, totalGuides],
              ["projects", "Projects", FolderOpen, totalProjects],
              ["admins", "Admins", Users, admins.length],
            ] as const
          ).map(([tab, label, Icon, count]) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "admins") fetchAdmins();
              }}
              className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all border-b-2 -mb-[1px] flex items-center gap-2 ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              <Icon className="h-3 w-3" /> {label} ({count})
            </button>
          ))}
        </div>

        {loading ? (
          <PageSkeleton />
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "components" && (
              <motion.div key="components" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {items.length === 0 ? (
                  <EmptyState
                    title="NO_COMPONENTS"
                    message="You haven't added any components yet."
                    actionLabel="Add First Component"
                    actionHref="/admin/components/new"
                  />
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        className="technical-card p-4 flex items-center gap-4 hover:border-blue-500 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                          {item.image ? (
                            <img src={item.image} alt="" className="w-full h-full object-contain p-1 mix-blend-multiply" />
                          ) : (
                            <Cpu className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-bold truncate">{item.name}</h3>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 uppercase ${
                              item.status === "published" ? "bg-emerald-100 text-emerald-700" :
                              item.status === "draft" ? "bg-amber-100 text-amber-700" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">
                            {item.category} • {item.tags.slice(0, 3).join(", ")} • {item.viewCount || 0} views
                          </p>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          {item.status === "draft" && (
                            <button
                              onClick={async () => {
                                try {
                                  await updateRegistryItem(item.id!, { status: "published" });
                                  setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "published" } : i));
                                  toast(`"${item.name}" published`, "success");
                                } catch (e: any) {
                                  toast(e.message || "Failed to publish", "error");
                                }
                              }}
                              className="p-2 hover:bg-emerald-50 transition-all text-emerald-600"
                              title="Publish"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          )}
                          <Link href={`/wiki/${item.slug}`} className="p-2 hover:bg-slate-50 transition-all" title="View">
                            <Eye className="h-4 w-4 text-slate-400" />
                          </Link>
                          <Link href={`/admin/components/${item.id}/edit`} className="p-2 hover:bg-slate-50 transition-all" title="Edit">
                            <Edit3 className="h-4 w-4 text-slate-400" />
                          </Link>
                          <button onClick={() => handleDeleteItem(item)} className="p-2 hover:bg-red-50 transition-all" title="Delete">
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "guides" && (
              <motion.div key="guides" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {guides.length === 0 ? (
                  <EmptyState
                    title="NO_GUIDES"
                    message="No guides created yet."
                    actionLabel="Create First Guide"
                    actionHref="/admin/guides/new"
                  />
                ) : (
                  <div className="space-y-2">
                    {guides.map((guide) => (
                      <motion.div
                        key={guide.id}
                        layout
                        className="technical-card p-4 flex items-center gap-4 hover:border-blue-500 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold truncate">{guide.title}</h3>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">
                            linked: {guide.registrySlug} • {guide.hyperlocalTags.join(", ") || "no tags"}
                          </p>
                          {guide.authorName && (
                            <p className="text-xs text-slate-500 mt-1">by {guide.authorName}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/guides/${guide.id}/edit`}
                            className="p-2 hover:bg-blue-50 transition-all"
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Link>
                          <button onClick={() => handleDeleteGuide(guide)} className="p-2 hover:bg-red-50 transition-all" title="Delete">
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "projects" && (
              <motion.div key="projects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {projects.length === 0 ? (
                  <EmptyState
                    title="NO_PROJECTS"
                    message="No projects posted yet."
                    actionLabel="View Projects"
                    actionHref="/projects"
                  />
                ) : (
                  <div className="space-y-2">
                    {projects.map((project) => (
                      <motion.div
                        key={project.id}
                        layout
                        className="technical-card p-4 flex items-center gap-4 hover:border-blue-500 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {project.coverImage ? (
                            <img src={project.coverImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <FolderOpen className="h-5 w-5 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm font-bold truncate">{project.title}</h3>
                            <span className={`text-[9px] font-mono px-1.5 py-0.5 uppercase ${
                              project.status === "featured" ? "bg-amber-100 text-amber-700" :
                              project.status === "published" ? "bg-emerald-100 text-emerald-700" :
                              "bg-slate-100 text-slate-500"
                            }`}>
                              {project.status}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">
                            {project.authorName || "Unknown"} • {project.viewCount || 0} views
                          </p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/projects/${project.id}`} className="p-2 hover:bg-slate-50 transition-all" title="View">
                            <Eye className="h-4 w-4 text-slate-400" />
                          </Link>
                          <Link href={`/projects/${project.id}/edit`} className="p-2 hover:bg-slate-50 transition-all" title="Edit">
                            <Pencil className="h-4 w-4 text-slate-400" />
                          </Link>
                          <button onClick={() => handleDeleteProject(project)} className="p-2 hover:bg-red-50 transition-all" title="Delete">
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </button>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === "admins" && (
              <motion.div key="admins" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="technical-card p-6 space-y-6">
                  <p className="text-xs text-slate-500">
                    First admin is auto-added from <code className="bg-slate-100 px-1">ADMIN_EMAIL</code> when you sign in. Promote others below.
                  </p>
                  <div>
                    <h3 className="text-sm font-bold mb-2">Promote admin</h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Add an email to grant admin access. Admins manage components, guides, photos, videos, and content.
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        inputMode="email"
                        placeholder="email@example.com"
                        autoComplete="email"
                        value={promoteEmail}
                        onChange={(e) => setPromoteEmail(e.target.value)}
                        className="flex-1 px-3 py-2 border border-slate-200 font-mono text-sm"
                      />
                      <button
                        onClick={handlePromote}
                        className="px-4 py-2 bg-blue-600 text-white font-mono text-xs uppercase hover:bg-blue-700 transition-colors flex items-center gap-2"
                      >
                        <UserPlus className="h-4 w-4" /> Promote
                      </button>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold mb-2">Admin list</h3>
                    {adminsLoading ? (
                      <p className="text-xs text-slate-500">Loading...</p>
                    ) : admins.length === 0 ? (
                      <p className="text-xs text-slate-500">No admins in list yet. First admin is auto-added from ADMIN_EMAIL on sign-in.</p>
                    ) : (
                      <ul className="space-y-2">
                        {admins.map((email) => (
                          <li
                            key={email}
                            className="flex items-center justify-between py-2 px-3 bg-slate-50 rounded font-mono text-xs"
                          >
                            <span>{email}</span>
                            <button
                              onClick={() => handleDemote(email)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Remove admin (env ADMIN_EMAIL cannot be removed)"
                            >
                              <UserMinus className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
