/**
 * Battle of Cannae — 2 August 216 BC, Apulia, Italy.
 *
 * Research protocol: PERIOD_RESEARCH_MATRIX.ancient (see shared/battle-engine/historicalResearch.ts)
 *  - Pass 1 (baseline): Wikipedia, "Battle of Cannae" — geography, order of battle, casualty figures.
 *  - Pass 2 (primary): Polybius, The Histories III.113–117; Livy, Ab Urbe Condita XXII.44–49.
 *
 * Primary-source anchors used below:
 *  - Polybius III.113 / Livy XXII.46: Hannibal's left (Spanish + Gallic horse) rests on the
 *    Aufidus; half the heavy-armed Africans on each side of the Gallic/Iberian centre; Numidian
 *    horse on the right. The centre advances into a crescent with the Africans in echelon.
 *  - Polybius III.115 / Livy XXII.47: Hasdrubal routs the Roman cavalry against the river, then
 *    swings across to the Roman rear; the Africans wheel inward on the Roman flanks.
 *  - Polybius III.117: ~70,000 Roman dead, 10,000 captured; ~5,700 Carthaginian dead.
 *
 * Map convention (matches Livy XXII.46.8 — Romans face north, Carthaginians south):
 *  - +X = east, -X = west, +Z = south, -Z = north.
 *  - Rome (attacker) deploys south (+Z) facing north (-Z).
 *  - Carthage (defender) deploys north (-Z) facing south (+Z).
 *  - The Aufidus runs along the eastern (+X) edge, anchoring Hannibal's left flank and the
 *    Roman right — exactly as Polybius III.113 describes.
 *  - Safe portrait bounds: X in [-48, 48], Z in [-78, 78].
 */

import { HistoricalBattleData } from '../shared/battle-engine/battleData';
import { TroopUnitData, UnitWaypoint } from '../shared/battle-engine/TroopUnit';
import { UnitCategory } from '../shared/battle-engine/unitTextureGenerator';
import {
  createBattleLine,
  createCrescentFormation,
} from '../shared/battle-engine/formationBuilder';
import { buildThreeActCameraKeyframes } from '../shared/battle-engine/CameraRig';
import { getResearchGuideForEra } from '../shared/battle-engine/historicalResearch';

const RESEARCH = getResearchGuideForEra('ancient');

const ROME = '#c8433a';
const CARTHAGE = '#7d6ae0';

/** Romans face north (-Z); Carthaginians face south (+Z). */
const ROMAN_FACING = Math.PI;
const CARTH_FACING = 0;

const p = (
  frame: number,
  x: number,
  z: number,
  rotationY: number,
  strength = 1,
  extra?: Partial<UnitWaypoint>
): UnitWaypoint => ({ frame, x, z, rotationY, strength, ...extra });

const makeUnit = (
  id: string,
  label: string,
  faction: 'attacker' | 'defender',
  category: UnitCategory,
  width: number,
  depth: number,
  waypoints: UnitWaypoint[]
): TroopUnitData => ({ id, label, faction, category, width, depth, waypoints });

// ---------------------------------------------------------------------------
// Roman army — deep infantry mass (Polybius III.113: maniples closed up, depth > front)
// ---------------------------------------------------------------------------

const romanFront = createBattleLine({
  prefix: 'rome-legio',
  labelPrefix: 'Legio',
  count: 4,
  centerX: 0,
  z: 42,
  faction: 'attacker',
  category: 'heavy-infantry',
  unitWidth: 5.5,
  unitDepth: 3.2,
  gapX: 1.6,
}).map((u) => {
  const x = u.waypoints[0].x;
  return makeUnit(u.id, u.label, 'attacker', 'heavy-infantry', u.width, u.depth, [
    p(0, x, 42, ROMAN_FACING),
    p(160, x, 42, ROMAN_FACING),
    p(430, x, -26, ROMAN_FACING, 0.95, { inCombat: true }),
    p(560, x, -30, ROMAN_FACING, 0.7, { inCombat: true }),
    p(720, x, -30, ROMAN_FACING, 0.35, { inCombat: true }),
    p(840, x, -30, ROMAN_FACING, 0.12, { inCombat: true }),
  ]);
});

