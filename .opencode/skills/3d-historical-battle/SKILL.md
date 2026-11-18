---
name: 3d-history-battle
description: Autonomous historical battle researcher and 3D top-down tactical map animator for 9:16 YouTube Shorts in Remotion (@remotion/three), built on GitEase AI Video Studio architecture.
---

# 3D Historical Battle Map Skill (`3d-history-battle` v2.1)

> **v2.1 changelog:** rebuilt the War Arrow spec as a layered flat compositor (§8) and replaced waypoint-based facing with a per-frame engagement solver so retreating blocks never turn their backs — or their combat sparks — on the enemy (§9 rule 5, §12).

## 1. Repository & Project Architecture (GitEase Core)
- **Repository Root:** `/workspaces/ai-video-studio`
- **Remotion Project Directory:** `/workspaces/ai-video-studio/video-project`
- **Composition Registry:** `video-project/src/Root.tsx`

## 2. Strict Video Isolation Rules (GitEase Core)
- **NEVER overwrite or modify existing video folders** inside `video-project/src/` unless the user explicitly asks to edit a specific existing video by name.
- Every new battle video request **MUST** be created inside its own dedicated, self-contained subfolder under `video-project/src/<kebab-case-battle-name>/` (for example, `video-project/src/battle-of-cannae-v2/`).
- Register every new video as a separate `<Composition>` inside `video-project/src/Root.tsx` with a unique `PascalCase` `id` (for example, `id="BattleOfCannaeV2"`).
- Keep all styles, fonts, helper utilities, terrain generators, and sub-scenes local to that video's subfolder so different videos never conflict.

## 3. Remotion & Deterministic Animation Standards (GitEase Core)
- Default video settings unless specified otherwise by the user:
  - **Resolution:** `1080` width × `1920` height (vertical 9:16 for YouTube Shorts)
  - **Frame Rate:** `30` fps
  - **Duration:** `900` frames (30 seconds) or `1800` frames (60 seconds)
- **Deterministic Motion Only:** Drive **all** animations, camera movements, troop advances, ribbon arrows, particle systems, and transitions strictly using Remotion's `useCurrentFrame()`, `interpolate()`, and `spring()`.
- **Forbidden Hooks/Timers:** NEVER use `Math.random()`, `setTimeout()`, `setInterval()`, `requestAnimationFrame()`, or React Three Fiber's `useFrame()` hook. Use Remotion's `random('seed')` for deterministic randomness.

## 4. 2.5D & 3D WebGL Rules for Google Colab T4 (GitEase Core)
- Build every 3D battlefield scene using `@remotion/three` (`<ThreeCanvas>`) and `three`.
- Always pass explicit `width` and `height` props from `useVideoConfig()` into `<ThreeCanvas width={width} height={height}>`.
- Keep package versions aligned with the installed `remotion` version in `video-project/package.json`.

## 5. Performance & Rendering Discipline (GitEase Core)
- **Do NOT run `npx remotion render` inside GitHub Codespaces** unless explicitly instructed; rendering is offloaded to Google Colab's NVIDIA T4 GPU (`--gl=angle-egl --chrome-mode="chrome-for-testing"`).
- Avoid heavy CSS `filter: blur(...)` animations on large moving DOM nodes.
- Always report the exact **Composition ID** (e.g., `COMP_ID = "BattleOfCannaeV2"`) at the end of your response.

---

## 6. Autonomous Wikipedia Historical Battle Research & Suggestion Engine
- If the user asks for battle ideas without naming one, **proactively suggest 3–5 high-drama tactical battles** ideal for 30–60s vertical Shorts (*Cannae*, *Gaugamela*, *Austerlitz*, *Teutoburg Forest*, *Thermopylae*, *Agincourt*, *Cowpens*, *Hattin*) with their **Tactical Hook** and **Key Terrain Feature**.
- Fetch battle facts via Wikipedia APIs (no key required), using `curl` or web fetch before writing any code:
  - Summary & Coordinates: `https://en.wikipedia.org/api/rest_v1/page/summary/<Battle_Page_Title>`
  - Sections & Order of Battle: `https://en.wikipedia.org/w/api.php?action=parse&page=<Battle_Page_Title>&prop=text|sections&format=json`
  - Historical Battle Map Files: `https://en.wikipedia.org/w/api.php?action=query&titles=<Battle_Page_Title>&prop=images&format=json`
