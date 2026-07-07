import type { Metadata } from "next";
import { Newsreader, Instrument_Sans } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WritingFaith — Essays on faith by Veruschka Pestano",
    template: "%s — WritingFaith",
  },
  description:
    "Thoughtful long-form essays on Christian faith, hope, and everyday life, written by Veruschka Pestano.",
};

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
      </body>
    </html>
  );
}
