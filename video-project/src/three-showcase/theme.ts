// Isolated design tokens for the ThreeShowcase composition (cyberpunk data-core).
// Nothing here is shared with the rest of the project on purpose.

export const CORE_COLORS = {
  bg: "#030409",
  cyan: "#00f0ff",
  magenta: "#ff2bd6",
  violet: "#7b61ff",
  amber: "#ffb02e",
  white: "#eef4ff",
  dim: "rgba(168, 190, 255, 0.55)",
  hairline: "rgba(140, 170, 255, 0.18)",
  // glass tints (used as material colors)
  cyanGlass: "#0a3a44",
  magentaGlass: "#3d0a33",
  violetGlass: "#171040",
} as const;

// Timeline: 900 frames @ 30fps = 30s, 1080x1920 vertical.
export const CORE_FRAMES = 900;
export const CORE_FPS = 30;

// Deterministic 0..1 hash so every frame renders identically.
export const hash01 = (n: number): number => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const coreFont = 'Inter, "Helvetica Neue", sans-serif';
