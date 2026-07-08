"use client";

import Image from "next/image";

/**
 * Custom loader: Sanity's CDN does the resizing/format negotiation, so
 * next/image contributes srcset generation and lazy loading without a second
 * optimization pass (ADR 0001 §Additions). This lives in a client module
 * because a loader function cannot cross the server → client prop boundary.
 */
function sanityLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.toString();
}

export function SanityImage({
  src,
  alt,
  width,
  height,
  lqip,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  lqip?: string;
  sizes?: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      loader={sanityLoader}
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      {...(lqip ? { placeholder: "blur" as const, blurDataURL: lqip } : {})}
    />
  );
}
