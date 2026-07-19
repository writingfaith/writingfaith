import Link from "next/link";

/**
 * Server-rendered account state. The redundant form is never emitted for an
 * active subscriber, preventing prompt flashes and hydration-dependent UI.
 */
export function NewsletterSubscribedNotice({
  email,
  centered,
}: {
  email: string;
  centered?: boolean;
}) {
  return (
    <div className={`${centered ? "mx-auto" : ""} newsletter-account-note mt-8 max-w-md`}>
      <p className="leading-relaxed text-ink-muted">
        You’re already subscribed as{" "}
        <span className="font-medium text-accent-strong">{email}</span> — new
        essays will arrive in that inbox.
      </p>
      <p className="form-help mt-3">
        Every email includes a one-click unsubscribe link. You can also{" "}
        <Link href="/account" className="link">
          manage your account
        </Link>
        .
      </p>
    </div>
  );
}
