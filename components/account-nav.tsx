import Link from "next/link";
import { connection } from "next/server";

import { auth } from "@/lib/auth";

/**
 * Signed-in state for the header. Reads the session (runtime data), so it
 * must always render inside a Suspense boundary — the reading experience
 * keeps its static shell and this link streams in.
 */
export async function AccountNav() {
  await connection();
  const session = await auth();
  const signedIn = Boolean(session?.user);

  return (
    <Link
      href={signedIn ? "/account" : "/signin"}
      className="transition-colors hover:text-ink"
    >
      {signedIn ? "Account" : "Sign in"}
    </Link>
  );
}