- From the retrieved article, extract and translate into `battleData.ts`:
  1. **Battle Metadata:** Official name, date, location, belligerents, commanders, and approximate troop strengths/casualties.
  2. **Terrain & Topography:** Rivers, ridges/hills, forests, marshes, cliffs, roads, or coastal shorelines (as `TerrainFeature[]`).
  3. **Deployment & Battle Phases (3 to 5 acts):** *Deployment (0%–20%)*, *Opening clash/feint (20%–45%)*, *Decisive maneuver (45%–75%)*, *Encirclement, rout & outcome (75%–100%)*.

---

## 7. Camera Choreography & Full-Battle Framing Rules (CRITICAL)
To prevent disorienting or premature zooms and ensure the viewer always understands the tactical picture:
- **Battlefield Bounding Box:** Keep all troops and active maneuvers inside `X: [-38, +38]` and `Z: [-62, +62]` on a `100 x 160` terrain plane.
- **Mandatory Full-Battle Opening (0% to 25% of frames):**
  - Start with a **Wide Strategic Establishing Shot** (`camera.position = [0, 135, 65]`, `lookAt = [0, 0, 0]`, `fov = 45`) so **100% of both armies' deployments, flanks, and rivers/hills are clearly visible at once** inside the 9:16 portrait frame.
  - Hold this wide framing steady while initial formations and commander labels appear.
- **Disciplined, Purpose-Driven Camera Movement Only:**
  - **NEVER zoom in randomly** during standard marching or front-line clashes. Keep the camera wide enough (`y >= 115`) so both flanks remain visible during main advances.
  - **Only allow ONE slow, deliberate zoom-in** during the decisive tactical climax (e.g., when cavalry encircles the rear or a flank collapses), zooming no closer than `y = 85` so surrounding context is never lost.
  - **Smooth Easing:** Always use cubic/sine easing or `interpolate(..., { easing: Easing.inOut(Easing.cubic) })` between camera keyframes—never abrupt linear snaps.
  - **Final Pull-Back (Last 15% of frames):** Smoothly return to the wide overview (`[0, 135, 65]`) so the viewer sees the complete encirclement or rout before the outcome banner appears.

---

## 8. Iconic Flat Ribbon "War Arrows" (`TacticalArrow.tsx`)
**FORBIDDEN:** `TubeGeometry`, `ExtrudeGeometry`, cylinders, or any 3D pipe for arrows. Arrows are **flat painted decals** on a relief map.

Render them as a **layered flat compositor** (draw order bottom → top). Every layer is generated from the *same* sampled curve frames so they never drift apart:

1. **Contact shadow** — same path, width `+0.9` units, offset `(-0.45, -0.30)` on XZ *away from the key light*, `yLift = 0`, color `#05070a`, `opacity 0.20`. Gives the arrow weight; recompute `getElevationAt()` at the offset positions too.
2. **Dark contour band** — width `+0.50`, `yLift = 0.012`, color `#10131a`, `opacity 0.55`. This is the outline that separates the arrow from grass and sand.
3. **Faction fill** — width `arrowWidth` (default `1.8`–`2.6`), `yLift = 0.020`, `opacity 0.90`, `toneMapped={false}`.
4. **Sheen stripe** — width `arrowWidth * 0.32`, `yLift = 0.028`, faction color lightened 40% toward white, `opacity 0.38`. Reads as a painted brush stroke at 9:16 scale.
5. **Chevron head (outline + fill)** — 4 points: tip, left barb, rear notch, right barb. `headWidth = arrowWidth * 2.4`, `headLength = arrowWidth * 2.2`, notch pulled `0.34 * headLength` toward the tip, tip extended `0.24 * headLength` past the curve end. Outline copy is `+0.45` wider; the fill sits `yLift = 0.024`. The rear notch must sit on the curve so the head welds to the ribbon.

