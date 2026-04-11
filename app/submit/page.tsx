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
import { getRegistryItems, checkSlugExists } from "@/lib/firebase/registryService";
import { addProject } from "@/lib/api/projects";
import { addGuide } from "@/lib/api/guides";
import { CATEGORIES } from "@/lib/schemas";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Send, ArrowRight, ArrowLeft, CheckCircle2, Plus, X, Loader2, FolderOpen, AlertCircle, Save, BookOpen } from "lucide-react";

const DRAFT_KEY = "roboguide:submit-draft";
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

type SubmitType = "component" | "project" | "guide";

type DraftShape = {
  compForm: any;
  projForm: any;
  guideForm: any;
  submitType: SubmitType;
  step: number;
  savedAt: number;
};

function SubmitPageInner() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const initialTypeRaw = searchParams.get("type") || "component";
  const initialType: SubmitType =
    initialTypeRaw === "project" || initialTypeRaw === "guide" ? initialTypeRaw : "component";
  const initialGuideSlug = searchParams.get("slug") || "";

  const [submitType, setSubmitType] = useState<SubmitType>(initialType);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [draftRestored, setDraftRestored] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [showTouched, setShowTouched] = useState(false);

  // Component form
  const [compForm, setCompForm] = useState({
    name: "", slug: "", category: "", description: "",
    tags: [] as string[], specifications: {} as Record<string, string>,
    mediaUrls: [] as string[], image: "", datasheet: "",
    relatedSlugs: [] as string[],
  });
  const [slugConflict, setSlugConflict] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
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

  // Guide form
  const [guideForm, setGuideForm] = useState({
    title: "",
    registrySlug: initialGuideSlug,
    excerpt: "",
    content: "",
    hyperlocalTags: [] as string[],
    mediaUrls: [] as string[],
  });
  const [guideTagInput, setGuideTagInput] = useState("");

  useEffect(() => {
    if (submitType === "component" || submitType === "guide") {
      getRegistryItems({ status: "published", pageSize: 200 }).then((r) =>
        setRegistryItems(r.items.map((i) => ({ id: i.id, slug: i.slug, name: i.name })))
      );
    }
  }, [submitType]);

  // ─── Draft Autosave: restore on mount ───
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft: DraftShape = JSON.parse(raw);
      if (!draft?.savedAt || Date.now() - draft.savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      const hasContent =
        (draft.compForm?.name || draft.compForm?.description || (draft.compForm?.tags?.length ?? 0) > 0) ||
        (draft.projForm?.title || draft.projForm?.description || (draft.projForm?.parts?.length ?? 0) > 0) ||
        (draft.guideForm?.title || draft.guideForm?.content);
      if (!hasContent) return;
      if (draft.compForm) setCompForm(draft.compForm);
      if (draft.projForm) setProjForm(draft.projForm);
      if (draft.guideForm) setGuideForm(draft.guideForm);
      if (draft.submitType) setSubmitType(draft.submitType);
      if (draft.step) setStep(Math.min(draft.step, 3));
      setDraftRestored(true);
    } catch {
      // ignore corrupt draft
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Draft Autosave: persist on change ───
  useEffect(() => {
    if (step === 4) return; // don't persist after success
    const timer = setTimeout(() => {
      try {
        const draft: DraftShape = { compForm, projForm, guideForm, submitType, step, savedAt: Date.now() };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 1200);
      } catch {
        // quota exceeded — ignore
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [compForm, projForm, guideForm, submitType, step]);

  const clearDraft = () => {
    try { localStorage.removeItem(DRAFT_KEY); } catch {}
    setDraftRestored(false);
  };

  // ─── Debounced slug availability check ───
  useEffect(() => {
    if (submitType !== "component") return;
    const slug = compForm.slug || autoSlug(compForm.name);
    if (!slug || slug.length < 2) {
      setSlugAvailable(null);
      setSlugChecking(false);
      return;
    }
    setSlugChecking(true);
    setSlugAvailable(null);
    const timer = setTimeout(async () => {
      try {
        const exists = await checkSlugExists(slug);
        setSlugAvailable(!exists);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compForm.slug, compForm.name, submitType]);

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

  // ─── Per-step validity gates ───
  const compStepValid = (s: number): boolean => {
    const slug = compForm.slug || autoSlug(compForm.name);
    if (s === 1) return !!compForm.name.trim() && !!compForm.category && !!slug && slugAvailable !== false;
    return true;
  };
  const projStepValid = (s: number): boolean => {
    if (s === 1) return !!projForm.title.trim() && !!projForm.description.trim();
    return true;
  };
  const guideStepValid = (s: number): boolean => {
    if (s === 1) return !!guideForm.title.trim() && !!guideForm.registrySlug;
    if (s === 2) return !!guideForm.content.trim();
    return true;
  };
  const currentStepValid =
    submitType === "component" ? compStepValid(step) :
    submitType === "project" ? projStepValid(step) :
    guideStepValid(step);

  const handleContinue = () => {
    if (!currentStepValid) {
      setShowTouched(true);
      return;
    }
    setShowTouched(false);
    setStep((s) => Math.min(s + 1, totalSteps));
  };

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
      clearDraft();
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
      clearDraft();
      setStep(4);
    } catch (err: any) {
      toast(err.message || "Submission failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleGuideSubmit = async () => {
    setSaving(true);
    try {
      await addGuide({
        ...guideForm,
        status: "published",
        authorId: user.id,
        authorName: user.name || "Unknown",
      });
      toast("Guide published!", "success");
      clearDraft();
      setStep(4);
    } catch (err: any) {
      toast(err.message || "Submission failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = () => {
    if (submitType === "component") return handleComponentSubmit();
    if (submitType === "project") return handleProjectSubmit();
    return handleGuideSubmit();
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
          {draftSaved && step < 4 && (
            <p className="text-xs text-emerald-600 mt-2 inline-flex items-center gap-1">
              <Save className="h-3 w-3" /> Draft saved
            </p>
          )}
        </header>

        {draftRestored && step < 4 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-amber-900">Draft restored</p>
              <p className="text-amber-700 text-xs mt-0.5">We found unsaved work from your last session. Continue where you left off, or discard it.</p>
            </div>
            <button
              onClick={() => {
                clearDraft();
                setCompForm({ name: "", slug: "", category: "", description: "", tags: [], specifications: {}, mediaUrls: [], image: "", datasheet: "", relatedSlugs: [] });
                setProjForm({ title: "", description: "", content: "", code: "", codeLanguage: "cpp", tags: [], mediaUrls: [], coverImage: "", parts: [] });
                setStep(1);
              }}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 underline shrink-0"
            >
              Discard
            </button>
          </div>
        )}

        {/* Type Selector */}
        {step < 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 mb-8 gap-3">
            {[
              { type: "component" as const, icon: Cpu, label: "Component", desc: "Add to hardware registry" },
              { type: "guide" as const, icon: BookOpen, label: "Guide", desc: "Write a tutorial" },
              { type: "project" as const, icon: FolderOpen, label: "Project", desc: "Share a build" },
            ].map(({ type, icon: Icon, label, desc }) => {
              const active = submitType === type;
              return (
                <button
                  key={type}
                  onClick={() => { setSubmitType(type); setStep(1); setShowTouched(false); }}
                  className={`p-5 card-flat flex items-center gap-3 transition-all ${
                    active ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500" : "hover:border-gray-300"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${active ? "bg-blue-100" : "bg-gray-100"}`}>
                    <Icon className={`h-5 w-5 ${active ? "text-blue-600" : "text-gray-400"}`} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                  </div>
                </button>
              );
            })}
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
                  <label htmlFor="comp-name" className="form-label">Name *</label>
                  <input
                    id="comp-name"
                    value={compForm.name}
                    onChange={(e) => setCompForm((p) => ({ ...p, name: e.target.value, slug: p.slug || autoSlug(e.target.value) }))}
                    placeholder="e.g. ESP32-WROOM-32"
                    className={`form-input ${showTouched && !compForm.name.trim() ? "border-red-400 ring-1 ring-red-400" : ""}`}
                    aria-invalid={showTouched && !compForm.name.trim()}
                  />
                  {showTouched && !compForm.name.trim() && (
                    <p className="text-xs text-red-500 mt-1">Name is required</p>
                  )}
                </div>
                <div>
                  <label htmlFor="comp-category" className="form-label">Category *</label>
                  <select
                    id="comp-category"
                    value={compForm.category}
                    onChange={(e) => setCompForm((p) => ({ ...p, category: e.target.value }))}
                    className={`form-input ${showTouched && !compForm.category ? "border-red-400 ring-1 ring-red-400" : ""}`}
                    aria-invalid={showTouched && !compForm.category}
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {showTouched && !compForm.category && (
                    <p className="text-xs text-red-500 mt-1">Category is required</p>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="comp-slug" className="form-label">URL slug *</label>
                <div className="flex gap-2">
                  <input
                    id="comp-slug"
                    value={compForm.slug || autoSlug(compForm.name)}
                    onChange={(e) => setCompForm((p) => ({ ...p, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/(^-|-$)/g, "") }))}
                    placeholder="e.g. esp32-wroom-32"
                    className={`form-input font-mono flex-1 ${
                      slugAvailable === false ? "border-red-400 ring-1 ring-red-400" :
                      slugAvailable === true ? "border-emerald-400 ring-1 ring-emerald-400" :
                      slugConflict ? "border-amber-500 ring-1 ring-amber-500" : ""
                    }`}
                    aria-invalid={slugAvailable === false}
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
                <div className="mt-1 flex items-center gap-2 text-xs min-h-4">
                  {slugChecking ? (
                    <span className="text-gray-400 inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> Checking availability...
                    </span>
                  ) : slugAvailable === true ? (
                    <span className="text-emerald-600 inline-flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Slug is available
                    </span>
                  ) : slugAvailable === false ? (
                    <span className="text-red-500 inline-flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> Slug is already taken
                    </span>
                  ) : (
                    <span className="text-gray-500">Must be unique. Used in URLs like /wiki/your-slug</span>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="comp-description" className="form-label">Description</label>
                <textarea
                  id="comp-description"
                  value={compForm.description}
                  onChange={(e) => setCompForm((p) => ({ ...p, description: e.target.value }))}
                  rows={4}
                  placeholder="Technical description and use cases... (Markdown supported)"
                  className="form-input resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Markdown supported — use **bold**, *italic*, `code`, lists, and links.</p>
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
                <label htmlFor="proj-title" className="form-label">Project Title *</label>
                <input
                  id="proj-title"
                  value={projForm.title}
                  onChange={(e) => setProjForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Solar-Powered Weather Station"
                  className={`form-input ${showTouched && !projForm.title.trim() ? "border-red-400 ring-1 ring-red-400" : ""}`}
                  aria-invalid={showTouched && !projForm.title.trim()}
                />
                {showTouched && !projForm.title.trim() && (
                  <p className="text-xs text-red-500 mt-1">Title is required</p>
                )}
              </div>
              <div>
                <label htmlFor="proj-description" className="form-label">Description *</label>
                <textarea
                  id="proj-description"
                  value={projForm.description}
                  onChange={(e) => setProjForm((p) => ({ ...p, description: e.target.value }))}
                  rows={3}
                  placeholder="Brief overview of your project..."
                  className={`form-input resize-none ${showTouched && !projForm.description.trim() ? "border-red-400 ring-1 ring-red-400" : ""}`}
                  aria-invalid={showTouched && !projForm.description.trim()}
                />
                {showTouched && !projForm.description.trim() && (
                  <p className="text-xs text-red-500 mt-1">Description is required</p>
                )}
              </div>
              <div>
                <label htmlFor="proj-content" className="form-label">Detailed Write-up</label>
                <textarea
                  id="proj-content"
                  value={projForm.content}
                  onChange={(e) => setProjForm((p) => ({ ...p, content: e.target.value }))}
                  rows={8}
                  placeholder="Full project details, build process, lessons learned... (Markdown supported)"
                  className="form-input resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">Markdown supported — use headings, lists, code blocks, and links.</p>
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

          {/* ─── GUIDE FLOW ─── */}
          {submitType === "guide" && step === 1 && (
            <motion.div key="guide1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <label htmlFor="guide-title" className="form-label">Guide Title *</label>
                <input
                  id="guide-title"
                  value={guideForm.title}
                  onChange={(e) => setGuideForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Getting started with ESP32 over-the-air updates"
                  className={`form-input ${showTouched && !guideForm.title.trim() ? "border-red-400 ring-1 ring-red-400" : ""}`}
                  aria-invalid={showTouched && !guideForm.title.trim()}
                />
                {showTouched && !guideForm.title.trim() && (
                  <p className="text-xs text-red-500 mt-1">Title is required</p>
                )}
              </div>
              <div>
                <label htmlFor="guide-component" className="form-label">Linked Component *</label>
                <select
                  id="guide-component"
                  value={guideForm.registrySlug}
                  onChange={(e) => setGuideForm((p) => ({ ...p, registrySlug: e.target.value }))}
                  className={`form-input ${showTouched && !guideForm.registrySlug ? "border-red-400 ring-1 ring-red-400" : ""}`}
                  aria-invalid={showTouched && !guideForm.registrySlug}
                >
                  <option value="">-- Choose a component --</option>
                  {registryItems.map((i) => (
                    <option key={i.slug} value={i.slug}>{i.name} ({i.slug})</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Every guide is linked to a component in the wiki so readers can find it from there.</p>
                {showTouched && !guideForm.registrySlug && (
                  <p className="text-xs text-red-500 mt-1">Pick the component this guide is about</p>
                )}
              </div>
              <div>
                <label htmlFor="guide-excerpt" className="form-label">Excerpt</label>
                <textarea
                  id="guide-excerpt"
                  value={guideForm.excerpt}
                  onChange={(e) => setGuideForm((p) => ({ ...p, excerpt: e.target.value.slice(0, 300) }))}
                  rows={2}
                  placeholder="A one- or two-sentence summary shown in listings..."
                  className="form-input resize-none"
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">{guideForm.excerpt.length}/300 characters</p>
              </div>
            </motion.div>
          )}

          {submitType === "guide" && step === 2 && (
            <motion.div key="guide2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
              <div>
                <label htmlFor="guide-content" className="form-label">Guide Content *</label>
                <textarea
                  id="guide-content"
                  value={guideForm.content}
                  onChange={(e) => setGuideForm((p) => ({ ...p, content: e.target.value }))}
                  rows={16}
                  placeholder={"Write your guide in markdown.\n\n## Introduction\n...\n\n## Step 1\n```cpp\n// code here\n```"}
                  className={`form-input resize-y font-mono text-sm ${showTouched && !guideForm.content.trim() ? "border-red-400 ring-1 ring-red-400" : ""}`}
                  aria-invalid={showTouched && !guideForm.content.trim()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Markdown supported — headings, lists, code blocks, links. {guideForm.content.length.toLocaleString()} characters.
                </p>
                {showTouched && !guideForm.content.trim() && (
                  <p className="text-xs text-red-500 mt-1">Content is required</p>
                )}
              </div>
              <div>
                <label className="form-label">Hyperlocal tags</label>
                <p className="text-xs text-gray-500 mb-2">Location or environment tags help others find guides relevant to their setting (e.g. "manila", "humid-climate", "battery-powered").</p>
                <div className="flex gap-2">
                  <input
                    value={guideTagInput}
                    onChange={(e) => setGuideTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (guideTagInput.trim()) {
                          setGuideForm((p) => ({ ...p, hyperlocalTags: [...p.hyperlocalTags, guideTagInput.trim()] }));
                          setGuideTagInput("");
                        }
                      }
                    }}
                    placeholder="Add tag..."
                    className="form-input flex-1"
                    aria-label="Add hyperlocal tag"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (guideTagInput.trim()) {
                        setGuideForm((p) => ({ ...p, hyperlocalTags: [...p.hyperlocalTags, guideTagInput.trim()] }));
                        setGuideTagInput("");
                      }
                    }}
                    className="btn-outline px-3"
                    aria-label="Add tag"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {guideForm.hyperlocalTags.map((tag) => (
                    <span key={tag} className="badge badge-blue flex items-center gap-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setGuideForm((p) => ({ ...p, hyperlocalTags: p.hyperlocalTags.filter((t) => t !== tag) }))}
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {submitType === "guide" && step === 3 && (
            <motion.div key="guide3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
              <div>
                <label className="form-label">Media Gallery</label>
                <p className="text-xs text-gray-500 mb-3">Optional images or videos to illustrate your guide.</p>
                <MediaUploader
                  basePath={`guides/${guideForm.registrySlug || "misc"}`}
                  existingUrls={guideForm.mediaUrls}
                  onChange={(urls) => setGuideForm((p) => ({ ...p, mediaUrls: urls }))}
                />
              </div>
              <div className="card-flat p-8 text-center bg-gray-50">
                <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700 mb-1">Ready to publish?</p>
                <p className="text-xs text-gray-500">Your guide will appear on the {registryItems.find(r => r.slug === guideForm.registrySlug)?.name || "selected"} component page and in the community guides index.</p>
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
                {submitType === "component" ? "Component Submitted!" :
                 submitType === "project" ? "Project Published!" :
                 "Guide Published!"}
              </h2>
              <p className="text-gray-600 text-sm mb-2 max-w-md mx-auto">
                {submitType === "component"
                  ? "Your component has been added to the registry and is now visible to the community."
                  : submitType === "project"
                  ? "Your project is now live! Thank you for sharing with the community."
                  : "Your guide is now live and linked to its component. Thank you for sharing your knowledge!"}
              </p>
              <p className="text-emerald-600 text-sm font-medium mb-8">Success!</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={() => router.push(
                    submitType === "component" ? "/wiki" :
                    submitType === "project" ? "/projects" :
                    "/guides"
                  )}
                  className="btn-primary"
                >
                  {submitType === "component" ? "Browse Wiki" :
                   submitType === "project" ? "View Projects" :
                   "View Guides"}
                </button>
                <button
                  onClick={() => {
                    setStep(1);
                    setCompForm({ name: "", slug: "", category: "", description: "", tags: [], specifications: {}, mediaUrls: [], image: "", datasheet: "", relatedSlugs: [] });
                    setProjForm({ title: "", description: "", content: "", code: "", codeLanguage: "cpp", tags: [], mediaUrls: [], coverImage: "", parts: [] });
                    setGuideForm({ title: "", registrySlug: "", excerpt: "", content: "", hyperlocalTags: [], mediaUrls: [] });
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
              <button onClick={handleSubmit} disabled={saving}
                className="btn-primary disabled:opacity-50">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {saving ? "Submitting..." :
                 submitType === "component" ? "Submit Component" :
                 submitType === "project" ? "Publish Project" :
                 "Publish Guide"}
              </button>
            ) : (
              <button
                onClick={handleContinue}
                disabled={!currentStepValid && showTouched}
                className="btn-primary disabled:opacity-50"
              >
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
