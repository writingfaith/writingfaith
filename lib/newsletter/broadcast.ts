import { db } from "@/lib/db";
import { essayNotifications } from "@/lib/db/schema";
import { emailFrom, getResend, newsletterNotifyEmail } from "@/lib/email";
import { newEssayBroadcastEmail } from "@/lib/email/templates";
import { absoluteUrl } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";

export interface EssayForNotification {
  slug: string;
  title: string;
  excerpt?: string;
}

/**
 * Sends the "new essay" broadcast to the Resend Audience, at most once per
 * slug. Insert-first-check-after against the unique `slug` column is the
 * whole guard: the webhook (fires on publish) and the cron sweep (catches
 * scheduled essays and any webhook the first path missed) can both call
 * this for the same essay, and whichever insert lands first wins — the
 * loser sees `inserted.length === 0` and skips silently.
 */
export async function notifyNewEssay(essay: EssayForNotification): Promise<void> {
  // RESEND_AUDIENCE_ID keeps its historical name; its value is a Resend
  // Segment id (see lib/newsletter/resend-sync.ts — Resend deprecated
  // Audiences in favor of Segments, and `audienceId` is the old, silently
  // no-op field on an account that's fully migrated).
  const segmentId = process.env.RESEND_AUDIENCE_ID;
  if (!segmentId) return;

  const inserted = await db
    .insert(essayNotifications)
    .values({ slug: essay.slug })
    .onConflictDoNothing()
    .returning();
  if (inserted.length === 0) return;

  try {
    const settings = await getSiteSettings();
    const { subject, html, text } = newEssayBroadcastEmail({
      title: essay.title,
      excerpt: essay.excerpt,
      url: absoluteUrl(`/essays/${essay.slug}`),
      postLabel: settings.postSingular,
    });
    const resend = getResend();
    const { error } = await resend.broadcasts.create({
      segmentId,
      from: emailFrom,
      subject,
      html,
      text,
      send: true,
      ...(newsletterNotifyEmail ? { replyTo: newsletterNotifyEmail } : {}),
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    // The dedup row is already committed, so a send failure here won't
    // retry on the next webhook/cron pass — logged for manual follow-up
    // rather than risking a duplicate broadcast on retry.
    console.error(`[newsletter] Failed to broadcast new essay "${essay.slug}":`, error);
  }
}
