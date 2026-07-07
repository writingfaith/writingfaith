import Link from "next/link";

// Navigation items are introduced alongside their destination pages
// (essays index and about arrive with the content phase).
const navigation: Array<{ href: string; label: string }> = [];

export function SiteHeader() {
  return (
    <header className="border-b border-rule">
      <div className="mx-auto flex max-w-4xl items-baseline justify-between px-6 py-6 sm:py-8">
        <Link
          href="/"
          className="font-serif text-xl tracking-tight text-ink no-underline"
        >
          Writing<span className="italic text-accent">Faith</span>
        </Link>
        {navigation.length > 0 && (
          <nav aria-label="Main">
            <ul className="flex items-baseline gap-6 font-sans text-sm text-ink-muted">
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
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
