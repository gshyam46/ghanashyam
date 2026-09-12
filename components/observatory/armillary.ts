import * as THREE from "three";

export type ArmillaryPalette = "copper" | "silver" | "ink";
export type ArmillaryScene = "signal" | "systems" | "practice" | "contact";

const TAU = Math.PI * 2;
const FINISHES = {
  copper: { band: "#9e633c", edge: "#bd8a61", bearing: "#594333", engraving: "#492f21", ceramic: "#242825", coreLight: "#efb66f", signal: "#ffe0b1" },
  silver: { band: "#a3b1b5", edge: "#d0dadf", bearing: "#53636a", engraving: "#465359", ceramic: "#20282d", coreLight: "#b5d6e6", signal: "#d6edfb" },
  ink: { band: "#526252", edge: "#98a18b", bearing: "#36483c", engraving: "#aeb49d", ceramic: "#26342c", coreLight: "#d6c092", signal: "#c29b65" },
} satisfies Record<ArmillaryPalette, Record<string, string>>;
type Finish = keyof typeof FINISHES.copper;

const RINGS = [
  { radius: 2.26, width: .17, depth: .086, axis: "z", angle: -.30, range: .035, speed: .095, phase: 0, ticks: 120 },
  { radius: 1.88, width: .16, depth: .080, axis: "x", angle: -1.10, range: .12, speed: .13, phase: .4, ticks: 96 },
  { radius: 1.52, width: .15, depth: .076, axis: "y", angle: 1.23, range: .15, speed: .105, phase: 2.1, ticks: 80 },
  { radius: 1.16, width: .14, depth: .070, axis: "x", angle: -1.21, range: .14, speed: .08, phase: 3.6, ticks: 64 },
  { radius: .80, width: .12, depth: .062, axis: "y", angle: -1.41, range: 0, speed: 0, phase: 0, ticks: 48 },
] as const;
const CHAPTER_POSES: Record<ArmillaryScene, readonly number[]> = {
  signal: [0, 0, 0, 0, 0],
  systems: [.05, .12, -.08, .08, -.12],
  practice: [-.04, -.14, .10, -.07, .12],
  contact: [.06, .07, .13, .12, -.08],
};

function initialBandRotation(index: number) {
  const ring = RINGS[index];
  const rotation = new THREE.Euler(index === 0 ? 1.0 : 0, index === 0 ? .55 : 0, 0);
  rotation[ring.axis] = ring.angle + Math.sin(ring.phase) * ring.range;
  return rotation;
}

/** Shared geometric pose for the lightweight fallback, before the caller's outer transform. */
export function getArmillaryRestPose(): { radius: number; width: number; transform: THREE.Matrix4 }[] {
  const cumulative = new THREE.Matrix4();
  return RINGS.map((ring, index) => {
    cumulative.multiply(new THREE.Matrix4().makeRotationFromEuler(initialBandRotation(index)));
    return { radius: ring.radius, width: ring.width, transform: cumulative.clone() };
  });
}

