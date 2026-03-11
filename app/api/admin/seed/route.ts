import { NextResponse } from "next/server";
import { getAdminDb, ADMINS_COLLECTION, ADMINS_DOC_ID } from "@/lib/firebase/admin";

export async function POST() {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return NextResponse.json(
        { error: "ADMIN_EMAIL not set in environment" },
        { status: 500 }
      );
    }

    const db = getAdminDb();
    const docRef = db.collection(ADMINS_COLLECTION).doc(ADMINS_DOC_ID);
    const snap = await docRef.get();

    const emails: string[] = snap.exists ? (snap.data()?.list ?? []) : [];

    if (emails.includes(adminEmail)) {
      return NextResponse.json({
        message: "Admin already seeded",
        emails,
      });
    }

    emails.push(adminEmail);
    await docRef.set({ list: emails, updatedAt: new Date() });

    return NextResponse.json({
      message: "First admin seeded from ADMIN_EMAIL",
      emails,
    });
  } catch (err) {
    console.error("Admin seed error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Seed failed" },
      { status: 500 }
    );
  }
}
