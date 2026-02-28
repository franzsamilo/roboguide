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
  startAfter,
  serverTimestamp,
  increment,
  DocumentSnapshot,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "./config";
import type { RegistryItem, Category } from "@/lib/schemas";
import { CATEGORIES } from "@/lib/schemas";

const COLLECTION = "registryItems";

// ─── Read Operations ───

export async function getRegistryItems(options?: {
  category?: string | null;
  searchQuery?: string;
  status?: string;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}): Promise<{ items: RegistryItem[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [];

  if (options?.category) {
    constraints.push(where("category", "==", options.category));
  }

  if (options?.status) {
    constraints.push(where("status", "==", options.status));
  } else {
    constraints.push(where("status", "==", "published"));
  }

  constraints.push(orderBy("createdAt", "desc"));

  const pageSize = options?.pageSize || 50;
  constraints.push(limit(pageSize));

  if (options?.lastDoc) {
    constraints.push(startAfter(options.lastDoc));
  }

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  const items: RegistryItem[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as RegistryItem[];

  // Client-side search filter (Firestore doesn't support full-text natively)
  let filtered = items;
  if (options?.searchQuery) {
    const search = options.searchQuery.toLowerCase();
    filtered = items.filter(
      (item) =>
        item.name.toLowerCase().includes(search) ||
        item.tags.some((t) => t.toLowerCase().includes(search)) ||
        item.category.toLowerCase().includes(search) ||
        (item.description && item.description.toLowerCase().includes(search))
    );
  }

  return {
    items: filtered,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
  };
}

export async function getRegistryItemBySlug(slug: string): Promise<RegistryItem | null> {
  const q = query(collection(db, COLLECTION), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as RegistryItem;
}

export async function getRegistryItemById(id: string): Promise<RegistryItem | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as RegistryItem;
}

export async function checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
  const q = query(collection(db, COLLECTION), where("slug", "==", slug), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return false;
  if (excludeId && snapshot.docs[0].id === excludeId) return false;
  return true;
}

// ─── Write Operations ───

export async function addRegistryItem(data: Omit<RegistryItem, "id" | "createdAt" | "updatedAt" | "viewCount">): Promise<string> {
  const slugExists = await checkSlugExists(data.slug);
  if (slugExists) {
    throw new Error(`Slug "${data.slug}" already exists. Choose a unique slug.`);
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    viewCount: 0,
    status: data.status || "published",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateRegistryItem(
  id: string,
  data: Partial<RegistryItem>
): Promise<void> {
  // If slug is being changed, check for conflicts
  if (data.slug) {
    const slugExists = await checkSlugExists(data.slug, id);
    if (slugExists) {
      throw new Error(`Slug "${data.slug}" already exists.`);
    }
  }

  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteRegistryItem(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

export async function incrementViewCount(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { viewCount: increment(1) });
}

// ─── Category Aggregation ───

export async function getCategoriesWithCounts(): Promise<Category[]> {
  const q = query(collection(db, COLLECTION), where("status", "==", "published"));
  const snapshot = await getDocs(q);

  const counts: Record<string, number> = {};
  snapshot.docs.forEach((doc) => {
    const cat = doc.data().category;
    counts[cat] = (counts[cat] || 0) + 1;
  });

  return CATEGORIES.map((cat) => ({
    ...cat,
    count: counts[cat.id] || 0,
  }));
}
