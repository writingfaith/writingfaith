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
          Sign in
        </h1>
        <p className="title mt-6 max-w-[30ch]">
          No passwords here — we’ll email you a link.
        </p>
        <p className="mt-6 max-w-prose text-ink-muted">
          Enter your email address and we’ll send a one-time sign-in link.
          A free account lets you manage your newsletter subscription.
        </p>
        <p className="mt-3 max-w-prose font-sans text-sm text-ink-faint">
          Just want new essays by email? You don’t need an account —{" "}
          <Link href="/feed" className="link">
            join the newsletter
          </Link>
          .
        </p>
        {isStudioSignIn && (
          <p className="mt-4 max-w-prose border-l border-accent px-4 font-sans text-sm text-ink-muted">
            Studio access is limited to Veruschka Pestano. Sign in with{" "}
            <span className="font-semibold text-ink">
              veruschkapestano@gmail.com
            </span>{" "}
            to edit the publication.
          </p>
        )}

        <SignInForm redirectTo={redirectTo} />

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
