import type { NextRequest } from "next/server";

import { notifyNewEssay } from "@/lib/newsletter/broadcast";
import { client } from "@/lib/sanity/client";
import { recentlyPublishedArticlesQuery } from "@/lib/sanity/queries";

/**
 * Eight daily opportunities to recover from a transient Resend or webhook
 * failure.
 */
const WINDOW_MS = 8 * 24 * 60 * 60 * 1000;

/**
 * Scheduled-essay safety net. The publish webhook fires when an author
 * clicks Publish in Studio, not when a future `publishedAt` actually
 * arrives — an essay scheduled for tomorrow gets no webhook event at all
 * when tomorrow comes. This sweep re-checks what's visible now and catches
 * those (plus any webhook call that failed outright). The dedup table in
 * lib/newsletter/broadcast.ts keeps it from double-sending for essays the
 * webhook already handled.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const essays = await client.fetch<
    { title: string; excerpt?: string; slug: string }[]
  >(recentlyPublishedArticlesQuery, { since });

  for (const essay of essays) {
    await notifyNewEssay(essay);
  }

  return Response.json({ checked: essays.length });
}
