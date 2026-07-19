import type { Metadata } from "next";
import {
  EB_Garamond,
  Instrument_Sans,
  Literata,
  Newsreader,
  Source_Serif_4,
} from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { Suspense } from "react";
import { DraftModeBanner } from "@/components/draft-mode-banner";
import { getThemeSettings } from "@/lib/site-settings";
import { siteDescription, siteName, siteTitle, siteUrl } from "@/lib/site";
import "./globals.css";

/**
 * The four serif voices selectable from Studio → Site Settings → Design.
 * Only the default (Newsreader) is preloaded; the others declare their
 * @font-face and download only when the chosen theme actually uses them.
 */
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  // Optical size axis: true display cuts for headlines, text cuts for body.
  axes: ["opsz"],
});

const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  preload: false,
});

const ebGaramond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  style: ["normal", "italic"],
  preload: false,
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  preload: false,
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    siteName,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
  },
};

async function DraftModeTools() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;

  return (
    <>
      <DraftModeBanner />
      <VisualEditing />
    </>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Published-only and cached: keeps the shell prerenderable while letting
  // the owner change the site's typeface and accent from the Studio.
  const theme = await getThemeSettings();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      data-font={theme.fontTheme}
      data-accent={theme.accentTheme}
      className={`${newsreader.variable} ${literata.variable} ${ebGaramond.variable} ${sourceSerif.variable} ${instrumentSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Suspense fallback={null}>
          <DraftModeTools />
        </Suspense>
      </body>
    </html>
  );
}
