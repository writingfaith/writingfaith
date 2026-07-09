import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";
import { NavLink } from "@/components/nav-link";
import { getSiteSettings } from "@/lib/site-settings";

/**
 * A centered literary masthead: the publication's name set as an object,
 * navigation beneath it, closed by the double hairline rule that journals
 * have used for two centuries. Labels come from Studio → Site Settings.
 */
export async function SiteHeader() {
  const settings = await getSiteSettings();

  const navigation: Array<{ href: string; label: string }> = [
    { href: "/essays", label: settings.postPluralTitle },
    { href: "/about", label: "About" },
    { href: "/search", label: "Search" },
  ];

  return (
    <header className="masthead">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 pb-5 pt-8 sm:pt-10">
        <Link
          href="/"
          className="font-serif text-[1.9rem] tracking-tight text-ink no-underline sm:text-[2.2rem]"
        >
          <BrandMark name={settings.siteName} />
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap items-baseline justify-center gap-x-7 gap-y-2 font-sans text-[0.8125rem] uppercase tracking-[0.16em] text-ink-muted [&_a]:whitespace-nowrap">
            {navigation.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
