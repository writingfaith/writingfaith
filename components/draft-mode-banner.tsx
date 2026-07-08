/**
 * Shown only while Draft Mode is active, so the author always knows they are
 * looking at unpublished content and has a way out.
 */
export function DraftModeBanner() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-rule bg-paper-raised/95 backdrop-blur">
      <p className="mx-auto flex max-w-4xl items-baseline justify-between px-6 py-3 font-sans text-sm text-ink-muted">
        <span>Previewing drafts</span>
        <a
          href="/api/draft-mode/disable"
          className="text-accent-strong underline underline-offset-4 transition-colors hover:text-ink"
        >
          Exit preview
        </a>
      </p>
    </div>
  );
}
