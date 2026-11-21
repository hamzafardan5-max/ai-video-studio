import React, { useMemo } from 'react';
import { Audio, Sequence, staticFile, useVideoConfig } from 'remotion';
import { HistoricalBattleData } from './battleData';

interface BattleAudioMixerProps {
  battle: HistoricalBattleData;
  enabled?: boolean;
  masterVolume?: number;
}

export const BattleAudioMixer: React.FC<BattleAudioMixerProps> = ({
  battle,
  enabled = false,
  masterVolume = 0.75,
}) => {
  const { durationInFrames } = useVideoConfig();

  const clashFrames = useMemo(() => {
    const frames = new Set<number>();
    battle.units.forEach((u) => {
      u.waypoints.forEach((wp) => {
        if (wp.inCombat) {
          frames.add(Math.floor(wp.frame / 45) * 45);
        }
      });
    });
    return Array.from(frames).sort((a, b) => a - b);
  }, [battle.units]);

  if (!enabled) {
    return null;
  }

  const outcomeFrame = Math.round(durationInFrames * 0.86);

  return (
    <>
      <Audio src={staticFile('audio/battle/ambient-war-drums.mp3')} volume={0.28 * masterVolume} loop />

      {battle.arrows.map((arrow) => (
        <Sequence key={`sfx-arrow-${arrow.id}`} from={arrow.startFrame} durationInFrames={35}>
          <Audio src={staticFile('audio/battle/arrow-whoosh.mp3')} volume={0.55 * masterVolume} />
        </Sequence>
      ))}

      {clashFrames.map((f) => (
        <Sequence key={`sfx-clash-${f}`} from={f} durationInFrames={50}>
          <Audio src={staticFile('audio/battle/combat-clash.mp3')} volume={0.45 * masterVolume} />
        </Sequence>
      ))}

      <Sequence from={outcomeFrame} durationInFrames={90}>
        <Audio src={staticFile('audio/battle/outcome-horn.mp3')} volume={0.65 * masterVolume} />
      </Sequence>
    </>
  );
};
