import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from "firebase/storage";
import { storage } from "./config";
import { FILE_LIMITS } from "@/lib/schemas";

export interface UploadProgress {
  progress: number;
  downloadURL?: string;
  error?: string;
}

function validateFile(file: File): string | null {
  const isImage = FILE_LIMITS.allowedImageTypes.includes(file.type);
  const isVideo = FILE_LIMITS.allowedVideoTypes.includes(file.type);

  if (!isImage && !isVideo) {
    return `Unsupported file type: ${file.type}. Allowed: images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM).`;
  }

  if (isImage && file.size > FILE_LIMITS.maxImageSize) {
    return `Image too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: ${FILE_LIMITS.maxImageSize / 1024 / 1024}MB.`;
  }

  if (isVideo && file.size > FILE_LIMITS.maxVideoSize) {
    return `Video too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Max: ${FILE_LIMITS.maxVideoSize / 1024 / 1024}MB.`;
  }

  return null;
}

function generateUniqueFilename(file: File): string {
  const ext = file.name.split(".").pop() || "bin";
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${random}.${ext}`;
}

/**
 * Upload a single file with progress tracking.
 */
export function uploadFile(
  file: File,
  basePath: string,
  onProgress?: (progress: number) => void
): { task: UploadTask; promise: Promise<string> } {
  const validationError = validateFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const filename = generateUniqueFilename(file);
  const storageRef = ref(storage, `${basePath}/${filename}`);
  const task = uploadBytesResumable(storageRef, file);

  const promise = new Promise<string>((resolve, reject) => {
    task.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => {
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (error) {
          reject(new Error("Failed to get download URL"));
        }
      }
    );
  });

  return { task, promise };
}

/**
 * Upload multiple files in parallel with individual progress tracking.
 */
export async function uploadMultipleFiles(
  files: File[],
  basePath: string,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<string[]> {
  if (files.length > FILE_LIMITS.maxFilesPerUpload) {
    throw new Error(`Too many files. Max: ${FILE_LIMITS.maxFilesPerUpload} per upload.`);
  }

  // Validate all files first
  for (const file of files) {
    const error = validateFile(file);
    if (error) throw new Error(error);
  }

  const promises = files.map((file, index) => {
    const { promise } = uploadFile(file, basePath, (progress) => {
      onProgress?.(index, progress);
    });
    return promise;
  });

  return Promise.all(promises);
}

/**
 * Delete a file from storage by its full download URL.
 */
export async function deleteFileByUrl(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch (error: any) {
    // File may already be deleted — don't throw on not-found
    if (error?.code !== "storage/object-not-found") {
      throw error;
    }
  }
}
