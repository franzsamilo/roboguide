"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database, FileText, Trash2, Edit3, Plus, Eye, BookOpen,
  Cpu, Radio, Zap, ChevronRight, Users, Activity
} from "lucide-react";
import {
  getRegistryItems,
  deleteRegistryItem,
  getCategoriesWithCounts,
} from "@/lib/firebase/registryService";
import { getAllGuides, deleteGuide } from "@/lib/firebase/guideService";
import { PageSkeleton } from "@/components/ui/Skeletons";
import EmptyState from "@/components/ui/EmptyState";
import type { RegistryItem, Guide, Category } from "@/lib/schemas";
import Link from "next/link";

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [items, setItems] = useState<RegistryItem[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"components" | "guides">("components");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [itemsResult, guidesResult, catsResult] = await Promise.all([
        getRegistryItems({ status: undefined }),
        getAllGuides(),
        getCategoriesWithCounts(),
      ]);
      setItems(itemsResult.items);
      setGuides(guidesResult);
      setCategories(catsResult);
    } catch (err) {
      toast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

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

  if (authLoading || !user) return null;

  const totalComponents = items.length;
  const totalGuides = guides.length;
  const publishedComponents = items.filter((i) => i.status === "published").length;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-widest">
                  Admin Console Active
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tighter uppercase font-sans">Control Panel</h1>
              <p className="text-slate-500 font-mono text-sm mt-1">ADMIN_ACCESS // {user.displayName}</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Components", value: totalComponents, icon: Database },
            { label: "Published", value: publishedComponents, icon: Eye },
            { label: "Guides", value: totalGuides, icon: BookOpen },
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
        <div className="flex border-b border-slate-200 mb-8">
          {(["components", "guides"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest transition-all border-b-2 -mb-[1px] ${
                activeTab === tab
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab === "components" ? (
                <span className="flex items-center gap-2"><Database className="h-3 w-3" /> Components ({totalComponents})</span>
              ) : (
                <span className="flex items-center gap-2"><BookOpen className="h-3 w-3" /> Guides ({totalGuides})</span>
              )}
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
                        <div className="w-12 h-12 bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
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
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                        <ChevronRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
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
                        <div className="w-12 h-12 bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold truncate">{guide.title}</h3>
                          <p className="text-[10px] font-mono text-slate-400 uppercase">
                            linked: {guide.registrySlug} • {guide.hyperlocalTags.join(", ") || "no tags"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
          </AnimatePresence>
        )}
      </main>
    </div>
  );
}
