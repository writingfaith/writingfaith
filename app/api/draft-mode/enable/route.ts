import { defineEnableDraftMode } from "next-sanity/draft-mode";

import { client } from "@/lib/sanity/client";

/**
 * Entry point for the Studio's presentation tool. next-sanity verifies the
 * request comes from an authorized Studio session before enabling Draft Mode.
 * The token is passed lazily (not via getDraftClient) so a missing env var
 * fails at request time with a clear auth error, not at build time.
 */
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token: process.env.SANITY_API_READ_TOKEN }),
});
