---
name: 3d-history-battle
description: Autonomous historical battle researcher and 3D top-down tactical map animator for 9:16 YouTube Shorts in Remotion (@remotion/three), built on GitEase AI Video Studio architecture.
---

# 3D Historical Battle Map Skill (`3d-history-battle` v2.0)

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
- Fetch battle facts via Wikipedia APIs (no key required):
  - Summary: `https://wikipedia.org<Battle_Page_Title>`
  - Sections & Order of Battle: `https://wikipedia.org<Battle_Page_Title>&prop=text|sections&format=json`

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
**FORBIDDEN:** Do NOT use 3D round pipes or `TubeGeometry` for tactical arrows.
Instead, render flat, sharp, terrain-hugging **War Arrows** in the style of *HistoryMarche* and *Kings and Generals*:
- **Flat Ribbon Body:** Generate a flat 2D ribbon strip of configurable width (`arrowWidth`, typically `1.8` to `2.6` units) sampled along a `THREE.CatmullRomCurve3` path.
- **Terrain Hugging:** For every sampled point `(x, z)` along the left and right edges of the ribbon, set `y = getElevationAt(x, z) + 0.28` so the flat arrow drapes naturally over hills and valleys without floating or clipping.
- **Sharp Triangular Arrowhead:** At the current leading tip (`progress = interpolate(frame, [startFrame, endFrame], [0, 1])`), attach a crisp, flat triangular/chevron arrowhead (`headWidth = arrowWidth * 2.1`, `headLength = arrowWidth * 2.4`) aligned to the curve tangent vector.
- **Visual Polish:** Give the arrow a bold faction fill color (`opacity: 0.88`) with a thin, darker or white contrasting border outline and subtle drop shadow on the terrain.

---

## 9. Anti-Overlap Troop Formation & Spacing Rules (CRITICAL)
Units must NEVER overlap, clip, or stack on top of each other at any frame:
1. **Explicit Unit Dimensions:** Standard infantry blocks should be compact (`width: 6.5`, `depth: 2.8`, `height: 1.1`), cavalry blocks (`width: 5.0`, `depth: 2.5`, `height: 1.2`), and skirmishers (`width: 5.5`, `depth: 1.8`, `height: 0.9`).
2. **Minimum Formation Gap:**
   - Adjacent units in the same battle line **MUST** have a center-to-center `X` distance of at least `(unitA.width / 2) + (unitB.width / 2) + 1.8` units (minimum `1.8` units of visible empty terrain gap between neighboring blocks).
   - Echeloned or reserve lines **MUST** have a center-to-center `Z` separation of at least `(unitA.depth / 2) + (unitB.depth / 2) + 2.5` units.
3. **Combat Standoff Distance:** When opposing attacker and defender units engage in combat (`inCombat: true`), stop their `Z` positions at a clean battle-line standoff distance (`centerToCenterZ >= (unitA.depth / 2) + (unitB.depth / 2) + 0.8`) so their front edges meet cleanly without penetrating each other's geometry.
4. **Coordinate Audit Before Writing Code:** Before generating `battleData.ts`, mentally or programmatically verify all `(x, z)` coordinates at key battle phases (`frame = 0`, `mid-battle`, `climax`, `end`) to guarantee zero bounding-box intersections.

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
  - **Combat Feedback:** When `inCombat === true`, emit deterministic golden/orange spark particles (`random('spark-' + frame)`) and subtle rhythmic micro-recoil along the front line, plus a darkening/desaturation shift as `strength` drops below `0.4`.

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
