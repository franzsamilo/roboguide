/**
 * Upload file via API (uses NextAuth session).
 * Replaces direct Firebase Storage upload when using NextAuth.
 */
export async function uploadFileViaApi(
  file: File,
  basePath: string,
  onProgress?: (progress: number) => void
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("basePath", basePath);

  onProgress?.(10);

  const res = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  onProgress?.(90);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Upload failed: ${res.status}`);
  }

  const data = await res.json();
  onProgress?.(100);
  return data.url;
}
