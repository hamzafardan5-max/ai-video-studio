import React, {useMemo} from 'react';
import {interpolate, random, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {
  BATTLE,
  TroopUnitData,
  UnitCategory,
  getNearestEnemy,
} from './battleData';
import {getUnitYaw} from './facing';
import {getElevationAt} from './TerrainMesh';

const BASE_HEIGHT = 0.3;
const SPARK_COUNT = 14;

const BODY_HEIGHT: Record<UnitCategory, number> = {
  infantry: 0.8,
  'heavy-infantry': 0.95,
  cavalry: 0.85,
  archers: 0.6,
  artillery: 0.7,
  phalanx: 1,
};

// ---------------------------------------------------------------- textures
const emblemCache = new Map<string, THREE.CanvasTexture>();

const drawEmblem = (
  ctx: CanvasRenderingContext2D,
  category: UnitCategory,
  commander: boolean,
) => {
  const ink = '#f8f1df';
  ctx.strokeStyle = ink;
  ctx.fillStyle = ink;
  ctx.lineCap = 'round';
  ctx.lineWidth = category === 'heavy-infantry' ? 15 : 12;

  const cx = 128;
  const cy = 64;

  switch (category) {
    case 'infantry': {
      ctx.beginPath();
      ctx.moveTo(cx - 46, cy - 26);
      ctx.lineTo(cx + 46, cy + 26);
      ctx.moveTo(cx + 46, cy - 26);
      ctx.lineTo(cx - 46, cy + 26);
      ctx.stroke();
      break;
    }
    case 'heavy-infantry': {
      ctx.lineWidth = 17;
      ctx.beginPath();
      ctx.moveTo(cx - 48, cy - 27);
      ctx.lineTo(cx + 48, cy + 27);
      ctx.moveTo(cx + 48, cy - 27);
      ctx.lineTo(cx - 48, cy + 27);
      ctx.stroke();
      ctx.fillRect(cx - 60, cy - 6, 120, 12);
      break;
    }
    case 'phalanx': {
      ctx.lineWidth = 9;
      for (const dy of [-30, 0, 30]) {
        ctx.beginPath();
        ctx.moveTo(cx - 54, cy + dy);
        ctx.lineTo(cx + 54, cy + dy);
        ctx.stroke();
      }
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 42);
      ctx.lineTo(cx, cy + 42);
      ctx.stroke();
      break;
    }
    case 'cavalry': {
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.moveTo(cx - 48, cy + 32);
      ctx.lineTo(cx + 34, cy - 32);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 20, cy - 36);
      ctx.lineTo(cx + 56, cy - 36);
      ctx.lineTo(cx + 40, cy - 6);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'archers': {
      ctx.lineWidth = 13;
      ctx.beginPath();
      ctx.moveTo(cx - 44, cy + 20);
      ctx.lineTo(cx, cy - 30);
      ctx.lineTo(cx + 44, cy + 20);
      ctx.stroke();
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(cx, cy + 34, 34, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
      break;
    }
    case 'artillery': {
      ctx.beginPath();
      ctx.arc(cx, cy, 30, 0, Math.PI * 2);
      ctx.lineWidth = 12;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  if (commander) {
    // Gold star in the corner marks the general's counter.
    ctx.save();
    ctx.translate(222, 30);
    ctx.fillStyle = '#f3cf72';
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? 15 : 6.5;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
};

const getEmblemTexture = (
  category: UnitCategory,
  factionColor: string,
  commander: boolean,
): THREE.CanvasTexture | null => {
  if (typeof document === 'undefined') return null;
  const key = `${category}|${factionColor}|${commander ? 'c' : 'u'}`;
  const cached = emblemCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = factionColor;
  ctx.fillRect(0, 0, 256, 128);

  const sheen = ctx.createLinearGradient(0, 0, 0, 128);
  sheen.addColorStop(0, 'rgba(255,255,255,0.22)');
  sheen.addColorStop(0.55, 'rgba(255,255,255,0.04)');
  sheen.addColorStop(1, 'rgba(0,0,0,0.28)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, 256, 128);

  ctx.strokeStyle = commander ? '#f3cf72' : '#f6eddb';
  ctx.lineWidth = commander ? 11 : 8;
  ctx.strokeRect(6, 6, 244, 116);

  drawEmblem(ctx, category, commander);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  emblemCache.set(key, texture);
  return texture;
};

const labelCache = new Map<string, THREE.CanvasTexture>();

const getLabelTexture = (text: string, color: string): THREE.CanvasTexture | null => {
  if (typeof document === 'undefined') return null;
  const key = `${text}|${color}`;
  const cached = labelCache.get(key);
  if (cached) return cached;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const radius = 26;
  ctx.beginPath();
  ctx.moveTo(radius, 10);
  ctx.lineTo(512 - radius, 10);
  ctx.quadraticCurveTo(502, 10, 502, 10 + radius);
  ctx.lineTo(502, 118 - radius);
  ctx.quadraticCurveTo(502, 118, 512 - radius, 118);
  ctx.lineTo(radius, 118);
  ctx.quadraticCurveTo(10, 118, 10, 118 - radius);
  ctx.lineTo(10, 10 + radius);
  ctx.quadraticCurveTo(10, 10, radius, 10);
  ctx.closePath();
  ctx.fillStyle = 'rgba(10,12,18,0.82)';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 5;
  ctx.stroke();

  ctx.fillStyle = '#f6eddb';
  ctx.font = '700 46px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 256, 66);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  labelCache.set(key, texture);
  return texture;
};

/**
 * One bevel-edged tactical counter:
 * - obsidian base rim, faction-coloured body, canvas emblem top face
 * - waypoint interpolation for position / strength / combat state
 * - deterministic sparks + micro-recoil while engaged
 */
export const TroopUnit: React.FC<{data: TroopUnitData}> = ({data}) => {
  const frame = useCurrentFrame();
  const color = BATTLE.factions[data.faction].color;

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

  // Combat / routing flags follow the active waypoint segment.
  let activeIndex = 0;
  for (let i = data.waypoints.length - 1; i >= 0; i--) {
    if (frame >= frames[i]) {
      activeIndex = i;
      break;
    }
  }
  const inCombat = data.waypoints[activeIndex].inCombat ?? false;
  const isRouting = data.waypoints[activeIndex].isRouting ?? false;

  // Yaw comes from the cached contact solver in `facing.ts`: engaged blocks
  // track the nearest enemy every frame, everything else follows its march.
  const yaw = getUnitYaw(data, frame);

  const bodyHeight = BODY_HEIGHT[data.category];
  const elevation = getElevationAt(x, z);

  // Micro-recoil: a tiny rhythmic shove along the front line, seeded per unit.
  const jitter = inCombat
    ? Math.sin(frame * 0.55 + data.id.length * 1.7) * 0.06
    : 0;

  const scale = Math.max(0.62, 0.7 + 0.3 * strength);
  const fatigue = Math.max(0, (0.4 - strength) / 0.4);
  const bodyColor = useMemo(
    () => new THREE.Color(color).lerp(new THREE.Color('#4c4740'), fatigue * 0.6),
    [color, fatigue],
  );

  const emissive = inCombat ? 0.32 + 0.22 * Math.sin(frame / 5) : 0.1;
  const opacity = isRouting ? Math.max(0.28, 0.35 + 0.65 * strength) : 1;
  const showSparks = inCombat && !isRouting;

  const emblemTexture = useMemo(
    () => getEmblemTexture(data.category, color, !!data.isCommander),
    [data.category, color, data.isCommander],
  );
  const labelTexture = useMemo(
    () =>
      data.commanderName
        ? getLabelTexture(data.commanderName, data.faction === 'attacker' ? '#e7a99f' : '#c9c0f5')
        : null,
    [data.commanderName, data.faction],
  );

  // Deterministic spark cloud around the front edge of an engaged unit.
  const sparkGeometry = useMemo(() => {
    const arr = new Float32Array(SPARK_COUNT * 3);
    for (let i = 0; i < SPARK_COUNT; i++) {
      const r1 = random(`${BATTLE.seed}|spark|${data.id}|${i}|a`);
      const r2 = random(`${BATTLE.seed}|spark|${data.id}|${i}|b`);
      const r3 = random(`${BATTLE.seed}|spark|${data.id}|${i}|c`);
      const cycle = (frame * 0.05 + r1) % 1;
      arr[i * 3] = (r2 - 0.5) * data.width * 0.82 + Math.sin(frame * 0.2 + r1 * 6.28) * 0.18;
      arr[i * 3 + 1] = 0.4 + cycle * 1.9;
      arr[i * 3 + 2] = data.depth * 0.5 + 0.15 + cycle * 1.3 + (r3 - 0.5) * 0.5;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return g;
  }, [frame, data.id, data.width, data.depth]);

  // Sparks are aimed at the nearest enemy in world space, independent of the
  // block's own yaw, so a retreating unit can never fire backwards.
  const sparkFoe = showSparks ? getNearestEnemy(data, frame) : null;
  const sparkYaw = sparkFoe
    ? Math.atan2(sparkFoe.x - x, sparkFoe.z - z)
    : yaw;

  return (
    <group position={[x + jitter, elevation + 0.02, z - jitter]}>
      <group rotation-y={yaw}>
        <group scale={[scale, 1, scale]}>
          {/* Obsidian base rim: crisp silhouette against the terrain */}
          <mesh position={[0, BASE_HEIGHT / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[data.width, BASE_HEIGHT, data.depth]} />
            <meshStandardMaterial
              color="#14161b"
              metalness={0.55}
              roughness={0.38}
              transparent
              opacity={opacity}
            />
          </mesh>

          {/* Faction body */}
          <mesh
            position={[0, BASE_HEIGHT + bodyHeight / 2, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[data.width * 0.95, bodyHeight, data.depth * 0.95]}
            />
            <meshStandardMaterial
              color={bodyColor}
              emissive={color}
              emissiveIntensity={emissive}
              roughness={0.55}
              metalness={0.12}
              transparent
              opacity={opacity}
            />
          </mesh>

          {/* Printed top face: faction colour, trim, tactical emblem */}
          <mesh
            position={[0, BASE_HEIGHT + bodyHeight + 0.012, 0]}
            rotation-x={-Math.PI / 2}
          >
            <planeGeometry args={[data.width * 0.92, data.depth * 0.92]} />
            <meshStandardMaterial
              map={emblemTexture ?? undefined}
              color={emblemTexture ? '#ffffff' : color}
              emissive={color}
              emissiveIntensity={0.16}
              roughness={0.62}
              metalness={0.08}
              transparent
              opacity={opacity}
            />
          </mesh>
        </group>

        {data.isCommander && data.commanderName ? (
          <group position={[data.width * 0.36, BASE_HEIGHT + bodyHeight, -data.depth * 0.22]}>
            <mesh position={[0, 1.05, 0]} castShadow>
              <cylinderGeometry args={[0.045, 0.045, 2.1, 6]} />
              <meshStandardMaterial color="#e7c873" metalness={0.65} roughness={0.3} />
            </mesh>
            <mesh position={[0.52, 1.72, 0]} castShadow>
              <boxGeometry args={[1.04, 0.58, 0.05]} />
              <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.4}
                roughness={0.6}
              />
            </mesh>
            <mesh position={[0.52, 1.94, 0]}>
              <boxGeometry args={[1.04, 0.08, 0.06]} />
              <meshStandardMaterial color="#f3cf72" metalness={0.6} roughness={0.3} />
            </mesh>
            {labelTexture ? (
              <sprite position={[0.35, 2.55, 0]} scale={[4.4, 1.1, 1]}>
                <spriteMaterial
                  map={labelTexture}
                  transparent
                  depthWrite={false}
                  toneMapped={false}
                />
              </sprite>
            ) : null}
          </group>
        ) : null}
      </group>

      {showSparks ? (
        <group rotation-y={sparkYaw}>
          <points geometry={sparkGeometry} frustumCulled={false}>
            <pointsMaterial
              size={0.2}
              color="#ffcf87"
              transparent
              opacity={0.85}
              sizeAttenuation
              depthWrite={false}
            />
          </points>
        </group>
      ) : null}
    </group>
  );
};
