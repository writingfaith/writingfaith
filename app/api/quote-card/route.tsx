import type { NextRequest } from "next/server";

import { quoteCardImage } from "@/lib/og";
import { allowQuoteCardRequest } from "@/lib/rate-limit";
import { client } from "@/lib/sanity/client";
import { articleTitleBySlugQuery } from "@/lib/sanity/queries";
import { isValidSlug, normalizeQuote } from "@/lib/validate";

/**
 * Renders a shareable card for a passage a reader selects on an essay page
 * (see components/quote-selector.tsx). Public and unauthenticated — same
 * trust level as the essay page itself, since it only ever renders text the
 * caller supplies alongside a title looked up for an already-published
 * essay (the query below is published-only, so a scheduled or draft slug
 * 404s here exactly like it does on the site).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const slug = searchParams.get("slug");
  const quote = normalizeQuote(searchParams.get("q"));

  if (!isValidSlug(slug) || !quote) {
    return new Response("Invalid request", { status: 400 });
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0];
  const principal = (forwardedFor ?? request.headers.get("x-real-ip") ?? "unknown")
    .trim()
    .slice(0, 64);
  if (!(await allowQuoteCardRequest(principal))) {
    return new Response("Too many quote cards — please try again later", {
      status: 429,
      headers: { "Retry-After": "3600", "Cache-Control": "no-store" },
    });
  }

  const article = await client.fetch<{ title: string } | null>(
    articleTitleBySlugQuery,
    { slug },
  );
  if (!article) {
    return new Response("Not found", { status: 404 });
  }

  const image = await quoteCardImage({
    quote,
    essayTitle: article.title,
  });
  image.headers.set(
    "Cache-Control",
    "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
  );
  image.headers.set(
    "Content-Disposition",
    `inline; filename="writing-faith-${slug}.png"`,
  );
  return image;
}
