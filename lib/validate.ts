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
