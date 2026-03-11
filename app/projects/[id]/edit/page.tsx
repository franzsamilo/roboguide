"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import MediaUploader from "@/components/admin/MediaUploader";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { getProjectById } from "@/lib/firebase/projectService";
import { updateProject } from "@/lib/api/projects";
import { DetailSkeleton } from "@/components/ui/Skeletons";
import ErrorState from "@/components/ui/ErrorState";
import type { Project } from "@/lib/schemas";
import { ArrowLeft, Save, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    content: "",
    coverImage: "",
    mediaUrls: [] as string[],
    tags: [] as string[],
    code: "",
    codeLanguage: "cpp",
    parts: [] as { name: string; quantity: number; registrySlug?: string; notes?: string }[],
  });
  const [tagInput, setTagInput] = useState("");
  const [partName, setPartName] = useState("");
  const [partQty, setPartQty] = useState(1);

  useEffect(() => {
    if (!id || !user) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getProjectById(id as string);
        if (!data) {
          setError("Project not found.");
          return;
        }
        if (data.authorId !== user.id) {
          setError("You can only edit your own projects.");
          return;
        }
        setProject(data);
        setForm({
          title: data.title,
          description: data.description,
          content: data.content || "",
          coverImage: data.coverImage || "",
          mediaUrls: data.mediaUrls || [],
          tags: data.tags || [],
          code: data.code || "",
          codeLanguage: data.codeLanguage || "cpp",
          parts: data.parts || [],
        });
      } catch (err: any) {
        setError(err.message || "Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleSave = async () => {
    if (!project?.id || !form.title || !form.description) {
      toast("Title and description are required.", "error");
      return;
    }
    setSaving(true);
    try {
      await updateProject(project.id, form);
      toast("Project updated!", "success");
      router.push(`/projects/${project.id}`);
    } catch (err: any) {
      toast(err.message || "Failed to update", "error");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) return null;

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow max-w-3xl mx-auto w-full px-4 py-12">
          <DetailSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="grow max-w-3xl mx-auto w-full px-4 py-12">
          <ErrorState title="Cannot Edit" message={error || "Project not found"} />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="grow max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/projects/${project.id}`} className="flex items-center gap-2 mb-8 font-mono text-xs text-slate-500 hover:text-blue-500 transition-colors uppercase tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Back to Project
        </Link>

        <header className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Edit Project</h1>
          <p className="text-slate-500 text-sm mt-1">Update your project details</p>
        </header>

        <div className="space-y-8">
          <div className="technical-card p-6 space-y-6">
            <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Basic Info</h2>
            <div>
              <label className="form-label">Title *</label>
              <input
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Project title"
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                rows={3}
                className="form-input resize-none"
              />
            </div>
            <div>
              <label className="form-label">Detailed Write-up</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                rows={8}
                className="form-input resize-none"
              />
            </div>
          </div>

          <div className="technical-card p-6 space-y-6">
            <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Cover Image & Media</h2>
            <MediaUploader
              basePath={`projects/${form.title?.toLowerCase().replace(/\s+/g, "-") || id}`}
              existingUrls={form.mediaUrls}
              onChange={(urls) => setForm((p) => ({
                ...p,
                mediaUrls: urls,
                coverImage: p.coverImage || urls[0] || "",
              }))}
            />
            <div>
              <label className="form-label">Cover Image (URL or pick first from gallery)</label>
              <input
                value={form.coverImage}
                onChange={(e) => setForm((p) => ({ ...p, coverImage: e.target.value }))}
                placeholder="https://... or leave blank to use first media"
                className="form-input"
              />
            </div>
          </div>

          <div className="technical-card p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Tags</h2>
            <div className="flex gap-2">
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && tagInput.trim()) {
                    e.preventDefault();
                    setForm((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
                    setTagInput("");
                  }
                }}
                placeholder="Add tag..."
                className="form-input flex-1"
              />
              <button
                onClick={() => {
                  if (tagInput.trim()) {
                    setForm((p) => ({ ...p, tags: [...p.tags, tagInput.trim()] }));
                    setTagInput("");
                  }
                }}
                className="btn-outline px-3"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span key={tag} className="badge flex items-center gap-1">
                  {tag}
                  <button onClick={() => setForm((p) => ({ ...p, tags: p.tags.filter((t) => t !== tag) }))}>
                    <X className="h-3 w-3 text-gray-400 hover:text-red-500" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="technical-card p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Parts List</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
              <div className="flex-1">
                <input
                  value={partName}
                  onChange={(e) => setPartName(e.target.value)}
                  placeholder="Part name"
                  className="form-input w-full"
                />
              </div>
              <div className="w-24">
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
                    setForm((p) => ({ ...p, parts: [...p.parts, { name: partName.trim(), quantity: partQty }] }));
                    setPartName("");
                    setPartQty(1);
                  }
                }}
                disabled={!partName.trim()}
                className="btn-outline px-4 py-2.5 disabled:opacity-50"
              >
                <Plus className="h-4 w-4 inline mr-1" /> Add
              </button>
            </div>
            {form.parts.length > 0 && (
              <div className="divide-y divide-gray-100 border border-gray-200 rounded overflow-hidden">
                {form.parts.map((part, i) => (
                  <div key={i} className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm">{part.name} × {part.quantity}</span>
                    <button
                      onClick={() => setForm((p) => ({ ...p, parts: p.parts.filter((_, j) => j !== i) }))}
                      className="p-1.5 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="technical-card p-6 space-y-4">
            <h2 className="font-mono text-xs font-bold uppercase text-slate-500 tracking-widest">Source Code</h2>
            <select
              value={form.codeLanguage}
              onChange={(e) => setForm((p) => ({ ...p, codeLanguage: e.target.value }))}
              className="form-input w-auto"
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="c">C</option>
            </select>
            <textarea
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              rows={10}
              className="form-input resize-none font-mono text-sm bg-gray-900 text-gray-300"
            />
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Link href={`/projects/${project.id}`} className="btn-outline">
              Cancel
            </Link>
            <button onClick={handleSave} disabled={saving} className="btn-primary disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
