"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Plus } from "lucide-react";
import { toolkitGroups, toolkitRows } from "@/data/toolkit";
import "./technology-marquee.css";

export default function TechnologyMarquee({ paused }: { paused: boolean }) {
  const rootRef = useRef<HTMLElement>(null);
  const [stopped, setStopped] = useState(false);
  const positions = useRef([0, 150]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const tracks = Array.from(root.querySelectorAll<HTMLElement>(".technology-track"));
    const lanes = Array.from(root.querySelectorAll<HTMLElement>(".technology-lane"));
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    let widths = tracks.map(() => 1);
    let visible = false;
    let frame = 0;
    let previousTime = 0;
    let lastScroll = scrollY;
    let direction = 1;
    let velocity = 58;
    let hovered = false;
    let pointer: { id: number; lane: number; x: number; y: number; dragging: boolean } | null = null;
    let disposed = false;
    const speeds = [1, .84];
    const enabled = () => !paused && !stopped && !preference.matches;
    const paint = () => tracks.forEach((track, index) => {
      const width = widths[index];
      positions.current[index] = ((positions.current[index] % width) + width) % width;
      track.style.transform = `translate3d(${positions.current[index] - width}px, 0, 0)`;
    });
    const schedule = () => {
      if (!frame && !disposed && visible && !document.hidden && enabled()) frame = requestAnimationFrame(tick);
    };
    const tick = (time: number) => {
      frame = 0;
      const dt = previousTime ? Math.min((time - previousTime) / 1000, .05) : 0;
      previousTime = time;
      if (!visible || document.hidden || !enabled()) { previousTime = 0; return; }
      const target = direction * 58 * (hovered ? .2 : 1);
      velocity += (target - velocity) * (1 - Math.exp(-dt * 7));
      if (!pointer?.dragging) tracks.forEach((_, index) => { positions.current[index] += velocity * speeds[index] * dt; });
      paint();
      schedule();
    };
    const suspend = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      previousTime = 0;
      root.dataset.running = "false";
    };
    const sync = () => {
      suspend();
      root.dataset.still = String(!enabled());
      root.dataset.running = String(visible && !document.hidden && enabled());
      if (!enabled()) { pointer = null; root.dataset.dragging = "false"; }
      schedule();
    };
    const measure = () => {
      widths = tracks.map(track => track.querySelector<HTMLElement>(".technology-group")!.getBoundingClientRect().width || 1);
      paint();
      sync();
    };
    const scroll = () => {
      const delta = scrollY - lastScroll;
      if (Math.abs(delta) < 2) return;
      direction = delta > 0 ? 1 : -1;
      lastScroll = scrollY;
      root.dataset.direction = direction > 0 ? "right" : "left";
      schedule();
    };
    const enter = (event: PointerEvent) => { if (event.pointerType === "mouse") hovered = true; };
    const leave = () => { hovered = false; };
    const down = (event: PointerEvent) => {
      if (!enabled() || !event.isPrimary || event.button !== 0) return;
      const lane = lanes.indexOf(event.currentTarget as HTMLElement);
      pointer = { id: event.pointerId, lane, x: event.clientX, y: event.clientY, dragging: false };
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    };
    const move = (event: PointerEvent) => {
      if (!pointer || pointer.id !== event.pointerId || !enabled()) return;
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (!pointer.dragging && Math.abs(dx) < 6) return;
      if (!pointer.dragging && Math.abs(dy) > Math.abs(dx)) return;
      pointer.dragging = true;
      root.dataset.dragging = "true";
      positions.current[pointer.lane] += dx;
      pointer.x = event.clientX;
      pointer.y = event.clientY;
      paint();
    };
    const up = () => { pointer = null; root.dataset.dragging = "false"; };
    const visibility = () => { up(); hovered = false; sync(); };
    const observer = new IntersectionObserver(entries => {
      // Only the newest visibility change matters when scroll events are batched.
      visible = entries[entries.length - 1]?.isIntersecting ?? false;
      sync();
    });
    const resize = new ResizeObserver(measure);
    tracks.forEach(track => resize.observe(track.querySelector(".technology-group")!));
    observer.observe(root);
    lanes.forEach(lane => {
      lane.addEventListener("pointerenter", enter);
      lane.addEventListener("pointerleave", leave);
      lane.addEventListener("pointerdown", down);
      lane.addEventListener("pointermove", move);
      lane.addEventListener("pointerup", up);
      lane.addEventListener("pointercancel", up);
      lane.addEventListener("lostpointercapture", up);
    });
    root.dataset.direction = "right";
    window.addEventListener("scroll", scroll, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    preference.addEventListener("change", sync);
    measure();
    return () => {
      disposed = true;
      suspend();
      observer.disconnect();
      resize.disconnect();
      window.removeEventListener("scroll", scroll);
      document.removeEventListener("visibilitychange", visibility);
      preference.removeEventListener("change", sync);
      lanes.forEach(lane => {
        lane.removeEventListener("pointerenter", enter);
        lane.removeEventListener("pointerleave", leave);
        lane.removeEventListener("pointerdown", down);
        lane.removeEventListener("pointermove", move);
        lane.removeEventListener("pointerup", up);
        lane.removeEventListener("pointercancel", up);
        lane.removeEventListener("lostpointercapture", up);
      });
    };
  }, [paused, stopped]);

  return (
    <section ref={rootRef} className="technology-marquee" id="toolkit" aria-labelledby="toolkit-title">
      <div className="technology-heading">
        <h3 id="toolkit-title" className="eyebrow"><span className="little-cross">+</span> THE WORKING TOOLKIT</h3>
        <button className="technology-pause" onClick={() => setStopped(value => !value)} aria-pressed={stopped} disabled={paused} aria-label={stopped ? "Resume technology motion" : "Pause technology motion"}>
          {stopped ? <Play size={12} /> : <Pause size={12} />}<span>{stopped ? "RESUME" : "PAUSE"}</span>
        </button>
      </div>
      <div className="technology-bands" aria-hidden="true">
        {toolkitRows.map((row, index) => <div className="technology-lane" key={index}>
          <div className="technology-track">
            {[0, 1].map(copy => <div className="technology-group" key={copy}>{row.map(tool => <span className="technology-word" key={tool}>{tool}<i>·</i></span>)}</div>)}
          </div>
        </div>)}
      </div>
      <div className="technology-footer">
        <p className="technology-hint"><span className="technology-mouse-hint">HOVER TO SLOW · DRAG TO EXPLORE</span><span className="technology-touch-hint">SWIPE SIDEWAYS TO EXPLORE</span><span>SCROLL TO CHANGE DIRECTION</span></p>
        <details className="technology-index">
          <summary>Explore the toolkit <Plus size={14} /></summary>
          <div className="technology-index-content">
            {toolkitGroups.map(group => <div key={group.name}><h4>{group.name}</h4><p>{group.tools.join(" · ")}</p></div>)}
          </div>
        </details>
      </div>
    </section>
  );
}
