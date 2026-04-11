import type { Metadata } from "next";
import { getAdminDb } from "@/lib/firebase/admin";

type Props = {
  params: Promise<{ id: string }>;
};

async function fetchProject(id: string) {
  try {
    const db = getAdminDb();
    const snap = await db.collection("projects").doc(id).get();
    if (!snap.exists) return null;
    return snap.data() as {
      title: string;
      description?: string;
      coverImage?: string;
      tags?: string[];
      authorName?: string;
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await fetchProject(id);

  if (!project) {
    return {
      title: "Project Not Found",
      description: "The project you're looking for doesn't exist.",
    };
  }

  const title = project.title;
  const description = project.description?.slice(0, 200) || `A maker project on ROBOGUIDE.`;
  const ogImage = project.coverImage;

  return {
    title,
    description,
    authors: project.authorName ? [{ name: project.authorName }] : undefined,
    keywords: [...(project.tags || []), "project", "maker", "IoT", "DIY"],
    openGraph: {
      title,
      description,
      type: "article",
      authors: project.authorName ? [project.authorName] : undefined,
      images: ogImage ? [{ url: ogImage, alt: project.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default function ProjectDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
