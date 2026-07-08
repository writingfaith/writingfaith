import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId, studioBasePath } from "@/sanity/env";

/**
 * Read-only client for published content. Served from Sanity's CDN; results
 * are cached by the app's `use cache` layer and invalidated by webhook.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: { enabled: false, studioUrl: studioBasePath },
});

/**
 * Client for draft-mode preview: uncached, sees draft documents, and encodes
 * stega metadata so the presentation tool can offer click-to-edit overlays.
 * Requires a Viewer token (`SANITY_API_READ_TOKEN`).
 */
export function getDraftClient() {
  const token = process.env.SANITY_API_READ_TOKEN;
  if (!token) {
    throw new Error(
      "SANITY_API_READ_TOKEN is not set. Draft preview requires a Viewer token — see docs/sanity-setup.md.",
    );
  }
  return client.withConfig({
    token,
    useCdn: false,
    perspective: "drafts",
    stega: { enabled: true, studioUrl: studioBasePath },
  });
}
