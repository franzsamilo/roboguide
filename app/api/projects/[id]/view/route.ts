import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "projects";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getAdminDb();
  await db.collection(COLLECTION).doc(id).update({
    viewCount: FieldValue.increment(1),
    updatedAt: new Date(),
  });
  return NextResponse.json({ ok: true });
}
