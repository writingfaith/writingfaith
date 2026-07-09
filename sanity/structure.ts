import type { StructureResolver } from "sanity/structure";

/**
 * The Studio's content navigation, ordered by how often the author
 * touches each type: essays first, supporting types after.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("article").title("Writing"),
      S.divider(),
      S.documentTypeListItem("page").title("Pages"),
      S.documentTypeListItem("category").title("Categories"),
      S.documentTypeListItem("author").title("Authors"),
      S.divider(),
      // Singleton: one Site Settings document with a fixed id.
      S.listItem()
        .title("Site Settings")
        .id("siteSettings")
        .child(
          S.document().schemaType("siteSettings").documentId("siteSettings"),
        ),
    ]);
