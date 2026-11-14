import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {FONT_BODY, FONT_DISPLAY} from "./fonts";
import {KINETIC_COLORS as C} from "./theme";

// Endlessly scrolling neon wireframe plane, tilted in perspective.
const GridPlane: React.FC<{flip?: boolean}> = ({flip}) => {
  const frame = useCurrentFrame();

  const fadeOut = interpolate(frame, [205, 245], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: "-45%",
        right: "-45%",
        height: "62%",
        top: flip ? "-22%" : "60%",
        transform: `perspective(950px) rotateX(${flip ? -70 : 70}deg)`,
        backgroundImage: `linear-gradient(rgba(0,240,255,0.32) 2px, transparent 2px), linear-gradient(90deg, rgba(123,97,255,0.32) 2px, transparent 2px)`,
        backgroundSize: "96px 96px",
        backgroundPosition: `0 ${flip ? -frame * 6 : frame * 6}px`,
        maskImage: `linear-gradient(to ${flip ? "top" : "bottom"}, transparent, black 34%, black 72%, transparent)`,
        WebkitMaskImage: `linear-gradient(to ${flip ? "top" : "bottom"}, transparent, black 34%, black 72%, transparent)`,
        opacity: fadeOut,
      }}
    />
  );
};

// A sweeping neon scan bar looping down the frame.
const ScanBar: React.FC = () => {
  const frame = useCurrentFrame();
  const loop = 84;
  const t = (frame % loop) / loop;
  const y = interpolate(t, [0, 1], [-40, 1960]);

  return (
    <AbsoluteFill
      style={{
        opacity: interpolate(t, [0, 0.12, 0.88, 1], [0, 1, 1, 0]),
      }}
    >
      <div
        style={{
          position: "absolute",
          top: y,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, transparent, ${C.cyan}, ${C.magenta}, transparent)`,
          boxShadow: `0 0 24px ${C.cyan}, 0 0 70px rgba(255,43,214,0.55)`,
        }}
      />
    </AbsoluteFill>
  );
};

// Corner HUD brackets + status readout.
const Hud: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const s = spring({
    frame,
    fps,
    config: {damping: 20, stiffness: 110},
    delay: 20,
  });
  const opacity = interpolate(s, [0, 1], [0, 1]);
  const bracket = {
    position: "absolute" as const,
    width: 70,
    height: 70,
    opacity,
  };

  return (
    <AbsoluteFill>
      <div
        style={{
          ...bracket,
          top: 96,
          left: 96,
          borderTop: `2px solid ${C.cyan}`,
          borderLeft: `2px solid ${C.cyan}`,
        }}
      />
      <div
        style={{
          ...bracket,
          top: 96,
          right: 96,
          borderTop: `2px solid ${C.cyan}`,
          borderRight: `2px solid ${C.cyan}`,
        }}
      />
      <div
        style={{
          ...bracket,
          bottom: 96,
          left: 96,
          borderBottom: `2px solid ${C.magenta}`,
          borderLeft: `2px solid ${C.magenta}`,
        }}
      />
      <div
        style={{
          ...bracket,
          bottom: 96,
          right: 96,
          borderBottom: `2px solid ${C.magenta}`,
          borderRight: `2px solid ${C.magenta}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 118,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: FONT_BODY,
          fontWeight: 500,
          fontSize: 26,
          letterSpacing: 10,
          color: C.dim,
          opacity: interpolate(frame, [30, 55], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        SYS.KINETIC — 1080×1920 / 30FPS
      </div>
    </AbsoluteFill>
  );
};

// Title letters slamming in with spring physics, staggered per glyph.
const KineticTitle: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const letters = "KINETIC".split("");

  const underline = spring({
    frame,
    fps,
    config: {damping: 14, stiffness: 120},
    delay: 48,
  });

  return (
    <div style={{textAlign: "center"}}>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {letters.map((letter, i) => {
          const letterSpring = spring({
            frame,
            fps,
            config: {damping: 11, stiffness: 155, mass: 0.9},
            delay: 14 + i * 4,
          });
          const accent = i === 4;

          return (
            <span
              key={`${letter}-${i}`}
              style={{
                fontFamily: FONT_DISPLAY,
                fontWeight: 900,
                fontSize: 160,
                lineHeight: 1.05,
                color: accent ? C.magenta : C.white,
                opacity: interpolate(letterSpring, [0, 1], [0, 1]),
                translate: `0px ${interpolate(letterSpring, [0, 1], [150, 0])}px`,
                scale: interpolate(letterSpring, [0, 1], [1.7, 1]),
                textShadow: accent
                  ? `0 0 28px rgba(255,43,214,0.9), 0 0 90px rgba(255,43,214,0.5)`
                  : `0 0 26px rgba(0,240,255,0.75), 0 0 90px rgba(123,97,255,0.45)`,
              }}
            >
              {letter}
            </span>
          );
        })}
      </div>

      {/* Neon underline that snaps in */}
      <div
        style={{
          marginTop: 22,
          height: 8,
          width: interpolate(underline, [0, 1], [0, 720]),
          marginLeft: "auto",
          marginRight: "auto",
          borderRadius: 4,
          background: `linear-gradient(90deg, ${C.cyan}, ${C.violet}, ${C.magenta})`,
          boxShadow: `0 0 30px rgba(0,240,255,0.7)`,
        }}
      />
    </div>
  );
};

const Scene1GridIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Spring-in subtitle with tightening letter tracking.
  const subSpring = spring({
    frame,
    fps,
    config: {damping: 16, stiffness: 100},
    delay: 46,
  });

  // Brief white entry flash + exit to black for a hard rhythmic cut.
  const flash = interpolate(frame, [0, 9], [0.65, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitBlack = interpolate(frame, [228, 249], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        backgroundImage: `radial-gradient(60% 40% at 50% 46%, rgba(123,97,255,0.16), transparent 70%), radial-gradient(40% 30% at 50% 100%, rgba(0,240,255,0.12), transparent 70%)`,
        overflow: "hidden",
      }}
    >
      <GridPlane />
      <GridPlane flip />
      <ScanBar />

      {/* Central stack */}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{marginTop: -140}}>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 700,
              fontSize: 34,
              letterSpacing: interpolate(subSpring, [0, 1], [42, 14]),
              color: C.cyan,
              textAlign: "center",
              opacity: interpolate(subSpring, [0, 1], [0, 1]),
              marginBottom: 34,
              textShadow: `0 0 18px rgba(0,240,255,0.8)`,
            }}
          >
            MOTION SYSTEM
          </div>

          <KineticTitle />

          <div
            style={{
              marginTop: 40,
              fontFamily: FONT_BODY,
              fontWeight: 500,
              fontSize: 32,
              letterSpacing: 8,
              color: C.dim,
              textAlign: "center",
              opacity: interpolate(frame, [70, 100], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            GRAPHIC DESIGN SHOWCASE
          </div>
        </div>
      </AbsoluteFill>

      <Hud />

      {/* Entry flash */}
      <AbsoluteFill style={{backgroundColor: C.white, opacity: flash}} />
      {/* Exit to black */}
      <AbsoluteFill style={{backgroundColor: "#000", opacity: exitBlack}} />
    </AbsoluteFill>
  );
};

export {Scene1GridIntro};
