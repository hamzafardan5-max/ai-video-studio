import React from "react";
import {useCurrentFrame, useVideoConfig} from "remotion";
import {COLORS, FONT_STACK, SAFE} from "../theme";
import {anim, easeOutQuart} from "../lib/anim";
import {LODComparison, LODFragments} from "../components/LODComparison";
import {TechnicalLabel} from "../components/TechnicalLabel";
import {SceneTransition} from "../components/SceneTransition";

// Scene 3 — Level of Detail (25.4–39.2s).
// The camera keeps zooming in from scene 2, then the comparison assembles:
// HIGH DETAIL and LOW DETAIL reference models, a morphing building driven by
// a NEAR/FAR slider, a decreasing polygon counter and a GPU-work bar.
// At the end the simplified model breaks into fragments that fly toward the
// sides, where the two cards of scene 4 will enter.
export const Scene3LOD: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();

  // Camera settles after the zoom from scene 2.
  const settle = anim(frame, [0, 22], [1.8, 1], easeOutQuart);

  const blockIn = anim(frame, [6, 24], [0, 1]);
  const sliderIn = anim(frame, [112, 128], [0, 1]);
  const progress = anim(frame, [128, 318], [0, 1]);

  return (
    <SceneTransition durationInFrames={durationInFrames} fadeIn={10}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: COLORS.background,
          fontFamily: FONT_STACK,
          overflow: "hidden",
        }}
      >
        <TechnicalLabel text="Level of detail · LOD" delay={12} accent={COLORS.yellow} size={30} style={{position: "absolute", left: SAFE.x, top: 200}} />

        {/* Subtle continuous camera drift */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateY(${Math.sin(frame / 90) * 9}px) scale(${1 + 0.01 * Math.sin(frame / 130)})`,
          }}
        >

        <div
          style={{
            position: "absolute",
            left: SAFE.x,
            top: 300,
            width: SAFE.w,
            transform: `scale(${settle})`,
            transformOrigin: "50% 30%",
          }}
        >
          <div style={{opacity: blockIn}}>
            <LODComparison progress={progress} width={SAFE.w} sliderOpacity={sliderIn} />
          </div>
        </div>

        {/* Transition: the simplified model breaks into geometric shapes */}
        <LODFragments startFrame={390} width={1080} />
        </div>
      </div>
    </SceneTransition>
  );
};
