import type { Metadata } from "next";
import Link from "next/link";

import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "What the essays on WritingFaith are — and what they are not.",
  alternates: { canonical: "/disclaimer" },
};

export default function DisclaimerPage() {
  return (
    <ProsePage
      eyebrow="Disclaimer"
      title={
        <>
          These are reflections, <em className="text-accent">not rulings</em>.
        </>
      }
      updated="8 July 2026"
    >
      <p>
        Everything published on WritingFaith is personal writing: one
        Christian’s essays, reflections, and opinions. It’s worth being clear
        about what that does and doesn’t mean.
      </p>

      <h2>Personal views</h2>
      <p>
        The essays represent the personal views of their author at the time of
        writing. They do not speak for any church, denomination, ministry, or
        organisation, and they are not statements of official doctrine.
        Thoughtful people of deep faith disagree on many of the subjects
        written about here.
      </p>

      <h2>On scripture</h2>
      <p>
        Where essays engage with the Bible, they offer one reader’s
        interpretation, shaped by a particular tradition and study.
        Interpretation of scripture varies — sometimes considerably — between
        Christian traditions. Nothing here should replace reading scripture
        yourself, prayer, and the counsel of your own church community.
        Readers are encouraged, in the oldest sense of the word, to use
        discernment.
      </p>

      <h2>Not professional advice</h2>
      <p>
        Nothing on this site is professional advice of any kind — not medical,
        psychological, legal, financial, or otherwise. Essays may touch on
        suffering, grief, mental health, money, or family life, because faith
        touches those things; but if you are facing a decision in any of those
        areas, please consult a qualified professional who knows your
        situation. If you are in crisis, contact local emergency services or a
        crisis line where you live.
      </p>

      <h2>Accuracy and change</h2>
      <p>
        Care is taken with facts, quotations, and citations, but mistakes
        happen and views mature. Essays reflect their publication date and may
        not be updated as the author’s understanding grows. Corrections are
        welcome — <Link href="/contact">write in</Link>.
      </p>
    </ProsePage>
  );
}
