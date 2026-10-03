import { ImageResponse } from "next/og";

export const alt = "Wind";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * 站点级 OG 分享图：Wind 字标 + 风线母题。
 * 纯拉丁字符，不引入 CJK 字体文件；中文标题由平台的 og:title 文本展示。
 */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 88px",
        backgroundColor: "#fafaf7",
        color: "#24262a",
      }}
    >
      <div style={{ display: "flex", fontSize: 44, color: "#6f7378", letterSpacing: 6 }}>
        A PERSONAL BLOG
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <svg width="1024" height="220" viewBox="0 0 1024 220" fill="none">
          <path
            d="M-10 60 C 160 20, 340 110, 520 60 S 840 30, 1034 80"
            stroke="#236871"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="14 22"
            opacity="0.55"
          />
          <path
            d="M-10 130 C 200 170, 420 90, 640 130 S 900 160, 1034 110"
            stroke="#236871"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="14 22"
            opacity="0.35"
          />
        </svg>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", fontSize: 148, letterSpacing: -4 }}>Wind.</div>
        <div style={{ display: "flex", fontSize: 34, color: "#6f7378", letterSpacing: 10 }}>
          SIMPLE · LIGHT · FLOWING
        </div>
      </div>
    </div>,
    size,
  );
}
