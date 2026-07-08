import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { absoluteUrl, siteName } from "@/lib/site";

/**
 * Metadata shared by all public pages. Declared here rather than in the root
 * layout because `alternates` forces dynamic metadata on dynamic-param
 * routes, which would break /studio prerendering under Cache Components.
 */
export const metadata: Metadata = {
  alternates: {
    types: {
      "application/rss+xml": [
        { url: absoluteUrl("/feed.xml"), title: `${siteName} — Essays` },
      ],
    },
  },
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:bg-paper-raised focus:px-4 focus:py-2 focus:font-sans focus:text-sm"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="content" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </>
  );
}
