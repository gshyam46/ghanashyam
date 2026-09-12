import { ImageResponse } from "next/og";

export const alt = "Ghanashyam G — Engineering the invisible. Systems, AI, and observability.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "64px 72px", background: "#111210", color: "#e9e7df" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 19, letterSpacing: 4 }}><span>GHANASHYAM G</span><span style={{ color: "#d8a680" }}>THE OBSERVATORY</span></div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 87, letterSpacing: -4, lineHeight: 1.07 }}><span>Engineering</span><span style={{ color: "#d8a680" }}>the invisible.</span></div>
        <svg width="330" height="300" viewBox="0 0 330 300" fill="none">
          {[0, 12, 24, 36, 48, 60, 72, 84].map(angle => <ellipse key={angle} cx="165" cy="150" rx="141" ry="57" transform={`rotate(${angle - 42} 165 150)`} stroke="#d8a680" strokeWidth="1.4" opacity="0.75" />)}
          <circle cx="165" cy="150" r="7" fill="#e9e7df" />
        </svg>
      </div>
      <div style={{ display: "flex", paddingTop: 22, borderTop: "1px solid #424438", color: "#a0a398", fontSize: 17, letterSpacing: 3 }}>SYSTEMS ENGINEERING · APPLIED AI · OBSERVABILITY</div>
    </div>, size,
  );
}
