import Link from "next/link";

import { formatDate } from "@/lib/format";
import type { ArticlePreview } from "@/lib/sanity/types";

/** Date · categories meta line used across essay presentations. */
function EssayMeta({ essay }: { essay: ArticlePreview }) {
  return (
    <p className="eyebrow">
      <time dateTime={essay.publishedAt}>{formatDate(essay.publishedAt)}</time>
      {essay.categories.slice(0, 2).map((category) => (
        <span key={category.slug}>
          <span aria-hidden="true"> · </span>
          {category.title}
        </span>
      ))}
    </p>
  );
}

/** The archive: quiet ruled rows, whole row clickable. */
export function EssayList({
  essays,
  headingLevel = "h3",
}: {
  essays: ArticlePreview[];
  /** Keeps the document outline correct wherever the list appears. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <ul className="divide-y divide-rule">
      {essays.map((essay) => (
        <li key={essay._id}>
          <article className="group relative py-10 sm:py-12">
            <EssayMeta essay={essay} />
            <Heading className="title mt-3 text-[1.6rem] sm:text-[1.9rem]">
              <Link
                href={`/essays/${essay.slug}`}
                className="text-ink no-underline transition-colors duration-200 after:absolute after:inset-0 group-hover:text-accent-strong"
              >
                {essay.title}
              </Link>
            </Heading>
            <p className="mt-3 max-w-prose leading-relaxed text-ink-muted">
              {essay.excerpt}
            </p>
            <p
              aria-hidden="true"
              className="mt-4 font-sans text-xs uppercase tracking-[0.18em] text-ink-faint transition-colors duration-200 group-hover:text-accent-strong"
            >
              Read the essay{" "}
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}

/** The newest essay, given the front-page treatment it deserves. */
export function FeaturedEssay({ essay }: { essay: ArticlePreview }) {
  return (
    <article className="group relative mx-auto max-w-2xl text-center">
      <p className="eyebrow">The latest essay</p>
      <h2 className="title mt-5">
        <Link
          href={`/essays/${essay.slug}`}
          className="text-ink no-underline transition-colors duration-200 after:absolute after:inset-0 group-hover:text-accent-strong"
        >
          {essay.title}
        </Link>
      </h2>
      <p className="mx-auto mt-5 max-w-prose leading-relaxed text-ink-muted">
        {essay.excerpt}
      </p>
      <p className="eyebrow mt-6">
        <time dateTime={essay.publishedAt}>{formatDate(essay.publishedAt)}</time>
        {essay.author ? (
          <span>
            <span aria-hidden="true"> · </span>
            {essay.author.name}
          </span>
        ) : null}
      </p>
    </article>
  );
}
