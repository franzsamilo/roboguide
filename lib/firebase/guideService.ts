import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type { Guide } from "@/lib/schemas";

const COLLECTION = "guides";

// ─── Read Operations ───

export async function getGuidesForItem(registrySlug: string): Promise<Guide[]> {
  const q = query(
    collection(db, COLLECTION),
    where("registrySlug", "==", registrySlug),
    where("status", "==", "published"),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Guide[];
}

export async function getAllGuides(options?: {
  status?: string;
  authorId?: string;
}): Promise<Guide[]> {
  const constraints: QueryConstraint[] = [];

  if (options?.status) {
    constraints.push(where("status", "==", options.status));
  }
  if (options?.authorId) {
    constraints.push(where("authorId", "==", options.authorId));
  }

  constraints.push(orderBy("createdAt", "desc"));

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Guide[];
}

export async function getGuideById(id: string): Promise<Guide | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Guide;
}

// ─── Write Operations ───

export async function addGuide(
  data: Omit<Guide, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    status: data.status || "published",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateGuide(
  id: string,
  data: Partial<Guide>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGuide(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

// ─── Utility ───

export async function getGuideCountForItem(registrySlug: string): Promise<number> {
  const q = query(
    collection(db, COLLECTION),
    where("registrySlug", "==", registrySlug),
    where("status", "==", "published")
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}
