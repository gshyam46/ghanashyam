"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AppWindow, ShieldCheck, Waypoints, Webhook, Boxes, BrainCircuit, ListOrdered, Search, Cpu, Workflow, Database, ScanSearch, Layers3, Wrench, Plug } from "lucide-react";
import "./system-map.css";

const parts = [
  { id: "frontend", name: "Interface", detail: "The experience people use", icon: AppWindow, x: .5, y: .12, row: 0 },
  { id: "identity", name: "Identity", detail: "Authentication and access", icon: ShieldCheck, x: .15, y: .29, row: 1 },
  { id: "api", name: "API boundary", detail: "Routing, validation and contracts", icon: Waypoints, x: .5, y: .29, row: 1 },
  { id: "events", name: "Event intake", detail: "Changes entering the system", icon: Webhook, x: .85, y: .29, row: 1 },
  { id: "services", name: "Application services", detail: "The rules that make the product work", icon: Boxes, x: .3, y: .47, row: 2 },
  { id: "agents", name: "Agent orchestration", detail: "Context, decisions and actions", icon: BrainCircuit, x: .57, y: .47, row: 2 },
  { id: "queue", name: "Job queue", detail: "Work scheduled beyond the request", icon: ListOrdered, x: .85, y: .47, row: 2 },
  { id: "retrieval", name: "Retrieval", detail: "Relevant knowledge for the task", icon: Search, x: .3, y: .65, row: 3 },
  { id: "models", name: "Model gateway", detail: "Inference behind a clear boundary", icon: Cpu, x: .57, y: .65, row: 3 },
  { id: "workers", name: "Background workers", detail: "Independent, retryable tasks", icon: Workflow, x: .85, y: .65, row: 3 },
  { id: "data", name: "Primary data", detail: "Durable application state", icon: Database, x: .1, y: .8, row: 4 },
  { id: "vectors", name: "Vector index", detail: "Semantic search over knowledge", icon: ScanSearch, x: .3, y: .8, row: 4 },
  { id: "cache", name: "Cache", detail: "Reuse work that is already done", icon: Layers3, x: .5, y: .8, row: 4 },
  { id: "tools", name: "Agent tools", detail: "Bounded actions outside the model", icon: Wrench, x: .7, y: .8, row: 4 },
  { id: "integrations", name: "Integrations", detail: "Connections to external services", icon: Plug, x: .9, y: .8, row: 4 },
] as const;
type PartId = typeof parts[number]["id"];
const links = [
  ["frontend", "api"], ["identity", "api"], ["api", "events"],
  ["api", "services"], ["services", "agents"], ["events", "queue"],
  ["agents", "retrieval"], ["agents", "models"], ["queue", "workers"],
  ["retrieval", "vectors"], ["services", "data"], ["services", "cache"],
  ["agents", "tools"], ["workers", "integrations"],
] as const;
const circuits = {
  request: [[0,false], [3,false], [4,false], [6,false], [9,false], [9,true], [6,true], [7,false], [7,true], [4,true], [3,true], [0,true]],
  background: [[2,false], [5,false], [8,false], [13,false], [13,true], [8,true], [5,true], [2,true]],
  tools: [[12,false], [12,true]],
  identity: [[1,true], [1,false]],
  data: [[10,false], [10,true]],
  cache: [[11,false], [11,true]],
} as const;
// Overlapping requests make the fan-out visible: application, identity, data
// and background work have their own traffic, each returning along its route.
const transmissions = [
  { circuit: "request", duration: 11200, phase: .06, intensity: 1 },
  { circuit: "request", duration: 11200, phase: .37, intensity: 1 },
  { circuit: "request", duration: 11200, phase: .72, intensity: 1 },
  { circuit: "background", duration: 8700, phase: .21, intensity: .88 },
  { circuit: "background", duration: 8700, phase: .69, intensity: .88 },
  { circuit: "tools", duration: 4100, phase: .13, intensity: .92 },
  { circuit: "identity", duration: 3700, phase: .43, intensity: .88 },
  { circuit: "data", duration: 4600, phase: .17, intensity: .94 },
  { circuit: "cache", duration: 4300, phase: .58, intensity: .9 },
] as const;
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => value * value * (3 - 2 * value);

