import type { Metadata } from "next";

import { StatusPage } from "@/components/status-page";

export const metadata: Metadata = {
  title: "Link no longer valid",
  robots: { index: false },
};

export default function InvalidPage() {
  return (
    <StatusPage eyebrow="Newsletter" title="This link is no longer valid.">
      <p>
        The link may have expired or already been used. If you were trying to
        subscribe, enter your email again on the home page and we’ll send a
        fresh confirmation.
      </p>
    </StatusPage>
  );
}
