---
name: 3d-history-battle
description: Autonomous historical battle researcher and 3D top-down tactical map animator for 9:16 YouTube Shorts in Remotion (@remotion/three), built on GitEase AI Video Studio architecture.
---

# 3D Historical Battle Map Skill (`3d-history-battle`)

## 1. Repository & Project Architecture (GitEase Core)
- **Repository Root:** `/workspaces/ai-video-studio`
- **Remotion Project Directory:** `/workspaces/ai-video-studio/video-project`
- **Composition Registry:** `video-project/src/Root.tsx`

## 2. Strict Video Isolation Rules (GitEase Core)
- **NEVER overwrite or modify existing video folders** inside `video-project/src/` unless the user explicitly asks to edit a specific existing video by name.
- Every new battle video request **MUST** be created inside its own dedicated, self-contained subfolder under `video-project/src/<kebab-case-battle-name>/` (for example, `video-project/src/battle-of-cannae/`).
- Register every new video as a separate `<Composition>` inside `video-project/src/Root.tsx` with a unique `PascalCase` `id` (for example, `id="BattleOfCannae"`).
- Keep all styles, fonts, helper utilities, terrain generators, and sub-scenes local to that video's subfolder so different videos never conflict.

## 3. Remotion & Deterministic Animation Standards (GitEase Core)
- Default video settings unless specified otherwise by the user:
  - **Resolution:** `1080` width × `1920` height (vertical 9:16 for YouTube Shorts)
  - **Frame Rate:** `30` fps
  - **Duration:** `900` frames (30 seconds) or `1800` frames (60 seconds)
- **Deterministic Motion Only:** Drive **all** animations, camera movements, troop advances, spline arrows, particle systems, and transitions strictly using Remotion's `useCurrentFrame()`, `interpolate()`, and `spring()`.
- **Forbidden Hooks/Timers:** NEVER use `Math.random()`, `setTimeout()`, `setInterval()`, `requestAnimationFrame()`, or React Three Fiber's `useFrame()` hook, as they cause frame flickering and desynchronization during headless GPU rendering. Use Remotion's `random('seed')` for deterministic randomness.

## 4. 2.5D & 3D WebGL Rules for Google Colab T4 (GitEase Core)
- Build every 3D battlefield scene using `@remotion/three` (`<ThreeCanvas>`) and `three`.
- Always pass explicit `width` and `height` props from `useVideoConfig()` into `<ThreeCanvas width={width} height={height}>`.
- For **2.5D parallax**, arrange flat planes, UI cards, or textured meshes at varying Z-depths (`position={[x, y, z]}`) and animate the camera position/rotation using `interpolate(frame, ...)`.
- Keep package versions aligned with the installed `remotion` version in `video-project/package.json`.

## 5. Performance & Rendering Discipline (GitEase Core)
- **Do NOT run `npx remotion render` inside GitHub Codespaces** unless explicitly instructed; rendering is offloaded to Google Colab's NVIDIA T4 GPU (`--gl=angle-egl --chrome-mode="chrome-for-testing"`).
- Avoid heavy CSS `filter: blur(...)` animations on large moving DOM nodes; prefer WebGL shaders, canvas gradients, or lightweight opacity/transform transitions for fast rendering.
- Always report the exact **Composition ID** (e.g., `COMP_ID = "BattleOfCannae"`) at the end of your response so the user can paste it straight into their Google Colab T4 GPU render script.

---

## 6. Autonomous Wikipedia Historical Battle Research & Suggestion Engine

### When the User Asks for Battle Ideas or Doesn't Name a Battle
If the user says *"suggest a battle"*, *"pick an interesting historical battle"*, or asks for a topic without naming one, **proactively suggest 3–5 high-drama tactical battles** ideal for 30–60s vertical Shorts (e.g., *Battle of Cannae*, *Battle of Gaugamela*, *Battle of Austerlitz*, *Battle of Teutoburg Forest*, *Battle of Thermopylae*, *Battle of Agincourt*, *Battle of Cowpens*, *Battle of Hattin*). For each suggestion, briefly explain:
1. **The Tactical Hook** (why it looks great visually in 3D, e.g., double envelopment, feigned retreat, hidden ambush, chokepoint defense).
2. **The Key Terrain Feature** (e.g., Pratzen Heights plateau, narrow coastal pass, dense forest ravine, muddy plowed field).

### How to Study & Extract Any Battle via Wikipedia
Whenever a battle is chosen, use web fetch / curl / Wikipedia REST & MediaWiki APIs (no API key required) to study the battle before writing any code:
- **Summary & Coordinates Endpoint:** `https://en.wikipedia.org/api/rest_v1/page/summary/<Battle_Page_Title>`
- **Full Structured Sections & Order of Battle:** `https://en.wikipedia.org/w/api.php?action=parse&page=<Battle_Page_Title>&prop=text|sections&format=json`
- **Historical Battle Map Files:** `https://en.wikipedia.org/w/api.php?action=query&titles=<Battle_Page_Title>&prop=images&format=json`

