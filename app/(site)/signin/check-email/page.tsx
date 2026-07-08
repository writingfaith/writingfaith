import type { Metadata } from "next";

import { StatusPage } from "@/components/status-page";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false },
};

export default function CheckEmailPage() {
  return (
    <StatusPage
      eyebrow="Sign in"
      title={
        <>
          Check your inbox — your <em className="text-accent">sign-in link</em>{" "}
          is on its way.
        </>
      }
    >
      <p>
        We’ve sent a one-time link to your email address. It’s valid for 24
        hours and can be used once. You can close this page.
      </p>
    </StatusPage>
  );
}
