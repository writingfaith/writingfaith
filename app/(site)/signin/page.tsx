import type { Metadata } from "next";

import { googleConfigured } from "@/lib/auth";
import { signInWithGoogle } from "@/lib/auth/actions";
import { SignInForm } from "./signin-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to WritingFaith with an email link.",
  robots: { index: false },
};

export default function SignInPage() {
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

        <SignInForm />

        {googleConfigured && (
          <form action={signInWithGoogle} className="mt-8">
            <p className="font-sans text-sm text-ink-faint">or</p>
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
