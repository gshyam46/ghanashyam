"use client";

import { useEffect, useRef } from "react";
import "./atmosphere.css";

type AtmosphereProps = {
  paused: boolean;
  scene: "signal" | "systems" | "practice" | "contact";
  palette: "copper" | "ink" | "silver";
};

const FIELD_COLORS = {
  copper: "207, 179, 146",
  ink: "78, 89, 73",
  silver: "164, 194, 208",
};
const SCENE_DEPTH = { signal: 0, systems: 0.42, practice: 0.72, contact: 1 };
const FIELD_POINTS = Array.from({ length: 38 }, (_, index) => {
  const seed = (value: number) => {
    const result = Math.sin(value * 127.1 + 311.7) * 43758.5453;
    return result - Math.floor(result);
  };
  return { x: 0.035 + seed(index + 2) * 0.93, y: 0.12 + seed(index + 45) * 0.77, depth: 0.35 + seed(index + 87) * 0.65 };
});

/** A quiet plotted field. It only redraws while an interaction is settling. */
export default function Atmosphere({ paused, scene, palette }: AtmosphereProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const propsRef = useRef({ paused, scene, palette });
  const invalidateRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    propsRef.current = { paused, scene, palette };
    invalidateRef.current?.();
  }, [paused, scene, palette]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const observatory = canvas?.closest<HTMLElement>(".observatory");
    if (!canvas || !observatory) return;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 1;
    let height = 1;
    let frame = 0;
    let disposed = false;
    let lastTick = 0;
    let lastPaint = 0;
    let pointerInside = false;
    let targetX = 0;
    let targetY = 0;
    let easedX = 0;
    let easedY = 0;
    let pointerX = 0;
    let pointerY = 0;
    let scrollTarget = window.scrollY;
    let easedScroll = scrollTarget;
    let sceneDepth = SCENE_DEPTH[propsRef.current.scene];

    function motionEnabled() {
      return !propsRef.current.paused && !reducedMotion.matches;
    }

    function schedule() {
      if (!frame && !disposed && !document.hidden) frame = window.requestAnimationFrame(render);
    }

    function invalidate() {
      lastPaint = 0;
      schedule();
    }

    function drawField() {
      const color = FIELD_COLORS[propsRef.current.palette];
      const interactive = motionEnabled();
      const shiftX = interactive && finePointer.matches ? easedX * 12 : 0;
      const shiftY = interactive ? (finePointer.matches ? easedY * 9 : 0) - Math.min(easedScroll / height, 4) * (finePointer.matches ? 8 : 4) : 0;
      const depth = sceneDepth;
      context!.clearRect(0, 0, width, height);
      context!.lineWidth = 0.65;

      // Partial curves suggest a sampled surface, without framing the artwork.
      context!.save();
      context!.translate(width * 0.68 + shiftX, height * 0.48 + shiftY);
      context!.rotate(-0.27 + depth * 0.15);
      for (let index = 0; index < 7; index++) {
        const y = (index - 3) * height * 0.102;
        context!.beginPath();
        context!.moveTo(-width * 0.73, y + height * 0.14);
        context!.bezierCurveTo(
          -width * 0.3, y - height * (0.16 + depth * 0.06),
          width * 0.13, y + height * (0.23 - depth * 0.1),
          width * 0.61, y - height * 0.05,
        );
        context!.strokeStyle = `rgba(${color}, ${index % 2 === 0 ? 0.058 : 0.029})`;
        context!.stroke();
      }
      context!.restore();

      const reach = Math.min(width * 0.2, 190);
      const points = FIELD_POINTS.map((point) => {
        const x = point.x * width + shiftX * point.depth;
        const y = point.y * height + shiftY * point.depth;
        const distance = pointerInside && interactive ? Math.hypot(x - pointerX, y - pointerY) : Infinity;
        return { x, y, distance, proximity: Math.max(0, 1 - distance / reach) };
      });

      // Only the nearest three samples respond; the field never becomes a web.
      const nearby = points.filter((point) => point.proximity > 0).sort((a, b) => a.distance - b.distance).slice(0, 3);
      nearby.forEach((point) => {
        context!.beginPath();
        context!.moveTo(pointerX, pointerY);
        context!.lineTo(point.x, point.y);
        context!.strokeStyle = `rgba(${color}, ${point.proximity * 0.12})`;
        context!.stroke();
      });

      points.forEach((point, index) => {
        context!.strokeStyle = `rgba(${color}, ${0.16 + point.proximity * 0.25})`;
        context!.fillStyle = context!.strokeStyle;
        if (index % 5 === 0) {
          const arm = 2.4 + point.proximity * 1.2;
          context!.beginPath();
          context!.moveTo(point.x - arm, point.y);
          context!.lineTo(point.x + arm, point.y);
          context!.moveTo(point.x, point.y - arm);
          context!.lineTo(point.x, point.y + arm);
          context!.stroke();
        } else {
          context!.beginPath();
          context!.arc(point.x, point.y, 0.6 + point.proximity * 0.35, 0, Math.PI * 2);
          context!.fill();
        }
      });
    }

    function render(time: number) {
      frame = 0;
      if (disposed || document.hidden) return;
      const dt = lastTick ? Math.min(time - lastTick, 64) : 16.7;
      lastTick = time;
      const active = motionEnabled();
      const fieldEase = active ? 1 - Math.exp(-dt / 190) : 1;
      easedX += ((active ? targetX : 0) - easedX) * fieldEase;
      easedY += ((active ? targetY : 0) - easedY) * fieldEase;
      easedScroll += (scrollTarget - easedScroll) * fieldEase;
      sceneDepth += (SCENE_DEPTH[propsRef.current.scene] - sceneDepth) * fieldEase;
      observatory!.style.setProperty("--atmosphere-scroll-lift", active && finePointer.matches ? `${(-Math.min(easedScroll / height, 1) * 30).toFixed(2)}px` : "0px");

      const unsettledField = Math.abs(easedX - (active ? targetX : 0)) + Math.abs(easedY - (active ? targetY : 0)) > 0.002
        || Math.abs(easedScroll - scrollTarget) > 0.1
        || Math.abs(sceneDepth - SCENE_DEPTH[propsRef.current.scene]) > 0.002;
      // The decorative canvas is limited to 30fps and stops when settled.
      if (!lastPaint || time - lastPaint >= 32 || !unsettledField) {
        drawField();
        lastPaint = time;
      }
      if (unsettledField) schedule();
      else lastTick = 0;
    }

    function resize() {
      width = Math.max(window.innerWidth, 1);
      height = Math.max(window.innerHeight, 1);
      const ratio = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas!.width = Math.round(width * ratio);
      canvas!.height = Math.round(height * ratio);
      context!.setTransform(ratio, 0, 0, ratio, 0, 0);
      invalidate();
    }

    function pointerMove(event: PointerEvent) {
      if (event.pointerType !== "mouse" || !motionEnabled()) return;
      pointerInside = true;
      pointerX = event.clientX;
      pointerY = event.clientY;
      targetX = (pointerX / width - 0.5) * 2;
      targetY = (pointerY / height - 0.5) * 2;
      schedule();
    }

    function leave() {
      pointerInside = false;
      targetX = 0;
      targetY = 0;
      schedule();
    }

    function pointerOut(event: PointerEvent) {
      if (!event.relatedTarget) leave();
    }

    function scroll() {
      scrollTarget = window.scrollY;
      if (!motionEnabled()) return;
      schedule();
    }

    function visibility() {
      lastTick = 0;
      if (document.hidden) {
        window.cancelAnimationFrame(frame);
        frame = 0;
        leave();
      } else invalidate();
    }

    invalidateRef.current = invalidate;
    document.addEventListener("pointermove", pointerMove, { passive: true });
    document.addEventListener("pointercancel", leave, { passive: true });
    document.addEventListener("pointerout", pointerOut, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("blur", leave);
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
    finePointer.addEventListener("change", invalidate);
    reducedMotion.addEventListener("change", invalidate);
    resize();

    return () => {
      disposed = true;
      invalidateRef.current = null;
      window.cancelAnimationFrame(frame);
      observatory.style.removeProperty("--atmosphere-scroll-lift");
      document.removeEventListener("pointermove", pointerMove);
      document.removeEventListener("pointercancel", leave);
      document.removeEventListener("pointerout", pointerOut);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("blur", leave);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", resize);
      finePointer.removeEventListener("change", invalidate);
      reducedMotion.removeEventListener("change", invalidate);
    };
  }, []);

  return <canvas ref={canvasRef} className="atmosphere-field" data-scene={scene} aria-hidden="true" />;
}
