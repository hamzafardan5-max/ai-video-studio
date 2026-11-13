import {Easing, interpolate} from "remotion";

// Shorthand for a clamped, eased interpolation.
export const anim = (
  frame: number,
  range: readonly [number, number],
  output: readonly [number, number],
  easing: (t: number) => number = Easing.out(Easing.cubic),
): number => {
  return interpolate(frame, range, output, {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
};

export const easeOutExpo = Easing.out(Easing.exp);
export const easeInOutCubic = Easing.inOut(Easing.cubic);
export const easeOutQuart = Easing.out(Easing.poly(4));

// Point on a quadratic bezier curve.
export const bezierPoint = (
  t: number,
  p0: {x: number; y: number},
  p1: {x: number; y: number},
  p2: {x: number; y: number},
): {x: number; y: number} => {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
};

// Deterministic pseudo-random value in [0, 1) from integer seed(s).
export const seeded = (a: number, b = 0): number => {
  const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const formatNumber = (n: number): string =>
  n.toLocaleString("en-US", {maximumFractionDigits: 0});
