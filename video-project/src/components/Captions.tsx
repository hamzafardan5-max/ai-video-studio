import React from "react";
import {useCurrentFrame} from "remotion";
import {COLORS, FONT_STACK} from "../theme";
import {CAPTION_GROUPS} from "../captions";
import {anim, easeOutQuart} from "../lib/anim";

const KEYWORDS =
  /^(512|MB|PS3|XBOX|360|STREAMING|LOD|GPU|MEMORY|ROCKSTAR|CITY|WORLD)[.,]??$/i;

// Voiceover captions: 2-3 word chunks synced to the narration, popping in
// near the bottom of the frame. Key terms are highlighted.
export const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const group = CAPTION_GROUPS.find((g) => frame >= g.start && frame < g.end);
  if (!group) return null;

  const inP = anim(frame, [group.start, group.start + 5], [0, 1], easeOutQuart);
  const outP = anim(frame, [group.end - 4, group.end], [1, 0]);
  const pop = anim(frame, [group.start, group.start + 6], [0.85, 1], easeOutQuart);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        key={group.text}
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "14px 34px",
          borderRadius: 18,
          backgroundColor: "rgba(11, 13, 18, 0.72)",
          border: `1.5px solid ${COLORS.border}`,
          opacity: inP * outP,
          transform: `scale(${pop}) translateY(${(1 - inP) * 14}px)`,
        }}
      >
        {group.text.split(" ").map((word, i) => {
          const highlight = KEYWORDS.test(word);
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT_STACK,
                fontWeight: 800,
                fontSize: 46,
                lineHeight: 1.15,
                letterSpacing: "0.02em",
                color: highlight ? COLORS.yellow : COLORS.text,
                whiteSpace: "pre",
              }}
            >
              {word}
              {i < group.text.split(" ").length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
