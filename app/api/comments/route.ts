import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAuthenticatedUserOrNull, getAdminEmailOrNull } from "@/lib/auth-utils";

const COLLECTION = "comments";
const MAX_LEN = 500;

export async function GET(req: NextRequest) {
  const entityType = req.nextUrl.searchParams.get("entityType");
  const entityId = req.nextUrl.searchParams.get("entityId");
  if (!entityType || !entityId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const db = getAdminDb();
  const snap = await db
    .collection(COLLECTION)
    .where("entityType", "==", entityType)
    .where("entityId", "==", entityId)
    .get();

  const comments = snap.docs.map((doc) => {
    const data = doc.data() as any;
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?._seconds
        ? data.createdAt._seconds * 1000
        : data.createdAt instanceof Date
        ? data.createdAt.getTime()
        : null,
    };
  });

  // Sort newest first in memory to avoid needing a composite index.
  comments.sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0));

  return NextResponse.json({ comments });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { entityType, entityId, text } = body || {};

  if (!entityType || !entityId || !text?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (entityType !== "guide" && entityType !== "project") {
    return NextResponse.json({ error: "Invalid entity type" }, { status: 400 });
  }
  const trimmed = String(text).trim().slice(0, MAX_LEN);

  const db = getAdminDb();
  const ref = await db.collection(COLLECTION).add({
    entityType,
    entityId,
    text: trimmed,
    authorId: user.id,
    authorName: user.name || "Unknown",
    authorEmail: user.email,
    createdAt: new Date(),
  });

  const snap = await ref.get();
  const data = snap.data() as any;
  return NextResponse.json({
    id: ref.id,
    ...data,
    createdAt: data.createdAt instanceof Date ? data.createdAt.getTime() : null,
  });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const db = getAdminDb();
  const ref = db.collection(COLLECTION).doc(id);
  const snap = await ref.get();
  if (!snap.exists) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data = snap.data() as any;
  const adminEmail = await getAdminEmailOrNull();
  const isOwner = data.authorId === user.id;
  const isAdmin = !!adminEmail;

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ref.delete();
  return NextResponse.json({ ok: true });
}
