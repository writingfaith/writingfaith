/**
 * The publication's crafted details. One recurring mark (the bronze
 * diamond between hairlines), a fine-line olive branch for the newsletter
 * invitation, and the author's monogram roundel. All inline SVG/CSS —
 * no image requests, no layout shift, themed by currentColor/tokens.
 */

/** Hairline — bronze diamond — hairline. The publication's recurring mark. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div role="presentation" className={`ornament ${className}`}>
      <span />
    </div>
  );
}

/** Fine-line olive branch — peace, offered quietly. */
export function OliveBranch({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 44"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* stem */}
      <path
        d="M6 38 C 34 30, 78 22, 114 8"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
      {/* leaves along the stem, alternating */}
      <path
        d="M26 33.5 C 22 26, 26 20, 33 18 C 34 25, 32 30, 26 33.5 Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M46 29 C 50 35, 58 36, 64 33 C 60 27, 52 25, 46 29 Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M64 24.5 C 60 17, 64 11, 71 9 C 72 16, 70 21, 64 24.5 Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M84 19 C 88 25, 96 26, 102 23 C 98 17, 90 15, 84 19 Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* olives */}
      <circle cx="40" cy="24" r="2.4" stroke="currentColor" strokeWidth="1" />
      <circle cx="79" cy="13.5" r="2.4" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

/** The author's monogram in a hairline roundel. */
export function AuthorMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-rule-strong font-serif text-lg italic tracking-tight text-accent-strong ${className}`}
    >
      VP
    </span>
  );
}
