import type { Project } from "@/lib/schemas";

export async function addProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt" | "viewCount">
): Promise<string> {
  const res = await fetch("/api/projects", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to add project");
  return json.id;
}

export async function updateProject(
  id: string,
  data: Partial<Omit<Project, "id" | "createdAt" | "viewCount">>
): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to update project");
}

export async function deleteProject(id: string): Promise<void> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || "Failed to delete project");
}

export async function incrementProjectViewCount(id: string): Promise<void> {
  await fetch(`/api/projects/${id}/view`, { method: "POST", credentials: "include" });
}
