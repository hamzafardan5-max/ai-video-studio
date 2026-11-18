import React, {useLayoutEffect, useMemo, useRef} from 'react';
import {random, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {BATTLE, TerrainFeature} from './battleData';

/**
 * Deterministic value noise — smooth, seeded, and identical on every render.
 * Never Math.random(): the whole diorama must be reproducible frame by frame.
 */
const hash2 = (ix: number, iz: number): number =>
  random(`${BATTLE.seed}|noise|${ix}|${iz}`);

const valueNoise = (x: number, z: number): number => {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;
  const u = fx * fx * (3 - 2 * fx);
  const v = fz * fz * (3 - 2 * fz);
  const a = hash2(ix, iz);
  const b = hash2(ix + 1, iz);
  const c = hash2(ix, iz + 1);
  const d = hash2(ix + 1, iz + 1);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
};

const fbm = (x: number, z: number): number =>
  (valueNoise(x * 0.1, z * 0.1) - 0.5) * 0.72 +
  (valueNoise(x * 0.31, z * 0.31) - 0.5) * 0.26 +
  (valueNoise(x * 0.85, z * 0.85) - 0.5) * 0.08;

const softFeature = (x: number, z: number, f: TerrainFeature): number => {
  const dx = (x - f.x) / f.radiusX;
  const dz = (z - f.z) / f.radiusZ;
  return Math.exp(-(dx * dx + dz * dz) * 1.4);
};

/**
 * Elevation field shared by the terrain, every troop block and every arrow:
 * Gaussian hills / carved river + seeded micro-relief.
 */
export const getElevationAt = (x: number, z: number): number => {
  let h = 0;
  for (const f of BATTLE.terrain.features) {
    h += f.elevation * softFeature(x, z, f);
  }
  // Battle plain stays legible: micro-relief is strongest away from the centre.
  const centreFalloff = Math.min(
    1,
    Math.max(0, (Math.abs(x) - 26) / 18 + (Math.abs(z) - 30) / 26),
  );
  h += fbm(x, z) * (0.35 + centreFalloff * 0.65);
  return h;
};

/** River water only exists where the channel actually cuts below the surface. */
const RIVER_CENTER_X = 38;
const WATER_LEVEL = -0.55;

const isWater = (h: number) => h < WATER_LEVEL;

export const TerrainMesh: React.FC = () => {
  const frame = useCurrentFrame();

  const landGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 160, 128, 192);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);

    const base = new THREE.Color(BATTLE.terrain.baseColor);
    const high = new THREE.Color(BATTLE.terrain.highlandColor);
    const water = new THREE.Color(BATTLE.terrain.waterColor);
    const sand = new THREE.Color('#b8a276');
    const marsh = new THREE.Color('#556b45');
    const c = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = getElevationAt(x, z);
      pos.setY(i, h);

      const bank = Math.abs(x - RIVER_CENTER_X);
      if (isWater(h)) {
        c.copy(water);
      } else if (bank < 12 && h < 0.3) {
        c.copy(sand).lerp(base, Math.max(0, (h + 0.4) / 0.7));
      } else if (bank < 15 && h < 0.7) {
        c.copy(marsh);
      } else {
        c.copy(base).lerp(high, THREE.MathUtils.clamp(h / 2.6, 0, 1));
      }
      // Seeded cartographic mottling (parchment / dry earth patches).
      const mottle = (hash2(Math.round(x * 0.7), Math.round(z * 0.7)) - 0.5) * 0.06;
      c.offsetHSL(0, 0, mottle);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  /** Topographic contour lines via marching squares (y = 0.6 / 1.4 / 2.2 / 3.0). */
  const contourGeometry = useMemo(() => {
    const verts: number[] = [];
    const step = 2;
    const levels = [0.5, 1.5, 2.5, 3.5];

    for (let x = -50; x < 50; x += step) {
      for (let z = -78; z < 78; z += step) {
        const h00 = getElevationAt(x, z);
        const h10 = getElevationAt(x + step, z);
        const h11 = getElevationAt(x + step, z + step);
        const h01 = getElevationAt(x, z + step);

        for (const level of levels) {
          const pts: [number, number][] = [];
          const edge = (
            a: number,
            b: number,
            ax: number,
            az: number,
            bx: number,
            bz: number,
          ) => {
            if ((a - level) * (b - level) < 0) {
              const t = (level - a) / (b - a);
              pts.push([ax + (bx - ax) * t, az + (bz - az) * t]);
            }
          };
          edge(h00, h10, x, z, x + step, z);
          edge(h10, h11, x + step, z, x + step, z + step);
          edge(h11, h01, x + step, z + step, x, z + step);
          edge(h01, h00, x, z + step, x, z);

          const y = level + 0.045;
          if (pts.length === 2) {
            verts.push(pts[0][0], y, pts[0][1], pts[1][0], y, pts[1][1]);
          } else if (pts.length === 4) {
            verts.push(
              pts[0][0], y, pts[0][1], pts[1][0], y, pts[1][1],
              pts[2][0], y, pts[2][1], pts[3][0], y, pts[3][1],
            );
          }
        }
      }
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return g;
  }, []);

  /** Lat/long grid draped over the relief instead of floating at y = 0. */
  const gridGeometry = useMemo(() => {
    const verts: number[] = [];
    const lift = 0.12;
    for (let x = -50; x <= 50; x += 10) {
      for (let z = -78; z < 78; z += 2) {
        verts.push(
          x, getElevationAt(x, z) + lift, z,
          x, getElevationAt(x, z + 2) + lift, z + 2,
        );
      }
    }
    for (let z = -78; z <= 78; z += 10) {
      for (let x = -50; x < 50; x += 2) {
        verts.push(
          x, getElevationAt(x, z) + lift, z,
          x + 2, getElevationAt(x + 2, z) + lift, z,
        );
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return g;
  }, []);

  /** Gentle deterministic water shimmer — phase driven by the Remotion frame. */
  const waterGeometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(18, 160, 8, 64);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const lx = pos.getX(i);
      const lz = pos.getZ(i);
      pos.setY(
        i,
        Math.sin(lz * 0.18 + frame * 0.055) * 0.055 +
          Math.sin(lx * 0.55 - frame * 0.04) * 0.03,
      );
    }
    geo.computeVertexNormals();
    return geo;
  }, [frame]);

  return (
    <group>
      <mesh geometry={landGeometry} receiveShadow>
        <meshStandardMaterial
          vertexColors
          roughness={0.96}
          metalness={0.02}
        />
      </mesh>

      <mesh
        geometry={waterGeometry}
        position={[RIVER_CENTER_X, WATER_LEVEL, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color={BATTLE.terrain.waterColor}
          roughness={0.22}
          metalness={0.5}
          transparent
          opacity={0.9}
        />
      </mesh>

      <lineSegments geometry={contourGeometry}>
        <lineBasicMaterial
          color="#e2d3ad"
          transparent
          opacity={0.19}
          depthWrite={false}
        />
      </lineSegments>

      <lineSegments geometry={gridGeometry}>
        <lineBasicMaterial
          color="#efe8d6"
          transparent
          opacity={BATTLE.terrain.gridOpacity}
          depthWrite={false}
        />
      </lineSegments>

      <ForestProps />
      <CampProps />
    </group>
  );
};

/** Low-poly instanced trees inside every `forest` zone (single draw call). */
const ForestProps: React.FC = () => {
  const trees = useMemo(() => {
    const out: {x: number; y: number; z: number; scale: number; rot: number}[] = [];
    for (const f of BATTLE.terrain.features) {
      if (f.type !== 'forest') continue;
      const count = Math.round((f.radiusX * f.radiusZ) / 2.6);
      for (let i = 0; i < count; i++) {
        const ang = random(`${BATTLE.seed}|tree-ang|${f.id}|${i}`) * Math.PI * 2;
        const rad = Math.sqrt(random(`${BATTLE.seed}|tree-rad|${f.id}|${i}`));
        const x = f.x + Math.cos(ang) * f.radiusX * 0.82 * rad;
        const z = f.z + Math.sin(ang) * f.radiusZ * 0.82 * rad;
        out.push({
          x,
          y: getElevationAt(x, z),
          z,
          scale: 0.65 + random(`${BATTLE.seed}|tree-s|${f.id}|${i}`) * 0.7,
          rot: random(`${BATTLE.seed}|tree-r|${f.id}|${i}`) * Math.PI * 2,
        });
      }
    }
    return out;
  }, []);

  const ref = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    trees.forEach((t, i) => {
      dummy.position.set(t.x, t.y + 1.05 * t.scale, t.z);
      dummy.rotation.set(0, t.rot, 0);
      dummy.scale.setScalar(t.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [trees]);

  return (
    <instancedMesh
      ref={ref}
      args={[undefined, undefined, trees.length]}
      castShadow
      receiveShadow
    >
      <coneGeometry args={[0.62, 2.3, 5]} />
      <meshStandardMaterial color="#31492f" roughness={0.92} flatShading />
    </instancedMesh>
  );
};

/** Roman marching camps: tent clusters + a low palisade ring. */
const CampProps: React.FC = () => {
  const camps = useMemo(
    () => BATTLE.terrain.features.filter((f) => f.type === 'fortification'),
    [],
  );

  const tents = useMemo(() => {
    const out: {x: number; y: number; z: number; s: number; rot: number}[] = [];
    for (const c of camps) {
      for (let i = 0; i < 9; i++) {
        const ang = random(`${BATTLE.seed}|tent-a|${c.id}|${i}`) * Math.PI * 2;
        const rad = Math.sqrt(random(`${BATTLE.seed}|tent-r|${c.id}|${i}`)) * 2.4;
        const x = c.x + Math.cos(ang) * rad;
        const z = c.z + Math.sin(ang) * rad;
        out.push({
          x,
          y: getElevationAt(x, z),
          z,
          s: 0.75 + random(`${BATTLE.seed}|tent-s|${c.id}|${i}`) * 0.45,
          rot: ang,
        });
      }
    }
    return out;
  }, [camps]);

  const tentRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = tentRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    tents.forEach((t, i) => {
      dummy.position.set(t.x, t.y + 0.42 * t.s, t.z);
      dummy.rotation.set(0, t.rot, 0);
      dummy.scale.set(t.s, t.s * 0.8, t.s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [tents]);

  const stakes = useMemo(() => {
    const out: {x: number; y: number; z: number; rot: number}[] = [];
    for (const c of camps) {
      const perSide = 5;
      for (let side = 0; side < 4; side++) {
        for (let k = 0; k < perSide; k++) {
          const t = -3.2 + (6.4 * k) / (perSide - 1);
          const x = side < 2 ? c.x + t : c.x + (side === 2 ? -3.4 : 3.4);
          const z = side < 2 ? c.z + (side === 0 ? -3.4 : 3.4) : c.z + t;
          out.push({
            x,
            y: getElevationAt(x, z),
            z,
            rot: side < 2 ? 0 : Math.PI / 2,
          });
        }
      }
    }
    return out;
  }, [camps]);

  const stakeRef = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const mesh = stakeRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    stakes.forEach((t, i) => {
      dummy.position.set(t.x, t.y + 0.4, t.z);
      dummy.rotation.set(0, t.rot, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [stakes]);

  return (
    <group>
      <instancedMesh
        ref={tentRef}
        args={[undefined, undefined, tents.length]}
        castShadow
        receiveShadow
      >
        <coneGeometry args={[0.55, 1.05, 4]} />
        <meshStandardMaterial color="#d6c3a0" roughness={0.9} flatShading />
      </instancedMesh>

      <instancedMesh
        ref={stakeRef}
        args={[undefined, undefined, stakes.length]}
        castShadow
      >
        <boxGeometry args={[0.9, 0.8, 0.14]} />
        <meshStandardMaterial color="#6d5a3d" roughness={0.95} />
      </instancedMesh>
    </group>
  );
};
