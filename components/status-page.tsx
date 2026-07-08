import Link from "next/link";

/** Shared layout for small confirmation/status pages. */
export function StatusPage({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-6">
      <section className="py-20 sm:py-28">
        <p className="eyebrow">
          {eyebrow}
        </p>
        <h1 className="title mt-6 max-w-[26ch]">
          {title}
        </h1>
        <div className="mt-8 max-w-prose text-ink-muted">{children}</div>
        <p className="mt-6 font-sans text-sm">
          <Link
            href="/"
            className="text-accent-strong underline underline-offset-4 transition-colors hover:text-ink"
          >
            Return to the home page
          </Link>
        </p>
      </section>
    </div>
  );
}
