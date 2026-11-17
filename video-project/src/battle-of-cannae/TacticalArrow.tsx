import React, {useMemo} from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import * as THREE from 'three';
import {BATTLE, TacticalArrowData} from './battleData';
import {getElevationAt} from './TerrainMesh';

const HOVER = 1.3;
const TUBE_RADIUS = 0.65;

/**
 * Animated tactical arrow: a CatmullRomCurve3 sliced by frame progress,
 * rendered as a TubeGeometry with a directional cone arrowhead.
 */
export const TacticalArrow: React.FC<{data: TacticalArrowData}> = ({data}) => {
  const frame = useCurrentFrame();

  const curve = useMemo(
    () =>
      new THREE.CatmullRomCurve3(
        data.points.map(
          ([x, z]) => new THREE.Vector3(x, getElevationAt(x, z) + HOVER, z),
        ),
      ),
    [data.points],
  );

  const progress = interpolate(frame, [data.startFrame, data.endFrame], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const opacity = data.fadeOutFrame
    ? interpolate(frame, [data.fadeOutFrame, data.fadeOutFrame + 40], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  const tipPoint = useMemo(() => curve.getPointAt(Math.min(progress, 0.999)), [
    curve,
    progress,
  ]);
  const tipTangent = useMemo(
    () => curve.getTangentAt(Math.min(progress, 0.999)),
    [curve, progress],
  );

  const visibleSegments = Math.max(2, Math.round(progress * 120));

  const tubeGeometry = useMemo(() => {
    const pts = curve.getPoints(visibleSegments);
    const sub = new THREE.CatmullRomCurve3(pts.slice(0, visibleSegments + 1));
    return new THREE.TubeGeometry(sub, Math.max(2, visibleSegments * 2), TUBE_RADIUS, 6, false);
  }, [curve, visibleSegments]);

  const headQuaternion = useMemo(
    () =>
      new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        tipTangent.normalize(),
      ),
    [tipTangent],
  );

  if (progress <= 0.01 || opacity <= 0.01) {
    return null;
  }

  const color = BATTLE.factions[data.faction].color;

  return (
    <group>
      <mesh geometry={tubeGeometry}>
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.35}
          roughness={0.4}
          transparent
          opacity={0.9 * opacity}
        />
      </mesh>
      <mesh position={tipPoint} quaternion={headQuaternion}>
        <coneGeometry args={[1.7, 3.4, 10]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          roughness={0.4}
          transparent
          opacity={0.95 * opacity}
        />
      </mesh>
    </group>
  );
};
