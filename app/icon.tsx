import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Code-generated favicon/app icon (no binary asset to maintain).
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
          background:
            "linear-gradient(135deg, #3fa17e 0%, #608cff 55%, #ffb07a 118%)",
          color: "#fff",
          fontSize: 40,
          fontWeight: 800,
          borderRadius: 14,
        }}
      >
        W
      </div>
    ),
    { ...size }
  );
}
