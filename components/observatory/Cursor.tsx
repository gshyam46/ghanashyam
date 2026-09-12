"use client";

import { useEffect, useRef } from "react";
import "./cursor.css";

const controls = 'a, button, [role="button"], [role="option"], [role="tab"], label';
const nativeFields = 'input, textarea, select, [contenteditable="true"], [contenteditable=""]';
const readableText = "p, h1, h2, h3, h4, li, dt, dd, code, pre, blockquote, span, strong, em";

/** The dot tracks the pointer exactly; only the decorative ring eases behind it. */
export default function Cursor({ paused }: { paused: boolean }) {
  const layerRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const refreshRef = useRef<(() => void) | null>(null);

  useEffect(() => { pausedRef.current = paused; refreshRef.current?.(); }, [paused]);

  useEffect(() => {
    const layer = layerRef.current;
    const root = layer?.closest<HTMLElement>(".observatory");
    const dot = layer?.querySelector<HTMLElement>(".cursor-dot");
    const ring = layer?.querySelector<HTMLElement>(".cursor-ring");
    // The browser cursor remains intact if a top-layer overlay is unavailable.
    if (!layer || !root || !dot || !ring || typeof layer.showPopover !== "function") return;

    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let refreshFrame = 0;
    let previousTime = 0;
    let pointerX = 0;
    let pointerY = 0;
    let ringX = 0;
    let ringY = 0;
    let inside = false;
    let active = false;
    let dragging = false;
    let topSurface: Element | null = null;

    const enabled = () => fine.matches && !reduced.matches && !pausedRef.current && !document.hidden;

    function hide() {
      active = false;
      layer!.dataset.active = "false";
      delete root!.dataset.cursor;
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      if (layer!.matches(":popover-open")) layer!.hidePopover();
      topSurface = null;
    }

    function settle(time: number) {
      frame = 0;
      if (!active || !enabled()) return;
      const dt = previousTime ? Math.min(time - previousTime, 64) : 16.7;
      previousTime = time;
      const ease = 1 - Math.exp(-dt / 65);
      ringX += (pointerX - ringX) * ease;
      ringY += (pointerY - ringY) * ease;
      ring!.style.translate = `${ringX}px ${ringY}px`;
      if (Math.hypot(pointerX - ringX, pointerY - ringY) > .1) frame = requestAnimationFrame(settle);
      else previousTime = 0;
    }

    function update(target: Element | null) {
      if (!inside || !enabled() || !target || !root!.contains(target)) { hide(); return; }
      const control = target.closest(controls);
      const text = target.closest(readableText);
      const native = target.closest(nativeFields) || target.closest(':disabled, [aria-disabled="true"]');
      const selectingText = !control && text?.textContent?.trim() && getComputedStyle(text).userSelect !== "none";
      if (native || (selectingText && !dragging)) { hide(); return; }

      const sculpture = target.closest<HTMLElement>(".signal-sculpture");
      const canDrag = sculpture?.dataset.dragHit === "true";
      const holding = dragging && sculpture?.dataset.dragging === "true";
      layer!.dataset.state = holding ? "dragging" : canDrag ? "drag" : control ? "link" : "default";
      const surface = target.closest('dialog[open], [popover]:popover-open');
      try {
        // Re-enter the top layer when a dialog/menu opens, preserving its focus.
        if (surface !== topSurface && layer!.matches(":popover-open")) layer!.hidePopover();
        if (!layer!.matches(":popover-open")) layer!.showPopover();
      } catch { hide(); return; }
      topSurface = surface;
      if (!active) { ringX = pointerX; ringY = pointerY; }
      dot!.style.translate = `${pointerX}px ${pointerY}px`;
      ring!.style.translate = `${ringX}px ${ringY}px`;
      layer!.dataset.active = "true";
      root!.dataset.cursor = "active";
      active = true;
      if (!frame) frame = requestAnimationFrame(settle);
    }

    function refresh() {
      refreshFrame = 0;
      update(document.elementFromPoint(pointerX, pointerY));
    }
    function scheduleRefresh() {
      if (!refreshFrame) refreshFrame = requestAnimationFrame(refresh);
    }
    function move(event: PointerEvent) {
      if (event.pointerType !== "mouse") { leave(); return; }
      inside = true;
      pointerX = event.clientX;
      pointerY = event.clientY;
      // Document bubbling runs after the sculpture updates its geometric hit test.
      update(event.target instanceof Element ? event.target : null);
    }
    function down(event: PointerEvent) {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      dragging = Boolean((event.target as Element)?.closest<HTMLElement>(".signal-sculpture")?.dataset.dragging === "true");
      move(event);
    }
    function up(event: PointerEvent) {
      dragging = false;
      if (event.pointerType === "mouse") refresh();
    }
    function leave() { inside = false; dragging = false; hide(); }
    function out(event: PointerEvent) { if (!event.relatedTarget) leave(); }
    function keyboard(event: KeyboardEvent) { if (event.key === "Tab" || event.key === "Escape") leave(); }
    function toggled(event: Event) { if (event.target !== layer) scheduleRefresh(); }
    function visibility() { if (document.hidden) leave(); }
    const observer = new MutationObserver(scheduleRefresh);
    observer.observe(root, { attributes: true, subtree: true, attributeFilter: ["open", "data-drag-hit", "data-dragging"] });
    refreshRef.current = refresh;

    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerup", up, { passive: true });
    document.addEventListener("pointercancel", leave, { passive: true });
    document.addEventListener("pointerout", out, { passive: true });
    document.addEventListener("keydown", keyboard);
    document.addEventListener("toggle", toggled, true);
    document.addEventListener("visibilitychange", visibility);
    document.addEventListener("scroll", scheduleRefresh, { passive: true, capture: true });
    window.addEventListener("blur", leave);
    window.addEventListener("resize", leave);
    fine.addEventListener("change", refresh);
    reduced.addEventListener("change", refresh);
    return () => {
      hide(); observer.disconnect(); refreshRef.current = null;
      cancelAnimationFrame(refreshFrame);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", up);
      document.removeEventListener("pointercancel", leave);
      document.removeEventListener("pointerout", out);
      document.removeEventListener("keydown", keyboard);
      document.removeEventListener("toggle", toggled, true);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("scroll", scheduleRefresh, true);
      window.removeEventListener("blur", leave);
      window.removeEventListener("resize", leave);
      fine.removeEventListener("change", refresh);
      reduced.removeEventListener("change", refresh);
    };
  }, []);

  return <div ref={layerRef} className="experience-cursor" popover="manual" aria-hidden="true" data-active="false" data-state="default">
    <span className="cursor-dot" />
    <span className="cursor-ring"><i /><i /></span>
  </div>;
}
