import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAdminEmailOrNull, getAuthenticatedUserOrNull } from "@/lib/auth-utils";
import type { Project } from "@/lib/schemas";

const COLLECTION = "projects";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getAdminDb();
  const docRef = db.collection(COLLECTION).doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const existing = snap.data() as Project;
  const adminEmail = await getAdminEmailOrNull();
  const isAdmin = !!adminEmail;
  const isAuthor = existing.authorId === user.id;

  if (!isAdmin && !isAuthor) {
    return NextResponse.json({ error: "Only the author or an admin can edit this project" }, { status: 403 });
  }

  const body = await req.json();
  const data = body as Partial<Project>;

  const update: Record<string, unknown> = { ...data, updatedAt: new Date() };
  delete update.id;
  delete update.createdAt;
  delete update.viewCount;

  await docRef.update(update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getAdminDb();
  const docRef = db.collection(COLLECTION).doc(id);
  const snap = await docRef.get();
  if (!snap.exists) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const existing = snap.data() as Project;
  const adminEmail = await getAdminEmailOrNull();
  const isAdmin = !!adminEmail;
  const isAuthor = existing.authorId === user.id;

  if (!isAdmin && !isAuthor) {
    return NextResponse.json({ error: "Only the author or an admin can delete this project" }, { status: 403 });
  }

  await docRef.delete();
  return NextResponse.json({ ok: true });
}
