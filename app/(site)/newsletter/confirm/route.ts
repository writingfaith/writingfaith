import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";

import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema";
import { syncContactToResend } from "@/lib/newsletter/resend-sync";

/** Double opt-in confirmation link target. */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) redirect("/newsletter/invalid");

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
  }

  redirect("/newsletter/confirmed");
}
