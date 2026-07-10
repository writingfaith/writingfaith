import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";

import { formatDate } from "@/lib/format";
import { client } from "@/lib/sanity/client";
import { scheduledCacheProfile } from "@/lib/sanity/fetch";
import { searchArticlesQuery } from "@/lib/sanity/queries";
import type { SearchHitDoc } from "@/lib/sanity/types";
import {
  buildSnippet,
  highlightText,
  type SnippetSegment,
} from "@/lib/search-snippet";
import { getSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { normalizeSearchQuery } from "@/lib/validate";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.searchLabel,
    description: settings.searchDescription,
    alternates: { canonical: "/search" },
    robots: { index: false }, // result pages are query-dependent; keep them out of the index
  };
}

/**
 * Launch-tier search (ADR 0001 §Additions): a cached GROQ full-text query,
 * one cache entry per search term, invalidated on publish like all content.
 */
async function searchArticles(q: string): Promise<SearchHitDoc[]> {
  "use cache";
  cacheTag("article");
  cacheLife(scheduledCacheProfile);
  const pattern = q
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => `${term}*`)
    .join(" ");
  return client.fetch<SearchHitDoc[]>(searchArticlesQuery, { q: pattern });
}

function HighlightedText({ segments }: { segments: SnippetSegment[] }) {
  return segments.map((segment, index) =>
    segment.matched ? (
      <mark key={`${index}-${segment.text}`}>{segment.text}</mark>
    ) : (
      segment.text
    ),
  );
}

function SearchResults({
  results,
  query,
  postSingular,
}: {
  results: SearchHitDoc[];
  query: string;
  postSingular: string;
}) {
  const words = query.split(/\s+/).filter(Boolean);

  return (
    <ul className="divide-y divide-rule">
      {results.map((result) => {
        const snippet = buildSnippet(result.bodyText, words);
        return (
          <li key={result._id}>
            <article className="group relative py-10 sm:py-12">
              <p className="eyebrow">
                <time dateTime={result.publishedAt}>
                  {formatDate(result.publishedAt)}
                </time>
                {result.categories.slice(0, 2).map((category) => (
                  <span key={category.slug}>
                    <span aria-hidden="true"> · </span>
                    {category.title}
                  </span>
                ))}
              </p>
              <h2 className="title mt-3 text-[1.6rem] sm:text-[1.9rem]">
                <Link
                  href={`/essays/${result.slug}`}
                  className="text-ink no-underline transition-colors duration-200 after:absolute after:inset-0 group-hover:text-accent-strong"
                >
                  <HighlightedText
                    segments={highlightText(result.title, words)}
                  />
                </Link>
              </h2>
              <p className="search-snippet mt-3 max-w-prose leading-relaxed text-ink-muted">
                <HighlightedText
                  segments={snippet ?? highlightText(result.excerpt, words)}
                />
              </p>
              <p
                aria-hidden="true"
                className="mt-4 font-sans text-xs uppercase tracking-[0.18em] text-ink-faint transition-colors duration-200 group-hover:text-accent-strong"
              >
                Read the {postSingular}{" "}
                <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </p>
            </article>
          </li>
        );
      })}
    </ul>
  );
}

function SearchForm({
  settings,
  initialQuery,
}: {
  settings: SiteSettings;
  initialQuery?: string;
}) {
  return (
    <form action="/search" method="get" role="search" className="mt-8">
      <label
        htmlFor="search-input"
        className="block font-sans text-sm text-ink-muted"
      >
        {settings.searchInputLabel}
      </label>
      <div className="mt-3 flex max-w-xl flex-col gap-3 sm:flex-row">
        <input
          id="search-input"
          type="search"
          name="q"
          defaultValue={initialQuery}
          autoComplete="off"
          className="field"
          placeholder={settings.searchPlaceholder}
        />
        <button
          type="submit"
          className="btn w-full shrink-0 sm:w-auto"
        >
          {settings.searchButtonLabel}
        </button>
      </div>
    </form>
  );
}

async function SearchContent({
  settings,
  searchParams,
}: {
  settings: SiteSettings;
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = normalizeSearchQuery(raw);
  const results = query ? await searchArticles(query) : null;

  return (
    <>
      <SearchForm settings={settings} initialQuery={query} />
      <div aria-live="polite">
        {results !== null &&
          (results.length > 0 ? (
            <>
              <p className="mt-10 font-sans text-sm text-ink-faint">
                {results.length}{" "}
                {results.length === 1
                  ? settings.postSingular
                  : settings.postPlural}{" "}
                found for “{query}”
              </p>
              <div className="border-t border-rule">
                <SearchResults
                  results={results}
                  query={query}
                  postSingular={settings.postSingular}
                />
              </div>
            </>
          ) : (
            <p className="mt-10 max-w-prose text-ink-muted">
              {settings.searchNoResultsText.replaceAll("{query}", query ?? "")}{" "}
              <Link
                href="/essays"
                className="text-accent-strong underline underline-offset-4"
              >
                {settings.searchBrowseAllLabel}
              </Link>
              .
            </p>
          ))}
      </div>
    </>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const settings = await getSiteSettings();

  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="py-16 sm:py-20">
        <h1 className="eyebrow">{settings.searchHeading}</h1>
        {/* searchParams is runtime data under Cache Components, so
            everything that reads it streams inside Suspense. */}
        <Suspense fallback={<SearchForm settings={settings} />}>
          <SearchContent settings={settings} searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
