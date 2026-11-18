import {
  BATTLE,
  TroopUnitData,
  UnitWaypoint,
  getNearestEnemy,
  getUnitPosition,
} from './battleData';

/**
 * Yaw resolution for tactical counters.
 *
 * Rules:
 *   1. Engaged waypoints (`facing: 'enemy'` or `inCombat`) face the nearest
 *      opposing unit. The bearing is resolved at the *current frame* and
 *      low-passed, so a block that is being pushed backwards keeps its front
 *      edge — and its combat sparks — on the enemy.
 *   2. Explicit `rotationY` and movement headings are for staging only.
 *   3. Never interpolate between waypoint-resolved enemy bearings: when the
 *      nearest enemy changes mid-leg the lerp dwells between two targets and
 *      the block presents its side or rear to both.
 *
 * The whole 900-frame curve is solved once per unit and cached, so the solver
 * costs nothing per rendered frame (and stays a pure function of the data).
 */

const TURN_RATE = 0.16;
const MAX_TURN_RATE = 0.5;
/**
 * Adaptive gain: small corrections drift smoothly (no jitter), large ones —
 * a new threat arriving on a different side — resolve in a handful of frames
 * instead of the body lingering side-on to the enemy it is supposed to face.
 */
const turnGain = (error: number): number =>
  Math.min(MAX_TURN_RATE, Math.max(TURN_RATE, Math.abs(error) * 0.55));
const LAST_FRAME = Math.max(...BATTLE.cameraKeyframes.map((k) => k.frame));

export const normAngle = (a: number): number => {
  let v = a;
  while (v > Math.PI) v -= Math.PI * 2;
  while (v < -Math.PI) v += Math.PI * 2;
  return v;
};

export const lerpAngle = (a: number, b: number, t: number): number =>
  a + normAngle(b - a) * t;

const isEngaged = (w: UnitWaypoint): boolean =>
  w.facing === 'enemy' || Boolean(w.inCombat);

const activeIndexAt = (unit: TroopUnitData, frame: number): number => {
  const w = unit.waypoints;
  for (let i = w.length - 1; i >= 0; i--) {
    if (frame >= w[i].frame) return i;
  }
  return 0;
};

/** Line-of-march heading per waypoint: explicit yaw → leg → faction baseline. */
const marchHeadings = (unit: TroopUnitData): number[] =>
  unit.waypoints.map((w, i, arr) => {
    if (w.rotationY !== undefined) return w.rotationY;
    for (let j = i + 1; j < arr.length; j++) {
      const dx = arr[j].x - w.x;
      const dz = arr[j].z - w.z;
      if (Math.hypot(dx, dz) > 0.001) return Math.atan2(dx, dz);
    }
    for (let j = i - 1; j >= 0; j--) {
      const dx = w.x - arr[j].x;
      const dz = w.z - arr[j].z;
      if (Math.hypot(dx, dz) > 0.001) return Math.atan2(dx, dz);
    }
    return unit.faction === 'attacker' ? Math.PI : 0;
  });

const marchYawAt = (unit: TroopUnitData, frame: number): number => {
  const w = unit.waypoints;
  const h = marchHeadings(unit);
  if (frame <= w[0].frame) return h[0];
  if (frame >= w[w.length - 1].frame) return h[h.length - 1];
  for (let i = 0; i < w.length - 1; i++) {
    if (frame >= w[i].frame && frame <= w[i + 1].frame) {
      const span = Math.max(1, w[i + 1].frame - w[i].frame);
      const t = (frame - w[i].frame) / span;
      const eased = t * t * (3 - 2 * t);
      return lerpAngle(h[i], h[i + 1], eased);
    }
  }
  return h[0];
};

/** World-space bearing from a unit to its nearest opposing unit. */
const engagedBearing = (
  unit: TroopUnitData,
  frame: number,
  fallback: number,
): number => {
  const foe = getNearestEnemy(unit, frame);
  if (!foe) return fallback;
  const self = getUnitPosition(unit, frame);
  const dx = foe.x - self.x;
  const dz = foe.z - self.z;
  if (Math.hypot(dx, dz) < 0.001) return fallback;
  return Math.atan2(dx, dz);
};

const yawCache = new Map<string, Float32Array>();

const solveYawTable = (unit: TroopUnitData): Float32Array => {
  const table = new Float32Array(LAST_FRAME + 1);
  let yaw = marchYawAt(unit, 0);

  for (let frame = 0; frame <= LAST_FRAME; frame++) {
    const engaged = isEngaged(unit.waypoints[activeIndexAt(unit, frame)]);
    if (engaged) {
      const target = engagedBearing(unit, frame, yaw);
      yaw = lerpAngle(yaw, target, turnGain(normAngle(target - yaw)));
    } else {
      yaw = marchYawAt(unit, frame);
    }
    table[frame] = yaw;
  }
  return table;
};

/** Deterministic, cached yaw for a unit at a (possibly fractional) frame. */
export const getUnitYaw = (unit: TroopUnitData, frame: number): number => {
  let table = yawCache.get(unit.id);
  if (!table) {
    table = solveYawTable(unit);
    yawCache.set(unit.id, table);
  }
  const at = Math.max(0, Math.min(LAST_FRAME, Math.round(frame)));
  return table[at];
};
