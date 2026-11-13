import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import {COLORS, FONT_STACK, SAFE} from "../theme";
import {anim, easeOutQuart, seeded} from "../lib/anim";
import {CityGrid} from "../components/CityGrid";
import {TechnicalLabel} from "../components/TechnicalLabel";
import {AssetCard, BuildingIcon, VehicleIcon, TextureIcon, ObjectIcon} from "../components/AssetCard";
import {DataPipeline, pipelinePoint} from "../components/DataPipeline";
import {SceneTransition} from "../components/SceneTransition";

// Scene 2 — Asset streaming (12.0–25.4s).
// A top-down city with a glowing player marker and an ACTIVE AREA circle.
// Asset cards stream from a dock into a RAM container; older data is
// released as new data arrives. The camera zooms into a building at the end.
const DOCKS = [
  {x: 620, y: 360},
  {x: 620, y: 478},
  {x: 620, y: 596},
  {x: 620, y: 714},
];
const RAM_ENTRY = {x: 420, y: 1300};
const SLOT_COUNT = 6;
const FLY_DURATION = 24;
const ARRIVAL_START = 110;
const ARRIVAL_STEP = 34;
const ARRIVAL_COUNT = 8; // arrivals k = 0..7
const ZOOM_START = 374;

const CARD_DEFS = [
  {label: "BUILDINGS", icon: <BuildingIcon color={COLORS.cyan} />},
  {label: "VEHICLES", icon: <VehicleIcon color={COLORS.cyan} />},
  {label: "TEXTURES", icon: <TextureIcon color={COLORS.cyan} />},
  {label: "OBJECTS", icon: <ObjectIcon color={COLORS.cyan} />},
];

