import type { Metadata } from "next";
import Link from "next/link";

import { EssayBody } from "@/components/portable-text";
import { ProsePage } from "@/components/prose-page";
import { contentTags, sanityFetch } from "@/lib/sanity/fetch";
import { pageBySlugQuery } from "@/lib/sanity/queries";
import type { SitePage } from "@/lib/sanity/types";
import { getSiteSettings } from "@/lib/site-settings";

async function getAboutPage() {
  return sanityFetch<SitePage | null>({
    query: pageBySlugQuery,
    params: { slug: "about" },
    tags: contentTags.page("about"),
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const [page, settings] = await Promise.all([getAboutPage(), getSiteSettings()]);

  return {
    title: page?.title ?? "About",
    description: page?.description ?? settings.tagline,
    alternates: { canonical: "/about" },
  };
}

/**
 * The about page belongs to the author: it renders whatever the Sanity
 * `page` with slug "about" contains, written and edited entirely from the
 * Studio. Until that page exists, a quiet placeholder built from Site
 * Settings stands in — no hardcoded biography lives in the codebase.
 */
export default async function AboutPage() {
  const [page, settings] = await Promise.all([getAboutPage(), getSiteSettings()]);

  if (page) {
    return (
      <ProsePage eyebrow="About" title={page.title}>
        <EssayBody value={page.body} />
      </ProsePage>
    );
  }

  return (
    <ProsePage eyebrow="About" title={settings.siteName}>
      <p>{settings.tagline}</p>
      <p>
        This page is written from the Studio: create a page with the slug{" "}
        <strong>about</strong> under Pages, and whatever is written there
        appears here.
      </p>
      <p>
        In the meantime, the{" "}
        <Link href="/essays" className="link">
          writing
        </Link>{" "}
        and the{" "}
        <Link href="/feed" className="link">
          newsletter
        </Link>{" "}
        are the best places to start.
      </p>
    </ProsePage>
  );
}
