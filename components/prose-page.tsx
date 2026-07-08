/**
 * Shared shell for editorial/legal pages: same reading typography as essays
 * (`essay-body`), calm header, consistent rhythm.
 */
export function ProsePage({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-4xl px-6">
      <article className="reveal py-16 sm:py-20">
        <header>
          <p className="eyebrow">
            {eyebrow}
          </p>
          <h1 className="title mt-6 max-w-[26ch]">
            {title}
          </h1>
          {updated && (
            <p className="mt-4 font-sans text-sm text-ink-faint">
              Last updated {updated}
            </p>
          )}
        </header>
        <div className="essay-body mt-10 sm:mt-12">{children}</div>
      </article>
    </div>
  );
}
