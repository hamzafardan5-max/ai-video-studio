import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { random } from 'remotion';

/** Deterministic PRNG so the terrain detail texture is stable across renders. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Procedural albedo detail map (multi-octave value noise + fine grain).
 * Multiplied over the vertex colours, it breaks up the flat cartographic fill
 * without altering the elevation-driven palette.
 */
function makeTerrainDetailTexture(seed: string): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  const size = 512;
  const rng = mulberry32(hashSeed(seed));
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const octaves = [4, 8, 16, 32];
  const grids = octaves.map((cells) => {
    const g = new Array<number>(cells * cells);
    for (let i = 0; i < g.length; i++) g[i] = rng();
    return g;
  });

  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let v = 0;
      let amp = 0.5;
      let norm = 0;
      for (let o = 0; o < octaves.length; o++) {
        const cells = octaves[o];
        const grid = grids[o];
        const gx = (x / size) * cells;
        const gy = (y / size) * cells;
        const x0 = Math.floor(gx);
        const y0 = Math.floor(gy);
        const fx = gx - x0;
        const fy = gy - y0;
        const x1 = Math.min(x0 + 1, cells - 1);
        const y1 = Math.min(y0 + 1, cells - 1);
        const sx = fx * fx * (3 - 2 * fx);
        const sy = fy * fy * (3 - 2 * fy);
        const v00 = grid[y0 * cells + x0];
        const v10 = grid[y0 * cells + x1];
        const v01 = grid[y1 * cells + x0];
        const v11 = grid[y1 * cells + x1];
        const val =
          (v00 * (1 - sx) + v10 * sx) * (1 - sy) +
          (v01 * (1 - sx) + v11 * sx) * sy;
        v += val * amp;
        norm += amp;
        amp *= 0.5;
      }
      v /= norm;
      const c = Math.round(226 + v * 29); // 226..255 — subtle, never darkens hard
      const idx = (y * size + x) * 4;
      img.data[idx] = c;
      img.data[idx + 1] = c;
      img.data[idx + 2] = c;
      img.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);

  // Fine speckle / dry-grass grain
  for (let i = 0; i < 4200; i++) {
    const x = rng() * size;
    const y = rng() * size;
    const r = 0.4 + rng() * 1.4;
    const shade = 190 + Math.floor(rng() * 65);
    ctx.fillStyle = `rgba(${shade}, ${shade}, ${shade}, 0.28)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(7, 11);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export interface TerrainFeature {
  id: string;
  name: string;
  type: 'hill' | 'ridge' | 'river' | 'forest' | 'marsh' | 'pass' | 'fortification';
  x: number;
  z: number;
  radiusX: number;
  radiusZ: number;
  elevation: number;
  rotationY?: number;
}

export function createElevationSampler(features: TerrainFeature[], seed: string) {
  return (x: number, z: number): number => {
    let h = 0;

    for (const f of features) {
      const rot = f.rotationY ?? 0;
      const dx = x - f.x;
      const dz = z - f.z;
      const localX = dx * Math.cos(rot) - dz * Math.sin(rot);
      const localZ = dx * Math.sin(rot) + dz * Math.cos(rot);

      const normDistSq =
        (localX * localX) / Math.max(1, f.radiusX * f.radiusX) +
        (localZ * localZ) / Math.max(1, f.radiusZ * f.radiusZ);

      if (normDistSq < 4.5) {
        const falloff = Math.exp(-normDistSq * 1.4);
        h += f.elevation * falloff;
      }
    }

    // Deterministic cartographic micro-undulation.
    // Kept below the water plane (y = -0.22) so the flat water sheet never
    // z-fights the open ground — only the river channel crosses it.
    const ripple =
      Math.sin(x * 0.09 + random(seed + '-x') * 6) *
      Math.cos(z * 0.09 + random(seed + '-z') * 6) *
      0.1;

    return h + ripple;
  };
}

interface TerrainMeshProps {
  features: TerrainFeature[];
  seed: string;
  baseColor?: string;
  highlandColor?: string;
  waterColor?: string;
  gridOpacity?: number;
}

export const TerrainMesh: React.FC<TerrainMeshProps> = ({
  features,
  seed,
  baseColor = '#4a5d3f',
  highlandColor = '#8c7853',
  waterColor = '#264653',
  gridOpacity = 0.12,
}) => {
  const getElevationAt = useMemo(
    () => createElevationSampler(features, seed),
    [features, seed]
  );

  const detailTexture = useMemo(() => makeTerrainDetailTexture(seed), [seed]);

  const terrainGeo = useMemo(() => {
    const width = 100;
    const depth = 160;
    const geo = new THREE.PlaneGeometry(width, depth, 120, 180);
    geo.rotateX(-Math.PI / 2);

    const pos = geo.attributes.position;
    const colors: number[] = [];

    const cLow = new THREE.Color(baseColor);
    const cHigh = new THREE.Color(highlandColor);
    const cPeak = new THREE.Color('#b5a48b');
    const cRiverBank = new THREE.Color('#7f6a4d');
    const cWater = new THREE.Color(waterColor);
    const tempColor = new THREE.Color();

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = getElevationAt(x, z);
      pos.setY(i, y);

      if (y < -0.35) {
        tempColor.copy(cWater);
      } else if (y < 0.05) {
        tempColor.copy(cRiverBank).lerp(cLow, (y + 0.35) / 0.4);
      } else if (y < 2.2) {
        tempColor.copy(cLow).lerp(cHigh, Math.min(1, y / 2.2));
      } else {
        tempColor.copy(cHigh).lerp(cPeak, Math.min(1, (y - 2.2) / 2.5));
      }

      // Subtle topographic contour line darkening every 0.85 vertical units
      const contourFrac = Math.abs(((y % 0.85) + 0.85) % 0.85);
      if (y > 0.2 && contourFrac < 0.055) {
        tempColor.multiplyScalar(0.84);
      }

      colors.push(tempColor.r, tempColor.g, tempColor.b);
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, [getElevationAt, baseColor, highlandColor, waterColor]);

  // Instanced Low-Poly Trees for Forest Zones (Ultra-fast on T4 GPU)
  const treeTransforms = useMemo(() => {
    const items: { x: number; y: number; z: number; scale: number }[] = [];
    const forestFeatures = features.filter((f) => f.type === 'forest');

    forestFeatures.forEach((forest, fIdx) => {
      const count = 38;
      for (let i = 0; i < count; i++) {
        const angle = random(`${seed}-tree-a-${fIdx}-${i}`) * Math.PI * 2;
        const dist = Math.sqrt(random(`${seed}-tree-d-${fIdx}-${i}`)) * 0.88;
        const tx = forest.x + Math.cos(angle) * forest.radiusX * dist;
        const tz = forest.z + Math.sin(angle) * forest.radiusZ * dist;
        const ty = getElevationAt(tx, tz);
        const scale = 0.7 + random(`${seed}-tree-s-${fIdx}-${i}`) * 0.65;
        items.push({ x: tx, y: ty, z: tz, scale });
      }
    });
    return items;
  }, [features, seed, getElevationAt]);

  const instancedRef = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    if (!instancedRef.current) return;
    const dummy = new THREE.Object3D();
    treeTransforms.forEach((t, idx) => {
      dummy.position.set(t.x, t.y + 0.65 * t.scale, t.z);
      dummy.scale.set(t.scale, t.scale, t.scale);
      dummy.updateMatrix();
      instancedRef.current!.setMatrixAt(idx, dummy.matrix);
    });
    instancedRef.current.instanceMatrix.needsUpdate = true;
  }, [treeTransforms]);

  return (
    <group>
      {/* Main Cartographic Relief Terrain */}
      <mesh geometry={terrainGeo} receiveShadow>
        <meshStandardMaterial
          vertexColors
          map={detailTexture ?? undefined}
          roughness={0.88}
          metalness={0.05}
        />
      </mesh>

      {/* Water Plane for Rivers / Marshes */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]} receiveShadow>
        <planeGeometry args={[100, 160]} />
        <meshStandardMaterial
          color={waterColor}
          roughness={0.22}
          metalness={0.25}
          polygonOffset
          polygonOffsetFactor={-2}
          polygonOffsetUnits={-2}
        />
      </mesh>

      {/* Subtle Cartographic Reference Grid */}
      {gridOpacity > 0 && (
        <gridHelper
          args={[160, 32, '#ffffff', '#ffffff']}
          position={[0, 0.06, 0]}
          material-opacity={gridOpacity}
          material-transparent
        />
      )}

      {/* Instanced Forest Canopies */}
      {treeTransforms.length > 0 && (
        <instancedMesh
          ref={instancedRef}
          args={[undefined, undefined, treeTransforms.length]}
          castShadow
          receiveShadow
        >
          <coneGeometry args={[0.75, 1.8, 6]} />
          <meshStandardMaterial color="#2d472c" roughness={0.8} />
        </instancedMesh>
      )}
    </group>
  );
};
