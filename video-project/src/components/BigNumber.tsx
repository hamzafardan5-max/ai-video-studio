import React from "react";
import {useCurrentFrame} from "remotion";
import {COLORS, FONT_STACK} from "../theme";
import {anim, easeOutExpo} from "../lib/anim";

// Animated large numerical typography for key figures.
export const BigNumber: React.FC<{
  readonly value: string;
  readonly unit?: string;
  readonly delay?: number;
  readonly fontSize?: number;
  readonly color?: string;
  readonly align?: "left" | "center";
  readonly style?: React.CSSProperties;
}> = ({value, unit, delay = 0, fontSize = 250, color = COLORS.text, align = "center", style}) => {
  const frame = useCurrentFrame();
  const progress = anim(frame, [delay, delay + 20], [0, 1], easeOutExpo);
  const counter = anim(frame, [delay, delay + 16], [0.965, 1], easeOutExpo);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: unit ? fontSize * 0.14 : 0,
        opacity: progress,
        transform: `scale(${counter})`,
        transformOrigin: "center",
        ...style,
      }}
    >
      <span
        style={{
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
      {unit ? (
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 700,
            fontSize: fontSize * 0.34,
            lineHeight: 1,
            letterSpacing: "0.06em",
            color: COLORS.textSecondary,
          }}
        >
          {unit}
        </span>
      ) : null}
    </div>
  );
};
