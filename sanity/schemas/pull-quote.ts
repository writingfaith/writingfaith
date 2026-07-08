import { defineField, defineType } from "sanity";

/** A short line lifted from the essay, set large as a visual pause. */
export const pullQuoteType = defineType({
  name: "pullQuote",
  title: "Pull quote",
  type: "object",
  fields: [
    defineField({
      name: "text",
      title: "Text",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().max(280),
    }),
  ],
  preview: {
    select: { title: "text" },
    prepare({ title }) {
      return { title: title ? `❝ ${title}` : "Pull quote" };
    },
  },
});
