"use client";

import { useEffect, useRef } from "react";

/**
 * A second, softer pool of light inside the hero that leans toward the
 * reader's pointer — light through a window shifting as they move, never
 * a spotlight chasing the cursor.
 *
 * Compositor-only (a single translate3d, coalesced to one update per display
 * frame), desktop fine-pointers only, and inert under prefers-reduced-motion.
 * Without JavaScript or on touch devices it remains a still layer of light.
 */
export function HeroLight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let raf = 0;
    let targetX = 0;
    let targetY = 0;
    let bounds = parent.getBoundingClientRect();

    const refreshBounds = () => {
      bounds = parent.getBoundingClientRect();
    };

    const draw = () => {
      el.style.transform = `translate3d(${targetX.toFixed(2)}px, ${targetY.toFixed(2)}px, 0)`;
      raf = 0;
    };

    const scheduleDraw = () => {
      if (!raf) raf = requestAnimationFrame(draw);
    };

    const onMove = (event: PointerEvent) => {
      if (!bounds.width || !bounds.height) return;
      targetX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 34;
      targetY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 20;
      scheduleDraw();
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      scheduleDraw();
    };

    parent.addEventListener("pointerenter", refreshBounds, { passive: true });
    parent.addEventListener("pointermove", onMove, { passive: true });
    parent.addEventListener("pointerleave", onLeave, { passive: true });
    window.addEventListener("resize", refreshBounds, { passive: true });
    return () => {
      parent.removeEventListener("pointerenter", refreshBounds);
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", refreshBounds);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="hero-glow" />;
}
