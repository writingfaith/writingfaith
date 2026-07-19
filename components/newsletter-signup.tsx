import { eq } from "drizzle-orm";
import { Suspense } from "react";

import { NewsletterForm } from "@/components/newsletter-form";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema";
import { normalizeEmail } from "@/lib/validate";

/**
 * Session-aware newsletter invitation. Reading the session is a runtime API,
 * so the personalized state lives inside a Suspense boundary (Cache
 * Components pattern): the static shell — including the plain form, the
 * right UI for the anonymous majority — prerenders, and signed-in readers
 * see it resolve to their own state.
 *
 * - Signed in + subscribed: no form; shows which address is receiving essays.
 * - Signed in + not subscribed: form prefilled with the account email.
 * - Signed out: the plain form.
 */
export function NewsletterSignup({ centered = false }: { centered?: boolean }) {
  return (
    <Suspense fallback={<NewsletterForm centered={centered} />}>
      <PersonalizedSignup centered={centered} />
    </Suspense>
  );
}

async function PersonalizedSignup({ centered }: { centered: boolean }) {
  const session = await auth().catch(() => null);
  // Subscriptions store normalized (lowercased) addresses; normalize the
  // session email too so casing differences can't hide a subscription.
  const email = normalizeEmail(session?.user?.email);
  if (!email) return <NewsletterForm centered={centered} />;

  const [subscription] = await db
    .select({ status: newsletterSubscriptions.status })
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.email, email));

  if (subscription?.status === "subscribed") {
    return (
      <div className={`${centered ? "mx-auto" : ""} mt-8 max-w-md`}>
        <p className="leading-relaxed text-ink-muted">
          You’re already subscribed as{" "}
          <span className="font-medium text-accent-strong">{email}</span> — new
          essays will arrive in that inbox.
        </p>
        <p className="form-help mt-2.5">
          Every email includes a one-click unsubscribe link.
        </p>
      </div>
    );
  }

  return <NewsletterForm centered={centered} defaultEmail={email} />;
}
