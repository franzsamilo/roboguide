import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** X-inspired icon with ROBOGUIDE flair: circuit/tech aesthetic */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderRadius: 8,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 5l5.5 5.5M19 19l-5.5-5.5M19 5l-5.5 5.5M5 19l5.5-5.5" />
          <circle cx="12" cy="12" r="2" fill="#38bdf8" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
