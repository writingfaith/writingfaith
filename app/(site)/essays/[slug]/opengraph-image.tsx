import { cacheLife, cacheTag } from "next/cache";

import { brandImage, OG_SIZE } from "@/lib/og";
import { client } from "@/lib/sanity/client";
import { articleOgQuery } from "@/lib/sanity/queries";
import { formatDate } from "@/lib/format";

export const alt = "Essay — WritingFaith";
export const size = OG_SIZE;
export const contentType = "image/png";

interface OgArticle {
  title: string;
  publishedAt: string;
  author?: string;
}

async function getOgArticle(slug: string): Promise<OgArticle | null> {
  "use cache";
  cacheTag("article", `article:${slug}`);
  cacheLife("max");
  return client.fetch<OgArticle | null>(articleOgQuery, { slug });
}

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getOgArticle(slug);

  return brandImage({
    eyebrow: "An essay on faith",
    title: article?.title ?? "WritingFaith",
    detail: article
      ? [article.author, formatDate(article.publishedAt)]
          .filter(Boolean)
          .join(" · ")
      : undefined,
  });
}
