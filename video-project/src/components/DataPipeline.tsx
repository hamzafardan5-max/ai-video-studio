import React from "react";
import {useCurrentFrame} from "remotion";
import {bezierPoint, seeded} from "../lib/anim";

type Point = {x: number; y: number};

// Animated data transfer between two points: a bezier path with a moving
// highlight plus travelling data packets. `drawProgress` (0..1) reveals the
// path; `flowProgress` (0..1) loops the packets along it.
export const DataPipeline: React.FC<{
  readonly from: Point;
  readonly to: Point;
  readonly color: string;
  readonly drawProgress: number;
  readonly flowProgress: number;
  readonly width: number;
  readonly opacity?: number;
  readonly curve?: number;
  readonly packets?: number;
}> = ({from, to, color, drawProgress, flowProgress, width, opacity = 1, curve = 0.25, packets = 3}) => {
  const frame = useCurrentFrame();
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const mid = {x: from.x + dx * 0.5, y: from.y + dy * 0.5};
  const nx = -dy;
  const ny = dx;
  const len = Math.hypot(nx, ny) || 1;
  const control = {
    x: mid.x + (nx / len) * Math.hypot(dx, dy) * curve,
    y: mid.y + (ny / len) * Math.hypot(dx, dy) * curve,
  };

  // Sample the bezier up to the draw progress to emulate stroke reveal.
  const samples: string[] = [];
  const steps = 36;
  for (let s = 0; s <= steps; s++) {
    const t = (s / steps) * drawProgress;
    const p = bezierPoint(t, from, control, to);
    samples.push(`${s === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  }

  const packetNodes: React.ReactNode[] = [];
  for (let p = 0; p < packets; p++) {
    const t = (flowProgress * 1.4 - p / packets) % 1;
    const shown = drawProgress > 0.85 && t > 0 && t < 1;
    if (!shown) continue;
    const pt = bezierPoint(Math.max(0, Math.min(1, t)), from, control, to);
    packetNodes.push(
      <circle
        key={p}
        cx={pt.x}
        cy={pt.y}
        r={6}
        fill={color}
        opacity={0.9 * (1 - Math.abs(t - 0.5) * 1.2)}
      />,
    );
  }

  const dashPulse = (frame % 40) / 40;

  return (
    <svg
      width={width}
      height={0}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        overflow: "visible",
        pointerEvents: "none",
        opacity,
      }}
    >
      <path
        d={samples.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray="10 12"
        strokeDashoffset={-dashPulse * 22}
        opacity={0.55}
      />
      {packetNodes}
    </svg>
  );
};

// Convenience helper for computing a point along the pipeline, so cards can
// travel the same curve as the drawn path.
export const pipelinePoint = (
  from: Point,
  to: Point,
  t: number,
  curve = 0.25,
): Point => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const mid = {x: from.x + dx * 0.5, y: from.y + dy * 0.5};
  const nx = -dy;
  const ny = dx;
  const len = Math.hypot(nx, ny) || 1;
  const control = {
    x: mid.x + (nx / len) * Math.hypot(dx, dy) * curve,
    y: mid.y + (ny / len) * Math.hypot(dx, dy) * curve,
  };
  return bezierPoint(Math.max(0, Math.min(1, t)), from, control, to);
};

export const randomJitter = seeded;
