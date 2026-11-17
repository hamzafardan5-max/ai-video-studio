/**
 * Battle of Cannae — 2 August 216 BC
 * Wikipedia-sourced tactical dataset (Polybius/Livy account).
 * Coordinates: X in [-50, 50] (flanks), Z in [-80, 80] (battle axis).
 * Carthaginians deploy north (negative Z), Romans south (positive Z).
 * The Aufidus River pins the Roman right flank on the east edge (positive X).
 */

export type UnitCategory =
  | 'infantry'
  | 'heavy-infantry'
  | 'cavalry'
  | 'archers'
  | 'artillery'
  | 'phalanx';

export interface TerrainFeature {
  id: string;
  name: string;
  type: 'hill' | 'ridge' | 'river' | 'forest' | 'marsh' | 'pass' | 'fortification';
  x: number;
  z: number;
  radiusX: number;
  radiusZ: number;
  elevation: number;
  rotationY?: number;
}

export interface UnitWaypoint {
  frame: number;
  x: number;
  z: number;
  strength?: number;
  inCombat?: boolean;
  isRouting?: boolean;
}

export interface TroopUnitData {
  id: string;
  label: string;
  faction: 'attacker' | 'defender';
  category: UnitCategory;
  width: number;
  depth: number;
  waypoints: UnitWaypoint[];
}

