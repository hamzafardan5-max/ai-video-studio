import React from 'react';
import {AbsoluteFill, interpolate, Easing, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {BATTLE} from './battleData';
import {TerrainMesh} from './TerrainMesh';
import {TroopUnit} from './TroopUnit';
import {TacticalArrow} from './TacticalArrow';
import {BattleHud} from './BattleHud';

/**
 * Deterministic camera rig: re-applies position/lookAt on every Remotion
 * frame render from interpolated keyframes — no useFrame, no timers.
 */
const CameraRig: React.FC<{
  position: [number, number, number];
  target: [number, number, number];
}> = ({position, target}) => {
  const camera = useThree((state) => state.camera) as import('three').PerspectiveCamera;
  camera.fov = 40;
  camera.near = 1;
  camera.far = 600;
  camera.updateProjectionMatrix();
  camera.position.set(position[0], position[1], position[2]);
  camera.lookAt(target[0], target[1], target[2]);
  return null;
};

const getCameraAtFrame = (frame: number) => {
  const keys = BATTLE.cameraKeyframes;
  const frames = keys.map((k) => k.frame);
  const axis = (pick: (k: (typeof keys)[number]) => number) =>
    interpolate(frame, frames, keys.map(pick), {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.inOut(Easing.ease),
    });

  return {
    position: [
      axis((k) => k.position[0]),
      axis((k) => k.position[1]),
      axis((k) => k.position[2]),
    ] as [number, number, number],
    lookAt: [
      axis((k) => k.lookAt[0]),
      axis((k) => k.lookAt[1]),
      axis((k) => k.lookAt[2]),
    ] as [number, number, number],
  };
};

export const BattleOfCannae: React.FC = () => {
  const {width, height} = useVideoConfig();
  const frame = useCurrentFrame();
  const cam = getCameraAtFrame(frame);

  return (
    <AbsoluteFill style={{backgroundColor: '#10131a'}}>
      <ThreeCanvas width={width} height={height} shadows>
        <color attach="background" args={['#10131a']} />
        <fog attach="fog" args={['#10131a', 240, 460]} />

        {/* 45° directional sunlight + hemisphere fill */}
        <directionalLight
          position={[60, 90, 40]}
          intensity={1.4}
          color="#fff2dc"
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-left={-110}
          shadow-camera-right={110}
          shadow-camera-top={110}
          shadow-camera-bottom={-110}
          shadow-camera-far={400}
        />
        <hemisphereLight args={['#cfd8e8', '#6b5d43', 0.7]} />

        <CameraRig position={cam.position} target={cam.lookAt} />

        <TerrainMesh />
        {BATTLE.units.map((u) => (
          <TroopUnit key={u.id} data={u} />
        ))}
        {BATTLE.arrows.map((a) => (
          <TacticalArrow key={a.id} data={a} />
        ))}
      </ThreeCanvas>

      <BattleHud />
    </AbsoluteFill>
  );
};
