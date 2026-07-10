const STORAGE_KEY = "wf-reading-progress";
const CHANGE_EVENT = "wf-reading-progress-change";
const MAX_ENTRIES = 8;
/** Below this, the reader has barely started; above it, treat as finished. */
const MIN_PERCENT = 6;
const DONE_PERCENT = 92;

export interface ReadingEntry {
  slug: string;
  title: string;
  percent: number;
  updatedAt: number;
}

function read(): ReadingEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is ReadingEntry => {
      if (!entry || typeof entry !== "object") return false;
      const candidate = entry as Partial<ReadingEntry>;
      return (
        typeof candidate.slug === "string" &&
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(candidate.slug) &&
        typeof candidate.title === "string" &&
        candidate.title.length > 0 &&
        candidate.title.length <= 240 &&
        typeof candidate.percent === "number" &&
        Number.isFinite(candidate.percent) &&
        typeof candidate.updatedAt === "number" &&
        Number.isFinite(candidate.updatedAt)
      );
    });
  } catch {
    return [];
  }
}

function write(entries: ReadingEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(entries.slice(0, MAX_ENTRIES)),
    );
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage unavailable (private browsing, quota) — a nicety, not a requirement.
  }
}

/** Records (or clears, once finished) how far a reader has gotten into an essay. */
export function recordProgress(
  slug: string,
  title: string,
  percent: number,
): void {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  // A brief visit to the top of an essay must not erase a useful bookmark.
  if (clamped < MIN_PERCENT) return;
  const entries = read().filter((entry) => entry.slug !== slug);
  if (clamped >= MIN_PERCENT && clamped < DONE_PERCENT) {
    entries.unshift({ slug, title, percent: clamped, updatedAt: Date.now() });
  }
  write(entries);
}

export function clearProgress(slug: string): void {
  write(read().filter((entry) => entry.slug !== slug));
}

/** The most recently touched in-progress essay, for the "continue reading" prompt. */
export function latestProgress(excludeSlug?: string): ReadingEntry | null {
  const entries = read()
    .filter((entry) => entry.slug !== excludeSlug)
    .sort((a, b) => b.updatedAt - a.updatedAt);
  return entries[0] ?? null;
}

/** Stable primitive snapshot for React's external-store subscription. */
export function readingProgressSnapshot(excludeSlug?: string): string | null {
  const entry = latestProgress(excludeSlug);
  return entry ? JSON.stringify(entry) : null;
}

export function subscribeToReadingProgress(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}
