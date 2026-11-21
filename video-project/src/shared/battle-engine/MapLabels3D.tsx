import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Easing, interpolate, useCurrentFrame } from 'remotion';
import { TerrainFeature } from './TerrainMesh';
import { TroopUnitData } from './TroopUnit';

const labelCache = new Map<string, THREE.CanvasTexture>();

function getLabelTexture(text: string, border: string, isCmd: boolean): THREE.CanvasTexture {
  const key = `${text}-${border}-${isCmd}`;
  const hit = labelCache.get(key);
  if (hit) return hit;

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    ctx.fillStyle = isCmd ? 'rgba(15, 23, 42, 0.92)' : 'rgba(20, 26, 36, 0.8)';
    ctx.beginPath();
    ctx.roundRect(24, 24, 464, 80, 40);
    ctx.fill();
    ctx.lineWidth = isCmd ? 6 : 4;
    ctx.strokeStyle = border;
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = isCmd ? 'bold 34px sans-serif' : '600 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.toUpperCase(), 256, 65);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  labelCache.set(key, tex);
  return tex;
}

interface MapLabels3DProps {
  features: TerrainFeature[];
  units: TroopUnitData[];
  attackerColor: string;
  defenderColor: string;
  getElevationAt: (x: number, z: number) => number;
}

export const MapLabels3D: React.FC<MapLabels3DProps> = ({
  features,
  units,
  attackerColor,
  defenderColor,
  getElevationAt,
}) => {
  const frame = useCurrentFrame();
  const named = useMemo(() => features.filter((f) => f.name?.trim()), [features]);
  const commanders = useMemo(() => units.filter((u) => u.category === 'commander'), [units]);
  const uRange = new Array<number>(0, 1);

  return (
    <group>
      {named.map((f) => {
        const isWater = f.type === 'river' || f.type === 'marsh';
        const tex = getLabelTexture(f.name, isWater ? '#38BDF8' : '#E2E8F0', false);
        const y = getElevationAt(f.x, f.z) + 2.4;
        return (
          <sprite key={f.id} position={new Array<number>(f.x, y, f.z) as [number, number, number]} scale={new Array<number>(15, 3.75, 1) as [number, number, number]}>
            <spriteMaterial map={tex} transparent depthTest={false} opacity={0.9} />
          </sprite>
        );
      })}

      {commanders.map((cmd) => {
        const wps = cmd.waypoints;
        if (!wps.length) return null;
        let x = wps[0].x;
        let z = wps[0].z;
        let str = wps[0].strength ?? 1;

        if (frame >= wps[wps.length - 1].frame) {
          const last = wps[wps.length - 1];
          x = last.x;
          z = last.z;
          str = last.strength ?? 1;
        } else {
          for (let i = 0; i < wps.length - 1; i++) {
            const c = wps[i];
            const n = wps[i + 1];
            if (frame >= c.frame && frame <= n.frame) {
              const t = interpolate(frame, new Array<number>(c.frame, n.frame), uRange, {
                easing: Easing.inOut(Easing.quad),
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              x = c.x + (n.x - c.x) * t;
              z = c.z + (n.z - c.z) * t;
              str = (c.strength ?? 1) + ((n.strength ?? 1) - (c.strength ?? 1)) * t;
              break;
            }
          }
        }

        if (str <= 0.05) return null;
        const color = cmd.faction === 'attacker' ? attackerColor : defenderColor;
        const tex = getLabelTexture(cmd.label, color, true);
        const y = getElevationAt(x, z) + 3.6;

        return (
          <sprite key={cmd.id} position={new Array<number>(x, y, z) as [number, number, number]} scale={new Array<number>(16, 4, 1) as [number, number, number]}>
            <spriteMaterial map={tex} transparent depthTest={false} />
          </sprite>
        );
      })}
    </group>
  );
};
