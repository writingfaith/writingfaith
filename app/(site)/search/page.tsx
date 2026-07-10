import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";

import { EssayList } from "@/components/essay-list";
import { client } from "@/lib/sanity/client";
import { searchArticlesQuery } from "@/lib/sanity/queries";
import type { ArticlePreview } from "@/lib/sanity/types";
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
async function searchArticles(q: string): Promise<ArticlePreview[]> {
  "use cache";
  cacheTag("article");
  cacheLife("days");
  return client.fetch<ArticlePreview[]>(searchArticlesQuery, { q: `${q}*` });
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
                <EssayList essays={results} />
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
