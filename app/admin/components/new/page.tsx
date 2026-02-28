"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import MediaUploader from "@/components/admin/MediaUploader";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { addRegistryItem } from "@/lib/firebase/registryService";
import { CATEGORIES } from "@/lib/schemas";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewComponentPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    description: "",
    image: "",
    datasheet: "",
    pinout: "",
    tags: [] as string[],
    specifications: {} as Record<string, string | number>,
    mediaUrls: [] as string[],
    relatedSlugs: [] as string[],
    status: "published" as "draft" | "published",
  });

  const [tagInput, setTagInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [relatedInput, setRelatedInput] = useState("");

  if (authLoading) return null;
  if (!user) { router.push("/"); return null; }

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleNameChange = (name: string) => {
    setForm((prev) => ({
      ...prev,
      name,
      slug: prev.slug || autoSlug(name),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !form.tags.includes(tagInput.trim())) {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput("");
    }
  };

  const addSpec = () => {
    if (specKey.trim()) {
      setForm((prev) => ({
        ...prev,
        specifications: { ...prev.specifications, [specKey.trim()]: specValue.trim() },
      }));
      setSpecKey("");
      setSpecValue("");
    }
  };

  const addRelated = () => {
    if (relatedInput.trim() && !form.relatedSlugs.includes(relatedInput.trim())) {
      setForm((prev) => ({ ...prev, relatedSlugs: [...prev.relatedSlugs, relatedInput.trim()] }));
      setRelatedInput("");
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.slug || !form.category) {
      toast("Name, slug, and category are required.", "error");
      return;
    }
    setSaving(true);
    try {
      await addRegistryItem({
        ...form,
        authorId: user.uid,
        authorName: user.displayName || "Unknown",
      });
      toast(`"${form.name}" added to registry!`, "success");
      router.push("/admin");
    } catch (err: any) {
      toast(err.message || "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/admin" className="flex items-center gap-2 mb-8 font-mono text-xs text-slate-500 hover:text-blue-500 transition-colors uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Back to Admin
        </Link>

        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tighter uppercase font-sans">New Component</h1>
          <p className="text-slate-500 font-mono text-sm mt-1">REGISTRY_INPUT // CREATE_ENTRY</p>
        </header>

        <div className="space-y-8">
          {/* Basic Info */}
          <div className="technical-card p-6 space-y-6">
            <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Name *</label>
                <input
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. ESP32-WROOM-32D"
                  className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Slug *</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="esp32-wroom-32d"
                  className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-technical-border font-mono text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="">SELECT_CATEGORY...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as "draft" | "published" }))}
                  className="w-full p-3 border border-technical-border font-mono text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                >
                  <option value="published">PUBLISHED</option>
                  <option value="draft">DRAFT</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                placeholder="Detailed technical description..."
                className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Primary Image URL</label>
                <input
                  value={form.image}
                  onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Datasheet Link</label>
                <input
                  value={form.datasheet}
                  onChange={(e) => setForm((prev) => ({ ...prev, datasheet: e.target.value }))}
                  placeholder="https://...pdf"
                  className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="technical-card p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Tags</h2>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                placeholder="Add tag..."
                className="flex-1 p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
              <button onClick={addTag} className="px-4 border border-technical-border hover:bg-slate-50 transition-all">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span key={tag} className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200 uppercase">
                  {tag}
                  <button onClick={() => setForm((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }))}>
                    <X className="h-3 w-3 text-slate-400 hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Specifications */}
          <div className="technical-card p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Technical Specifications</h2>
            <div className="flex gap-2">
              <input
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                placeholder="Key (e.g. Voltage)"
                className="flex-1 p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
              <input
                value={specValue}
                onChange={(e) => setSpecValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSpec())}
                placeholder="Value (e.g. 3.3V)"
                className="flex-1 p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
              <button onClick={addSpec} className="px-4 border border-technical-border hover:bg-slate-50 transition-all">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {Object.keys(form.specifications).length > 0 && (
              <div className="border border-slate-200 divide-y">
                {Object.entries(form.specifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between px-4 py-2">
                    <span className="font-mono text-xs text-slate-500 uppercase">{key}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold">{value}</span>
                      <button onClick={() => {
                        const { [key]: _, ...rest } = form.specifications;
                        setForm((prev) => ({ ...prev, specifications: rest }));
                      }}>
                        <X className="h-3 w-3 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Media Upload */}
          <div className="technical-card p-6">
            <MediaUploader
              basePath={`registry/${form.slug || "temp"}`}
              existingUrls={form.mediaUrls}
              onChange={(urls) => setForm((prev) => ({ ...prev, mediaUrls: urls }))}
            />
          </div>

          {/* Related Components */}
          <div className="technical-card p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Related Components</h2>
            <div className="flex gap-2">
              <input
                value={relatedInput}
                onChange={(e) => setRelatedInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRelated())}
                placeholder="Related component slug..."
                className="flex-1 p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
              <button onClick={addRelated} className="px-4 border border-technical-border hover:bg-slate-50 transition-all">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.relatedSlugs.map((s) => (
                <span key={s} className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 text-slate-600 font-mono text-[10px] border border-slate-200">
                  {s}
                  <button onClick={() => setForm((prev) => ({ ...prev, relatedSlugs: prev.relatedSlugs.filter((r) => r !== s) }))}>
                    <X className="h-3 w-3 text-slate-400 hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4">
            <Link href="/admin" className="px-6 py-3 border border-slate-200 font-mono text-xs font-bold uppercase hover:bg-slate-50 transition-all">
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Component"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
