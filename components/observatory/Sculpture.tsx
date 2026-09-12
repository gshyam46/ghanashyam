"use client";

import { useEffect, useId, useRef, useState } from "react";
import * as THREE from "three";
import { createArmillary, getArmillaryRestPose } from "./armillary";

type SceneName = "signal" | "systems" | "practice" | "contact";
type PaletteName = "copper" | "silver" | "ink";

export interface SculptureProps {
  scene?: SceneName;
  palette?: PaletteName;
  paused?: boolean;
}

const TAU = Math.PI * 2;

const PALETTES = {
  copper: { dust: "#e7b99c", exposure: .93 },
  silver: { dust: "#bcd1ca", exposure: .98 },
  ink: { dust: "#5e6c61", exposure: 1.0 },
};

const SCENES: Record<SceneName, { x: number; y: number; z: number; scale: number }> = {
  signal: { x: -0.36, y: 0.34, z: -0.23, scale: .94 },
  systems: { x: 0.19, y: -0.39, z: 0.24, scale: 0.96 },
  practice: { x: -0.56, y: 0.69, z: -0.63, scale: 0.94 },
  contact: { x: 0.15, y: 0.07, z: 0.5, scale: 1.02 },
};

/** Reflections from a small procedural studio; no HDR file or network request. */
function createStudioEnvironment(renderer: THREE.WebGLRenderer) {
  const width = 256;
  const height = 128;
  const data = new Float32Array(width * height * 4);
  const softbox = (u: number, v: number, x: number, y: number, sx: number, sy: number) =>
    Math.exp(-((u - x) ** 2 / sx + (v - y) ** 2 / sy));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const u = x / width;
      const v = y / height;
      const key = softbox(u, v, 0.22, 0.35, 0.005, 0.09) * 7.5;
      const fill = softbox(u, v, 0.73, 0.42, 0.004, 0.09) * 2;
      const top = softbox(u, v, 0.48, 0.08, 0.1, 0.003) * 3.2;
      const bottom = softbox(u, v, 0.51, 0.85, 0.11, 0.008) * 0.4;
      const index = (y * width + x) * 4;
      data[index] = 0.015 + key + fill * 0.72 + top + bottom;
      data[index + 1] = 0.018 + key * 0.86 + fill * 0.88 + top * 0.95 + bottom * 0.7;
      data[index + 2] = 0.02 + key * 0.73 + fill + top * 0.87 + bottom * 0.5;
      data[index + 3] = 1;
    }
  }

  const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat, THREE.FloatType);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.needsUpdate = true;
  const generator = new THREE.PMREMGenerator(renderer);
  const environment = generator.fromEquirectangular(texture);
  texture.dispose();
  generator.dispose();
  return environment;
}

