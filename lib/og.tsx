import { ImageResponse } from "next/og";


export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Loads Newsreader for OG rendering. Satori needs raw font data (TTF/OTF);
 * we resolve it via the Google Fonts CSS API with a plain user agent, which
 * returns TTF URLs. Failure is non-fatal — the template falls back to the
 * bundled default font rather than breaking social previews. Satori has no
 * synthetic italic, so the quote card requests the italic static instance
 * explicitly (`ital,opsz,wght@1,...`) rather than an `ital: 1` prop.
 */
async function loadSerifFont(
  italic = false,
): Promise<ArrayBuffer | null> {
  try {
    const family = italic
      ? "Newsreader:ital,opsz,wght@1,6..72,500"
      : "Newsreader:opsz,wght@6..72,500";
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=${family}&display=swap`,
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
  const serif = await loadSerifFont(false);

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
          {detail ? (
            <div style={{ display: "flex", fontSize: 26, color: "#5d554a" }}>
              {detail}
            </div>
          ) : null}
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

/** A little under the display size at the top of the scale — plenty of room for a full sentence. */
function quoteFontSize(length: number): number {
  if (length > 260) return 40;
  if (length > 160) return 48;
  if (length > 90) return 56;
  return 66;
}

/**
 * A shareable card for a passage a reader has selected — the same warm
 * paper/ink/bronze palette as brandImage, but built for a single sentence:
 * large italic quote, hairline rule, essay title and wordmark below.
 */
export async function quoteCardImage({
  quote,
  essayTitle,
}: {
  quote: string;
  essayTitle: string;
}) {
  const italic = await loadSerifFont(true);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 84px",
          backgroundColor: "#f9f6ef",
          color: "#201c16",
          fontFamily: italic ? "Newsreader" : "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 60,
            color: "#8a5a2b",
            opacity: 0.5,
            lineHeight: 1,
          }}
        >
          “
        </div>
        <div
          style={{
            display: "flex",
            fontSize: quoteFontSize(quote.length),
            lineHeight: 1.32,
            fontStyle: "italic",
            letterSpacing: "-0.012em",
            color: "#3a3226",
          }}
        >
          {quote}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 18,
            borderTop: "2px solid #e6ddcd",
            paddingTop: 26,
          }}
        >
          <div style={{ display: "flex", fontSize: 24, color: "#6f6656" }}>
            {essayTitle}
          </div>
          <div style={{ display: "flex", fontSize: 30, fontStyle: "normal" }}>
            Writing<span style={{ color: "#8a5a2b", fontStyle: "italic" }}>Faith</span>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: italic
        ? [
            {
              name: "Newsreader",
              data: italic,
              style: "italic" as const,
              weight: 500 as const,
            },
          ]
        : undefined,
    },
  );
}
