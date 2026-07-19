import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { googleConfigured } from "@/lib/auth";
import { signInWithGoogle } from "@/lib/auth/actions";
import { safeRedirectPath } from "@/lib/auth/owner";
import { SignInForm } from "./signin-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to WritingFaith with an email link.",
  robots: { index: false },
};

async function SignInPageContent({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string | string[] }>;
}) {
  const params = await searchParams;
  const redirectTo = safeRedirectPath(params.redirectTo);
  const isStudioSignIn = redirectTo.startsWith("/studio");

  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="py-16 sm:py-20">
        <h1 className="eyebrow">
          {isStudioSignIn ? "Editor sign in" : "Reader sign in"}
        </h1>
        <p className="title mt-6 max-w-[30ch]">
          No passwords here — we’ll email you a link.
        </p>
        <p className="mt-6 max-w-prose text-ink-muted">
          {isStudioSignIn
            ? "Enter the owner email address and we’ll send a one-time link to the publication Studio."
            : "Sign in to manage your reader account and receive each new essay in the same inbox."}
        </p>
        {isStudioSignIn && (
          <p className="mt-5 max-w-prose border border-rule bg-vellum px-4 py-3 font-sans text-sm text-ink-muted">
            Studio access is limited to the site owner. Sign in with the
            owner email to edit the publication.
          </p>
        )}

        <SignInForm redirectTo={redirectTo} />

        <p className="mt-4 max-w-xl font-sans text-xs leading-relaxed text-ink-faint">
          Continuing creates your free reader account and subscribes it to new
          essays. You can unsubscribe at any time from your account or any
          email. Prefer RSS?{" "}
          <Link href="/feed" className="link">
            Follow without email
          </Link>
          .
        </p>

        {googleConfigured && (
          <form action={signInWithGoogle} className="mt-8">
            <p className="font-sans text-sm text-ink-faint">or</p>
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <button
              type="submit"
              className="btn mt-3"
            >
              Continue with Google
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string | string[] }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl px-6">
          <section className="py-16 sm:py-20">
            <h1 className="eyebrow">Sign in</h1>
          </section>
        </div>
      }
    >
      <SignInPageContent searchParams={searchParams} />
    </Suspense>
  );
}