const romanRear = createBattleLine({
  prefix: 'rome-legio-rear',
  labelPrefix: 'Legio (rear)',
  count: 4,
  centerX: 0,
  z: 51,
  faction: 'attacker',
  category: 'heavy-infantry',
  unitWidth: 5.5,
  unitDepth: 3.2,
  gapX: 1.6,
}).map((u) => {
  const x = u.waypoints[0].x;
  return makeUnit(u.id, u.label, 'attacker', 'heavy-infantry', u.width, u.depth, [
    p(0, x, 51, ROMAN_FACING),
    p(160, x, 51, ROMAN_FACING),
    p(430, x, -18, ROMAN_FACING, 0.95, { inCombat: true }),
    p(560, x, -22, ROMAN_FACING, 0.7, { inCombat: true }),
    p(720, x, -22, ROMAN_FACING, 0.35, { inCombat: true }),
    p(840, x, -22, ROMAN_FACING, 0.12, { inCombat: true }),
  ]);
});

// Roman right cavalry (near the Aufidus) and left cavalry — both routed (Livy XXII.47).
const romanRightCavalry = createBattleLine({
  prefix: 'rome-ala-right',
  labelPrefix: 'Ala Romana',
  count: 2,
  centerX: 20,
  z: 40,
  faction: 'attacker',
  category: 'cavalry',
  unitWidth: 4,
  unitDepth: 2.2,
  gapX: 1.2,
}).map((u) => {
  const x = u.waypoints[0].x;
  return makeUnit(u.id, u.label, 'attacker', 'cavalry', u.width, u.depth, [
    p(0, x, 40, ROMAN_FACING),
    p(200, x, 40, ROMAN_FACING),
    p(300, x + 4, 50, CARTH_FACING, 0.55, { isRouting: true }),
    p(380, x + 8, 58, CARTH_FACING, 0, { isRouting: true }),
  ]);
});

const romanLeftCavalry = createBattleLine({
  prefix: 'rome-ala-left',
  labelPrefix: 'Ala Sociorum',
  count: 2,
  centerX: -20,
  z: 40,
  faction: 'attacker',
  category: 'cavalry',
  unitWidth: 4,
  unitDepth: 2.2,
  gapX: 1.2,
}).map((u) => {
  const x = u.waypoints[0].x;
  return makeUnit(u.id, u.label, 'attacker', 'cavalry', u.width, u.depth, [
    p(0, x, 40, ROMAN_FACING),
    p(200, x, 40, ROMAN_FACING),
    p(300, x - 4, 50, CARTH_FACING, 0.55, { isRouting: true }),
    p(380, x - 8, 58, CARTH_FACING, 0, { isRouting: true }),
  ]);
});

// ---------------------------------------------------------------------------
// Carthaginian army
// ---------------------------------------------------------------------------

// Hasdrubal's heavy Spanish/Gallic cavalry on the left, hard against the Aufidus (Polybius III.113).
const hasdrubalCavalry = createBattleLine({
  prefix: 'carth-hasdrubal',
  labelPrefix: "Hasdrubal's Horse",
  count: 3,
  centerX: 34,
  z: -36,
  faction: 'defender',
  category: 'cavalry',
  unitWidth: 4,
  unitDepth: 2.2,
  gapX: 1.2,
}).map((u, i) => {
  const x = u.waypoints[0].x;
  const rearX = [-6, 0, 6][i];
  const isCommander = i === 1;
  return makeUnit(
    isCommander ? 'carth-hasdrubal' : u.id,
    isCommander ? 'Hasdrubal' : u.label,
    'defender',
    isCommander ? 'commander' : 'cavalry',
    u.width,
    u.depth,
    [
      p(0, x, -36, CARTH_FACING),
      p(200, x, -36, CARTH_FACING),
      p(340, x, 38, CARTH_FACING, 0.92, { inCombat: true }),
      p(350, x, 38, CARTH_FACING, 0.92),
      p(520, rearX, -8, ROMAN_FACING, 0.85),
      p(765, rearX, -14, ROMAN_FACING, 0.8, { inCombat: true }),
      p(840, rearX, -14, ROMAN_FACING, 0.78),
    ]
  );
});

