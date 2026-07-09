import Link from "next/link";
import {
  PortableText,
  type PortableTextBlock,
  type PortableTextComponents,
} from "@portabletext/react";

import { imageDimensions, imageUrl } from "@/lib/sanity/image";
import type { SanityImage as SanityImageValue } from "@/lib/sanity/types";
import { safeContentHref } from "@/lib/security/url";
import { SanityImage } from "./sanity-image";

/**
 * The one shared Portable Text renderer (ADR 0001: single renderer module so
 * site, RSS and email can't drift). Serializers here target the site; other
 * targets add their own component maps against the same block types.
 */
const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => <h2>{children}</h2>,
    h3: ({ children }) => <h3>{children}</h3>,
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    normal: ({ children }) => <p>{children}</p>,
  },
  marks: {
    link: ({ children, value }) => {
      const href = safeContentHref(value?.href);
      if (!href) return <>{children}</>;
      if (href.startsWith("/")) {
        return <Link href={href}>{children}</Link>;
      }
      return (
        <a href={href} rel="noopener noreferrer">
          {children}
        </a>
      );
    },
  },
  types: {
    scripture: ({
      value,
    }: {
      value: { passage?: string; reference?: string; translation?: string };
    }) => (
      <figure className="scripture">
        <blockquote>{value.passage}</blockquote>
        <figcaption>
          {value.reference}
          {value.translation ? (
            <span className="scripture-translation"> ({value.translation})</span>
          ) : null}
        </figcaption>
      </figure>
    ),
    pullQuote: ({ value }: { value: { text?: string } }) => (
      /* Decorative repetition of body text — hidden from assistive tech. */
      <aside className="pull-quote" aria-hidden="true">
        {value.text}
      </aside>
    ),
    image: ({ value }: { value: SanityImageValue }) => {
      const src = imageUrl(value);
      const dimensions = imageDimensions(value);
      if (!src || !dimensions) return null;
      return (
        <figure className="essay-figure">
          <SanityImage
            src={src}
            alt={value.alt ?? ""}
            width={dimensions.width}
            height={dimensions.height}
            lqip={value.asset?.metadata?.lqip}
            sizes="(min-width: 48rem) 42rem, 100vw"
          />
          {value.caption ? <figcaption>{value.caption}</figcaption> : null}
        </figure>
      );
    },
  },
};

export function EssayBody({ value }: { value: PortableTextBlock[] }) {
  return (
    <div className="essay-body">
      <PortableText value={value} components={components} />
    </div>
  );
}
