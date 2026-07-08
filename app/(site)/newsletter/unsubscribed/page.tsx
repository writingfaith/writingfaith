import type { Metadata } from "next";

import { StatusPage } from "@/components/status-page";

export const metadata: Metadata = {
  title: "Unsubscribed",
  robots: { index: false },
};

export default function UnsubscribedPage() {
  return (
    <StatusPage eyebrow="Newsletter" title="You’ve been unsubscribed.">
      <p>
        You won’t receive any more emails from WritingFaith. The essays remain
        here whenever you’d like to read — and you can subscribe again any
        time.
      </p>
    </StatusPage>
  );
}
