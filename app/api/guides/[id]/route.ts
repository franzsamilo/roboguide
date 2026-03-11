import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAdminEmailOrNull } from "@/lib/auth-utils";
import type { Guide } from "@/lib/schemas";

const COLLECTION = "guides";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const adminEmail = await getAdminEmailOrNull();
  if (!adminEmail) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const data = body as Partial<Guide>;

  const db = getAdminDb();
  const update: Record<string, unknown> = { ...data, updatedAt: new Date() };
  delete update.id;
  delete update.createdAt;

  await db.collection(COLLECTION).doc(id).update(update);
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
