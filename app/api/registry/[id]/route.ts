import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAdminEmailOrNull } from "@/lib/auth-utils";
import type { RegistryItem } from "@/lib/schemas";

const COLLECTION = "registryItems";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmailOrNull();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const data = body as Partial<RegistryItem>;

  const db = getAdminDb();
  const docRef = db.collection(COLLECTION).doc(id);

  if (data.slug) {
    const existing = await db.collection(COLLECTION).where("slug", "==", data.slug).limit(1).get();
    if (!existing.empty && existing.docs[0].id !== id) {
      return NextResponse.json({ error: `Slug "${data.slug}" already exists` }, { status: 400 });
    }
  }

  const update: Record<string, unknown> = { ...data, updatedAt: new Date() };
  delete update.id;
  delete update.createdAt;
  delete update.viewCount;

  await docRef.update(update);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmailOrNull();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const db = getAdminDb();
  await db.collection(COLLECTION).doc(id).delete();
  return NextResponse.json({ ok: true });
}
