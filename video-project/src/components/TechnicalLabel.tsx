import React from "react";
import {useCurrentFrame} from "remotion";
import {COLORS, FONT_STACK} from "../theme";
import {anim} from "../lib/anim";

// Consistent small uppercase technical annotation.
export const TechnicalLabel: React.FC<{
  readonly text?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly delay?: number;
  readonly accent?: string;
  readonly color?: string;
  readonly size?: number;
  readonly slide?: number;
  readonly style?: React.CSSProperties;
}> = ({text, children, delay = 0, accent, color = COLORS.textSecondary, size = 26, slide = 18, style}) => {
  const frame = useCurrentFrame();
  const progress = anim(frame, [delay, delay + 14], [0, 1]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        opacity: progress,
        transform: `translateY(${(1 - progress) * slide}px)`,
        ...style,
      }}
    >
      {accent ? (
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            backgroundColor: accent,
            flexShrink: 0,
          }}
        />
      ) : null}
      <span
        style={{
          fontFamily: FONT_STACK,
          fontWeight: 600,
          fontSize: size,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color,
          lineHeight: 1.2,
        }}
      >
        {text ?? children}
      </span>
    </div>
  );
};
