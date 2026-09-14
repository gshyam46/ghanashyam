import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS applies its own corner rounding and gloss to this icon, so the background
// stays a plain opaque square here rather than reusing icon.svg's rounded rect.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111210" }}>
        <svg width="128" height="128" viewBox="0 0 64 64" fill="none">
          <g stroke="#dba680" strokeWidth="2.6">
            <ellipse cx="32" cy="32" rx="22" ry="11" transform="rotate(-35 32 32)" />
            <ellipse cx="32" cy="32" rx="22" ry="11" transform="rotate(35 32 32)" />
            <circle cx="32" cy="32" r="4" fill="#dba680" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
