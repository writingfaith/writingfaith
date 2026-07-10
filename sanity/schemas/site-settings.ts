import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Site Settings — a singleton the owner edits from the Studio.
 *
 * Every field starts pre-filled with the site's current copy (initialValue),
 * so what you see in the Studio is exactly what the site shows — edit any
 * field and publish. A field emptied on purpose falls back to the same
 * default in code (lib/site-settings.ts), so the site can never go blank.
 */
export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "identity", title: "Identity & menu", default: true },
    { name: "design", title: "Design" },
    { name: "home", title: "Home page" },
    { name: "essays", title: "Essays page" },
    { name: "about", title: "About page" },
    { name: "search", title: "Search page" },
    { name: "newsletter", title: "Newsletter" },
    { name: "footer", title: "Footer" },
  ],
  fields: [
    defineField({
      name: "fontTheme",
      title: "Typeface (the site's serif voice)",
      type: "string",
      group: "design",
      initialValue: "newsreader",
      options: {
        layout: "radio",
        list: [
          { title: "Newsreader — classic, bookish (default)", value: "newsreader" },
          { title: "Literata — contemporary literary", value: "literata" },
          { title: "EB Garamond — old-style elegance", value: "garamond" },
          { title: "Source Serif — modern clarity", value: "source-serif" },
        ],
      },
      description:
        "Changes every headline and paragraph across the site. Publish to apply.",
    }),
    defineField({
      name: "accentTheme",
      title: "Accent colour",
      type: "string",
      group: "design",
      initialValue: "bronze",
      options: {
        layout: "radio",
        list: [
          { title: "Bronze — warm, candlelit (default)", value: "bronze" },
          { title: "Forest — deep green, still", value: "forest" },
          { title: "Oxblood — dark red, solemn", value: "oxblood" },
          { title: "Lake — slate blue, calm", value: "lake" },
        ],
      },
      description:
        "The single colour used for emphasis: links, buttons, ornaments.",
    }),
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      group: "identity",
      initialValue: "WritingFaith",
      description: "The publication's name, shown in the masthead and footer.",
    }),
    defineField({
      name: "tagline",
      title: "Tagline / description",
      type: "text",
      rows: 2,
      group: "identity",
      initialValue:
        "Thoughtful long-form writing on Christian faith, hope, and everyday life.",
      description:
        "One or two sentences describing the site. Used as a fallback description and on the About placeholder.",
    }),
    defineField({
      name: "postLabelSingular",
      title: "Menu & labels: one piece of writing is called…",
      type: "string",
      group: "identity",
      initialValue: "essay",
      description:
        'Lowercase — e.g. "essay" or "blog post". Used in buttons and labels ("Read the essay").',
    }),
    defineField({
      name: "postLabelPlural",
      title: "Menu & labels: the writing collectively is called…",
      type: "string",
      group: "identity",
      initialValue: "essays",
      description:
        'Lowercase — e.g. "essays" or "blog". Becomes the first menu item and section headings.',
    }),
    defineField({
      name: "aboutLabel",
      title: "Menu: About item",
      type: "string",
      group: "identity",
      initialValue: "About",
    }),
    defineField({
      name: "searchLabel",
      title: "Menu: Search item",
      type: "string",
      group: "identity",
      initialValue: "Search",
    }),

    defineField({
      name: "heroEyebrow",
      title: "Hero eyebrow",
      type: "string",
      group: "home",
      initialValue: "Essays on faith",
      description: "The small label above the home page headline.",
    }),
    defineField({
      name: "heroHeading",
      title: "Hero headline",
      type: "string",
      group: "home",
      initialValue:
        "Quiet reflections on following Christ in an unquiet world.",
    }),
    defineField({
      name: "heroIntro",
      title: "Hero introduction",
      type: "text",
      rows: 3,
      group: "home",
      initialValue:
        "Long-form writing on Christian faith — scripture, prayer, doubt, and hope. Free to read, with every new essay delivered by email to subscribers.",
    }),
    defineField({
      name: "topicsHeading",
      title: "Topics section heading",
      type: "string",
      group: "home",
      initialValue: "What you’ll find here",
    }),
    defineField({
      name: "topics",
      title: "Topics (the three cards)",
      type: "array",
      group: "home",
      validation: (rule) => rule.max(3),
      initialValue: [
        {
          _type: "topic",
          title: "Scripture, read closely",
          text: "Careful readings that sit with a passage long enough to hear it — taking the text seriously without flattening it into a slogan.",
        },
        {
          _type: "topic",
          title: "Honest questions",
          text: "Doubt is not the opposite of faith. This writing makes room for uncertainty, grief, and the questions most sermons skip.",
        },
        {
          _type: "topic",
          title: "Ordinary life",
          text: "Faith as it is actually lived — at kitchen tables and bus stops, where belief is tested and, sometimes quietly, renewed.",
        },
      ],
      of: [
        defineArrayMember({
          type: "object",
          name: "topic",
          fields: [
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: "text",
              title: "Text",
              type: "text",
              rows: 3,
              validation: (rule) => rule.required(),
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: "scriptureQuote",
      title: "Featured verse",
      type: "text",
      rows: 2,
      group: "home",
      initialValue: "Be still, and know that I am God.",
    }),
    defineField({
      name: "scriptureReference",
      title: "Verse reference",
      type: "string",
      group: "home",
      initialValue: "Psalm 46:10",
    }),
    defineField({
      name: "writerBio",
      title: "The writer (home page blurb)",
      type: "text",
      rows: 4,
      group: "home",
      initialValue:
        "This writing comes from the middle of the life of faith — not from above it. It is one reader’s slow walk through scripture, doubt, and grace, offered in the hope that it keeps you company on yours.",
    }),

    defineField({
      name: "newsletterHeading",
      title: "Newsletter heading",
      type: "string",
      group: "newsletter",
      initialValue: "Never miss a word",
    }),
    defineField({
      name: "newsletterText",
      title: "Newsletter invitation",
      type: "text",
      rows: 3,
      group: "newsletter",
      initialValue:
        "Subscribe to be notified whenever a new essay is published — one considered email, nothing else. Free, no spam, and every email ends with a one-click unsubscribe.",
    }),

    defineField({
      name: "archiveEyebrow",
      title: "Archive eyebrow",
      type: "string",
      group: "essays",
      initialValue: "The archive",
      description: "The small label at the top of the writing archive.",
    }),
    defineField({
      name: "archiveHeading",
      title: "Archive headline",
      type: "string",
      group: "essays",
      initialValue: "Writing on scripture, doubt, hope, and grace.",
    }),
    defineField({
      name: "essaysEmptyHeading",
      title: "Empty archive: headline",
      type: "string",
      group: "essays",
      initialValue: "The first essay is being written.",
      description:
        "Shown on the Essays page only while nothing has been published yet.",
    }),
    defineField({
      name: "essaysEmptyText",
      title: "Empty archive: sentence before the link",
      type: "text",
      rows: 2,
      group: "essays",
      initialValue: "Nothing has been published yet.",
    }),
    defineField({
      name: "essaysEmptyLinkLabel",
      title: "Empty archive: link text",
      type: "string",
      group: "essays",
      initialValue: "Subscribe",
      description: "The linked words. The link points at the newsletter page.",
    }),
    defineField({
      name: "essaysEmptyLinkSuffix",
      title: "Empty archive: sentence after the link",
      type: "string",
      group: "essays",
      initialValue: "to be notified the moment it arrives.",
    }),

    defineField({
      name: "aboutEyebrow",
      title: "About eyebrow",
      type: "string",
      group: "about",
      initialValue: "About",
      description:
        "The small label above the About headline, on the page itself.",
    }),
    defineField({
      name: "aboutPlaceholderTitle",
      title: "Placeholder headline",
      type: "string",
      group: "about",
      description:
        "Shown only until an About page exists under Pages. Empty falls back to the site name.",
    }),
    defineField({
      name: "aboutPlaceholderText",
      title: "Placeholder introduction",
      type: "text",
      rows: 3,
      group: "about",
      description:
        "Shown only until an About page exists under Pages. Empty falls back to the tagline.",
    }),

    defineField({
      name: "searchHeading",
      title: "Search heading",
      type: "string",
      group: "search",
      initialValue: "Search",
      description: "The label at the top of the Search page.",
    }),
    defineField({
      name: "searchDescription",
      title: "Search page description",
      type: "text",
      rows: 2,
      group: "search",
      initialValue: "Search the essays on WritingFaith.",
      description: "Used by browsers and search engines, not shown on the page.",
    }),
    defineField({
      name: "searchInputLabel",
      title: "Search box label",
      type: "string",
      group: "search",
      initialValue: "Search essays by word or phrase",
    }),
    defineField({
      name: "searchPlaceholder",
      title: "Search box placeholder",
      type: "string",
      group: "search",
      initialValue: "hope, psalms, doubt…",
      description: "The faint example text inside the empty search box.",
    }),
    defineField({
      name: "searchButtonLabel",
      title: "Search button",
      type: "string",
      group: "search",
      initialValue: "Search",
    }),
    defineField({
      name: "searchNoResultsText",
      title: "No results: sentence before the link",
      type: "text",
      rows: 2,
      group: "search",
      initialValue:
        "No essays matched “{query}”. Try a different word, or browse",
      description:
        "Write {query} where the reader's search term should appear. The sentence ends with the link below.",
    }),
    defineField({
      name: "searchBrowseAllLabel",
      title: "No results: link text",
      type: "string",
      group: "search",
      initialValue: "all essays",
      description: "The linked words. The link points at the Essays page.",
    }),

    defineField({
      name: "footerBlurb",
      title: "Footer blurb",
      type: "text",
      rows: 3,
      group: "footer",
      initialValue:
        "Independent writing on Christian faith — scripture, doubt, hope, and grace, explored with honesty and care.",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
