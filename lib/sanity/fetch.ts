import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";

import { client, getDraftClient } from "./client";

type Params = Record<string, unknown>;

/**
 * Published content, cached with Cache Components. `cacheLife("max")` because
 * content only changes on publish, and the Sanity webhook expires the tags
 * immediately (`app/api/revalidate`) — so entries live until invalidated.
 */
async function fetchPublished<T>(
  query: string,
  params: Params,
  tags: string[],
): Promise<T> {
  "use cache";
  cacheTag(...tags);
  cacheLife("max");
  return client.fetch<T>(query, params);
}

/**
 * The single entry point for reading content.
 *
 * - Normally: served from the cache, tagged for webhook invalidation.
 * - In Draft Mode (presentation tool preview): fetched fresh per request with
 *   the draft perspective. Next.js bypasses `use cache` automatically while
 *   Draft Mode is on, so no special-casing is needed beyond the client swap.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: Params;
  tags: string[];
}): Promise<T> {
  const { isEnabled } = await draftMode();
  if (isEnabled) {
    return getDraftClient().fetch<T>(query, params);
  }
  return fetchPublished<T>(query, params, tags);
}

/**
 * Published-only variant for places that must stay prerenderable — the root
 * layout's theme attributes. Never consults Draft Mode (request data), so the
 * static shell keeps its build-time render; published edits still invalidate
 * instantly via tags.
 */
export async function sanityFetchPublished<T>({
  query,
  params = {},
  tags,
}: {
  query: string;
  params?: Params;
  tags: string[];
}): Promise<T> {
  return fetchPublished<T>(query, params, tags);
}

/** Cache tags, kept in one place so the webhook and queries can't drift. */
export const contentTags = {
  article: (slug?: string) => (slug ? [`article`, `article:${slug}`] : ["article"]),
  page: (slug?: string) => (slug ? [`page`, `page:${slug}`] : ["page"]),
  category: () => ["article", "category"],
  settings: () => ["siteSettings"],
};
