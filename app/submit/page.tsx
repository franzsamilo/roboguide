"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import MediaUploader from "@/components/admin/MediaUploader";
import SingleFileUpload from "@/components/admin/SingleFileUpload";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { addRegistryItem } from "@/lib/api/registry";
import { getRegistryItems } from "@/lib/firebase/registryService";
import { addProject } from "@/lib/api/projects";
import { CATEGORIES } from "@/lib/schemas";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Send, ArrowRight, ArrowLeft, CheckCircle2, Plus, X, Loader2, FolderOpen, Code } from "lucide-react";
import Link from "next/link";

function SubmitPageInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const initialType = searchParams.get("type") || "component";

  const [submitType, setSubmitType] = useState<"component" | "project">(initialType as "component" | "project");
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Component form
  const [compForm, setCompForm] = useState({
    name: "", slug: "", category: "", description: "",
    tags: [] as string[], specifications: {} as Record<string, string>,
    mediaUrls: [] as string[], image: "", datasheet: "",
    relatedSlugs: [] as string[],
  });
  const [slugConflict, setSlugConflict] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");
  const [registryItems, setRegistryItems] = useState<{ id?: string; slug: string; name: string }[]>([]);

  // Project form
  const [projForm, setProjForm] = useState({
    title: "", description: "", content: "", code: "", codeLanguage: "cpp",
    tags: [] as string[], mediaUrls: [] as string[], coverImage: "",
    parts: [] as { name: string; quantity: number; registrySlug?: string; notes?: string }[],
  });
  const [projTagInput, setProjTagInput] = useState("");
  const [partName, setPartName] = useState("");
  const [partQty, setPartQty] = useState(1);

  useEffect(() => {
    if (submitType === "component") {
      getRegistryItems({ status: "published", pageSize: 100 }).then((r) =>
        setRegistryItems(r.items.map((i) => ({ id: i.id, slug: i.slug, name: i.name })))
      );
    }
  }, [submitType]);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow flex items-center justify-center px-4">
          <div className="card-flat p-12 text-center max-w-md">
            <Cpu className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h2>
            <p className="text-gray-500 text-sm mb-6">Sign in with Google to contribute to ROBOGUIDE.</p>
            <p className="text-xs text-gray-400">Use the Sign In button in the navigation bar</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const randomSlug = () => {
    const adjectives = ["smart", "micro", "tiny", "pro", "mini", "ultra", "mega", "nano", "core", "dual"];
    const nouns = ["chip", "board", "module", "sensor", "unit", "device", "controller", "driver", "shield", "hat"];
    const a = adjectives[Math.floor(Math.random() * adjectives.length)];
    const n = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 999) + 1;
    return `${a}-${n}-${num}`;
  };

  const totalSteps = 3;

  const handleComponentSubmit = async () => {
    setSlugConflict(false);
    setSaving(true);
    const slug = compForm.slug || autoSlug(compForm.name);
    try {
      await addRegistryItem({
        ...compForm,
        slug,
        status: "published",
        authorId: user.id,
        authorName: user.name || "Unknown",
        relatedSlugs: compForm.relatedSlugs || [],
      });
      toast("Component added to registry!", "success");
      setStep(4);
    } catch (err: any) {
      const msg = err.message || "Submission failed";
      if (msg.toLowerCase().includes("slug") && msg.toLowerCase().includes("exist")) {
        setSlugConflict(true);
        const suggested = slug.replace(/-?\d*$/, "") + "-2";
        setCompForm((p) => ({ ...p, slug: suggested }));
        setStep(1);
        toast(`Slug "${slug}" is taken. Suggested "${suggested}" — edit if needed and continue.`, "error");
      } else {
        toast(msg, "error");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleProjectSubmit = async () => {
    setSaving(true);
    try {
      await addProject({
        ...projForm,
        status: "published",
        authorId: user.id,
        authorName: user.name || "Unknown",
      });
      toast("Project published!", "success");
      setStep(4);
    } catch (err: any) {
      toast(err.message || "Submission failed", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 mb-4">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-blue-600">Contributor Mode</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Contribute to ROBOGUIDE</h1>
          <p className="text-gray-500 text-sm mt-2">Share your knowledge with the community</p>
        </header>

        {/* Type Selector */}
        {step < 4 && (
          <div className="flex mb-8 gap-4">
            <button
              onClick={() => { setSubmitType("component"); setStep(1); }}
              className={`flex-1 p-5 card-flat flex items-center gap-3 transition-all ${
                submitType === "component" ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" : "hover:border-gray-300"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${submitType === "component" ? "bg-blue-100" : "bg-gray-100"}`}>
                <Cpu className={`h-5 w-5 ${submitType === "component" ? "text-blue-600" : "text-gray-400"}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Component</p>
                <p className="text-xs text-gray-500">Add to hardware registry</p>
              </div>
            </button>
            <button
              onClick={() => { setSubmitType("project"); setStep(1); }}
              className={`flex-1 p-5 card-flat flex items-center gap-3 transition-all ${
                submitType === "project" ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" : "hover:border-gray-300"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${submitType === "project" ? "bg-blue-100" : "bg-gray-100"}`}>
                <FolderOpen className={`h-5 w-5 ${submitType === "project" ? "text-blue-600" : "text-gray-400"}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">Project</p>
                <p className="text-xs text-gray-500">Share a build</p>
              </div>
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {step < 4 && (
          <div className="bg-gray-200 rounded-full h-1.5 mb-8 overflow-hidden">
            <motion.div
              className="bg-blue-600 h-full rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ─── COMPONENT FLOW ─── */}
          {submitType === "component" && step === 1 && (
            <motion.div key="comp1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="form-label">Name *</label>
                  <input
                    value={compForm.name}
                    onChange={(e) => setCompForm((p) => ({ ...p, name: e.target.value, slug: p.slug || autoSlug(e.target.value) }))}
                    placeholder="e.g. ESP32-WROOM-32"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Category *</label>
                  <select
                    value={compForm.category}
                    onChange={(e) => setCompForm((p) => ({ ...p, category: e.target.value }))}
                    className="form-input"
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">URL slug *</label>
                <div className="flex gap-2">
                  <input
                    value={compForm.slug || autoSlug(compForm.name)}
                    onChange={(e) => setCompForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/(^-|-$)/g, "") }))}
                    placeholder="e.g. esp32-wroom-32"
                    className={`form-input font-mono flex-1 ${slugConflict ? "border-amber-500 ring-1 ring-amber-500" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setCompForm((p) => ({ ...p, slug: randomSlug() }))}
                    className="btn-outline px-4 shrink-0 font-mono text-xs"
                    title="Generate random slug"
                  >
                    Random
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Must be unique. Used in URLs like /wiki/your-slug</p>
                {slugConflict && <p className="text-xs text-amber-600 mt-1">A unique slug was suggested above. Edit if needed, then submit again.</p>}
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={compForm.description}
                  onChange={(e) => setCompForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder="Technical description and use cases..."
                  className="form-input resize-none"
                />
              </div>
            </motion.div>
          )}

          {submitType === "component" && step === 2 && (
            <motion.div key="comp2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-3">
                <label className="form-label">Tags</label>
                <div className="flex gap-2">
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (tagInput.trim()) { setCompForm((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] })); setTagInput(""); } } }}
                    placeholder="Add tag..." className="form-input flex-1" />
                  <button onClick={() => { if (tagInput.trim()) { setCompForm((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] })); setTagInput(""); } }}
                    className="btn-outline px-3"><Plus className="h-4 w-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {compForm.tags.map((tag) => (
                    <span key={tag} className="badge flex items-center gap-1">
                      {tag} <button onClick={() => setCompForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))}><X className="h-3 w-3 text-gray-400 hover:text-red-500" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="form-label">Specifications</label>
                <div className="flex gap-2">
                  <input value={specKey} onChange={(e) => setSpecKey(e.target.value)} placeholder="Key" className="form-input flex-1" />
                  <input value={specValue} onChange={(e) => setSpecValue(e.target.value)} placeholder="Value"
                    onKeyDown={(e) => { if (e.key === "Enter" && specKey.trim()) { e.preventDefault(); setCompForm((p) => ({ ...p, specifications: { ...p.specifications, [specKey.trim()]: specValue.trim() } })); setSpecKey(""); setSpecValue(""); } }}
                    className="form-input flex-1" />
                  <button onClick={() => { if (specKey.trim()) { setCompForm((p) => ({ ...p, specifications: { ...p.specifications, [specKey.trim()]: specValue.trim() } })); setSpecKey(""); setSpecValue(""); } }}
                    className="btn-outline px-3"><Plus className="h-4 w-4" /></button>
                </div>
                {Object.entries(compForm.specifications).length > 0 && (
                  <div className="card-flat divide-y divide-gray-100 overflow-hidden">
                    {Object.entries(compForm.specifications).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between px-4 py-2.5">
                        <span className="text-sm text-gray-500">{k}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-800">{v}</span>
                          <button onClick={() => { const { [k]: _, ...rest } = compForm.specifications; setCompForm((p) => ({ ...p, specifications: rest })); }}>
                            <X className="h-3.5 w-3.5 text-gray-400 hover:text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {submitType === "component" && step === 3 && (
            <motion.div key="comp3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <label className="form-label">Main Image</label>
                <p className="text-xs text-gray-500 mb-2">Upload the primary image for this component.</p>
                <SingleFileUpload
                  basePath={`submissions/${compForm.slug || "temp"}`}
                  value={compForm.image}
                  onChange={(url) => setCompForm((p) => ({ ...p, image: url }))}
                  accept="image"
                />
                <input
                  value={compForm.image}
                  onChange={(e) => setCompForm((p) => ({ ...p, image: e.target.value }))}
                  placeholder="Or paste image URL..."
                  className="form-input mt-2"
                />
              </div>
              <div>
                <label className="form-label">Datasheet (PDF)</label>
                <SingleFileUpload
                  basePath={`submissions/${compForm.slug || "temp"}/datasheets`}
                  value={compForm.datasheet}
                  onChange={(url) => setCompForm((p) => ({ ...p, datasheet: url }))}
                  accept="pdf"
                />
                <input
                  value={compForm.datasheet}
                  onChange={(e) => setCompForm((p) => ({ ...p, datasheet: e.target.value }))}
                  placeholder="Or paste datasheet URL..."
                  className="form-input mt-2"
                />
              </div>
              <div>
                <label className="form-label">Related Components</label>
                <p className="text-xs text-gray-500 mb-2">Link to other components in the registry.</p>
                <select
                  onChange={(e) => {
                    const slug = e.target.value;
                    if (slug && !compForm.relatedSlugs.includes(slug)) {
                      setCompForm((p) => ({ ...p, relatedSlugs: [...p.relatedSlugs, slug] }));
                    }
                    e.target.value = "";
                  }}
                  className="form-input"
                >
                  <option value="">-- Select component --</option>
                  {registryItems
                    .filter((i) => !compForm.relatedSlugs.includes(i.slug))
                    .map((i) => (
                      <option key={i.slug} value={i.slug}>{i.name} ({i.slug})</option>
                    ))}
                </select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {compForm.relatedSlugs.map((s) => (
                    <span key={s} className="badge flex items-center gap-1">
                      {registryItems.find((r) => r.slug === s)?.name || s}
                      <button onClick={() => setCompForm((p) => ({ ...p, relatedSlugs: p.relatedSlugs.filter((r) => r !== s) }))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <MediaUploader basePath={`submissions/${compForm.slug || "temp"}`} existingUrls={compForm.mediaUrls}
                onChange={(urls) => setCompForm((p) => ({ ...p, mediaUrls: urls }))} />
              <div className="card-flat p-8 text-center bg-gray-50">
                <Cpu className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">Ready to submit?</p>
                <p className="text-xs text-gray-500">Your component will be added to the registry and visible to everyone.</p>
              </div>
            </motion.div>
          )}

          {/* ─── PROJECT FLOW ─── */}
          {submitType === "project" && step === 1 && (
            <motion.div key="proj1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <label className="form-label">Project Title *</label>
                <input value={projForm.title} onChange={(e) => setProjForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Solar-Powered Weather Station" className="form-input" />
              </div>
              <div>
                <label className="form-label">Description *</label>
                <textarea value={projForm.description} onChange={(e) => setProjForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Brief overview of your project..." className="form-input resize-none" />
              </div>
              <div>
                <label className="form-label">Detailed Write-up</label>
                <textarea value={projForm.content} onChange={(e) => setProjForm((p) => ({ ...p, content: e.target.value }))}
                  rows={8} placeholder="Full project details, build process, lessons learned..." className="form-input resize-none" />
              </div>
            </motion.div>
          )}

          {submitType === "project" && step === 2 && (
            <motion.div key="proj2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-3">
                <label className="form-label">Parts List</label>
                <p className="text-xs text-gray-500 mb-3">Add components and materials used in your project. Enter part name, set quantity, then click Add.</p>
                <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Part name</label>
                    <input
                      value={partName}
                      onChange={(e) => setPartName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (partName.trim()) {
                            setProjForm((p) => ({ ...p, parts: [...p.parts, { name: partName.trim(), quantity: partQty }] }));
                            setPartName("");
                            setPartQty(1);
                          }
                        }
                      }}
                      placeholder="e.g. ESP32-WROOM-32"
                      className="form-input w-full"
                    />
                  </div>
                  <div className="w-24 shrink-0">
                    <label className="text-[10px] font-mono text-gray-500 uppercase block mb-1">Qty</label>
                    <input
                      type="number"
                      value={partQty}
                      onChange={(e) => setPartQty(Math.max(1, parseInt(e.target.value) || 1))}
                      min={1}
                      className="form-input w-full text-center"
                    />
                  </div>
                  <button
                    onClick={() => {
                      if (partName.trim()) {
                        setProjForm((p) => ({ ...p, parts: [...p.parts, { name: partName.trim(), quantity: partQty }] }));
                        setPartName("");
                        setPartQty(1);
                      }
                    }}
                    disabled={!partName.trim()}
                    className="btn-outline px-4 py-2.5 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="h-4 w-4 inline mr-1" /> Add
                  </button>
                </div>
                {projForm.parts.length > 0 && (
                  <div className="card-flat divide-y divide-gray-100 overflow-hidden mt-4">
                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-gray-500 uppercase">Added parts</span>
                      <span className="text-xs text-gray-400">{projForm.parts.length} parts</span>
                    </div>
                    {projForm.parts.map((part, i) => (
                      <div key={i} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-gray-50/50">
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-gray-800">{part.name}</span>
                          <span className="text-sm text-gray-500 ml-2">× {part.quantity}</span>
                        </div>
                        <button
                          onClick={() => setProjForm((p) => ({ ...p, parts: p.parts.filter((_, j) => j !== i) }))}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="form-label">Source Code</label>
                <select value={projForm.codeLanguage} onChange={(e) => setProjForm((p) => ({ ...p, codeLanguage: e.target.value }))}
                  className="form-input w-auto">
                  <option value="cpp">C++</option><option value="python">Python</option><option value="javascript">JavaScript</option><option value="c">C</option>
                </select>
                <textarea value={projForm.code} onChange={(e) => setProjForm((p) => ({ ...p, code: e.target.value }))}
                  rows={10} placeholder="Paste your code here..." className="form-input resize-none font-mono text-sm bg-gray-900 text-gray-300 border-gray-700" />
              </div>
            </motion.div>
          )}

          {submitType === "project" && step === 3 && (
            <motion.div key="proj3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-3">
                <label className="form-label">Cover Image</label>
                <p className="text-xs text-gray-500 mb-2">Upload an image or add a YouTube URL. The first item will be used as the cover.</p>
                <MediaUploader
                  basePath={`projects/${projForm.title ? projForm.title.toLowerCase().replace(/\s+/g, "-") : "temp"}`}
                  existingUrls={projForm.coverImage ? [projForm.coverImage] : []}
                  onChange={(urls) => setProjForm((p) => ({ ...p, coverImage: urls[0] || "" }))}
                  maxFiles={1}
                />
              </div>
              <div className="space-y-3">
                <label className="form-label">Media Gallery</label>
                <p className="text-xs text-gray-500 mb-2">Additional images and videos for your project.</p>
                <MediaUploader
                  basePath={`projects/${projForm.title ? projForm.title.toLowerCase().replace(/\s+/g, "-") : "temp"}`}
                  existingUrls={projForm.mediaUrls.filter((u) => u !== projForm.coverImage)}
                  onChange={(urls) => setProjForm((p) => ({ ...p, mediaUrls: urls }))}
                />
              </div>
              <div className="space-y-3">
                <label className="form-label">Tags</label>
                <div className="flex gap-2">
                  <input value={projTagInput} onChange={(e) => setProjTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && projTagInput.trim()) { e.preventDefault(); setProjForm((p) => ({ ...p, tags: [...p.tags, projTagInput.trim()] })); setProjTagInput(""); } }}
                    placeholder="Add tag..." className="form-input flex-1" />
                  <button onClick={() => { if (projTagInput.trim()) { setProjForm((p) => ({ ...p, tags: [...p.tags, projTagInput.trim()] })); setProjTagInput(""); } }}
                    className="btn-outline px-3"><Plus className="h-4 w-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {projForm.tags.map((tag) => (
                    <span key={tag} className="badge flex items-center gap-1">
                      {tag} <button onClick={() => setProjForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))}><X className="h-3 w-3 text-gray-400 hover:text-red-500" /></button>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {step === 4 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="card-flat p-12 text-center border-2 border-emerald-200 bg-emerald-50/30"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", damping: 12 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 mb-6"
              >
                <CheckCircle2 className="h-14 w-14 text-emerald-600" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {submitType === "component" ? "Component Submitted!" : "Project Published!"}
              </h2>
              <p className="text-gray-600 text-sm mb-2 max-w-md mx-auto">
                {submitType === "component"
                  ? "Your component has been added to the registry and is now visible to the community."
                  : "Your project is now live! Thank you for sharing with the community."}
              </p>
              <p className="text-emerald-600 text-sm font-medium mb-8">Success!</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => router.push(submitType === "component" ? "/wiki" : "/projects")}
                  className="btn-primary"
                >
                  {submitType === "component" ? "Browse Wiki" : "View Projects"}
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setCompForm({ name: "", slug: "", category: "", description: "", tags: [], specifications: {}, mediaUrls: [], image: "", datasheet: "", relatedSlugs: [] });
                    setProjForm({ title: "", description: "", content: "", code: "", codeLanguage: "cpp", tags: [], mediaUrls: [], coverImage: "", parts: [] });
                  }}
                  className="btn-outline"
                >
                  Submit Another
                </button>
                <button onClick={() => router.push("/profile")} className="btn-outline">
                  View My Profile
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex justify-between pt-8 border-t border-gray-200 mt-8">
            <button onClick={() => setStep((s) => Math.max(s - 1, 1))} disabled={step === 1}
              className="btn-outline disabled:opacity-0">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step === totalSteps ? (
              <button onClick={submitType === "component" ? handleComponentSubmit : handleProjectSubmit} disabled={saving}
                className="btn-primary disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {saving ? "Submitting..." : submitType === "component" ? "Submit Component" : "Publish Project"}
              </button>
            ) : (
              <button onClick={() => setStep((s) => Math.min(s + 1, totalSteps))}
                className="btn-primary">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense>
      <SubmitPageInner />
    </Suspense>
  );
}
