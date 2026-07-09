import type { Metadata } from "next";
import Link from "next/link";

import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms for reading and using WritingFaith.",
  alternates: { canonical: "/terms" },
};

/* LEGAL REVIEW REQUIRED: governing law / jurisdiction clause is left
   deliberately generic and should be completed by a qualified professional
   before launch. */

export default function TermsPage() {
  return (
    <ProsePage eyebrow="Terms of use" title="The terms, in plain language." updated="8 July 2026">
      <p>
        By reading WritingFaith you agree to these terms. They are short,
        because a reading site shouldn’t need more.
      </p>

      <h2>Copyright</h2>
      <p>
        All essays and original content on this site are © Veruschka Pestano,
        all rights reserved. You’re warmly encouraged to share links, quote
        brief excerpts with attribution, and read aloud to whomever will
        listen. Republishing whole essays, commercially reusing content, or
        training AI systems on it requires written permission — please{" "}
        <Link href="/contact">ask</Link>; the answer is often yes.
      </p>
      <p>
        Scripture quotations are drawn from published Bible translations,
        which remain the property of their respective copyright holders and
        are used according to their quotation policies.
      </p>

      <h2>The newsletter</h2>
      <p>
        The newsletter is free. You agree to use your own email address and
        not to abuse the subscription forms. We may remove subscriptions used
        abusively. You can leave at any time — every email unsubscribes with
        one click, and you can ask for your data to be deleted.
      </p>

      <h2>The content is offered as-is</h2>
      <p>
        Essays here are personal reflections, offered in good faith but
        without warranties of any kind. See the{" "}
        <Link href="/disclaimer">disclaimer</Link> — it is part of these
        terms. To the fullest extent permitted by law, the author accepts no
        liability for decisions made on the basis of what you read here.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may be revised as the site grows (for instance, if
        memberships or comments arrive one day). The “last updated” date above
        will always tell you when. Continued use after a change means you
        accept the revised terms.
      </p>
    </ProsePage>
  );
}
