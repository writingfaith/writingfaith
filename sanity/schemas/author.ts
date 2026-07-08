import { defineField, defineType } from "sanity";

/**
 * Authors are a separate document referenced from articles, so the platform
 * is multi-author-ready without any future schema migration (ADR 0001).
 */
export const authorType = defineType({
  name: "author",
  title: "Author",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "portrait",
      title: "Portrait",
      type: "image",
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
      name: "bio",
      title: "Short bio",
      type: "text",
      rows: 3,
      description: "One or two sentences, shown alongside essays.",
    }),
  ],
  preview: {
    select: { title: "name", media: "portrait" },
  },
});
