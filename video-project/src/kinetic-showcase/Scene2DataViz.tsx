import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {FONT_BODY, FONT_DISPLAY} from "./fonts";
import {KINETIC_COLORS as C, kineticGlass} from "./theme";

type Pt = {x: number; y: number};

// Catmull-Rom → cubic bezier for a smooth line through the data points.
const smoothPath = (pts: Pt[]): string => {
  if (pts.length < 2) {
    return "";
  }
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 2] ?? pts[i - 1];
    const p1 = pts[i - 1];
    const p2 = pts[i];
    const p3 = pts[i + 1] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
};

const W = 880;
const H = 460;
const RAW = [0.18, 0.34, 0.28, 0.52, 0.45, 0.68, 0.6, 0.82, 0.74, 0.96];
const POINTS: Pt[] = RAW.map((v, i) => ({
  x: 40 + i * ((W - 80) / (RAW.length - 1)),
  y: 420 - v * 360,
}));
const LINE_D = smoothPath(POINTS);
const AREA_D = `${LINE_D} L ${POINTS[POINTS.length - 1].x} 430 L ${POINTS[0].x} 430 Z`;

// Counting number that springs up and eases to its target.
const Counter: React.FC<{
  target: number;
  decimals?: number;
  delay: number;
  fontSize: number;
  color: string;
}> = ({target, decimals = 0, delay, fontSize, color}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const s = spring({
    frame,
    fps,
    config: {damping: 18, stiffness: 90},
    delay,
  });
  const value = interpolate(s, [0, 1], [0, target], {
    easing: Easing.out(Easing.cubic),
  });

  return (
    <span
      style={{
        fontFamily: FONT_DISPLAY,
        fontWeight: 800,
        fontSize,
        color,
        textShadow: `0 0 26px ${color}66`,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value.toFixed(decimals)}
    </span>
  );
};

const StatCard: React.FC<{
  label: string;
  target: number;
  decimals?: number;
  suffix: string;
  delay: number;
  accent: string;
}> = ({label, target, decimals = 0, suffix, delay, accent}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const s = spring({
    frame,
    fps,
    config: {damping: 15, stiffness: 110},
    delay,
  });

  return (
    <div
      style={{
        ...kineticGlass,
        flex: 1,
        padding: "34px 22px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        opacity: interpolate(s, [0, 1], [0, 1]),
        translate: `0px ${interpolate(s, [0, 1], [70, 0])}px`,
        scale: interpolate(s, [0, 1], [0.85, 1]),
        borderTop: `2px solid ${accent}88`,
      }}
    >
      <div style={{display: "flex", alignItems: "baseline", gap: 4}}>
        <Counter
          target={target}
          decimals={decimals}
          delay={delay + 6}
          fontSize={54}
          color={accent}
        />
        <span
          style={{
            fontFamily: FONT_BODY,
            fontWeight: 700,
            fontSize: 30,
            color: accent,
          }}
        >
          {suffix}
        </span>
      </div>
      <div
        style={{
          fontFamily: FONT_BODY,
          fontWeight: 500,
          fontSize: 22,
          letterSpacing: 3,
          color: C.dim,
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
};

const MiniBars: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const heights = [0.35, 0.55, 0.42, 0.7, 0.6, 0.85, 0.75, 1.0];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 26,
        height: 190,
      }}
    >
      {heights.map((h, i) => {
        const s = spring({
          frame,
          fps,
          config: {damping: 13, stiffness: 130},
          delay: 96 + i * 4,
        });

        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: interpolate(s, [0, 1], [0, h * 190]),
              borderRadius: 8,
              background: `linear-gradient(to top, ${C.violet}44, ${C.cyan})`,
              boxShadow: `0 0 22px rgba(0,240,255,0.35)`,
              opacity: interpolate(s, [0, 1], [0, 1]),
            }}
          />
        );
      })}
    </div>
  );
};

