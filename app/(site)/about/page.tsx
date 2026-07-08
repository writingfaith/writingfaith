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
          Faith, examined honestly and{" "}
          <em className="text-accent">written well</em>.
        </>
      }
    >
      <p>
        WritingFaith is the home of Veruschka Pestano’s writing — long-form
        essays on Christian faith: scripture, doubt, hope, prayer, and the
        ordinary places where belief is actually lived.
      </p>
      <p>
        Each essay is researched, considered, and edited before it is
        published. There are no hot takes here, no pop-ups, no tracking, and
        no engagement bait — just carefully made writing, presented the way
        long-form deserves to be read.
      </p>
      <h2>What to expect</h2>
      <p>
        Essays fall broadly into three kinds: close readings of scripture,
        honest explorations of doubt and difficulty, and reflections on faith
        in ordinary life. New essays are published as they are ready rather
        than on a content schedule — quality over cadence.
      </p>
      <h2>How to follow</h2>
      <p>
        The simplest way is the free email newsletter: one email when a new
        essay is published, with a one-click unsubscribe in every message. If
        you prefer a feed reader, a full-content RSS feed is available. Both
        are explained on the follow page.
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
