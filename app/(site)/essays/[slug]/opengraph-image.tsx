import { brandImage, OG_SIZE } from "@/lib/og";
import { contentTags, sanityFetchPublished } from "@/lib/sanity/fetch";
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
  return sanityFetchPublished<OgArticle | null>({
    query: articleOgQuery,
    params: { slug },
    tags: contentTags.article(slug),
    timed: true,
  });
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
    detail: article ? formatDate(article.publishedAt) : undefined,
  });
}