**Body shape rules:**
- **Tail taper:** sample index `i` of `n` uses `halfWidth = (arrowWidth / 2) * (0.45 + 0.55 * min(1, (i / (n - 1)) * 2.2))` — a launched stroke, never a blunt rectangle.
- **Terrain hugging:** project *both* ribbon edges **and** all four head points with `getElevationAt(x, z) + HOVER + yLift` (`HOVER = 0.30`). A single flat plane will dive into hills and float over valleys.
- **Clamped progress:** `progress = interpolate(frame, [startFrame, endFrame], [0, 1], {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})`; clamp curve sampling to `0.999` so the tangent never degenerates.
- **Reveal / fade:** opacity ramps `0 → 1` over 9 frames from `startFrame`, holds, then fades to `0` over 60 frames after `fadeOutFrame`.
- **Depth discipline:** every layer uses `transparent`, `depthWrite={false}` and an **explicit `renderOrder`** (shadow 0, outline 1, fill 2, sheen 3, head outline 4, head fill 5). Without explicit `renderOrder`, coplanar transparent layers sort unstably and flicker.
- **Direction audit (headless-testable):** for every arrow at `progress = 0.25 / 0.5 / 0.75 / 1`, assert `dot(normalize(tip − notch), tangent) >= 0.95`, `dot(tip − curvePoint, tangent) > 0`, `dot(notch − curvePoint, tangent) < 0`, and `|barbL − tip| == |barbR − tip|`. Testing against the local tangent (not the distance from the arrow's origin) is essential: encirclement arrows deliberately loop back, so an origin-distance test reports false failures. If the head lags the tangent, the `points` array is reversed — fix the data, not the renderer.
- **Curve:** `THREE.CatmullRomCurve3(points, false, 'centripetal')` to avoid loops and overshoot on tight flank arcs.

---

## 9. Anti-Overlap Troop Formation & Spacing Rules (CRITICAL)
Units must NEVER overlap, clip, or stack on top of each other at any frame:
1. **Explicit Unit Dimensions:** Standard infantry blocks should be compact (`width: 6.5`, `depth: 2.8`, `height: 1.1`), cavalry blocks (`width: 5.0`, `depth: 2.5`, `height: 1.2`), and skirmishers (`width: 5.5`, `depth: 1.8`, `height: 0.9`).
2. **Minimum Formation Gap:**
   - Adjacent units in the same battle line **MUST** have a center-to-center `X` distance of at least `(unitA.width / 2) + (unitB.width / 2) + 1.8` units (minimum `1.8` units of visible empty terrain gap between neighboring blocks).
   - Echeloned or reserve lines **MUST** have a center-to-center `Z` separation of at least `(unitA.depth / 2) + (unitB.depth / 2) + 2.5` units.
3. **Combat Standoff Distance:** When opposing attacker and defender units engage in combat (`inCombat: true`), stop their `Z` positions at a clean battle-line standoff distance (`centerToCenterZ >= (unitA.depth / 2) + (unitB.depth / 2) + 0.8`) so their front edges meet cleanly without penetrating each other's geometry.
4. **Coordinate Audit Before Writing Code:** Before generating `battleData.ts`, mentally or programmatically verify all `(x, z)` coordinates at key battle phases (`frame = 0`, `mid-battle`, `climax`, `end`) to guarantee zero bounding-box intersections.
5. **Engaged Facing Is Sacred:** A block's yaw is **never** allowed to follow a retreat vector. When a unit gives ground (feigned retreat, collapsing centre, rout) it keeps its **front edge toward the nearest enemy** — set `facing: 'enemy'` on those waypoints. Any waypoint with `inCombat: true` resolves facing to the nearest enemy automatically. Auto-heading from movement is only for repositioning units that are *not* engaged. `rotationY` is for **non-engaged staging only** (deployment, approach): an engaged block's yaw is owned by the contact solver, because hand-authored angles cannot know where the enemy will be.
   - **Never interpolate waypoint-resolved enemy yaws.** Resolving a bearing once per waypoint and lerping between them is the single most common cause of "firing backwards": when the nearest enemy swaps mid-leg (centre gives way → Libyans close → cavalry arrives in the rear) the lerp dwells between two unrelated targets and the block ends up presenting its **side or rear** to both. Resolve the bearing at the **current frame** and low-pass it instead (see §12).
   - Consequence: combat sparks, shield faces and emblems always point at the foe — never at the unit's own baseline.

---

## 10. Smart `battleData.ts` Schema
Create `video-project/src/<battle-name>/battleData.ts` using this strongly-typed schema:

```typescript
export type UnitCategory = 'infantry' | 'heavy-infantry' | 'cavalry' | 'archers' | 'artillery' | 'phalanx';

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
   * 'enemy' locks the front edge onto the nearest opposing unit for this leg —
   * REQUIRED for any retreat / giving-ground waypoint so blocks never turn
   * their backs (and their combat sparks) on the enemy. Defaults to 'movement'.
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

## 11. YouTube Shorts 9:16 Safe Zone (`1080x1920`)
- Keep all 2D HUD overlays (`BattleHud.tsx`) strictly inside:
• Top margin: >= 150px
• Bottom margin: >= 380px
• Right margin: >= 140px
• Left margin: >= 60px

---

## 12. Visual Design & Tactical Map Detailing (Documentary Grade)
Elevate the battlefield from a basic untextured plane into a rich, tactile historical map diorama:
- **Layered Cartographic Terrain (`TerrainMesh.tsx`):**
  - Blend elevation height with subtle deterministic parchment/topographic shading using Remotion's `random(seed)` so grass plains (`#4a5d3f`), dry earth/hills (`#8c7853`), mountain ridges (`#5e503f`), and deep riverbeds (`#264653`) look like a painted relief map.
  - Render **topographic contour lines** at regular elevation intervals (`y = 0.5, 1.5, 2.5, 3.5`) plus a faint, subtle cartographic latitude/longitude grid (`opacity: 0.12`) so viewers instantly read hills, valleys, and elevation advantages.
  - Add **environmental props** using lightweight instanced low-poly meshes (`THREE.InstancedMesh` for T4 GPU speed):
    - *Forests:* Clusters of dark-green low-poly cones/icosahedrons inside `type: 'forest'` zones.
    - *Rivers:* Animated subtle water shimmer (`interpolate` on UV offset or wave phase) with sandy/muddy riverbank edges.
    - *Camps / Fortifications / Bridges:* Small miniature wooden palisade walls, tent clusters, or stone bridge blocks at key strategic landmarks.
- **High-Detail Unit Counters (`TroopUnit.tsx`):**
  - Instead of plain flat-colored boxes, render each unit as a **3D bevel-edged tactical game piece** with:
    1. A dark metallic/obsidian base rim (`height: 0.35`) for crisp silhouette separation against the terrain.
    2. A richly colored top face (`faction.color`) with a crisp white or gold border trim.
    3. A sharp **tactical unit emblem** rendered via a high-DPI offscreen `<canvas>` texture (`THREE.CanvasTexture`):
       - **Infantry / Phalanx:** Crisp diagonal `X` cross or spear-bar icon.
       - **Heavy Infantry:** Double-barred `X` or shield emblem.
       - **Cavalry:** Bold diagonal slash `/` with a small pennant notch.
       - **Archers / Skirmishers:** Upward chevron `^` or curved bow arc.
       - **Commander / General:** Distinct gold star or banner flag rising slightly above the unit (`height: 1.8`) with a floating commander name tag.
  - **Combat Feedback:** When `inCombat === true`, emit deterministic golden/orange spark particles (`random('spark-' + frame)`) and subtle rhythmic micro-recoil along the **enemy-facing front edge only**. Sparks are authored in local `+Z`, so put them in their **own group** rotated by the world-space bearing to the nearest enemy instead of inheriting the block yaw — then sparks are correct by construction even if the body yaw is mid-turn. Never spawn sparks when `isRouting === true`.
  - **Engagement Solver (`facing.ts`), the only correct way to face a contact:**
    1. Compute a *march* yaw from waypoints (explicit `rotationY`, else leg direction, else faction baseline) and interpolate it **only** for non-engaged legs.
    2. Solve the whole timeline **once per unit** into a cached `Float32Array` (module-level `Map` keyed by unit id). Walking the recursion per rendered frame is O(units × frames) and needlessly expensive; a precomputed table is O(1) at render time and still a pure function of `battleData`.
    3. If the active waypoint is engaged (`facing: 'enemy'` or `inCombat`), step `y += shortestAngle(bearingToNearestEnemy(frame) − y) * gain` with an **adaptive gain**: `gain = clamp(0.16, |error| * 0.55, 0.5)`. Small corrections drift smoothly (no jitter); a new threat on another side resolves in ~2 frames instead of leaving the block side-on for 10+.
    4. `getUnitPosition()` must be allocation-light (hand-rolled linear loop, not `interpolate()` + `.map()`) because the solver calls it thousands of times while building the table.
    5. Do **not** mark a unit `facing: 'enemy'` from frame 0 just because it will be engaged later — at deployment the nearest enemy is often a diagonally-offset skirmish screen, and the whole line drifts sideways to face it. Enable the flag only from the first waypoint where the block actually contacts or gives ground.
  - **Verification gate (run headlessly):** for every engaged unit-frame compute `dot(facingVector, unit→nearestEnemy)` and assert **no run of 2+ consecutive frames with `dot < 0`** (back turned) and **no run of 4+ frames with `dot < 0.5`** (side-on). Single-frame dips are inherent to a contact switch and read as a wheel-in; longer runs mean the solver is broken, a `rotationY` is fighting it, or a block is flagged engaged too early.

---

## 13. Cinematic Videography & Pacing Rules
Make the camera movement and visual storytelling feel directed by a documentary cinematographer rather than a static diagram:
- **Rule of Thirds & Asymmetric Framing:** Offset `lookAt` slightly (`z` shifted by `-4` to `+4` units) so the active front line sits cleanly in the middle third of the 9:16 frame, leaving clean visual breathing room above for the title header and below for the phase banner.
- **Cinematic 3-Point Lighting & Atmosphere:**
  - **Key Light:** Warm golden-hour directional sunlight (`#fff2d6`, intensity `1.8`) angled at `40°` azimuth and `45°` elevation with soft PCF shadows (`shadow-mapSize={[2048, 2048]}`) so hills, unit blocks, and trees cast long, dramatic shadows across the map.
  - **Fill & Rim Light:** Cool sky hemisphere light (`#8ecae6` sky / `#3d352e` ground, intensity `0.65`) plus a subtle rear rim directional light to catch the bevel edges of troop blocks.
  - **Atmospheric Depth:** Add subtle distance fog (`<fog attach="fog" args={['#1a1d24', 140, 260]} />`) and a soft dark vignette around the screen edges so the viewer's eye locks onto the illuminated battlefield center.
- **Smooth Camera Motion Discipline (No Jerky Cuts):**
  - **Continuous Gentle Drift:** Never leave the camera 100% frozen like a static JPEG; apply a subtle, slow cinematic drift (e.g., `2–4` units of lateral pan or `3°` gentle orbital arc over 300 frames) so the 3D parallax of hills and unit blocks stays alive.
  - **Single-Focus Rule:** Never zoom in and out repeatedly. Follow a strict 3-act camera arc:
    1. *Act 1 (Establishing Wide):* Full battlefield overview showing rivers, terrain, and opposing lines.
    2. *Act 2 (Tactical Push):* Gentle, steady forward glide keeping both flanks in frame as the trap develops.
    3. *Act 3 (Climax & Pull-Back):* One smooth focus on the decisive encirclement/breakthrough, followed by a clean pull-back to reveal the complete encirclement ring.
- **Editorial Typography & Motion Graphics (`BattleHud.tsx`):**
  - **Opening Title Card (Frames `0–75`):** Clean cinematic title reveal with battle name, year, and belligerent crests (`Commander A` vs. `Commander B`) that smoothly fades into a compact top pill badge so it never blocks the map.
  - **Dynamic Phase Lower-Third:** Place a sleek, high-contrast documentary caption card just above the YouTube Shorts bottom safe zone (`bottom: 400px`) that smoothly slides/fades in at each `BattlePhase` transition with concise, punchy 6–10 word tactical narration.
  - **Live Army Strength Bar:** Include a slim, minimalist horizontal tug-of-war strength meter at the top safe margin (`top: 165px`) showing remaining troop strength for both factions updating deterministically with unit casualties.

---

## 14. Local File Blueprint for Each Battle
Inside `video-project/src/<battle-name>/`, generate these clean, modular files:
1. `battleData.ts` — The complete Wikipedia-sourced dataset using the schema in §10.
2. `TerrainMesh.tsx` — Builds a `100 x 160` subdivided `PlaneGeometry(100, 160, 128, 192)` rotated `-Math.PI / 2` on X. Computes vertex heights deterministically by summing Gaussian hills/ridges and carving rivers/valleys from `battleData.terrain.features` plus subtle `random(seed)` micro-relief. Export a helper `getElevationAt(x, z)` so units and arrows sit flush on hills and valleys.
3. `facing.ts` — Pure yaw solver from §9 rule 5 / §12: `getUnitYaw(unit, frame)` backed by a per-unit cached `Float32Array`. Imported by `TroopUnit.tsx` and by the headless facing audit.
4. `TroopUnit.tsx` — Renders each unit as the bevel-based 3D tactical game piece described in §12 (obsidian base rim, faction-colored top face, `CanvasTexture` emblem, commander banner). Interpolates `(x, z)` across `waypoints`, sets `y = getElevationAt(x, z) + 0.35`, shrinks the block as `strength` drops, takes yaw from `facing.ts`, and emits deterministic combat sparks from a separately-rotated group aimed at the nearest enemy.
5. `arrowGeometry.ts` — Pure, React-free geometry for §8: `sampleCurve()`, `buildRibbon()`, `buildHead()`, `headMetrics()`. Elevation is injected as a sampler so the module can be unit-tested headlessly (direction, taper, layer nesting, terrain hugging).
6. `TacticalArrow.tsx` — Composites the six layers from §8 off `arrowGeometry`, driven by `interpolate(frame, [startFrame, endFrame], [0, 1], {easing: Easing.inOut(Easing.cubic), extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})`. No `TubeGeometry`, no extrusion.
7. `BattleHud.tsx` — Crisp 2D overlay (title card, faction badges, phase lower-third, strength meter, outcome card) strictly inside the YouTube Shorts safe zone from §11. Render only the *active* phase card so consecutive captions never stack, and draw the cinematic scrim **first** so it never dims the text.
8. `index.tsx` — Combines `<ThreeCanvas width={width} height={height} shadows>` (three-point lighting from §13, fog, vignette) with `<BattleHud />`.
9. Register the composition in `video-project/src/Root.tsx` with a unique `PascalCase` `id` and report that exact `COMP_ID` at the end of the response.
