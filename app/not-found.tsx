import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found",
};

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="py-20 sm:py-28">
        <p className="font-sans text-sm uppercase tracking-[0.2em] text-ink-faint">
          Page not found
        </p>
        <h1 className="mt-6 max-w-[26ch] text-balance font-serif text-4xl leading-tight tracking-tight sm:text-5xl">
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
    </div>
  );
}
