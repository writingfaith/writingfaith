"use client";

import { useActionState } from "react";

import { signInWithEmail, type SignInState } from "@/lib/auth/actions";

const initialState: SignInState = {};

export function SignInForm({ redirectTo = "/studio" }: { redirectTo?: string }) {
  const [state, formAction, pending] = useActionState(
    signInWithEmail,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8">
      <label
        htmlFor="signin-email"
        className="block font-sans text-sm text-ink-muted"
      >
        Email address
      </label>
      <div className="mt-3 flex max-w-xl flex-col gap-3 sm:flex-row">
        <input
          id="signin-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="field"
        />
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <button type="submit" disabled={pending} className="btn btn-primary w-full shrink-0 sm:w-auto">
          {pending ? "Sending…" : "Email me a link"}
        </button>
      </div>
      <div aria-live="polite" className="max-w-xl">
        {state.error && (
          <p role="alert" className="form-msg form-msg--error">
            {state.error}
          </p>
        )}
      </div>
    </form>
  );
}
