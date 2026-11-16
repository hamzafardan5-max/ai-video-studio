import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {ThreeCanvas} from "@remotion/three";
import {DataCoreScene} from "./DataCoreScene";
import {CORE_COLORS as C, CORE_FRAMES, CORE_FPS, coreFont} from "./theme";

// ----- Filmic overlay: scanlines + vignette to unify 3D and 2D layers ------

const FilmicOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      backgroundImage:
        "repeating-linear-gradient(to bottom, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 5px)",
      maskImage:
        "radial-gradient(120% 110% at 50% 50%, transparent 55%, black 100%)",
      WebkitMaskImage:
        "radial-gradient(120% 110% at 50% 50%, transparent 55%, black 100%)",
      opacity: 0.5,
    }}
  />
);

// ----- Corner HUD brackets ---------------------------------------------------

const hudCorner: React.CSSProperties = {
  position: "absolute",
  width: 56,
  height: 56,
  borderColor: C.cyan,
  borderStyle: "solid",
  borderWidth: 0,
  opacity: 0.8,
};

const HudFrame: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: "none"}}>
    <div
      style={{
        ...hudCorner,
        top: 60,
        left: 60,
        borderTopWidth: 2,
        borderLeftWidth: 2,
      }}
    />
    <div
      style={{
        ...hudCorner,
        top: 60,
        right: 60,
        borderTopWidth: 2,
        borderRightWidth: 2,
      }}
    />
    <div
      style={{
        ...hudCorner,
        bottom: 60,
        left: 60,
        borderBottomWidth: 2,
        borderLeftWidth: 2,
      }}
    />
    <div
      style={{
        ...hudCorner,
        bottom: 60,
        right: 60,
        borderBottomWidth: 2,
        borderRightWidth: 2,
      }}
    />
  </AbsoluteFill>
);

// ----- Title card (intro + outro reprise) -----------------------------------