/** A rectangular annular strip with four machined bevels, not a round torus. */
function bandGeometry(radius: number, width: number, depth: number, segments: number) {
  const halfWidth = width / 2, halfDepth = depth / 2;
  const bevel = Math.min(depth * .23, width * .12);
  const profile = [
    [halfWidth - bevel, halfDepth], [-halfWidth + bevel, halfDepth],
    [-halfWidth, halfDepth - bevel], [-halfWidth, -halfDepth + bevel],
    [-halfWidth + bevel, -halfDepth], [halfWidth - bevel, -halfDepth],
    [halfWidth, -halfDepth + bevel], [halfWidth, halfDepth - bevel],
  ];
  const positions: number[] = [], normals: number[] = [], uvs: number[] = [], indices: number[] = [];
  for (let face = 0; face < profile.length; face++) {
    const from = profile[face], to = profile[(face + 1) % profile.length];
    const radialNormal = to[1] - from[1], axialNormal = from[0] - to[0];
    const normalLength = Math.hypot(radialNormal, axialNormal);
    const start = positions.length / 3;
    for (let segment = 0; segment <= segments; segment++) {
      const angle = segment / segments * TAU, c = Math.cos(angle), s = Math.sin(angle);
      for (let end = 0; end < 2; end++) {
        const point = end ? to : from;
        positions.push((radius + point[0]) * c, (radius + point[0]) * s, point[1]);
        normals.push(radialNormal / normalLength * c, radialNormal / normalLength * s, axialNormal / normalLength);
        uvs.push(segment / segments, (face + end) / profile.length);
      }
      if (segment < segments) {
        const a = start + segment * 2, b = a + 2;
        indices.push(a, b, a + 1, a + 1, b, b + 1);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeBoundingSphere();
  return geometry;
}

/** Procedural machining only affects roughness; bevels catch a cleaner highlight. */
function machiningTexture() {
  const size = 128, pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    const bevel = Math.floor(y / size * 8) % 2 === 1;
    for (let x = 0; x < size; x++) {
      const grain = Math.sin(y * 3.7 + Math.sin(x * .29) * .45) * 5 + Math.sin(x * 1.71 + y * 2.13) * 3;
      const value = Math.round((bevel ? 151 : 230) + grain), index = (y * size + x) * 4;
      pixels[index] = pixels[index + 1] = pixels[index + 2] = value;
      pixels[index + 3] = 255;
    }
  }
  const texture = new THREE.DataTexture(pixels, size, size, THREE.RGBAFormat);
  texture.wrapS = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function graduationTracks(radius: number, width: number, depth: number, segments: number) {
  const positions: number[] = [];
  for (const side of [-1, 1]) {
    const r = radius - width * .22, z = side * (depth / 2 + .001);
    for (let segment = 0; segment < segments; segment++) {
      for (const angle of [segment / segments * TAU, (segment + 1) / segments * TAU]) {
        positions.push(Math.cos(angle) * r, Math.sin(angle) * r, z);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  return geometry;
}

function signalRibbon(radius: number, width: number) {
  const positions: number[] = [], colors: number[] = [], indices: number[] = [];
  const segments = 18, length = .29;
  for (let segment = 0; segment <= segments; segment++) {
    const amount = segment / segments, angle = (amount - 1) * length;
    const light = amount * amount;
    for (const side of [-1, 1]) {
      const r = radius + side * width / 2;
      positions.push(Math.cos(angle) * r, Math.sin(angle) * r, 0);
      colors.push(light, light, light);
    }
    if (segment < segments) {
      const a = segment * 2;
      indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  return geometry;
}

/** Owns instrument resources and internal articulation; the caller owns its studio and outer pose. */
export function createArmillary(compact: boolean, palette: ArmillaryPalette) {
  const group = new THREE.Group();
  group.name = "Kinetic armillary instrument";
  const pickTargets: THREE.Object3D[] = [];
  const geometries = new Set<THREE.BufferGeometry>();
  const materials = new Set<THREE.Material>();
  const textures = new Set<THREE.Texture>();
  const instancedMeshes = new Set<THREE.InstancedMesh>();
  const finishTargets = Object.fromEntries(Object.entries(FINISHES).map(([name, finish]) =>
    [name, Object.fromEntries(Object.entries(finish).map(([key, value]) => [key, new THREE.Color(value)]))],
  )) as Record<ArmillaryPalette, Record<Finish, THREE.Color>>;
  const changingColors: { color: THREE.Color; finish: Finish }[] = [];
  const geometry = <T extends THREE.BufferGeometry>(value: T): T => { geometries.add(value); return value; };
  const material = <T extends THREE.Material & { color: THREE.Color }>(value: T, finish: Finish): T => {
    materials.add(value);
    value.color.copy(finishTargets[palette][finish]);
    changingColors.push({ color: value.color, finish });
    return value;
  };
  const machining = machiningTexture();
  textures.add(machining);
  const copper = material(new THREE.MeshPhysicalMaterial({
    metalness: .88, roughness: .48, roughnessMap: machining,
    anisotropy: .52, clearcoat: .03, clearcoatRoughness: .45, envMapIntensity: .64,
  }), "band");
  const polished = material(new THREE.MeshStandardMaterial({ metalness: .88, roughness: .34, envMapIntensity: .76 }), "edge");
  const bearing = material(new THREE.MeshStandardMaterial({ metalness: .73, roughness: .43, envMapIntensity: .8 }), "bearing");
  const etching = material(new THREE.MeshStandardMaterial({ metalness: .4, roughness: .65, envMapIntensity: .5 }), "engraving");
  const tracks = material(new THREE.LineBasicMaterial({ transparent: true, opacity: .29, depthWrite: false }), "engraving");
  const ceramic = material(new THREE.MeshPhysicalMaterial({
    metalness: 0, roughness: .92, clearcoat: 0, specularIntensity: .08, envMapIntensity: .12,
  }), "ceramic");
  // A separate, depth-tested halo glows outside the dark surface without adding sheen.
  const haloSize = 128, haloPixels = new Uint8Array(haloSize * haloSize * 4);
  for (let y = 0; y < haloSize; y++) {
    for (let x = 0; x < haloSize; x++) {
      const radius = Math.hypot((x + .5) / haloSize * 2 - 1, (y + .5) / haloSize * 2 - 1);
      const light = Math.exp(-Math.pow(Math.max(0, radius - .58) / .145, 2));
      const fade = 1 - THREE.MathUtils.smoothstep(radius, .88, 1);
      const offset = (y * haloSize + x) * 4;
      haloPixels[offset] = haloPixels[offset + 1] = haloPixels[offset + 2] = 255;
      haloPixels[offset + 3] = Math.round(light * fade * 255);
    }
  }
  const haloMap = new THREE.DataTexture(haloPixels, haloSize, haloSize, THREE.RGBAFormat);
  haloMap.minFilter = haloMap.magFilter = THREE.LinearFilter;
  haloMap.needsUpdate = true;
  textures.add(haloMap);
  const coreHaloMaterial = material(new THREE.SpriteMaterial({
    map: haloMap, transparent: true, opacity: .22, depthWrite: false, depthTest: true, toneMapped: false,
  }), "coreLight");
  const signal = material(new THREE.MeshBasicMaterial({
    transparent: true, opacity: .65, vertexColors: true,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide,
  }), "signal");
  const signalHalo = material(new THREE.MeshBasicMaterial({
    transparent: true, opacity: .10, vertexColors: true,
    blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false, side: THREE.DoubleSide,
  }), "signal");
  const signalTip = material(new THREE.MeshBasicMaterial({
    transparent: true, opacity: .84, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false,
  }), "signal");

  const segments = compact ? 112 : 160;
  const tickGeometry = geometry(new THREE.BoxGeometry(1, 1, 1));
  const cylinder = geometry(new THREE.CylinderGeometry(1, 1, 1, compact ? 12 : 18));
  const capGeometry = geometry(new THREE.CylinderGeometry(1, 1, 1, 12));
  const transform = new THREE.Object3D();
  const up = new THREE.Vector3(0, 1, 0);
  const pivots: THREE.Group[] = [];
  let disposed = false;

  function addMesh(parent: THREE.Object3D, shape: THREE.BufferGeometry, finish: THREE.Material, name: string) {
    const mesh = new THREE.Mesh(shape, finish);
    mesh.name = name;
    parent.add(mesh);
    pickTargets.push(mesh);
    return mesh;
  }

  function instances(parent: THREE.Object3D, shape: THREE.BufferGeometry, finish: THREE.Material, count: number, name: string) {
    const mesh = new THREE.InstancedMesh(shape, finish, count);
    mesh.name = name;
    instancedMeshes.add(mesh);
    parent.add(mesh);
    return mesh;
  }

  function setInstance(mesh: THREE.InstancedMesh, index: number, position: THREE.Vector3, rotation: THREE.Quaternion, scale: THREE.Vector3) {
    transform.position.copy(position);
    transform.quaternion.copy(rotation);
    transform.scale.copy(scale);
    transform.updateMatrix();
    mesh.setMatrixAt(index, transform.matrix);
  }

  // Hinge axles lie on a shared diameter of their parent and child rings.
  // Child rings rotate around that diameter, so the bearings stay connected.
  function addGimbal(parent: THREE.Group, outerRadius: number, innerRadius: number, axis: "x" | "y", core = false) {
    const direction = new THREE.Vector3(axis === "x" ? 1 : 0, axis === "y" ? 1 : 0, 0);
    const rotation = new THREE.Quaternion().setFromUnitVectors(up, direction);
    const shafts = instances(parent, cylinder, bearing, 2, "Recessed gimbal axles");
    const housings = instances(parent, cylinder, bearing, 2, "Gimbal bearing housings");
    const collars = instances(parent, capGeometry, polished, 4, "Machined bearing collars");
    const shaftRadius = core ? .021 : .027, bossRadius = core ? .050 : .064;
    for (let index = 0; index < 2; index++) {
      const side = index ? 1 : -1;
      const along = (radius: number) => direction.clone().multiplyScalar(radius * side);
      setInstance(shafts, index, along((outerRadius + innerRadius) / 2), rotation,
        new THREE.Vector3(shaftRadius, outerRadius - innerRadius + .055, shaftRadius));
      setInstance(housings, index, along(outerRadius), rotation, new THREE.Vector3(bossRadius, .085, bossRadius));
      setInstance(collars, index * 2, along(innerRadius + .026), rotation, new THREE.Vector3(bossRadius * .9, .045, bossRadius * .9));
      setInstance(collars, index * 2 + 1, along(outerRadius + .045), rotation, new THREE.Vector3(bossRadius * .66, .015, bossRadius * .66));
    }
    for (const mesh of [shafts, housings, collars]) {
      mesh.computeBoundingSphere();
      pickTargets.push(mesh);
    }
  }

  RINGS.forEach((ring, index) => {
    const pivot = new THREE.Group();
    pivot.name = `Articulated calibration band ${index + 1}`;
    const parent = index ? pivots[index - 1] : group;
    pivot.rotation.copy(initialBandRotation(index));
    parent.add(pivot);
    pivots.push(pivot);
    addMesh(pivot, geometry(bandGeometry(ring.radius, ring.width, ring.depth, segments)), copper, "Bevelled satin metal band");
    pivot.add(new THREE.LineSegments(geometry(graduationTracks(ring.radius, ring.width, ring.depth, segments)), tracks));

    const tickCount = compact ? Math.max(32, Math.round(ring.ticks / 8) * 4) : ring.ticks;
    const ticks = instances(pivot, tickGeometry, etching, tickCount * 2, "Engraved calibration marks");
    for (let tick = 0; tick < tickCount; tick++) {
      const angle = tick / tickCount * TAU, major = tick % 8 === 0, middle = tick % 4 === 0;
      const length = ring.width * (major ? .42 : middle ? .30 : .18);
      const radius = ring.radius + ring.width * .29 - length / 2;
      const rotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle - Math.PI / 2);
      for (let side = 0; side < 2; side++) {
        setInstance(ticks, tick * 2 + side,
          new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, (side ? 1 : -1) * (ring.depth / 2 + .0015)),
          rotation, new THREE.Vector3(major ? .009 : .0055, length, .002));
      }
    }
    ticks.computeBoundingSphere();
    if (index) addGimbal(parent, RINGS[index - 1].radius, ring.radius, ring.axis as "x" | "y");
  });

  const core = new THREE.Group();
  core.name = "Matte reference core with a soft halo";
  core.rotation.set(.26, .18, -.15);
  pivots[pivots.length - 1].add(core);
  addMesh(core, geometry(new THREE.SphereGeometry(.51, compact ? 40 : 64, compact ? 26 : 40)), ceramic, "Ceramic centre");
  const coreHalo = new THREE.Sprite(coreHaloMaterial);
  coreHalo.name = "Diffuse core halo";
  coreHalo.scale.set(1.68, 1.68, 1);
  core.add(coreHalo);
  addGimbal(pivots[pivots.length - 1], RINGS[RINGS.length - 1].radius, .54, "x", true);

  const signalCarrier = new THREE.Group();
  signalCarrier.name = "Single travelling instrument signal";
  const signalBand = RINGS[3], signalRadius = signalBand.radius - signalBand.width * .22;
  signalCarrier.rotation.z = .55;
  pivots[3].add(signalCarrier);
  const traceGeometry = geometry(signalRibbon(signalRadius, .013));
  const haloGeometry = geometry(signalRibbon(signalRadius, .040));
  const tipGeometry = geometry(new THREE.SphereGeometry(.010, 8, 6));
  // One signal position, readable from either face as the instrument turns.
  // The opaque band occludes its far-side counterpart.
  for (const side of [-1, 1]) {
    const surface = new THREE.Group();
    surface.position.z = side * (signalBand.depth / 2 + .005);
    surface.add(new THREE.Mesh(traceGeometry, signal));
    surface.add(new THREE.Mesh(haloGeometry, signalHalo));
    const tip = new THREE.Mesh(tipGeometry, signalTip);
    tip.position.x = signalRadius;
    surface.add(tip);
    signalCarrier.add(surface);
  }

  return {
    group,
    pickTargets,
    update(elapsed: number, scene: ArmillaryScene, nextPalette: ArmillaryPalette, ease: number): number {
      if (disposed) return 0;
      const amount = THREE.MathUtils.clamp(ease, 0, 1);
      let remaining = 0;
      RINGS.forEach((ring, index) => {
        const revolution = index === RINGS.length - 1 ? elapsed * TAU / 125 : 0;
        const target = ring.angle + CHAPTER_POSES[scene][index] + Math.sin(elapsed * ring.speed + ring.phase) * ring.range + revolution;
        pivots[index].rotation[ring.axis] = THREE.MathUtils.lerp(pivots[index].rotation[ring.axis], target, amount);
        remaining += Math.abs(pivots[index].rotation[ring.axis] - target);
      });
      // The caller freezes elapsed for Pause/reduced motion; there is no private clock.
      signalCarrier.rotation.z = .55 + elapsed * .16;
      for (const { color, finish } of changingColors) {
        const target = finishTargets[nextPalette][finish];
        color.lerp(target, amount);
        remaining += Math.abs(color.r - target.r) + Math.abs(color.g - target.g) + Math.abs(color.b - target.b);
      }
      return remaining;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const mesh of instancedMeshes) mesh.dispose();
      for (const shape of geometries) shape.dispose();
      for (const finish of materials) finish.dispose();
      for (const texture of textures) texture.dispose();
      group.clear();
      pickTargets.length = 0;
    },
  };
}
