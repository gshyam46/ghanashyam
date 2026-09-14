"use client";

import { useEffect, useId, useRef } from "react";
import "./energy-flux.css";

type EnergyFluxProps = { paused: boolean; palette: "copper" | "ink" | "silver" };
type Field = { phase: number; x: number; y: number; strength: number };
type Pulse = { x: number; age: number };

const WIDTH = 1200;
const HEIGHT = 108;
const STRANDS = Array.from({ length: 8 }, (_, index) => index);
const RESTING_FIELD: Field = { phase: 0, x: .5, y: 0, strength: 0 };

function strandY(x: number, strand: number, field: Field) {
  const envelope = Math.pow(Math.max(0, Math.sin(x * Math.PI)), .7);
  const family = strand < 4 ? 1 : -1;
  const offset = strand % 4;
  const weave = Math.sin(x * Math.PI * 3.4 - field.phase + offset * .12);
  const secondary = Math.sin(x * Math.PI * 5.1 + field.phase * .42 + offset * .25) * 3;
  const distance = (x - field.x) / .14;
  const attraction = Math.exp(-distance * distance) * field.y * field.strength * 27;
  return 51 + envelope * (family * weave * (21 + offset * 2.9) + secondary)
    + (offset - 1.5) * 1.2 + attraction;
}

function strandPath(strand: number, field: Field) {
  let path = "";
  for (let sample = 0; sample <= 80; sample++) {
    const x = sample / 80;
    path += `${sample ? "L" : "M"}${(x * WIDTH).toFixed(1)},${strandY(x, strand, field).toFixed(2)}`;
  }
  return path;
}

