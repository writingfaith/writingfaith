import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { newsletterSubscriptions, users } from "@/lib/db/schema";
import { emailFrom, getResend, newsletterNotifyEmail } from "@/lib/email";
import { newSubscriberNotificationEmail } from "@/lib/email/templates";
import { syncContactToResend } from "@/lib/newsletter/resend-sync";
import { isNewsletterToken } from "@/lib/newsletter/tokens";

/**
 * Newsletter and reader accounts are one system keyed on the email address
 * (both flows prove ownership by delivery). Confirming a subscription
 * find-or-creates the account row so a later magic-link sign-in attaches to
 * it — the reader never has to "register" twice. Failure is non-fatal: the
 * subscription itself must never be blocked by account bookkeeping.
 */
async function linkOrCreateAccount(email: string): Promise<string | null> {
  try {
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));
    if (existing) return existing.id;
    const [created] = await db
      .insert(users)
      .values({ email })
      .onConflictDoNothing()
      .returning({ id: users.id });
    return created?.id ?? null;
  } catch (error) {
    console.error("[newsletter] Failed to link reader account:", error);
    return null;
  }
}

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
    const [synced, userId] = await Promise.all([
      syncContactToResend(subscription.email, false),
      linkOrCreateAccount(subscription.email),
    ]);
    await db
      .update(newsletterSubscriptions)
      .set({
        status: "subscribed",
        confirmedAt: new Date(),
        unsubscribedAt: null,
        syncedToResend: synced,
        ...(userId ? { userId } : {}),
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
