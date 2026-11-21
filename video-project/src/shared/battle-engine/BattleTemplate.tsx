import React, { useMemo } from 'react';
import { AbsoluteFill, useVideoConfig } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
import { HistoricalBattleData } from './battleData';
import { validateBattleData } from './battleValidator';
import { CameraRig } from './CameraRig';
import { createElevationSampler, TerrainMesh } from './TerrainMesh';
import { TroopUnit } from './TroopUnit';
import { TacticalArrow } from './TacticalArrow';
import { MapLabels3D } from './MapLabels3D';
import { BattleHud } from './BattleHud';
import { BattleAudioMixer } from './BattleAudioMixer';

/**
 * BattleTemplate — master scene-wiring blueprint.
 * NOT registered in Root.tsx on purpose: copy this layout into each battle's own
 * `index.tsx` and pass that battle's `HistoricalBattleData`.
 */
export const BattleTemplate: React.FC<{ battle: HistoricalBattleData }> = ({ battle }) => {
  const { width, height } = useVideoConfig();

  // Pre-render audit: logs any unit overlap, arrow clutter, or missing primary sources
  validateBattleData(battle);

  const getElevationAt = useMemo(
    () => createElevationSampler(battle.terrain.features, battle.seed),
    [battle]
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#161920' }}>
      <ThreeCanvas width={width} height={height} shadows camera={{ fov: 45, near: 1, far: 400 }}>
        <CameraRig keyframes={battle.cameraKeyframes} />

        <TerrainMesh
          features={battle.terrain.features}
          seed={battle.seed}
          baseColor={battle.terrain.baseColor}
          highlandColor={battle.terrain.highlandColor}
          waterColor={battle.terrain.waterColor}
          gridOpacity={battle.terrain.gridOpacity}
        />

        {battle.units.map((unit) => (
          <TroopUnit
            key={unit.id}
            unit={unit}
            factionColor={battle.factions[unit.faction].color}
            getElevationAt={getElevationAt}
          />
        ))}

        {battle.arrows.map((arrow) => (
          <TacticalArrow
            key={arrow.id}
            points={arrow.points}
            color={battle.factions[arrow.faction].color}
            width={arrow.width}
            startFrame={arrow.startFrame}
            durationFrames={arrow.durationFrames}
            getElevationAt={getElevationAt}
          />
        ))}

        <MapLabels3D
          features={battle.terrain.features}
          units={battle.units}
          attackerColor={battle.factions.attacker.color}
          defenderColor={battle.factions.defender.color}
          getElevationAt={getElevationAt}
        />
      </ThreeCanvas>

      <BattleHud battle={battle} />
      <BattleAudioMixer battle={battle} enabled={false} />
    </AbsoluteFill>
  );
};