From the retrieved Wikipedia article, extract and translate into `battleData.ts`:
1. **Battle Metadata:** Official name, date, location, belligerents, commanders, and approximate troop strengths/casualties.
2. **Terrain & Topography Features:** Rivers (e.g., Aufidus River), ridges/hills (e.g., Pratzen Heights), forests, marshes, cliffs, roads, or coastal shorelines.
3. **Deployment & Battle Phases (3 to 5 Acts):**
   - *Phase 1 (0%–20% frames):* Initial deployment & geographic setup.
   - *Phase 2 (20%–45% frames):* Opening clash / vanguard engagement / feint.
   - *Phase 3 (45%–75% frames):* Decisive tactical maneuver (flanking cavalry, crescent collapse, ambush spring).
   - *Phase 4 (75%–100% frames):* Encirclement, rout, and final casualty/outcome summary.

---

## 7. Smart `battleData.ts` Schema (Required in Every Battle Folder)
Create `video-project/src/<battle-name>/battleData.ts` using this strongly-typed, self-documenting schema so every battle animation is data-driven, easy to tweak, and deterministic:

```typescript
export type UnitCategory = 'infantry' | 'heavy-infantry' | 'cavalry' | 'archers' | 'artillery' | 'phalanx';

export interface TerrainFeature {
  id: string;
  name: string;
  type: 'hill' | 'ridge' | 'river' | 'forest' | 'marsh' | 'pass' | 'fortification';
  /** Normalized battlefield coordinates: X in [-50, 50], Z in [-80, 80] (tuned for 9:16 portrait framing) */
  x: number;
  z: number;
  radiusX: number;
  radiusZ: number;
  /** Positive for hills/ridges, negative for rivers/valleys */
  elevation: number;
  rotationY?: number;
}

export interface UnitWaypoint {
  frame: number;
  x: number;
  z: number;
  /** Scale multiplier (1.0 = full strength, 0.2 = depleted/routed) */
  strength?: number;
  /** True when actively clashing with enemy units (triggers spark/flash pulse) */
  inCombat?: boolean;
  /** True when routed/fleeing */
  isRouting?: boolean;
}

export interface TroopUnitData {
  id: string;
  label: string;
  faction: 'attacker' | 'defender';
  category: UnitCategory;
  /** Block dimensions on the 3D tabletop */
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
  /** 3D [x, z] control points along the map */
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
```

---

## 8. Local File Blueprint for Each Battle
Inside `video-project/src/<battle-name>/`, generate these clean, modular files:
1. `battleData.ts` — The complete Wikipedia-sourced dataset using the schema above.
2. `TerrainMesh.tsx` — Builds a `100 x 160` subdivided `PlaneGeometry(100, 160, 128, 192)` rotated `-Math.PI / 2` on X. Computes vertex heights deterministically by summing Gaussian hills/ridges and carving rivers/valleys from `battleData.terrain.features` + subtle `random(seed)` micro-relief. Exports a helper `getElevationAt(x, z)` so units and arrows sit flush on top of hills and valleys.
3. `TroopUnit.tsx` — Renders each unit as a beveled 3D tactical block (`BoxGeometry`) with a crisp top emblem/stripe indicating `infantry` (cross), `cavalry` (diagonal slash), `archers` (chevron), or `artillery` (dot). Interpolates `(x, z)` and rotation angle smoothly across `waypoints`, adjusts `y = getElevationAt(x, z) + 0.35`, scales down width/depth as `strength` drops, and pulses emissive intensity when `inCombat === true`.
4. `TacticalArrow.tsx` — Builds a `THREE.CatmullRomCurve3` hovering `0.5` units above `getElevationAt(x, z)`. Uses `interpolate(frame, [startFrame, endFrame], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })` to slice the curve points and render an animated `TubeGeometry` with a directional cone arrowhead at the tip.
5. `BattleHud.tsx` — Crisp 2D overlay displaying the battle title, date, faction commander badges, current tactical phase banner, and final outcome card—strictly inside the **YouTube Shorts Safe Zone**.
6. `index.tsx` — Combines `<ThreeCanvas width={width} height={height} shadows>` (with a 45° directional sunlight + hemisphere fill light) and `<BattleHud />`.

## 9. Camera Choreography & YouTube Shorts 9:16 Safe Zone
- **Portrait Battlefield Framing:** Orient the main battle axis along the vertical `Z` axis (`-80` to `+80`) and flanks across the `X` axis (`-50` to `+50`) so the entire battlefield fills the 9:16 vertical screen naturally.
- **Angled Top-Down Camera:** Keep camera pitch between `55°` and `72°` so terrain elevation, shadows, and 3D troop block thickness stand out clearly.
- **YouTube Shorts UI Safe Zone (`1080x1920`):**
  - Top margin: `>= 150px` (avoids top status/search bar).
  - Bottom margin: `>= 380px` (avoids channel handle, video title, and audio ticker).
  - Right margin: `>= 140px` (avoids Like, Comment, Share, and Remix buttons).
  - Left margin: `>= 60px`.
