"use client";

import { useEffect } from "react";

import { clearProgress, recordProgress } from "@/lib/reading-progress";

/**
 * Silently notes how far into an essay the reader has scrolled, so the
 * homepage can later offer to pick up where they left off. Renders nothing;
 * writes on tab-hide and unmount rather than on every scroll tick.
 */
export function ReadingProgressTracker({
  slug,
  title,
  articleId,
}: {
  slug: string;
  title: string;
  articleId: string;
}) {
  useEffect(() => {
    const article = document.getElementById(articleId);
    if (!article) return;

    const resume = Number(
      new URLSearchParams(window.location.search).get("resume"),
    );
    let resumeFrame: number | undefined;
    if (Number.isFinite(resume) && resume >= 6 && resume < 92) {
      resumeFrame = window.requestAnimationFrame(() => {
        const rect = article.getBoundingClientRect();
        const readableDistance = Math.max(0, rect.height - window.innerHeight);
        const target =
          window.scrollY + rect.top + readableDistance * (resume / 100);
        const reduceMotion = window.matchMedia(
          "(prefers-reduced-motion: reduce)",
        ).matches;
        window.scrollTo({
          top: target,
          behavior: reduceMotion ? "auto" : "smooth",
        });

        const url = new URL(window.location.href);
        url.searchParams.delete("resume");
        window.history.replaceState(window.history.state, "", url);
      });
    }

    const computePercent = () => {
      const rect = article.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) return 100;
      const scrolled = -rect.top;
      return (scrolled / total) * 100;
    };

    const commit = () => {
      const percent = computePercent();
      if (percent >= 92) {
        clearProgress(slug);
      } else {
        recordProgress(slug, title, percent);
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") commit();
    };

    window.addEventListener("pagehide", commit);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      if (resumeFrame !== undefined) window.cancelAnimationFrame(resumeFrame);
      commit();
      window.removeEventListener("pagehide", commit);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [slug, title, articleId]);

  return null;
}
