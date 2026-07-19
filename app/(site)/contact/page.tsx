import type { Metadata } from "next";
import Link from "next/link";

import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the writer behind WritingFaith.",
  alternates: { canonical: "/contact" },
};

/**
 * The public contact address. Deliberately has no fallback: a personal address
 * hardcoded here would sit in the page source inside the `mailto:` href, name
 * and all, however the link is labelled. Set NEXT_PUBLIC_CONTACT_EMAIL to a
 * neutral alias to switch the link on.
 */
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();

export default function ContactPage() {
  return (
    <ProsePage
      eyebrow="Contact"
      title={
        <>
          A note is always <em className="text-accent">welcome</em>.
        </>
      }
    >
      <p>
        Whether an essay helped you, you disagree and want to say why, you’ve
        spotted a mistake, or you simply want to say hello — write any time:
      </p>
      {contactEmail ? (
        <>
          <p>
            <a
              href={`mailto:${contactEmail}`}
              className="link inline-flex min-h-11 items-center"
            >
              Send a message
            </a>
          </p>
          <p>
            Every message is read, though with writing and life alongside,
            replies can take a little while. Thank you for your patience.
          </p>
        </>
      ) : (
        <p>
          A public address is being set up. In the meantime, the{" "}
          <Link href="/feed">newsletter</Link> is the surest way to keep in
          touch — every email can be replied to.
        </p>
      )}
      <h2>A note on pastoral matters</h2>
      <p>
        Emails sometimes arrive carrying heavy things. Please know that while
        each one is read with care, this is a personal writing project — not a
        church, counselling service, or crisis line. If you are in urgent
        distress, please reach out to a local pastor, doctor, or emergency
        service where you live.
      </p>
    </ProsePage>
  );
}
