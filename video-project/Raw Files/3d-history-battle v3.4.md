---
name: 3d-history-battle
description: Autonomous historical battle researcher and 3D top-down tactical map animator for 9:16 YouTube Shorts in Remotion (@remotion/three), built on GitEase AI Video Studio architecture with period-adaptive historiography and modular TSX/TS engine extensions.
---

# 3D Historical Battle Map Skill (`3d-history-battle` v3.4)

## 1. Repository & Project Architecture (GitEase Core)
- **Repository Root:** `/workspaces/ai-video-studio`
- **Remotion Project Directory:** `/workspaces/ai-video-studio/video-project`
- **Composition Registry:** `video-project/src/Root.tsx`
- **Shared Battle Engine Extensions:** `video-project/src/shared/battle-engine/`

## 2. Strict Video Isolation Rules (GitEase Core)
- **NEVER overwrite or modify existing video folders** inside `video-project/src/` unless the user explicitly asks to edit a specific existing video by name.
- Every new battle video request **MUST** be created inside its own dedicated, self-contained subfolder under `video-project/src/<kebab-case-battle-name>/` (e.g., `video-project/src/battle-of-austerlitz/`).
- Register every new video as a separate `<Composition>` inside `video-project/src/Root.tsx` with a unique `PascalCase` `id` (e.g., `id="BattleOfAusterlitz"`).
- Keep battle-specific data (`battleData.ts`) and the entry `index.tsx` inside the battle's own subfolder while importing all 3D, UI, camera, formation, and validation primitives from `video-project/src/shared/battle-engine/`.

## 3. Remotion & Deterministic Animation Standards (GitEase Core)
- Default settings: **Resolution** `1080x1920` (9:16), **Frame Rate** `30` fps, **Duration** `900` frames (30s) or `1800` frames (60s).
- **Deterministic Motion Only:** Drive **all** animations, camera movements, troop advances, arrows, and transitions strictly using `useCurrentFrame()`, `interpolate()`, and `spring()`.
- **Forbidden Hooks/Timers:** NEVER use `Math.random()`, `setTimeout()`, `setInterval()`, `requestAnimationFrame()`, or React Three Fiber's `useFrame()`. Use Remotion's `random('seed')`.

## 4. 2.5D & 3D WebGL Rules for Google Colab T4 (GitEase Core)
- Build every 3D scene using `@remotion/three` (`<ThreeCanvas width={width} height={height} shadows>`) and `three`.
- **Do NOT run `npx remotion render` inside GitHub Codespaces** unless instructed; rendering is offloaded to Google Colab's NVIDIA T4 GPU (`--gl=angle-egl --chrome-mode="chrome-for-testing"`).
- Always output `COMP_ID = "<YourBattleId>"` at the end of your response.

---

## 5. Period-Adaptive Historical Research Protocol (MANDATORY)
Before creating `battleData.ts`, classify the battle's `HistoricalEra` (`'ancient' | 'medieval' | 'napoleonic' | 'world-wars' | 'modern'`), consult `PERIOD_RESEARCH_MATRIX` in `historicalResearch.ts`, and execute **two research passes**:
1. **Pass 1 (Baseline Geography & Order of Battle):** Fetch Wikipedia's structured summary, coordinates, terrain description, and order of battle.
2. **Pass 2 (Period-Specific Primary & Authoritative Sources):** Cross-reference era-matched sources:
   - **Ancient** *(pre-500 AD)*: **Polybius**, **Livy**, **Arrian**, **Herodotus**, **Thucydides**, **Julius Caesar**, **Plutarch**, **Xenophon**, and ancient topography studies.
   - **Medieval** *(500–1500 AD)*: **Contemporary chronicles** (*Froissart*, *Anglo-Saxon Chronicle*, *Anna Komnene*, *Ibn al-Athir*) and **battlefield archaeological research**.
   - **Napoleonic & Early Modern** *(1500–1850)*: **Military archives & dispatches** (*Dépôt de la Guerre*, British War Office, Wellington/Napoleon dispatches) and **campaign histories** (Clausewitz, Jomini).
   - **World Wars** *(1914–1945)*: **Official military histories** (*US Army Green Books*, British *History of the Second World War*), **unit war diaries / AARs**, and **commander memoirs**.
   - **Modern** *(1945–Present)*: **Declassified government archives** (DoD/CIA/MOD) and **peer-reviewed academic/military publications** (RUSI, ISW, West Point *Modern War Institute*).
