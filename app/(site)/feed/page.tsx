import type { Metadata } from "next";
import Link from "next/link";

import { NewsletterForm } from "@/components/newsletter-form";
import { OliveBranch, Ornament } from "@/components/ornaments";
import { absoluteUrl } from "@/lib/site";
import { getSiteSettings } from "@/lib/site-settings";

export const metadata: Metadata = {
  title: "Follow",
  description:
    "Every new essay, delivered how you like it — by email or through an RSS feed. No account, no algorithm.",
  alternates: { canonical: "/feed" },
};

/**
 * The human face of the feed. Browsers have largely stopped rendering raw
 * RSS, so the footer points here; /feed.xml remains the machine feed.
 */
export default async function FeedPage() {
  const feedUrl = absoluteUrl("/feed.xml");
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="reveal py-16 text-center sm:py-20">
        <p className="eyebrow">Follow</p>
        <h1 className="title mx-auto mt-6 max-w-[22ch]">
          Every essay, delivered <em className="text-accent">quietly</em>.
        </h1>
        <p className="mx-auto mt-6 max-w-[48ch] leading-relaxed text-ink-muted">
          No account, no algorithm, no feed to refresh. Choose how new essays
          reach you — they arrive when something is worth reading, and never
          otherwise.
        </p>
      </section>

      <Ornament className="mx-auto max-w-xs" />

      <section
        aria-labelledby="newsletter-heading"
        className="reveal-late py-14 text-center sm:py-16"
      >
        <OliveBranch className="mx-auto h-11 w-auto text-accent" />
        <h2 id="newsletter-heading" className="eyebrow mt-6">
          By email
        </h2>
        <p className="mx-auto mt-4 max-w-[44ch] leading-relaxed text-ink-muted">
          {settings.newsletterText}
        </p>
        <NewsletterForm centered />
      </section>

      <section aria-labelledby="rss-heading" className="reveal-late pb-16 sm:pb-20">
        <div className="plate mx-auto max-w-2xl px-6 py-10 text-center sm:px-10">
          <h2 id="rss-heading" className="eyebrow">
            By RSS
          </h2>
          <p className="mx-auto mt-4 max-w-prose leading-relaxed text-ink-muted">
            If you use a feed reader — such as Feedly, NetNewsWire, or Reeder
            — add this address and full essays will appear there as they’re
            published:
          </p>
          <p className="mt-6">
            <code className="inline-block max-w-full overflow-x-auto border border-rule bg-paper px-4 py-2 font-mono text-sm text-accent-strong">
              {feedUrl}
            </code>
          </p>
          <p className="mt-5 font-sans text-sm text-ink-faint">
            New to RSS? It’s the oldest, calmest way to follow writers —{" "}
            <Link href="/essays" className="link">
              or simply visit the essays
            </Link>{" "}
            whenever you like.
          </p>
        </div>
      </section>
    </div>
  );
}