/** A small SVG field: eight filaments, one bloom pass, and at most two pulses. */
export default function EnergyFlux({ paused, palette }: EnergyFluxProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<Field>({ ...RESTING_FIELD });
  const sequence = useRef(0);
  const id = `flux-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const root = rootRef.current;
    const control = root?.querySelector<HTMLButtonElement>(".energy-flux-control");
    const svg = root?.querySelector<SVGSVGElement>(".energy-flux-field");
    if (!root || !control || !svg) return;
    const paths = Array.from(svg.querySelectorAll<SVGPathElement>(".energy-flux-strand"));
    const sparks = Array.from(svg.querySelectorAll<SVGCircleElement>(".energy-flux-spark"));
    const pulsePaths = Array.from(svg.querySelectorAll<SVGPathElement>(".energy-flux-pulse"));
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const field = fieldRef.current;
    let visible = false;
    let blocked = Boolean(document.querySelector("dialog[open]"));
    let frame = 0;
    let lastFrame = 0;
    let lastPaint = 0;
    let disposed = false;
    let targetX = .5;
    let targetY = 0;
    let engaged = false;
    let pulses: Pulse[] = [];
    const motionEnabled = () => !paused && !preference.matches && !blocked;
    const canRun = () => motionEnabled() && visible && !document.hidden;

    function paint() {
      paths.forEach((path, strand) => path.setAttribute("d", strandPath(strand, field)));
      // Highlights follow the same geometry as the strands, never a separate orbit.
      sparks.forEach((spark, index) => {
        const x = (field.phase * .085 + index * .27 + .12) % 1;
        spark.setAttribute("cx", (x * WIDTH).toFixed(2));
        spark.setAttribute("cy", strandY(x, index % 2 ? 5 : 1, field).toFixed(2));
        spark.style.opacity = String(Math.sin(x * Math.PI) * .8);
      });
      pulsePaths.forEach((path, index) => {
        const pulse = pulses[Math.floor(index / 2)];
        if (!pulse) { path.style.opacity = "0"; return; }
        const direction = index % 2 ? 1 : -1;
        const center = pulse.x + pulse.age * .5 * direction;
        let segment = "";
        for (let sample = 0; sample <= 12; sample++) {
          const x = Math.max(0, Math.min(1, center + (sample / 12 - .5) * .09));
          segment += `${sample ? "L" : "M"}${(x * WIDTH).toFixed(1)},${strandY(x, index % 2 ? 5 : 1, field).toFixed(2)}`;
        }
        path.setAttribute("d", segment);
        const edge = Math.max(0, Math.min(1, center * 12, (1 - center) * 12));
        path.style.opacity = String(Math.max(0, 1 - pulse.age / 1.7) * edge);
      });
      root!.dataset.pulsing = String(pulses.length > 0);
    }

    function schedule() {
      if (!frame && !disposed && canRun()) frame = requestAnimationFrame(tick);
    }

    function tick(time: number) {
      frame = 0;
      if (!canRun()) { lastFrame = 0; return; }
      const dt = lastFrame ? Math.min((time - lastFrame) / 1000, .05) : 0;
      lastFrame = time;
      field.phase += dt * .52;
      const easing = 1 - Math.exp(-dt * 7);
      field.x += (targetX - field.x) * easing;
      field.y += (targetY - field.y) * easing;
      field.strength += ((engaged ? 1 : 0) - field.strength) * easing;
      pulses = pulses.filter(pulse => { pulse.age += dt; return pulse.age < 1.7; });
      // Geometry and filter surfaces update at 30fps, independently of display rate.
      if (!lastPaint || time - lastPaint >= 32) { paint(); lastPaint = time; }
      schedule();
    }

    function suspend() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastFrame = 0;
      lastPaint = 0;
      root!.dataset.running = "false";
    }

    function sync() {
      suspend();
      const running = canRun();
      root!.dataset.running = String(running);
      root!.dataset.still = String(!motionEnabled());
      control!.setAttribute("aria-disabled", String(!motionEnabled()));
      if (!running) {
        engaged = false;
        root!.dataset.active = "false";
        pulses = [];
        root!.dataset.pulsing = "false";
        pulsePaths.forEach(path => { path.style.opacity = "0"; });
      }
      schedule();
    }

    function move(event: PointerEvent) {
      if (!canRun() || !event.isPrimary) return;
      const bounds = svg!.getBoundingClientRect();
      targetX = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      targetY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - .5) * 2));
      engaged = true;
      root!.dataset.active = "true";
    }

    function leave() {
      engaged = false;
      targetY = 0;
      root!.dataset.active = "false";
    }

    function send(event: MouseEvent) {
      if (!canRun()) return;
      const bounds = svg!.getBoundingClientRect();
      const x = event.detail === 0 ? .5 : Math.max(.08, Math.min(.92, (event.clientX - bounds.left) / bounds.width));
      pulses = [...pulses.slice(-1), { x, age: 0 }];
      root!.dataset.pulseCount = String(++sequence.current);
      root!.dataset.pulsing = "true";
      paint();
    }

    function modalChange() {
      const next = Boolean(document.querySelector("dialog[open]"));
      if (blocked !== next) { blocked = next; sync(); }
    }

    const intersection = new IntersectionObserver(entries => {
      // A queued batch can contain both an entry and its later exit.
      visible = entries[entries.length - 1]?.isIntersecting ?? false;
      sync();
    });
    // Independently covers nested project/career dialogs as well as app settings.
    const dialogs = new MutationObserver(modalChange);
    dialogs.observe(document.body, { subtree: true, attributes: true, attributeFilter: ["open"] });
    intersection.observe(root);
    control.addEventListener("pointermove", move, { passive: true });
    control.addEventListener("pointerleave", leave, { passive: true });
    control.addEventListener("pointercancel", leave, { passive: true });
    control.addEventListener("pointerup", leave, { passive: true });
    control.addEventListener("blur", leave);
    control.addEventListener("click", send);
    document.addEventListener("visibilitychange", sync);
    preference.addEventListener("change", sync);
    paint();
    sync();
    return () => {
      disposed = true;
      suspend();
      intersection.disconnect();
      dialogs.disconnect();
      control.removeEventListener("pointermove", move);
      control.removeEventListener("pointerleave", leave);
      control.removeEventListener("pointercancel", leave);
      control.removeEventListener("pointerup", leave);
      control.removeEventListener("blur", leave);
      control.removeEventListener("click", send);
      document.removeEventListener("visibilitychange", sync);
      preference.removeEventListener("change", sync);
    };
  }, [paused]);

  return (
    <div ref={rootRef} id="energy-flux" className="energy-flux" data-palette={palette} data-running="false" data-pulse-count="0">
      <button type="button" className="energy-flux-control" aria-label="Send an energy pulse" aria-describedby={`${id}-hint`}>
        <svg className="energy-flux-field" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
          <defs>
            <linearGradient id={`${id}-thread`} x1="0" y1="0" x2={WIDTH} y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="var(--flux-warm)" stopOpacity="0" />
              <stop offset=".12" stopColor="var(--flux-warm)" stopOpacity=".55" />
              <stop offset=".36" stopColor="var(--flux-warm)" />
              <stop offset=".53" stopColor="var(--flux-hot)" />
              <stop offset=".7" stopColor="var(--flux-cool)" />
              <stop offset=".88" stopColor="var(--flux-warm)" stopOpacity=".65" />
              <stop offset="1" stopColor="var(--flux-warm)" stopOpacity="0" />
            </linearGradient>
            <filter id={`${id}-bloom`} x="-5%" y="-60%" width="110%" height="220%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="4.5" />
            </filter>
            {STRANDS.map(strand => <path id={`${id}-strand-${strand}`} key={strand} className="energy-flux-strand" d={strandPath(strand, RESTING_FIELD)} />)}
          </defs>
          <g className="energy-flux-bloom" filter={`url(#${id}-bloom)`} fill="none" stroke={`url(#${id}-thread)`} strokeWidth="5">
            {STRANDS.filter(strand => strand % 2 === 0).map(strand => <use key={strand} href={`#${id}-strand-${strand}`} />)}
          </g>
          <g fill="none" stroke={`url(#${id}-thread)`} strokeLinecap="round">
            {STRANDS.map(strand => <use key={strand} className="energy-flux-thread" href={`#${id}-strand-${strand}`} strokeWidth={strand % 4 === 1 ? 1.65 : .85} opacity={strand % 4 === 1 ? 1 : .66} />)}
          </g>
          <g className="energy-flux-sparks" fill="var(--flux-hot)">
            {[0, 1, 2].map(spark => <circle key={spark} className="energy-flux-spark" cx={(spark * .27 + .12) * WIDTH} cy={strandY(spark * .27 + .12, spark % 2 ? 5 : 1, RESTING_FIELD)} r="1.6" />)}
          </g>
          <g fill="none" stroke="var(--flux-hot)" strokeWidth="3" strokeLinecap="round" className="energy-flux-pulses">
            {[0, 1, 2, 3].map(pulse => <path key={pulse} className="energy-flux-pulse" opacity="0" />)}
          </g>
        </svg>
        <span className="energy-flux-caption" aria-hidden="true"><span><i /> IN THE FLOW</span><span className="energy-flux-invitation"><span className="energy-flux-mouse">MOVE TO BEND · CLICK TO SEND</span><span className="energy-flux-touch">TOUCH THE CURRENT</span><span className="energy-flux-keyboard">PRESS ENTER TO SEND A PULSE</span><span className="energy-flux-still">A STILL MOMENT</span><b>↗︎</b></span></span>
      </button>
      <span className="energy-flux-description" id={`${id}-hint`}>Intertwined light follows your pointer. Click, tap, or press Enter to send a pulse. Motion follows your accessibility and experience settings.</span>
    </div>
  );
}
