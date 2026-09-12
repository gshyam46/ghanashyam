"use client";

import { useEffect, useRef, useState } from "react";
import "./loading-screen.css";

type LoadingResult = "ready" | "fallback" | "timeout" | "skipped";

/** Covers critical first paint, with an immediate exit and a bounded wait. */
export default function LoadingScreen() {
  const screenRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef<((result: LoadingResult) => void) | null>(null);
  const [state, setState] = useState<"loading" | "leaving" | "gone">("loading");

  useEffect(() => {
    const screen = screenRef.current;
    const root = screen?.closest<HTMLElement>(".observatory");
    if (!screen || !root) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let finished = false;
    let fontsReady = false;
    let fontFallback = false;
    let paintFrame = 0;
    let removeTimer = 0;
    root.dataset.loading = "loading";

    function finish(result: LoadingResult) {
      if (finished || disposed) return;
      finished = true;
      cancelAnimationFrame(paintFrame);
      clearTimeout(deadline);
      root!.dataset.loading = "ready";
      root!.dataset.loadingResult = result;
      // Pointer access resumes as the fade starts, not after its duration.
      setState(reduced.matches ? "gone" : "leaving");
      if (!reduced.matches) removeTimer = window.setTimeout(() => setState("gone"), 550);
      if (screen!.contains(document.activeElement)) (document.activeElement as HTMLElement)?.blur();
      root!.dispatchEvent(new CustomEvent("observatory:ready", { bubbles: true, detail: { result } }));
    }

    function checkReadiness() {
      if (!fontsReady || finished || disposed) return;
      const artwork = root!.querySelector<HTMLElement>(".signal-sculpture");
      const status = artwork?.dataset.renderState;
      if (status !== "webgl" && status !== "fallback") return;
      cancelAnimationFrame(paintFrame);
      // Let the committed font layout and submitted canvas/SVG frame paint.
      paintFrame = requestAnimationFrame(() => {
        paintFrame = requestAnimationFrame(() => finish(status === "fallback" || fontFallback ? "fallback" : "ready"));
      });
    }

    function keyDown(event: KeyboardEvent) {
      if (event.key === "Escape") finish("skipped");
    }

    function focusIn(event: FocusEvent) {
      // Keyboard navigation can always enter the page without a focus trap.
      if (event.target instanceof Node && !screen!.contains(event.target)) finish("skipped");
    }

    const deadline = window.setTimeout(() => finish("timeout"), 6000);
    finishRef.current = finish;
    document.addEventListener("observatory:sculpture-ready", checkReadiness);
    document.addEventListener("keydown", keyDown);
    document.addEventListener("focusin", focusIn);

    // Both fonts are local CSS assets. Request only the faces used on entry.
    Promise.allSettled([
      document.fonts.load('400 14px "Manrope Variable"', "Ghanashyam"),
      document.fonts.load('400 12px "DM Mono"', "OBSERVATORY"),
      document.fonts.ready,
    ]).then(results => {
      fontFallback = results.some(result => result.status === "rejected");
      fontsReady = true;
      checkReadiness();
    });
    // The sculpture may have completed before this effect subscribed.
    checkReadiness();

    return () => {
      disposed = true;
      clearTimeout(deadline);
      clearTimeout(removeTimer);
      cancelAnimationFrame(paintFrame);
      finishRef.current = null;
      document.removeEventListener("observatory:sculpture-ready", checkReadiness);
      document.removeEventListener("keydown", keyDown);
      document.removeEventListener("focusin", focusIn);
      if (root.dataset.loading === "loading") root.dataset.loading = "ready";
    };
  }, []);

  if (state === "gone") return null;

  return <div ref={screenRef} className="loading-screen" data-state={state} aria-hidden={state === "leaving" ? true : undefined}>
    <div className="loading-screen-center" role="status" aria-live="polite">
      <svg className="loading-screen-mark" viewBox="0 0 64 64" fill="none" aria-hidden="true"><ellipse cx="32" cy="32" rx="25" ry="13" transform="rotate(-40 32 32)" /><ellipse cx="32" cy="32" rx="25" ry="13" transform="rotate(40 32 32)" /><circle cx="32" cy="32" r="2.5" /></svg>
      <strong>GHANASHYAM G.</strong>
      <span>Preparing the observatory</span>
      <i className="loading-screen-rule" aria-hidden="true" />
    </div>
    <button className="loading-screen-skip" onClick={() => finishRef.current?.("skipped")} tabIndex={state === "leaving" ? -1 : 0}>Continue to the portfolio <span aria-hidden="true">↗</span></button>
    <noscript><style>{`.loading-screen{display:none!important}`}</style></noscript>
  </div>;
}
