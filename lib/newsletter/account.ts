import "server-only";

import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema";
import { normalizeEmail } from "@/lib/validate";
import { syncContactToResend } from "@/lib/newsletter/resend-sync";

export type NewsletterStatus = "pending" | "subscribed" | "unsubscribed";

export interface NewsletterAccountState {
  status: NewsletterStatus | null;
  syncedToResend: boolean;
}

/**
 * Reads newsletter state for a verified account email. This is deliberately
 * server-only: account and subscription records never cross a client boundary.
 */
export async function getNewsletterAccountState(
  emailValue: unknown,
): Promise<NewsletterAccountState> {
  const email = normalizeEmail(emailValue);
  if (!email) return { status: null, syncedToResend: false };

  const [subscription] = await db
    .select({
      status: newsletterSubscriptions.status,
      syncedToResend: newsletterSubscriptions.syncedToResend,
    })
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.email, email))
    .limit(1);

  return subscription ?? { status: null, syncedToResend: false };
}

/**
 * Makes a verified reader account an active newsletter subscription. Sign-in
 * is the consent event, so no second confirmation email is required. Existing
 * active subscribers keep their original consent timestamps.
 */
export async function subscribeVerifiedReader({
  userId,
  email: emailValue,
}: {
  userId: string;
  email: unknown;
}): Promise<NewsletterAccountState> {
  const email = normalizeEmail(emailValue);
  if (!email) throw new Error("A verified email address is required.");

  const [existing] = await db
    .select({
      id: newsletterSubscriptions.id,
      status: newsletterSubscriptions.status,
      syncedToResend: newsletterSubscriptions.syncedToResend,
    })
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.email, email))
    .limit(1);

  if (existing?.status === "subscribed") {
    await db
      .update(newsletterSubscriptions)
      .set({ userId })
      .where(eq(newsletterSubscriptions.id, existing.id));

    if (existing.syncedToResend) {
      return { status: "subscribed", syncedToResend: true };
    }
  } else {
    const now = new Date();
    await db
      .insert(newsletterSubscriptions)
      .values({
        email,
        userId,
        status: "subscribed",
        requestedAt: now,
        confirmedAt: now,
      })
      .onConflictDoUpdate({
        target: newsletterSubscriptions.email,
        set: {
          userId,
          status: "subscribed",
          requestedAt: now,
          confirmedAt: now,
          unsubscribedAt: null,
          syncedToResend: false,
        },
      });
  }

  const syncedToResend = await syncContactToResend(email, false);
  await db
    .update(newsletterSubscriptions)
    .set({ syncedToResend })
    .where(eq(newsletterSubscriptions.email, email));

  return { status: "subscribed", syncedToResend };
}

/** Unsubscribes only the currently authenticated reader's verified address. */
export async function unsubscribeVerifiedReader({
  userId,
  email: emailValue,
}: {
  userId: string;
  email: unknown;
}): Promise<NewsletterAccountState> {
  const email = normalizeEmail(emailValue);
  if (!email) throw new Error("A verified email address is required.");

  const now = new Date();
  await db
    .insert(newsletterSubscriptions)
    .values({
      email,
      userId,
      status: "unsubscribed",
      requestedAt: now,
      unsubscribedAt: now,
    })
    .onConflictDoUpdate({
      target: newsletterSubscriptions.email,
      set: {
        userId,
        status: "unsubscribed",
        unsubscribedAt: now,
        syncedToResend: false,
      },
    });

  const syncedToResend = await syncContactToResend(email, true);
  await db
    .update(newsletterSubscriptions)
    .set({ syncedToResend })
    .where(eq(newsletterSubscriptions.email, email));

  return { status: "unsubscribed", syncedToResend };
}
