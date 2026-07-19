import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema";
import { syncContactToResend } from "@/lib/newsletter/resend-sync";

/**
 * One-off: syncContactToResend previously used the deprecated Resend
 * Audiences `audienceId` field against an account already migrated to
 * Segments, so every confirmed subscriber's sync silently no-opped —
 * Postgres shows them subscribed, but Resend's segment never received
 * them. Re-runs the (now-fixed) sync for every currently-subscribed row.
 * Remove this route once it's been run once in production.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscribers = await db
    .select({ email: newsletterSubscriptions.email })
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.status, "subscribed"));

  const results = await Promise.all(
    subscribers.map(async (s) => ({
      email: s.email,
      synced: await syncContactToResend(s.email, false),
    })),
  );

  return Response.json({
    total: results.length,
    synced: results.filter((r) => r.synced).length,
    failed: results.filter((r) => !r.synced).map((r) => r.email),
  });
}
