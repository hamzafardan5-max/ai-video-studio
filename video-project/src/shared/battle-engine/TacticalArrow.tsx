import React, { useMemo } from 'react';
import * as THREE from 'three';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface TacticalArrowProps {
  points: [number, number][]; // [x, z] waypoints on battlefield
  color: string;
  borderColor?: string;
  width?: number;
  startFrame: number;
  /** Maximum recommended lifespan is 60 frames (2.0s at 30fps) */
  durationFrames?: number;
  getElevationAt: (x: number, z: number) => number;
}

export const TacticalArrow: React.FC<TacticalArrowProps> = ({
  points,
  color,
  borderColor = '#111318',
  width = 2.4,
  startFrame,
  durationFrames = 60,
  getElevationAt,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const localFrame = frame - startFrame;
  const fadeOutDuration = 12;
  const endFrame = durationFrames;

  // Crisp bounce-in spring for growth & pop
  const drawProgress = spring({
    fps,
    frame: localFrame,
    config: { damping: 13, stiffness: 150, mass: 0.8 },
  });

  // Smooth fade-out during the last 12 frames so arrows don't clutter movement
  const opacity = interpolate(
    localFrame,
    [0, 6, endFrame - fadeOutDuration, endFrame],
    [0, 0.94, 0.94, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Subtle vertical pop bounce on entry
  const bounceScale = interpolate(drawProgress, [0, 0.85, 1], [0.7, 1.06, 1.0]);

  const { shaftGeo, headGeo, borderShaftGeo, borderHeadGeo } = useMemo(() => {
    const curvePoints = points.map(([x, z]) => new THREE.Vector3(x, 0, z));
    const curve = new THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.35);
    const totalLength = curve.getLength();

    const clampedProgress = Math.min(1, Math.max(0.08, drawProgress));
    const currentLength = totalLength * clampedProgress;

    const headLength = Math.min(width * 2.3, currentLength * 0.55);
    const headHalfWidth = width * 1.15;
    const shaftHalfWidth = width * 0.46;

    // CRITICAL FIX: Stop the ribbon shaft INSIDE the arrowhead throat so no square tail pokes out
    const shaftEndLength = Math.max(0.01, currentLength - headLength * 0.65);

    const buildRibbon = (maxLen: number, halfW: number, yOffset: number) => {
      const steps = Math.max(12, Math.floor(maxLen * 2.5));
      const positions: number[] = [];
      const indices: number[] = [];

      for (let i = 0; i <= steps; i++) {
        const dist = (i / steps) * maxLen;
        const u = Math.min(1, dist / totalLength);
        const pt = curve.getPointAt(u);
        const tangent = curve.getTangentAt(u).normalize();
        const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);

        const lx = pt.x + normal.x * halfW;
        const lz = pt.z + normal.z * halfW;
        const rx = pt.x - normal.x * halfW;
        const rz = pt.z - normal.z * halfW;

        const ly = getElevationAt(lx, lz) + yOffset;
        const ry = getElevationAt(rx, rz) + yOffset;

        positions.push(lx, ly, lz, rx, ry, rz);

        if (i < steps) {
          const base = i * 2;
          indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
        }
      }

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geo.setIndex(indices);
      geo.computeVertexNormals();
      return geo;
    };

    const buildArrowhead = (tipDist: number, hLen: number, hHalfW: number, yOffset: number) => {
      const tipU = Math.min(1, tipDist / totalLength);
      const baseDist = Math.max(0, tipDist - hLen);
      const baseU = Math.min(1, baseDist / totalLength);
      const notchU = Math.min(1, (tipDist - hLen * 0.72) / totalLength);

      const tipPt = curve.getPointAt(tipU);
      const basePt = curve.getPointAt(baseU);
      const notchPt = curve.getPointAt(notchU);
      const tangent = curve.getTangentAt(tipU).normalize();
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x);

      const leftWingX = basePt.x + normal.x * hHalfW;
      const leftWingZ = basePt.z + normal.z * hHalfW;
      const rightWingX = basePt.x - normal.x * hHalfW;
      const rightWingZ = basePt.z - normal.z * hHalfW;

      // Chevron-style notched arrowhead (HistoryMarche look)
      const verts = [
        tipPt.x, getElevationAt(tipPt.x, tipPt.z) + yOffset, tipPt.z,
        leftWingX, getElevationAt(leftWingX, leftWingZ) + yOffset, leftWingZ,
        notchPt.x, getElevationAt(notchPt.x, notchPt.z) + yOffset, notchPt.z,
        rightWingX, getElevationAt(rightWingX, rightWingZ) + yOffset, rightWingZ,
      ];

      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
      geo.setIndex([0, 1, 2, 0, 2, 3]);
      geo.computeVertexNormals();
      return geo;
    };

    return {
      borderShaftGeo: buildRibbon(shaftEndLength, shaftHalfWidth + 0.16, 0.24),
      borderHeadGeo: buildArrowhead(
        currentLength + 0.22,
        headLength + 0.35,
        headHalfWidth + 0.22,
        0.24
      ),
      shaftGeo: buildRibbon(shaftEndLength, shaftHalfWidth, 0.27),
      headGeo: buildArrowhead(currentLength, headLength, headHalfWidth, 0.27),
    };
  }, [points, width, drawProgress, getElevationAt]);

  // Hide completely outside active 2-second strategic window
  if (localFrame < 0 || localFrame > endFrame) {
    return null;
  }

  return (
    <group scale={[1, bounceScale, 1]}>
      {/* Crisp Dark Border Outline */}
      <mesh geometry={borderShaftGeo}>
        <meshBasicMaterial color={borderColor} transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={borderHeadGeo}>
        <meshBasicMaterial color={borderColor} transparent opacity={opacity} side={THREE.DoubleSide} />
      </mesh>

      {/* Bold Faction Fill */}
      <mesh geometry={shaftGeo}>
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh geometry={headGeo}>
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
};
