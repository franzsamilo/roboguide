import type { Metadata } from "next";
import { getAdminDb } from "@/lib/firebase/admin";

type Props = {
  params: Promise<{ id: string }>;
};

async function fetchGuide(id: string) {
  try {
    const db = getAdminDb();
    const snap = await db.collection("guides").doc(id).get();
    if (!snap.exists) return null;
    return snap.data() as {
      title: string;
      excerpt?: string;
      content?: string;
      hyperlocalTags?: string[];
      authorName?: string;
      mediaUrls?: string[];
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const guide = await fetchGuide(id);

  if (!guide) {
    return {
      title: "Guide Not Found",
      description: "The guide you're looking for doesn't exist.",
    };
  }

  const title = guide.title;
  const description = guide.excerpt || guide.content?.slice(0, 200) || `A community guide on ROBOGUIDE.`;
  const ogImage = guide.mediaUrls?.[0];

  return {
    title,
    description,
    authors: guide.authorName ? [{ name: guide.authorName }] : undefined,
    keywords: [...(guide.hyperlocalTags || []), "guide", "tutorial", "IoT"],
    openGraph: {
      title,
      description,
      type: "article",
      authors: guide.authorName ? [guide.authorName] : undefined,
      images: ogImage ? [{ url: ogImage, alt: guide.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default function GuideDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
