import React from "react";
import {useCurrentFrame} from "remotion";
import {COLORS, FONT_STACK} from "../theme";
import {BuildingModel, BuildingLabel} from "./BuildingModel";
import {anim, easeInOutCubic, formatNumber, seeded} from "../lib/anim";

// High-detail vs low-detail comparison with a NEAR/FAR distance slider,
// a live polygon counter and a GPU-work bar. `progress` 0..1 drives the
// morph from the detailed to the simplified model (illustrative values).
export const LODComparison: React.FC<{
  readonly progress: number; // 0 = near/detailed, 1 = far/simplified
  readonly width: number;
  readonly sliderOpacity?: number;
}> = ({progress, width, sliderOpacity = 1}) => {
  const frame = useCurrentFrame();
  const p = Math.max(0, Math.min(1, progress));
  const draw = anim(frame, [10, 36], [0, 1]); // outline draw-on at scene start
  const detail = 1 - p * 0.88; // never fully disappears
  const centerSize = width * 0.42;

  const polygons = Math.round(18500 + (1150 - 18500) * p);
  const gpuLoad = 1 - p * 0.72;

  // Reference buildings (static) above the morphing one.
  const refSize = width * 0.26;

  return (
    <div
      style={{
        width,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Reference versions */}
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          padding: "0 8px",
          marginBottom: 10,
        }}
      >
        <div style={{display: "flex", flexDirection: "column", gap: 12, alignItems: "center"}}>
          <BuildingModel width={refSize} detail={1} accent={COLORS.yellow} opacity={0.95} draw={draw} />
          <BuildingLabel text="HIGH DETAIL" accent={COLORS.yellow} />
        </div>
        <div style={{display: "flex", flexDirection: "column", gap: 12, alignItems: "center"}}>
          <BuildingModel width={refSize} detail={0.12} accent={COLORS.cyan} opacity={0.95} draw={draw} />
          <BuildingLabel text="LOW DETAIL" accent={COLORS.cyan} />
        </div>
      </div>

      {/* Morphing building */}
      <div style={{height: centerSize * 1.3, display: "flex", alignItems: "flex-end", marginBottom: 6}}>
        <BuildingModel width={centerSize} detail={detail} accent={COLORS.text} opacity={1} draw={draw} />
      </div>

      {/* NEAR / FAR distance slider */}
      <div
        style={{
          position: "relative",
          width: width * 0.86,
          height: 64,
          marginTop: 26,
          opacity: sliderOpacity,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 30,
            left: 0,
            right: 0,
            height: 3,
            borderRadius: 2,
            backgroundColor: COLORS.border,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 22,
            left: `${p * 96}%`,
            marginLeft: -14,
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: COLORS.yellow,
            transform: "rotate(45deg)",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            fontFamily: FONT_STACK,
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: "0.2em",
            color: p < 0.5 ? COLORS.text : COLORS.textSecondary,
          }}
        >
          NEAR
        </span>
        <span
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            fontFamily: FONT_STACK,
            fontWeight: 600,
            fontSize: 24,
            letterSpacing: "0.2em",
            color: p >= 0.5 ? COLORS.text : COLORS.textSecondary,
          }}
        >
          FAR
        </span>
      </div>

      {/* Polygon counter */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 16,
          marginTop: 30,
        }}
      >
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 800,
            fontSize: 76,
            lineHeight: 1,
            color: COLORS.text,
            fontVariantNumeric: "tabular-nums",
            letterSpacing: "-0.02em",
          }}
        >
          {formatNumber(polygons)}
        </span>
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: "0.22em",
            color: COLORS.textSecondary,
          }}
        >
          POLYGONS
        </span>
      </div>

      {/* GPU work bar */}
      <div style={{width: width * 0.86, marginTop: 24}}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <span
            style={{
              fontFamily: FONT_STACK,
              fontWeight: 600,
              fontSize: 24,
              letterSpacing: "0.2em",
              color: COLORS.textSecondary,
            }}
          >
            GPU WORK
          </span>
          <span
            style={{
              fontFamily: FONT_STACK,
              fontWeight: 700,
              fontSize: 24,
              color: COLORS.yellow,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            −{Math.round(p * 72)}%
          </span>
        </div>
        <div
          style={{
            width: "100%",
            height: 14,
            borderRadius: 7,
            backgroundColor: COLORS.panel,
            border: `1.5px solid ${COLORS.border}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${Math.max(8, gpuLoad * 100)}%`,
              height: "100%",
              borderRadius: 7,
              backgroundColor: COLORS.yellow,
              opacity: 0.85,
            }}
          />
        </div>
      </div>
    </div>
  );
};

// Geometric fragments used for the "model breaks into shapes" transition.
export const LODFragments: React.FC<{
  readonly startFrame: number;
  readonly width: number;
}> = ({startFrame, width}) => {
  const frame = useCurrentFrame();
  const p = anim(frame, [startFrame, startFrame + 32], [0, 1], easeInOutCubic);
  if (p === 0 || p >= 1) return null;

  const fragColors = [COLORS.cyan, COLORS.yellow, COLORS.text, COLORS.border];
  const fragments = Array.from({length: 14}).map((_, i) => {
    const dir = i % 2 === 0 ? -1 : 1; // half fly left, half fly right
    const angle = seeded(i, 11) * Math.PI - Math.PI / 2;
    const dist = (0.5 + seeded(i, 12)) * width * 0.55;
    const x = width / 2 + dir * Math.abs(Math.cos(angle)) * dist * p;
    const y = width * 0.5 + Math.sin(angle) * dist * 0.7 * p;
    const size = 16 + seeded(i, 13) * 30;
    const rot = (seeded(i, 14) - 0.5) * 220 * p;
    return (
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size * 0.62,
          backgroundColor: fragColors[i % fragColors.length],
          opacity: 0.9 * (1 - p),
          transform: `translate(-50%, -50%) rotate(${rot}deg) skewX(-12deg)`,
        }}
      />
    );
  });

  return <div style={{position: "absolute", inset: 0, overflow: "hidden"}}>{fragments}</div>;
};
