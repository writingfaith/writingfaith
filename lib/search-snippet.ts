export interface SnippetSegment {
  text: string;
  matched: boolean;
}

const SNIPPET_RADIUS = 90;

/** Splits text into safe React-renderable matched and unmatched runs. */
export function highlightText(
  text: string,
  queryWords: string[],
): SnippetSegment[] {
  const words = [...new Set(queryWords.map((word) => word.toLowerCase()).filter(Boolean))];
  if (!text || words.length === 0) return text ? [{ text, matched: false }] : [];

  const lower = text.toLowerCase();
  const boundaries = new Set<number>([0, text.length]);
  for (const word of words) {
    let from = 0;
    while (from <= lower.length - word.length) {
      const at = lower.indexOf(word, from);
      if (at === -1) break;
      boundaries.add(at);
      boundaries.add(at + word.length);
      from = at + Math.max(1, word.length);
    }
  }

  const points = [...boundaries].sort((a, b) => a - b);
  const segments: SnippetSegment[] = [];
  for (let index = 0; index < points.length - 1; index++) {
    const from = points[index];
    const to = points[index + 1];
    const segment = text.slice(from, to);
    if (!segment) continue;
    const segmentStart = from;
    const matched = words.some((word) => {
      const matchAt = lower.lastIndexOf(word, segmentStart);
      return matchAt !== -1 && matchAt <= segmentStart && matchAt + word.length >= to;
    });
    segments.push({ text: segment, matched });
  }
  return segments;
}

/**
 * A short window of an essay's body text around the reader's search term,
 * split into matched/unmatched segments for safe React rendering (no HTML
 * injection). Returns null when none of the query words appear in the body
 * — a title/excerpt-only match, which needs no snippet.
 */
export function buildSnippet(
  bodyText: string,
  queryWords: string[],
): SnippetSegment[] | null {
  const words = [...new Set(queryWords.map((word) => word.toLowerCase()).filter(Boolean))];
  if (words.length === 0 || !bodyText) return null;

  const haystack = bodyText.toLowerCase();
  let firstIndex = -1;
  for (const word of words) {
    const index = haystack.indexOf(word);
    if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
      firstIndex = index;
    }
  }
  if (firstIndex === -1) return null;

  let start = Math.max(0, firstIndex - SNIPPET_RADIUS);
  let end = Math.min(bodyText.length, firstIndex + SNIPPET_RADIUS);
  // Trim to word boundaries so the snippet doesn't open or close mid-word.
  const spaceBefore = bodyText.lastIndexOf(" ", start);
  if (spaceBefore > start - 20 && spaceBefore !== -1) start = spaceBefore + 1;
  const spaceAfter = bodyText.indexOf(" ", end);
  if (spaceAfter !== -1 && spaceAfter < end + 20) end = spaceAfter;

  const window = bodyText.slice(start, end);
  const segments = highlightText(window, words);

  if (start > 0) segments.unshift({ text: "…", matched: false });
  if (end < bodyText.length) segments.push({ text: "…", matched: false });

  return segments;
}