function createDust() {
  const positions = new Float32Array(54 * 3);
  const sizes = new Float32Array(54);
  for (let index = 0; index < 54; index++) {
    const seed = Math.sin(index * 127.1 + 311.7) * 43758.5453123;
    const fraction = seed - Math.floor(seed);
    const angle = index * 2.39996;
    const radius = 2.7 + fraction * 1.8;
    positions[index * 3] = Math.cos(angle) * radius;
    positions[index * 3 + 1] = Math.sin(angle) * radius * 0.8;
    positions[index * 3 + 2] = (fraction - 0.5) * 3;
    sizes[index] = 0.7 + fraction * 1.25;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("pointSize", new THREE.BufferAttribute(sizes, 1));
  const material = new THREE.ShaderMaterial({
    uniforms: { color: { value: new THREE.Color(PALETTES.copper.dust) }, pixelRatio: { value: 1 } },
    vertexShader: `
      attribute float pointSize;
      uniform float pixelRatio;
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = pointSize * pixelRatio;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        float distanceFromCenter = length(gl_PointCoord - vec2(0.5));
        float alpha = (1.0 - smoothstep(0.12, 0.5, distanceFromCenter)) * 0.42;
        gl_FragColor = vec4(color, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }
    `,
    transparent: true,
    depthWrite: false,
  });
  return new THREE.Points(geometry, material);
}

/** The same open ring silhouette remains available without a graphics context. */
function StaticSculpture({ palette }: { palette: PaletteName }) {
  const id = useId().replace(/:/g, "");
  const ink = palette === "ink";
  const silver = palette === "silver";
  const metal = ink ? "#536653" : silver ? "#a5b6b0" : "#bb825a";
  const highlight = ink ? "#93a28c" : silver ? "#e3eae1" : "#edc8a0";
  const dark = ink ? "#22382a" : silver ? "#40534e" : "#50311f";
  const pose = new THREE.Euler(SCENES.signal.x, SCENES.signal.y, SCENES.signal.z);
  const rings = getArmillaryRestPose();
  const arcs: { path: string; depth: number; width: number }[] = [];
  const ticks: { x1: number; y1: number; x2: number; y2: number; depth: number }[] = [];
  const project = (radius: number, angle: number, rotation: THREE.Matrix4) =>
    new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0).applyMatrix4(rotation).applyEuler(pose).multiplyScalar(SCENES.signal.scale);
  rings.forEach(ring => {
    const rotation = ring.transform;
    for (let half = 0; half < 2; half++) {
      // Small adjacent strips establish depth ordering at the ring crossings.
      for (let segment = 0; segment < 12; segment++) {
        const points = Array.from({ length: 5 }, (_, step) => project(ring.radius, (half * 12 + segment + step / 4) / 24 * TAU, rotation));
        arcs.push({ path: points.map((p, i) => `${i ? "L" : "M"}${(300 + p.x * 104).toFixed(2)},${(300 - p.y * 104).toFixed(2)}`).join(" "), depth: points[2].z, width: ring.width * 104 * SCENES.signal.scale });
      }
    }
    for (let tick = 0; tick < 32; tick++) {
      const angle = tick / 32 * TAU;
      const a = project(ring.radius + .023, angle, rotation);
      const b = project(ring.radius - (tick % 4 === 0 ? .055 : .017), angle, rotation);
      ticks.push({ x1: 300 + a.x * 104, y1: 300 - a.y * 104, x2: 300 + b.x * 104, y2: 300 - b.y * 104, depth: a.z });
    }
  });
  const drawArcs = (front: boolean) => arcs.filter(arc => (arc.depth >= 0) === front).sort((a,b) => a.depth - b.depth).map((arc,index) => (
    <g key={index}>
      <path d={arc.path} stroke={dark} strokeWidth={arc.width + 2} />
      <path d={arc.path} stroke={`url(#armillary-metal-${id})`} strokeWidth={arc.width} />
      <path d={arc.path} stroke={highlight} strokeWidth=".6" opacity=".35" />
    </g>
  ));
  const drawTicks = (front: boolean) => ticks.filter(tick => (tick.depth >= 0) === front).map((tick,index) => (
    <line key={index} x1={tick.x1} y1={tick.y1} x2={tick.x2} y2={tick.y2} stroke={dark} strokeWidth="1.1" />
  ));
  return (
    <svg viewBox="0 0 600 600" width="100%" height="100%" fill="none" aria-hidden="true" data-static-armillary="true">
      <defs>
        <linearGradient id={`armillary-metal-${id}`} x1="90" y1="65" x2="480" y2="520" gradientUnits="userSpaceOnUse">
          <stop stopColor={dark} /><stop offset=".22" stopColor={highlight} /><stop offset=".46" stopColor={metal} /><stop offset=".72" stopColor={highlight} /><stop offset="1" stopColor={dark} />
        </linearGradient>
        <radialGradient id={`armillary-core-${id}`} cx=".32" cy=".26" r=".75">
          <stop stopColor={ink ? "#60715f" : "#4c4b40"} /><stop offset=".48" stopColor={ink ? "#334634" : "#252923"} /><stop offset="1" stopColor={ink ? "#19291e" : "#101811"} />
        </radialGradient>
      </defs>
      <g strokeLinecap="round" strokeLinejoin="round">{drawArcs(false)}{drawTicks(false)}</g>
      <circle cx="300" cy="300" r="50" fill={`url(#armillary-core-${id})`} stroke={dark} strokeWidth="2" />
      <ellipse cx="300" cy="300" rx="49" ry="13" transform="rotate(-18 300 300)" stroke={metal} strokeWidth=".8" opacity=".65" />
      <g strokeLinecap="round" strokeLinejoin="round">{drawArcs(true)}{drawTicks(true)}</g>
    </svg>
  );
}

