import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Easing, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { CameraKeyframe } from './battleData';

export interface CameraRigProps {
  keyframes: CameraKeyframe[];
  /** Minimum allowed camera height (Y) to prevent accidental over-zooming in 9:16 */
  minSafeHeight?: number;
  /** Subtle continuous documentary drift amplitude in world units (default: 2.2) */
  driftAmplitude?: number;
  /** Enable golden-hour 3-point documentary lighting & horizon fog (default: true) */
  includeDocumentaryLighting?: boolean;
  fogColor?: string;
}

export const CameraRig: React.FC<CameraRigProps> = ({
  keyframes,
  minSafeHeight = 82,
  driftAmplitude = 2.2,
  includeDocumentaryLighting = true,
  fogColor = '#161920',
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const { camera } = useThree();

  const { position, lookAt } = useMemo(() => {
    const defaultPos: [number, number, number] = [0, 120, 60];
    const defaultLook: [number, number, number] = [0, 0, -2];

    if (!keyframes || keyframes.length === 0) {
      return { position: defaultPos, lookAt: defaultLook };
    }

    const sorted = [...keyframes].sort((a, b) => a.frame - b.frame);

    let basePos: [number, number, number];
    let baseLook: [number, number, number];

    if (frame <= sorted[0].frame) {
      basePos = [...sorted[0].position];
      baseLook = [...sorted[0].lookAt];
    } else if (frame >= sorted[sorted.length - 1].frame) {
      const last = sorted[sorted.length - 1];
      basePos = [...last.position];
      baseLook = [...last.lookAt];
    } else {
      basePos = [...sorted[0].position];
      baseLook = [...sorted[0].lookAt];

      for (let i = 0; i < sorted.length - 1; i++) {
        const curr = sorted[i];
        const next = sorted[i + 1];
        if (frame >= curr.frame && frame <= next.frame) {
          const t = interpolate(frame, [curr.frame, next.frame], [0, 1], {
            easing: Easing.inOut(Easing.cubic),
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });

          basePos = [
            curr.position[0] + (next.position[0] - curr.position[0]) * t,
            curr.position[1] + (next.position[1] - curr.position[1]) * t,
            curr.position[2] + (next.position[2] - curr.position[2]) * t,
          ];

          baseLook = [
            curr.lookAt[0] + (next.lookAt[0] - curr.lookAt[0]) * t,
            curr.lookAt[1] + (next.lookAt[1] - curr.lookAt[1]) * t,
            curr.lookAt[2] + (next.lookAt[2] - curr.lookAt[2]) * t,
          ];
          break;
        }
      }
    }

    // Continuous subtle documentary breathing/parallax drift (slow sine wave)
    const phase = (frame / Math.max(1, durationInFrames)) * Math.PI * 2;
    const driftX = Math.sin(phase) * driftAmplitude;
    const driftZ = Math.cos(phase * 0.5) * (driftAmplitude * 0.6);

    // Clamp minimum Y height so flanks stay visible in 9:16 portrait framing
    const safeY = Math.max(minSafeHeight, basePos[1]);

    return {
      position: [basePos[0] + driftX, safeY, basePos[2] + driftZ] as [number, number, number],
      lookAt: baseLook,
    };
  }, [frame, durationInFrames, keyframes, minSafeHeight, driftAmplitude]);

  // Apply deterministic camera transform synchronously on every frame
  camera.position.set(position[0], position[1], position[2]);
  camera.lookAt(new THREE.Vector3(lookAt[0], lookAt[1], lookAt[2]));
  camera.updateProjectionMatrix();

  return (
    <>
      {includeDocumentaryLighting && (
        <>
          <color attach="background" args={[fogColor]} />
          <fog attach="fog" args={[fogColor, 155, 290]} />

          {/* Cool Sky / Warm Earth Hemisphere Fill */}
          <hemisphereLight args={['#9ecae1', '#3b332b', 0.72]} />

          {/* Golden-Hour Key Light with Soft Shadows */}
          <directionalLight
            position={[55, 95, 45]}
            intensity={1.75}
            color="#fff1d0"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-65}
            shadow-camera-right={65}
            shadow-camera-top={90}
            shadow-camera-bottom={-90}
            shadow-camera-near={10}
            shadow-camera-far={240}
            shadow-bias={-0.0005}
          />

          {/* Subtle Rear Rim Light for Unit Block Edge Separation */}
          <directionalLight position={[-45, 50, -65]} intensity={0.45} color="#74a9cf" />
        </>
      )}
    </>
  );
};

/**
 * Helper to generate a proven 3-Act Documentary Camera Arc (Establishing -> Climax -> Pull-Back)
 * whenever a battle only needs standard wide-to-climax-to-overview choreography.
 */
export function buildThreeActCameraKeyframes(
  totalFrames: number,
  climaxFocus: { x: number; z: number; frame: number }
): CameraKeyframe[] {
  const act1End = Math.round(totalFrames * 0.25);
  const climaxStart = Math.max(act1End + 30, climaxFocus.frame - 45);
  const climaxEnd = Math.min(Math.round(totalFrames * 0.85), climaxFocus.frame + 75);
  const pullBackStart = Math.round(totalFrames * 0.88);

  return [
    // Act 1: Wide Strategic Establishing Shot (100% of battlefield visible)
    { frame: 0, position: [0, 135, 65], lookAt: [0, 0, -2] },
    { frame: act1End, position: [2, 133, 62], lookAt: [0, 0, -2] },
    // Act 2 -> Act 3: Deliberate Climax Focus (clamped safe height)
    {
      frame: climaxStart,
      position: [climaxFocus.x * 0.45, 96, climaxFocus.z + 70],
      lookAt: [climaxFocus.x * 0.5, 0, climaxFocus.z],
    },
    {
      frame: climaxEnd,
      position: [climaxFocus.x * 0.45, 94, climaxFocus.z + 70],
      lookAt: [climaxFocus.x * 0.5, 0, climaxFocus.z],
    },
    // Final Pull-Back: Full Encirclement / Outcome Overview
    { frame: pullBackStart, position: [0, 130, 62], lookAt: [0, 0, -2] },
    { frame: totalFrames, position: [0, 135, 65], lookAt: [0, 0, -2] },
  ];
}
