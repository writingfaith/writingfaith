import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EssayList } from "@/components/essay-list";
import { EssayToc } from "@/components/essay-toc";
import { JsonLd } from "@/components/json-ld";
import { Ornament } from "@/components/ornaments";
import { EssayBody } from "@/components/portable-text";
import { QuoteSelector } from "@/components/quote-selector";
import { ReadingProgressTracker } from "@/components/reading-progress-tracker";
import { SanityImage } from "@/components/sanity-image";
import {
  formatDate,
  readingTimeMinutes,
  readingWordCount,
} from "@/lib/format";
import { extractHeadings } from "@/lib/headings";
import { pickRelated } from "@/lib/related";
import { client } from "@/lib/sanity/client";
import { contentTags, sanityFetch } from "@/lib/sanity/fetch";
import { imageDimensions, imageUrl } from "@/lib/sanity/image";
import {
  articleBySlugQuery,
  articleSlugsQuery,
  relatedCandidatesQuery,
} from "@/lib/sanity/queries";
import type { Article, RelatedCandidateDoc } from "@/lib/sanity/types";
import { extractScriptureBooks } from "@/lib/scripture";
import { getSiteSettings } from "@/lib/site-settings";
import { absoluteUrl, siteName } from "@/lib/site";

const RELATED_COUNT = 2;

/**
 * Prerender every published essay at build time; essays published after the
 * build render on first request and are then cached (Next 16 Cache
 * Components + generateStaticParams).
 */
export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(articleSlugsQuery);
  if (slugs.length === 0) {
    // Cache Components requires at least one param for build-time validation.
    // Until the first essay is published, use the docs-sanctioned placeholder;
    // the page resolves it to notFound().
    return [{ slug: "__placeholder__" }];
  }
  return slugs.map((slug) => ({ slug }));
}

async function getArticle(slug: string) {
  return sanityFetch<Article | null>({
    query: articleBySlugQuery,
    params: { slug },
    tags: contentTags.article(slug),
    timed: true,
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  const tags = [
    ...article.categories.map((category) => category.title),
    ...article.tags,
  ];

  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/essays/${slug}` },
    keywords: tags,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      modifiedTime: article._updatedAt,
      authors: article.author ? [article.author.name] : undefined,
      tags,
    },
  };
}

export default async function EssayPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const [relatedCandidates, settings] = await Promise.all([
    sanityFetch<RelatedCandidateDoc[]>({
      query: relatedCandidatesQuery,
      params: { slug },
      tags: contentTags.article(),
      timed: true,
    }),
    getSiteSettings(),
  ]);

  const cover = article.coverImage;
  const coverSrc = cover ? imageUrl(cover) : null;
  const coverDimensions = cover ? imageDimensions(cover) : null;
  const minutes = readingTimeMinutes(article.body);
  const wordCount = readingWordCount(article.body);
  const headings = extractHeadings(article.body);
  const related = pickRelated(
    {
      categorySlugs: article.categories.map((category) => category.slug),
      scriptureBooks: extractScriptureBooks(article.body),
      themeTags: article.tags,
    },
    relatedCandidates,
    RELATED_COUNT,
  );
  const articleBodyId = "essay-body";

  return (
    <div className="mx-auto max-w-4xl px-6">
      {/* Bookmark ribbon: reading progress along the top edge. */}
      <div className="reading-ribbon" aria-hidden="true" />
      <ReadingProgressTracker
        slug={slug}
        title={article.title}
        articleId={articleBodyId}
      />
      <QuoteSelector
        slug={slug}
        containerId={articleBodyId}
        pageUrl={absoluteUrl(`/essays/${slug}`)}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Article",
              headline: article.title,
              description: article.excerpt,
              datePublished: article.publishedAt,
              dateModified: article._updatedAt,
              image: [absoluteUrl(`/essays/${slug}/opengraph-image`)],
              author: {
                "@type": "Organization",
                name: siteName,
                url: absoluteUrl("/"),
              },
              publisher: {
                "@type": "Organization",
                name: siteName,
                url: absoluteUrl("/"),
              },
              mainEntityOfPage: absoluteUrl(`/essays/${slug}`),
              articleSection: article.categories.map(
                (category) => category.title,
              ),
              keywords: article.tags.join(", "),
              wordCount,
              timeRequired: `PT${minutes}M`,
              isAccessibleForFree: true,
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Essays",
                  item: absoluteUrl("/essays"),
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: article.title,
                  item: absoluteUrl(`/essays/${slug}`),
                },
              ],
            },
          ],
        }}
      />
      <article className="reveal py-16 sm:py-20">
        {/* Ceremonial entry: centered header, the mark, then the text. */}
        <header className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">
            <time dateTime={article.publishedAt}>
              {formatDate(article.publishedAt)}
            </time>
            {article.categories.slice(0, 2).map((category) => (
              <span key={category.slug}>
                <span aria-hidden="true"> · </span>
                <Link
                  href={`/essays/category/${category.slug}`}
                  className="text-ink-faint no-underline transition-colors hover:text-accent-strong"
                >
                  {category.title}
                </Link>
              </span>
            ))}
            <span aria-hidden="true"> · </span>
            {minutes} min read
          </p>
          <h1 className="display mt-6">{article.title}</h1>
        </header>

        <Ornament className="mx-auto mt-12 max-w-xs sm:mt-14" />

        {coverSrc && coverDimensions && cover && (
          <figure className="mx-auto mt-12 max-w-3xl">
            <SanityImage
              src={coverSrc}
              alt={cover.alt ?? ""}
              width={coverDimensions.width}
              height={coverDimensions.height}
              lqip={cover.asset?.metadata?.lqip}
              sizes="(min-width: 56rem) 48rem, 100vw"
              priority
            />
          </figure>
        )}

        <EssayToc headings={headings} />

        <p className="quote-share-hint">
          Select a passage to make a shareable quote card.
        </p>

        <div
          id={articleBodyId}
          className="mx-auto mt-6 flex scroll-mt-8 justify-center sm:mt-8"
        >
          <EssayBody value={article.body} headings={headings} />
        </div>

        <Ornament className="mx-auto mt-16 max-w-xs" />

        {/* The essay's sign-off: no byline — the writing stands on its own. */}
        <footer className="mx-auto mt-14 max-w-2xl text-center">
          <Link
            href="/about"
            className="link inline-flex min-h-11 items-center font-sans text-sm"
          >
            About {settings.siteName}
          </Link>
        </footer>
      </article>

      {related.length > 0 && (
        <aside
          aria-labelledby="continue-reading"
          className="reveal-scroll border-t border-rule py-14 sm:py-16"
        >
          <div className="flex items-baseline justify-between gap-6">
            <h2 id="continue-reading" className="eyebrow">
              Continue reading
            </h2>
            <Link
              href="/essays"
              className="link inline-flex min-h-11 items-center font-sans text-sm"
            >
              All {settings.postPlural}
            </Link>
          </div>
          <div className="mt-2 border-t border-rule">
            <EssayList essays={related} />
          </div>
        </aside>
      )}
    </div>
  );
}
