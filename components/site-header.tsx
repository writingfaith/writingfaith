import Link from "next/link";
import { Suspense } from "react";

import { AccountNav } from "@/components/account-nav";

const navigation: Array<{ href: string; label: string }> = [
  { href: "/essays", label: "Essays" },
  { href: "/about", label: "About" },
  { href: "/search", label: "Search" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-4xl flex-wrap items-baseline justify-between gap-x-6 gap-y-3 px-6 py-6 sm:py-8">
        <Link
          href="/"
          className="font-serif text-[1.35rem] tracking-tight text-ink no-underline"
        >
          Writing<span className="italic text-accent">Faith</span>
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2 font-sans text-[0.8125rem] uppercase tracking-[0.14em] text-ink-muted [&_a]:whitespace-nowrap">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="transition-colors hover:text-ink"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              {/* Session state streams in; the static shell shows "Sign in". */}
              <Suspense
                fallback={
                  <Link
                    href="/signin"
                    className="transition-colors hover:text-ink"
                  >
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
