import type { Metadata } from "next";
import Link from "next/link";

import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "What WritingFaith knows about you (very little), why, and what your choices are.",
  alternates: { canonical: "/privacy" },
};

/* LEGAL REVIEW REQUIRED: this policy is written accurately against the
   site's actual behaviour, but jurisdiction-specific wording (GDPR/UK GDPR
   representative details, controller identity and address, applicable law)
   should be confirmed by a qualified professional before launch. */

export default function PrivacyPage() {
  return (
    <ProsePage eyebrow="Privacy" title="What this site knows about you." updated="8 July 2026">
      <p>
        The short version: as little as possible. WritingFaith is a reading
        site. It sets no advertising or tracking cookies, shows no ads, and
        sells nothing — including your data, which is never shared for
        marketing in any form.
      </p>

      <h2>Reading</h2>
      <p>
        You can read everything here without signing up and without telling us
        anything. We use Vercel’s cookieless, aggregate analytics to
        understand which essays are read — it identifies pages, not people,
        which is why there is no cookie banner: there is nothing to consent
        to.
      </p>

      <h2>If you sign in (site owner)</h2>
      <p>
        Signing in exists only to open the publication editor and is limited
        to the site owner. When used, we store the email address (and, with
        Google sign-in, the name Google provides) plus a session cookie.
        Sign-in cookies are strictly necessary for editing; they are not used
        to track you. We never see or store a password, because there are
        none.
      </p>

      <h2>If you subscribe to the newsletter</h2>
      <p>
        We store your email address and your subscription status, with
        timestamps of when you asked to subscribe and when you confirmed —
        that record is what double opt-in means. Emails are delivered through
        Resend. Every email contains an unsubscribe link that works with one
        click; unsubscribing is immediate and doesn’t require an account.
      </p>

      <h2>Where data lives</h2>
      <p>
        Subscription and sign-in data is stored in our database (Neon), email
        is delivered by Resend, and the site is hosted on Vercel. Essay
        content is managed in Sanity and contains no reader data. Each
        provider processes data on our instructions.
      </p>

      <h2>Your choices</h2>
      <p>
        You can unsubscribe from the newsletter at any time via the link in
        any email — it works with one click and takes effect immediately. If
        you’d like your data deleted entirely, email us via the{" "}
        <Link href="/contact">contact page</Link> and it will be done —
        there is no retention we need beyond your participation.
      </p>

      <h2>Questions</h2>
      <p>
        Anything unclear, or any concern about your data:{" "}
        <Link href="/contact">get in touch</Link>.
      </p>
    </ProsePage>
  );
}