3. **Record Citations:** Populate `battleData.historicalSources` with at least 2–3 specific sources consulted.

---

## 6. Modular TypeScript & TSX Engine Extensions (MANDATORY)
Do **NOT** rewrite schema types, research matrices, 3D arrow geometry, emblem textures, terrain elevation math, HUD layouts, or overlap validation inside individual battle folders. Always assemble every new battle video using `BattleTemplate.tsx` and the shared modules in `video-project/src/shared/battle-engine/`:

1. **`BattleTemplate.tsx`** — Master scene wiring template; copy its exact layout into every new battle's `index.tsx`.
2. **`historicalResearch.ts`** — Period-adaptive primary source matrix (`PERIOD_RESEARCH_MATRIX`).
3. **`battleData.ts`** — Canonical `HistoricalBattleData` schema + `calculateArmyStrengthAtFrame()`.
4. **`formationBuilder.ts`** — Use `createBattleLine()` and `createCrescentFormation()` inside `battleData.ts` to generate non-overlapping initial troop deployments automatically.
5. **`battleValidator.ts`** — Call `validateBattleData(battleData)` at the top of `index.tsx` to catch overlaps, >2s arrows, >2 arrows/phase, or missing historical sources.
6. **`CameraRig.tsx`** — Place `<CameraRig keyframes={battleData.cameraKeyframes} />` inside `<ThreeCanvas>` for cubic-eased 3-act camera choreography (`buildThreeActCameraKeyframes()`), subtle parallax drift, anti-crop height clamping (`y >= 82`), 3-point golden-hour lighting, and horizon fog.
7. **`TerrainMesh.tsx`** — Use `createElevationSampler()` + `<TerrainMesh />` for vertex-colored cartographic relief, contour lines, rivers, grid, and T4-optimized instanced forests.
8. **`TroopUnit.tsx`** — Render `battleData.units` with smooth eased waypoints, obsidian side rims, depletion scaling, and deterministic combat sparks.
9. **`unitTextureGenerator.ts`** — Used automatically by `TroopUnit.tsx` to render Roman-to-Modern weapon/unit silhouettes (Sword, Shield+Sword, Spears, Triple Phalanx, Bow & Arrow, Horse+Weapon badges, War Elephant, Crossed Muskets, Field Cannon, Tank, Aircraft, Crown) instead of abstract `X` icons.
10. **`TacticalArrow.tsx`** — Render `battleData.arrows` as zero-overhang *HistoryMarche* flat ribbon arrows (`durationFrames <= 60`, max 1–2 per phase, triggered **35–50 frames BEFORE** troops march).
11. **`MapLabels3D.tsx`** — Place `<MapLabels3D />` inside `<ThreeCanvas>` for GPU sprite callouts over named rivers/hills and moving `commander` units.
12. **`BattleHud.tsx`** — Place `<BattleHud battle={battleData} />` beside `<ThreeCanvas>` for YouTube Shorts 9:16 safe-zone framing (`top: 155`, `bottom: 390`, `left: 60`, `right: 140`), docking title card, live tug-of-war strength bar, phase captions, and source credits.
13. **`BattleAudioMixer.tsx`** — Place `<BattleAudioMixer battle={battleData} enabled={false} />` in `index.tsx` (set `enabled={true}` when `.mp3` SFX files are present in `public/audio/battle/`).

---

## 7. Camera & Tactical Pacing Rules
- **Mandatory Full-Battle Opening (0% to 25% of frames):** Start with a wide establishing shot (`y >= 130`, `fov = 45`) showing 100% of both armies and terrain features inside the 9:16 frame.
- **No Unnecessary Zooms:** Allow at most **one** deliberate slow zoom (`y >= 85`) during the decisive climax, followed by a smooth pull-back to the wide overview in the final 15% of frames.
- **Strategy-First Arrow Pacing ("Plan -> Pause -> Execute"):** Trigger 1–2 arrows **35–50 frames BEFORE** troops move, hold for `<= 60` frames (2.0s max), and fade out cleanly before blocks advance.
