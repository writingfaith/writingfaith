/**
 * Canonical site identity, shared by metadata, JSON-LD, the sitemap, robots
 * and the RSS feed so they can never disagree.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

export const siteName = "WritingFaith";

export const siteTitle = "WritingFaith — Essays on faith by Veruschka Pestano";

export const siteDescription =
  "Thoughtful long-form essays on Christian faith, hope, and everyday life, written by Veruschka Pestano.";

export const authorName = "Veruschka Pestano";

/** Absolute URL for a site path. */
export function absoluteUrl(path: string): string {
  return `${siteUrl}${path}`;
}
