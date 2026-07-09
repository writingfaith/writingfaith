import Link from "next/link";
import { Suspense } from "react";

import { AccountNav } from "@/components/account-nav";
import { NavLink } from "@/components/nav-link";

const navigation: Array<{ href: string; label: string }> = [
  { href: "/essays", label: "Essays" },
  { href: "/about", label: "About" },
  { href: "/search", label: "Search" },
];

/**
 * A centered literary masthead: the publication's name set as an object,
 * navigation beneath it, closed by the double hairline rule that journals
 * have used for two centuries.
 */
export function SiteHeader() {
  return (
    <header className="masthead">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 pb-5 pt-8 sm:pt-10">
        <Link
          href="/"
          className="font-serif text-[1.9rem] tracking-tight text-ink no-underline sm:text-[2.2rem]"
        >
          Writing<span className="italic text-accent">Faith</span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap items-baseline justify-center gap-x-7 gap-y-2 font-sans text-[0.8125rem] uppercase tracking-[0.16em] text-ink-muted [&_a]:whitespace-nowrap">
            {navigation.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
            <li>
              {/* Session state streams in; the static shell shows "Sign in". */}
              <Suspense
                fallback={
                  <Link href="/signin" className="nav-link">
                    Sign in
                  </Link>
                }
              >
                <AccountNav />
              </Suspense>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