export const Scene2Streaming: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const assemble = anim(frame, [2, 52], [0, 1]);
  const areaExpand = anim(frame, [50, 82], [0.12, 1], easeOutQuart);
  const areaOpacity = anim(frame, [52, 70], [0, 1]);
  const activeRadius = 0.34 * areaExpand;

  // Player marker drifts through the city; the active area follows it.
  const marker = {
    x: 0.5 + 0.16 * Math.sin(frame / 58),
    y: 0.47 + 0.13 * Math.sin(frame / 41 + 1.2),
  };

  // Camera zoom into one building at the end of the scene.
  const zoom = anim(frame, [ZOOM_START, durationInFrames], [1, 5.6]);
  const chromeOut = anim(frame, [362, 378], [1, 0]); // cards + RAM fade

  // Slot occupancy: simulate the arrival history up to the current frame.
  const arrivals: {k: number; at: number}[] = [];
  for (let k = 0; k < ARRIVAL_COUNT; k++) {
    const at = ARRIVAL_START + k * ARRIVAL_STEP + FLY_DURATION;
    if (frame >= at) arrivals.push({k, at});
  }

  const ramSlots = Array.from({length: SLOT_COUNT}).map((_, slot) => {
    const forSlot = arrivals.filter((a) => a.k % SLOT_COUNT === slot);
    if (forSlot.length === 0) return {state: "empty" as const};
    const last = forSlot[forSlot.length - 1];
    const nextArrival = ARRIVAL_START + (last.k + SLOT_COUNT) * ARRIVAL_STEP + FLY_DURATION;
    const released = frame >= nextArrival ? nextArrival : null;
    return {state: "filled" as const, cardIndex: last.k % 4, filledAt: last.at, releasedAt: released};
  });

  const flying = Array.from({length: ARRIVAL_COUNT}).map((_, k) => {
    const start = ARRIVAL_START + k * ARRIVAL_STEP;
    const t = (frame - start) / FLY_DURATION;
    return {k, t, cardIndex: k % 4, start};
  }).filter((f) => f.t > 0 && f.t < 1);

  const dockedDim = (cardIndex: number): number => {
    const isFlying = flying.some((f) => f.cardIndex === cardIndex);
    return isFlying ? 0.18 : 1;
  };

  return (
    <SceneTransition durationInFrames={durationInFrames} fadeIn={10}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: COLORS.background,
          fontFamily: FONT_STACK,
          overflow: "hidden",
        }}
      >
        <TechnicalLabel text="Asset streaming" delay={8} accent={COLORS.cyan} size={30} style={{position: "absolute", left: SAFE.x, top: 200}} />

        {/* City block (camera zooms in at the end) */}
        <div
          style={{
            position: "absolute",
            left: SAFE.x,
            top: 320,
            width: SAFE.w,
            height: 780,
            transform: `scale(${zoom}) translate(${Math.sin(frame / 95) * 12}px, ${
              Math.cos(frame / 75) * 9
            }px)`,
            transformOrigin: "58% 52%",
          }}
        >
          <CityGrid
            width={SAFE.w}
            height={780}
            cols={6}
            rows={6}
            marker={marker}
            activeRadius={activeRadius}
            assemble={assemble}
            showMarker={frame > 18}
            showActiveArea={frame > 50}
            markerOpacity={anim(frame, [18, 30], [0, 1]) * (frame > 50 ? 1 : 1)}
          />
          {/* ACTIVE AREA label tracks the circle */}
          {frame > 62 ? (
            <div
              style={{
                position: "absolute",
                left: Math.max(20, Math.min(560, marker.x * SAFE.w - 90)),
                top: Math.max(0, (marker.y - activeRadius) * 780 - 44),
                opacity: areaOpacity,
              }}
            >
              <span
                style={{
                  fontFamily: FONT_STACK,
                  fontWeight: 600,
                  fontSize: 24,
                  letterSpacing: "0.22em",
                  color: COLORS.cyan,
                }}
              >
                ACTIVE AREA
              </span>
            </div>
          ) : null}
        </div>

        {/* Asset card dock */}
        <div style={{opacity: chromeOut}}>
          {CARD_DEFS.map((card, i) => (
            <AssetCard
              key={card.label}
              label={card.label}
              icon={card.icon}
              accent={COLORS.cyan}
              width={300}
              height={96}
              dim={dockedDim(i) < 1}
              opacity={anim(frame, [62 + i * 13, 76 + i * 13], [0, 1]) * dockedDim(i)}
              style={{left: DOCKS[i].x, top: DOCKS[i].y}}
            />
          ))}

          {/* Flying cards + data pipelines */}
          {flying.map((f) => {
            const pt = pipelinePoint(DOCKS[f.cardIndex], RAM_ENTRY, f.t);
            const angle = seeded(f.k, 3);
            return (
              <React.Fragment key={f.k}>
                <DataPipeline
                  from={DOCKS[f.cardIndex]}
                  to={RAM_ENTRY}
                  color={COLORS.cyan}
                  drawProgress={Math.min(1, f.t * 1.2)}
                  flowProgress={f.t}
                  width={1080}
                  opacity={chromeOut}
                />
                <AssetCard
                  label={CARD_DEFS[f.cardIndex].label}
                  icon={CARD_DEFS[f.cardIndex].icon}
                  accent={COLORS.cyan}
                  width={280}
                  height={92}
                  style={{
                    left: pt.x - 20,
                    top: pt.y - 46,
                    transform: `rotate(${(angle - 0.5) * 10 * f.t}deg) scale(${1 - f.t * 0.12})`,
                  }}
                />
              </React.Fragment>
            );
          })}

          {/* RAM container */}
          <div
            style={{
              position: "absolute",
              left: SAFE.x,
              top: 1330,
              width: SAFE.w,
              height: 300,
              borderRadius: 20,
              border: `1.5px solid ${COLORS.border}`,
              backgroundColor: COLORS.panel,
              opacity: anim(frame, [90, 112], [0, 1]),
              padding: "26px 30px",
            }}
          >
            <div style={{display: "flex", alignItems: "center", gap: 12, marginBottom: 26}}>
              <div style={{width: 12, height: 12, borderRadius: 3, backgroundColor: COLORS.cyan}} />
              <span
                style={{
                  fontFamily: FONT_STACK,
                  fontWeight: 800,
                  fontSize: 34,
                  letterSpacing: "0.24em",
                  color: COLORS.text,
                }}
              >
                RAM
              </span>
            </div>
            <div style={{display: "flex", gap: 20}}>
              {ramSlots.map((slot, i) => {
                if (slot.state === "empty") {
                  return (
                    <div
                      key={i}
                      style={{
                        width: 112,
                        height: 112,
                        borderRadius: 12,
                        border: `1.5px dashed ${COLORS.border}`,
                      }}
                    />
                  );
                }
                const releasedFade = slot.releasedAt
                  ? anim(frame, [slot.releasedAt, slot.releasedAt + 10], [1, 0])
                  : 1;
                const def = CARD_DEFS[slot.cardIndex];
                return (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      width: 112,
                      height: 112,
                      borderRadius: 12,
                      border: `1.5px solid ${COLORS.cyan}`,
                      backgroundColor: "rgba(72, 200, 232, 0.12)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: releasedFade,
                      transform: `scale(${releasedFade})`,
                    }}
                  >
                    {def.icon}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Streaming label */}
          <div style={{position: "absolute", left: 0, right: 0, top: 1680, display: "flex", justifyContent: "center", opacity: anim(frame, [130, 150], [0, 1]) * chromeOut}}>
            <TechnicalLabel text="Load what is needed · release the rest" delay={0} size={26} />
          </div>
        </div>
      </div>
    </SceneTransition>
  );
};
