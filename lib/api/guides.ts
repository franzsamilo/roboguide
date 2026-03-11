import type { Guide } from "@/lib/schemas";

export async function addGuide(
  data: Omit<Guide, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const res = await fetch("/api/guides", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to add guide");
  return json.id;
}

export async function updateGuide(id: string, data: Partial<Guide>): Promise<void> {
  const res = await fetch(`/api/guides/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || "Failed to update");
  }
}

export async function deleteGuide(id: string): Promise<void> {
  const res = await fetch(`/api/guides/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || "Failed to delete");
  }
}
