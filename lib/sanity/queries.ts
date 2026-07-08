import { groq } from "next-sanity";

/** Dereference an image's asset so LQIP + dimensions come along. */
const imageProjection = /* groq */ `{
  ...,
  asset->{ _id, url, metadata { lqip, dimensions } }
}`;

const articleFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  coverImage ${imageProjection},
  "author": author->{ name, "slug": slug.current, bio },
  "categories": coalesce(categories[]->{ title, "slug": slug.current }, [])
`;

export const allArticlesQuery = groq`
  *[_type == "article" && defined(slug.current)]
    | order(publishedAt desc) { ${articleFields} }
`;

export const latestArticlesQuery = groq`
  *[_type == "article" && defined(slug.current)]
    | order(publishedAt desc) [0...3] { ${articleFields} }
`;

export const articleBySlugQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
    ${articleFields},
    body[] {
      ...,
      _type == "image" => ${imageProjection}
    }
  }
`;

export const articleSlugsQuery = groq`
  *[_type == "article" && defined(slug.current)].slug.current
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

/** Two more essays for the "continue reading" footer of an essay. */
export const relatedArticlesQuery = groq`
  *[_type == "article" && defined(slug.current) && slug.current != $slug]
    | order(publishedAt desc) [0...2] { ${articleFields} }
`;

/** Lean projection for dynamic OG images. */
export const articleOgQuery = groq`
  *[_type == "article" && slug.current == $slug][0] {
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
    "count": count(*[_type == "article" && references(^._id) && defined(slug.current)])
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
      && $slug in categories[]->slug.current]
    | order(publishedAt desc) { ${articleFields} }
`;

/**
 * Launch-tier search (ADR 0001 §Additions): GROQ full-text matching over
 * title, excerpt and body, ranked so title hits outrank body hits.
 * $q is the user's terms with a trailing wildcard, e.g. "hope*".
 */
export const searchArticlesQuery = groq`
  *[_type == "article" && defined(slug.current)
      && (title match $q || excerpt match $q || pt::text(body) match $q)]
    | score(
        boost(title match $q, 4),
        boost(excerpt match $q, 2),
        pt::text(body) match $q
      )
    | order(_score desc, publishedAt desc) [0...20] { ${articleFields} }
`;

/** Everything the sitemap needs, in one round trip. */
export const sitemapQuery = groq`{
  "articles": *[_type == "article" && defined(slug.current)]
    { "slug": slug.current, _updatedAt },
  "categories": *[_type == "category" && defined(slug.current)
      && count(*[_type == "article" && references(^._id)]) > 0]
    { "slug": slug.current, _updatedAt }
}`;

/** Full-content feed: the most recent essays including their bodies. */
export const feedQuery = groq`
  *[_type == "article" && defined(slug.current)]
    | order(publishedAt desc) [0...20] {
    ${articleFields},
    body[] {
      ...,
      _type == "image" => ${imageProjection}
    }
  }
`;
