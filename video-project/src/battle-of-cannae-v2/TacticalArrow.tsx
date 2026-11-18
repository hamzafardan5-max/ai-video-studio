import React, {useMemo} from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {BATTLE, TacticalArrowData} from './battleData';
import {getElevationAt} from './TerrainMesh';
import {
  SHADOW_DX,
  SHADOW_DZ,
  buildHead,
  buildRibbon,
  sampleCurve,
} from './arrowGeometry';

/**
 * Flat, terrain-hugging "war arrow" rendered as a six-layer decal:
 *   0 contact shadow · 1 contour band · 2 faction fill · 3 sheen stripe
 *   4 chevron outline · 5 chevron fill
 *
 * No tubes, no extrusion — every vertex is re-projected onto the height field.
 * All layers share one curve sampling pass so they cannot drift apart.
 */
export const TacticalArrow: React.FC<{data: TacticalArrowData}> = ({data}) => {
  const frame = useCurrentFrame();
  const width = data.width ?? 2;

  const progress = interpolate(
    frame,
    [data.startFrame, data.endFrame],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    },
  );

  const reveal = interpolate(
    frame,
    [data.startFrame, data.startFrame + 9],
    [0, 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  const fade = data.fadeOutFrame
    ? interpolate(frame, [data.fadeOutFrame, data.fadeOutFrame + 60], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const alpha = reveal * fade;

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        data.points.map(
          ([x, z]) => new THREE.Vector3(x, getElevationAt(x, z), z),
        ),
        false,
        'centripetal',
      ),
    [data.points],
  );

  const layers = useMemo(() => {
    const samples = sampleCurve(curve, Math.max(progress, 0.001));
    const elev = getElevationAt;
    return {
      shadow: buildRibbon(samples, width + 0.9, 0, elev, SHADOW_DX, SHADOW_DZ),
      outline: buildRibbon(samples, width + 0.5, 0.012, elev),
      fill: buildRibbon(samples, width, 0.02, elev),
      sheen: buildRibbon(samples, width * 0.32, 0.028, elev),
      headOutline: buildHead(samples, width + 0.45, 0.012, elev),
      headFill: buildHead(samples, width, 0.024, elev),
    };
  }, [curve, progress, width]);

  const color = BATTLE.factions[data.faction].color;
  const sheenColor = useMemo(
    () => new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.42),
    [color],
  );

  if (progress <= 0.015 || alpha <= 0.01) return null;

  return (
    <group>
      {/* 1 — contact shadow, thrown away from the key light */}
      <mesh geometry={layers.shadow} renderOrder={0}>
        <meshBasicMaterial
          color="#05070a"
          transparent
          opacity={0.2 * alpha}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 2 — dark contour band */}
      <mesh geometry={layers.outline} renderOrder={1}>
        <meshBasicMaterial
          color="#10131a"
          transparent
          opacity={0.55 * alpha}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* 3 — faction fill */}
      <mesh geometry={layers.fill} renderOrder={2}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.9 * alpha}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* 4 — painted sheen down the spine */}
      <mesh geometry={layers.sheen} renderOrder={3}>
        <meshBasicMaterial
          color={sheenColor}
          transparent
          opacity={0.38 * alpha}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* 5 — chevron head: outline then fill */}
      <mesh geometry={layers.headOutline} renderOrder={4}>
        <meshBasicMaterial
          color="#10131a"
          transparent
          opacity={0.6 * alpha}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <mesh geometry={layers.headFill} renderOrder={5}>
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.95 * alpha}
          side={THREE.DoubleSide}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
};
