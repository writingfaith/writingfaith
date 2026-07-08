import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/auth/actions";
import { db } from "@/lib/db";
import { newsletterSubscriptions } from "@/lib/db/schema";
import {
  subscribeCurrentUser,
  unsubscribeCurrentUser,
} from "@/lib/newsletter/actions";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Your account",
  robots: { index: false },
};

/**
 * The page shell is static; everything session-dependent streams inside
 * Suspense (the reading experience never depends on auth — ADR 0001 §Risks).
 */
export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="py-16 sm:py-20">
        <h1 className="eyebrow">
          Your account
        </h1>
        <Suspense
          fallback={
            <p className="mt-8 font-sans text-sm text-ink-faint">Loading…</p>
          }
        >
          <AccountContent />
        </Suspense>
      </section>
    </div>
  );
}

async function AccountContent() {
  const session = await auth();
  if (!session?.user?.email) redirect("/signin");

  const [subscription] = await db
    .select()
    .from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.email, session.user.email.toLowerCase()));

  const isSubscribed = subscription?.status === "subscribed";

  return (
    <div className="mt-8 max-w-xl">
      <dl className="space-y-6 border-b border-rule pb-10">
        <div>
          <dt className="font-sans text-sm text-ink-faint">Signed in as</dt>
          <dd className="mt-1 font-serif text-xl">{session.user.email}</dd>
        </div>
        {session.user.name && (
          <div>
            <dt className="font-sans text-sm text-ink-faint">Name</dt>
            <dd className="mt-1 font-serif text-xl">{session.user.name}</dd>
          </div>
        )}
      </dl>

      <div className="mt-10 border-b border-rule pb-10">
        <h2 className="font-serif text-2xl tracking-tight">Newsletter</h2>
        {isSubscribed ? (
          <>
            <p className="mt-3 text-ink-muted">
              You’re subscribed
              {subscription?.confirmedAt
                ? ` (since ${formatDate(subscription.confirmedAt.toISOString())})`
                : ""}
              . New essays arrive in your inbox as they’re published.
            </p>
            <form action={unsubscribeCurrentUser} className="mt-5">
              <button
                type="submit"
                className="btn"
              >
                Unsubscribe
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="mt-3 text-ink-muted">
              You’re not currently subscribed. Since your email address is
              already verified, subscribing takes one click.
            </p>
            <form action={subscribeCurrentUser} className="mt-5">
              <button
                type="submit"
                className="btn btn-primary"
              >
                Subscribe to new essays
              </button>
            </form>
          </>
        )}
      </div>

      <form action={signOutAction} className="mt-10">
        <button
          type="submit"
          className="font-sans text-sm text-accent-strong underline underline-offset-4 transition-colors hover:text-ink"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
