import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";

import { EssayList } from "@/components/essay-list";
import { client } from "@/lib/sanity/client";
import { searchArticlesQuery } from "@/lib/sanity/queries";
import type { ArticlePreview } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "Search",
  description: "Search the essays on WritingFaith.",
  alternates: { canonical: "/search" },
  robots: { index: false }, // result pages are query-dependent; keep them out of the index
};

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

function SearchForm({ initialQuery }: { initialQuery?: string }) {
  return (
    <form action="/search" method="get" role="search" className="mt-8">
      <label
        htmlFor="search-input"
        className="block font-sans text-sm text-ink-muted"
      >
        Search essays by word or phrase
      </label>
      <div className="mt-3 flex max-w-xl flex-col gap-3 sm:flex-row">
        <input
          id="search-input"
          type="search"
          name="q"
          defaultValue={initialQuery}
          autoComplete="off"
          className="field"
          placeholder="hope, psalms, doubt…"
        />
        <button
          type="submit"
          className="btn w-full shrink-0 sm:w-auto"
        >
          Search
        </button>
      </div>
    </form>
  );
}

async function SearchContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const raw = Array.isArray(params.q) ? params.q[0] : params.q;
  const query = (raw ?? "").trim().slice(0, 80);
  const results = query ? await searchArticles(query) : null;

  return (
    <>
      <SearchForm initialQuery={query} />
      <div aria-live="polite">
        {results !== null &&
          (results.length > 0 ? (
            <>
              <p className="mt-10 font-sans text-sm text-ink-faint">
                {results.length === 1
                  ? "1 essay found"
                  : `${results.length} essays found`}{" "}
                for “{query}”
              </p>
              <div className="border-t border-rule">
                <EssayList essays={results} />
              </div>
            </>
          ) : (
            <p className="mt-10 max-w-prose text-ink-muted">
              No essays matched “{query}”. Try a different word, or browse{" "}
              <Link
                href="/essays"
                className="text-accent-strong underline underline-offset-4"
              >
                all essays
              </Link>
              .
            </p>
          ))}
      </div>
    </>
  );
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="py-16 sm:py-20">
        <h1 className="eyebrow">
          Search
        </h1>
        {/* searchParams is runtime data under Cache Components, so
            everything that reads it streams inside Suspense. */}
        <Suspense fallback={<SearchForm />}>
          <SearchContent searchParams={searchParams} />
        </Suspense>
      </section>
    </div>
  );
}
