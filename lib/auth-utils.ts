import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { getAdminDb, ADMINS_COLLECTION, ADMINS_DOC_ID } from "./firebase/admin";

export async function getSessionOrNull() {
  return getServerSession(authOptions);
}

function normalizeEmail(e: string | undefined): string {
  return (e ?? "").trim().toLowerCase();
}

export async function getAdminEmailOrNull(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  const rawEmail = session?.user?.email;
  if (!rawEmail) return null;
  const email = normalizeEmail(rawEmail);

  const db = getAdminDb();
  const docRef = db.collection(ADMINS_COLLECTION).doc(ADMINS_DOC_ID);
  const snap = await docRef.get();
  let emails: string[] = (snap.exists ? (snap.data()?.list ?? []) : []).map(normalizeEmail);
  const envAdmin = normalizeEmail(process.env.ADMIN_EMAIL);

  // Auto-seed: if list empty and user matches ADMIN_EMAIL, add them
  if (emails.length === 0 && envAdmin && email === envAdmin) {
    emails = [envAdmin];
    await docRef.set({ list: emails, updatedAt: new Date() });
  }

  const isAdmin = (envAdmin && email === envAdmin) || emails.includes(email);
  return isAdmin ? email : null;
}

export async function getAuthenticatedUserOrNull(): Promise<{
  id: string;
  email: string;
  name?: string;
} | null> {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string; name?: string } | undefined;
  if (!user?.email || !user.id) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? undefined,
  };
}
