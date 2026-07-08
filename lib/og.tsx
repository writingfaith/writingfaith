import { ImageResponse } from "next/og";

import { authorName } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Loads Newsreader for OG rendering. Satori needs raw font data (TTF/OTF);
 * we resolve it via the Google Fonts CSS API with a plain user agent, which
 * returns TTF URLs. Failure is non-fatal — the template falls back to the
 * bundled default font rather than breaking social previews.
 */
async function loadSerifFont(): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      "https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,500&display=swap",
      { headers: { "User-Agent": "curl/8" } },
    ).then((res) => res.text());
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    return await fetch(url).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

/**
 * The shared typographic OG template: warm paper, ink, bronze accent —
 * the site's tokens restated as literals (ImageResponse can't read CSS).
 */
export async function brandImage({
  eyebrow,
  title,
  detail,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
}) {
  const serif = await loadSerifFont();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#f9f6ef",
          color: "#201c16",
          fontFamily: serif ? "Newsreader" : "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#6f6656",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 70 ? 58 : 72,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            maxWidth: "100%",
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            borderTop: "2px solid #e6ddcd",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", fontSize: 34 }}>
            Writing<span style={{ color: "#8a5a2b", fontStyle: "italic" }}>Faith</span>
          </div>
          <div style={{ display: "flex", fontSize: 26, color: "#5d554a" }}>
            {detail ?? authorName}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: serif
        ? [{ name: "Newsreader", data: serif, style: "normal" as const, weight: 500 as const }]
        : undefined,
    },
  );
}
