"use client";

import { useEffect, useRef } from "react";

/**
 * Progressive enhancement for signed-in subscribers: shows which address
 * receives essays and hides the (redundant) subscribe form next to it.
 * The form itself stays in the static shell and is never gated on this
 * component — if streaming or hydration of this segment ever fails, the
 * worst case is a subscriber seeing a form they don't need, never an
 * anonymous reader losing the ability to subscribe.
 */
export function NewsletterSubscribedNotice({
  email,
  centered,
}: {
  email: string;
  centered?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = ref.current?.parentElement;
    const form = section?.querySelector("form");
    if (!form) return;
    form.hidden = true;
    return () => {
      form.hidden = false;
    };
  }, []);

  return (
    <div ref={ref} className={`${centered ? "mx-auto" : ""} mt-8 max-w-md`}>
      <p className="leading-relaxed text-ink-muted">
        You’re already subscribed as{" "}
        <span className="font-medium text-accent-strong">{email}</span> — new
        essays will arrive in that inbox.
      </p>
      <p className="form-help mt-2.5">
        Every email includes a one-click unsubscribe link.
      </p>
    </div>
  );
}
