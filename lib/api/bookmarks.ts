export type BookmarkEntityType = "component" | "guide" | "project";

export type Bookmark = {
  id: string;
  userId: string;
  entityType: BookmarkEntityType;
  entityId: string;
  title: string;
  thumbnail?: string;
  createdAt?: any;
};

export async function listBookmarks(entityType?: BookmarkEntityType): Promise<Bookmark[]> {
  const qs = entityType ? `?entityType=${entityType}` : "";
  const res = await fetch(`/api/bookmarks${qs}`, { credentials: "include" });
  if (!res.ok) return [];
  const json = await res.json();
  return json.bookmarks || [];
}

export async function toggleBookmark(payload: {
  entityType: BookmarkEntityType;
  entityId: string;
  title: string;
  thumbnail?: string;
}): Promise<boolean> {
  const res = await fetch("/api/bookmarks", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to toggle bookmark");
  const json = await res.json();
  return json.bookmarked;
}

export async function checkBookmark(entityType: BookmarkEntityType, entityId: string): Promise<boolean> {
  const res = await fetch(`/api/bookmarks/check?entityType=${entityType}&entityId=${encodeURIComponent(entityId)}`, {
    credentials: "include",
  });
  if (!res.ok) return false;
  const json = await res.json();
  return !!json.bookmarked;
}
