import Link from "next/link";
import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Page not found",
};

/**
 * Rendered outside the (site) layout group, so it carries its own masthead
 * and footer — a wrong turn should still land the reader somewhere that
 * looks and navigates like the rest of the publication.
 */
export default async function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6">
        <section className="py-20 sm:py-28">
          <p className="eyebrow">Page not found</p>
          <h1 className="title mt-6 max-w-[26ch]">
            This page seems to have <em className="text-accent">wandered off</em>.
          </h1>
          <p className="mt-8 max-w-prose text-ink-muted">
            The page you were looking for doesn’t exist, or may have moved.
          </p>
          <p className="mt-4 font-sans text-sm">
            <Link
              href="/"
              className="text-accent-strong underline underline-offset-4 transition-colors hover:text-ink"
            >
              Return to the home page
            </Link>
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
