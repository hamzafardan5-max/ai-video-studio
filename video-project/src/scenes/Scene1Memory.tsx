import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import {COLORS, FONT_STACK, SAFE} from "../theme";
import {anim, easeOutQuart} from "../lib/anim";
import {BigNumber} from "../components/BigNumber";
import {MemoryMeter} from "../components/MemoryMeter";
import {TechnicalLabel} from "../components/TechnicalLabel";
import {SceneTransition} from "../components/SceneTransition";

// Scene 1 — Memory limitation (0–12s).
// Yellow line draws, "512 MB" appears, both consoles slide in with their
// memory meters, squares fill, then the caption. Squares break apart at the
// end and are replaced by the city grid in scene 2.
const ConsolePanel: React.FC<{
  readonly name: string;
  readonly accent: string;
  readonly delay: number;
  readonly from: "left" | "right";
  readonly children: React.ReactNode;
}> = ({name, accent, delay, from, children}) => {
  const frame = useCurrentFrame();
  const slide = anim(frame, [delay, delay + 18], [from === "left" ? -70 : 70, 0], easeOutQuart);
  const opacity = anim(frame, [delay, delay + 14], [0, 1]);

  return (
    <div
      style={{
        opacity,
        transform: `translateX(${slide}px)`,
        display: "flex",
        flexDirection: "column",
        gap: 22,
      }}
    >
      <div style={{display: "flex", alignItems: "center", gap: 14}}>
        <div style={{width: 12, height: 12, borderRadius: 3, backgroundColor: accent}} />
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 800,
            fontSize: 40,
            letterSpacing: "0.14em",
            color: COLORS.text,
          }}
        >
          {name}
        </span>
      </div>
      {children}
    </div>
  );
};

export const Scene1Memory: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  const lineWidth = anim(frame, [4, 30], [0, SAFE.w], easeOutQuart);
  const headlineOut = anim(frame, [330, 356], [1, 0.55]);

  return (
    <SceneTransition durationInFrames={durationInFrames} fadeIn={8}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: COLORS.background,
          fontFamily: FONT_STACK,
        }}
      >
        {/* Subtle continuous camera drift */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateY(${Math.sin(frame / 85) * 10}px) scale(${1 + 0.012 * Math.sin(frame / 140)})`,
          }}
        >
        <TechnicalLabel text="GTA V · LOS SANTOS" delay={6} accent={COLORS.yellow} size={28} style={{position: "absolute", left: SAFE.x, top: 200}} />

        {/* Thin yellow line drawing across the screen */}
        <svg
          width={SAFE.w}
          height={4}
          style={{position: "absolute", left: SAFE.x, top: 290, overflow: "visible"}}
        >
          <line
            x1="0"
            y1="2"
            x2={lineWidth}
            y2="2"
            stroke={COLORS.yellow}
            strokeWidth="3"
          />
        </svg>

        {/* Enormous memory figure */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 350,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            opacity: headlineOut,
          }}
        >
          {/* Soft glow pulsing behind the figure */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: -60,
              width: 760,
              height: 480,
              transform: "translateX(-50%)",
              background:
                "radial-gradient(closest-side, rgba(242, 201, 76, 0.12), transparent)",
              opacity: 0.65 + 0.35 * Math.sin(frame / 18),
              pointerEvents: "none",
            }}
          />
          <BigNumber value="512" unit="MB" delay={30} fontSize={330} />
          <TechnicalLabel text="Total memory · each console" delay={58} size={28} />
        </div>

        {/* Console hardware labels + memory meters */}
        <div
          style={{
            position: "absolute",
            left: SAFE.x,
            right: SAFE.x,
            top: 850,
            display: "flex",
            flexDirection: "column",
            gap: 90,
          }}
        >
          <ConsolePanel name="PLAYSTATION 3" accent={COLORS.yellow} delay={80} from="left">
            <MemoryMeter
              width={SAFE.w}
              delay={98}
              fillStart={140}
              fillEnd={250}
              scatterStart={330}
              segments={[
                {label: "MAIN · 256 MB", squares: 16, color: COLORS.yellow},
                {label: "GRAPHICS · 256 MB", squares: 16, color: COLORS.cyan},
              ]}
            />
          </ConsolePanel>

          <ConsolePanel name="XBOX 360" accent={COLORS.cyan} delay={100} from="right">
            <MemoryMeter
              width={SAFE.w}
              delay={118}
              fillStart={165}
              fillEnd={262}
              scatterStart={334}
              segments={[{label: "UNIFIED · 512 MB", squares: 32, color: COLORS.yellow}]}
            />
          </ConsolePanel>
        </div>

        {/* Caption */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 1620,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <TechnicalLabel
            text="Limited memory budget"
            delay={296}
            accent={COLORS.yellow}
            color={COLORS.text}
            size={32}
            slide={-14}
          />
        </div>
        </div>
      </div>
    </SceneTransition>
  );
};
