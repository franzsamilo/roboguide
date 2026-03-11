import type { RegistryItem } from "@/lib/schemas";

export async function addRegistryItem(
  data: Omit<RegistryItem, "id" | "createdAt" | "updatedAt" | "viewCount">
): Promise<string> {
  const res = await fetch("/api/registry", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to add");
  return json.id;
}

export async function updateRegistryItem(id: string, data: Partial<RegistryItem>): Promise<void> {
  const res = await fetch(`/api/registry/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to update");
}

export async function deleteRegistryItem(id: string): Promise<void> {
  const res = await fetch(`/api/registry/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) {
    const json = await res.json();
    throw new Error(json.error || "Failed to delete");
  }
}

export async function incrementViewCount(id: string): Promise<void> {
  await fetch(`/api/registry/${id}/view`, { method: "POST", credentials: "include" });
}
