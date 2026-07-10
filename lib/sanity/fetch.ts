import { cacheLife, cacheTag } from "next/cache";
import { draftMode } from "next/headers";

import { client, getDraftClient } from "./client";

type Params = Record<string, unknown>;

/**
 * A bounded profile for reads whose visibility depends on the passage of
 * time (scheduled essays becoming public), not just on publish events.
 * `expire` stays well above 5 minutes so these reads remain prerenderable
 * static content rather than becoming per-request dynamic holes (Next 16
 * Cache Components: short `revalidate`/`expire` under 5 min forces that).
 */
export const scheduledCacheProfile = {
  stale: 60,
  revalidate: 300,
  expire: 3600,
};

/**
 * Published content, cached with Cache Components. `cacheLife("max")` by
 * default because content only changes on publish, and the Sanity webhook
 * expires the tags immediately (`app/api/revalidate`) — so entries live
 * until invalidated. `timed` swaps in the bounded profile above for reads
 * that must also notice a scheduled essay's publish time arriving with no
 * further webhook event to prompt them.
 */
async function fetchPublished<T>(
  query: string,
  params: Params,
  tags: string[],
  timed: boolean,
): Promise<T> {
  "use cache";
  cacheTag(...tags);
  // Keep these as separate calls. Next 16's overloads intentionally reject
  // a union of a named profile and an inline profile.
  if (timed) {
    cacheLife(scheduledCacheProfile);
  } else {
    cacheLife("max");
  }
  return client.fetch<T>(query, params);
}

/**
 * The single entry point for reading content.
 *
 * - Normally: served from the cache, tagged for webhook invalidation.
 * - In Draft Mode (presentation tool preview): fetched fresh per request with
 *   the draft perspective. Next.js bypasses `use cache` automatically while
 *   Draft Mode is on, so no special-casing is needed beyond the client swap.
 *
 * Every query gets `$preview: isEnabled` merged in automatically — queries
 * that reference `$preview` (to show scheduled essays only in Draft Mode)
 * pick it up; queries that don't simply ignore the unused param.
 *
 * `timed` requests the bounded cache profile for reads whose result should
 * change as soon as a scheduled essay's publish time arrives, not only when
 * the next webhook fires.
 */
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  timed = false,
}: {
  query: string;
  params?: Params;
  tags: string[];
  timed?: boolean;
}): Promise<T> {
  const { isEnabled } = await draftMode();
  const fullParams = { preview: isEnabled, ...params };
  if (isEnabled) {
    return getDraftClient().fetch<T>(query, fullParams);
  }
  return fetchPublished<T>(query, fullParams, tags, timed);
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
  timed = false,
}: {
  query: string;
  params?: Params;
  tags: string[];
  timed?: boolean;
}): Promise<T> {
  return fetchPublished<T>(query, params, tags, timed);
}

/** Cache tags, kept in one place so the webhook and queries can't drift. */
export const contentTags = {
  article: (slug?: string) => (slug ? [`article`, `article:${slug}`] : ["article"]),
  page: (slug?: string) => (slug ? [`page`, `page:${slug}`] : ["page"]),
  category: () => ["article", "category"],
  settings: () => ["siteSettings"],
};
