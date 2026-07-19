"use client";

import { useActionState } from "react";

import {
  manageAccountNewsletter,
  type AccountNewsletterState,
} from "@/lib/newsletter/actions";
import type { NewsletterStatus } from "@/lib/newsletter/account";

export function AccountNewsletterControl({
  initialStatus,
  initialSyncedToResend,
}: {
  initialStatus: NewsletterStatus | null;
  initialSyncedToResend: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    manageAccountNewsletter,
    {} satisfies AccountNewsletterState,
  );
  const status = state.status ?? initialStatus;
  const syncedToResend =
    state.syncedToResend ?? initialSyncedToResend;
  const subscribed = status === "subscribed";

  return (
    <form action={formAction} className="account-actions">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {!subscribed && (
          <button
            type="submit"
            name="intent"
            value="subscribe"
            disabled={pending}
            className="btn btn-primary"
          >
            {pending ? "Updating…" : "Subscribe to new essays"}
          </button>
        )}
        {subscribed && !syncedToResend && (
          <button
            type="submit"
            name="intent"
            value="subscribe"
            disabled={pending}
            className="btn btn-primary"
          >
            {pending ? "Synchronizing…" : "Retry delivery sync"}
          </button>
        )}
        {subscribed && (
          <button
            type="submit"
            name="intent"
            value="unsubscribe"
            disabled={pending}
            className="btn"
          >
            {pending ? "Updating…" : "Unsubscribe"}
          </button>
        )}
      </div>
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
