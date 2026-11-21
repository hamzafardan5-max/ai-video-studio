import { TerrainFeature } from './TerrainMesh';
import { TroopUnitData } from './TroopUnit';

export interface TacticalArrowData {
  id: string;
  faction: 'attacker' | 'defender';
  style: 'advance' | 'flank' | 'feigned-retreat' | 'encirclement';
  width?: number;
  startFrame: number;
  /** Maximum 60 frames (2.0s at 30fps). Must trigger 35-50 frames BEFORE troops march. */
  durationFrames: number;
  points: [number, number][];
}

export interface CameraKeyframe {
  frame: number;
  position: [number, number, number];
  lookAt: [number, number, number];
}

export interface BattlePhase {
  startFrame: number;
  endFrame: number;
  title: string;
  subtitle: string;
}

export interface HistoricalBattleData {
  id: string;
  title: string;
  date: string;
  location: string;
  era: 'ancient' | 'medieval' | 'napoleonic' | 'world-wars' | 'modern';
  historicalSources: string[];
  seed: string;
  factions: {
    attacker: {
      name: string;
      commander: string;
      strength: string;
      color: string;
    };
    defender: {
      name: string;
      commander: string;
      strength: string;
      color: string;
    };
  };
  terrain: {
    baseColor: string;
    highlandColor: string;
    waterColor: string;
    gridOpacity: number;
    features: TerrainFeature[];
  };
  phases: BattlePhase[];
  cameraKeyframes: CameraKeyframe[];
  units: TroopUnitData[];
  arrows: TacticalArrowData[];
  outcome: {
    winner: string;
    summary: string;
    casualties: string;
  };
}

/**
 * Deterministically computes remaining faction strength (0.0 to 1.0) at any frame
 * for driving live documentary HUD tug-of-war strength bars.
 */
export function calculateArmyStrengthAtFrame(
  units: TroopUnitData[],
  faction: 'attacker' | 'defender',
  frame: number
): number {
  const factionUnits = units.filter((u) => u.faction === faction);
  if (factionUnits.length === 0) return 1;

  let totalStrength = 0;
  for (const unit of factionUnits) {
    const wps = unit.waypoints;
    if (wps.length === 0 || frame <= wps[0].frame) {
      totalStrength += wps[0].strength ?? 1;
      continue;
    }
    const last = wps[wps.length - 1];
    if (frame >= last.frame) {
      totalStrength += last.strength ?? 1;
      continue;
    }

    for (let i = 0; i < wps.length - 1; i++) {
      const curr = wps[i];
      const next = wps[i + 1];
      if (frame >= curr.frame && frame <= next.frame) {
        const t = (frame - curr.frame) / Math.max(1, next.frame - curr.frame);
        const s1 = curr.strength ?? 1;
        const s2 = next.strength ?? s1;
        totalStrength += s1 + (s2 - s1) * t;
        break;
      }
    }
  }

  return Math.max(0, Math.min(1, totalStrength / factionUnits.length));
}
