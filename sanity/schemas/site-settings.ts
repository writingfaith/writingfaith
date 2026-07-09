import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Site Settings — a singleton the owner edits from the Studio.
 *
 * Every field is optional: the site ships with crafted defaults
 * (lib/site-settings.ts) and each field, once filled in, overrides its
 * default. Empty a field to fall back to the default again.
 */
export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  groups: [
    { name: "identity", title: "Identity", default: true },
    { name: "home", title: "Home page" },
    { name: "newsletter", title: "Newsletter" },
    { name: "archive", title: "Archive & footer" },
  ],
  fields: [
    defineField({
      name: "siteName",
      title: "Site name",
      type: "string",
      group: "identity",
      description: "The publication's name (default: WritingFaith).",
    }),
    defineField({
      name: "tagline",
      title: "Tagline / description",
      type: "text",
      rows: 2,
      group: "identity",
      description:
        "One or two sentences describing the site. Used in footers and as a fallback description.",
    }),
    defineField({
      name: "authorName",
      title: "Author name",
      type: "string",
      group: "identity",
    }),
    defineField({
      name: "postLabelSingular",
      title: "What is one piece of writing called?",
      type: "string",
      group: "identity",
      description:
        'Shown in labels and buttons, lowercase — e.g. "essay" or "blog post".',
    }),
    defineField({
      name: "postLabelPlural",
      title: "What is the writing called collectively?",
      type: "string",
      group: "identity",
      description:
        'Shown in navigation and headings, lowercase — e.g. "essays" or "blog".',
    }),

    defineField({
      name: "heroEyebrow",
      title: "Hero eyebrow",
      type: "string",
      group: "home",
      description: "The small label above the home page headline.",
    }),
    defineField({
      name: "heroHeading",
      title: "Hero headline",
      type: "string",
      group: "home",
    }),
    defineField({
      name: "heroIntro",
      title: "Hero introduction",
      type: "text",
      rows: 3,
      group: "home",
    }),
    defineField({
      name: "topicsHeading",
      title: "Topics section heading",
      type: "string",
      group: "home",
    }),
    defineField({
      name: "topics",
      title: "Topics (the three cards)",
      type: "array",
      group: "home",
      validation: (rule) => rule.max(3),
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
    }),
    defineField({
      name: "scriptureReference",
      title: "Verse reference",
      type: "string",
      group: "home",
      description: 'E.g. "Psalm 46:10".',
    }),
    defineField({
      name: "writerBio",
      title: "The writer (home page blurb)",
      type: "text",
      rows: 4,
      group: "home",
    }),

    defineField({
      name: "newsletterHeading",
      title: "Newsletter heading",
      type: "string",
      group: "newsletter",
    }),
    defineField({
      name: "newsletterText",
      title: "Newsletter invitation",
      type: "text",
      rows: 3,
      group: "newsletter",
    }),

    defineField({
      name: "archiveEyebrow",
      title: "Archive eyebrow",
      type: "string",
      group: "archive",
      description: "The small label at the top of the writing archive.",
    }),
    defineField({
      name: "archiveHeading",
      title: "Archive headline",
      type: "string",
      group: "archive",
    }),
    defineField({
      name: "footerBlurb",
      title: "Footer blurb",
      type: "text",
      rows: 3,
      group: "archive",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Site Settings" }),
  },
});
