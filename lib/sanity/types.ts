import type { PortableTextBlock } from "@portabletext/react";

/** An image as projected by our GROQ queries (asset dereferenced). */
export interface SanityImage {
  _type: "image";
  alt?: string;
  caption?: string;
  hotspot?: { x: number; y: number; height: number; width: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  asset?: {
    _id: string;
    url: string;
    metadata?: {
      lqip?: string;
      dimensions?: { width: number; height: number; aspectRatio: number };
    };
  };
}

export interface CategoryRef {
  title: string;
  slug: string;
}

export interface Category extends CategoryRef {
  description?: string;
}

export interface CategoryWithCount extends Category {
  count: number;
}

export interface AuthorRef {
  name: string;
  slug: string;
  bio?: string;
}

/** The fields shared by essay lists and the essay page. */
export interface ArticlePreview {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  coverImage?: SanityImage;
  author?: AuthorRef;
  categories: CategoryRef[];
}

export interface Article extends ArticlePreview {
  body: PortableTextBlock[];
}

export interface SitePage {
  title: string;
  description?: string;
  slug: string;
  body: PortableTextBlock[];
}

/** The Site Settings singleton as stored in Sanity (all fields optional). */
export interface SiteSettingsDoc {
  siteName?: string;
  tagline?: string;
  authorName?: string;
  postLabelSingular?: string;
  postLabelPlural?: string;
  aboutLabel?: string;
  searchLabel?: string;
  heroEyebrow?: string;
  heroHeading?: string;
  heroIntro?: string;
  topicsHeading?: string;
  topics?: Array<{ title?: string; text?: string }>;
  scriptureQuote?: string;
  scriptureReference?: string;
  writerBio?: string;
  newsletterHeading?: string;
  newsletterText?: string;
  archiveEyebrow?: string;
  archiveHeading?: string;
  footerBlurb?: string;
}
