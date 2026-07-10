"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";

import {
  readingProgressSnapshot,
  subscribeToReadingProgress,
  type ReadingEntry,
} from "@/lib/reading-progress";

/**
 * A quiet prompt for a returning reader mid-essay: appears only after
 * mount (localStorage is browser-only, so this renders nothing on the
 * server and nothing changes visually for a first-time visitor).
 */
export function ContinueReading({ currentSlug }: { currentSlug?: string }) {
  const getSnapshot = useCallback(
    () => readingProgressSnapshot(currentSlug),
    [currentSlug],
  );
  const snapshot = useSyncExternalStore(
    subscribeToReadingProgress,
    getSnapshot,
    () => null,
  );
  const entry: ReadingEntry | null = snapshot ? JSON.parse(snapshot) : null;

  if (!entry) return null;

  return (
    <aside className="continue-reading" aria-label="Continue reading">
      <p className="font-sans text-sm">
        <span className="text-ink-faint">Continue where you left off — </span>
        <Link
          href={{
            pathname: `/essays/${entry.slug}`,
            query: { resume: entry.percent },
          }}
          className="link"
        >
          {entry.title}
        </Link>
        <span className="text-ink-faint"> · {entry.percent}% read</span>
      </p>
      <span
        aria-hidden="true"
        className="mt-2 block h-px w-full"
        style={{
          background: `linear-gradient(to right, var(--accent) ${entry.percent}%, var(--rule) ${entry.percent}%)`,
        }}
      />
    </aside>
  );
}
