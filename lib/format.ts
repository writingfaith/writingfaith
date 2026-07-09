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

export function readingTimeMinutes(blocks: PortableTextBlock[]): number {
  const words = blocks
    .filter((block) => block._type === "block" && Array.isArray(block.children))
    .flatMap((block) => block.children as Array<{ text?: string }>)
    .map((child) => child.text ?? "")
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
