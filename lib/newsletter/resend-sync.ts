import { getResend } from "@/lib/email";

/**
 * Mirrors subscription state into a Resend Segment so broadcasts can be sent
 * from Resend's UI. Postgres remains the system of record (ADR 0001 §4); a
 * sync failure is logged, never surfaced to the reader, and retried
 * implicitly on the next state change.
 *
 * Resend replaced Audiences with Segments (an account-level migration, not
 * an SDK version bump); `contacts.create({ audienceId })` is the deprecated
 * shape and — on an account that's fully migrated — creates the contact
 * without ever linking it to anything a broadcast can target. `segments`
 * (create) and `contacts.segments.add` (existing contact) are the
 * equivalents that actually work. RESEND_AUDIENCE_ID keeps its historical
 * name to avoid an unnecessary env var rename; its value is a segment id.
 */
export async function syncContactToResend(
  email: string,
  unsubscribed: boolean,
): Promise<boolean> {
  const segmentId = process.env.RESEND_AUDIENCE_ID;
  if (!segmentId) return false;

  try {
    const resend = getResend();
    const { error } = await resend.contacts.create({
      email,
      unsubscribed,
      segments: [{ id: segmentId }],
    });
    // An already-existing contact is fine — update its status, then ensure
    // segment membership explicitly (contacts.update has no segments param).
    if (error) {
      const { error: updateError } = await resend.contacts.update({
        email,
        unsubscribed,
      });
      if (updateError) throw new Error(updateError.message);
      const { error: segmentError } = await resend.contacts.segments.add({
        email,
        segmentId,
      });
      if (segmentError) throw new Error(segmentError.message);
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
