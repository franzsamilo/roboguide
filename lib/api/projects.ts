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

export async function incrementProjectViewCount(id: string): Promise<void> {
  await fetch(`/api/projects/${id}/view`, { method: "POST", credentials: "include" });
}
