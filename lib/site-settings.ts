import {
  contentTags,
  sanityFetch,
  sanityFetchPublished,
} from "@/lib/sanity/fetch";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import type { SiteSettingsDoc } from "@/lib/sanity/types";
import { siteDescription, siteName } from "@/lib/site";

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
export type FontTheme =
  | "newsreader"
  | "literata"
  | "garamond"
  | "source-serif";
export type AccentTheme = "bronze" | "forest" | "oxblood" | "lake";

export interface SiteSettings {
  siteName: string;
  fontTheme: FontTheme;
  accentTheme: AccentTheme;
  tagline: string;
  /** Lowercase noun for one piece of writing, e.g. "essay". */
  postSingular: string;
  /** Lowercase collective noun, e.g. "essays" or "blog". */
  postPlural: string;
  /** Capitalised plural for navigation and headings. */
  postPluralTitle: string;
  aboutLabel: string;
  searchLabel: string;
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
  essaysEmptyHeading: string;
  essaysEmptyText: string;
  essaysEmptyLinkLabel: string;
  essaysEmptyLinkSuffix: string;
  aboutEyebrow: string;
  aboutPlaceholderTitle: string;
  aboutPlaceholderText: string;
  searchHeading: string;
  searchDescription: string;
  searchInputLabel: string;
  searchPlaceholder: string;
  searchButtonLabel: string;
  /** Contains a literal `{query}` token, replaced with the reader's term. */
  searchNoResultsText: string;
  searchBrowseAllLabel: string;
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

const FONT_THEMES: FontTheme[] = [
  "newsreader",
  "literata",
  "garamond",
  "source-serif",
];
const ACCENT_THEMES: AccentTheme[] = ["bronze", "forest", "oxblood", "lake"];

function resolveFont(value: string | undefined): FontTheme {
  return FONT_THEMES.includes(value as FontTheme)
    ? (value as FontTheme)
    : "newsreader";
}

function resolveAccent(value: string | undefined): AccentTheme {
  return ACCENT_THEMES.includes(value as AccentTheme)
    ? (value as AccentTheme)
    : "bronze";
}

/**
 * Theme attributes for the root <html> element. Published-only on purpose:
 * the root shell must stay prerenderable, so it never consults Draft Mode.
 */
export async function getThemeSettings(): Promise<{
  fontTheme: FontTheme;
  accentTheme: AccentTheme;
}> {
  const doc = await sanityFetchPublished<SiteSettingsDoc | null>({
    query: siteSettingsQuery,
    tags: contentTags.settings(),
  });
  return {
    fontTheme: resolveFont(doc?.fontTheme),
    accentTheme: resolveAccent(doc?.accentTheme),
  };
}

/** Fetch the settings singleton and resolve every field against defaults. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await sanityFetch<SiteSettingsDoc | null>({
    query: siteSettingsQuery,
    tags: contentTags.settings(),
  });

  const postSingular = words(doc?.postLabelSingular, "essay").toLowerCase();
  const postPlural = words(doc?.postLabelPlural, "essays").toLowerCase();
  const resolvedSiteName = words(doc?.siteName, siteName);
  const resolvedTagline = words(doc?.tagline, siteDescription);
  const aboutLabel = words(doc?.aboutLabel, "About");
  const searchLabel = words(doc?.searchLabel, "Search");

  const topics: Topic[] =
    doc?.topics
      ?.map((topic) => ({
        title: topic.title?.trim() ?? "",
        text: topic.text?.trim() ?? "",
      }))
      .filter((topic) => topic.title && topic.text) ?? [];

  return {
    siteName: resolvedSiteName,
    fontTheme: resolveFont(doc?.fontTheme),
    accentTheme: resolveAccent(doc?.accentTheme),
    tagline: resolvedTagline,
    postSingular,
    postPlural,
    postPluralTitle: titleCase(postPlural),
    aboutLabel,
    searchLabel,
    heroEyebrow: words(doc?.heroEyebrow, `${titleCase(postPlural)} on faith`),
    heroHeading: doc?.heroHeading?.trim() || undefined,
    heroIntro: words(
      doc?.heroIntro,
      `Long-form writing on Christian faith — scripture, prayer, doubt, and hope. Free to read, with every new ${postSingular} delivered by email to subscribers.`,
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
      `This writing comes from the middle of the life of faith — not from above it. It is one reader’s slow walk through scripture, doubt, and grace, offered in the hope that it keeps you company on yours.`,
    ),
    newsletterHeading: words(doc?.newsletterHeading, "Never miss a word"),
    newsletterText: words(
      doc?.newsletterText,
      `Subscribe to be notified whenever a new ${postSingular} is published — one considered email, nothing else. Free, no spam, and every email ends with a one-click unsubscribe.`,
    ),
    archiveEyebrow: words(doc?.archiveEyebrow, "The archive"),
    archiveHeading: doc?.archiveHeading?.trim() || undefined,
    essaysEmptyHeading: words(
      doc?.essaysEmptyHeading,
      `The first ${postSingular} is being written.`,
    ),
    essaysEmptyText: words(
      doc?.essaysEmptyText,
      "Nothing has been published yet.",
    ),
    essaysEmptyLinkLabel: words(doc?.essaysEmptyLinkLabel, "Subscribe"),
    essaysEmptyLinkSuffix: words(
      doc?.essaysEmptyLinkSuffix,
      "to be notified the moment it arrives.",
    ),
    aboutEyebrow: words(doc?.aboutEyebrow, aboutLabel),
    aboutPlaceholderTitle: words(doc?.aboutPlaceholderTitle, resolvedSiteName),
    aboutPlaceholderText: words(doc?.aboutPlaceholderText, resolvedTagline),
    searchHeading: words(doc?.searchHeading, searchLabel),
    searchDescription: words(
      doc?.searchDescription,
      `Search the ${postPlural} on ${resolvedSiteName}.`,
    ),
    searchInputLabel: words(
      doc?.searchInputLabel,
      `Search ${postPlural} by word or phrase`,
    ),
    searchPlaceholder: words(doc?.searchPlaceholder, "hope, psalms, doubt…"),
    searchButtonLabel: words(doc?.searchButtonLabel, "Search"),
    searchNoResultsText: words(
      doc?.searchNoResultsText,
      `No ${postPlural} matched “{query}”. Try a different word, or browse`,
    ),
    searchBrowseAllLabel: words(
      doc?.searchBrowseAllLabel,
      `all ${postPlural}`,
    ),
    footerBlurb: words(
      doc?.footerBlurb,
      `Independent writing on Christian faith — scripture, doubt, hope, and grace, explored with honesty and care.`,
    ),
  };
}
