"use client";

import { useEffect, useState } from "react";
import { MessageSquare, Send, Trash2, User, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { useConfirm } from "@/components/ui/ConfirmProvider";
import { listComments, addComment, deleteComment, type Comment } from "@/lib/api/comments";

type Props = {
  entityType: "guide" | "project";
  entityId: string;
};

const MAX_LEN = 500;

function formatRelative(ts: number | null): string {
  if (!ts) return "";
  const diff = Date.now() - ts;
  const sec = Math.round(diff / 1000);
  if (sec < 60) return "just now";
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.round(hr / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(ts).toLocaleDateString();
}

export default function CommentSection({ entityType, entityId }: Props) {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!entityId) return;
    setLoading(true);
    listComments(entityType, entityId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [entityType, entityId]);

  const handleSubmit = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!user) {
      toast("Sign in to comment", "error");
      return;
    }
    setSubmitting(true);
    try {
      const newComment = await addComment({ entityType, entityId, text: trimmed });
      setComments((prev) => [newComment, ...prev]);
      setText("");
    } catch (e: any) {
      toast(e.message || "Failed to post comment", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c: Comment) => {
    const confirmed = await confirm({
      title: "Delete comment",
      message: "Are you sure? This can't be undone.",
      confirmLabel: "Delete",
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteComment(c.id);
      setComments((prev) => prev.filter((x) => x.id !== c.id));
      toast("Comment deleted", "success");
    } catch (e: any) {
      toast(e.message || "Failed to delete", "error");
    }
  };

  return (
    <section className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Comments
          <span className="text-slate-400 normal-case font-normal">({comments.length})</span>
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Form */}
        {user ? (
          <div className="space-y-2">
            <label htmlFor="comment-text" className="sr-only">Write a comment</label>
            <textarea
              id="comment-text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LEN))}
              rows={3}
              placeholder="Share your thoughts, questions, or improvements..."
              className="form-input resize-none"
              maxLength={MAX_LEN}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">{text.length}/{MAX_LEN}</p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!text.trim() || submitting}
                className="btn-primary text-sm disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Post
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 text-center">
            Sign in to join the conversation.
          </div>
        )}

        {/* List */}
        {loading ? (
          <p className="text-sm text-slate-400">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">No comments yet. Be the first!</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((c) => {
              const canDelete = user && (c.authorId === user.id || isAdmin);
              return (
                <li key={c.id} className="flex gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{c.authorName}</span>
                      <span className="text-xs text-slate-400">{formatRelative(c.createdAt)}</span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(c)}
                          className="ml-auto p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                          aria-label="Delete comment"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap mt-1 break-words">{c.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