export default function Sculpture({ scene = "signal", palette = "copper", paused = false }: SculptureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({ scene, palette, paused });
  const invalidateRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    propsRef.current = { scene, palette, paused };
    invalidateRef.current?.();
  }, [scene, palette, paused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const markRenderState = (state: "webgl" | "fallback") => {
      container.dataset.renderState = state;
      container.dispatchEvent(new CustomEvent("observatory:sculpture-ready", { bubbles: true, detail: { state } }));
    };

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      // The fully rendered SVG remains available on devices without a graphics context.
      markRenderState("fallback");
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compact = container.clientWidth < 620;
    const world = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-3, 3, 3, -3, 0.1, 50);
    camera.position.set(0, 0, 10);
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = !compact;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMappingExposure = PALETTES[propsRef.current.palette].exposure;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.cssText = "position:absolute;inset:0;display:block;width:100%;height:100%;outline:none;";
    container.appendChild(renderer.domElement);

    let environment: THREE.WebGLRenderTarget | undefined;
    let instrument: ReturnType<typeof createArmillary>;
    try {
      environment = createStudioEnvironment(renderer);
      world.environment = environment.texture;
      instrument = createArmillary(compact, propsRef.current.palette);
    } catch {
      environment?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      markRenderState("fallback");
      return;
    }
    const initialPalette = PALETTES[propsRef.current.palette];
    const sculpture = instrument.group;
    const initialScene = SCENES[propsRef.current.scene];
    sculpture.rotation.set(initialScene.x, initialScene.y, initialScene.z);
    sculpture.scale.setScalar(initialScene.scale);
    world.add(sculpture);
    sculpture.traverse(object => {
      if (object instanceof THREE.Mesh && /Bevelled satin|Ceramic centre/.test(object.name)) {
        object.castShadow = !compact;
        object.receiveShadow = !compact;
      }
    });
    const raycaster = new THREE.Raycaster();
    const pickPoint = new THREE.Vector2();

    const key = new THREE.DirectionalLight("#ffe1c0", 1.7);
    key.position.set(-3, 5, 5);
    key.castShadow = !compact;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = key.shadow.camera.bottom = -2.7;
    key.shadow.camera.right = key.shadow.camera.top = 2.7;
    key.shadow.camera.near = 1;
    key.shadow.camera.far = 14;
    key.shadow.camera.updateProjectionMatrix();
    key.shadow.normalBias = .018;
    key.shadow.bias = -.0002;
    world.add(key);
    const fill = new THREE.DirectionalLight("#bdcbc5", 0.32);
    fill.position.set(4, -1, 2);
    world.add(fill);
    const rim = new THREE.DirectionalLight("#e9b382", 0.9);
    rim.position.set(0, 2, -3);
    world.add(rim);
    world.add(new THREE.AmbientLight("#dedbd1", 0.18));

    const dust = createDust();
    dust.material.uniforms.pixelRatio.value = renderer.getPixelRatio();
    world.add(dust);

    let animationFrame = 0;
    let disposed = false;
    let inView = true;
    let contextLost = false;
    let firstFrameRendered = false;
    let lastTime = 0;
    let elapsed = 0;
    let dragging = false;
    let previousX = 0;
    let previousY = 0;
    let dragX = 0;
    let dragY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let lastPointerTime = 0;
    let pointerX = 0;
    let pointerY = 0;
    let pointerInside = false;
    let pointerClientX = 0;
    let pointerClientY = 0;
    const targetDust = new THREE.Color(initialPalette.dust);

    function requestFrame() {
      if (!disposed && !contextLost && !animationFrame && inView && !document.hidden) {
        animationFrame = window.requestAnimationFrame(render);
      }
    }

    function render(time: number) {
      animationFrame = 0;
      if (disposed || contextLost || !inView || document.hidden) return;
      const dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
      lastTime = time;
      const reduced = media.matches;
      const active = !propsRef.current.paused && !reduced;
      if (active && !dragging) {
        elapsed += dt;
        dragX += velocityX * dt;
        dragY = THREE.MathUtils.clamp(dragY + velocityY * dt, -1.4, 1.4);
        const friction = Math.exp(-dt * 4.8);
        velocityX *= friction;
        velocityY *= friction;
        if (Math.abs(velocityX) < .0005) velocityX = 0;
        if (Math.abs(velocityY) < .0005) velocityY = 0;
      } else if (!active) { velocityX = 0; velocityY = 0; }
      const pose = SCENES[propsRef.current.scene];
      const theme = PALETTES[propsRef.current.palette];
      const ease = reduced ? 1 : 1 - Math.exp(-dt * 3.8);
      const targetX = pose.x + dragY + (active ? pointerY * 0.045 : 0) + Math.sin(elapsed * 0.15) * 0.035;
      const targetY = pose.y + dragX + (active ? pointerX * 0.06 : 0) + Math.sin(elapsed * 0.12) * 0.10;
      const targetZ = pose.z + Math.sin(elapsed * 0.09) * 0.055;
      sculpture.rotation.x = THREE.MathUtils.lerp(sculpture.rotation.x, targetX, ease);
      sculpture.rotation.y = THREE.MathUtils.lerp(sculpture.rotation.y, targetY, ease);
      sculpture.rotation.z = THREE.MathUtils.lerp(sculpture.rotation.z, targetZ, ease);
      sculpture.scale.setScalar(THREE.MathUtils.lerp(sculpture.scale.x, pose.scale, ease));
      sculpture.position.y = Math.sin(elapsed * 0.27) * 0.04;
      const instrumentMotion = instrument.update(elapsed, propsRef.current.scene, propsRef.current.palette, ease);
      targetDust.set(theme.dust);
      dust.material.uniforms.color.value.lerp(targetDust, ease);
      renderer.toneMappingExposure = THREE.MathUtils.lerp(renderer.toneMappingExposure, theme.exposure, ease);
      dust.rotation.z = elapsed * 0.007;
      try {
        renderer.render(world, camera);
      } catch {
        contextLost = true;
        firstFrameRendered = false;
        renderer.domElement.style.visibility = "hidden";
        setReady(false);
        markRenderState("fallback");
        return;
      }
      if (!firstFrameRendered) {
        firstFrameRendered = true;
        setReady(true);
        markRenderState("webgl");
      }
      if (pointerInside && !dragging) updateDragHit(pointerClientX, pointerClientY);

      const motionLeft = Math.abs(sculpture.rotation.x - targetX) + Math.abs(sculpture.rotation.y - targetY)
        + Math.abs(sculpture.rotation.z - targetZ) + Math.abs(sculpture.scale.x - pose.scale);
      if (active || motionLeft > 0.0001 || instrumentMotion > 0.0001) requestFrame();
    }

    function resize() {
      const width = Math.max(container!.clientWidth, 1);
      const height = Math.max(container!.clientHeight, 1);
      const aspect = width / height;
      const halfHeight = aspect < 0.95 ? 2.72 / aspect : 2.87;
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      requestFrame();
    }

    function updateDragHit(clientX: number, clientY: number) {
      const bounds = container!.getBoundingClientRect();
      let hit = false;
      if (!contextLost && propsRef.current.scene === "signal"
        && clientX >= bounds.left && clientX <= bounds.right
        && clientY >= bounds.top && clientY <= bounds.bottom) {
        pickPoint.set(
          ((clientX - bounds.left) / bounds.width) * 2 - 1,
          1 - ((clientY - bounds.top) / bounds.height) * 2,
        );
        sculpture.updateWorldMatrix(true, true);
        camera.updateWorldMatrix(true, false);
        raycaster.setFromCamera(pickPoint, camera);
        hit = raycaster.intersectObjects(instrument.pickTargets, true).length > 0;
      }
      const value = String(hit);
      const cursor = dragging ? "grabbing" : hit ? "grab" : "default";
      if (container!.dataset.dragHit !== value) container!.dataset.dragHit = value;
      if (container!.style.cursor !== cursor) container!.style.cursor = cursor;
      return hit;
    }

    function pointerDown(event: PointerEvent) {
      if (event.button !== 0 || !updateDragHit(event.clientX, event.clientY)) return;
      dragging = true;
      container!.dataset.dragging = "true";
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      previousX = event.clientX;
      previousY = event.clientY;
      velocityX = 0;
      velocityY = 0;
      lastPointerTime = event.timeStamp;
      if (event.pointerType === "mouse") container!.focus({ preventScroll: true });
      container!.setPointerCapture(event.pointerId);
      container!.style.cursor = "grabbing";
      requestFrame();
    }

    function pointerMove(event: PointerEvent) {
      pointerInside = true;
      pointerClientX = event.clientX;
      pointerClientY = event.clientY;
      const bounds = container!.getBoundingClientRect();
      pointerX = event.pointerType === "mouse" ? ((event.clientX - bounds.left) / bounds.width - 0.5) * 2 : 0;
      pointerY = event.pointerType === "mouse" ? ((event.clientY - bounds.top) / bounds.height - 0.5) * 2 : 0;
      if (dragging) {
        const deltaX = (event.clientX - previousX) * 0.006;
        const deltaY = (event.clientY - previousY) * 0.004;
        const deltaTime = Math.max((event.timeStamp - lastPointerTime) / 1000, 1 / 120);
        dragX += deltaX;
        dragY = THREE.MathUtils.clamp(dragY + deltaY, -1.4, 1.4);
        velocityX = THREE.MathUtils.lerp(velocityX, THREE.MathUtils.clamp(deltaX / deltaTime, -2.5, 2.5), .55);
        velocityY = THREE.MathUtils.lerp(velocityY, THREE.MathUtils.clamp(deltaY / deltaTime, -1.5, 1.5), .55);
        lastPointerTime = event.timeStamp;
        previousX = event.clientX;
        previousY = event.clientY;
      } else updateDragHit(event.clientX, event.clientY);
      requestFrame();
    }

    function pointerUp(event: PointerEvent) {
      if (event.type === "pointercancel" || event.timeStamp - lastPointerTime > 100) { velocityX = 0; velocityY = 0; }
      dragging = false;
      container!.dataset.dragging = "false";
      if (container!.hasPointerCapture(event.pointerId)) container!.releasePointerCapture(event.pointerId);
      updateDragHit(event.clientX, event.clientY);
      requestFrame();
    }

    function lostPointerCapture() {
      if (!dragging) return;
      velocityX = 0;
      velocityY = 0;
      dragging = false;
      container!.dataset.dragging = "false";
      updateDragHit(pointerClientX, pointerClientY);
    }

    function pointerLeave() {
      pointerInside = false;
      pointerX = 0;
      pointerY = 0;
      if (!dragging) {
        container!.dataset.dragHit = "false";
        container!.style.cursor = "default";
      }
      requestFrame();
    }

    function keyDown(event: KeyboardEvent) {
      if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "r", "R"].includes(event.key)) return;
      event.preventDefault();
      velocityX = 0;
      velocityY = 0;
      if (event.key === "ArrowLeft") dragX -= 0.2;
      if (event.key === "ArrowRight") dragX += 0.2;
      if (event.key === "ArrowUp") dragY -= 0.2;
      if (event.key === "ArrowDown") dragY += 0.2;
      dragY = THREE.MathUtils.clamp(dragY, -1.4, 1.4);
      if (event.key.toLowerCase() === "r") { dragX = 0; dragY = 0; }
      requestFrame();
    }

    function visibilityChange() {
      lastTime = 0;
      if (document.hidden) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      } else requestFrame();
    }

    function onContextLost(event: Event) {
      event.preventDefault();
      contextLost = true;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      renderer.domElement.style.visibility = "hidden";
      dragging = false;
      container!.dataset.dragHit = "false";
      container!.dataset.dragging = "false";
      container!.style.cursor = "default";
      setReady(false);
      firstFrameRendered = false;
      markRenderState("fallback");
    }

    function onContextRestored() {
      // Render-target contents are lost with the context; rebuild the studio reflections.
      try {
        environment?.dispose();
        environment = createStudioEnvironment(renderer);
        world.environment = environment.texture;
      } catch {
        return;
      }
      contextLost = false;
      renderer.domElement.style.visibility = "visible";
      requestFrame();
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    const intersectionObserver = new IntersectionObserver(entries => {
      inView = entries[entries.length - 1]?.isIntersecting ?? false;
      lastTime = 0;
      if (inView) requestFrame();
      else {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        if (!firstFrameRendered) markRenderState("fallback");
      }
    }, { threshold: 0 });
    intersectionObserver.observe(container);
    container.addEventListener("pointerdown", pointerDown);
    container.addEventListener("pointerenter", pointerMove);
    container.addEventListener("pointermove", pointerMove);
    container.addEventListener("pointerup", pointerUp);
    container.addEventListener("pointercancel", pointerUp);
    container.addEventListener("lostpointercapture", lostPointerCapture);
    container.addEventListener("pointerleave", pointerLeave);
    container.addEventListener("keydown", keyDown);
    document.addEventListener("visibilitychange", visibilityChange);
    media.addEventListener("change", requestFrame);
    renderer.domElement.addEventListener("webglcontextlost", onContextLost);
    renderer.domElement.addEventListener("webglcontextrestored", onContextRestored);
    invalidateRef.current = requestFrame;
    resize();

    return () => {
      disposed = true;
      invalidateRef.current = null;
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      container.removeEventListener("pointerdown", pointerDown);
      container.removeEventListener("pointerenter", pointerMove);
      container.removeEventListener("pointermove", pointerMove);
      container.removeEventListener("pointerup", pointerUp);
      container.removeEventListener("pointercancel", pointerUp);
      container.removeEventListener("lostpointercapture", lostPointerCapture);
      container.removeEventListener("pointerleave", pointerLeave);
      container.removeEventListener("keydown", keyDown);
      document.removeEventListener("visibilitychange", visibilityChange);
      media.removeEventListener("change", requestFrame);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      renderer.domElement.removeEventListener("webglcontextrestored", onContextRestored);
      instrument.dispose();
      key.shadow.dispose();
      dust.geometry.dispose();
      dust.material.dispose();
      environment?.dispose();
      world.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="signal-sculpture"
      data-sculpture="armillary"
      data-render-state="loading"
      data-drag-hit="false"
      data-dragging="false"
      role="img"
      aria-label={`A kinetic armillary with five nested metallic rings and a ceramic centre.${ready ? " Drag or use arrow keys to rotate; press R to reset." : ""}`}
      tabIndex={ready ? 0 : -1}
      style={{ position: "absolute", inset: 0, cursor: "default", touchAction: "pan-y" }}
    >
      <div style={{ position: "absolute", inset: 0, opacity: ready ? 0 : 1, pointerEvents: "none" }}>
        <StaticSculpture palette={palette} />
      </div>
    </div>
  );
}
