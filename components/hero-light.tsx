"use client";

import { useEffect, useRef } from "react";

/**
 * A second, softer pool of light inside the hero that leans toward the
 * reader's pointer — light through a window shifting as they move, never
 * a spotlight chasing the cursor.
 *
 * Compositor-only (a single translate3d, eased with a rAF lerp), desktop
 * fine-pointers only, and inert under prefers-reduced-motion. Without
 * JavaScript or on touch devices it remains a still layer of light.
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
    let x = 0;
    let y = 0;

    const step = () => {
      x += (targetX - x) * 0.05;
      y += (targetY - y) * 0.05;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      raf =
        Math.abs(targetX - x) + Math.abs(targetY - y) > 0.15
          ? requestAnimationFrame(step)
          : 0;
    };

    const onMove = (event: PointerEvent) => {
      const rect = parent.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 34;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 20;
      if (!raf) raf = requestAnimationFrame(step);
    };

    const onLeave = () => {
      targetX = 0;
      targetY = 0;
      if (!raf) raf = requestAnimationFrame(step);
    };

    parent.addEventListener("pointermove", onMove, { passive: true });
    parent.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      parent.removeEventListener("pointermove", onMove);
      parent.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} aria-hidden="true" className="hero-glow" />;
}
