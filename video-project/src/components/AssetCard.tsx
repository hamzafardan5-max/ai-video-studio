import React from "react";
import {COLORS, FONT_STACK} from "../theme";

// Reusable asset category card: rounded rectangle + SVG icon + label.
export const AssetCard: React.FC<{
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly accent: string;
  readonly width?: number;
  readonly height?: number;
  readonly style?: React.CSSProperties;
  readonly opacity?: number;
  readonly sublabel?: string;
  readonly dim?: boolean;
}> = ({label, icon, accent, width = 300, height = 100, style, opacity = 1, sublabel, dim = false}) => {
  return (
    <div
      style={{
        position: "absolute",
        display: "flex",
        alignItems: "center",
        gap: 20,
        padding: "0 26px",
        width,
        height,
        borderRadius: 18,
        border: `1.5px solid ${dim ? COLORS.border : accent}`,
        backgroundColor: COLORS.panel,
        boxShadow: dim ? "none" : `0 0 40px ${accent}22`,
        opacity,
        ...style,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{display: "flex", flexDirection: "column", gap: 4}}>
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "0.08em",
            color: dim ? COLORS.textSecondary : COLORS.text,
            lineHeight: 1.1,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </span>
        {sublabel ? (
          <span
            style={{
              fontFamily: FONT_STACK,
              fontWeight: 600,
              fontSize: 22,
              letterSpacing: "0.18em",
              color: accent,
              lineHeight: 1.1,
            }}
          >
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  );
};

// --- SVG icons, drawn procedurally -------------------------------------------

export const BuildingIcon: React.FC<{readonly color: string}> = ({color}) => (
  <svg width="46" height="46" viewBox="0 0 46 46">
    <polygon points="12,42 12,12 23,6 23,42" fill="none" stroke={color} strokeWidth="2.5" />
    <polygon points="23,42 23,6 34,12 34,42" fill={color} opacity="0.25" stroke={color} strokeWidth="2.5" />
    <line x1="16" y1="16" x2="19" y2="14" stroke={color} strokeWidth="2" />
    <line x1="16" y1="24" x2="19" y2="22" stroke={color} strokeWidth="2" />
    <line x1="16" y1="32" x2="19" y2="30" stroke={color} strokeWidth="2" />
    <line x1="27" y1="16" x2="30" y2="18" stroke={color} strokeWidth="2" />
    <line x1="27" y1="24" x2="30" y2="26" stroke={color} strokeWidth="2" />
    <line x1="27" y1="32" x2="30" y2="34" stroke={color} strokeWidth="2" />
  </svg>
);

export const VehicleIcon: React.FC<{readonly color: string}> = ({color}) => (
  <svg width="46" height="46" viewBox="0 0 46 46">
    <polygon points="8,30 12,18 34,18 38,30" fill={color} opacity="0.25" stroke={color} strokeWidth="2.5" />
    <line x1="6" y1="30" x2="40" y2="30" stroke={color} strokeWidth="2.5" />
    <circle cx="14" cy="34" r="4" fill="none" stroke={color} strokeWidth="2.5" />
    <circle cx="32" cy="34" r="4" fill="none" stroke={color} strokeWidth="2.5" />
    <polygon points="15,24 20,20 26,20 31,24" fill="none" stroke={color} strokeWidth="2" />
  </svg>
);

export const TextureIcon: React.FC<{readonly color: string}> = ({color}) => (
  <svg width="46" height="46" viewBox="0 0 46 46">
    <rect x="8" y="8" width="30" height="30" rx="4" fill="none" stroke={color} strokeWidth="2.5" />
    <circle cx="17" cy="17" r="3.5" fill={color} opacity="0.5" />
    <polygon points="10,36 20,24 27,32 32,27 38,36" fill={color} opacity="0.25" stroke={color} strokeWidth="2" />
  </svg>
);

export const ObjectIcon: React.FC<{readonly color: string}> = ({color}) => (
  <svg width="46" height="46" viewBox="0 0 46 46">
    <polygon points="23,6 38,14 38,32 23,40 8,32 8,14" fill={color} opacity="0.25" stroke={color} strokeWidth="2.5" />
    <line x1="23" y1="6" x2="23" y2="40" stroke={color} strokeWidth="2" />
    <line x1="8" y1="14" x2="38" y2="14" stroke={color} strokeWidth="1.5" />
    <line x1="8" y1="32" x2="38" y2="32" stroke={color} strokeWidth="1.5" />
  </svg>
);

export const DatabaseIcon: React.FC<{readonly color: string}> = ({color}) => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <ellipse cx="24" cy="11" rx="14" ry="5.5" fill={color} opacity="0.25" stroke={color} strokeWidth="2.5" />
    <path d="M10 11 v26 c0 3 6.3 5.5 14 5.5 s14 -2.5 14 -5.5 v-26" fill="none" stroke={color} strokeWidth="2.5" />
    <path d="M10 24 c0 3 6.3 5.5 14 5.5 s14 -2.5 14 -5.5" fill="none" stroke={color} strokeWidth="2.5" />
  </svg>
);

export const LayersIcon: React.FC<{readonly color: string}> = ({color}) => (
  <svg width="48" height="48" viewBox="0 0 48 48">
    <polygon points="24,6 42,15 24,24 6,15" fill={color} opacity="0.25" stroke={color} strokeWidth="2.5" />
    <polygon points="6,24 24,33 42,24" fill="none" stroke={color} strokeWidth="2.5" />
    <polygon points="6,33 24,42 42,33" fill="none" stroke={color} strokeWidth="2.5" />
  </svg>
);
