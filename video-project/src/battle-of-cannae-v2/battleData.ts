import {interpolate} from 'remotion';

/**
 * Battle of Cannae — 2 August 216 BC, Apulia, Italy.
 *
 * Sources (Wikipedia / Polybius / Livy):
 *  - Rome: 86,400 men (8 legions + allies, incl. 10,000 camp garrison),
 *    commanded by consuls C. Terentius Varro and L. Aemilius Paullus.
 *  - Carthage: ~50,000 men (32,000 infantry, 10,000 cavalry, 8,000 light),
 *    commanded by Hannibal Barca; Hasdrubal leads the horse on the river flank.
 *  - Result: double envelopment, up to 70,000 Roman casualties.
 *
 * Map convention: Rome (attacker) deploys south (+Z), Carthage (defender)
 * north (-Z). The Aufidus river runs along the eastern (+X) edge.
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
  /** Safe portrait bounds: X in [-48, 48], Z in [-78, 78] */
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
  /** Optional explicit yaw angle in radians; if omitted, auto-aligns to movement or enemy */
  rotationY?: number;
  /**
   * 'enemy' locks the front edge onto the nearest opposing unit for this leg.
   * Mandatory for retreat / giving-ground legs so a block never turns its back
   * (and its combat sparks) on the enemy. Defaults to 'movement'.
   */
  facing?: 'enemy' | 'movement';
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
  isCommander?: boolean;
  commanderName?: string;
  waypoints: UnitWaypoint[];
}

