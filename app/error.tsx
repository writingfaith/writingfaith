"use client";

import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { siteName } from "@/lib/site";

/**
 * Route error boundary. Client components cannot fetch Studio settings, so
 * the masthead here is a quiet static echo of the real one — enough that a
 * failed page still looks and navigates like the publication.
 */
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <>
      <header className="masthead">
        <div className="mx-auto flex max-w-4xl flex-col items-center px-6 pb-5 pt-8 sm:pt-10">
          <Link
            href="/"
            className="font-serif text-[1.9rem] tracking-tight text-ink no-underline sm:text-[2.2rem]"
          >
            <BrandMark name={siteName} />
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-6">
        <section className="py-20 sm:py-28">
          <p className="eyebrow">Something went wrong</p>
          <h1 className="title mt-6 max-w-[26ch]">
            We couldn’t load this page.
          </h1>
          <p className="mt-8 max-w-prose text-ink-muted">
            An unexpected error occurred. It has been noted — please try again.
          </p>
          <p className="mt-6 flex gap-6 font-sans text-sm">
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer text-accent-strong underline underline-offset-4 transition-colors hover:text-ink"
            >
              Try again
            </button>
            <Link
              href="/"
              className="text-accent-strong underline underline-offset-4 transition-colors hover:text-ink"
            >
              Return home
            </Link>
          </p>
        </section>
      </main>
    </>
  );
}
