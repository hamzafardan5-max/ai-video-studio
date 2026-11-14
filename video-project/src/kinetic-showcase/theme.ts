// Isolated design tokens for the KineticShowcase composition.
// Nothing here is shared with the rest of the project on purpose.

export const KINETIC_COLORS = {
  bg: "#04050c",
  bgLift: "#0a0d1d",
  cyan: "#00f0ff",
  magenta: "#ff2bd6",
  violet: "#7b61ff",
  lime: "#b8ff2e",
  amber: "#ffb02e",
  white: "#f4f8ff",
  dim: "rgba(178, 198, 255, 0.6)",
  hairline: "rgba(140, 170, 255, 0.16)",
} as const;

export const KINETIC_FONT_SIZES = {
  mega: 168,
  h1: 96,
  h2: 64,
  label: 30,
  micro: 24,
} as const;

// Timeline: 900 frames @ 30fps = 30s, 1080x1920 vertical.
export const KINETIC_TOTAL_FRAMES = 900;

export const KINETIC_SCENES = {
  intro: {from: 0, durationInFrames: 250},
  dataviz: {from: 250, durationInFrames: 220},
  carousel: {from: 470, durationInFrames: 230},
  outro: {from: 700, durationInFrames: 200},
} as const;

// Deterministic 0..1 noise so renders are frame-stable.
export const kineticHash = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const kineticGlass = {
  background:
    "linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.03))",
  border: "1px solid rgba(255,255,255,0.14)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  boxShadow:
    "0 30px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.18)",
  borderRadius: 28,
} as const;
