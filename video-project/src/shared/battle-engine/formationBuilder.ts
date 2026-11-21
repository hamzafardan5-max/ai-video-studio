import { TroopUnitData } from './TroopUnit';
import { UnitCategory } from './unitTextureGenerator';

export interface LineFormationOptions {
  prefix: string;
  labelPrefix: string;
  count: number;
  centerX: number;
  z: number;
  faction: 'attacker' | 'defender';
  category: UnitCategory;
  unitWidth?: number;
  unitDepth?: number;
  gapX?: number;
}

export function createBattleLine(opts: LineFormationOptions): TroopUnitData[] {
  const width = opts.unitWidth ?? 6.2;
  const depth = opts.unitDepth ?? 2.6;
  const gap = Math.max(1.8, opts.gapX ?? 2.0);
  const stepX = width + gap;
  const startX = opts.centerX - ((opts.count - 1) * stepX) / 2;
  const rotY = opts.faction === 'attacker' ? 0 : Math.PI;

  return Array.from({ length: opts.count }, (_, idx) => {
    const x = Number((startX + idx * stepX).toFixed(2));
    return {
      id: `${opts.prefix}-${idx + 1}`,
      label: `${opts.labelPrefix} ${idx + 1}`,
      faction: opts.faction,
      category: opts.category,
      width,
      depth,
      waypoints: new Array({ frame: 0, x, z: opts.z, rotationY: rotY, strength: 1 }),
    };
  });
}

export interface CrescentFormationOptions {
  prefix: string;
  labelPrefix: string;
  count: number;
  centerX: number;
  centerZ: number;
  spanX: number;
  bowDepthZ: number;
  faction: 'attacker' | 'defender';
  category: UnitCategory;
  unitWidth?: number;
  unitDepth?: number;
}

export function createCrescentFormation(opts: CrescentFormationOptions): TroopUnitData[] {
  const width = opts.unitWidth ?? 5.6;
  const depth = opts.unitDepth ?? 2.4;
  const baseYaw = opts.faction === 'attacker' ? 0 : Math.PI;

  return Array.from({ length: opts.count }, (_, idx) => {
    const t = opts.count === 1 ? 0 : (idx / (opts.count - 1)) * 2 - 1;
    const x = Number((opts.centerX + t * (opts.spanX / 2)).toFixed(2));
    const z = Number((opts.centerZ + (1 - t * t) * opts.bowDepthZ).toFixed(2));
    const dzdx = (-2 * t * opts.bowDepthZ) / Math.max(1, opts.spanX / 2);
    const rotY = Number((baseYaw - Math.atan(dzdx)).toFixed(3));

    return {
      id: `${opts.prefix}-${idx + 1}`,
      label: `${opts.labelPrefix} ${idx + 1}`,
      faction: opts.faction,
      category: opts.category,
      width,
      depth,
      waypoints: new Array({ frame: 0, x, z, rotationY: rotY, strength: 1 }),
    };
  });
}
