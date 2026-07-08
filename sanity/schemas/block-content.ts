import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * The shared Portable Text definition for long-form writing.
 *
 * Kept deliberately small: a reading site needs restraint, not a toolbox.
 * Custom blocks: scripture quotations, pull quotes, and images with
 * accessibility enforced at the schema level (alt text is required).
 */
export const blockContentType = defineType({
  name: "blockContent",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading", value: "h2" },
        { title: "Subheading", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            title: "Link",
            type: "object",
            fields: [
              defineField({
                name: "href",
                title: "URL",
                type: "url",
                validation: (rule) =>
                  rule.required().uri({
                    allowRelative: true,
                    scheme: ["http", "https", "mailto"],
                  }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({ type: "scripture" }),
    defineArrayMember({ type: "pullQuote" }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description:
            "Describes the image for readers using screen readers. Required.",
          validation: (rule) =>
            rule.required().error("Alt text is required for accessibility."),
        }),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
        }),
      ],
    }),
  ],
});
