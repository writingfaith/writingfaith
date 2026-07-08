import { getResend } from "@/lib/email";

/**
 * Mirrors subscription state into a Resend Audience so broadcasts can be
 * sent from Resend's UI. Postgres remains the system of record (ADR 0001
 * §4); a sync failure is logged, never surfaced to the reader, and retried
 * implicitly on the next state change.
 */
export async function syncContactToResend(
  email: string,
  unsubscribed: boolean,
): Promise<boolean> {
  const audienceId = process.env.RESEND_AUDIENCE_ID;
  if (!audienceId) return false;

  try {
    const resend = getResend();
    const { error } = await resend.contacts.create({
      audienceId,
      email,
      unsubscribed,
    });
    // An already-existing contact is fine — update its status instead.
    if (error) {
      const { error: updateError } = await resend.contacts.update({
        audienceId,
        email,
        unsubscribed,
      });
      if (updateError) throw new Error(updateError.message);
    }
    return true;
  } catch (error) {
    console.error(
      `[newsletter] Failed to sync ${unsubscribed ? "unsubscribe" : "subscribe"} to Resend:`,
      error,
    );
    return false;
  }
}
