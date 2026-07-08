import { cacheLife } from "next/cache";
import Link from "next/link";

import { Ornament } from "@/components/ornaments";

const explore = [
  { href: "/essays", label: "Essays" },
  { href: "/search", label: "Search" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/feed", label: "Newsletter" },
];

const trust = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
];

export async function SiteFooter() {
  "use cache";
  cacheLife("days");

  return (
    <footer className="mt-auto border-t border-rule">
      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="max-w-xs">
            <p className="font-serif text-lg tracking-tight text-ink">
              Writing<span className="italic text-accent">Faith</span>
            </p>
            <p className="mt-3 font-sans text-sm leading-relaxed text-ink-faint">
              Independent essays on Christian faith by Veruschka Pestano —
              scripture, doubt, hope, and grace, explored with honesty and
              care.
            </p>
          </div>
          <nav aria-label="Footer" className="flex gap-16">
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
        <div className="mt-6 flex flex-col items-center gap-4 font-sans text-sm text-ink-faint sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} WritingFaith. All rights reserved.</p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {[
                { href: "/privacy", label: "Privacy Policy" },
                { href: "/terms", label: "Terms of Service" },
                { href: "/disclaimer", label: "Disclaimer" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-ink-faint no-underline transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}
