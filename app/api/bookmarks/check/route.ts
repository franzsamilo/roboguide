import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAuthenticatedUserOrNull } from "@/lib/auth-utils";

const COLLECTION = "bookmarks";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUserOrNull();
  if (!user) return NextResponse.json({ bookmarked: false });

  const entityType = req.nextUrl.searchParams.get("entityType");
  const entityId = req.nextUrl.searchParams.get("entityId");
  if (!entityType || !entityId) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const db = getAdminDb();
  const docId = `${user.id}__${entityType}__${entityId}`;
  const snap = await db.collection(COLLECTION).doc(docId).get();
  return NextResponse.json({ bookmarked: snap.exists });
}
