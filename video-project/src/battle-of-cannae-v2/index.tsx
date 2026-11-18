import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {BATTLE, CameraKeyframe} from './battleData';
import {TerrainMesh} from './TerrainMesh';
import {TroopUnit} from './TroopUnit';
import {TacticalArrow} from './TacticalArrow';
import {BattleHud} from './BattleHud';

/**
 * Deterministic camera rig: the perspective camera is re-seated on every
 * frame from interpolated keyframes. No useFrame, no timers, no jitter.
 */
const CameraRig: React.FC<{
  position: [number, number, number];
  target: [number, number, number];
}> = ({position, target}) => {
  const camera = useThree(
    (state) => state.camera,
  ) as import('three').PerspectiveCamera;
  camera.fov = 45;
  camera.near = 1;
  camera.far = 700;
  camera.updateProjectionMatrix();
  camera.position.set(position[0], position[1], position[2]);
  camera.lookAt(target[0], target[1], target[2]);
  return null;
};

const axis = (
  frame: number,
  keys: CameraKeyframe[],
  pick: (k: CameraKeyframe) => number,
) =>
  interpolate(
    frame,
    keys.map((k) => k.frame),
    keys.map(pick),
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.cubic),
    },
  );

/** Single 3-act camera arc with a gentle never-frozen drift. */
const getCameraAtFrame = (frame: number) => {
  const keys = BATTLE.cameraKeyframes;

  const driftAmount = interpolate(frame, [0, 70, 830, 899], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const driftX = Math.sin(frame / 230) * 1.5 * driftAmount;
  const driftZ = Math.cos(frame / 270) * 1.1 * driftAmount;

  return {
    position: [
      axis(frame, keys, (k) => k.position[0]) + driftX,
      axis(frame, keys, (k) => k.position[1]),
      axis(frame, keys, (k) => k.position[2]) + driftZ,
    ] as [number, number, number],
    lookAt: [
      axis(frame, keys, (k) => k.lookAt[0]),
      axis(frame, keys, (k) => k.lookAt[1]),
      axis(frame, keys, (k) => k.lookAt[2]),
    ] as [number, number, number],
  };
};

export const BattleOfCannaeV2: React.FC = () => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const cam = getCameraAtFrame(frame);

  return (
    <AbsoluteFill style={{backgroundColor: '#171a21'}}>
      <ThreeCanvas width={width} height={height} shadows>
        <color attach="background" args={['#171a21']} />
        <fog attach="fog" args={['#171a21', 165, 360]} />

        {/* Key: warm low golden-hour sun, 40° azimuth / 45° elevation */}
        <directionalLight
          position={[72, 118, 48]}
          intensity={1.8}
          color="#fff2d6"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-110}
          shadow-camera-right={110}
          shadow-camera-top={110}
          shadow-camera-bottom={-110}
          shadow-camera-near={10}
          shadow-camera-far={400}
          shadow-bias={-0.0004}
        />

        {/* Fill: cool sky dome over warm dust */}
        <hemisphereLight args={['#8ecae6', '#3d352e', 0.65]} />

        {/* Rim: catches the bevels of the counters from behind */}
        <directionalLight
          position={[-70, 52, -95]}
          intensity={0.55}
          color="#9fd0ff"
        />

        <CameraRig position={cam.position} target={cam.lookAt} />

        <TerrainMesh />

        {BATTLE.units.map((unit) => (
          <TroopUnit key={unit.id} data={unit} />
        ))}

        {BATTLE.arrows.map((arrow) => (
          <TacticalArrow key={arrow.id} data={arrow} />
        ))}
      </ThreeCanvas>

      {/* Soft screen vignette: locks the eye on the illuminated battlefield */}
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.34) 78%, rgba(0,0,0,0.62) 100%)',
        }}
      />

      <BattleHud />
    </AbsoluteFill>
  );
};

export default BattleOfCannaeV2;
