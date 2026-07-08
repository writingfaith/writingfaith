import { createImageUrlBuilder } from "@sanity/image-url";

import { dataset, projectId } from "@/sanity/env";
import type { SanityImage } from "./types";

const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * Base CDN URL for an image, honoring the editor's crop and hotspot.
 * Width/quality/format are appended per-rendered-size by the `next/image`
 * loader in `components/sanity-image.tsx` — one optimization pipeline,
 * no double-processing (ADR 0001 §Additions).
 */
export function imageUrl(image: SanityImage): string | null {
  if (!image.asset) return null;
  return builder.image(image).url();
}

/** Intrinsic dimensions for layout stability (CLS). */
export function imageDimensions(image: SanityImage) {
  return image.asset?.metadata?.dimensions ?? null;
}
