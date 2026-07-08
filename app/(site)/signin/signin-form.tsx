"use client";

import { useActionState } from "react";

import { signInWithEmail, type SignInState } from "@/lib/auth/actions";

const initialState: SignInState = {};

export function SignInForm() {
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
      <div className="mt-3 flex max-w-xl gap-3">
        <input
          id="signin-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="field"
        />
        <button type="submit" disabled={pending} className="btn btn-primary shrink-0">
          {pending ? "Sending…" : "Email me a link"}
        </button>
      </div>
      <p
        aria-live="polite"
        role={state.error ? "alert" : undefined}
        className="mt-4 min-h-5 font-sans text-sm text-ink-muted"
      >
        {state.error}
      </p>
    </form>
  );
}
