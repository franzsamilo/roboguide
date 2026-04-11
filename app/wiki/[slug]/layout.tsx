import type { Metadata } from "next";
import { getAdminDb } from "@/lib/firebase/admin";

type Props = {
  params: Promise<{ slug: string }>;
};

async function fetchItem(slug: string) {
  try {
    const db = getAdminDb();
    const snap = await db.collection("registryItems").where("slug", "==", slug).limit(1).get();
    if (snap.empty) return null;
    return snap.docs[0].data() as {
      name: string;
      description?: string;
      category?: string;
      image?: string;
      tags?: string[];
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchItem(slug);

  if (!item) {
    return {
      title: "Component Not Found",
      description: "The component you're looking for doesn't exist in our registry.",
    };
  }

  const title = item.name;
  const description = item.description?.slice(0, 200) || `${item.name} — pinout, datasheet, specs, and community guides on ROBOGUIDE.`;
  const ogImage = item.image || undefined;

  return {
    title,
    description,
    keywords: [...(item.tags || []), item.category || "", "IoT", "electronics"].filter(Boolean),
    openGraph: {
      title,
      description,
      type: "article",
      images: ogImage ? [{ url: ogImage, alt: item.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default function WikiSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
