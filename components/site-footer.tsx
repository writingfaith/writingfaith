import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { Ornament } from "@/components/ornaments";
import { getSiteSettings, type FontTheme } from "@/lib/site-settings";

/** Display names for the colophon, keyed by the Studio-selectable serif. */
const SERIF_NAMES: Record<FontTheme, string> = {
  newsreader: "Newsreader",
  literata: "Literata",
  garamond: "EB Garamond",
  "source-serif": "Source Serif 4",
};

const trust = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export async function SiteFooter() {
  "use cache";
  cacheLife("days");
  // Settings edits must reach the footer immediately, not after a day.
  cacheTag("siteSettings");

  const settings = await getSiteSettings();

  const explore = [
    { href: "/essays", label: settings.postPluralTitle },
    { href: "/search", label: settings.searchLabel },
    { href: "/about", label: settings.aboutLabel },
    { href: "/contact", label: "Contact" },
    { href: "/feed", label: "Newsletter" },
    { href: "/account", label: "Account" },
  ];

  return (
    <footer className="mt-auto border-t border-rule">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-xs">
            <p className="font-serif text-lg tracking-tight text-ink">
              <BrandMark name={settings.siteName} />
            </p>
            <p className="mt-3 font-sans text-sm leading-relaxed text-ink-faint">
              {settings.footerBlurb}
            </p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-12 gap-y-8 sm:gap-x-16">
            <div>
              <p className="eyebrow text-xs">Read</p>
              <ul className="mt-4 space-y-2.5 font-sans text-sm">
                {explore.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-ink-muted no-underline transition-colors hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-xs">Site</p>
              <ul className="mt-4 space-y-2.5 font-sans text-sm">
                {trust.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-ink-muted no-underline transition-colors hover:text-ink"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/feed"
                    className="text-ink-muted no-underline transition-colors hover:text-ink"
                  >
                    RSS feed
                  </Link>
                </li>
              </ul>
            </div>
          </nav>
        </div>
        <Ornament className="mt-12" />
        <div className="mt-6 flex flex-col items-center gap-2 text-center font-sans text-sm text-ink-faint sm:flex-row sm:justify-between sm:text-left">
          <p>
            © {new Date().getFullYear()} {settings.siteName}. All rights
            reserved.
          </p>
          {/* Colophon: the closing line of a well-made book. */}
          <p>
            Set in {SERIF_NAMES[settings.fontTheme]} &amp; Instrument Sans ·{" "}
            <span lang="la" className="italic">
              Soli Deo Gloria
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
