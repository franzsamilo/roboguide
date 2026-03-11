"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import MediaUploader from "@/components/admin/MediaUploader";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { getRegistryItemById } from "@/lib/firebase/registryService";
import { updateRegistryItem } from "@/lib/api/registry";
import { CATEGORIES } from "@/lib/schemas";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, X, Loader2 } from "lucide-react";
import { PageSkeleton } from "@/components/ui/Skeletons";
import ErrorState from "@/components/ui/ErrorState";
import type { RegistryItem } from "@/lib/schemas";
import Link from "next/link";

export default function EditComponentPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<RegistryItem>>({});

  const [tagInput, setTagInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [relatedInput, setRelatedInput] = useState("");

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!id || !user) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const item = await getRegistryItemById(id as string);
        if (!item) { setError("Component not found."); return; }
        setForm(item);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  if (authLoading || !user) return null;

  const addTag = () => {
    if (tagInput.trim() && !(form.tags || []).includes(tagInput.trim())) {
      setForm((p) => ({ ...p, tags: [...(p.tags || []), tagInput.trim()] }));
      setTagInput("");
    }
  };

  const addSpec = () => {
    if (specKey.trim()) {
      setForm((p) => ({ ...p, specifications: { ...(p.specifications || {}), [specKey.trim()]: specValue.trim() } }));
      setSpecKey(""); setSpecValue("");
    }
  };

  const addRelated = () => {
    const slug = relatedInput.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
    if (slug && !(form.relatedSlugs || []).includes(slug)) {
      setForm((p) => ({ ...p, relatedSlugs: [...(p.relatedSlugs || []), slug] }));
      setRelatedInput("");
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.category) {
      toast("Name, slug, and category are required.", "error");
      return;
    }
    setSaving(true);
    try {
      const { id: _, createdAt, ...data } = form;
      await updateRegistryItem(id as string, data);
      toast("Component updated!", "success");
      router.push("/admin");
    } catch (err: any) {
      toast(err.message || "Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/admin" className="flex items-center gap-2 mb-8 font-mono text-xs text-slate-500 hover:text-blue-500 transition-colors uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tighter uppercase font-sans">Edit Component</h1>
          <p className="text-slate-500 font-mono text-sm mt-1">REGISTRY_UPDATE // {form.slug || "..."}</p>
        </header>

        {loading ? (
          <PageSkeleton />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <div className="space-y-8">
            {/* Basic Info */}
            <div className="technical-card p-6 space-y-6">
              <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Name *</label>
                  <input value={form.name || ""} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Slug *</label>
                  <input value={form.slug || ""} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                    className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Category *</label>
                  <select value={form.category || ""} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full p-3 border border-technical-border font-mono text-sm bg-white focus:border-blue-500 outline-none">
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Status</label>
                  <select value={form.status || "published"} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))}
                    className="w-full p-3 border border-technical-border font-mono text-sm bg-white focus:border-blue-500 outline-none">
                    <option value="published">PUBLISHED</option>
                    <option value="draft">DRAFT</option>
                    <option value="archived">ARCHIVED</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Description</label>
                <textarea value={form.description || ""} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4} className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 outline-none resize-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Primary Image URL</label>
                  <input value={form.image || ""} onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                    className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 outline-none" />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Datasheet Link</label>
                  <input value={form.datasheet || ""} onChange={(e) => setForm((p) => ({ ...p, datasheet: e.target.value }))}
                    className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 outline-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Pinout (URL or image link)</label>
                <input value={form.pinout || ""} onChange={(e) => setForm((p) => ({ ...p, pinout: e.target.value }))}
                  placeholder="https://... or image URL for pinout diagram"
                  className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Related Components</label>
                <div className="flex gap-2">
                  <input value={relatedInput} onChange={(e) => setRelatedInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRelated())}
                    placeholder="Add slug (e.g. esp32-wroom)"
                    className="flex-1 p-3 border border-technical-border font-mono text-sm outline-none focus:border-blue-500" />
                  <button type="button" onClick={addRelated} className="px-4 border border-technical-border hover:bg-slate-50">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(form.relatedSlugs || []).map((slug) => (
                    <span key={slug} className="flex items-center gap-1 px-2 py-1 bg-slate-100 font-mono text-[10px] border border-slate-200 uppercase">
                      {slug}
                      <button type="button" onClick={() => setForm((p) => ({ ...p, relatedSlugs: (p.relatedSlugs || []).filter((s) => s !== slug) }))}>
                        <X className="h-3 w-3 text-slate-400 hover:text-red-500" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="technical-card p-6 space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Tags</h2>
              <div className="flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  placeholder="Add tag..." className="flex-1 p-3 border border-technical-border font-mono text-sm outline-none focus:border-blue-500" />
                <button onClick={addTag} className="px-4 border border-technical-border hover:bg-slate-50"><Plus className="h-4 w-4" /></button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.tags || []).map((tag) => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-slate-100 font-mono text-[10px] border border-slate-200 uppercase">
                    {tag} <button onClick={() => setForm((p) => ({ ...p, tags: (p.tags || []).filter((t) => t !== tag) }))}><X className="h-3 w-3 text-slate-400 hover:text-red-500" /></button>
                  </span>
                ))}
              </div>
            </div>

            {/* Specifications */}
            <div className="technical-card p-6 space-y-4">
              <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Technical Specifications</h2>
              <div className="flex gap-2">
                <input value={specKey} onChange={(e) => setSpecKey(e.target.value)} placeholder="Key"
                  className="flex-1 p-3 border border-technical-border font-mono text-sm outline-none focus:border-blue-500" />
                <input value={specValue} onChange={(e) => setSpecValue(e.target.value)} placeholder="Value"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpec())}
                  className="flex-1 p-3 border border-technical-border font-mono text-sm outline-none focus:border-blue-500" />
                <button onClick={addSpec} className="px-4 border border-technical-border hover:bg-slate-50"><Plus className="h-4 w-4" /></button>
              </div>
              {form.specifications && Object.keys(form.specifications).length > 0 && (
                <div className="border border-slate-200 divide-y">
                  {Object.entries(form.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between px-4 py-2">
                      <span className="font-mono text-xs text-slate-500 uppercase">{key}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold">{value}</span>
                        <button onClick={() => { const { [key]: _, ...rest } = form.specifications!; setForm((p) => ({ ...p, specifications: rest })); }}>
                          <X className="h-3 w-3 text-slate-400 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Media */}
            <div className="technical-card p-6">
              <MediaUploader basePath={`registry/${form.slug || "temp"}`} existingUrls={form.mediaUrls || []}
                onChange={(urls) => setForm((p) => ({ ...p, mediaUrls: urls }))} />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
              <Link href="/admin" className="px-6 py-3 border border-slate-200 font-mono text-xs font-bold uppercase hover:bg-slate-50 transition-all">Cancel</Link>
              <button onClick={handleSave} disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? "Saving..." : "Update Component"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