const TitleCard: React.FC<{frame: number}> = ({frame}) => {
  const inOpacity = interpolate(frame, [16, 55], [0, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const outOpacity = interpolate(frame, [95, 125], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const reprise = interpolate(frame, [815, 855], [0, 1], {
    extrapolateLeft: "clamp",
  });
  const slide = interpolate(frame, [16, 70], [40, 0], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  const opacity = frame < 400 ? inOpacity * outOpacity : reprise;
  if (opacity <= 0.001) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        transform: `translateY(${slide}px)`,
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: coreFont,
          fontSize: 132,
          fontWeight: 900,
          letterSpacing: "-0.02em",
          color: C.white,
          textShadow: `0 0 40px ${C.cyan}66, 0 0 90px ${C.magenta}44`,
          lineHeight: 1,
        }}
      >
        DATA
      </div>
      <div
        style={{
          fontFamily: coreFont,
          fontSize: 132,
          fontWeight: 900,
          letterSpacing: "0.08em",
          background: `linear-gradient(90deg, ${C.cyan}, ${C.violet}, ${C.magenta})`,
          WebkitBackgroundClip: "text",
          backgroundClip: "text",
          color: "transparent",
          lineHeight: 1.05,
        }}
      >
        CORE
      </div>
      <div
        style={{
          fontFamily: coreFont,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: "0.45em",
          color: C.dim,
          marginTop: 28,
        }}
      >
        NEURAL GRID // SHOWCASE
      </div>
    </div>
  );
};

// ----- Act label -------------------------------------------------------------

const ACTS = [
  {from: 0, to: 250, label: "01 // BOOT SEQUENCE"},
  {from: 250, to: 550, label: "02 // CORE SYNC"},
  {from: 550, to: 820, label: "03 // DEEP FIELD"},
  {from: 820, to: CORE_FRAMES, label: "04 // SHUTDOWN"},
] as const;

const ActLabel: React.FC<{frame: number}> = ({frame}) => {
  const act = ACTS.find((a) => frame >= a.from && frame < a.to);
  if (!act) {
    return null;
  }
  const opacity = interpolate(
    frame,
    [act.from, act.from + 22, act.to - 22, act.to],
    [0, 1, 1, 0],
    {extrapolateLeft: "clamp", extrapolateRight: "clamp"}
  );

  return (
    <div
      style={{
        position: "absolute",
        bottom: 190,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: coreFont,
        fontSize: 34,
        fontWeight: 700,
        letterSpacing: "0.3em",
        color: C.cyan,
        textShadow: `0 0 24px ${C.cyan}88`,
        opacity,
        pointerEvents: "none",
      }}
    >
      {act.label}
    </div>
  );
};

// ----- Live telemetry readouts -----------------------------------------------

const Readouts: React.FC<{frame: number}> = ({frame}) => {
  const t = frame / CORE_FPS;
  const sync = interpolate(frame, [0, 240, 480, 720, CORE_FRAMES], [4, 62, 88, 97, 99], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const throughput = Math.round(420 + 540 * (0.5 + 0.5 * Math.sin(t * 1.3)));
  const latency = (12 + 6 * Math.sin(t * 0.9)).toFixed(1);
  const opacity = interpolate(frame, [40, 80], [0, 1], {extrapolateRight: "clamp"});

  const rows: Array<[string, string]> = [
    ["SYNC", `${sync.toFixed(0)}%`],
    ["THROUGHPUT", `${throughput} TB/s`],
    ["NODES", "2000"],
    ["LATENCY", `${latency} ms`],
  ];

  return (
    <div
      style={{
        position: "absolute",
        top: 160,
        left: 84,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        opacity,
        pointerEvents: "none",
      }}
    >
      {rows.map(([k, v]) => (
        <div key={k} style={{display: "flex", gap: 16, alignItems: "baseline"}}>
          <span
            style={{
              fontFamily: coreFont,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "0.2em",
              color: C.dim,
              width: 190,
            }}
          >
            {k}
          </span>
          <span
            style={{
              fontFamily: coreFont,
              fontSize: 26,
              fontWeight: 800,
              color: C.cyan,
              textShadow: `0 0 16px ${C.cyan}66`,
            }}
          >
            {v}
          </span>
        </div>
      ))}
    </div>
  );
};

// ----- Top status bar ---------------------------------------------------------

const StatusBar: React.FC<{frame: number}> = ({frame}) => {
  const blink = Math.sin((frame / CORE_FPS) * Math.PI * 2 * 2) > -0.4;
  const opacity = interpolate(frame, [20, 50], [0, 1], {extrapolateRight: "clamp"});

  return (
    <div
      style={{
        position: "absolute",
        top: 78,
        left: 84,
        right: 84,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        opacity,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          fontFamily: coreFont,
          fontSize: 28,
          fontWeight: 800,
          letterSpacing: "0.18em",
          color: C.white,
        }}
      >
        DATA<span style={{color: C.magenta}}>//</span>CORE
      </div>
      <div
        style={{
          fontFamily: coreFont,
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: "0.2em",
          color: C.dim,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 999,
            backgroundColor: blink ? C.amber : "rgba(255,176,46,0.25)",
            boxShadow: blink ? `0 0 14px ${C.amber}` : "none",
          }}
        />
        REC · 30FPS
      </div>
    </div>
  );
};

// ----- Bottom progress rail + frame counter -----------------------------------

const ProgressRail: React.FC<{frame: number}> = ({frame}) => {
  const progress = interpolate(frame, [0, CORE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const counter = `${String(frame).padStart(4, "0")} / ${CORE_FRAMES}`;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 92,
        left: 84,
        right: 84,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          height: 6,
          backgroundColor: "rgba(255,255,255,0.08)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${C.cyan}, ${C.violet}, ${C.magenta})`,
            boxShadow: `0 0 14px ${C.cyan}aa`,
          }}
        />
      </div>
      <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
          fontFamily: coreFont,
          fontSize: 20,
          fontWeight: 600,
          letterSpacing: "0.2em",
          color: C.dim,
        }}
      >
        <span>SECTOR 7 // GRID ACTIVE</span>
        <span>F {counter}</span>
      </div>
    </div>
  );
};

// ----- Composition root --------------------------------------------------------

export const ThreeShowcase: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  const fadeIn = interpolate(frame, [0, 22], [0, 1], {extrapolateRight: "clamp"});
  const fadeOut = interpolate(frame, [CORE_FRAMES - 34, CORE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, overflow: "hidden"}}>
      <AbsoluteFill style={{opacity: fadeIn}}>
        <ThreeCanvas
          width={width}
          height={height}
          camera={{fov: 58, near: 0.1, far: 220, position: [0, 0, 26]}}
          gl={{antialias: true, powerPreference: "high-performance"}}
        >
          <DataCoreScene frame={frame} />
        </ThreeCanvas>
      </AbsoluteFill>

      {/* 2D HUD layer */}
      <HudFrame />
      <StatusBar frame={frame} />
      <Readouts frame={frame} />
      <ActLabel frame={frame} />
      <TitleCard frame={frame} />
      <ProgressRail frame={frame} />
      <FilmicOverlay />

      {/* Global fades */}
      <AbsoluteFill
        style={{
          backgroundColor: C.bg,
          opacity: 1 - fadeIn,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{backgroundColor: "#000", opacity: fadeOut, pointerEvents: "none"}}
      />
    </AbsoluteFill>
  );
};
