"use client";

import { useEffect, useRef } from "react";

const colors = { copper: "235, 194, 156", silver: "192, 224, 244", ink: "115, 88, 63" };
type Point = { x: number; y: number; time: number };

export default function TouchLight({ paused, palette }: { paused: boolean; palette: keyof typeof colors }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let points: Point[] = [];
    let frame = 0;
    let touchId: number | null = null;
    let width = 0;
    let height = 0;
    const clear = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      points = [];
      touchId = null;
      context.clearRect(0, 0, width, height);
      canvas.dataset.active = "false";
    };
    const resize = () => {
      clear();
      width = innerWidth;
      height = innerHeight;
      const ratio = Math.min(devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const draw = (now: number) => {
      frame = 0;
      context.clearRect(0, 0, width, height);
      points = points.filter(point => now - point.time < 460);
      context.lineCap = "round";
      for (let index = 1; index < points.length; index++) {
        const from = points[index - 1];
        const to = points[index];
        const life = Math.max(0, 1 - (now - from.time) / 460);
        if (Math.hypot(to.x - from.x, to.y - from.y) > 120) continue;
        context.beginPath();
        context.moveTo(from.x, from.y);
        context.lineTo(to.x, to.y);
        context.strokeStyle = `rgba(${colors[palette]}, ${life * life * .045})`;
        context.lineWidth = 9;
        context.stroke();
        context.strokeStyle = `rgba(${colors[palette]}, ${life * life * .3})`;
        context.lineWidth = 1;
        context.stroke();
      }
      points.forEach(point => {
        const life = 1 - (now - point.time) / 460;
        const radius = 14 + (1 - life) * 18;
        const glow = context.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
        glow.addColorStop(0, `rgba(${colors[palette]}, ${life * life * .24})`);
        glow.addColorStop(.3, `rgba(${colors[palette]}, ${life * life * .09})`);
        glow.addColorStop(1, `rgba(${colors[palette]}, 0)`);
        context.fillStyle = glow;
        context.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
      });
      canvas.dataset.active = String(points.length > 0);
      if (points.length) frame = requestAnimationFrame(draw);
    };
    const sample = (touch: Touch) => {
      const now = performance.now();
      const previous = points[points.length - 1];
      if (previous && now - previous.time < 24) return;
      points.push({ x: touch.clientX, y: touch.clientY, time: now });
      points = points.slice(-18);
      if (!frame) frame = requestAnimationFrame(draw);
    };
    const start = (event: TouchEvent) => {
      if (paused || preference.matches || document.hidden || event.touches.length !== 1
        || (event.target instanceof Element && event.target.closest("input, textarea, select, [contenteditable], dialog"))) {
        clear();
        return;
      }
      touchId = event.touches[0].identifier;
      points = [];
      sample(event.touches[0]);
    };
    const move = (event: TouchEvent) => {
      if (event.touches.length !== 1) { clear(); return; }
      const touch = Array.from(event.touches).find(item => item.identifier === touchId);
      if (touch) sample(touch);
    };
    const end = () => { touchId = null; };
    // Touch events continue during native scrolling after pointercancel. All
    // listeners are passive: scrolling, pinch zoom, and sculpture drag stay native.
    document.addEventListener("touchstart", start, { passive: true });
    document.addEventListener("touchmove", move, { passive: true });
    document.addEventListener("touchend", end, { passive: true });
    document.addEventListener("touchcancel", clear, { passive: true });
    document.addEventListener("visibilitychange", clear);
    preference.addEventListener("change", clear);
    window.addEventListener("resize", resize, { passive: true });
    resize();
    return () => {
      clear();
      document.removeEventListener("touchstart", start);
      document.removeEventListener("touchmove", move);
      document.removeEventListener("touchend", end);
      document.removeEventListener("touchcancel", clear);
      document.removeEventListener("visibilitychange", clear);
      preference.removeEventListener("change", clear);
      window.removeEventListener("resize", resize);
    };
  }, [paused, palette]);
  return <canvas ref={canvasRef} className="touch-light" aria-hidden="true" />;
}
