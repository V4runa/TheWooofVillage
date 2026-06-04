import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "The Wooof Village — Meet your next best friend";

// Code-generated social share image (Open Graph / Twitter).
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #fff6ee 0%, #fbeede 45%, #ffe9d2 100%)",
        }}
      >
        {/* brand ribbon */}
        <div
          style={{
            display: "flex",
            width: "180px",
            height: "10px",
            borderRadius: "9999px",
            background:
              "linear-gradient(90deg, #3fa17e 0%, #608cff 55%, #ffb07a 118%)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginTop: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "84px",
              height: "84px",
              borderRadius: "22px",
              background:
                "linear-gradient(135deg, #3fa17e 0%, #608cff 55%, #ffb07a 118%)",
              color: "#fff",
              fontSize: "52px",
              fontWeight: 800,
            }}
          >
            W
          </div>
          <div
            style={{
              display: "flex",
              fontSize: "34px",
              fontWeight: 700,
              color: "#5a4632",
            }}
          >
            The Wooof Village
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "36px",
            fontSize: "72px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#211c18",
            lineHeight: 1.05,
          }}
        >
          Meet your next best friend
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "24px",
            fontSize: "32px",
            color: "#6b5a48",
            maxWidth: "900px",
          }}
        >
          A small, home-raised program. Browse available puppies, photos, and how to reserve.
        </div>
      </div>
    ),
    { ...size }
  );
}
