import { extractBookName } from "@/lib/scripture";
import type { ArticlePreview, RelatedCandidateDoc } from "@/lib/sanity/types";

const CATEGORY_WEIGHT = 3;
const SCRIPTURE_WEIGHT = 2;
const THEME_WEIGHT = 4;

function normalizeTag(tag: string): string {
  return tag.trim().toLocaleLowerCase("en-AU");
}

/**
 * Ranks candidate essays by kinship with the essay being read: shared
 * categories count most, a shared scripture book (extracted from quoted
 * references) counts too, and recency breaks ties. With no signal at all —
 * a thin archive, or an essay that shares nothing with its neighbours —
 * this degrades gracefully to the old "just the newest other essays"
 * behaviour, so it never produces an empty "related" section unnecessarily.
 *
 * `current.scriptureBooks` must already be extracted book names (see
 * lib/scripture.ts extractScriptureBooks); each candidate's `scriptureBooks`
 * are raw reference strings from Sanity and are extracted here.
 */
export function pickRelated(
  current: {
    categorySlugs: string[];
    scriptureBooks: string[];
    themeTags: string[];
  },
  candidates: RelatedCandidateDoc[],
  count: number,
): ArticlePreview[] {
  const currentCategories = new Set(current.categorySlugs);
  const currentBooks = new Set(current.scriptureBooks);
  const currentTags = new Set(current.themeTags.map(normalizeTag));

  const scored = candidates.map((candidate, position) => {
    const sharedCategories = candidate.categorySlugs.filter((slug) =>
      currentCategories.has(slug),
    ).length;
    const candidateBooks = candidate.scriptureBooks
      .map(extractBookName)
      .filter((book): book is string => Boolean(book));
    const sharedBooks = candidateBooks.filter((book) =>
      currentBooks.has(book),
    ).length;
    const sharedTags = candidate.themeTags
      .map(normalizeTag)
      .filter((tag) => currentTags.has(tag)).length;
    const score =
      sharedTags * THEME_WEIGHT +
      sharedCategories * CATEGORY_WEIGHT +
      sharedBooks * SCRIPTURE_WEIGHT;
    // Candidates arrive newest-first; `position` preserves that order as
    // the tiebreaker so equally-scored essays still favour recency.
    return { candidate, score, position };
  });

  scored.sort((a, b) => b.score - a.score || a.position - b.position);

  return scored.slice(0, count).map(({ candidate }) => ({
    _id: candidate._id,
    _updatedAt: candidate._updatedAt,
    title: candidate.title,
    slug: candidate.slug,
    excerpt: candidate.excerpt,
    publishedAt: candidate.publishedAt,
    tags: candidate.tags,
    coverImage: candidate.coverImage,
    author: candidate.author,
    categories: candidate.categories,
  }));
}
