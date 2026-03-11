/** Check if URL is a YouTube video (watch, youtu.be, or embed) */
export function isYouTubeUrl(url: string): boolean {
  return (
    /youtube\.com\/watch\?v=/i.test(url) ||
    /youtu\.be\//i.test(url) ||
    /youtube\.com\/embed\//i.test(url)
  );
}

/** Extract YouTube video ID from various URL formats */
export function getYouTubeVideoId(url: string): string | null {
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];
  return null;
}

/** Check if URL points to a video file */
export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm)(\?|$)/i.test(url) || /video\/(mp4|webm)/i.test(url);
}

/** Get YouTube thumbnail URL */
export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}
