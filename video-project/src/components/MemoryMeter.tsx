import React from "react";
import {useCurrentFrame} from "remotion";
import {COLORS, FONT_STACK} from "../theme";
import {anim, seeded} from "../lib/anim";

type Segment = {
  readonly label: string;
  readonly squares: number;
  readonly color: string;
};

// Memory capacity representation: small squares fill the meter.
// When `scatterStart` is reached the squares break apart (scene transition).
export const MemoryMeter: React.FC<{
  readonly segments: readonly Segment[];
  readonly fillStart: number;
  readonly fillEnd: number;
  readonly scatterStart?: number;
  readonly squaresPerRow?: number;
  readonly width: number;
  readonly delay?: number;
}> = ({segments, fillStart, fillEnd, scatterStart, squaresPerRow = 16, width, delay = 0}) => {
  const frame = useCurrentFrame();
  const total = segments.reduce((sum, s) => sum + s.squares, 0);
  const rows = Math.ceil(total / squaresPerRow);
  const gap = 5;
  const cell = (width - gap * (squaresPerRow - 1) - 8) / squaresPerRow;
  const height = rows * cell + (rows - 1) * gap + 8;
  const frameNow = frame;

  const squares: React.ReactNode[] = [];
  let index = 0;
  segments.forEach((segment, segIndex) => {
    for (let s = 0; s < segment.squares; s++) {
      const i = index;
      const appear = anim(
        frameNow,
        [fillStart + (i / total) * (fillEnd - fillStart), fillStart + (i / total) * (fillEnd - fillStart) + 7],
        [0, 1],
      );
      const scatterP = scatterStart
        ? anim(frameNow, [scatterStart + (i % 8) * 1.5, scatterStart + 26 + (i % 8) * 1.5], [0, 1])
        : 0;
      const col = i % squaresPerRow;
      const row = Math.floor(i / squaresPerRow);
      const angle = seeded(i, segIndex) * Math.PI * 2;
      const dist = 90 + seeded(i, segIndex + 7) * 150;
      const x = 4 + col * (cell + gap);
      const y = 4 + row * (cell + gap);

      squares.push(
        <div
          key={i}
          style={{
            position: "absolute",
            left: x,
            top: y,
            width: cell,
            height: cell,
            borderRadius: cell * 0.18,
            backgroundColor: segment.color,
            opacity: appear * (1 - scatterP),
            transform: `scale(${0.5 + 0.5 * appear}) translate(${
              Math.cos(angle) * dist * scatterP * scatterP
            }px, ${Math.sin(angle) * dist * scatterP * scatterP}px) rotate(${scatterP * 40}deg)`,
          }}
        />,
      );
      index++;
    }
  });

  // Segment labels under the meter, aligned to each segment span.
  let offset = 0;
  const labels = segments.map((segment, si) => {
    const left = (offset / total) * 100;
    const span = (segment.squares / total) * 100;
    offset += segment.squares;
    const labelAppear = anim(frameNow, [fillEnd - 20 + si * 8, fillEnd - 8 + si * 8], [0, 1]);
    return (
      <div
        key={si}
        style={{
          position: "absolute",
          left: `${left}%`,
          width: `${span}%`,
          top: 0,
          textAlign: "center",
          opacity: labelAppear,
        }}
      >
        <span
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 600,
            fontSize: 22,
            letterSpacing: "0.14em",
            color: segment.color,
          }}
        >
          {segment.label}
        </span>
      </div>
    );
  });

  const containerIn = anim(frameNow, [delay, delay + 14], [0, 1]);
  const containerOut = scatterStart ? 1 - anim(frameNow, [scatterStart, scatterStart + 20], [0, 1]) : 1;

  return (
    <div style={{width, opacity: containerIn * containerOut}}>
      <div
        style={{
          position: "relative",
          width,
          height,
          borderRadius: 14,
          border: `1.5px solid ${COLORS.border}`,
          backgroundColor: COLORS.panel,
          overflow: "hidden",
        }}
      >
        {squares}
      </div>
      <div style={{position: "relative", width, height: 34, marginTop: 12}}>{labels}</div>
    </div>
  );
};
