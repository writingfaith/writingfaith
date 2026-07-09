"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Masthead navigation link that knows where the reader is: the current
 * section keeps its underline drawn (and announces itself via aria-current).
 */
export function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isCurrent = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className="nav-link"
      aria-current={isCurrent ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
