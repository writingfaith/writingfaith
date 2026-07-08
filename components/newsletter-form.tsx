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
    <form action={formAction} className={centered ? "mx-auto mt-8 max-w-md" : "mt-8 max-w-md"}>
      <label
        htmlFor="newsletter-email"
        className={`block font-sans text-sm text-ink-muted ${centered ? "sr-only" : ""}`}
      >
        Email address
      </label>
      <div className={`flex gap-3 ${centered ? "" : "mt-3"}`}>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="field"
        />
        {/* Honeypot: hidden from people (and assistive tech), tempting to bots. */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <button type="submit" disabled={pending} className="btn btn-primary shrink-0">
          {pending ? "Sending…" : "Subscribe"}
        </button>
      </div>
      <p
        aria-live="polite"
        className={`mt-4 min-h-5 font-sans text-sm ${state.ok ? "text-accent-strong" : "text-ink-muted"}`}
      >
        {state.message}
      </p>
    </form>
  );
}
