import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminDb } from "@/lib/firebase/admin";

export interface ProfileStats {
  totalViews: number;
  projectsCount: number;
  guidesCount: number;
  componentsCount: number;
  totalContributions: number;
  featuredProjects: number;
  recentProjects: { id: string; title: string; viewCount: number; status: string }[];
  recentGuides: { id: string; title: string; status: string }[];
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; email?: string; name?: string; image?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminDb();
  const authorId = user.id;

  try {
    const [projectsSnap, guidesSnap, registrySnap] = await Promise.all([
      db.collection("projects").where("authorId", "==", authorId).get(),
      db.collection("guides").where("authorId", "==", authorId).get(),
      db.collection("registryItems").where("authorId", "==", authorId).get(),
    ]);

    let totalViews = 0;
    let featuredProjects = 0;
    const recentProjects: ProfileStats["recentProjects"] = [];

    projectsSnap.docs.forEach((doc) => {
      const d = doc.data();
      totalViews += d.viewCount ?? 0;
      if (d.status === "featured") featuredProjects++;
      recentProjects.push({
        id: doc.id,
        title: d.title ?? "",
        viewCount: d.viewCount ?? 0,
        status: d.status ?? "published",
      });
    });

    registrySnap.docs.forEach((doc) => {
      const d = doc.data();
      totalViews += d.viewCount ?? 0;
    });

    recentProjects.sort((a, b) => b.viewCount - a.viewCount);

    const recentGuides: ProfileStats["recentGuides"] = guidesSnap.docs.map((doc) => {
      const d = doc.data();
      return {
        id: doc.id,
        title: d.title ?? "",
        status: d.status ?? "published",
      };
    });

    const stats: ProfileStats = {
      totalViews,
      projectsCount: projectsSnap.size,
      guidesCount: guidesSnap.size,
      componentsCount: registrySnap.size,
      totalContributions: projectsSnap.size + guidesSnap.size + registrySnap.size,
      featuredProjects,
      recentProjects: recentProjects.slice(0, 6),
      recentGuides: recentGuides.slice(0, 6),
    };

    return NextResponse.json(stats);
  } catch (err: any) {
    console.error("Profile stats error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to load profile stats" },
      { status: 500 }
    );
  }
}
