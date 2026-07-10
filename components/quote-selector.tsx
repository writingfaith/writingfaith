"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface Selection {
  text: string;
  top: number;
  left: number;
}

const MIN_LENGTH = 8;
const MAX_LENGTH = 360;

/**
 * Select a passage inside the essay body and a quiet "Share this passage"
 * button appears above it — Medium's selection-to-share pattern. Clicking
 * it opens a native <dialog> with a generated card (app/api/quote-card) the
 * reader can copy, download, or share, plus a link back to this essay.
 *
 * A native <dialog> is used deliberately: it centers itself, traps focus,
 * closes on Escape, and can never be visually clipped by an ancestor's
 * overflow — none of which a hand-rolled popover gets for free.
 */
export function QuoteSelector({
  slug,
  containerId,
  pageUrl,
}: {
  slug: string;
  containerId: string;
  pageUrl: string;
}) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [quote, setQuote] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const handleChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setSelection(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!container.contains(range.commonAncestorContainer)) {
        setSelection(null);
        return;
      }
      const text = sel.toString().replace(/\s+/g, " ").trim();
      if (text.length < MIN_LENGTH || text.length > MAX_LENGTH) {
        setSelection(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) {
        setSelection(null);
        return;
      }
      setSelection({
        text,
        top: Math.max(8, rect.top - 44),
        left: Math.min(
          window.innerWidth - 88,
          Math.max(88, rect.left + rect.width / 2),
        ),
      });
    };

    document.addEventListener("selectionchange", handleChange);
    return () => document.removeEventListener("selectionchange", handleChange);
  }, [containerId]);

  const openDialog = useCallback(() => {
    if (!selection) return;
    setQuote(selection.text);
    setCopyState("idle");
    setSelection(null);
    window.getSelection()?.removeAllRanges();
    dialogRef.current?.showModal();
  }, [selection]);

  const closeDialog = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  const cardUrl = quote
    ? `/api/quote-card?slug=${encodeURIComponent(slug)}&q=${encodeURIComponent(quote)}`
    : null;

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }, [pageUrl]);

  const copyImage = useCallback(async () => {
    if (!cardUrl || !("clipboard" in navigator) || !window.ClipboardItem) {
      setCopyState("error");
      return;
    }
    try {
      const response = await fetch(cardUrl);
      if (!response.ok) throw new Error("Quote card could not be generated");
      const blob = await response.blob();
      await navigator.clipboard.write([
        new window.ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    }
  }, [cardUrl]);

  const share = useCallback(async () => {
    if (!quote || !cardUrl || !navigator.share) {
      setCopyState("error");
      return;
    }
    try {
      const response = await fetch(cardUrl);
      if (!response.ok) throw new Error("Quote card could not be generated");
      const blob = await response.blob();
      const file = new File([blob], `writing-faith-${slug}.png`, {
        type: blob.type || "image/png",
      });
      const withFile = { files: [file], text: quote, url: pageUrl };
      await navigator.share(
        navigator.canShare?.(withFile) ? withFile : { text: quote, url: pageUrl },
      );
    } catch (error) {
      // Cancelling the native sheet is intentional; generation failures are not.
      if (error instanceof DOMException && error.name === "AbortError") return;
      setCopyState("error");
    }
  }, [cardUrl, pageUrl, quote, slug]);

  return (
    <>
      {selection && (
        <button
          type="button"
          className="quote-share-button"
          style={{ top: selection.top, left: selection.left }}
          onMouseDown={(event) => event.preventDefault()}
          onClick={openDialog}
        >
          Share this passage
        </button>
      )}

      <dialog
        ref={dialogRef}
        className="quote-dialog"
        aria-label="Share this passage"
        onClose={() => setQuote(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeDialog();
        }}
      >
        {quote && cardUrl && (
          <div className="quote-dialog-body">
            {/* Rendered by app/api/quote-card — decorative restatement of the quote below it. */}
            <Image
              src={cardUrl}
              alt=""
              width={600}
              height={315}
              unoptimized
              className="quote-dialog-preview"
            />
            <blockquote className="sr-only">{quote}</blockquote>
            <div className="quote-dialog-actions">
              <button type="button" className="btn" onClick={copyImage}>
                Copy image
              </button>
              <button type="button" className="btn" onClick={copyLink}>
                Copy link
              </button>
              <a
                href={cardUrl}
                download={`writing-faith-${slug}.png`}
                className="btn no-underline"
              >
                Download
              </a>
              <button type="button" className="btn" onClick={share}>
                Share…
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={closeDialog}
              >
                Close
              </button>
            </div>
            <p aria-live="polite" className="quote-dialog-status">
              {copyState === "copied" && "Copied."}
              {copyState === "error" &&
                "Couldn't copy — try Share or download instead."}
            </p>
          </div>
        )}
      </dialog>
    </>
  );
}
