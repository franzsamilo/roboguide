"use client";

import { useEffect, useState } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/ToastProvider";
import { checkBookmark, toggleBookmark, type BookmarkEntityType } from "@/lib/api/bookmarks";

type Props = {
  entityType: BookmarkEntityType;
  entityId: string;
  title: string;
  thumbnail?: string;
  variant?: "button" | "icon";
  className?: string;
};

export default function BookmarkButton({
  entityType,
  entityId,
  title,
  thumbnail,
  variant = "button",
  className = "",
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !entityId) return;
    checkBookmark(entityType, entityId).then(setBookmarked).catch(() => {});
  }, [user, entityType, entityId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast("Sign in to bookmark items", "error");
      return;
    }
    setLoading(true);
    try {
      const next = await toggleBookmark({ entityType, entityId, title, thumbnail });
      setBookmarked(next);
      toast(next ? "Bookmarked" : "Bookmark removed", "success");
    } catch {
      toast("Failed to update bookmark", "error");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        className={`p-2 rounded-lg border transition-colors ${
          bookmarked
            ? "border-amber-300 bg-amber-50 text-amber-600"
            : "border-slate-200 bg-white text-slate-400 hover:text-amber-600 hover:border-amber-200"
        } ${className}`}
        title={bookmarked ? "Remove bookmark" : "Bookmark"}
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark this item"}
        aria-pressed={bookmarked}
      >
        {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`btn-outline justify-center text-sm ${
        bookmarked ? "border-amber-300 text-amber-700 bg-amber-50 hover:border-amber-400" : ""
      } ${className}`}
      aria-pressed={bookmarked}
    >
      {bookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {bookmarked ? "Saved" : "Save"}
    </button>
  );
}
