/** Quiet page-level fallback while a not-yet-cached essay streams in. */
export default function EssayLoading() {
  return (
    <div className="mx-auto max-w-4xl px-6">
      <div className="py-16 sm:py-20" aria-busy="true">
        <p className="eyebrow">
          Loading essay…
        </p>
        <div className="mt-8 space-y-4" aria-hidden="true">
          <div className="h-10 w-3/4 rounded bg-rule/60" />
          <div className="h-10 w-1/2 rounded bg-rule/60" />
          <div className="mt-10 h-4 w-full max-w-prose rounded bg-rule/40" />
          <div className="h-4 w-5/6 max-w-prose rounded bg-rule/40" />
          <div className="h-4 w-2/3 max-w-prose rounded bg-rule/40" />
        </div>
      </div>
    </div>
  );
}
