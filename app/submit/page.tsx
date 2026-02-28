"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import MediaUploader from "@/components/admin/MediaUploader";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { addRegistryItem } from "@/lib/firebase/registryService";
import { addProject } from "@/lib/firebase/projectService";
import { CATEGORIES } from "@/lib/schemas";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Send, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, Plus, X, Loader2, FolderOpen, Code } from "lucide-react";
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
    mediaUrls: [] as string[], image: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [specKey, setSpecKey] = useState("");
  const [specValue, setSpecValue] = useState("");

  // Project form
  const [projForm, setProjForm] = useState({
    title: "", description: "", content: "", code: "", codeLanguage: "cpp",
    tags: [] as string[], mediaUrls: [] as string[], coverImage: "",
    parts: [] as { name: string; quantity: number; registrySlug?: string; notes?: string }[],
  });
  const [projTagInput, setProjTagInput] = useState("");
  const [partName, setPartName] = useState("");
  const [partQty, setPartQty] = useState(1);

  if (authLoading) return null;

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="technical-card p-12 text-center max-w-md">
            <Cpu className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold uppercase mb-2">Authentication Required</h2>
            <p className="text-slate-500 text-sm mb-6">Sign in with Google to contribute to the ROBOGUIDE registry.</p>
            <p className="font-mono text-[10px] text-slate-400 uppercase">Use the sign in button in the navigation bar</p>
          </div>
        </main>
      </div>
    );
  }

  const autoSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const totalSteps = submitType === "component" ? 3 : 3;

  const handleComponentSubmit = async () => {
    setSaving(true);
    try {
      await addRegistryItem({
        ...compForm,
        slug: compForm.slug || autoSlug(compForm.name),
        status: "draft",
        authorId: user.uid,
        authorName: user.displayName || "Unknown",
        relatedSlugs: [],
      });
      toast("Component submitted for review!", "success");
      setStep(4);
    } catch (err: any) {
      toast(err.message || "Submission failed", "error");
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
        authorId: user.uid,
        authorName: user.displayName || "Unknown",
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

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20">
        <header className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-blue-500/20 bg-blue-500/5 rounded-full mb-4">
            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-blue-600 uppercase tracking-widest">
              Authorized Contributor Mode
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tighter uppercase font-sans">Contribute to ROBOGUIDE</h1>
          <p className="text-slate-500 font-mono text-sm mt-2">SYSTEM_INPUT // SECURE_TRANSIT</p>
        </header>

        {/* Type Selector */}
        {step < 4 && (
          <div className="flex mb-8 gap-4">
            <button
              onClick={() => { setSubmitType("component"); setStep(1); }}
              className={`flex-1 p-4 technical-card flex items-center gap-3 transition-all ${
                submitType === "component" ? "border-blue-500 bg-blue-50/50" : "hover:border-slate-400"
              }`}
            >
              <Cpu className={`h-6 w-6 ${submitType === "component" ? "text-blue-500" : "text-slate-400"}`} />
              <div className="text-left">
                <p className="font-mono text-xs font-bold uppercase">Component</p>
                <p className="text-[10px] text-slate-500">Add to hardware registry</p>
              </div>
            </button>
            <button
              onClick={() => { setSubmitType("project"); setStep(1); }}
              className={`flex-1 p-4 technical-card flex items-center gap-3 transition-all ${
                submitType === "project" ? "border-blue-500 bg-blue-50/50" : "hover:border-slate-400"
              }`}
            >
              <FolderOpen className={`h-6 w-6 ${submitType === "project" ? "text-blue-500" : "text-slate-400"}`} />
              <div className="text-left">
                <p className="font-mono text-xs font-bold uppercase">Project</p>
                <p className="text-[10px] text-slate-500">Share a build</p>
              </div>
            </button>
          </div>
        )}

        {/* Progress Bar */}
        {step < 4 && (
          <div className="technical-card p-1 bg-slate-900 mb-8">
            <div className="flex h-1 bg-slate-800">
              <motion.div
                className="bg-blue-500 h-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* ─── COMPONENT FLOW ─── */}
          {submitType === "component" && step === 1 && (
            <motion.div key="comp1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Name *</label>
                  <input
                    value={compForm.name}
                    onChange={(e) => setCompForm((p) => ({ ...p, name: e.target.value, slug: p.slug || autoSlug(e.target.value) }))}
                    placeholder="e.g. ESP32-WROOM-32"
                    className="w-full p-4 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Category *</label>
                  <select
                    value={compForm.category}
                    onChange={(e) => setCompForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full p-4 border border-technical-border font-mono text-sm bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none"
                  >
                    <option value="">SELECT_CATEGORY...</option>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Description</label>
                <textarea
                  value={compForm.description}
                  onChange={(e) => setCompForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder="Technical description and use cases..."
                  className="w-full p-4 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none"
                />
              </div>
            </motion.div>
          )}

          {submitType === "component" && step === 2 && (
            <motion.div key="comp2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-4">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Tags</label>
                <div className="flex gap-2">
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (tagInput.trim()) { setCompForm((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] })); setTagInput(""); } } }}
                    placeholder="Add tag..." className="flex-1 p-3 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
                  <button onClick={() => { if (tagInput.trim()) { setCompForm((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] })); setTagInput(""); } }}
                    className="px-4 border border-technical-border hover:bg-slate-50"><Plus className="h-4 w-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {compForm.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-slate-100 font-mono text-[10px] border border-slate-200 uppercase">
                      {tag} <button onClick={() => setCompForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))}><X className="h-3 w-3 text-slate-400 hover:text-red-500" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Specifications</label>
                <div className="flex gap-2">
                  <input value={specKey} onChange={(e) => setSpecKey(e.target.value)} placeholder="Key" className="flex-1 p-3 border border-technical-border font-mono text-sm focus:border-blue-500 outline-none" />
                  <input value={specValue} onChange={(e) => setSpecValue(e.target.value)} placeholder="Value"
                    onKeyDown={(e) => { if (e.key === "Enter" && specKey.trim()) { e.preventDefault(); setCompForm((p) => ({ ...p, specifications: { ...p.specifications, [specKey.trim()]: specValue.trim() } })); setSpecKey(""); setSpecValue(""); } }}
                    className="flex-1 p-3 border border-technical-border font-mono text-sm focus:border-blue-500 outline-none" />
                  <button onClick={() => { if (specKey.trim()) { setCompForm((p) => ({ ...p, specifications: { ...p.specifications, [specKey.trim()]: specValue.trim() } })); setSpecKey(""); setSpecValue(""); } }}
                    className="px-4 border border-technical-border hover:bg-slate-50"><Plus className="h-4 w-4" /></button>
                </div>
                {Object.entries(compForm.specifications).length > 0 && (
                  <div className="border border-slate-200 divide-y">
                    {Object.entries(compForm.specifications).map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between px-4 py-2">
                        <span className="font-mono text-xs text-slate-500 uppercase">{k}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold">{v}</span>
                          <button onClick={() => { const { [k]: _, ...rest } = compForm.specifications; setCompForm((p) => ({ ...p, specifications: rest })); }}>
                            <X className="h-3 w-3 text-slate-400 hover:text-red-500" />
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
              <MediaUploader basePath={`submissions/${compForm.slug || "temp"}`} existingUrls={compForm.mediaUrls}
                onChange={(urls) => setCompForm((p) => ({ ...p, mediaUrls: urls }))} />
              <div className="technical-card p-8 text-center bg-slate-50 border-dashed">
                <Cpu className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <p className="font-mono text-xs text-slate-500 uppercase mb-1">Ready to submit?</p>
                <p className="text-[10px] text-slate-400">Your component will be submitted as a draft for review.</p>
              </div>
            </motion.div>
          )}

          {/* ─── PROJECT FLOW ─── */}
          {submitType === "project" && step === 1 && (
            <motion.div key="proj1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Project Title *</label>
                <input value={projForm.title} onChange={(e) => setProjForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Solar-Powered Weather Station" className="w-full p-4 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Description *</label>
                <textarea value={projForm.description} onChange={(e) => setProjForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3} placeholder="Brief overview of your project..." className="w-full p-4 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none" />
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Detailed Write-up</label>
                <textarea value={projForm.content} onChange={(e) => setProjForm((p) => ({ ...p, content: e.target.value }))}
                  rows={8} placeholder="Full project details, build process, lessons learned..." className="w-full p-4 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none" />
              </div>
            </motion.div>
          )}

          {submitType === "project" && step === 2 && (
            <motion.div key="proj2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-4">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Parts List</label>
                <div className="flex gap-2">
                  <input value={partName} onChange={(e) => setPartName(e.target.value)} placeholder="Part name" className="flex-1 p-3 border border-technical-border font-mono text-sm outline-none focus:border-blue-500" />
                  <input type="number" value={partQty} onChange={(e) => setPartQty(parseInt(e.target.value) || 1)} min={1} className="w-20 p-3 border border-technical-border font-mono text-sm text-center outline-none focus:border-blue-500" />
                  <button onClick={() => { if (partName.trim()) { setProjForm((p) => ({ ...p, parts: [...p.parts, { name: partName.trim(), quantity: partQty }] })); setPartName(""); setPartQty(1); } }}
                    className="px-4 border border-technical-border hover:bg-slate-50"><Plus className="h-4 w-4" /></button>
                </div>
                {projForm.parts.length > 0 && (
                  <div className="border border-slate-200 divide-y">
                    {projForm.parts.map((part, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2">
                        <span className="font-mono text-xs">{part.quantity}x {part.name}</span>
                        <button onClick={() => setProjForm((p) => ({ ...p, parts: p.parts.filter((_, j) => j !== i) }))}><X className="h-3 w-3 text-slate-400 hover:text-red-500" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Source Code</label>
                <div className="flex gap-2 mb-2">
                  <select value={projForm.codeLanguage} onChange={(e) => setProjForm((p) => ({ ...p, codeLanguage: e.target.value }))}
                    className="p-3 border border-technical-border font-mono text-sm bg-white outline-none focus:border-blue-500">
                    <option value="cpp">C++</option><option value="python">Python</option><option value="javascript">JavaScript</option><option value="c">C</option>
                  </select>
                </div>
                <textarea value={projForm.code} onChange={(e) => setProjForm((p) => ({ ...p, code: e.target.value }))}
                  rows={10} placeholder="Paste your code here..." className="w-full p-4 border border-technical-border font-mono text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all outline-none resize-none bg-slate-950 text-slate-300" />
              </div>
            </motion.div>
          )}

          {submitType === "project" && step === 3 && (
            <motion.div key="proj3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-4">
                <label className="font-mono text-[10px] font-bold uppercase text-slate-500">Tags</label>
                <div className="flex gap-2">
                  <input value={projTagInput} onChange={(e) => setProjTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && projTagInput.trim()) { e.preventDefault(); setProjForm((p) => ({ ...p, tags: [...p.tags, projTagInput.trim()] })); setProjTagInput(""); } }}
                    placeholder="Add tag..." className="flex-1 p-3 border border-technical-border font-mono text-sm outline-none focus:border-blue-500" />
                  <button onClick={() => { if (projTagInput.trim()) { setProjForm((p) => ({ ...p, tags: [...p.tags, projTagInput.trim()] })); setProjTagInput(""); } }}
                    className="px-4 border border-technical-border hover:bg-slate-50"><Plus className="h-4 w-4" /></button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {projForm.tags.map((tag) => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-slate-100 font-mono text-[10px] border border-slate-200 uppercase">
                      {tag} <button onClick={() => setProjForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))}><X className="h-3 w-3 text-slate-400 hover:text-red-500" /></button>
                    </span>
                  ))}
                </div>
              </div>
              <MediaUploader basePath={`projects/${projForm.title ? projForm.title.toLowerCase().replace(/\s+/g, "-") : "temp"}`} existingUrls={projForm.mediaUrls}
                onChange={(urls) => setProjForm((p) => ({ ...p, mediaUrls: urls, coverImage: p.coverImage || urls[0] || "" }))} />
            </motion.div>
          )}

          {/* Success State */}
          {step === 4 && (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="technical-card p-12 text-center">
              <CheckCircle2 className="h-16 w-16 text-emerald-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold uppercase mb-2">
                {submitType === "component" ? "Component Submitted" : "Project Published"}
              </h2>
              <p className="text-slate-500 font-mono text-xs mb-8">
                {submitType === "component" ? "ENTRY_STATUS: DRAFT // PENDING_REVIEW" : "PROJECT_STATUS: LIVE"}
              </p>
              <div className="flex justify-center gap-4">
                <button onClick={() => router.push(submitType === "component" ? "/wiki" : "/projects")}
                  className="px-6 py-3 bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors">
                  {submitType === "component" ? "Browse Wiki" : "View Projects"}
                </button>
                <button onClick={() => { setStep(1); setCompForm({ name: "", slug: "", category: "", description: "", tags: [], specifications: {}, mediaUrls: [], image: "" }); setProjForm({ title: "", description: "", content: "", code: "", codeLanguage: "cpp", tags: [], mediaUrls: [], coverImage: "", parts: [] }); }}
                  className="px-6 py-3 border border-slate-200 font-mono text-xs font-bold uppercase hover:bg-slate-50 transition-all">
                  Submit Another
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        {step < 4 && (
          <div className="flex justify-between pt-8 border-t border-slate-100 mt-8">
            <button onClick={() => setStep((s) => Math.max(s - 1, 1))} disabled={step === 1}
              className="flex items-center gap-2 px-6 py-3 border border-slate-200 font-mono text-xs font-bold uppercase hover:bg-slate-50 transition-all disabled:opacity-0">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            {step === totalSteps ? (
              <button onClick={submitType === "component" ? handleComponentSubmit : handleProjectSubmit} disabled={saving}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 hover:circuit-glow">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {saving ? "Pushing..." : submitType === "component" ? "Push to Registry" : "Publish Project"}
              </button>
            ) : (
              <button onClick={() => setStep((s) => Math.min(s + 1, totalSteps))}
                className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-mono text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </main>
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