export interface TacticalArrowData {
  id: string;
  faction: 'attacker' | 'defender';
  style: 'advance' | 'flank' | 'feigned-retreat' | 'encirclement';
  startFrame: number;
  endFrame: number;
  fadeOutFrame?: number;
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
  seed: string;
  factions: {
    attacker: { name: string; commander: string; strength: string; color: string };
    defender: { name: string; commander: string; strength: string; color: string };
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

export const DURATION_IN_FRAMES = 900;

export const BATTLE: HistoricalBattleData = {
  id: 'battle-of-cannae',
  title: 'Battle of Cannae',
  date: '2 August 216 BC',
  location: 'Cannae, Apulia · Second Punic War',
  seed: 'cannae-216bc',

  factions: {
    attacker: {
      name: 'Carthage',
      commander: 'Hannibal Barca',
      strength: '~50,000',
      color: '#2e6fb8',
    },
    defender: {
      name: 'Roman Republic',
      commander: 'Paullus & Varro',
      strength: '~86,000',
      color: '#c23b2e',
    },
  },

  terrain: {
    baseColor: '#a3946a',
    highlandColor: '#877a52',
    waterColor: '#46708c',
    gridOpacity: 0.1,
    features: [
      {
        id: 'aufidus',
        name: 'Aufidus River',
        type: 'river',
        x: 46,
        z: 0,
        radiusX: 7,
        radiusZ: 85,
        elevation: -1.7,
      },
      {
        id: 'hill-cannae',
        name: 'Hill of Cannae',
        type: 'hill',
        x: 16,
        z: -72,
        radiusX: 17,
        radiusZ: 15,
        elevation: 2.4,
      },
      {
        id: 'west-ridge',
        name: 'Apulian Ridge',
        type: 'ridge',
        x: -44,
        z: -20,
        radiusX: 11,
        radiusZ: 45,
        elevation: 1.1,
      },
    ],
  },

  phases: [
    {
      startFrame: 0,
      endFrame: 210,
      title: 'Deployment',
      subtitle: "Hannibal's crescent faces Rome's deep columns",
    },
    {
      startFrame: 210,
      endFrame: 430,
      title: 'The Advance',
      subtitle: 'Roman infantry drives into the yielding center',
    },
    {
      startFrame: 430,
      endFrame: 700,
      title: 'The Trap Closes',
      subtitle: 'Cavalry sweeps the rear — Africans turn inward',
    },
    {
      startFrame: 700,
      endFrame: DURATION_IN_FRAMES,
      title: 'Annihilation',
      subtitle: 'The pocket seals — Rome\u2019s army is destroyed',
    },
  ],

  cameraKeyframes: [
    { frame: 0, position: [0, 112, 86], lookAt: [0, 0, 8] },
    { frame: 210, position: [0, 102, 50], lookAt: [0, 0, 0] },
    { frame: 430, position: [24, 92, 30], lookAt: [0, 0, 4] },
    { frame: 560, position: [-24, 90, 32], lookAt: [-4, 0, 10] },
    { frame: 700, position: [0, 120, 40], lookAt: [0, 0, -8] },
    { frame: DURATION_IN_FRAMES, position: [0, 106, 54], lookAt: [0, 0, -8] },
  ],

  units: [
    // ── Carthaginian infantry: the crescent ─────────────────────────────
    {
      id: 'carth-crescent-west',
      label: 'Gallic & Iberian Foot (W)',
      faction: 'attacker',
      category: 'infantry',
      width: 16,
      depth: 7,
      waypoints: [
        { frame: 0, x: -14, z: -30 },
        { frame: 240, x: -13, z: -38, inCombat: true },
        { frame: 420, x: -12, z: -46, inCombat: true },
        { frame: 480, x: -12, z: -47, inCombat: true },
        { frame: 640, x: -8, z: -43, inCombat: true },
        { frame: DURATION_IN_FRAMES, x: -6, z: -40, inCombat: true },
      ],
    },
    {
      id: 'carth-crescent-mid',
      label: 'Gallic & Iberian Foot (Center)',
      faction: 'attacker',
      category: 'infantry',
      width: 18,
      depth: 7,
      waypoints: [
        { frame: 0, x: 0, z: -26 },
        { frame: 240, x: 0, z: -38, inCombat: true },
        { frame: 420, x: 0, z: -48, inCombat: true },
        { frame: 560, x: 0, z: -47, inCombat: true },
        { frame: 640, x: 0, z: -44, inCombat: true },
        { frame: DURATION_IN_FRAMES, x: 0, z: -42, inCombat: true },
      ],
    },
    {
      id: 'carth-crescent-east',
      label: 'Gallic & Iberian Foot (E)',
      faction: 'attacker',
      category: 'infantry',
      width: 16,
      depth: 7,
      waypoints: [
        { frame: 0, x: 14, z: -30 },
        { frame: 240, x: 13, z: -38, inCombat: true },
        { frame: 420, x: 12, z: -46, inCombat: true },
        { frame: 480, x: 12, z: -47, inCombat: true },
        { frame: 640, x: 8, z: -43, inCombat: true },
        { frame: DURATION_IN_FRAMES, x: 6, z: -40, inCombat: true },
      ],
    },

    // ── Carthaginian veterans: African infantry in echelon ──────────────
    {
      id: 'carth-african-west',
      label: 'African Veterans (W)',
      faction: 'attacker',
      category: 'heavy-infantry',
      width: 12,
      depth: 10,
      waypoints: [
        { frame: 0, x: -30, z: -46 },
        { frame: 300, x: -30, z: -44 },
        { frame: 430, x: -28, z: -16 },
        { frame: 530, x: -26, z: 2, inCombat: true },
        { frame: 620, x: -16, z: -2, inCombat: true },
        { frame: 700, x: -13, z: -6, inCombat: true },
        { frame: DURATION_IN_FRAMES, x: -12, z: -8, inCombat: true },
      ],
    },
    {
      id: 'carth-african-east',
      label: 'African Veterans (E)',
      faction: 'attacker',
      category: 'heavy-infantry',
      width: 12,
      depth: 10,
      waypoints: [
        { frame: 0, x: 30, z: -46 },
        { frame: 300, x: 30, z: -44 },
        { frame: 430, x: 28, z: -16 },
        { frame: 530, x: 26, z: 2, inCombat: true },
        { frame: 620, x: 16, z: -2, inCombat: true },
        { frame: 700, x: 13, z: -6, inCombat: true },
        { frame: DURATION_IN_FRAMES, x: 12, z: -8, inCombat: true },
      ],
    },

    // ── Carthaginian cavalry ─────────────────────────────────────────────
    {
      id: 'carth-cav-heavy',
      label: "Hasdrubal's Heavy Cavalry",
      faction: 'attacker',
      category: 'cavalry',
      width: 10,
      depth: 6,
      waypoints: [
        { frame: 0, x: 34, z: -56 },
        { frame: 130, x: 36, z: -24 },
        { frame: 230, x: 38, z: 26, inCombat: true },
        { frame: 300, x: 36, z: 58 },
        { frame: 430, x: 0, z: 64 },
        { frame: 530, x: -24, z: 58 },
        { frame: 620, x: -27, z: 26 },
        { frame: 700, x: -16, z: 6, inCombat: true },
        { frame: 800, x: -14, z: -4, inCombat: true },
        { frame: DURATION_IN_FRAMES, x: -13, z: -8, inCombat: true },
      ],
    },
    {
      id: 'carth-cav-numidian',
      label: 'Numidian Light Cavalry',
      faction: 'attacker',
      category: 'cavalry',
      width: 9,
      depth: 5,
      waypoints: [
        { frame: 0, x: -36, z: -56 },
        { frame: 140, x: -38, z: -10 },
        { frame: 240, x: -40, z: 30, inCombat: true },
        { frame: 300, x: -40, z: 55 },
        { frame: 380, x: -38, z: 82 },
        { frame: 460, x: -30, z: 98 },
      ],
    },

    // ── Roman infantry: extraordinary depth ─────────────────────────────
    {
      id: 'roman-hastati',
      label: 'Hastati (First Line)',
      faction: 'defender',
      category: 'infantry',
      width: 40,
      depth: 8,
      waypoints: [
        { frame: 0, x: 0, z: 14 },
        { frame: 200, x: 0, z: -8 },
        { frame: 280, x: 0, z: -20, inCombat: true },
        { frame: 430, x: 0, z: -36, inCombat: true },
        { frame: 520, x: 0, z: -37, inCombat: true, strength: 0.85 },
        { frame: 620, x: 0, z: -36, inCombat: true, strength: 0.7 },
        { frame: 700, x: 0, z: -35, inCombat: true, strength: 0.5 },
        { frame: DURATION_IN_FRAMES, x: 0, z: -34, inCombat: true, strength: 0.22 },
      ],
    },
    {
      id: 'roman-principes',
      label: 'Principes (Second Line)',
      faction: 'defender',
      category: 'infantry',
      width: 40,
      depth: 8,
      waypoints: [
        { frame: 0, x: 0, z: 30 },
        { frame: 200, x: 0, z: 10 },
        { frame: 340, x: 0, z: -8 },
        { frame: 430, x: 0, z: -20, inCombat: true, strength: 0.9 },
        { frame: 560, x: 0, z: -21, inCombat: true, strength: 0.7 },
        { frame: 660, x: 0, z: -20, inCombat: true, strength: 0.5 },
        { frame: DURATION_IN_FRAMES, x: 0, z: -18, inCombat: true, strength: 0.3 },
      ],
    },
    {
      id: 'roman-triarii',
      label: 'Triarii (Reserve)',
      faction: 'defender',
      category: 'heavy-infantry',
      width: 36,
      depth: 8,
      waypoints: [
        { frame: 0, x: 0, z: 46 },
        { frame: 200, x: 0, z: 28 },
        { frame: 340, x: 0, z: 12 },
        { frame: 430, x: 0, z: 2, strength: 0.9 },
        { frame: 560, x: 0, z: -2, inCombat: true, strength: 0.7 },
        { frame: 660, x: 0, z: -3, inCombat: true, strength: 0.5 },
        { frame: DURATION_IN_FRAMES, x: 0, z: -4, inCombat: true, strength: 0.28 },
      ],
    },

    // ── Roman cavalry wings ──────────────────────────────────────────────
    {
      id: 'roman-cav-right',
      label: "Paullus' Citizen Cavalry",
      faction: 'defender',
      category: 'cavalry',
      width: 9,
      depth: 6,
      waypoints: [
        { frame: 0, x: 40, z: 58 },
        { frame: 120, x: 39, z: 62, inCombat: true },
        { frame: 240, x: 36, z: 72, inCombat: true, isRouting: true, strength: 0.5 },
        { frame: 320, x: 28, z: 86, isRouting: true, strength: 0.2 },
        { frame: 400, x: 24, z: 100, isRouting: true, strength: 0.1 },
      ],
    },
    {
      id: 'roman-cav-left',
      label: "Varro's Allied Cavalry",
      faction: 'defender',
      category: 'cavalry',
      width: 9,
      depth: 6,
      waypoints: [
        { frame: 0, x: -40, z: 58 },
        { frame: 140, x: -39, z: 62, inCombat: true },
        { frame: 280, x: -37, z: 72, inCombat: true, isRouting: true, strength: 0.4 },
        { frame: 360, x: -33, z: 88, isRouting: true, strength: 0.15 },
        { frame: 430, x: -30, z: 102, isRouting: true, strength: 0.1 },
      ],
    },
  ],

  arrows: [
    {
      id: 'roman-advance',
      faction: 'defender',
      style: 'advance',
      startFrame: 200,
      endFrame: 430,
      fadeOutFrame: 470,
      points: [
        [0, 40],
        [0, 0],
        [0, -34],
      ],
    },
    {
      id: 'crescent-buckle',
      faction: 'attacker',
      style: 'feigned-retreat',
      startFrame: 230,
      endFrame: 460,
      fadeOutFrame: 500,
      points: [
        [-4, -28],
        [0, -42],
        [4, -54],
      ],
    },
    {
      id: 'cav-sweep',
      faction: 'attacker',
      style: 'flank',
      startFrame: 300,
      endFrame: 520,
      fadeOutFrame: 560,
      points: [
        [38, 52],
        [0, 64],
        [-30, 56],
      ],
    },
    {
      id: 'african-pincer-west',
      faction: 'attacker',
      style: 'encirclement',
      startFrame: 470,
      endFrame: 660,
      fadeOutFrame: 700,
      points: [
        [-28, -42],
        [-27, -4],
        [-13, -8],
      ],
    },
    {
      id: 'african-pincer-east',
      faction: 'attacker',
      style: 'encirclement',
      startFrame: 470,
      endFrame: 660,
      fadeOutFrame: 700,
      points: [
        [28, -42],
        [27, -4],
        [13, -8],
      ],
    },
    {
      id: 'numidian-pursuit',
      faction: 'attacker',
      style: 'flank',
      startFrame: 270,
      endFrame: 420,
      fadeOutFrame: 450,
      points: [
        [-38, -40],
        [-40, 30],
        [-39, 78],
      ],
    },
  ],

  outcome: {
    winner: 'Carthaginian Victory',
    summary:
      "Hannibal's double envelopment annihilated a larger Roman army — regarded as one of the greatest tactical feats in military history.",
    casualties:
      'Rome: ~55,000\u201370,000 killed, ~10,000 captured \u00b7 Carthage: ~8,000 casualties',
  },
};
