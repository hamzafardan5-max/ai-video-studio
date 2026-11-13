import React from "react";
import {useCurrentFrame} from "remotion";
import {COLORS, FONT_STACK} from "../theme";
import {anim, seeded} from "../lib/anim";

type Marker = {x: number; y: number}; // 0..1 relative

// Abstract top-down city: rectangular building blocks on a street grid.
// Buildings near the marker are bright; distant ones are dim.
export const CityGrid: React.FC<{
  readonly width: number;
  readonly height: number;
  readonly cols?: number;
  readonly rows?: number;
  readonly marker: Marker;
  readonly activeRadius: number; // relative to width
  readonly assemble: number; // 0..1 grid build-in
  readonly showMarker?: boolean;
  readonly showActiveArea?: boolean;
  readonly markerOpacity?: number;
}> = ({
  width,
  height,
  cols = 6,
  rows = 7,
  marker,
  activeRadius,
  assemble,
  showMarker = false,
  showActiveArea = false,
  markerOpacity = 1,
}) => {
  const frame = useCurrentFrame();
  const cellW = width / cols;
  const cellH = height / rows;

  const buildings: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const w = cellW * (0.5 + seeded(i, 1) * 0.32);
      const h = cellH * (0.5 + seeded(i, 2) * 0.32);
      const x = c * cellW + (cellW - w) / 2 + (seeded(i, 3) - 0.5) * 6;
      const y = r * cellH + (cellH - h) / 2 + (seeded(i, 4) - 0.5) * 6;

      const cx = x + w / 2;
      const cy = y + h / 2;
      const dist = Math.hypot(cx - marker.x * width, cy - marker.y * height) / width;
      const brightness = Math.max(0, 1 - dist / activeRadius);
      const appear = anim(assemble * (rows * cols), [i * 0.7, i * 0.7 + 10], [0, 1]);
      const fill = `rgba(23, 28, 39, ${0.9})`;
      const fillBright = `rgba(72, 200, 232, ${0.08 + brightness * 0.22})`;
      const opacity = (0.38 + brightness * 0.62) * appear;
      const stroke =
        brightness > 0.55 ? COLORS.cyan : brightness > 0.2 ? "#5A677D" : COLORS.border;
      const strokeWidth = 1.5 + brightness * 1.5;

      buildings.push(
        <g key={i} opacity={opacity}>
          <rect
            x={x}
            y={y}
            width={w}
            height={h}
            rx={4}
            fill={brightness > 0.55 ? fillBright : fill}
            stroke={stroke}
            strokeWidth={strokeWidth}
          />
          {brightness > 0.35 ? (
            <line
              x1={x + 8}
              y1={y + h / 2}
              x2={x + w - 8}
              y2={y + h / 2}
              stroke={COLORS.cyan}
              strokeWidth={1.2}
              opacity={brightness * 0.5}
            />
          ) : null}
        </g>,
      );
    }
  }

  const markerPulse = (Math.sin(frame / 9) + 1) / 2;
  const mx = marker.x * width;
  const my = marker.y * height;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {buildings}
      {showActiveArea ? (
        <g opacity={markerOpacity}>
          <circle
            cx={mx}
            cy={my}
            r={activeRadius * width}
            fill={COLORS.cyan}
            opacity={0.08}
          />
          <circle
            cx={mx}
            cy={my}
            r={activeRadius * width}
            fill="none"
            stroke={COLORS.cyan}
            strokeWidth={2}
            strokeDasharray="6 10"
            opacity={0.7}
          />
        </g>
      ) : null}
      {showMarker ? (
        <g opacity={markerOpacity}>
          <circle cx={mx} cy={my} r={26 + markerPulse * 10} fill={COLORS.yellow} opacity={0.18} />
          <circle cx={mx} cy={my} r={13} fill={COLORS.yellow} />
          <circle cx={mx} cy={my} r={20} fill="none" stroke={COLORS.yellow} strokeWidth={2} opacity={0.6} />
        </g>
      ) : null}
    </svg>
  );
};

// Pseudo-3D city seen from an elevated angle: far rows are small, dim and
// simplified; near rows are large, bright and detailed. Used for the finale.
export const DepthCityGrid: React.FC<{
  readonly width: number;
  readonly height: number;
  readonly rows?: number;
  readonly cols?: number;
  readonly assemble: number; // 0..1
}> = ({width, height, rows = 6, cols = 7, assemble}) => {
  const buildings: React.ReactNode[] = [];
  const rowGap = height / (rows + 0.6);

  for (let r = 0; r < rows; r++) {
    const depth = r / (rows - 1); // 0 = far, 1 = near
    const scale = 0.42 + depth * 0.75;
    const detail = 0.12 + depth * 0.88;
    const opacity = 0.28 + depth * 0.72;
    const rowY = height - rowGap * (rows - r - 0.2);
    const rowH = rowGap * 0.9 * scale;
    const baseW = (width / cols) * 0.62 * scale;

    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const w = baseW * (0.75 + seeded(i, 5) * 0.5);
      const towerH = rowH * (0.5 + seeded(i, 6) * 0.9);
      const x = (c + 0.5) * (width / cols) - w / 2 + (seeded(i, 7) - 0.5) * 10;
      const appear = anim(assemble * (rows * cols), [i * 0.55, i * 0.55 + 10], [0, 1]);
      const tint = depth > 0.6 ? COLORS.yellow : COLORS.cyan;

      // Tower silhouette
      buildings.push(
        <g key={i} opacity={opacity * appear}>
          <rect
            x={x}
            y={rowY - towerH}
            width={w}
            height={towerH}
            rx={3}
            fill={COLORS.panel}
            stroke={depth > 0.45 ? tint : COLORS.border}
            strokeWidth={1.4 + depth * 1.2}
          />
          {/* Windows: count follows the level-of-detail concept */}
          {Array.from({length: Math.round(detail * 5)}).map((_, wr) =>
            Array.from({length: Math.round(detail * 3)}).map((__, wc) => (
              <rect
                key={`${wr}-${wc}`}
                x={x + 6 + wc * ((w - 12) / Math.max(1, Math.round(detail * 3)))}
                y={rowY - towerH + 8 + wr * ((towerH - 14) / Math.max(1, Math.round(detail * 5)))}
                width={Math.max(2.5, w * 0.13)}
                height={Math.max(2.5, towerH * 0.07)}
                fill={tint}
                opacity={0.25 + depth * 0.45}
              />
            )),
          )}
        </g>,
      );
    }
  }

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {buildings}
    </svg>
  );
};

export const CityGridLabel: React.FC<{
  readonly text: string;
  readonly accent: string;
  readonly x: number;
  readonly y: number;
  readonly opacity?: number;
}> = ({text, accent, x, y, opacity = 1}) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      opacity,
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}
  >
    <div style={{width: 10, height: 10, borderRadius: 2, backgroundColor: accent}} />
    <span
      style={{
        fontFamily: FONT_STACK,
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: "0.2em",
        color: COLORS.textSecondary,
      }}
    >
      {text}
    </span>
  </div>
);
