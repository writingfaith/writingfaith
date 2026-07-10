import type { Metadata } from "next";
import Link from "next/link";

import { EssayList } from "@/components/essay-list";
import { contentTags, sanityFetch } from "@/lib/sanity/fetch";
import {
  allArticlesQuery,
  categoriesWithCountQuery,
} from "@/lib/sanity/queries";
import type { ArticlePreview, CategoryWithCount } from "@/lib/sanity/types";
import { getSiteSettings } from "@/lib/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.postPluralTitle,
    description: settings.tagline,
    alternates: { canonical: "/essays" },
  };
}

export default async function EssaysPage() {
  const [essays, categories, settings] = await Promise.all([
    sanityFetch<ArticlePreview[]>({
      query: allArticlesQuery,
      tags: contentTags.article(),
      timed: true,
    }),
    sanityFetch<CategoryWithCount[]>({
      query: categoriesWithCountQuery,
      tags: contentTags.category(),
      timed: true,
    }),
    getSiteSettings(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="py-16 sm:py-20">
        <header className="reveal mx-auto max-w-2xl text-center">
          <p className="eyebrow">{settings.archiveEyebrow}</p>
          <h1 className="title mt-5">
            {settings.archiveHeading ?? (
              <>
                Writing on scripture, doubt, hope, and{" "}
                <em className="text-accent">grace</em>.
              </>
            )}
          </h1>
        </header>
        {categories.length > 0 && (
          <nav aria-label="Categories" className="reveal-late mt-10">
            <ul className="flex flex-wrap items-baseline justify-center gap-x-6 gap-y-2 font-sans text-sm">
              {categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/essays/category/${category.slug}`}
                    className="text-ink-muted no-underline transition-colors hover:text-accent-strong"
                  >
                    {category.title}
                    <span className="text-ink-faint"> ({category.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
        {essays.length > 0 ? (
          <div className="mt-10 border-t border-rule">
            <EssayList essays={essays} headingLevel="h2" />
          </div>
        ) : (
          <div className="plate mx-auto mt-12 max-w-xl px-6 py-12 text-center">
            <p className="font-serif text-xl">{settings.essaysEmptyHeading}</p>
            <p className="mx-auto mt-3 max-w-[40ch] leading-relaxed text-ink-muted">
              {settings.essaysEmptyText}{" "}
              <Link href="/feed" className="link">
                {settings.essaysEmptyLinkLabel}
              </Link>{" "}
              {settings.essaysEmptyLinkSuffix}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
