import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt =
  "CVLens — análisis verificable de CVs con evidencia citada y puntuación determinística";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens mirror the dark theme in globals.css.
const CANVAS = "#0b1524";
const SURFACE = "#16273f";
const LINE = "#2c4159";
const ACCENT = "#4e9be8";
const VERIFY = "#3ecf8e";
const INK_HIGH = "#e8eef6";
const INK_MID = "#9bb0c9";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CANVAS,
          backgroundImage: `radial-gradient(circle at 82% 12%, rgba(78,155,232,0.22), transparent 46%)`,
          padding: "72px 84px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 18,
              background: SURFACE,
              border: `1px solid ${LINE}`,
              color: ACCENT,
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            CV
          </div>
          <div style={{ display: "flex", color: INK_HIGH, fontSize: 34, fontWeight: 700 }}>
            CVLens
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              display: "flex",
              color: INK_HIGH,
              fontSize: 66,
              fontWeight: 700,
              lineHeight: 1.05,
              maxWidth: 940,
            }}
          >
            Análisis verificable de CVs
          </div>
          <div style={{ display: "flex", color: INK_MID, fontSize: 33, maxWidth: 900 }}>
            Evidencia citada del documento, puntuación determinística y auditable.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            {[0.28, 0.42, 0.6, 0.82].map((opacity, index) => (
              <div
                key={index}
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  border: `2px solid ${ACCENT}`,
                  opacity,
                }}
              />
            ))}
            <div
              style={{
                display: "flex",
                width: 120,
                height: 18,
                borderRadius: 999,
                background: VERIFY,
              }}
            />
          </div>
          <div style={{ display: "flex", color: INK_MID, fontSize: 26 }}>
            Extracción probabilística · Puntuación determinística
          </div>
        </div>
      </div>
    ),
    size,
  );
}
