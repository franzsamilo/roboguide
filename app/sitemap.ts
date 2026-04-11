import type { MetadataRoute } from "next";
import { getAdminDb } from "@/lib/firebase/admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/wiki`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/guides`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/projects`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/start`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/submit`, changeFrequency: "monthly", priority: 0.5 },
  ];

  try {
    const db = getAdminDb();
    const [itemsSnap, guidesSnap, projectsSnap] = await Promise.all([
      db.collection("registryItems").where("status", "==", "published").get(),
      db.collection("guides").where("status", "==", "published").get(),
      db.collection("projects").where("status", "in", ["published", "featured"]).get(),
    ]);

    const dynamicRoutes: MetadataRoute.Sitemap = [];

    itemsSnap.docs.forEach((doc) => {
      const data = doc.data();
      if (data.slug) {
        dynamicRoutes.push({
          url: `${SITE_URL}/wiki/${data.slug}`,
          lastModified: data.updatedAt?.toDate?.() || new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    });

    guidesSnap.docs.forEach((doc) => {
      const data = doc.data();
      dynamicRoutes.push({
        url: `${SITE_URL}/guides/${doc.id}`,
        lastModified: data.updatedAt?.toDate?.() || new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    });

    projectsSnap.docs.forEach((doc) => {
      const data = doc.data();
      dynamicRoutes.push({
        url: `${SITE_URL}/projects/${doc.id}`,
        lastModified: data.updatedAt?.toDate?.() || new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    });

    return [...staticRoutes, ...dynamicRoutes];
  } catch {
    return staticRoutes;
  }
}
