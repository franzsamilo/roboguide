import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/lib/firebase/admin";
import { getAuthenticatedUserOrNull } from "@/lib/auth-utils";

const FILE_LIMITS = {
  maxImageSize: 5 * 1024 * 1024,
  maxVideoSize: 50 * 1024 * 1024,
  allowedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  allowedVideoTypes: ["video/mp4", "video/webm"],
};

function validateFile(file: File): string | null {
  const isImage = FILE_LIMITS.allowedImageTypes.includes(file.type);
  const isVideo = FILE_LIMITS.allowedVideoTypes.includes(file.type);
  if (!isImage && !isVideo) return `Unsupported type: ${file.type}`;
  if (isImage && file.size > FILE_LIMITS.maxImageSize) return "Image too large";
  if (isVideo && file.size > FILE_LIMITS.maxVideoSize) return "Video too large";
  return null;
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUserOrNull();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const basePath = (formData.get("basePath") as string) || "uploads";

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const err = validateFile(file);
  if (err) return NextResponse.json({ error: err }, { status: 400 });

  const ext = file.name.split(".").pop() || "bin";
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const path = `${basePath}/${filename}`;

  try {
    const storage = getAdminStorage();
    const bucket = storage.bucket();
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileRef = bucket.file(path);

    await fileRef.save(buffer, {
      metadata: {
        contentType: file.type,
        metadata: { firebaseStorageDownloadTokens: crypto.randomUUID() },
      },
    });

    await fileRef.makePublic();
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";
    const url = `https://storage.googleapis.com/${bucketName}/${path}`;

    return NextResponse.json({ url });
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed" },
      { status: 500 }
    );
  }
}
