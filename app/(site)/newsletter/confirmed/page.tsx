import type { Metadata } from "next";

import { StatusPage } from "@/components/status-page";

export const metadata: Metadata = {
  title: "Subscription confirmed",
  robots: { index: false },
};

export default function ConfirmedPage() {
  return (
    <StatusPage
      eyebrow="Newsletter"
      title={
        <>
          You’re subscribed. <em className="text-accent">Welcome.</em>
        </>
      }
    >
      <p>
        New essays will arrive in your inbox as they’re published. Every email
        includes a one-click unsubscribe link, should you ever want to leave.
      </p>
    </StatusPage>
  );
}
