import React, { useMemo } from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { battleData } from './battleData';
import { validateBattleData } from '../shared/battle-engine/battleValidator';
import { CameraRig } from '../shared/battle-engine/CameraRig';
import { createElevationSampler, TerrainMesh } from '../shared/battle-engine/TerrainMesh';
import { TroopUnit } from '../shared/battle-engine/TroopUnit';
import { TacticalArrow } from '../shared/battle-engine/TacticalArrow';
import { MapLabels3D } from '../shared/battle-engine/MapLabels3D';
import { BattleHud } from '../shared/battle-engine/BattleHud';
import { BattleAudioMixer } from '../shared/battle-engine/BattleAudioMixer';

// Pre-render audit: logs any unit overlap, arrow clutter, or missing primary sources
validateBattleData(battleData);

export const BattleOfCannaeV3: React.FC = () => {
  const { width, height } = useVideoConfig();

  const getElevationAt = useMemo(
    () => createElevationSampler(battleData.terrain.features, battleData.seed),
    []
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#161920' }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 45, near: 1, far: 400 }}>
        <CameraRig keyframes={battleData.cameraKeyframes} />

        <TerrainMesh
          features={battleData.terrain.features}
          seed={battleData.seed}
          baseColor={battleData.terrain.baseColor}
          highlandColor={battleData.terrain.highlandColor}
          waterColor={battleData.terrain.waterColor}
          gridOpacity={battleData.terrain.gridOpacity}
        />

        {battleData.units.map((unit) => (
          <TroopUnit
            key={unit.id}
            unit={unit}
            factionColor={battleData.factions[unit.faction].color}
            getElevationAt={getElevationAt}
          />
        ))}

        {battleData.arrows.map((arrow) => (
          <TacticalArrow
            key={arrow.id}
            points={arrow.points}
            color={battleData.factions[arrow.faction].color}
            width={arrow.width}
            startFrame={arrow.startFrame}
            durationFrames={arrow.durationFrames}
            getElevationAt={getElevationAt}
          />
        ))}

        <MapLabels3D
          features={battleData.terrain.features}
          units={battleData.units}
          attackerColor={battleData.factions.attacker.color}
          defenderColor={battleData.factions.defender.color}
          getElevationAt={getElevationAt}
        />
      </ThreeCanvas>

      <BattleHud battle={battleData} />
      <BattleAudioMixer battle={battleData} enabled={false} />
    </AbsoluteFill>
  );
};

export default BattleOfCannaeV3;
