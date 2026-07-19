import Link from "next/link";

import { EssayList, FeaturedEssay } from "@/components/essay-list";
import { ContinueReading } from "@/components/continue-reading";
import { HeroLight } from "@/components/hero-light";
import { JsonLd } from "@/components/json-ld";
import { NewsletterSignup } from "@/components/newsletter-signup";
import { OliveBranch, Ornament, SiteMark } from "@/components/ornaments";
import { contentTags, sanityFetch } from "@/lib/sanity/fetch";
import { latestArticlesQuery } from "@/lib/sanity/queries";
import type { ArticlePreview } from "@/lib/sanity/types";
import { getSiteSettings } from "@/lib/site-settings";
import { absoluteUrl, siteUrl } from "@/lib/site";

export default async function HomePage() {
  const [latest, settings] = await Promise.all([
    sanityFetch<ArticlePreview[]>({
      query: latestArticlesQuery,
      tags: contentTags.article(),
      timed: true,
    }),
    getSiteSettings(),
  ]);
  const [featured, ...rest] = latest;

  return (
    <div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": `${siteUrl}/#website`,
              name: settings.siteName,
              description: settings.tagline,
              url: siteUrl,
            },
            {
              "@type": "Organization",
              "@id": `${siteUrl}/#publisher`,
              name: settings.siteName,
              url: siteUrl,
              mainEntityOfPage: absoluteUrl("/"),
            },
          ],
        }}
      />

      {/* Hero — centered, lit faintly from above; the light leans toward
          the reader's pointer on desktop. */}
      <section className="hero-wash">
        <HeroLight />
        <div className="mx-auto max-w-3xl px-6 pb-20 pt-24 text-center sm:pb-28 sm:pt-32">
          <p className="reveal-1 eyebrow">{settings.heroEyebrow}</p>
          <h1 className="reveal-2 display mx-auto mt-7 max-w-[18ch]">
            {settings.heroHeading ?? (
              <>
                Quiet reflections on following{" "}
                <em className="text-accent">Christ</em> in an unquiet world.
              </>
            )}
          </h1>
          <p className="reveal-3 mx-auto mt-8 max-w-[46ch] leading-relaxed text-ink-muted">
            {settings.heroIntro}
          </p>
          <div className="reveal-4 mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Link href="/essays" className="btn btn-primary no-underline">
              Begin reading
            </Link>
            <Link
              href="/about"
              className="link inline-flex min-h-11 items-center font-sans text-sm"
            >
              About the writer
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6">
        <ContinueReading />
        {featured && (
          <>
            <Ornament className="reveal-late" />
            <section
              aria-label={`Latest ${settings.postSingular}`}
              className="reveal-late py-16 sm:py-20"
            >
              <FeaturedEssay
                essay={featured}
                eyebrow={`The latest ${settings.postSingular}`}
              />
            </section>
          </>
        )}
      </div>

      {/* What the publication covers. */}
      <div className="mx-auto max-w-4xl px-6">
        <section
          aria-labelledby="topics-heading"
          className="reveal-scroll border-t border-rule py-14 sm:py-16"
        >
          <h2 id="topics-heading" className="eyebrow">
            {settings.topicsHeading}
          </h2>
          <div className="mt-8 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {settings.topics.map((topic) => (
              <div key={topic.title} className="topic-rule">
                <h3 className="font-serif text-xl tracking-tight">
                  {topic.title}
                </h3>
                <p className="mt-3 text-[0.98em] leading-relaxed text-ink-muted">
                  {topic.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* A verse to slow down with. */}
      <section aria-label="Scripture" className="reveal-scroll">
        <figure className="scripture-plate my-4 sm:my-6">
          <blockquote className="mx-auto max-w-2xl text-xl sm:text-2xl">
            {settings.scriptureQuote}
          </blockquote>
          <figcaption>{settings.scriptureReference}</figcaption>
        </figure>
      </section>

      <div className="mx-auto max-w-4xl px-6">
        {rest.length > 0 && (
          <section
            aria-labelledby="more-essays"
            className="reveal-scroll py-14 sm:py-16"
          >
            <div className="flex items-baseline justify-between gap-6">
              <h2 id="more-essays" className="eyebrow">
                Recent {settings.postPlural}
              </h2>
              <Link
                href="/essays"
                className="link inline-flex min-h-11 items-center font-sans text-sm"
              >
                All {settings.postPlural}
              </Link>
            </div>
            <div className="mt-2 border-t border-rule">
              <EssayList essays={rest} />
            </div>
          </section>
        )}

        {/* The writer. */}
        <section
          aria-labelledby="author-heading"
          className="reveal-scroll border-t border-rule py-14 sm:py-16"
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <SiteMark />
            <div>
              <h2 id="author-heading" className="eyebrow">
                The writer
              </h2>
              <p className="mt-3 max-w-prose leading-relaxed text-ink-muted">
                {settings.writerBio}
              </p>
              <p className="mt-4">
                <Link
                  href="/about"
                  className="link inline-flex min-h-11 items-center font-sans text-sm"
                >
                  Read more about {settings.siteName}
                </Link>
              </p>
            </div>
          </div>
        </section>

        {/* Newsletter invitation. */}
        <section
          aria-labelledby="newsletter-heading"
          className="reveal-scroll border-t border-rule py-16 text-center sm:py-20"
        >
          <OliveBranch className="mx-auto h-11 w-auto text-accent" />
          <h2 id="newsletter-heading" className="eyebrow mt-6">
            {settings.newsletterHeading}
          </h2>
          <p className="mx-auto mt-4 max-w-[44ch] leading-relaxed text-ink-muted">
            {settings.newsletterText}
          </p>
          <NewsletterSignup centered />
        </section>
      </div>
    </div>
  );
}
