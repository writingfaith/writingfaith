import { toHTML, type PortableTextHtmlComponents } from "@portabletext/to-html";
import type { PortableTextBlock } from "@portabletext/react";

import { imageDimensions, imageUrl } from "@/lib/sanity/image";
import type { Article, SanityImage } from "@/lib/sanity/types";
import { absoluteUrl, authorName, siteDescription, siteName, siteUrl } from "@/lib/site";

/** Escape a string for use in XML text nodes and attributes. */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Feed-target serializers for the same Portable Text block types the site
 * renders (ADR 0001: one content model, per-target serializers).
 * `toHTML` escapes all text content itself.
 */
const feedComponents: Partial<PortableTextHtmlComponents> = {
  types: {
    scripture: ({ value }) => {
      const v = value as { passage?: string; reference?: string; translation?: string };
      const caption = [v.reference, v.translation ? `(${v.translation})` : null]
        .filter(Boolean)
        .join(" ");
      return `<figure><blockquote><em>${xml(v.passage ?? "")}</em></blockquote><figcaption>— ${xml(caption)}</figcaption></figure>`;
    },
    pullQuote: () => "", // decorative repetition of body text; omit from the feed
    image: ({ value }) => {
      const image = value as SanityImage;
      const src = imageUrl(image);
      const dimensions = imageDimensions(image);
      if (!src || !dimensions) return "";
      const img = `<img src="${xml(`${src}?w=1200&auto=format`)}" alt="${xml(image.alt ?? "")}" width="${dimensions.width}" height="${dimensions.height}" />`;
      return image.caption
        ? `<figure>${img}<figcaption>${xml(image.caption)}</figcaption></figure>`
        : `<figure>${img}</figure>`;
    },
  },
};

export function buildFeed(articles: Article[]): string {
  const items = articles
    .map((article) => {
      const url = absoluteUrl(`/essays/${article.slug}`);
      const html = toHTML(article.body as PortableTextBlock[], {
        components: feedComponents,
      });
      return `    <item>
      <title>${xml(article.title)}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      <pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>
      <description>${xml(article.excerpt)}</description>
      <dc:creator>${xml(article.author?.name ?? authorName)}</dc:creator>
      <content:encoded><![CDATA[${html.replaceAll("]]>", "]]]]><![CDATA[>")}]]></content:encoded>
      ${article.categories.map((c) => `<category>${xml(c.title)}</category>`).join("\n      ")}
    </item>`;
    })
    .join("\n");

  const lastBuildDate = articles[0]
    ? new Date(articles[0].publishedAt).toUTCString()
    : new Date().toUTCString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xml(siteName)} — Essays</title>
    <link>${xml(siteUrl)}</link>
    <description>${xml(siteDescription)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${xml(absoluteUrl("/feed.xml"))}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}
