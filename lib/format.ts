import type { PortableTextBlock } from "@portabletext/react";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** Adult long-form reading pace; a deliberate, unhurried estimate. */
const WORDS_PER_MINUTE = 225;

function textFromValue(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(textFromValue);
  if (!value || typeof value !== "object") return [];

  const record = value as Record<string, unknown>;
  // Count only reader-visible prose. Metadata such as alt text, captions,
  // references and URLs should not inflate the estimate.
  return ["children", "text", "passage"].flatMap((key) =>
    textFromValue(record[key]),
  );
}

export function readingWordCount(blocks: PortableTextBlock[]): number {
  return blocks
    .flatMap(textFromValue)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
}

export function readingTimeMinutes(blocks: PortableTextBlock[]): number {
  const words = readingWordCount(blocks);

  // Images slow reading in a useful, measurable way. Follow a diminishing
  // allowance (12s for the first image down to a 3s floor) rather than
  // pretending visual pauses take no time.
  const images = blocks.filter((block) => block._type === "image").length;
  const imageSeconds = Array.from(
    { length: images },
    (_, index) => Math.max(3, 12 - index),
  ).reduce((total, seconds) => total + seconds, 0);

  return Math.max(1, Math.ceil(words / WORDS_PER_MINUTE + imageSeconds / 60));
}
