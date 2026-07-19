import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema";
import { emailFrom, getResend, newsletterNotifyEmail } from "@/lib/email";
import { newSubscriberNotificationEmail } from "@/lib/email/templates";
import { syncContactToResend } from "@/lib/newsletter/resend-sync";
import { isNewsletterToken } from "@/lib/newsletter/tokens";

/** Double opt-in confirmation link target. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!isNewsletterToken(token)) redirect("/newsletter/invalid");

  const [subscription] = await db
    .select()
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.token, token));

  if (!subscription) redirect("/newsletter/invalid");

  if (subscription.status !== "subscribed") {
    const synced = await syncContactToResend(subscription.email, false);
    await db
      .update(newsletterSubscriptions)
      .set({
        status: "subscribed",
        confirmedAt: new Date(),
        unsubscribedAt: null,
        syncedToResend: synced,
      })
      .where(eq(newsletterSubscriptions.id, subscription.id));

    // Best-effort: a failure here must never block the reader's confirmation.
    if (newsletterNotifyEmail) {
      try {
        const { subject, html, text } = newSubscriberNotificationEmail({
          email: subscription.email,
        });
        const { error } = await getResend().emails.send({
          from: emailFrom,
          to: newsletterNotifyEmail,
          subject,
          html,
          text,
        });
        if (error) throw new Error(error.message);
      } catch (error) {
        console.error("[newsletter] Failed to send new-subscriber notification:", error);
      }
    }
  }

  redirect("/newsletter/confirmed");
}
