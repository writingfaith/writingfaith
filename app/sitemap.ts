import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";

import { client } from "@/lib/sanity/client";
import { scheduledCacheProfile } from "@/lib/sanity/fetch";
import { sitemapQuery } from "@/lib/sanity/queries";
import { absoluteUrl } from "@/lib/site";

interface SitemapContent {
  articles: { slug: string; _updatedAt: string }[];
  categories: { slug: string; _updatedAt: string }[];
}

async function getSitemapContent(): Promise<SitemapContent> {
  "use cache";
  cacheTag("article", "category");
  cacheLife(scheduledCacheProfile);
  return client.fetch<SitemapContent>(sitemapQuery);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { articles, categories } = await getSitemapContent();

  const latest = articles[0]?._updatedAt;

  return [
    {
      url: absoluteUrl("/"),
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/essays"),
      lastModified: latest,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...["/about", "/contact", "/feed", "/privacy", "/terms", "/disclaimer"].map(
      (path) => ({
        url: absoluteUrl(path),
        changeFrequency: "yearly" as const,
        priority: 0.3,
      }),
    ),
    ...articles.map((article) => ({
      url: absoluteUrl(`/essays/${article.slug}`),
      lastModified: article._updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(`/essays/category/${category.slug}`),
      lastModified: category._updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];
}
