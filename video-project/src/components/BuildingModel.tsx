import React from "react";
import {COLORS, FONT_STACK} from "../theme";

// Procedural SVG building. `detail` (0..1) morphs the same silhouette between
// a high-detail model (many window polygons, roof equipment) and a simplified
// low-poly version (few merged bands, no roof equipment).
export const BuildingModel: React.FC<{
  readonly width: number;
  readonly detail: number; // 0..1
  readonly accent?: string;
  readonly opacity?: number;
  readonly outlineColor?: string;
  readonly draw?: number; // 0..1 outline draw-on animation
}> = ({width, detail, accent = COLORS.cyan, opacity = 1, outlineColor = COLORS.text, draw = 1}) => {
  const h = width * 1.3;
  const clamped = Math.max(0, Math.min(1, detail));

  // Facade outline (same for every detail level).
  const silhouette = "46,260 46,62 66,42 134,42 154,62 154,260";

  const cols = 5;
  const rows = 7;
  const maxWindows = cols * rows;
  const visibleWindows = Math.round(maxWindows * clamped);

  const windows: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const on = i < visibleWindows;
      const fade = on ? 1 : 0;
      const wx = 56 + c * 18;
      const wy = 56 + r * 26;
      windows.push(
        <rect
          key={`w${i}`}
          x={wx}
          y={wy}
          width={12}
          height={18}
          fill={accent}
          opacity={fade * 0.55}
          stroke={accent}
          strokeWidth={1}
        />,
      );
    }
  }

  // Simplified model: two merged polygon bands.
  const bandsOpacity = 1 - Math.min(1, clamped / 0.35);
  const roofDetailOpacity = Math.max(0, Math.min(1, (clamped - 0.55) / 0.45));

  return (
    <svg
      width={width}
      height={h}
      viewBox="0 0 200 260"
      style={{opacity, overflow: "visible"}}
    >
      {/* ground line */}
      <line x1="20" y1="260" x2="180" y2="260" stroke={COLORS.border} strokeWidth="2" />
      {/* main facade */}
      <polygon
        points={silhouette}
        fill={COLORS.panel}
        stroke={outlineColor}
        strokeWidth="2"
        pathLength={1}
        strokeDasharray={draw < 1 ? 1 : undefined}
        strokeDashoffset={draw < 1 ? 1 - draw : undefined}
      />
      {/* interior edge lines (architectural detail) */}
      <line x1="46" y1="62" x2="154" y2="62" stroke={outlineColor} strokeWidth="1.2" opacity={0.35 + clamped * 0.4} />
      <line x1="66" y1="42" x2="66" y2="260" stroke={outlineColor} strokeWidth="1" opacity={clamped * 0.5} />
      <line x1="134" y1="42" x2="134" y2="260" stroke={outlineColor} strokeWidth="1" opacity={clamped * 0.5} />
      {/* windows */}
      {windows}
      {/* simplified merged bands */}
      <g opacity={bandsOpacity}>
        <rect x="56" y="80" width="88" height="34" fill={accent} opacity="0.35" stroke={accent} strokeWidth="1" />
        <rect x="56" y="180" width="88" height="34" fill={accent} opacity="0.35" stroke={accent} strokeWidth="1" />
      </g>
      {/* roof equipment, only on the detailed model */}
      <g opacity={roofDetailOpacity}>
        <line x1="100" y1="42" x2="100" y2="18" stroke={outlineColor} strokeWidth="2.5" />
        <circle cx="100" cy="15" r="3.5" fill={accent} />
        <rect x="72" y="30" width="16" height="10" fill="none" stroke={outlineColor} strokeWidth="1.5" />
        <rect x="112" y="30" width="16" height="10" fill="none" stroke={outlineColor} strokeWidth="1.5" />
        <line x1="46" y1="52" x2="154" y2="52" stroke={outlineColor} strokeWidth="1" opacity="0.6" />
      </g>
      {/* door */}
      <rect x="88" y="236" width="24" height="24" fill={accent} opacity="0.4" stroke={accent} strokeWidth="1" />
    </svg>
  );
};

export const BuildingLabel: React.FC<{
  readonly text: string;
  readonly accent: string;
  readonly opacity?: number;
}> = ({text, accent, opacity = 1}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      opacity,
    }}
  >
    <div style={{width: 26, height: 3, backgroundColor: accent, borderRadius: 2}} />
    <span
      style={{
        fontFamily: FONT_STACK,
        fontWeight: 700,
        fontSize: 28,
        letterSpacing: "0.18em",
        color: COLORS.text,
      }}
    >
      {text}
    </span>
  </div>
);
