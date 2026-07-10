import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from "sanity/presentation";

/**
 * Wires documents to the pages they appear on, so the Studio can show a
 * "Used on…" banner atop each document and jump straight into the live
 * preview — the writing appears on the real page as it is typed.
 */
export const resolve: PresentationPluginOptions["resolve"] = {
  // Editing straight from the preview: clicking text on these routes opens
  // the matching document without hunting through the content list.
  mainDocuments: defineDocuments([
    {
      route: "/essays/:slug",
      filter: `_type == "article" && slug.current == $slug`,
    },
    {
      route: "/about",
      filter: `_type == "page" && slug.current == "about"`,
    },
  ]),

  locations: {
    article: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Untitled essay",
            href: `/essays/${doc?.slug}`,
          },
          { title: "Home", href: "/" },
          { title: "All writing", href: "/essays" },
        ],
      }),
    }),
    page: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: doc?.title || "Untitled page",
            href: doc?.slug === "about" ? "/about" : `/${doc?.slug}`,
          },
        ],
      }),
    }),
    siteSettings: defineLocations({
      message: "Site Settings shape every page — the home page most of all.",
      resolve: () => ({
        locations: [
          { title: "Home", href: "/" },
          { title: "All writing", href: "/essays" },
          { title: "Search", href: "/search" },
        ],
      }),
    }),
    category: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          {
            title: `Category: ${doc?.title ?? "Untitled"}`,
            href: `/essays/category/${doc?.slug}`,
          },
        ],
      }),
    }),
  },
};
