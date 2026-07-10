/** Pragmatic email shape check; deliverability is proven by the emails themselves. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  if (email.length === 0 || email.length > 254 || !EMAIL_RE.test(email)) {
    return null;
  }
  return email;
}

export function normalizeSearchQuery(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[*?\[\]{}()"'`]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}

/** Sanity slug shape: lowercase words separated by single hyphens. */
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(value: unknown): value is string {
  return (
    typeof value === "string" && value.length <= 96 && SLUG_RE.test(value)
  );
}

/** A quote pulled from an essay for a shareable card — trimmed, collapsed, length-capped. */
export function normalizeQuote(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const normalized = raw
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  // Slice by Unicode code points so an astral character can never be cut in
  // half and handed to the image renderer as invalid text.
  const quote = Array.from(normalized).slice(0, 360).join("");
  return quote.length >= 4 ? quote : null;
}