const Scene2DataViz: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // Line-drawing progress via SVG pathLength normalization.
  const draw = interpolate(frame, [12, 88], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.inOut(Easing.cubic),
  });
  const dashOffset = interpolate(draw, [0, 1], [1, 0]);

  const areaIn = interpolate(frame, [78, 108], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const headSpring = spring({
    frame,
    fps,
    config: {damping: 16, stiffness: 130},
    delay: 92,
  });
  const titleSpring = spring({
    frame,
    fps,
    config: {damping: 15, stiffness: 110},
    delay: 2,
  });

  const entry = interpolate(frame, [0, 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitBlack = interpolate(frame, [198, 219], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        backgroundImage: `radial-gradient(55% 35% at 50% 30%, rgba(0,240,255,0.09), transparent 70%), radial-gradient(50% 30% at 50% 85%, rgba(123,97,255,0.12), transparent 70%)`,
      }}
    >
      <AbsoluteFill
        style={{
          opacity: entry,
          padding: "120px 70px 90px",
          display: "flex",
          flexDirection: "column",
          gap: 54,
        }}
      >
        {/* Header */}
        <div>
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: 8,
              color: C.lime,
              opacity: interpolate(frame, [8, 26], [0, 1], {
                extrapolateLeft: "clamp",
                extrapolateRight: "clamp",
              }),
            }}
          >
            DATA // 02
          </div>
          <div
            style={{
              marginTop: 14,
              fontFamily: FONT_DISPLAY,
              fontWeight: 800,
              fontSize: 84,
              color: C.white,
              textShadow: `0 0 30px rgba(0,240,255,0.5)`,
              opacity: interpolate(titleSpring, [0, 1], [0, 1]),
              translate: `0px ${interpolate(titleSpring, [0, 1], [60, 0])}px`,
            }}
          >
            PERFORMANCE INDEX
          </div>
        </div>

        {/* Chart panel */}
        <div
          style={{
            ...kineticGlass,
            padding: "36px 26px 26px",
          }}
        >
          <svg
            width="100%"
            viewBox={`0 0 ${W} ${H}`}
            style={{overflow: "visible", display: "block"}}
          >
            <defs>
              <linearGradient id="ks-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.cyan} stopOpacity={0.42} />
                <stop offset="100%" stopColor={C.cyan} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ks-line" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={C.cyan} />
                <stop offset="60%" stopColor={C.violet} />
                <stop offset="100%" stopColor={C.magenta} />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0, 0.25, 0.5, 0.75, 1].map((g) => (
              <line
                key={g}
                x1={40}
                x2={W - 40}
                y1={420 - g * 360}
                y2={420 - g * 360}
                stroke="rgba(140,170,255,0.18)"
                strokeDasharray="6 10"
                strokeWidth={2}
                opacity={interpolate(frame, [6, 30], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                })}
              />
            ))}

            {/* Area under the curve */}
            <path
              d={AREA_D}
              fill="url(#ks-area)"
              opacity={areaIn}
            />

            {/* The drawn line */}
            <path
              d={LINE_D}
              fill="none"
              stroke="url(#ks-line)"
              strokeWidth={7}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={dashOffset}
              style={{
                filter: `drop-shadow(0 0 12px rgba(0,240,255,0.75))`,
              }}
            />

            {/* Glowing head dot riding the final point */}
            <circle
              cx={POINTS[POINTS.length - 1].x}
              cy={POINTS[POINTS.length - 1].y}
              r={interpolate(headSpring, [0, 1], [0, 12])}
              fill={C.magenta}
              opacity={interpolate(headSpring, [0, 1], [0, 1])}
              style={{
                filter: `drop-shadow(0 0 16px ${C.magenta})`,
              }}
            />
          </svg>
        </div>

        {/* Glassmorphic stat cards */}
        <div style={{display: "flex", gap: 22}}>
          <StatCard
            label="UPTIME"
            target={99.9}
            decimals={1}
            suffix="%"
            delay={104}
            accent={C.cyan}
          />
          <StatCard
            label="RENDER GAIN"
            target={38}
            suffix="%"
            delay={114}
            accent={C.lime}
          />
          <StatCard
            label="PEAK GPU LOAD"
            target={64}
            suffix="%"
            delay={124}
            accent={C.magenta}
          />
        </div>

        {/* Mini throughput bars */}
        <div
          style={{
            ...kineticGlass,
            padding: "28px 30px 30px",
          }}
        >
          <div
            style={{
              fontFamily: FONT_BODY,
              fontWeight: 500,
              fontSize: 20,
              letterSpacing: 5,
              color: C.dim,
              marginBottom: 22,
            }}
          >
            THROUGHPUT / 8 NODES
          </div>
          <MiniBars />
        </div>
      </AbsoluteFill>

      {/* Exit to black */}
      <AbsoluteFill style={{backgroundColor: "#000", opacity: exitBlack}} />
    </AbsoluteFill>
  );
};

export {Scene2DataViz};
