import { Icon, type IconSymbol } from "@sanity/icons";
import { createElement } from "react";
import type { StructureResolver } from "sanity/structure";

/** This @sanity/icons build exposes one Icon component keyed by symbol. */
const icon = (symbol: IconSymbol) => {
  const StructureIcon = () => createElement(Icon, { symbol });
  StructureIcon.displayName = `StructureIcon(${symbol})`;
  return StructureIcon;
};

/**
 * The Studio's content navigation, ordered by how often the author
 * touches each type: the writing first, supporting types after, and the
 * site-wide settings singleton at the end.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("article").title("Writing").icon(icon("compose")),
      S.listItem()
        .title("Scheduled")
        .child(
          S.documentList()
            .title("Scheduled essays")
            .schemaType("article")
            .filter('_type == "article" && defined(publishedAt) && publishedAt > now()')
            .defaultOrdering([{ field: "publishedAt", direction: "asc" }]),
        ),
      S.divider(),
      S.documentTypeListItem("page").title("Pages").icon(icon("documents")),
      S.documentTypeListItem("category").title("Categories").icon(icon("tag")),
      S.documentTypeListItem("author").title("Authors").icon(icon("users")),
      S.divider(),
      // Singleton: one Site Settings document with a fixed id.
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .icon(icon("cog"))
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
    ]);
