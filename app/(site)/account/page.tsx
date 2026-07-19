import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { AccountNewsletterControl } from "@/components/account-newsletter-control";
import { auth } from "@/lib/auth";
import { signOutAction } from "@/lib/auth/actions";
import { getNewsletterAccountState } from "@/lib/newsletter/account";
import { normalizeEmail } from "@/lib/validate";

export const metadata: Metadata = {
  title: "Your account",
  description: "Manage your WritingFaith reader account and essay emails.",
  robots: { index: false },
};

function AccountFallback() {
  return (
    <div className="mx-auto max-w-4xl px-6" aria-hidden="true">
      <section className="account-shell py-16 sm:py-20">
        <div className="account-loading" />
      </section>
    </div>
  );
}

async function AccountContent() {
  const session = await auth();
  const email = normalizeEmail(session?.user?.email);
  const userId = session?.user?.id;
  if (!email || !userId) redirect("/signin?redirectTo=/account");

  const newsletter = await getNewsletterAccountState(email);
  const subscribed = newsletter.status === "subscribed";

  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="account-shell py-16 sm:py-20">
        <div className="account-intro">
          <p className="eyebrow">Reader account</p>
          <h1 className="title mt-6 max-w-[22ch]">
            Your place at <em className="text-accent">WritingFaith</em>.
          </h1>
          <p className="mt-6 max-w-[52ch] leading-relaxed text-ink-muted">
            One address for signing in and receiving new essays. No password,
            no separate newsletter profile.
          </p>
        </div>

        <dl className="account-ledger">
          <div>
            <dt>Email</dt>
            <dd className="break-all">{email}</dd>
          </div>
          <div>
            <dt>New essay emails</dt>
            <dd>
              <span
                className={`account-status ${subscribed ? "account-status--active" : ""}`}
              >
                {subscribed ? "Subscribed" : "Not subscribed"}
              </span>
              {subscribed && !newsletter.syncedToResend && (
                <span className="ml-2 text-ink-faint">Sync needed</span>
              )}
            </dd>
          </div>
        </dl>

        <div className="account-subscription">
          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-[0.12em] text-ink">
              Essay delivery
            </p>
            <p className="mt-3 max-w-[52ch] leading-relaxed text-ink-muted">
              {subscribed
                ? "You’ll receive one quiet note when a new essay is published."
                : "Join again whenever you wish. Every message includes a one-click unsubscribe link."}
            </p>
          </div>
          <AccountNewsletterControl
            initialStatus={newsletter.status}
            initialSyncedToResend={newsletter.syncedToResend}
          />
        </div>

        <form action={signOutAction} className="mt-10 border-t border-rule pt-8">
          <button type="submit" className="btn">
            Sign out of this account
          </button>
        </form>
      </section>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<AccountFallback />}>
      <AccountContent />
    </Suspense>
  );
}
