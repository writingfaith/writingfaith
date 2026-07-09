"use client";

import { useActionState } from "react";

import {
  subscribeToNewsletter,
  type SubscribeState,
} from "@/lib/newsletter/actions";

const initialState: SubscribeState = {};

export function NewsletterForm({ centered = false }: { centered?: boolean }) {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
    initialState,
  );

  return (
    <form
      action={formAction}
      className={`${centered ? "mx-auto" : ""} mt-8 max-w-md text-left`}
    >
      <label
        htmlFor="newsletter-email"
        className="block font-sans text-sm font-medium text-ink-muted"
      >
        Email address
      </label>
      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          aria-describedby="newsletter-help"
          className="field"
        />
        {/* Honeypot: hidden from people (and assistive tech), tempting to bots. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          hidden
          className="hidden"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary w-full shrink-0 sm:w-auto"
        >
          {pending ? "Sending…" : "Subscribe"}
        </button>
      </div>
      <p id="newsletter-help" className="form-help mt-2.5">
        Free, no spam. Unsubscribe anytime with one click.
      </p>
      <div aria-live="polite">
        {state.message && (
          <p
            className={`form-msg ${state.ok ? "form-msg--success" : "form-msg--error"}`}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
