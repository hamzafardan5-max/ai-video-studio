import React, { useMemo } from 'react';
import { Easing, interpolate, random, useCurrentFrame } from 'remotion';
import { getUnitEmblemTexture, UnitCategory } from './unitTextureGenerator';

export interface UnitWaypoint {
  frame: number;
  x: number;
  z: number;
  rotationY?: number;
  strength?: number;
  inCombat?: boolean;
  isRouting?: boolean;
}

export interface TroopUnitData {
  id: string;
  label: string;
  faction: 'attacker' | 'defender';
  category: UnitCategory;
  width: number;
  depth: number;
  waypoints: UnitWaypoint[];
}

interface TroopUnitProps {
  unit: TroopUnitData;
  factionColor: string;
  getElevationAt: (x: number, z: number) => number;
}

export const TroopUnit: React.FC<TroopUnitProps> = ({
  unit,
  factionColor,
  getElevationAt,
}) => {
  const frame = useCurrentFrame();

  const state = useMemo(() => {
    const wps = unit.waypoints;
    if (wps.length === 0) {
      return { x: 0, z: 0, rotY: 0, strength: 1, inCombat: false, isRouting: false };
    }
    if (frame <= wps[0].frame) {
      return {
        x: wps[0].x,
        z: wps[0].z,
        rotY: wps[0].rotationY ?? (unit.faction === 'attacker' ? 0 : Math.PI),
        strength: wps[0].strength ?? 1,
        inCombat: wps[0].inCombat ?? false,
        isRouting: wps[0].isRouting ?? false,
      };
    }
    const last = wps[wps.length - 1];
    if (frame >= last.frame) {
      return {
        x: last.x,
        z: last.z,
        rotY: last.rotationY ?? (unit.faction === 'attacker' ? 0 : Math.PI),
        strength: last.strength ?? 1,
        inCombat: last.inCombat ?? false,
        isRouting: last.isRouting ?? false,
      };
    }

    for (let i = 0; i < wps.length - 1; i++) {
      const curr = wps[i];
      const next = wps[i + 1];
      if (frame >= curr.frame && frame <= next.frame) {
        const progress = interpolate(frame, [curr.frame, next.frame], [0, 1], {
          easing: Easing.inOut(Easing.quad),
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

        const x = curr.x + (next.x - curr.x) * progress;
        const z = curr.z + (next.z - curr.z) * progress;
        const s1 = curr.strength ?? 1;
        const s2 = next.strength ?? s1;
        const strength = s1 + (s2 - s1) * progress;

        const dx = next.x - curr.x;
        const dz = next.z - curr.z;
        const moveDist = Math.hypot(dx, dz);
        const defaultYaw = unit.faction === 'attacker' ? 0 : Math.PI;
        const targetYaw =
          next.rotationY ?? (moveDist > 0.5 ? Math.atan2(dx, dz) : curr.rotationY ?? defaultYaw);
        const startYaw = curr.rotationY ?? defaultYaw;
        const rotY = startYaw + (targetYaw - startYaw) * progress;

        return {
          x,
          z,
          rotY,
          strength,
          inCombat: progress > 0.85 ? (next.inCombat ?? false) : (curr.inCombat ?? false),
          isRouting: next.isRouting ?? false,
        };
      }
    }

    return { x: last.x, z: last.z, rotY: 0, strength: 1, inCombat: false, isRouting: false };
  }, [frame, unit]);

  const topTexture = useMemo(
    () => getUnitEmblemTexture(unit.category, factionColor, '#FFFFFF'),
    [unit.category, factionColor]
  );

  // Subtle deterministic combat recoil + spark pulse
  const combatRecoil = state.inCombat ? Math.sin(frame * 0.9) * 0.14 : 0;
  const combatPulse = state.inCombat ? (Math.sin(frame * 0.7) + 1) * 0.5 : 0;

  const groundY = getElevationAt(state.x, state.z);
  const blockHeight = unit.category === 'commander' ? 1.45 : 1.05;
  const scaleXZ = 0.55 + state.strength * 0.45;
  const opacity = state.isRouting
    ? interpolate(Math.sin(frame * 0.6), [-1, 1], [0.45, 0.85])
    : 1;

  const sparks = useMemo(() => Array.from({ length: 8 }, (_, i) => i), []);

  // Hide completely destroyed units smoothly
  if (state.strength <= 0.05) {
    return null;
  }

  return (
    <group
      position={[state.x, groundY + blockHeight / 2 + 0.04, state.z + combatRecoil]}
      rotation={[0, state.rotY, 0]}
      scale={[scaleXZ, 1, scaleXZ]}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[unit.width, blockHeight, unit.depth]} />
        <meshStandardMaterial attach="material-0" color="#181A20" roughness={0.6} transparent={opacity < 1} opacity={opacity} />
        <meshStandardMaterial attach="material-1" color="#181A20" roughness={0.6} transparent={opacity < 1} opacity={opacity} />
        <meshStandardMaterial
          attach="material-2"
          map={topTexture}
          roughness={0.35}
          metalness={0.1}
          emissive={state.inCombat ? '#FF7B00' : factionColor}
          emissiveIntensity={state.inCombat ? 0.18 + combatPulse * 0.35 : 0.05}
          transparent={opacity < 1}
          opacity={opacity}
        />
        <meshStandardMaterial attach="material-3" color="#111317" transparent={opacity < 1} opacity={opacity} />
        <meshStandardMaterial attach="material-4" color="#181A20" roughness={0.6} transparent={opacity < 1} opacity={opacity} />
        <meshStandardMaterial attach="material-5" color="#181A20" roughness={0.6} transparent={opacity < 1} opacity={opacity} />
      </mesh>

      {/* Deterministic Front-Line Combat Sparks */}
      {state.inCombat &&
        sparks.map((idx) => {
          const cycle = (frame + idx * 7) % 14;
          const sparkProgress = cycle / 14;
          const sx = (random(`${unit.id}-sx-${idx}-${Math.floor(frame / 14)}`) - 0.5) * unit.width * 0.8;
          const sy = blockHeight * 0.4 + sparkProgress * 1.6;
          const sz = (unit.faction === 'attacker' ? 1 : -1) * (unit.depth * 0.55 + sparkProgress * 0.6);
          const sparkScale = (1 - sparkProgress) * 0.22;

          return (
            <mesh key={idx} position={[sx, sy, sz]} scale={[sparkScale, sparkScale, sparkScale]}>
              <octahedronGeometry args={[1, 0]} />
              <meshBasicMaterial color={idx % 2 === 0 ? '#FFD166' : '#FF6B35'} />
            </mesh>
          );
        })}
    </group>
  );
};
