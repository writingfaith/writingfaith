import Link from "next/link";

import { EssayList, FeaturedEssay } from "@/components/essay-list";
import { JsonLd } from "@/components/json-ld";
import { NewsletterForm } from "@/components/newsletter-form";
import { AuthorMark, OliveBranch, Ornament } from "@/components/ornaments";
import { contentTags, sanityFetch } from "@/lib/sanity/fetch";
import { latestArticlesQuery } from "@/lib/sanity/queries";
import type { ArticlePreview } from "@/lib/sanity/types";
import {
  absoluteUrl,
  authorName,
  siteDescription,
  siteName,
  siteUrl,
} from "@/lib/site";

export default async function HomePage() {
  const latest = await sanityFetch<ArticlePreview[]>({
    query: latestArticlesQuery,
    tags: contentTags.article(),
  });
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
              name: siteName,
              description: siteDescription,
              url: siteUrl,
            },
            {
              "@type": "Person",
              "@id": `${siteUrl}/#author`,
              name: authorName,
              url: siteUrl,
              mainEntityOfPage: absoluteUrl("/"),
            },
          ],
        }}
      />

      {/* Hero — centered, lit faintly from above. */}
      <section className="hero-wash">
        <div className="mx-auto max-w-3xl px-6 pb-20 pt-24 text-center sm:pb-28 sm:pt-32">
          <p className="reveal-1 eyebrow">Essays on faith</p>
          <h1 className="reveal-2 display mx-auto mt-7 max-w-[18ch]">
            Quiet reflections on following{" "}
            <em className="text-accent">Christ</em> in an unquiet world.
          </h1>
          <p className="reveal-3 mx-auto mt-8 max-w-[46ch] leading-relaxed text-ink-muted">
            Long-form essays on scripture, doubt, hope, and the ordinary
            places where faith is lived — by Veruschka Pestano. Written
            slowly, for reading slowly.
          </p>
          <div className="reveal-4 mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Link href="/essays" className="btn btn-primary no-underline">
              Begin reading
            </Link>
            <Link href="/about" className="link font-sans text-sm">
              About the writer
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-6">
        {featured && (
          <>
            <Ornament className="reveal-late" />
            <section
              aria-label="Latest essay"
              className="reveal-late py-16 sm:py-20"
            >
              <FeaturedEssay essay={featured} />
            </section>
          </>
        )}
      </div>

      {/* A verse to slow down with. */}
      <section aria-label="Scripture" className="reveal-scroll">
        <figure className="scripture-plate my-4 sm:my-6">
          <blockquote className="mx-auto max-w-2xl text-xl sm:text-2xl">
            Be still, and know that I am God.
          </blockquote>
          <figcaption>Psalm 46:10</figcaption>
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
                Recent essays
              </h2>
              <Link href="/essays" className="link font-sans text-sm">
                All essays
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
            <AuthorMark />
            <div>
              <h2 id="author-heading" className="eyebrow">
                The writer
              </h2>
              <p className="mt-3 max-w-prose leading-relaxed text-ink-muted">
                Veruschka Pestano writes about the life of faith from the
                middle of it — not from above it. These essays are one
                reader’s slow walk through scripture, doubt, and grace,
                offered in the hope that they keep you company on yours.
              </p>
              <p className="mt-4">
                <Link href="/about" className="link font-sans text-sm">
                  Read more about WritingFaith
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
            Essays by email
          </h2>
          <p className="mx-auto mt-4 max-w-[44ch] leading-relaxed text-ink-muted">
            One email when a new essay is published — nothing else, ever.
            We’ll send a confirmation first, and every email has a one-click
            unsubscribe.
          </p>
          <NewsletterForm centered />
        </section>
      </div>
    </div>
  );
}
