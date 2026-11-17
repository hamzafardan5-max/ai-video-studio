import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {BATTLE, TroopUnitData} from './battleData';
import {getElevationAt} from './TerrainMesh';

const BLOCK_HEIGHT = 1.1;
const EMBLEM_COLOR = '#f2ead8';

/**
 * Renders one deterministic 3D tactical block:
 * - Interpolates (x, z) across waypoints via Remotion's interpolate()
 * - Sits flush on terrain via getElevationAt(x, z) + 0.35
 * - Rotates toward its heading of march
 * - Shrinks with `strength`, pulses emissive when `inCombat`
 */
export const TroopUnit: React.FC<{data: TroopUnitData}> = ({data}) => {
  const frame = useCurrentFrame();

  const frames = data.waypoints.map((w) => w.frame);
  const xs = data.waypoints.map((w) => w.x);
  const zs = data.waypoints.map((w) => w.z);
  const strengths = data.waypoints.map((w) => w.strength ?? 1);

  const x = interpolate(frame, frames, xs, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const z = interpolate(frame, frames, zs, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const strength = interpolate(frame, frames, strengths, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Active combat: true while inside a waypoint segment flagged inCombat.
  let inCombat = false;
  let isRouting = false;
  for (let i = data.waypoints.length - 1; i >= 0; i--) {
    if (frame >= frames[i]) {
      inCombat = data.waypoints[i].inCombat ?? false;
      isRouting = data.waypoints[i].isRouting ?? false;
      break;
    }
  }

  // Heading: last movement direction at or before the current segment.
  let heading = 0;
  for (let i = 0; i < data.waypoints.length - 1; i++) {
    const dx = xs[i + 1] - xs[i];
    const dz = zs[i + 1] - zs[i];
    if (Math.hypot(dx, dz) > 0.01) {
      heading = Math.atan2(dx, dz);
    }
    if (frame < frames[i + 1]) {
      break;
    }
  }

  const y = getElevationAt(x, z) + 0.35;
  const color = BATTLE.factions[data.faction].color;

  // Combat spark pulse — a pure function of the frame (deterministic).
  const emissiveIntensity = inCombat
    ? 0.45 + 0.3 * Math.sin(frame / 5)
    : 0.08;

  const fadeOut = isRouting
    ? interpolate(frame, [frames[frames.length - 1] - 90, frames[frames.length - 1]], [1, 0.25], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  return (
    <group position={[x, y, z]} rotation-y={heading} scale={[strength, 1, strength]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[data.width, BLOCK_HEIGHT, data.depth]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          roughness={0.6}
          metalness={0.1}
          transparent
          opacity={fadeOut}
        />
      </mesh>

      {/* Crisp top emblem indicating the unit category */}
      <group position={[0, BLOCK_HEIGHT / 2 + 0.04, 0]} visible={fadeOut > 0.6}>
        <CategoryEmblem category={data.category} width={data.width} depth={data.depth} />
      </group>
    </group>
  );
};

const CategoryEmblem: React.FC<{
  category: TroopUnitData['category'];
  width: number;
  depth: number;
}> = ({category, width, depth}) => {
  const stripe = useMemo(() => Math.min(width, depth) * 0.16, [width, depth]);

  if (category === 'cavalry') {
    // Diagonal slash
    return (
      <mesh rotation-y={Math.PI / 4}>
        <boxGeometry args={[Math.min(width, depth) * 1.1, 0.08, stripe]} />
        <meshStandardMaterial color={EMBLEM_COLOR} roughness={0.5} />
      </mesh>
    );
  }

  if (category === 'archers') {
    // Chevron (V pointing toward heading)
    return (
      <group>
        <mesh position={[-width * 0.14, 0, 0]} rotation-y={0.6}>
          <boxGeometry args={[width * 0.34, 0.08, stripe]} />
          <meshStandardMaterial color={EMBLEM_COLOR} roughness={0.5} />
        </mesh>
        <mesh position={[width * 0.14, 0, 0]} rotation-y={-0.6}>
          <boxGeometry args={[width * 0.34, 0.08, stripe]} />
          <meshStandardMaterial color={EMBLEM_COLOR} roughness={0.5} />
        </mesh>
      </group>
    );
  }

  if (category === 'artillery') {
    // Dot
    return (
      <mesh>
        <cylinderGeometry args={[stripe * 0.9, stripe * 0.9, 0.08, 12]} />
        <meshStandardMaterial color={EMBLEM_COLOR} roughness={0.5} />
      </mesh>
    );
  }

  if (category === 'phalanx') {
    // Three spear-wall stripes across the front
    return (
      <group>
        {[-depth * 0.24, 0, depth * 0.24].map((dz) => (
          <mesh key={dz} position={[0, 0, dz]}>
            <boxGeometry args={[width * 0.72, 0.08, stripe * 0.7]} />
            <meshStandardMaterial color={EMBLEM_COLOR} roughness={0.5} />
          </mesh>
        ))}
      </group>
    );
  }

  // infantry & heavy-infantry: a crisp cross
  const bar = stripe * (category === 'heavy-infantry' ? 1.4 : 1);
  return (
    <group>
      <mesh>
        <boxGeometry args={[width * 0.6, 0.08, bar]} />
        <meshStandardMaterial color={EMBLEM_COLOR} roughness={0.5} />
      </mesh>
      <mesh>
        <boxGeometry args={[bar, 0.08, depth * 0.6]} />
        <meshStandardMaterial color={EMBLEM_COLOR} roughness={0.5} />
      </mesh>
    </group>
  );
};
