import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Bulk AI Image Generator";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#0a0a0a",
          backgroundImage:
            "radial-gradient(circle at 18% 20%, rgba(59,130,246,0.35), transparent 55%), radial-gradient(circle at 78% 78%, rgba(236,72,153,0.20), transparent 55%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: -1.5,
            lineHeight: 1.1,
          }}
        >
          Bulk AI Image Generator
        </div>

        <div
          style={{
            marginTop: 22,
            fontSize: 30,
            lineHeight: 1.3,
            color: "rgba(255,255,255,0.85)",
            maxWidth: 900,
          }}
        >
          Turn a JSON list of prompts into images fast — powered by Gemini.
        </div>

        <div
          style={{
            marginTop: 54,
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          <div
            style={{
              padding: "10px 16px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            img-gen.mandy9943.dev
          </div>

          <div
            style={{
              padding: "10px 16px",
              borderRadius: 9999,
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          >
            @Mandy9943
          </div>
        </div>
      </div>
    ),
    size
  );
}