function ApplicationWindow({ glowId }: { glowId: string }) {
  return <span className="system-map-application" aria-hidden="true">
    <span className="system-map-windowbar"><span className="system-map-window-controls"><i /><i /><i /></span><span>Workspace</span><span className="system-map-window-actions"><Search /><span /></span></span>
    <span className="system-map-app-body">
      <span className="system-map-app-sidebar"><span className="is-current"><AppWindow /></span><span><Layers3 /></span><span><ListOrdered /></span><span className="system-map-app-settings"><Wrench /></span></span>
      <span className="system-map-app-workspace">
        <span className="system-map-app-tabs"><span>Overview</span><span>Activity</span><i>···</i></span>
        <span className="system-map-app-canvas">
          <span className="system-map-canvas-cross is-top">+</span><span className="system-map-canvas-cross is-bottom">+</span>
          <svg className="system-map-seed" viewBox="0 0 140 148" fill="none">
            <defs><radialGradient id={`${glowId}-vision`}><stop stopColor="var(--accent)" stopOpacity=".4" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></radialGradient></defs>
            <path className="system-map-seed-depth" d="M37 70v8l33 53 33-53v-8M70 123v8" />
            <path className="system-map-seed-face" d="m70 17 33 53-33 53-33-53Z" />
            <circle cx="70" cy="70" r="24" fill={`url(#${glowId}-vision)`} />
            <circle className="system-map-seed-orbit" cx="70" cy="70" r="10" /><circle className="system-map-seed-core" cx="70" cy="70" r="3" />
          </svg>
        </span>
        <span className="system-map-app-status"><span><i />Workspace</span><span className="system-map-app-view"><i /><i /><i /></span></span>
      </span>
    </span>
  </span>;
}

