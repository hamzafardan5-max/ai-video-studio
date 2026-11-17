import React, {useMemo} from 'react';
import {random} from 'remotion';
import * as THREE from 'three';
import {BATTLE} from './battleData';

/**
 * Deterministic elevation field: sum of Gaussian terrain features
 * (positive = hills/ridges, negative = carved river valleys)
 * plus a seeded micro-relief layer.
 */
export const getElevationAt = (x: number, z: number): number => {
  let h = 0;
  for (const f of BATTLE.terrain.features) {
    const dx = (x - f.x) / f.radiusX;
    const dz = (z - f.z) / f.radiusZ;
    const d2 = dx * dx + dz * dz;
    h += f.elevation * Math.exp(-d2 * 1.4);
  }
  const noise = random(
    `${BATTLE.seed}|${x.toFixed(1)}|${z.toFixed(1)}`,
  );
  h += (noise - 0.5) * 0.44;
  return h;
};

export const TerrainMesh: React.FC = () => {
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(100, 160, 128, 192);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    const colors = new Float32Array(pos.count * 3);
    const base = new THREE.Color(BATTLE.terrain.baseColor);
    const high = new THREE.Color(BATTLE.terrain.highlandColor);
    const water = new THREE.Color(BATTLE.terrain.waterColor);

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const h = getElevationAt(x, z);
      pos.setY(i, h);
      const c =
        h < -0.35
          ? water
          : base.clone().lerp(high, THREE.MathUtils.clamp(h / 2.6, 0, 1));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Tactical grid clipped to the 100 x 160 battlefield footprint.
  const gridGeometry = useMemo(() => {
    const pts: number[] = [];
    for (let x = -50; x <= 50; x += 10) {
      pts.push(x, 0, -80, x, 0, 80);
    }
    for (let z = -80; z <= 80; z += 10) {
      pts.push(-50, 0, z, 50, 0, z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial
          vertexColors
          flatShading
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Water surface: only visible where the Aufidus carves below y = -0.4 */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.4, 0]}>
        <planeGeometry args={[100, 160]} />
        <meshStandardMaterial
          color={BATTLE.terrain.waterColor}
          transparent
          opacity={0.85}
          roughness={0.25}
          metalness={0.45}
        />
      </mesh>

      <lineSegments geometry={gridGeometry} position={[0, 0.15, 0]}>
        <lineBasicMaterial
          color="#ffffff"
          transparent
          opacity={BATTLE.terrain.gridOpacity}
        />
      </lineSegments>
    </group>
  );
};
