"use client";

import Link from "next/link";

/** Route error boundary, styled to match the rest of the site. */
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="py-20 sm:py-28">
        <p className="eyebrow">
          Something went wrong
        </p>
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
            className="text-accent-strong underline underline-offset-4 transition-colors hover:text-ink"
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
    </div>
  );
}
