import { defineEnableDraftMode } from "next-sanity/draft-mode";
import type { NextRequest } from "next/server";

import { getOwnerAccess } from "@/lib/auth/owner";
import { client } from "@/lib/sanity/client";

/**
 * Entry point for the Studio's presentation tool. next-sanity verifies the
 * request comes from an authorized Studio session before enabling Draft Mode.
 * The token is passed lazily (not via getDraftClient) so a missing env var
 * fails at request time with a clear auth error, not at build time.
 */
const draftModeHandler = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});

export async function GET(request: NextRequest) {
  const access = await getOwnerAccess();
  if (access.status !== "authorized") {
    return Response.json(
      { error: "Studio draft preview is restricted to the site owner." },
      { status: access.status === "unauthenticated" ? 401 : 403 },
    );
  }

  return draftModeHandler.GET(request);
}
