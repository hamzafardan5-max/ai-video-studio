// Shared design tokens for the GTA optimization explainer.
export const COLORS = {
  background: "#0B0D12",
  text: "#F5F5F5",
  textSecondary: "#8992A3",
  yellow: "#F2C94C",
  cyan: "#48C8E8",
  panel: "#171C27",
  border: "#303747",
} as const;

export const FONT_STACK =
  '"Inter", "Geist", -apple-system, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

// Composition timeline (frames @ 30 FPS). Audio is 53.08s; total = 54s.
// Scene durations include a 12-frame overlap consumed by the transition
// between scenes, so scene start frames stay locked to the narration.
export const TRANSITION_FRAMES = 12;
export const SCENE1_START = 0;
export const SCENE1_DURATION = 360 + TRANSITION_FRAMES; // 0.0s – 12.0s
export const SCENE2_START = 360;
export const SCENE2_DURATION = 402 + TRANSITION_FRAMES; // 12.0s – 25.4s
export const SCENE3_START = 762;
export const SCENE3_DURATION = 414 + TRANSITION_FRAMES; // 25.4s – 39.2s
export const SCENE4_START = 1176;
export const SCENE4_DURATION = 444; // 39.2s – 54.0s

// 80% safe area: all primary content stays inside these margins
// (10% of 1080×1920 on every side).
export const SAFE = {x: 108, y: 192, w: 864, h: 1344} as const;
export const TOTAL_DURATION =
  SCENE4_START + SCENE4_DURATION; // 1620 frames (54s, under the 55s limit)

export const FADE_FRAMES = 12;
