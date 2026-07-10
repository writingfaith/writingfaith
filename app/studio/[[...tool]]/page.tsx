import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";

import { getOwnerAccess } from "@/lib/auth/owner";
import { Studio } from "./studio";

// Sensible Studio defaults from next-sanity: noindex, same-origin referrer,
// and a viewport that fits the Studio's own layout.
export { metadata, viewport } from "next-sanity/studio";

function StudioAccessMessage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-paper px-6 py-16 text-ink sm:py-24">
      <section className="mx-auto max-w-2xl border-t border-rule pt-10">
        <p className="eyebrow">WritingFaith Studio</p>
        <h1 className="title mt-6">{title}</h1>
        <div className="mt-6 max-w-prose text-ink-muted">{children}</div>
      </section>
    </main>
  );
}

async function StudioGate() {
  await connection();
  const access = await getOwnerAccess();

  if (access.status === "unauthenticated") {
    return (
      <StudioAccessMessage title="Sign in to edit WritingFaith.">
        <p>
          Only the site owner can open the publication editor. Sign in with the
          owner’s email address to manage essays, pages, authors, and
          categories.
        </p>
        <Link href="/signin?redirectTo=/studio" className="btn btn-primary mt-8">
          Sign in
        </Link>
      </StudioAccessMessage>
    );
  }

  if (access.status === "forbidden") {
    return (
      <StudioAccessMessage title="This account cannot edit the site.">
        <p>
          You are signed in, but this Studio is reserved for the site owner.
        </p>
      </StudioAccessMessage>
    );
  }

  return <Studio />;
}

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <StudioAccessMessage title="Opening WritingFaith Studio…">
          <p>Checking owner access before the editor loads.</p>
        </StudioAccessMessage>
      }
    >
      <StudioGate />
    </Suspense>
  );
}
