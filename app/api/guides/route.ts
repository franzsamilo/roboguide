import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase/admin";
import { getAuthenticatedUserOrNull } from "@/lib/auth-utils";
import type { Guide } from "@/lib/schemas";

const COLLECTION = "guides";

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUserOrNull();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const data = body as Omit<Guide, "id" | "createdAt" | "updatedAt">;

  const db = getAdminDb();
  const docRef = await db.collection(COLLECTION).add({
    ...data,
    status: data.status || "published",
    authorId: user.id,
    authorName: user.name || "Unknown",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return NextResponse.json({ id: docRef.id });
}
