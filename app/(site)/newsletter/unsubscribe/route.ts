import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema";
import { syncContactToResend } from "@/lib/newsletter/resend-sync";
import { isNewsletterToken } from "@/lib/newsletter/tokens";

/** One-click unsubscribe link target (present in every newsletter email). */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!isNewsletterToken(token)) redirect("/newsletter/invalid");

  const [subscription] = await db
    .select()
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.token, token));

  if (!subscription) redirect("/newsletter/invalid");

  if (subscription.status !== "unsubscribed") {
    const synced = await syncContactToResend(subscription.email, true);
    await db
      .update(newsletterSubscriptions)
      .set({
        status: "unsubscribed",
        unsubscribedAt: new Date(),
        syncedToResend: synced,
      })
      .where(eq(newsletterSubscriptions.id, subscription.id));
  }

  redirect("/newsletter/unsubscribed");
}
