import type { Metadata } from "next";
import { Newsreader, Instrument_Sans } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity/visual-editing";
import { Suspense } from "react";
import { DraftModeBanner } from "@/components/draft-mode-banner";
import { siteDescription, siteName, siteTitle, siteUrl } from "@/lib/site";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
  // Optical size axis: true display cuts for headlines, text cuts for body.
  axes: ["opsz"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${instrumentSans.variable} h-full antialiased`}
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
