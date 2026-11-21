import { HistoricalBattleData } from './battleData';
import { TroopUnitData } from './TroopUnit';

export interface ValidationIssue {
  severity: 'ERROR' | 'WARN';
  category: 'SOURCES' | 'ARROWS' | 'TIMING' | 'SPACING' | 'CAMERA';
  message: string;
}

export function validateBattleData(data: HistoricalBattleData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // 1. Validate Period-Adaptive Primary Source Citations
  if (!data.historicalSources || data.historicalSources.length < 2) {
    issues.push({
      severity: 'ERROR',
      category: 'SOURCES',
      message: `Battle "${data.title}" (${data.era}) lists fewer than 2 historicalSources. Cross-reference Wikipedia + period-specific primary chronicles/archives from historicalResearch.ts.`,
    });
  } else if (data.era === 'ancient') {
    const joinedSources = data.historicalSources.join(' ').toLowerCase();
    const classicalAuthors = [
      'polybius',
      'livy',
      'arrian',
      'herodotus',
      'thucydides',
      'caesar',
      'plutarch',
      'xenophon',
      'appian',
      'diodorus',
      'tacitus',
      'josephus',
    ];
    const hasClassicalSource = classicalAuthors.some((author) =>
      joinedSources.includes(author)
    );
    if (!hasClassicalSource) {
      issues.push({
        severity: 'WARN',
        category: 'SOURCES',
        message: `Ancient battle "${data.title}" does not cite a classical chronicler (e.g., Polybius, Livy, Arrian, Caesar, Herodotus). Add primary ancient sources to historicalSources.`,
      });
    }
  }

  // 2. Validate Arrow Lifespan (Max 60 frames / 2.0s at 30fps)
  data.arrows.forEach((arrow) => {
    const duration = arrow.durationFrames;
    if (duration > 65) {
      issues.push({
        severity: 'ERROR',
        category: 'ARROWS',
        message: `Arrow "${arrow.id}" stays visible for ${duration} frames (> 2.0s max). Set durationFrames <= 60 so arrows fade out cleanly.`,
      });
    } else if (duration > 60) {
      issues.push({
        severity: 'WARN',
        category: 'ARROWS',
        message: `Arrow "${arrow.id}" duration is ${duration} frames (recommended <= 60 frames / 2.0s).`,
      });
    }
  });

  // 3. Validate Arrow Clutter per Battle Phase (Max 2 arrows per phase)
  data.phases.forEach((phase) => {
    const activeInPhase = data.arrows.filter(
      (a) => a.startFrame >= phase.startFrame && a.startFrame <= phase.endFrame
    );
    if (activeInPhase.length > 2) {
      issues.push({
        severity: 'ERROR',
        category: 'ARROWS',
        message: `Phase "${phase.title}" triggers ${activeInPhase.length} arrows (max 2 allowed). Merge parallel unit arrows into 1 unified strategic arrow.`,
      });
    }
  });

  // 4. Validate Opening Camera Framing (Must start wide enough for full deployment)
  if (data.cameraKeyframes.length > 0) {
    const firstCam = data.cameraKeyframes[0];
    if (firstCam.position[1] < 115) {
      issues.push({
        severity: 'WARN',
        category: 'CAMERA',
        message: `Opening camera height y=${firstCam.position[1]} may crop flanks in 9:16 portrait view. Start with y >= 125 for a full-battle establishing shot.`,
      });
    }
  }

  // 5. Continuous Unit Anti-Overlap Audit (Samples every 15 frames + all keyframes)
  const sampleFrames = new Set<number>([0]);
  let maxFrame = 0;

  data.units.forEach((u) => {
    u.waypoints.forEach((wp) => {
      sampleFrames.add(wp.frame);
      if (wp.frame > maxFrame) maxFrame = wp.frame;
    });
  });

  for (let f = 0; f <= maxFrame; f += 15) {
    sampleFrames.add(f);
  }

  const sortedFrames = Array.from(sampleFrames).sort((a, b) => a - b);

  for (const frame of sortedFrames) {
    const activeUnits = data.units
      .map((unit) => {
        const state = getInterpolatedUnitState(unit, frame);
        return {
          id: unit.id,
          x: state.x,
          z: state.z,
          strength: state.strength,
          halfW: (unit.width * (0.55 + state.strength * 0.45)) / 2,
          halfD: (unit.depth * (0.55 + state.strength * 0.45)) / 2,
        };
      })
      .filter((u) => u.strength > 0.05);

    for (let i = 0; i < activeUnits.length; i++) {
      for (let j = i + 1; j < activeUnits.length; j++) {
        const a = activeUnits[i];
        const b = activeUnits[j];
        const minGap = 0.5;
        const overlapX = a.halfW + b.halfW + minGap - Math.abs(a.x - b.x);
        const overlapZ = a.halfD + b.halfD + minGap - Math.abs(a.z - b.z);

        if (overlapX > 0 && overlapZ > 0) {
          issues.push({
            severity: 'ERROR',
            category: 'SPACING',
            message: `Unit overlap at frame ${frame}: "${a.id}" and "${b.id}" intersect by (dx=${overlapX.toFixed(1)}, dz=${overlapZ.toFixed(1)}). Increase formation spacing or combat standoff distance.`,
          });
        }
      }
    }
  }

  if (issues.length > 0 && typeof console !== 'undefined') {
    console.warn(`[3d-history-battle Validator] Found ${issues.length} issue(s):`, issues);
  }

  return issues;
}

function getInterpolatedUnitState(
  unit: TroopUnitData,
  frame: number
): { x: number; z: number; strength: number } {
  const wps = unit.waypoints;
  if (wps.length === 0) return { x: 0, z: 0, strength: 1 };
  if (frame <= wps[0].frame) {
    return { x: wps[0].x, z: wps[0].z, strength: wps[0].strength ?? 1 };
  }
  const last = wps[wps.length - 1];
  if (frame >= last.frame) {
    return { x: last.x, z: last.z, strength: last.strength ?? 1 };
  }

  for (let i = 0; i < wps.length - 1; i++) {
    const curr = wps[i];
    const next = wps[i + 1];
    if (frame >= curr.frame && frame <= next.frame) {
      const t = (frame - curr.frame) / Math.max(1, next.frame - curr.frame);
      const s1 = curr.strength ?? 1;
      const s2 = next.strength ?? s1;
      return {
        x: curr.x + (next.x - curr.x) * t,
        z: curr.z + (next.z - curr.z) * t,
        strength: s1 + (s2 - s1) * t,
      };
    }
  }

  return { x: last.x, z: last.z, strength: last.strength ?? 1 };
}
