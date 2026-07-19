import { groq } from "next-sanity";

/** Dereference an image's asset so LQIP + dimensions come along. */
const imageProjection = /* groq */ `{
  ...,
  asset->{ _id, url, metadata { lqip, dimensions } }
}`;

const articleFields = /* groq */ `
  _id,
  _updatedAt,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "tags": coalesce(tags, []),
  coverImage ${imageProjection},
  "author": author->{ name, "slug": slug.current, bio },
  "categories": coalesce(categories[]->{ title, "slug": slug.current }, [])
`;

/**
 * `$preview == true` lets the owner's own Draft Mode session see a scheduled
 * essay (publishedAt in the future) before it goes live; every other reader
 * only ever sees `publishedAt <= now()`. Reads that never pass `$preview`
 * resolve it to null, which fails `== true` and keeps the filter active —
 * the safe default for public, unauthenticated queries.
 */
const visibleNow = /* groq */ `($preview == true || publishedAt <= now())`;

export const allArticlesQuery = groq`
  *[_type == "article" && defined(slug.current) && ${visibleNow}]
    | order(publishedAt desc) { ${articleFields} }
`;

export const latestArticlesQuery = groq`
  *[_type == "article" && defined(slug.current) && ${visibleNow}]
    | order(publishedAt desc) [0...3] { ${articleFields} }
`;

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug && ${visibleNow}][0] {
    ${articleFields},
    body[] {
      ...,
      _type == "image" => ${imageProjection}
    }
  }
`;

/** Build-time static params: always published-only, regardless of caller. */
export const articleSlugsQuery = groq`
  *[_type == "article" && defined(slug.current) && publishedAt <= now()].slug.current
`;

export const pageBySlugQuery = groq`
  *[_type == "page" && slug.current == $slug][0] {
    title,
    description,
    "slug": slug.current,
    body[] {
      ...,
      _type == "image" => ${imageProjection}
    }
  }
`;

/**
 * A candidate pool for the "continue reading" footer — recent essays other
 * than the one being read, each carrying its category slugs and quoted
 * scripture books so lib/related.ts can rank by kinship rather than just
 * recency. Always published-only: "related" is supplementary, not the
 * document being previewed.
 */
export const relatedCandidatesQuery = groq`
  *[_type == "article" && defined(slug.current) && slug.current != $slug
      && publishedAt <= now()]
    | order(publishedAt desc) [0...24] {
      ${articleFields},
      "categorySlugs": coalesce(categories[]->slug.current, []),
      "scriptureBooks": coalesce(body[_type == "scripture"].reference, []),
      "themeTags": coalesce(tags, [])
    }
`;

/** Lean projection for dynamic OG images. */
export const articleOgQuery = groq`
  *[_type == "article" && slug.current == $slug && publishedAt <= now()][0] {
    title,
    publishedAt,
    "author": author->name
  }
`;

export const categoriesWithCountQuery = groq`
  *[_type == "category" && defined(slug.current)] | order(title asc) {
    title,
    "slug": slug.current,
    description,
    "count": count(*[_type == "article" && references(^._id) && defined(slug.current)
      && publishedAt <= now()])
  } [count > 0]
`;

export const categoryBySlugQuery = groq`
  *[_type == "category" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    description
  }
`;

export const categorySlugsQuery = groq`
  *[_type == "category" && defined(slug.current)].slug.current
`;

export const articlesByCategoryQuery = groq`
  *[_type == "article" && defined(slug.current)
      && $slug in categories[]->slug.current && ${visibleNow}]
    | order(publishedAt desc) { ${articleFields} }
`;

/**
 * Launch-tier search (ADR 0001 §Additions): GROQ full-text matching over
 * title, excerpt and body, ranked so title hits outrank body hits. $q is the
 * user's terms with a trailing wildcard, e.g. "hope*". Always
 * published-only — search must never surface a scheduled or draft essay.
 * `bodyText` is consumed server-side only (to build a highlighted snippet)
 * and is never forwarded to the client.
 */
export const searchArticlesQuery = groq`
  *[_type == "article" && defined(slug.current) && publishedAt <= now()
      && (title match $q || excerpt match $q || pt::text(body) match $q)]
    | score(
        boost(title match $q, 4),
        boost(excerpt match $q, 2),
        pt::text(body) match $q
      )
    | order(_score desc, publishedAt desc) [0...20] {
      ${articleFields},
      "bodyText": pt::text(body)
    }
`;

/** Everything the sitemap needs, in one round trip. Published-only. */
export const sitemapQuery = groq`{
  "articles": *[_type == "article" && defined(slug.current) && publishedAt <= now()]
    { "slug": slug.current, _updatedAt },
  "categories": *[_type == "category" && defined(slug.current)
      && count(*[_type == "article" && references(^._id) && publishedAt <= now()]) > 0]
    { "slug": slug.current, _updatedAt }
}`;

/** Full-content feed: the most recent published essays including their bodies. */
export const feedQuery = groq`
  *[_type == "article" && defined(slug.current) && publishedAt <= now()]
    | order(publishedAt desc) [0...20] {
    ${articleFields},
    body[] {
      ...,
      _type == "image" => ${imageProjection}
    }
  }
`;

/** Lean lookup for the quote-card image route: title + attribution only. */
export const articleTitleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug && publishedAt <= now()][0] {
    title
  }
`;

/**
 * Lean lookup for the publish-webhook's new-essay broadcast: just enough to
 * write the email, and `publishedAt <= now()` so a scheduled essay (future
 * publishedAt, saved now but not yet visible) is correctly excluded.
 */
export const articleNotificationBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug && publishedAt <= now()][0] {
    title,
    excerpt,
    "slug": slug.current
  }
`;

/**
 * Candidate pool for the scheduled-essay cron sweep: essays that became
 * visible since `$since`, whether because they were just published or
 * because a future `publishedAt` has now arrived with no webhook to prompt
 * it. The window is a safety margin, not a precise "unnotified" filter —
 * lib/newsletter/broadcast.ts's dedup table does the real filtering.
 */
export const recentlyPublishedArticlesQuery = groq`
  *[_type == "article" && defined(slug.current)
      && publishedAt <= now() && publishedAt >= $since]
    | order(publishedAt asc) {
      title,
      excerpt,
      "slug": slug.current
    }
`;

/** The Site Settings singleton; every field optional, defaults in lib/site-settings.ts. */
export const siteSettingsQuery = groq`
  *[_type == "siteSettings" && _id == "siteSettings"][0] {
    siteName,
    tagline,
    fontTheme,
    accentTheme,
    postLabelSingular,
    postLabelPlural,
    aboutLabel,
    searchLabel,
    heroEyebrow,
    heroHeading,
    heroIntro,
    topicsHeading,
    "topics": coalesce(topics[]{ title, text }, []),
    scriptureQuote,
    scriptureReference,
    writerBio,
    newsletterHeading,
    newsletterText,
    archiveEyebrow,
    archiveHeading,
    essaysEmptyHeading,
    essaysEmptyText,
    essaysEmptyLinkLabel,
    essaysEmptyLinkSuffix,
    aboutEyebrow,
    aboutPlaceholderTitle,
    aboutPlaceholderText,
    searchHeading,
    searchDescription,
    searchInputLabel,
    searchPlaceholder,
    searchButtonLabel,
    searchNoResultsText,
    searchBrowseAllLabel,
    footerBlurb
  }
`;