// Hanno's Numidian light horse on the right — pins then pursues the allied cavalry.
const numidianCavalry = createBattleLine({
  prefix: 'carth-numidian',
  labelPrefix: 'Numidian Horse',
  count: 3,
  centerX: -34,
  z: -36,
  faction: 'defender',
  category: 'cavalry',
  unitWidth: 4,
  unitDepth: 2.2,
  gapX: 1.2,
}).map((u) => {
  const x = u.waypoints[0].x;
  return makeUnit(u.id, u.label, 'defender', 'cavalry', u.width, u.depth, [
    p(0, x, -36, CARTH_FACING),
    p(200, x, -36, CARTH_FACING),
    p(380, x + 4, 30, CARTH_FACING, 0.9, { inCombat: true }),
    p(400, x + 4, 30, CARTH_FACING, 0.9),
    p(520, x - 8, 42, -Math.PI / 2, 0, { isRouting: true }),
  ]);
});

// Hannibal's convex echeloned crescent (Polybius III.113–115):
// thin Gallic/Iberian centre, heavy African veterans on the projecting horns.
const crescent = createCrescentFormation({
  prefix: 'carth-crescent',
  labelPrefix: 'Crescent',
  count: 8,
  centerX: 0,
  centerZ: -40,
  spanX: 60,
  bowDepthZ: 10,
  faction: 'defender',
  category: 'infantry',
  unitWidth: 5.2,
  unitDepth: 2.6,
}).map((u) => {
  const x = u.waypoints[0].x;
  const z = u.waypoints[0].z;
  const sign = x > 0 ? 1 : -1;
  const isAfrican = Math.abs(x) >= 21;

  if (isAfrican) {
    // African horn: faces the enemy, then wheels inward on the Roman flank (Polybius III.115).
    const finalX = sign * (Math.abs(x) > 25 ? 24 : 17);
    return makeUnit(
      u.id,
      'African Veterans',
      'defender',
      'heavy-infantry',
      u.width,
      u.depth,
      [
        p(0, x, z, CARTH_FACING),
        p(470, x, z, CARTH_FACING),
        p(630, finalX, -28, -sign * Math.PI * 0.5, 0.9, { inCombat: true }),
        p(840, finalX, -28, -sign * Math.PI * 0.5, 0.85, { inCombat: true }),
      ]
    );
  }

  // Gallic/Iberian centre: controlled retreat, never turning its back (Livy XXII.47).
  const finalZ = Math.abs(x) >= 12 ? -40 : -44;
  return makeUnit(u.id, 'Gallic / Iberian', 'defender', 'infantry', u.width, u.depth, [
    p(0, x, z, CARTH_FACING),
    p(180, x, z, CARTH_FACING),
    p(470, x, finalZ, CARTH_FACING, 0.85, { inCombat: true }),
    p(840, x, finalZ, CARTH_FACING, 0.7, { inCombat: true }),
  ]);
});

// Commanders (MapLabels3D renders moving labels for these).
const hannibal = makeUnit('carth-hannibal', 'Hannibal', 'defender', 'commander', 4, 2.5, [
  p(0, 0, -58, CARTH_FACING),
  p(840, 0, -58, CARTH_FACING, 0.95),
]);

const varro = makeUnit('rome-varro', 'Varro', 'attacker', 'commander', 4, 2.5, [
  p(0, 0, 58, ROMAN_FACING),
  p(840, 0, 58, ROMAN_FACING, 0.95),
]);

