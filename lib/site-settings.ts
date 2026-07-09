import { contentTags, sanityFetch } from "@/lib/sanity/fetch";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SiteSettingsDoc } from "@/lib/sanity/types";
import { authorName, siteDescription, siteName } from "@/lib/site";

export interface Topic {
  title: string;
  text: string;
}

/**
 * Site copy resolved against crafted defaults. Every string here is
 * editable from Studio → Site Settings; an empty field falls back to
 * the default below. `heroHeading` and `archiveHeading` stay optional so
 * pages can keep their typographically styled default headlines until the
 * owner writes her own.
 */
export interface SiteSettings {
  siteName: string;
  tagline: string;
  authorName: string;
  /** Lowercase noun for one piece of writing, e.g. "essay". */
  postSingular: string;
  /** Lowercase collective noun, e.g. "essays" or "blog". */
  postPlural: string;
  /** Capitalised plural for navigation and headings. */
  postPluralTitle: string;
  heroEyebrow: string;
  heroHeading?: string;
  heroIntro: string;
  topicsHeading: string;
  topics: Topic[];
  scriptureQuote: string;
  scriptureReference: string;
  writerBio: string;
  newsletterHeading: string;
  newsletterText: string;
  archiveEyebrow: string;
  archiveHeading?: string;
  footerBlurb: string;
}

const defaultTopics: Topic[] = [
  {
    title: "Scripture, read closely",
    text: "Careful readings that sit with a passage long enough to hear it — taking the text seriously without flattening it into a slogan.",
  },
  {
    title: "Honest questions",
    text: "Doubt is not the opposite of faith. This writing makes room for uncertainty, grief, and the questions most sermons skip.",
  },
  {
    title: "Ordinary life",
    text: "Faith as it is actually lived — at kitchen tables and bus stops, where belief is tested and, sometimes quietly, renewed.",
  },
];

function words(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Fetch the settings singleton and resolve every field against defaults. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await sanityFetch<SiteSettingsDoc | null>({
    query: siteSettingsQuery,
    tags: contentTags.settings(),
  });

  const postSingular = words(doc?.postLabelSingular, "essay").toLowerCase();
  const postPlural = words(doc?.postLabelPlural, "essays").toLowerCase();
  const resolvedAuthor = words(doc?.authorName, authorName);

  const topics: Topic[] =
    doc?.topics
      ?.map((topic) => ({
        title: topic.title?.trim() ?? "",
        text: topic.text?.trim() ?? "",
      }))
      .filter((topic) => topic.title && topic.text) ?? [];

  return {
    siteName: words(doc?.siteName, siteName),
    tagline: words(doc?.tagline, siteDescription),
    authorName: resolvedAuthor,
    postSingular,
    postPlural,
    postPluralTitle: titleCase(postPlural),
    heroEyebrow: words(doc?.heroEyebrow, `${titleCase(postPlural)} on faith`),
    heroHeading: doc?.heroHeading?.trim() || undefined,
    heroIntro: words(
      doc?.heroIntro,
      `Long-form writing on Christian faith — scripture, prayer, doubt, and hope — by ${resolvedAuthor}. Free to read, with every new ${postSingular} delivered by email to subscribers.`,
    ),
    topicsHeading: words(doc?.topicsHeading, "What you’ll find here"),
    topics: topics.length > 0 ? topics : defaultTopics,
    scriptureQuote: words(
      doc?.scriptureQuote,
      "Be still, and know that I am God.",
    ),
    scriptureReference: words(doc?.scriptureReference, "Psalm 46:10"),
    writerBio: words(
      doc?.writerBio,
      `${resolvedAuthor} writes about the life of faith from the middle of it — not from above it. This writing is one reader’s slow walk through scripture, doubt, and grace, offered in the hope that it keeps you company on yours.`,
    ),
    newsletterHeading: words(doc?.newsletterHeading, "Never miss a word"),
    newsletterText: words(
      doc?.newsletterText,
      `Subscribe to be notified whenever a new ${postSingular} is published — one considered email, nothing else. Free, no spam, and every email ends with a one-click unsubscribe.`,
    ),
    archiveEyebrow: words(doc?.archiveEyebrow, "The archive"),
    archiveHeading: doc?.archiveHeading?.trim() || undefined,
    footerBlurb: words(
      doc?.footerBlurb,
      `Independent writing on Christian faith by ${resolvedAuthor} — scripture, doubt, hope, and grace, explored with honesty and care.`,
    ),
  };
}
