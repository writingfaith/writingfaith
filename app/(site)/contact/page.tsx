import type { Metadata } from "next";

import { ProsePage } from "@/components/prose-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Veruschka Pestano, the author of WritingFaith.",
  alternates: { canonical: "/contact" },
};

const contactEmail = "veruschkapestano@gmail.com";

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
      <p>
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </p>
      <p>
        Every message is read, though with writing and life alongside, replies
        can take a little while. Thank you for your patience.
      </p>
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
