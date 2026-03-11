import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, ADMINS_COLLECTION, ADMINS_DOC_ID } from "@/lib/firebase/admin";
import { getAdminEmailOrNull } from "@/lib/auth-utils";

export async function GET() {
  const adminEmail = await getAdminEmailOrNull();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  const snap = await db.collection(ADMINS_COLLECTION).doc(ADMINS_DOC_ID).get();
  const emails: string[] = snap.exists ? (snap.data()?.list ?? []) : [];

  return NextResponse.json({ emails });
}

export async function POST(req: NextRequest) {
  const adminEmail = await getAdminEmailOrNull();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
  const rawEmail = (body?.email ?? "")
    .trim()
    .replace(/\uFF20/g, "@") // fullwidth @ → ASCII @
    .toLowerCase();
  if (!rawEmail || !rawEmail.includes("@") || rawEmail.length < 5) {
    return NextResponse.json(
      { error: "Valid email required (e.g. user@example.com)" },
      { status: 400 }
    );
  }
  const email = rawEmail;

  const db = getAdminDb();
  const docRef = db.collection(ADMINS_COLLECTION).doc(ADMINS_DOC_ID);
  const snap = await docRef.get();
  const emails: string[] = (snap.exists ? (snap.data()?.list ?? []) : []).map((e: string) =>
    (e ?? "").trim().toLowerCase()
  );

  if (emails.includes(email)) {
    return NextResponse.json({ message: "Already admin", emails });
  }

  emails.push(email);
  await docRef.set({ list: emails, updatedAt: new Date() });

  return NextResponse.json({ message: "Admin promoted", emails });
}

export async function DELETE(req: NextRequest) {
  const adminEmail = await getAdminEmailOrNull();
  if (!adminEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.trim()?.toLowerCase();
  if (!email) {
    return NextResponse.json(
      { error: "Email query param required" },
      { status: 400 }
    );
  }

  const envAdmin = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase() || null;
  if (envAdmin && email === envAdmin) {
    return NextResponse.json(
      { error: "Cannot remove env-configured first admin" },
      { status: 400 }
    );
  }

  const db = getAdminDb();
  const docRef = db.collection(ADMINS_COLLECTION).doc(ADMINS_DOC_ID);
  const snap = await docRef.get();
  const emails: string[] = (snap.exists ? (snap.data()?.list ?? []) : []).map((e: string) =>
    (e ?? "").trim().toLowerCase()
  );

  const filtered = emails.filter((e) => e !== email);
  if (filtered.length === emails.length) {
    return NextResponse.json({ message: "Not an admin", emails });
  }

  await docRef.set({ list: filtered, updatedAt: new Date() });

  return NextResponse.json({ message: "Admin demoted", emails: filtered });
}
