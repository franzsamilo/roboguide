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
import type { Project } from "@/lib/schemas";

const COLLECTION = "projects";

// ─── Read Operations ───

export async function getProjects(options?: {
  status?: string;
  authorId?: string;
  tag?: string;
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
}): Promise<{ projects: Project[]; lastDoc: DocumentSnapshot | null }> {
  const constraints: QueryConstraint[] = [];

  if (options?.status) {
    constraints.push(where("status", "==", options.status));
  } else {
    constraints.push(where("status", "in", ["published", "featured"]));
  }

  if (options?.authorId) {
    constraints.push(where("authorId", "==", options.authorId));
  }

  constraints.push(orderBy("createdAt", "desc"));

  const pageSize = options?.pageSize || 20;
  constraints.push(limit(pageSize));

  if (options?.lastDoc) {
    constraints.push(startAfter(options.lastDoc));
  }

  const q = query(collection(db, COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  let projects = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[];

  // Client-side tag filter
  if (options?.tag) {
    projects = projects.filter((p) =>
      p.tags.some((t) => t.toLowerCase() === options.tag!.toLowerCase())
    );
  }

  return {
    projects,
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
  };
}

export async function getProjectById(id: string): Promise<Project | null> {
  const docRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Project;
}

export async function getFeaturedProjects(count: number = 3): Promise<Project[]> {
  const q = query(
    collection(db, COLLECTION),
    where("status", "==", "featured"),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Project[];
}

// ─── Write Operations ───

export async function addProject(
  data: Omit<Project, "id" | "createdAt" | "updatedAt" | "viewCount">
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    viewCount: 0,
    status: data.status || "published",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProject(
  id: string,
  data: Partial<Project>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await deleteDoc(docRef);
}

export async function incrementProjectViewCount(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { viewCount: increment(1) });
}
