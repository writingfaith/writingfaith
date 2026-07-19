"use server";

import { eq } from "drizzle-orm";
import { refresh } from "next/cache";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { newsletterSubscriptions, users } from "@/lib/db/schema";
import { emailFrom, getResend, newsletterNotifyEmail } from "@/lib/email";
import { confirmSubscriptionEmail } from "@/lib/email/templates";
import {
  subscribeVerifiedReader,
  unsubscribeVerifiedReader,
  type NewsletterStatus,
} from "@/lib/newsletter/account";
import { allowRequest, allowRequestFromIp } from "@/lib/rate-limit";
import { absoluteUrl } from "@/lib/site";
import { normalizeEmail } from "@/lib/validate";

export interface SubscribeState {
  ok?: boolean;
  message?: string;
}

export interface AccountNewsletterState {
  ok?: boolean;
  status?: NewsletterStatus;
  syncedToResend?: boolean;
  message?: string;
}

/**
 * Public subscribe (double opt-in): records a pending subscription and sends
 * a confirmation email. The response is deliberately the same whether or not
 * the address was already subscribed, so the form can't be used to probe
 * the subscriber list.
 */
export async function subscribeToNewsletter(
  _prev: SubscribeState,
  formData: FormData,
): Promise<SubscribeState> {
  // Honeypot: humans never see or fill this field.
  if (typeof formData.get("website") === "string" && formData.get("website")) {
    return { ok: true, message: confirmationMessage };
  }

  const email = normalizeEmail(formData.get("email"));
  if (!email) {
    return { message: "Please enter a valid email address." };
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const [ipAllowed, emailAllowed] = await Promise.all([
    allowRequestFromIp(`subscribe:${ip}`),
    allowRequest(`subscribe:email:${email}`),
  ]);
  if (!ipAllowed || !emailAllowed) {
    return {
      message: "Too many attempts. Please try again in a little while.",
    };
  }

  let storedSubscriptionId: string | null = null;

  try {
    const resend = getResend();
    const [existing] = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email));

    if (existing?.status === "subscribed") {
      // Already on the list — say the same thing, send nothing.
      return { ok: true, message: confirmationMessage };
    }

    // A confirmation email went out moments ago: a double-click or an
    // impatient resubmit must not stack a second copy in the inbox. The
    // token is left untouched so the email already sent keeps working.
    if (
      existing?.status === "pending" &&
      Date.now() - existing.requestedAt.getTime() < CONFIRMATION_COOLDOWN_MS
    ) {
      return { ok: true, message: confirmationMessage };
    }

    // If a reader account already exists for this address, link it — both
    // flows prove email ownership by delivery, so the address is the join key.
    const [account] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email));

    const token = crypto.randomUUID();
    if (existing) {
      storedSubscriptionId = existing.id;
      await db
        .update(newsletterSubscriptions)
        .set({
          status: "pending",
          token,
          requestedAt: new Date(),
          ...(account ? { userId: account.id } : {}),
        })
        .where(eq(newsletterSubscriptions.id, existing.id));
    } else {
      const [created] = await db
        .insert(newsletterSubscriptions)
        .values({
          email,
          token,
          ...(account ? { userId: account.id } : {}),
        })
        .returning({ id: newsletterSubscriptions.id });
      storedSubscriptionId = created?.id ?? null;
    }

    const { subject, html, text } = confirmSubscriptionEmail({
      confirmUrl: absoluteUrl(`/newsletter/confirm?token=${token}`),
      unsubscribeUrl: absoluteUrl(`/newsletter/unsubscribe?token=${token}`),
    });
    const { error } = await resend.emails.send({
      from: emailFrom,
      to: email,
      subject,
      html,
      text,
      ...(newsletterNotifyEmail ? { replyTo: newsletterNotifyEmail } : {}),
    });
    if (error) throw new Error(error.message);

    return { ok: true, message: confirmationMessage };
  } catch (error) {
    // A failed delivery must not trigger the 15-minute cooldown. Keep the
    // pending row/token, but make the next attempt immediately eligible.
    if (storedSubscriptionId) {
      await db
        .update(newsletterSubscriptions)
        .set({ requestedAt: new Date(0) })
        .where(eq(newsletterSubscriptions.id, storedSubscriptionId))
        .catch((resetError) => {
          console.error(
            "[newsletter] failed to reset confirmation cooldown:",
            resetError,
          );
        });
    }
    console.error("[newsletter] subscribe failed:", error);
    return {
      message: "Something went wrong on our side. Please try again shortly.",
    };
  }
}

const confirmationMessage =
  "Almost there — check your inbox for a confirmation email.";

/** Window during which repeat subscribe attempts reuse the email already sent. */
const CONFIRMATION_COOLDOWN_MS = 15 * 60 * 1000;

/**
 * Authenticated account management. The email and user id always come from
 * the database-backed session, never from form input, so this public Server
 * Action cannot be used to alter another subscriber.
 */
export async function manageAccountNewsletter(
  _prev: AccountNewsletterState,
  formData: FormData,
): Promise<AccountNewsletterState> {
  const session = await auth();
  const email = normalizeEmail(session?.user?.email);
  const userId = session?.user?.id;
  if (!email || !userId) {
    return { message: "Your session has expired. Please sign in again." };
  }

  const intent = formData.get("intent");
  if (intent !== "subscribe" && intent !== "unsubscribe") {
    return { message: "That account action is not available." };
  }

  try {
    const state =
      intent === "subscribe"
        ? await subscribeVerifiedReader({ userId, email })
        : await unsubscribeVerifiedReader({ userId, email });
    refresh();
    return {
      ok: true,
      status: state.status ?? undefined,
      syncedToResend: state.syncedToResend,
      message:
        intent === "subscribe"
          ? state.syncedToResend
            ? "You’re subscribed. New essays will arrive in this inbox."
            : "You’re subscribed here, but delivery still needs to synchronize. Please retry."
          : "You’re unsubscribed. You can rejoin here whenever you like.",
    };
  } catch (error) {
    console.error("[newsletter] account update failed:", error);
    return { message: "We couldn’t update your subscription. Please try again." };
  }
}
