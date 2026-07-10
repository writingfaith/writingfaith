import { cacheLife, cacheTag } from "next/cache";

import { buildFeed } from "@/lib/feed";
import { client } from "@/lib/sanity/client";
import { scheduledCacheProfile } from "@/lib/sanity/fetch";
import { feedQuery } from "@/lib/sanity/queries";
import type { Article } from "@/lib/sanity/types";

/**
 * Full-content RSS feed (ADR 0001 §6). Built from the same Portable Text as
 * the site, cached like every other content read and invalidated by the
 * publish webhook. `use cache` lives in a helper per the route-handler docs.
 */
async function getFeed(): Promise<string> {
  "use cache";
  cacheTag("article");
  cacheLife(scheduledCacheProfile);
  const articles = await client.fetch<Article[]>(feedQuery);
  return buildFeed(articles);
}

export async function GET() {
  return new Response(await getFeed(), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
