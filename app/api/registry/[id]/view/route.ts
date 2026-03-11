import { NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";

const COLLECTION = "registryItems";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const db = getAdminDb();
    const docRef = db.collection(COLLECTION).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Component not found" }, { status: 404 });
    }

    await docRef.update({
      viewCount: FieldValue.increment(1),
      updatedAt: new Date(),
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("Registry view increment error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to increment view" },
      { status: 500 }
    );
  }
}
