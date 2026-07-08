import { defineField, defineType } from "sanity";

/**
 * A scripture quotation with reference metadata, so every renderer (site,
 * RSS, email) can give passages a consistent typographic treatment and the
 * reference is data, not prose.
 */
export const scriptureType = defineType({
  name: "scripture",
  title: "Scripture quotation",
  type: "object",
  fields: [
    defineField({
      name: "passage",
      title: "Passage",
      type: "text",
      rows: 4,
      description: "The quoted scripture text, without the reference.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "reference",
      title: "Reference",
      type: "string",
      description: "For example: John 15:1–8",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "translation",
      title: "Translation",
      type: "string",
      description: "Abbreviation of the translation quoted, e.g. ESV, NIV.",
      initialValue: "ESV",
    }),
  ],
  preview: {
    select: { title: "reference", subtitle: "passage" },
    prepare({ title, subtitle }) {
      return {
        title: title ? `📖 ${title}` : "Scripture quotation",
        subtitle,
      };
    },
  },
});
