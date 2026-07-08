import type { Metadata } from "next";

import { EssayBody } from "@/components/portable-text";
import { ProsePage } from "@/components/prose-page";
import { contentTags, sanityFetch } from "@/lib/sanity/fetch";
import { pageBySlugQuery } from "@/lib/sanity/queries";
import type { SitePage } from "@/lib/sanity/types";

export const metadata: Metadata = {
  title: "About",
  description:
    "About WritingFaith and its author, Veruschka Pestano — why these essays exist and what they hope to offer.",
  alternates: { canonical: "/about" },
};

/**
 * The about page is author-editable: if a Sanity `page` with slug "about"
 * exists it is rendered; otherwise this crafted default appears. Veruschka
 * can take ownership of the copy from the Studio at any time.
 */
export default async function AboutPage() {
  const page = await sanityFetch<SitePage | null>({
    query: pageBySlugQuery,
    params: { slug: "about" },
    tags: contentTags.page("about"),
  });

  if (page) {
    return (
      <ProsePage eyebrow="About" title={page.title}>
        <EssayBody value={page.body} />
      </ProsePage>
    );
  }

  return (
    <ProsePage
      eyebrow="About"
      title={
        <>
          Written slowly, <em className="text-accent">for reading slowly</em>.
        </>
      }
    >
      <p>
        WritingFaith is the home of Veruschka Pestano’s writing — long-form
        essays on Christian faith: scripture, doubt, hope, prayer, and the
        ordinary places where belief is actually lived.
      </p>
      <p>
        These are not hot takes. Each essay is written slowly and meant to be
        read the same way — which is why this site has no feeds to refresh, no
        pop-ups, no tracking, and nothing that blinks. Just words, set with
        care, in a room with good light.
      </p>
      <p>
        Essays here come from one person’s walk of faith. They are offered as
        reflections, not pronouncements — you may read from a different
        tradition, or from no tradition at all, and you are welcome either
        way.
      </p>
      <p>
        If you’d like new essays by email, there’s a quiet newsletter — one
        email per essay, nothing else. And if something here helped you, or
        you simply want to say hello, the contact page is always open.
      </p>
    </ProsePage>
  );
}
