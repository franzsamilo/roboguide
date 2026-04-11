import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAuthenticatedUserOrNull } from "@/lib/auth-utils";

const COLLECTION = "bookmarks";

type BookmarkPayload = {
  entityType: "component" | "guide" | "project";
  entityId: string;
  title: string;
  thumbnail?: string;
};

function bookmarkDocId(userId: string, entityType: string, entityId: string) {
  return `${userId}__${entityType}__${entityId}`;
}

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUserOrNull();
  if (!user) return NextResponse.json({ bookmarks: [] });

  const db = getAdminDb();
  const entityType = req.nextUrl.searchParams.get("entityType");

  let q: FirebaseFirestore.Query = db.collection(COLLECTION).where("userId", "==", user.id);
  if (entityType) q = q.where("entityType", "==", entityType);

  const snap = await q.get();
  const bookmarks = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  // sort newest first
  bookmarks.sort((a: any, b: any) => (b.createdAt?._seconds || 0) - (a.createdAt?._seconds || 0));

  return NextResponse.json({ bookmarks });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: BookmarkPayload = await req.json();
  if (!body?.entityType || !body?.entityId || !body?.title) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = getAdminDb();
  const docId = bookmarkDocId(user.id, body.entityType, body.entityId);
  const ref = db.collection(COLLECTION).doc(docId);

  const existing = await ref.get();
  if (existing.exists) {
    // Toggle off
    await ref.delete();
    return NextResponse.json({ bookmarked: false });
  }

  await ref.set({
    userId: user.id,
    entityType: body.entityType,
    entityId: body.entityId,
    title: body.title,
    thumbnail: body.thumbnail || "",
    createdAt: new Date(),
  });

  return NextResponse.json({ bookmarked: true });
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entityType = req.nextUrl.searchParams.get("entityType");
  const entityId = req.nextUrl.searchParams.get("entityId");
  if (!entityType || !entityId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const db = getAdminDb();
  const docId = bookmarkDocId(user.id, entityType, entityId);
  await db.collection(COLLECTION).doc(docId).delete();

  return NextResponse.json({ ok: true });
}
