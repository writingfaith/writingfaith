import { defineArrayMember, defineField, defineType } from "sanity";

/** An essay — the core document type of WritingFaith. */
export const articleType = defineType({
  name: "article",
  title: "Essay",
  type: "document",
  // Word-style editing: opening a piece shows just the title and the page.
  // Everything administrative lives in the "Details" tab.
  groups: [
    { name: "write", title: "Write", default: true },
    { name: "details", title: "Details" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "write",
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: "slug",
      group: "details",
      title: "Slug",
      type: "slug",
      description: "The essay's address on the site. Generated from the title.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      group: "details",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description:
        "A sentence or two shown in essay lists and used as the search/social description.",
      validation: (rule) => rule.required().max(300),
    }),
    defineField({
      name: "author",
      group: "details",
      title: "Author",
      type: "reference",
      to: [{ type: "author" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categories",
      group: "details",
      title: "Categories",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
    }),
    defineField({
      name: "tags",
      group: "details",
      title: "Themes",
      type: "array",
      description:
        "Specific ideas that connect this essay to others — for example prayer, waiting, motherhood, grief, or grace. Used to curate related reading.",
      of: [
        defineArrayMember({
          type: "string",
          validation: (rule) => rule.required().min(2).max(40),
        }),
      ],
      validation: (rule) => rule.unique().max(8),
    }),
    defineField({
      name: "coverImage",
      group: "details",
      title: "Cover image",
      type: "image",
      description: "Optional. Shown atop the essay and in social previews.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          validation: (rule) =>
            rule.required().error("Alt text is required for accessibility."),
        }),
      ],
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "blockContent",
      group: "write",
      description:
        "Write here like a document: headings, quotes, scripture, pull quotes, and images from the toolbar.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      group: "details",
      title: "Published at",
      type: "datetime",
      description:
        "To schedule this essay, choose a future date and publish it now. It will remain private, then appear automatically within about five minutes of that time.",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Publish date, newest first",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      author: "author.name",
      date: "publishedAt",
      media: "coverImage",
    },
    prepare({ title, author, date, media }) {
      const formatted = date
        ? new Date(date).toLocaleString("en-AU", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : "Unpublished";
      const scheduled = date && new Date(date).getTime() > Date.now();
      return {
        title,
        subtitle: [scheduled ? `Scheduled ${formatted}` : formatted, author]
          .filter(Boolean)
          .join(" · "),
        media,
      };
    },
  },
});
