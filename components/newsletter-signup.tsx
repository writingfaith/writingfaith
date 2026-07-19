import { eq } from "drizzle-orm";
import { Suspense } from "react";

import { NewsletterForm } from "@/components/newsletter-form";
import { NewsletterSubscribedNotice } from "@/components/newsletter-subscribed-notice";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema";
import { normalizeEmail } from "@/lib/validate";

/**
 * Newsletter invitation with session-aware personalization.
 *
 * The subscribe form renders in the static shell, outside any Suspense
 * boundary, so it is always present and always hydrated — subscribing can
 * never depend on the dynamic stream. The session lookup (a runtime API)
 * lives in its own Suspense hole and only *adds* a notice for signed-in
 * subscribers, hiding the redundant form as a progressive enhancement.
 */
export function NewsletterSignup({ centered = false }: { centered?: boolean }) {
  return (
    <div>
      <Suspense fallback={null}>
        <PersonalizedNotice centered={centered} />
      </Suspense>
      <NewsletterForm centered={centered} />
    </div>
  );
}

async function PersonalizedNotice({ centered }: { centered: boolean }) {
  const session = await auth().catch(() => null);
  // Subscriptions store normalized (lowercased) addresses; normalize the
  // session email too so casing differences can't hide a subscription.
  const email = normalizeEmail(session?.user?.email);
  if (!email) return null;

  const [subscription] = await db
    .select({ status: newsletterSubscriptions.status })
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.email, email));

  if (subscription?.status !== "subscribed") return null;
  return <NewsletterSubscribedNotice email={email} centered={centered} />;
}
