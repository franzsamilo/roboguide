import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAuthenticatedUserOrNull } from "@/lib/auth-utils";
import type { RegistryItem } from "@/lib/schemas";

const COLLECTION = "registryItems";

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUserOrNull();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const data = body as Omit<RegistryItem, "id" | "createdAt" | "updatedAt" | "viewCount">;

    if (!data?.slug || typeof data.slug !== "string") {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }
    if (!data?.name || typeof data.name !== "string") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (!data?.category || typeof data.category !== "string") {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const slug = data.slug.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
    if (!slug) {
      return NextResponse.json({ error: "Invalid slug format" }, { status: 400 });
    }

    const db = getAdminDb();
    const col = db.collection(COLLECTION);

    const existing = await col.where("slug", "==", slug).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json(
        { error: `Slug "${slug}" already exists. Choose a different slug.` },
        { status: 400 }
      );
    }

    const docRef = await col.add({
      ...data,
      slug,
      viewCount: 0,
      status: data.status || "published",
      authorId: user.id,
      authorName: user.name || "Unknown",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ id: docRef.id });
  } catch (err: unknown) {
    console.error("Registry POST error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to add component" },
      { status: 500 }
    );
  }
}
