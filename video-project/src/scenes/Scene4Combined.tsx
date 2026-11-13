import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import {COLORS, FONT_STACK, SAFE} from "../theme";
import {anim, easeOutQuart} from "../lib/anim";
import {DepthCityGrid} from "../components/CityGrid";
import {AssetCard, DatabaseIcon, LayersIcon} from "../components/AssetCard";
import {DataPipeline} from "../components/DataPipeline";
import {TechnicalLabel} from "../components/TechnicalLabel";
import {SceneTransition} from "../components/SceneTransition";

// Scene 4 — Combined optimisation (39.2–54.0s).
// Two cards enter from opposite sides (ASSET STREAMING / MEMORY and
// LEVEL OF DETAIL / GPU), connected by an animated data line. Behind them the
// city grid reconstructs and expands: detailed buildings near the viewer,
// simplified ones farther away. The cards fade, the final headline appears,
// holds, and the scene fades to black.
export const Scene4Combined: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // Slow camera push while the city reconstructs and expands.
  const push = anim(frame, [0, 300], [1.1, 1], easeOutQuart);
  const cityIn = anim(frame, [2, 80], [0, 1]);

  const card1X = anim(frame, [22, 50], [-420, SAFE.x], easeOutQuart);
  const card1In = anim(frame, [22, 42], [0, 1]);
  const card2X = anim(frame, [50, 80], [1080 + 420, 552], easeOutQuart);
  const card2In = anim(frame, [50, 70], [0, 1]);
  const cardsOut = anim(frame, [240, 272], [1, 0]);

  const pipelineDraw = anim(frame, [110, 150], [0, 1]);
  const pipelineFlow = anim(frame, [110, 240], [0, 4]);
  const pipelineOpacity = anim(frame, [110, 126], [0, 1]) * anim(frame, [230, 250], [1, 0]);

  const headlineIn1 = anim(frame, [272, 296], [0, 1], easeOutQuart);
  const headlineIn2 = anim(frame, [292, 318], [0, 1], easeOutQuart);
  const dimmer = anim(frame, [240, 290], [0, 0.45]);
  const tracking = anim(frame, [272, 310], [0.06, -0.01], easeOutQuart);
  const sweepX = anim(frame, [292, 338], [-320, 1240]);
  const sweepOpacity = anim(frame, [290, 300], [0, 1]) * anim(frame, [330, 348], [1, 0]);

  return (
    <SceneTransition
      durationInFrames={durationInFrames}
      fadeIn={10}
      blackOut={{start: 416, frames: 24}}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: COLORS.background,
          fontFamily: FONT_STACK,
          overflow: "hidden",
        }}
      >
        {/* Reconstructed city, expanding across the frame */}
        <div
          style={{
            position: "absolute",
            left: -40,
            top: 380,
            width: 1160,
            height: 1500,
            transform: `scale(${push})`,
            transformOrigin: "50% 80%",
            opacity: cityIn,
          }}
        >
          <DepthCityGrid width={1160} height={1400} rows={6} cols={7} assemble={cityIn} />
        </div>

        {/* Top label */}
        <TechnicalLabel text="Working together" delay={6} accent={COLORS.yellow} size={30} style={{position: "absolute", left: SAFE.x, top: 200}} />

        {/* Dimmer for the headline phase */}
        <div style={{position: "absolute", inset: 0, backgroundColor: COLORS.background, opacity: dimmer, pointerEvents: "none"}} />

        {/* Connector between the two cards */}
        <DataPipeline
          from={{x: 524, y: 630}}
          to={{x: 556, y: 790}}
          color={COLORS.yellow}
          drawProgress={pipelineDraw}
          flowProgress={pipelineFlow}
          width={1080}
          opacity={pipelineOpacity * cardsOut}
          packets={4}
        />

        {/* Card 1 — asset streaming (memory) */}
        <div style={{position: "absolute", left: card1X, top: 540, opacity: card1In * cardsOut}}>
          <AssetCard
            label="ASSET STREAMING"
            sublabel="MEMORY"
            icon={<DatabaseIcon color={COLORS.cyan} />}
            accent={COLORS.cyan}
            width={420}
            height={140}
          />
        </div>

        {/* Card 2 — level of detail (GPU) */}
        <div style={{position: "absolute", left: card2X, top: 720, opacity: card2In * cardsOut}}>
          <AssetCard
            label="LEVEL OF DETAIL"
            sublabel="GPU"
            icon={<LayersIcon color={COLORS.yellow} />}
            accent={COLORS.yellow}
            width={420}
            height={140}
          />
        </div>

        {/* Final headline */}
        <div
          style={{
            position: "absolute",
            left: SAFE.x,
            right: SAFE.x,
            top: 1240,
            display: "flex",
            flexDirection: "column",
            gap: 26,
          }}
        >
          <span
            style={{
              fontFamily: FONT_STACK,
              fontWeight: 900,
              fontSize: 88,
              lineHeight: 1.08,
              letterSpacing: `${tracking}em`,
              color: COLORS.text,
              opacity: headlineIn1,
              transform: `translateY(${(1 - headlineIn1) * 30}px)`,
            }}
          >
            A HUGE WORLD.
          </span>
          <span
            style={{
              fontFamily: FONT_STACK,
              fontWeight: 900,
              fontSize: 88,
              lineHeight: 1.08,
              letterSpacing: `${tracking}em`,
              color: COLORS.yellow,
              opacity: headlineIn2,
              transform: `translateY(${(1 - headlineIn2) * 30}px)`,
            }}
          >
            A LIMITED
          </span>
          <span
            style={{
              fontFamily: FONT_STACK,
              fontWeight: 900,
              fontSize: 88,
              lineHeight: 1.08,
              letterSpacing: `${tracking}em`,
              color: COLORS.yellow,
              opacity: headlineIn2,
              transform: `translateY(${(1 - headlineIn2) * 30}px)`,
            }}
          >
            MEMORY BUDGET.
          </span>
          {/* Light sweep across the headline */}
          <div
            style={{
              position: "absolute",
              left: -30,
              top: -30,
              width: 960,
              height: 460,
              overflow: "hidden",
              pointerEvents: "none",
              opacity: sweepOpacity,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: -60,
                left: sweepX,
                width: 240,
                height: 560,
                transform: "rotate(14deg)",
                background:
                  "linear-gradient(90deg, transparent, rgba(245, 245, 245, 0.10), transparent)",
              }}
            />
          </div>
        </div>
      </div>
    </SceneTransition>
  );
};
