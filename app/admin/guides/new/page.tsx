"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import MediaUploader from "@/components/admin/MediaUploader";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { addGuide } from "@/lib/firebase/guideService";
import { getRegistryItems } from "@/lib/firebase/registryService";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Plus, X, Loader2, MapPin } from "lucide-react";
import type { RegistryItem } from "@/lib/schemas";
import Link from "next/link";

const REGION_SUGGESTIONS = [
  "Region: Philippines", "Region: SE Asia", "Region: Global",
  "Region: USA", "Region: Europe", "Region: India", "Region: China",
];

const SUPPLIER_SUGGESTIONS = [
  "Supplier: AliExpress", "Supplier: Shopee", "Supplier: Lazada",
  "Supplier: DigiKey", "Supplier: Mouser", "Supplier: Amazon",
  "Supplier: Local Store",
];

function NewGuidePageInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [saving, setSaving] = useState(false);
  const [registryItems, setRegistryItems] = useState<RegistryItem[]>([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    registrySlug: searchParams.get("slug") || "",
    hyperlocalTags: [] as string[],
    mediaUrls: [] as string[],
    status: "published" as "draft" | "published",
  });
  const [customTag, setCustomTag] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    getRegistryItems({}).then((result) => setRegistryItems(result.items)).catch(() => {});
  }, []);

  if (authLoading || !user) return null;

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      hyperlocalTags: prev.hyperlocalTags.includes(tag)
        ? prev.hyperlocalTags.filter((t) => t !== tag)
        : [...prev.hyperlocalTags, tag],
    }));
  };

  const addCustomTag = () => {
    if (customTag.trim() && !form.hyperlocalTags.includes(customTag.trim())) {
      setForm((prev) => ({ ...prev, hyperlocalTags: [...prev.hyperlocalTags, customTag.trim()] }));
      setCustomTag("");
    }
  };

  const handleSubmit = async () => {
    if (!form.title || !form.content || !form.registrySlug) {
      toast("Title, content, and linked component are required.", "error");
      return;
    }
    setSaving(true);
    try {
      await addGuide({
        ...form,
        authorId: user.uid,
        authorName: user.displayName || "Unknown",
      });
      toast(`Guide "${form.title}" created!`, "success");
      router.push("/admin");
    } catch (err: any) {
      toast(err.message || "Failed to save guide", "error");
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
          <h1 className="text-4xl font-bold tracking-tighter uppercase font-sans">New Guide</h1>
          <p className="text-slate-500 font-mono text-sm mt-1">HYPERLOCAL_KNOWLEDGE // CREATE_GUIDE</p>
        </header>

        <div className="space-y-8">
          {/* Basic Info */}
          <div className="technical-card p-6 space-y-6">
            <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Guide Details</h2>

            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Linked Component *</label>
              <select
                value={form.registrySlug}
                onChange={(e) => setForm((prev) => ({ ...prev, registrySlug: e.target.value }))}
                className="w-full p-3 border border-technical-border font-mono text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              >
                <option value="">SELECT_COMPONENT...</option>
                {registryItems.map((item) => (
                  <option key={item.slug} value={item.slug}>{item.name} ({item.slug})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Buying ESP32 in Manila — Best Stores Guide"
                className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Short Excerpt</label>
              <input
                value={form.excerpt}
                onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Brief summary shown in previews..."
                maxLength={300}
                className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Content *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                rows={12}
                placeholder="Full guide content. Include setup instructions, tips, local supplier info, pricing..."
                className="w-full p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none"
              />
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

          {/* Hyperlocal Tags */}
          <div className="technical-card p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
              <MapPin className="h-3 w-3" /> Hyperlocal Tags
            </h2>
            <p className="text-xs text-slate-500">Select or add tags that describe the regional context of this guide.</p>

            <div className="space-y-3">
              <p className="font-mono text-[10px] text-slate-400 uppercase">Regions</p>
              <div className="flex flex-wrap gap-2">
                {REGION_SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 font-mono text-[10px] uppercase border transition-all ${
                      form.hyperlocalTags.includes(tag)
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-[10px] text-slate-400 uppercase">Suppliers</p>
              <div className="flex flex-wrap gap-2">
                {SUPPLIER_SUGGESTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 font-mono text-[10px] uppercase border transition-all ${
                      form.hyperlocalTags.includes(tag)
                        ? "bg-slate-900 text-white border-slate-900"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                placeholder="Add custom tag..."
                className="flex-1 p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
              />
              <button onClick={addCustomTag} className="px-4 border border-technical-border hover:bg-slate-50 transition-all">
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {form.hyperlocalTags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {form.hyperlocalTags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 text-white font-mono text-[9px] uppercase tracking-wider">
                    <MapPin className="h-3 w-3 text-blue-400" />
                    {tag}
                    <button onClick={() => toggleTag(tag)}>
                      <X className="h-3 w-3 text-slate-400 hover:text-red-300" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Media */}
          <div className="technical-card p-6">
            <MediaUploader
              basePath={`guides/${form.registrySlug || "temp"}`}
              existingUrls={form.mediaUrls}
              onChange={(urls) => setForm((prev) => ({ ...prev, mediaUrls: urls }))}
            />
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
              {saving ? "Creating..." : "Create Guide"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function NewGuidePage() {
  return (
    <Suspense>
      <NewGuidePageInner />
    </Suspense>
  );
}
