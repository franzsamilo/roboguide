import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminDb, ADMINS_COLLECTION, ADMINS_DOC_ID } from "@/lib/firebase/admin";

function normalizeEmail(e: string | undefined): string {
  return (e ?? "").trim().toLowerCase();
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const rawEmail = session?.user?.email;
    if (!rawEmail) {
      return NextResponse.json({ isAdmin: false });
    }
    const email = normalizeEmail(rawEmail);

    const db = getAdminDb();
    const docRef = db.collection(ADMINS_COLLECTION).doc(ADMINS_DOC_ID);
    const snap = await docRef.get();
    let emails: string[] = (snap.exists ? (snap.data()?.list ?? []) : []).map(normalizeEmail);
    const envAdmin = normalizeEmail(process.env.ADMIN_EMAIL);

    if (emails.length === 0 && envAdmin && email === envAdmin) {
      emails = [envAdmin];
      await docRef.set({ list: emails, updatedAt: new Date() });
    }

    const isAdmin = (envAdmin && email === envAdmin) || emails.includes(email);
    return NextResponse.json({ isAdmin, email });
  } catch {
    return NextResponse.json({ isAdmin: false });
  }
}
