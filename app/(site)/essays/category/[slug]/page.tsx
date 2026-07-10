import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EssayList } from "@/components/essay-list";
import { client } from "@/lib/sanity/client";
import { contentTags, sanityFetch } from "@/lib/sanity/fetch";
import {
  articlesByCategoryQuery,
  categoryBySlugQuery,
  categorySlugsQuery,
} from "@/lib/sanity/queries";
import type { ArticlePreview, Category } from "@/lib/sanity/types";

export async function generateStaticParams() {
  const slugs = await client.fetch<string[]>(categorySlugsQuery);
  if (slugs.length === 0) {
    // Cache Components requires ≥1 param; resolved to notFound() below.
    return [{ slug: "__placeholder__" }];
  }
  return slugs.map((slug) => ({ slug }));
}

async function getCategory(slug: string) {
  return sanityFetch<Category | null>({
    query: categoryBySlugQuery,
    params: { slug },
    tags: contentTags.category(),
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};

  return {
    title: `${category.title} — Essays`,
    description:
      category.description ??
      `Essays on ${category.title.toLowerCase()}.`,
    alternates: { canonical: `/essays/category/${slug}` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const essays = await sanityFetch<ArticlePreview[]>({
    query: articlesByCategoryQuery,
    params: { slug },
    tags: contentTags.category(),
    timed: true,
  });

  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="py-16 sm:py-20">
        <p className="eyebrow">
          <Link
            href="/essays"
            className="transition-colors hover:text-ink"
          >
            Essays
          </Link>{" "}
          / {category.title}
        </p>
        <h1 className="title mt-6">{category.title}</h1>
        {category.description && (
          <p className="mt-4 max-w-prose text-ink-muted">
            {category.description}
          </p>
        )}
        {essays.length > 0 ? (
          <div className="mt-8 border-t border-rule">
            <EssayList essays={essays} headingLevel="h2" />
          </div>
        ) : (
          <p className="mt-8 max-w-prose text-ink-muted">
            No essays in this category yet.
          </p>
        )}
      </section>
    </div>
  );
}