export const battleData: HistoricalBattleData = {
  id: 'battle-of-cannae-v3',
  title: 'Battle of Cannae',
  date: '2 August 216 BC',
  location: 'Cannae, Apulia, Italy',
  era: RESEARCH.era,
  historicalSources: [
    'Polybius, The Histories, Book III, ch. 113–117 (order of battle, crescent, double envelopment)',
    'Livy, Ab Urbe Condita, Book XXII, ch. 44–49 (deployment, Hasdrubal\'s cavalry, encirclement)',
    'Wikipedia, "Battle of Cannae" (accessed November 2026)',
  ],
  seed: 'cannae-216-bc-v3',

  factions: {
    attacker: {
      name: 'Roman Republic',
      commander: 'Varro & Paullus',
      strength: '86,400',
      color: ROME,
    },
    defender: {
      name: 'Carthage',
      commander: 'Hannibal Barca',
      strength: '50,000',
      color: CARTHAGE,
    },
  },

  terrain: {
    baseColor: '#5a6b4a',
    highlandColor: '#8c7853',
    waterColor: '#264653',
    gridOpacity: 0.12,
    features: [
      // The Aufidus pins Hannibal's left flank and the Roman right (Polybius III.113).
      { id: 'aufidus', name: 'Aufidus River', type: 'river', x: 48, z: 0, radiusX: 4, radiusZ: 85, elevation: -1.4 },
      { id: 'cannae-heights', name: 'Cannae Heights', type: 'hill', x: -28, z: 12, radiusX: 11, radiusZ: 15, elevation: 1.5 },
      { id: 'apulian-grove', name: 'Apulian Grove', type: 'forest', x: -32, z: -52, radiusX: 9, radiusZ: 9, elevation: 0.4 },
    ],
  },

  phases: [
    {
      startFrame: 0,
      endFrame: 150,
      title: 'THE DEPLOYMENT',
      subtitle: "Varro's 86,000 Romans face Hannibal's 50,000 on the Apulian plain",
    },
    {
      startFrame: 150,
      endFrame: 420,
      title: 'THE CAVALRY STORM',
      subtitle: "Hasdrubal's Gallic and Spanish horse shatter the Roman right against the Aufidus",
    },
    {
      startFrame: 420,
      endFrame: 720,
      title: 'THE DOUBLE ENVELOPMENT',
      subtitle: 'The African horns close on the Roman flanks as the cavalry seals the rear',
    },
    {
      startFrame: 720,
      endFrame: 900,
      title: 'ANNIHILATION',
      subtitle: 'Trapped and compacted, the Roman army is destroyed where it stands',
    },
  ],

  // 3-act arc: wide establishing (y=135) → single climax zoom aimed at the
  // encirclement pocket (y≈95, lookAt z=-26) → pull-back to the wide overview.
  cameraKeyframes: buildThreeActCameraKeyframes(900, { x: 0, z: -26, frame: 660 }),

  units: [
    ...romanFront,
    ...romanRear,
    ...romanRightCavalry,
    ...romanLeftCavalry,
    ...hasdrubalCavalry,
    ...numidianCavalry,
    ...crescent,
    hannibal,
    varro,
  ],

  // "Plan → Pause → Execute": every arrow fires 40 frames before its troops move,
  // holds ≤ 55 frames (2.0s max), and fades before the blocks advance.
  arrows: [
    {
      id: 'arrow-roman-advance',
      faction: 'attacker',
      style: 'advance',
      startFrame: 120,
      durationFrames: 40,
      width: 2.6,
      points: [
        [0, 40],
        [0, 12],
        [0, -16],
      ],
    },
    {
      id: 'arrow-hasdrubal-charge',
      faction: 'defender',
      style: 'flank',
      startFrame: 160,
      durationFrames: 40,
      width: 2.6,
      points: [
        [32, -34],
        [32, 0],
        [32, 36],
      ],
    },
    {
      id: 'arrow-hasdrubal-rear',
      faction: 'defender',
      style: 'encirclement',
      startFrame: 310,
      durationFrames: 40,
      width: 2.6,
      points: [
        [32, 36],
        [16, 10],
        [0, -6],
      ],
    },
    {
      id: 'arrow-horn-right',
      faction: 'defender',
      style: 'encirclement',
      startFrame: 430,
      durationFrames: 40,
      width: 2.4,
      points: [
        [30, -40],
        [22, -34],
        [17, -28],
      ],
    },
    {
      id: 'arrow-horn-left',
      faction: 'defender',
      style: 'encirclement',
      startFrame: 430,
      durationFrames: 40,
      width: 2.4,
      points: [
        [-30, -40],
        [-22, -34],
        [-17, -28],
      ],
    },
    {
      id: 'arrow-final-seal',
      faction: 'defender',
      style: 'encirclement',
      startFrame: 725,
      durationFrames: 40,
      width: 2.4,
      points: [
        [0, 8],
        [0, -8],
      ],
    },
  ],

  outcome: {
    winner: 'Carthage',
    summary: "Hannibal's double envelopment annihilates the Roman army",
    casualties:
      'Polybius: ~70,000 Romans dead, 10,000 captured; Livy: ~48,200 dead, 19,300 captured. Carthaginian losses ~5,700.',
  },
};

export default battleData;
