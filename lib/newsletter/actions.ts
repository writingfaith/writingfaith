"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema";
import { emailFrom, getResend } from "@/lib/email";
import { confirmSubscriptionEmail } from "@/lib/email/templates";
import { allowRequest } from "@/lib/rate-limit";
import { absoluteUrl } from "@/lib/site";
import { normalizeEmail } from "@/lib/validate";
import { syncContactToResend } from "./resend-sync";

export interface SubscribeState {
  ok?: boolean;
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
    allowRequest(`subscribe:ip:${ip}`),
    allowRequest(`subscribe:email:${email}`),
  ]);
  if (!ipAllowed || !emailAllowed) {
    return {
      message: "Too many attempts. Please try again in a little while.",
    };
  }

  try {
    const [existing] = await db
      .select()
      .from(newsletterSubscriptions)
      .where(eq(newsletterSubscriptions.email, email));

    if (existing?.status === "subscribed") {
      // Already on the list — say the same thing, send nothing.
      return { ok: true, message: confirmationMessage };
    }

    const token = crypto.randomUUID();
    if (existing) {
      await db
        .update(newsletterSubscriptions)
        .set({ status: "pending", token, requestedAt: new Date() })
        .where(eq(newsletterSubscriptions.id, existing.id));
    } else {
      await db.insert(newsletterSubscriptions).values({ email, token });
    }

    const { subject, html, text } = confirmSubscriptionEmail({
      confirmUrl: absoluteUrl(`/newsletter/confirm?token=${token}`),
      unsubscribeUrl: absoluteUrl(`/newsletter/unsubscribe?token=${token}`),
    });
    const { error } = await getResend().emails.send({
      from: emailFrom,
      to: email,
      subject,
      html,
      text,
    });
    if (error) throw new Error(error.message);

    return { ok: true, message: confirmationMessage };
  } catch (error) {
    console.error("[newsletter] subscribe failed:", error);
    return {
      message: "Something went wrong on our side. Please try again shortly.",
    };
  }
}

const confirmationMessage =
  "Almost there — check your inbox for a confirmation email.";

/**
 * Subscribe the signed-in reader directly (their address is already
 * verified by sign-in, so double opt-in would be redundant).
 */
export async function subscribeCurrentUser(): Promise<void> {
  const session = await auth();
  const email = normalizeEmail(session?.user?.email);
  if (!email || !session?.user) return;

  const now = new Date();
  const [existing] = await db
    .select()
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.email, email));

  const synced = await syncContactToResend(email, false);

  if (existing) {
    await db
      .update(newsletterSubscriptions)
      .set({
        status: "subscribed",
        userId: session.user.id,
        confirmedAt: now,
        unsubscribedAt: null,
        syncedToResend: synced,
      })
      .where(eq(newsletterSubscriptions.id, existing.id));
  } else {
    await db.insert(newsletterSubscriptions).values({
      email,
      userId: session.user.id,
      status: "subscribed",
      confirmedAt: now,
      syncedToResend: synced,
    });
  }
  revalidatePath("/account");
}

/** Unsubscribe the signed-in reader. */
export async function unsubscribeCurrentUser(): Promise<void> {
  const session = await auth();
  const email = normalizeEmail(session?.user?.email);
  if (!email) return;

  const synced = await syncContactToResend(email, true);
  await db
    .update(newsletterSubscriptions)
    .set({
      status: "unsubscribed",
      unsubscribedAt: new Date(),
      syncedToResend: synced,
    })
    .where(eq(newsletterSubscriptions.email, email));
  revalidatePath("/account");
}