export interface TacticalArrowData {
  id: string;
  faction: 'attacker' | 'defender';
  style: 'advance' | 'flank' | 'feigned-retreat' | 'encirclement';
  width?: number;
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
    attacker: {name: string; commander: string; strength: string; color: string};
    defender: {name: string; commander: string; strength: string; color: string};
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

const ROME = '#c8433a';
const CARTHAGE = '#7d6ae0';

export const BATTLE: HistoricalBattleData = {
  id: 'battle-of-cannae-v2',
  title: 'Battle of Cannae',
  date: '2 August 216 BC',
  location: 'Cannae, Apulia, Italy',
  seed: 'cannae-216-bc',

  factions: {
    attacker: {
      name: 'Roman Republic',
      commander: 'Varro & Paullus',
      strength: '86,400 men · 8 legions',
      color: ROME,
    },
    defender: {
      name: 'Carthage',
      commander: 'Hannibal Barca',
      strength: '50,000 men · 10,000 horse',
      color: CARTHAGE,
    },
  },

  terrain: {
    baseColor: '#4d5c3c',
    highlandColor: '#a58a5b',
    waterColor: '#2a5c6b',
    gridOpacity: 0.12,
    features: [
      {
        id: 'aufidus',
        name: 'Aufidus River',
        type: 'river',
        x: 38,
        z: 0,
        radiusX: 5.5,
        radiusZ: 95,
        elevation: -2.8,
      },
      {
        id: 'cannae-hill',
        name: 'Hill of Cannae',
        type: 'hill',
        x: -30,
        z: 40,
        radiusX: 15,
        radiusZ: 12,
        elevation: 2.4,
      },
      {
        id: 'apulian-ridge',
        name: 'Apulian Ridge',
        type: 'ridge',
        x: 10,
        z: -56,
        radiusX: 30,
        radiusZ: 12,
        elevation: 1.5,
      },
      {
        id: 'centre-rise',
        name: 'Gentle Rise',
        type: 'hill',
        x: 0,
        z: 4,
        radiusX: 22,
        radiusZ: 10,
        elevation: 0.45,
      },
      {
        id: 'olive-grove',
        name: 'Olive Grove',
        type: 'forest',
        x: -39,
        z: -28,
        radiusX: 8.5,
        radiusZ: 12,
        elevation: 0.35,
      },
      {
        id: 'scrub-wood',
        name: 'Scrub Wood',
        type: 'forest',
        x: 30,
        z: -50,
        radiusX: 8,
        radiusZ: 10,
        elevation: 0.5,
      },
      {
        id: 'river-marsh',
        name: 'River Marsh',
        type: 'marsh',
        x: 41,
        z: 44,
        radiusX: 7,
        radiusZ: 11,
        elevation: -0.55,
      },
      {
        id: 'camp-north',
        name: 'Roman Camp (north)',
        type: 'fortification',
        x: 25,
        z: 45,
        radiusX: 4,
        radiusZ: 4,
        elevation: 0.25,
      },
      {
        id: 'camp-south',
        name: 'Roman Camp (south)',
        type: 'fortification',
        x: 32,
        z: 50,
        radiusX: 4,
        radiusZ: 4,
        elevation: 0.2,
      },
    ],
  },

  phases: [
    {
      startFrame: 0,
      endFrame: 120,
      title: 'THE TRAP IS SET',
      subtitle: 'Hannibal offers battle on ground of his choosing',
    },
    {
      startFrame: 120,
      endFrame: 330,
      title: 'ROME STRIKES FIRST',
      subtitle: '80,000 legionaries drive at the Punic center',
    },
    {
      startFrame: 330,
      endFrame: 540,
      title: 'THE CENTER FALLS BACK',
      subtitle: 'Gauls and Iberians bend backward — deliberately',
    },
    {
      startFrame: 540,
      endFrame: 690,
      title: 'AFRICAN VETERANS WHEEL',
      subtitle: 'Libyan spearmen close on both Roman flanks',
    },
    {
      startFrame: 690,
      endFrame: 820,
      title: 'THE RING CLOSES',
      subtitle: "Hasdrubal's horse strikes the Roman rear",
    },
    {
      startFrame: 820,
      endFrame: 900,
      title: 'ANNIHILATION',
      subtitle: 'Up to 70,000 Romans fall in one afternoon',
    },
  ],

  cameraKeyframes: [
    {frame: 0, position: [0, 135, 65], lookAt: [0, 0, -2]},
    {frame: 150, position: [2, 134, 63], lookAt: [0, 0, -2]},
    {frame: 330, position: [0, 130, 60], lookAt: [0, 0, -4]},
    {frame: 470, position: [0, 127, 57], lookAt: [0, 0, -5]},
    {frame: 620, position: [-3, 114, 54], lookAt: [0, 0, -6]},
    {frame: 710, position: [-2, 113, 52], lookAt: [0, 0, -6]},
    {frame: 800, position: [0, 122, 54], lookAt: [0, 0, -4]},
    {frame: 860, position: [0, 134, 64], lookAt: [0, 0, -2]},
    {frame: 899, position: [0, 135, 65], lookAt: [0, 0, -2]},
  ],

  /**
   * Deployment audit (frame 0):
   *  - Carthage center: x = -14 / -4.7 / +4.7 / +14 (6.5 wide → 2.9 gaps)
   *  - Roman ranks: z = 20 / 25.5 / 31 / 36.5 (5.5 apart → 2.7 gaps)
   *  - Cavalry clear of all infantry footprints; river bank at x ≈ 27.
   */
  units: [
    // ---------------------------------------------------------------- Rome
    {
      id: 'rome-legion-1',
      label: 'Legio I · Hastati',
      faction: 'attacker',
      category: 'heavy-infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: -14, z: 20, rotationY: Math.PI, strength: 1},
        {frame: 120, x: -14, z: 20, strength: 1},
        {frame: 300, x: -14, z: -8, strength: 0.98},
        {frame: 460, x: -14, z: -18, strength: 0.9, inCombat: true},
        {frame: 600, x: -14, z: -24, strength: 0.62, inCombat: true},
        {frame: 700, x: -14, z: -26, strength: 0.4, inCombat: true},
        {frame: 900, x: -14, z: -26, strength: 0.12, inCombat: true},
      ],
    },
    {
      id: 'rome-legion-2',
      label: 'Legio II · Hastati',
      faction: 'attacker',
      category: 'heavy-infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: -4.7, z: 20, rotationY: Math.PI, strength: 1},
        {frame: 120, x: -4.7, z: 20, strength: 1},
        {frame: 300, x: -4.7, z: -8, strength: 0.98},
        {frame: 460, x: -4.7, z: -18, strength: 0.88, inCombat: true},
        {frame: 600, x: -4.7, z: -24, strength: 0.58, inCombat: true},
        {frame: 700, x: -4.7, z: -26, strength: 0.36, inCombat: true},
        {frame: 900, x: -4.7, z: -26, strength: 0.11, inCombat: true},
      ],
    },
    {
      id: 'rome-legion-3',
      label: 'Legio III · Principes',
      faction: 'attacker',
      category: 'heavy-infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: 4.7, z: 20, rotationY: Math.PI, strength: 1},
        {frame: 120, x: 4.7, z: 20, strength: 1},
        {frame: 300, x: 4.7, z: -8, strength: 0.98},
        {frame: 460, x: 4.7, z: -18, strength: 0.88, inCombat: true},
        {frame: 600, x: 4.7, z: -24, strength: 0.58, inCombat: true},
        {frame: 700, x: 4.7, z: -26, strength: 0.36, inCombat: true},
        {frame: 900, x: 4.7, z: -26, strength: 0.11, inCombat: true},
      ],
    },
    {
      id: 'rome-legion-4',
      label: 'Legio IV · Principes',
      faction: 'attacker',
      category: 'heavy-infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: 14, z: 20, rotationY: Math.PI, strength: 1},
        {frame: 120, x: 14, z: 20, strength: 1},
        {frame: 300, x: 14, z: -8, strength: 0.98},
        {frame: 460, x: 14, z: -18, strength: 0.9, inCombat: true},
        {frame: 600, x: 14, z: -24, strength: 0.64, inCombat: true},
        {frame: 700, x: 14, z: -26, strength: 0.42, inCombat: true},
        {frame: 900, x: 14, z: -26, strength: 0.13, inCombat: true},
      ],
    },
    {
      id: 'rome-allies-1',
      label: 'Allied Infantry · Latium',
      faction: 'attacker',
      category: 'infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: -9.5, z: 25.5, rotationY: Math.PI, strength: 1},
        {frame: 120, x: -9.5, z: 25.5, strength: 1},
        {frame: 300, x: -9.5, z: -2.5, strength: 0.99},
        {frame: 460, x: -9.5, z: -12.5, strength: 0.93, inCombat: true},
        {frame: 600, x: -9.5, z: -18.5, strength: 0.7, inCombat: true},
        {frame: 700, x: -9.5, z: -20.5, strength: 0.45, inCombat: true},
        {frame: 900, x: -9.5, z: -20.5, strength: 0.14, inCombat: true},
      ],
    },
    {
      id: 'rome-allies-2',
      label: 'Allied Infantry · Campania',
      faction: 'attacker',
      category: 'infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: 0, z: 25.5, rotationY: Math.PI, strength: 1},
        {frame: 120, x: 0, z: 25.5, strength: 1},
        {frame: 300, x: 0, z: -2.5, strength: 0.99},
        {frame: 460, x: 0, z: -12.5, strength: 0.93, inCombat: true},
        {frame: 600, x: 0, z: -18.5, strength: 0.7, inCombat: true},
        {frame: 700, x: 0, z: -20.5, strength: 0.45, inCombat: true},
        {frame: 900, x: 0, z: -20.5, strength: 0.14, inCombat: true},
      ],
    },
    {
      id: 'rome-allies-3',
      label: 'Allied Infantry · Samnium',
      faction: 'attacker',
      category: 'infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: 9.5, z: 25.5, rotationY: Math.PI, strength: 1},
        {frame: 120, x: 9.5, z: 25.5, strength: 1},
        {frame: 300, x: 9.5, z: -2.5, strength: 0.99},
        {frame: 460, x: 9.5, z: -12.5, strength: 0.93, inCombat: true},
        {frame: 600, x: 9.5, z: -18.5, strength: 0.7, inCombat: true},
        {frame: 700, x: 9.5, z: -20.5, strength: 0.45, inCombat: true},
        {frame: 900, x: 9.5, z: -20.5, strength: 0.14, inCombat: true},
      ],
    },
    {
      id: 'rome-triarii-1',
      label: 'Triarii (Reserve)',
      faction: 'attacker',
      category: 'heavy-infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: -5, z: 31, rotationY: Math.PI, strength: 1},
        {frame: 120, x: -5, z: 31, strength: 1},
        {frame: 300, x: -5, z: 3, strength: 0.99},
        {frame: 460, x: -5, z: -7, strength: 0.96},
        {frame: 600, x: -5, z: -13, strength: 0.8},
        {frame: 700, x: -5, z: -15, strength: 0.5, inCombat: true},
        {frame: 900, x: -5, z: -15, strength: 0.16, inCombat: true},
      ],
    },
    {
      id: 'rome-triarii-2',
      label: 'Triarii (Reserve)',
      faction: 'attacker',
      category: 'heavy-infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: 5, z: 31, rotationY: Math.PI, strength: 1},
        {frame: 120, x: 5, z: 31, strength: 1},
        {frame: 300, x: 5, z: 3, strength: 0.99},
        {frame: 460, x: 5, z: -7, strength: 0.96},
        {frame: 600, x: 5, z: -13, strength: 0.8},
        {frame: 700, x: 5, z: -15, strength: 0.5, inCombat: true},
        {frame: 900, x: 5, z: -15, strength: 0.16, inCombat: true},
      ],
    },
    {
      id: 'rome-reserve',
      label: 'Reserve Maniple',
      faction: 'attacker',
      category: 'heavy-infantry',
      width: 6,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: 0, z: 36.5, rotationY: Math.PI, strength: 1},
        {frame: 120, x: 0, z: 36.5, strength: 1},
        {frame: 300, x: 0, z: 8.5, strength: 1},
        {frame: 460, x: 0, z: -1.5, strength: 0.97},
        {frame: 600, x: 0, z: -7.5, strength: 0.85},
        {frame: 700, x: 0, z: -9.5, strength: 0.55, inCombat: true},
        {frame: 900, x: 0, z: -9.5, strength: 0.18, inCombat: true},
      ],
    },
    {
      id: 'rome-cav-right',
      label: 'Roman Horse (Right)',
      faction: 'attacker',
      category: 'cavalry',
      width: 5,
      depth: 2.5,
      isCommander: true,
      commanderName: 'PAULLUS',
      waypoints: [
        {frame: 0, x: 28, z: 18, rotationY: Math.PI, strength: 1},
        {frame: 200, x: 28, z: 18, rotationY: Math.PI, strength: 0.95},
        {frame: 300, x: 33, z: 22, strength: 0.6, inCombat: true},
        {frame: 380, x: 36, z: 27, strength: 0.25, isRouting: true},
        {frame: 500, x: 38, z: 32, strength: 0.08, isRouting: true},
        {frame: 900, x: 38, z: 32, strength: 0.06, isRouting: true},
      ],
    },
    {
      id: 'rome-cav-left',
      label: 'Allied Horse (Left)',
      faction: 'attacker',
      category: 'cavalry',
      width: 5,
      depth: 2.5,
      isCommander: true,
      commanderName: 'VARRO',
      waypoints: [
        {frame: 0, x: -25, z: 18, rotationY: Math.PI, strength: 1},
        {frame: 260, x: -24, z: 17, strength: 0.9},
        {frame: 480, x: -23, z: 14, strength: 0.6, inCombat: true},
        {frame: 700, x: -23, z: 11, strength: 0.3, inCombat: true},
        {frame: 900, x: -23, z: 10, strength: 0.15, inCombat: true},
      ],
    },
    {
      id: 'rome-velites',
      label: 'Velites (Screen)',
      faction: 'attacker',
      category: 'archers',
      width: 5.5,
      depth: 1.8,
      waypoints: [
        // Screen the eastern interval between Legio IV and the horse, then
        // slip south along that corridor once the legions pass.
        {frame: 0, x: 21, z: 10, rotationY: Math.PI, strength: 1},
        {frame: 120, x: 21.5, z: 18, strength: 0.95},
        {frame: 240, x: 21.5, z: 28, strength: 0.85},
        {frame: 900, x: 21.5, z: 30, strength: 0.5},
      ],
    },

    // ------------------------------------------------------------ Carthage
    {
      id: 'car-gauls-left',
      label: 'Boii & Insubres Gauls',
      faction: 'defender',
      category: 'infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: -14, z: -22, rotationY: 0, strength: 1},
        {frame: 200, x: -14, z: -21, strength: 1},
        {frame: 380, x: -14, z: -23, facing: 'enemy', strength: 0.96},
        {frame: 460, x: -14, z: -25, facing: 'enemy', strength: 0.88, inCombat: true},
        {frame: 540, x: -14, z: -29, facing: 'enemy', strength: 0.8, inCombat: true},
        {frame: 640, x: -14, z: -31, facing: 'enemy', strength: 0.72, inCombat: true},
        {frame: 740, x: -14, z: -33, facing: 'enemy', strength: 0.68, inCombat: true},
        {frame: 900, x: -14, z: -33, facing: 'enemy', strength: 0.64, inCombat: true},
      ],
    },
    {
      id: 'car-iberians-left',
      label: 'Iberian Scutarii',
      faction: 'defender',
      category: 'heavy-infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: -4.7, z: -21, rotationY: 0, strength: 1},
        {frame: 200, x: -4.7, z: -19, strength: 1},
        {frame: 380, x: -4.7, z: -21, facing: 'enemy', strength: 0.97},
        {frame: 460, x: -4.7, z: -24, facing: 'enemy', strength: 0.9, inCombat: true},
        {frame: 540, x: -4.7, z: -28, facing: 'enemy', strength: 0.83, inCombat: true},
        {frame: 640, x: -4.7, z: -31, facing: 'enemy', strength: 0.76, inCombat: true},
        {frame: 740, x: -4.7, z: -34, facing: 'enemy', strength: 0.72, inCombat: true},
        {frame: 900, x: -4.7, z: -34, facing: 'enemy', strength: 0.68, inCombat: true},
      ],
    },
    {
      id: 'car-iberians-right',
      label: 'Celtiberian Scutarii',
      faction: 'defender',
      category: 'heavy-infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: 4.7, z: -21, rotationY: 0, strength: 1},
        {frame: 200, x: 4.7, z: -19, strength: 1},
        {frame: 380, x: 4.7, z: -21, facing: 'enemy', strength: 0.97},
        {frame: 460, x: 4.7, z: -24, facing: 'enemy', strength: 0.9, inCombat: true},
        {frame: 540, x: 4.7, z: -28, facing: 'enemy', strength: 0.83, inCombat: true},
        {frame: 640, x: 4.7, z: -31, facing: 'enemy', strength: 0.76, inCombat: true},
        {frame: 740, x: 4.7, z: -34, facing: 'enemy', strength: 0.72, inCombat: true},
        {frame: 900, x: 4.7, z: -34, facing: 'enemy', strength: 0.68, inCombat: true},
      ],
    },
    {
      id: 'car-gauls-right',
      label: 'Gallic Warband',
      faction: 'defender',
      category: 'infantry',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: 14, z: -22, rotationY: 0, strength: 1},
        {frame: 200, x: 14, z: -21, strength: 1},
        {frame: 380, x: 14, z: -23, facing: 'enemy', strength: 0.96},
        {frame: 460, x: 14, z: -25, facing: 'enemy', strength: 0.88, inCombat: true},
        {frame: 540, x: 14, z: -29, facing: 'enemy', strength: 0.8, inCombat: true},
        {frame: 640, x: 14, z: -31, facing: 'enemy', strength: 0.72, inCombat: true},
        {frame: 740, x: 14, z: -33, facing: 'enemy', strength: 0.68, inCombat: true},
        {frame: 900, x: 14, z: -33, facing: 'enemy', strength: 0.64, inCombat: true},
      ],
    },
    {
      id: 'car-libyans-left',
      label: 'Libyan Spearmen',
      faction: 'defender',
      category: 'phalanx',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: -22, z: -22, rotationY: 0, strength: 1},
        {frame: 380, x: -22, z: -20, strength: 1},
        {frame: 520, x: -22, z: -17, strength: 0.98},
        {frame: 640, x: -21, z: -15, strength: 0.96, inCombat: true},
        {frame: 760, x: -21, z: -15, strength: 0.93, inCombat: true, facing: 'enemy'},
        {frame: 900, x: -21, z: -15, strength: 0.9, inCombat: true, facing: 'enemy'},
      ],
    },
    {
      id: 'car-libyans-right',
      label: 'Libyan Spearmen',
      faction: 'defender',
      category: 'phalanx',
      width: 6.5,
      depth: 2.8,
      waypoints: [
        {frame: 0, x: 22, z: -22, rotationY: 0, strength: 1},
        {frame: 380, x: 22, z: -20, strength: 1},
        {frame: 520, x: 22, z: -17, strength: 0.98},
        {frame: 640, x: 21, z: -15, strength: 0.96, inCombat: true},
        {frame: 760, x: 21, z: -15, strength: 0.93, inCombat: true, facing: 'enemy'},
        {frame: 900, x: 21, z: -15, strength: 0.9, inCombat: true, facing: 'enemy'},
      ],
    },
    {
      id: 'car-hasdrubal',
      label: 'Gallic & Iberian Horse',
      faction: 'defender',
      category: 'cavalry',
      width: 8,
      depth: 2.6,
      isCommander: true,
      commanderName: 'HASDRUBAL',
      waypoints: [
        {frame: 0, x: 30, z: -26, rotationY: 0, strength: 1},
        {frame: 140, x: 30, z: -16, strength: 1},
        {frame: 260, x: 30, z: 2, strength: 0.98},
        {frame: 300, x: 29, z: 14, strength: 0.96, inCombat: true},
        {frame: 320, x: 28, z: 17, strength: 0.96, inCombat: true},
        {frame: 420, x: 31, z: 14, strength: 0.95, inCombat: true},
        {frame: 520, x: 30, z: 6, strength: 0.95},
        {frame: 620, x: 24, z: 0, strength: 0.95},
        {frame: 700, x: 12, z: -2, strength: 0.95, inCombat: true, facing: 'enemy'},
        {frame: 780, x: 2, z: -3, strength: 0.95, inCombat: true, facing: 'enemy'},
        {frame: 900, x: 0, z: -3, strength: 0.95, inCombat: true, facing: 'enemy'},
      ],
    },
    {
      id: 'car-numidians',
      label: 'Numidian Light Horse',
      faction: 'defender',
      category: 'cavalry',
      width: 5,
      depth: 2.5,
      waypoints: [
        {frame: 0, x: -26, z: -34, rotationY: 0, strength: 1},
        {frame: 120, x: -30, z: -12, strength: 1},
        {frame: 260, x: -29, z: 8, strength: 0.98},
        {frame: 420, x: -29, z: 20, strength: 0.96, inCombat: true},
        {frame: 600, x: -27, z: 18, strength: 0.96, inCombat: true},
        {frame: 720, x: -27, z: 17, strength: 0.95, inCombat: true},
        {frame: 900, x: -27, z: 17, strength: 0.94, inCombat: true},
      ],
    },
    {
      id: 'car-slingers',
      label: 'Balearic Slingers',
      faction: 'defender',
      category: 'archers',
      width: 5.5,
      depth: 1.8,
      waypoints: [
        // Polybius places the Balearic slingers behind the Punic infantry.
        {frame: 0, x: 0, z: -27, rotationY: 0, strength: 1},
        {frame: 300, x: 0, z: -34, strength: 0.95},
        {frame: 400, x: 0, z: -40, strength: 0.9},
        {frame: 900, x: 0, z: -40, strength: 0.85},
      ],
    },
    {
      id: 'car-hq',
      label: "Hannibal's Guard",
      faction: 'defender',
      category: 'cavalry',
      width: 4,
      depth: 2.5,
      isCommander: true,
      commanderName: 'HANNIBAL',
      waypoints: [
        {frame: 0, x: 0, z: -46, rotationY: 0, strength: 1},
        {frame: 900, x: 0, z: -46, rotationY: 0, strength: 1},
      ],
    },
  ],

  arrows: [
    {
      id: 'rome-advance',
      faction: 'attacker',
      style: 'advance',
      width: 2.6,
      startFrame: 110,
      endFrame: 430,
      fadeOutFrame: 520,
      points: [
        [-1, 20],
        [0, 4],
        [0, -14],
      ],
    },
    {
      id: 'carthage-bend',
      faction: 'defender',
      style: 'feigned-retreat',
      width: 2.2,
      startFrame: 360,
      endFrame: 620,
      fadeOutFrame: 700,
      points: [
        [6, -20],
        [4, -26],
        [2, -32],
      ],
    },
    {
      id: 'libyan-left',
      faction: 'defender',
      style: 'flank',
      width: 2,
      startFrame: 400,
      endFrame: 700,
      fadeOutFrame: 780,
      points: [
        [-27, -24],
        [-26, -17],
        [-23, -13],
        [-18, -12],
      ],
    },
    {
      id: 'libyan-right',
      faction: 'defender',
      style: 'flank',
      width: 2,
      startFrame: 400,
      endFrame: 700,
      fadeOutFrame: 780,
      points: [
        [27, -24],
        [26, -17],
        [23, -13],
        [18, -12],
      ],
    },
    {
      id: 'hasdrubal-sweep',
      faction: 'defender',
      style: 'encirclement',
      width: 2.5,
      startFrame: 180,
      endFrame: 760,
      fadeOutFrame: 840,
      points: [
        [26, -18],
        [30, -4],
        [31, 9],
        [27, 15],
        [18, 11],
        [8, 1],
        [1, -2],
      ],
    },
    {
      id: 'numidian-pin',
      faction: 'defender',
      style: 'advance',
      width: 1.9,
      startFrame: 240,
      endFrame: 660,
      fadeOutFrame: 740,
      points: [
        [-30, -18],
        [-30, -2],
        [-29, 9],
      ],
    },
  ],

  outcome: {
    winner: 'CARTHAGE',
    summary:
      'Hannibal bends his center, wheels his veterans inward and seals the ring with cavalry. The largest Roman army ever fielded ceases to exist.',
    casualties: 'Roman: 48,200–70,000 killed · Carthaginian: 5,700–8,000',
  },
};

