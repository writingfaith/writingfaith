import type { PortableTextBlock } from "@portabletext/react";

/**
 * The leading book name from a free-text reference ("John 15:1–8" → "john",
 * "1 Corinthians 13" → "1 corinthians"). References are author-typed prose,
 * not a structured field, so this is a best-effort heuristic used only to
 * find kinship between essays — never rendered or trusted as canonical.
 */
export function extractBookName(reference: string): string | null {
  const match = reference
    .trim()
    .match(/^([1-3]?\s?[A-Za-z][A-Za-z\s]*?)\s*\d/);
  const book = match?.[1]?.trim().toLowerCase().replace(/\s+/g, " ");
  return book && book.length > 0 ? book : null;
}

/** Every distinct scripture book quoted in an essay's body. */
export function extractScriptureBooks(body: PortableTextBlock[]): string[] {
  const books = new Set<string>();
  for (const block of body) {
    if (block._type !== "scripture") continue;
    const reference = (block as { reference?: string }).reference;
    if (!reference) continue;
    const book = extractBookName(reference);
    if (book) books.add(book);
  }
  return [...books];
}
