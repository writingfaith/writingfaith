import type { Metadata } from "next";

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
  return children;
}
