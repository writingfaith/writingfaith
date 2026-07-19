import { Resend } from "resend";

/** Sender identity for all transactional mail. */
export const emailFrom =
  process.env.EMAIL_FROM ?? "WritingFaith <onboarding@resend.dev>";

/** Where "new subscriber" notifications are sent, if configured. */
export const newsletterNotifyEmail =
  process.env.NEWSLETTER_NOTIFY_EMAIL?.trim() || undefined;

let _resend: Resend | null = null;

/** Lazy client so module evaluation never depends on env configuration. */
export function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Email sending requires it — see docs/readers-setup.md.",
    );
  }
  _resend ??= new Resend(apiKey);
  return _resend;
}
