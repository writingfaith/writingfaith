import { eq } from "drizzle-orm";
import Link from "next/link";
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
 * Runtime account state stays inside Suspense for Cache Components. The
 * dynamic branch chooses either the form or the signed-in state, so a
 * subscriber's browser is never sent a redundant form that hydration must
 * hide later.
 */
export function NewsletterSignup({ centered = false }: { centered?: boolean }) {
  return (
    <Suspense fallback={<NewsletterSignupFallback centered={centered} />}>
      <PersonalizedSignup centered={centered} />
    </Suspense>
  );
}

function NewsletterSignupFallback({ centered }: { centered: boolean }) {
  return (
    <div
      className={`${centered ? "mx-auto" : ""} newsletter-placeholder mt-8 max-w-md`}
      aria-hidden="true"
    >
      <span />
    </div>
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
    return <NewsletterSubscribedNotice email={email} centered={centered} />;
  }

  return (
    <div className={`${centered ? "mx-auto" : ""} newsletter-account-note mt-8 max-w-md`}>
      <p className="leading-relaxed text-ink-muted">
        You’re signed in as <span className="font-medium text-ink">{email}</span>.
        Manage essay delivery from your reader account.
      </p>
      <p className="mt-4">
        <Link href="/account" className="btn btn-primary">
          Open your account
        </Link>
      </p>
    </div>
  );
}
