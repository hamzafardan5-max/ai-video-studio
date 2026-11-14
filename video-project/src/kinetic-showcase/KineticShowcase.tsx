import React from "react";
import {AbsoluteFill, Sequence, useCurrentFrame, interpolate} from "remotion";
import {Scene1GridIntro} from "./Scene1GridIntro";
import {Scene2DataViz} from "./Scene2DataViz";
import {Scene3Carousel} from "./Scene3Carousel";
import {Scene4Outro} from "./Scene4Outro";
import {KINETIC_COLORS as C, KINETIC_SCENES, KINETIC_TOTAL_FRAMES} from "./theme";

// Global scanline + vignette pass to unify all four scenes.
const FilmicOverlay: React.FC = () => (
  <AbsoluteFill
    style={{
      pointerEvents: "none",
      backgroundImage:
        "repeating-linear-gradient(to bottom, rgba(0,0,0,0.16) 0px, rgba(0,0,0,0.16) 2px, transparent 2px, transparent 5px)",
      maskImage:
        "radial-gradient(120% 110% at 50% 50%, transparent 55%, black 100%)",
      WebkitMaskImage:
        "radial-gradient(120% 110% at 50% 50%, transparent 55%, black 100%)",
      opacity: 0.5,
    }}
  />
);

// Bottom progress bar: fills across the full 900-frame timeline.
const TimelineIndicator: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, KINETIC_TOTAL_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${C.cyan}, ${C.violet}, ${C.magenta})`,
          boxShadow: `0 0 14px rgba(0,240,255,0.7)`,
        }}
      />
    </div>
  );
};

export const KineticShowcase: React.FC = () => {
  return (
    <AbsoluteFill style={{backgroundColor: C.bg, overflow: "hidden"}}>
      <Sequence
        from={KINETIC_SCENES.intro.from}
        durationInFrames={KINETIC_SCENES.intro.durationInFrames}
      >
        <Scene1GridIntro />
      </Sequence>
      <Sequence
        from={KINETIC_SCENES.dataviz.from}
        durationInFrames={KINETIC_SCENES.dataviz.durationInFrames}
      >
        <Scene2DataViz />
      </Sequence>
      <Sequence
        from={KINETIC_SCENES.carousel.from}
        durationInFrames={KINETIC_SCENES.carousel.durationInFrames}
      >
        <Scene3Carousel />
      </Sequence>
      <Sequence
        from={KINETIC_SCENES.outro.from}
        durationInFrames={KINETIC_SCENES.outro.durationInFrames}
      >
        <Scene4Outro />
      </Sequence>

      <FilmicOverlay />
      <TimelineIndicator />
    </AbsoluteFill>
  );
};