/**
 * Deterministic position of a unit at a frame (linear waypoint interpolation).
 * Hand-rolled instead of `interpolate()` because the engagement solver calls it
 * O(units × frames) per render — it must not allocate keyframe arrays.
 */
export const getUnitPosition = (
  unit: TroopUnitData,
  frame: number,
): {x: number; z: number} => {
  const w = unit.waypoints;
  if (frame <= w[0].frame) return {x: w[0].x, z: w[0].z};
  const last = w[w.length - 1];
  if (frame >= last.frame) return {x: last.x, z: last.z};
  for (let i = 0; i < w.length - 1; i++) {
    if (frame >= w[i].frame && frame <= w[i + 1].frame) {
      const span = Math.max(1, w[i + 1].frame - w[i].frame);
      const t = (frame - w[i].frame) / span;
      return {
        x: w[i].x + (w[i + 1].x - w[i].x) * t,
        z: w[i].z + (w[i + 1].z - w[i].z) * t,
      };
    }
  }
  return {x: w[0].x, z: w[0].z};
};

/**
 * Nearest opposing unit at a frame. Used to resolve engaged facing and to aim
 * combat sparks at the enemy instead of at the block's travel direction.
 */
export const getNearestEnemy = (
  unit: TroopUnitData,
  frame: number,
): {x: number; z: number; id: string; distance: number} | null => {
  const self = getUnitPosition(unit, frame);
  let best: {x: number; z: number; id: string; distance: number} | null = null;
  for (const other of BATTLE.units) {
    if (other.faction === unit.faction) continue;
    const p = getUnitPosition(other, frame);
    const distance = Math.hypot(p.x - self.x, p.z - self.z);
    if (!best || distance < best.distance) {
      best = {x: p.x, z: p.z, id: other.id, distance};
    }
  }
  return best;
};

/** Deterministic army-strength readout for the HUD tug-of-war meter. */
export const getArmyStrength = (
  faction: 'attacker' | 'defender',
  frame: number,
): number => {
  const units = BATTLE.units.filter((u) => u.faction === faction);
  const total = units.reduce((sum, unit) => {
    const frames = unit.waypoints.map((w) => w.frame);
    const strengths = unit.waypoints.map((w) => w.strength ?? 1);
    return (
      sum +
      interpolate(frame, frames, strengths, {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    );
  }, 0);
  return total / units.length;
};