export default function SystemMap({ paused }: { paused: boolean }) {
  const glowId = useId();
  const figureRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(paused);
  const invalidateRef = useRef<(() => void) | null>(null);
  const [selected, setSelected] = useState<PartId | null>(null);
  const active = parts.find(part => part.id === selected);
  useEffect(() => { pausedRef.current = paused; invalidateRef.current?.(); }, [paused]);

  useEffect(() => {
    const figure = figureRef.current, track = trackRef.current, stage = stageRef.current;
    if (!figure || !track || !stage) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const unpinned = matchMedia("(max-height: 520px)");
    const mobile = matchMedia("(max-width: 700px)");
    const nodes = Object.fromEntries(parts.map(part => [part.id, stage.querySelector<HTMLButtonElement>(`[data-node="${part.id}"]`)!])) as Record<PartId, HTMLButtonElement>;
    const paths = Array.from(stage.querySelectorAll<SVGPathElement>(".system-map-link"));
    const packets = Array.from(stage.querySelectorAll<SVGCircleElement>(".system-map-packet"));
    const trails = Array.from(stage.querySelectorAll<SVGPathElement>(".system-map-trail"));
    const vision = stage.querySelector<HTMLElement>(".system-map-vision")!;
    const application = stage.querySelector<HTMLElement>(".system-map-application")!;
    const wires = stage.querySelector<SVGSVGElement>(".system-map-wires")!;
    const context = stage.querySelector<HTMLElement>(".system-map-context")!;
    let width = 1, height = 1, stickyTop = 0, runway = 0, revealDistance = 274, nodeSize = 44;
    let applicationWidth = 220, applicationHeight = 136, applicationScale = 1;
    let visible = false, disposed = false, layoutDirty = true;
    let frame = 0, lastTime = 0, lastPacketTime = 0, current = 0, target = 0;
    const points = {} as Record<PartId, { x: number; y: number }>;
    const lengths: number[] = [];
    const nodeEnergy = new Map<PartId, number>();
    let lastEnergyTime = 0;
    // Viewport dimensions change the layout, never the visitor's motion setting.
    const still = () => pausedRef.current || reduced.matches;

    function setFlow(running: boolean) {
      figure!.dataset.flow = running ? "running" : "still";
      if (!running) {
        packets.forEach(packet => { packet.style.opacity = "0"; });
        trails.forEach(trail => { trail.style.opacity = "0"; });
        nodeEnergy.clear(); lastEnergyTime = 0;
        parts.forEach(part => nodes[part.id].style.setProperty("--node-energy", "0"));
      }
    }

    function drawLayout() {
      const opening = smooth(clamp(current));
      // Clear the introductory copy before the engineering occupies its space.
      vision.style.opacity = String(1 - smooth(clamp(current / .22)));
      vision.style.transform = `translate(-50%, 0) translateY(${-opening * height * .56}px) scale(${1 - opening * .05})`;
      vision.style.filter = `blur(${opening * 3}px)`;
      // The opening window IS the Interface node. Carry the same element to its
      // place in the system, keeping its silhouette visible throughout the move.
      const docking = smooth(clamp(current / .52));
      applicationScale = 1 + (52 / applicationWidth - 1) * docking;
      application.style.transform = `translate(-50%, -50%) scale(${applicationScale})`;
      application.style.borderWidth = `${1 / applicationScale}px`;
      application.style.borderRadius = `${(8 - docking * 4) / applicationScale}px`;
      application.style.setProperty("--application-detail", String(1 - smooth(clamp(current / .48))));
      parts.forEach(part => {
        const isInterface = part.id === "frontend";
        const amount = smooth(clamp((current - part.row * .035) / (.72 - part.row * .035)));
        const x = width * (.5 + (part.x - .5) * amount);
        const y = isInterface ? height * (.32 + (part.y - .32) * docking) : height * (.48 + (part.y - .48) * amount);
        points[part.id] = { x, y };
        const node = nodes[part.id];
        node.style.transform = `translate3d(${(x - nodeSize / 2).toFixed(2)}px, ${(y - nodeSize / 2).toFixed(2)}px, 0) scale(${isInterface ? 1 : .65 + amount * .35})`;
        node.style.opacity = String(isInterface ? 1 : clamp((current - .13 - part.row * .018) / .3));
        node.tabIndex = current > .65 ? 0 : -1;
        node.style.pointerEvents = current > .65 ? "auto" : "none";
      });
      paths.forEach((path, index) => {
        const [from, to] = links[index], a = points[from], b = points[to];
        const offset = nodeSize / 2 + 3;
        const fromOffset = from === "frontend" ? applicationHeight * applicationScale / 2 + 3 : offset;
        const down = b.y > a.y + nodeSize / 2;
        const right = b.x > a.x;
        let d: string;
        if (!down) {
          d = `M${a.x + (right ? offset : -offset)} ${a.y}H${b.x + (right ? -offset : offset)}`;
        } else if (from === "services" && to === "data") {
          const rail = width * .1;
          d = `M${a.x - offset} ${a.y}H${rail}V${b.y - offset}`;
        } else if (from === "services" && to === "cache") {
          const rail = width * .435;
          d = `M${a.x + offset} ${a.y}H${rail}V${height * .76}H${b.x}V${b.y - offset}`;
        } else if (from === "agents" && to === "tools") {
          const rail = width * .705;
          d = `M${a.x + offset} ${a.y}H${rail}V${b.y - offset}H${b.x}`;
        } else {
          const mid = (a.y + b.y) / 2;
          d = `M${a.x} ${a.y + fromOffset}V${mid}H${b.x}V${b.y - offset}`;
        }
        path.setAttribute("d", d);
        path.style.opacity = String(clamp((current - .28) / .35));
        lengths[index] = path.getTotalLength();
      });
      context.style.opacity = String(clamp((current - .45) / .3));
      figure!.dataset.expansion = current.toFixed(3);
      figure!.dataset.animation = still() ? "still" : "scroll";
      layoutDirty = false;
    }

    function drawPackets(time: number) {
      const energy = new Map<PartId, number>();
      const decay = Math.exp(-Math.min(100, lastEnergyTime ? time - lastEnergyTime : 33) / 240);
      lastEnergyTime = time;
      packets.forEach((packet, index) => {
        const transmission = transmissions[index];
        const circuit = circuits[transmission.circuit];
        const clock = (time / transmission.duration + transmission.phase) % 1;
        const step = Math.min(circuit.length - 1, Math.floor(clock * circuit.length));
        const [pathIndex, reverse] = circuit[step];
        const path = paths[pathIndex], length = lengths[pathIndex] || 0;
        const progress = (clock * circuit.length) % 1;
        const distance = length * (reverse ? 1 - progress : progress);
        const position = path.getPointAtLength(distance);
        const reveal = smooth(clamp((current - .38) / .18));
        const opacity = Math.min(1, progress * 16, (1 - progress) * 16) * transmission.intensity * reveal;
        packet.setAttribute("cx", String(position.x));
        packet.setAttribute("cy", String(position.y));
        packet.dataset.connection = links[pathIndex].join("-");
        packet.dataset.direction = reverse ? "response" : "request";
        packet.style.opacity = String(opacity);
        const trail = trails[index];
        trail.setAttribute("d", path.getAttribute("d") || "");
        const tail = Math.min(mobile.matches ? 8 : 12, length * .4);
        trail.style.strokeDasharray = `${tail} ${length + tail}`;
        trail.style.strokeDashoffset = String((reverse ? 0 : tail) - distance);
        trail.style.opacity = String(opacity * .82);
        const [from, to] = links[pathIndex];
        const arriving = reverse ? from : to, leaving = reverse ? to : from;
        energy.set(arriving, Math.max(energy.get(arriving) || 0, clamp((progress - .7) / .3) * reveal));
        energy.set(leaving, Math.max(energy.get(leaving) || 0, clamp(1 - progress * 4) * reveal));
      });
      parts.forEach(part => {
        const value = Math.max(energy.get(part.id) || 0, (nodeEnergy.get(part.id) || 0) * decay);
        nodeEnergy.set(part.id, value);
        nodes[part.id].style.setProperty("--node-energy", String(value));
      });
    }

    function schedule() {
      if (!frame && visible && !disposed && !document.hidden) frame = requestAnimationFrame(render);
    }
    function render(time: number) {
      frame = 0;
      if (!visible || disposed || document.hidden) return;
      const dt = lastTime ? Math.min(64, time - lastTime) : 16.7;
      lastTime = time;
      const difference = target - current;
      current += difference * (still() ? 1 : 1 - Math.exp(-dt / 70));
      if (Math.abs(target - current) < .0005) current = target;
      const settling = Math.abs(target - current) > .0005;
      if (layoutDirty || Math.abs(difference) > .0001) drawLayout();
      const flowing = current >= .48 && !still();
      setFlow(flowing);
      if (flowing && time - lastPacketTime >= 33) { drawPackets(time); lastPacketTime = time; }
      if (settling || flowing) schedule(); else lastTime = 0;
    }
    function measureProgress() {
      const start = unpinned.matches ? innerHeight * .65 : stickyTop;
      const distance = unpinned.matches ? Math.min(240, innerHeight * .6) : revealDistance;
      const elapsed = -track!.getBoundingClientRect().top + start;
      target = still() ? 1 : clamp(elapsed / Math.max(1, distance));
      if (still()) setFlow(false);
      layoutDirty = true;
      schedule();
    }
    function resize() {
      width = stage!.clientWidth; height = stage!.clientHeight;
      nodeSize = nodes.frontend.offsetWidth;
      applicationWidth = application.offsetWidth; applicationHeight = application.offsetHeight;
      stickyTop = Math.max(mobile.matches ? 90 : 112, (innerHeight - height) * .5);
      // Keep the original Vision-to-components pace independent of the hold.
      // Nodes finish opening at .72; release the stage just 32px later.
      revealDistance = mobile.matches ? 216 : 274;
      runway = reduced.matches || unpinned.matches ? 0 : Math.round(revealDistance * .72 + 32);
      figure!.style.setProperty("--system-sticky-top", `${stickyTop}px`);
      figure!.style.setProperty("--system-runway", `${runway}px`);
      figure!.style.setProperty("--system-reveal-distance", `${revealDistance}px`);
      figure!.dataset.layout = reduced.matches ? "static" : unpinned.matches ? "flow" : "sticky";
      wires.setAttribute("viewBox", `0 0 ${width} ${height}`);
      measureProgress();
      if (!visible) { current = target; drawLayout(); }
    }
    function visibilityChange() {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0; lastTime = 0; setFlow(false); }
      else measureProgress();
    }
    const intersection = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) measureProgress();
      else { cancelAnimationFrame(frame); frame = 0; lastTime = 0; setFlow(false); }
    });
    const resizeObserver = new ResizeObserver(resize);
    invalidateRef.current = measureProgress;
    resize(); intersection.observe(stage); resizeObserver.observe(stage);
    window.addEventListener("scroll", measureProgress, { passive: true });
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", visibilityChange);
    reduced.addEventListener("change", resize); unpinned.addEventListener("change", resize); mobile.addEventListener("change", resize);
    return () => {
      disposed = true; cancelAnimationFrame(frame); intersection.disconnect(); resizeObserver.disconnect(); invalidateRef.current = null;
      window.removeEventListener("scroll", measureProgress); window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibilityChange);
      reduced.removeEventListener("change", resize); unpinned.removeEventListener("change", resize); mobile.removeEventListener("change", resize);
    };
  }, []);

  return <figure ref={figureRef} className="system-map" data-expansion="0.000" data-animation="scroll" data-flow="still" aria-labelledby="system-map-caption" aria-describedby="system-map-description">
    <figcaption id="system-map-caption"><span className="system-map-index">INSIDE THE PRODUCT</span><p>Software,<br /><em>engineered end to end.</em></p><span className="system-map-intro">I build interfaces, backend systems, and AI workflows.</span></figcaption>
    <p className="sr-only" id="system-map-description">A compact application window with an elongated diamond at its centre shrinks and moves into the Interface component as the engineering behind the product opens beneath it. Its interface calls authenticated APIs and application services. Agents use retrieval, vector search, models and tools. Event intake connects queues, workers and integrations. Data and caching support application services; observability spans the system. Animated glows illustrate requests and responses. Focus or tap a component to inspect its role.</p>
    <div className="system-map-track" ref={trackRef}><div className="system-map-stage" ref={stageRef}>
      <div className="system-map-vision" aria-hidden="true">
        <span className="system-map-overline">THE EXPERIENCE COMES FIRST</span><p>One useful idea.</p><span className="system-map-scroll-hint">SCROLL TO SEE THE ENGINEERING WITHIN <span>↓︎</span></span>
      </div>
      <svg className="system-map-wires" aria-hidden="true" preserveAspectRatio="none">
        <defs><radialGradient id={`${glowId}-signal`}><stop stopColor="var(--accent)" stopOpacity=".7" /><stop offset=".18" stopColor="var(--accent)" stopOpacity=".4" /><stop offset="1" stopColor="var(--accent)" stopOpacity="0" /></radialGradient></defs>
        {links.map(([from, to]) => <path className="system-map-link" data-connection={`${from}-${to}`} key={`${from}-${to}`} />)}
        {transmissions.map((transmission, index) => <path className="system-map-trail" data-circuit={transmission.circuit} key={`trail-${index}`} />)}
        {transmissions.map((transmission, index) => <circle className="system-map-packet" data-packet={index} data-circuit={transmission.circuit} fill={`url(#${glowId}-signal)`} r="6" key={index} />)}
      </svg>
      {parts.map(part => <button type="button" className="system-map-node" data-node={part.id} key={part.id} aria-label={`${part.name}: ${part.detail}`} aria-pressed={selected === part.id} aria-describedby="system-map-inspection" tabIndex={-1} onMouseEnter={() => setSelected(part.id)} onMouseLeave={() => setSelected(null)} onFocus={() => setSelected(part.id)} onBlur={() => setSelected(null)} onClick={() => setSelected(part.id)}>{part.id === "frontend" ? <ApplicationWindow glowId={glowId} /> : <part.icon aria-hidden="true" strokeWidth={1.2} />}<span className="system-map-node-energy" aria-hidden="true" /></button>)}
      <div className="system-map-context"><span className="system-map-observability"><span aria-hidden="true" />Observability across the system</span><div className="system-map-inspection" id="system-map-inspection" role="status"><strong>{active?.name || "Designed to work together."}</strong><span>{active?.detail || "Inspect a component to see its role."}</span></div></div>
    </div></div>
  </figure>;
}
