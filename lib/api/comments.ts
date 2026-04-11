export type Comment = {
  id: string;
  entityType: "guide" | "project";
  entityId: string;
  text: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  createdAt: number | null;
};

export async function listComments(entityType: "guide" | "project", entityId: string): Promise<Comment[]> {
  const res = await fetch(
    `/api/comments?entityType=${entityType}&entityId=${encodeURIComponent(entityId)}`,
    { credentials: "include" }
  );
  if (!res.ok) return [];
  const json = await res.json();
  return json.comments || [];
}

export async function addComment(payload: {
  entityType: "guide" | "project";
  entityId: string;
  text: string;
}): Promise<Comment> {
  const res = await fetch("/api/comments", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || "Failed to add comment");
  }
  return res.json();
}

export async function deleteComment(id: string): Promise<void> {
  const res = await fetch(`/api/comments?id=${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j.error || "Failed to delete");
  }
}
